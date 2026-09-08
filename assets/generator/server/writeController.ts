import { access, mkdir, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import {
  controllerActions,
  editableProperties,
  equalsIgnoreCase,
  hasDeletedOnColumn,
  isAuditColumn,
  normalizeControllerIdentifier,
  singlePrimaryKey,
  tableKind,
  tableSingularName,
  type EditableProperty,
} from '../shared/conventions.ts'
import type {
  ColumnMapping,
  SolutionLoadResult,
  TableMapping,
} from '../shared/types.ts'
import { camelName } from './csharpTypes.ts'
import { findGeneratableTable } from './generateTable.ts'
import { loadSolution } from './loadSolution.ts'
import { webApiFolders } from './projectPaths.ts'
import { collapseExcessBlankLines } from './sourceFormat.ts'

export type WriteControllerOptions = {
  controllerName?: string
  properties?: string[]
  methods?: string[]
  overwrite?: boolean
}

export async function writeController(
  solutionPath: string,
  tableName: string,
  options: WriteControllerOptions = {},
): Promise<SolutionLoadResult> {
  const loaded = await loadSolution(solutionPath)
  if (!loaded.namespace) {
    return {
      ...loaded,
      error: loaded.error ?? 'Unable to determine the project namespace.',
    }
  }
  if (!loaded.mainProject) {
    return {
      ...loaded,
      error: loaded.error ?? 'Unable to find the WebAPI project.',
    }
  }

  const table = findGeneratableTable(loaded.tables ?? [], tableName)
  if (!table || !table.objectName || !table.serviceName) {
    return {
      ...loaded,
      error: `Table ${tableName} is not a generatable object.`,
    }
  }

  const folders = webApiFolders(loaded)
  if (!folders) {
    return { ...loaded, error: 'Could not determine the WebAPI folders.' }
  }

  const controllerName = normalizeControllerName(
    options.controllerName,
    table,
  )
  if (!controllerName) {
    return {
      ...loaded,
      error:
        'Controller name must be a single identifier, for example WidgetController.',
    }
  }

  const eligible = editableProperties(table)
  const selected = resolveSelectedProperties(eligible, options.properties)
  if (options.properties && selected.length === 0) {
    return {
      ...loaded,
      error:
        'Select at least one non-id property for the add/edit model, or leave the list unset to bind the object directly.',
    }
  }

  const availableActions = controllerActions(table)
  const selectedMethods = resolveSelectedMethods(
    availableActions.map((action) => action.id),
    options.methods,
  )
  if (selectedMethods.length === 0) {
    return {
      ...loaded,
      error: 'Select at least one controller method.',
    }
  }
  const methodSet = new Set(selectedMethods)
  const writesSelected = methodSet.has('Post') || methodSet.has('Patch')
  const modelProperties = writesSelected ? selected : []

  const overwrite = options.overwrite === true
  const controllerPath = path.join(folders.controllersFolder, `${controllerName}.cs`)
  if (!overwrite && (await fileExists(controllerPath))) {
    return {
      ...loaded,
      error: `${controllerName}.cs already exists.`,
    }
  }

  const useModel = modelProperties.length > 0
  const modelName = useModel
    ? `Edit${tableSingularName(table.tableName)}Model`
    : undefined
  if (useModel && modelName) {
    const modelPath = path.join(folders.spaModelsFolder, `${modelName}.cs`)
    if (!overwrite && (await fileExists(modelPath))) {
      return {
        ...loaded,
        error: `${modelName}.cs already exists.`,
      }
    }
    await mkdir(folders.spaModelsFolder, { recursive: true })
    await writeFile(
      modelPath,
      renderEditModel(loaded.namespace, table, modelName, modelProperties),
      'utf8',
    )
  }

  await mkdir(folders.controllersFolder, { recursive: true })
  await writeFile(
    controllerPath,
    renderController(
      loaded.namespace,
      table,
      controllerName,
      modelName,
      methodSet,
    ),
    'utf8',
  )

  return loadSolution(solutionPath)
}

export function normalizeControllerName(
  value: string | undefined,
  table: TableMapping,
): string | undefined {
  return normalizeControllerIdentifier(value, tableSingularName(table.tableName))
}

function resolveSelectedProperties(
  eligible: EditableProperty[],
  requested?: string[],
): EditableProperty[] {
  if (!requested || requested.length === 0) return []
  return eligible.filter((property) =>
    requested.some((name) => equalsIgnoreCase(name, property.name)),
  )
}

function resolveSelectedMethods(
  available: string[],
  requested?: string[],
): string[] {
  if (!requested) return available
  return available.filter((id) =>
    requested.some((name) => equalsIgnoreCase(name, id)),
  )
}

function renderController(
  nameSpace: string,
  table: TableMapping,
  controllerName: string,
  modelName: string | undefined,
  methods: Set<string>,
): string {
  const objectName = table.objectName!
  const serviceName = table.serviceName!
  const serviceField = `_${camelName(serviceName)}`
  const param = camelName(tableSingularName(table.tableName))
  const key = singlePrimaryKey(table)
  const bindType = modelName
    ?? table.baseObjectName
    ?? objectName
  const person = table.hasPersonId
  const hydrate = (table.bridgePartners ?? []).length > 0
  const getAll = table.hasActive || hasDeletedOnColumn(table)

  const actions: string[] = []

  if (methods.has('Get')) {
    actions.push(`    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<${objectName}>), 200)]
    public async Task<ActionResult> Get() =>
        Ok(await ${serviceField}.GetAsync());`)
  }

  if (getAll && methods.has('All')) {
    actions.push(`    [HttpGet("all")]
    [ProducesResponseType(typeof(IEnumerable<${objectName}>), 200)]
    public async Task<ActionResult> All() =>
        Ok(await ${serviceField}.GetAllAsync());`)
  }

  if (key && methods.has('GetById')) {
    const id = camelName(key.column)
    const type = nonNullableType(key)
    const getBy = hydrate
      ? key.csharpType === 'int'
        ? `${serviceField}.GetHydratedByIdAsync(${id})`
        : `${serviceField}.GetHydratedByKeyAsync(${id})`
      : key.csharpType === 'int'
        ? `${serviceField}.GetByIdAsync(${id})`
        : `${serviceField}.GetByKeyAsync(${id})`
    actions.push(`    [HttpGet("{${id}}")]
    [ProducesResponseType(typeof(${objectName}), 200)]
    public async Task<ActionResult> GetById(${type} ${id}) =>
        Ok(await ${getBy} ?? throw new KeyNotFoundException());`)
  }

  if (methods.has('Post')) {
    actions.push(renderPost(table, bindType, modelName, serviceField, param, person))
  }

  if (key && methods.has('Patch')) {
    actions.push(
      renderPatch(table, bindType, modelName, serviceField, param, person, key, hydrate),
    )
  }
  if (key && methods.has('Delete')) {
    actions.push(renderDelete(serviceField, person, key))
  }

  for (const extra of extraGetRoutes(table, methods)) {
    actions.push(extra)
  }

  return collapseExcessBlankLines(`using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ${nameSpace}.Business;
using ${nameSpace}.SpaModels;

namespace ${nameSpace}.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
[ProducesResponseType(typeof(ApiError), 400)]
[ProducesResponseType(typeof(ApiError), 401)]
[ProducesResponseType(typeof(ApiError), 404)]
[ProducesResponseType(typeof(ApiError), 500)]
public class ${controllerName} : ControllerBase
{
    private readonly ILogger<${controllerName}> _logger;
    private readonly ${serviceName} ${serviceField};

    public ${controllerName}(
        ILogger<${controllerName}> logger,
        ${serviceName} ${camelName(serviceName)})
    {
        _logger = logger;
        ${serviceField} = ${camelName(serviceName)};
    }

${actions.join('\n\n')}
}
`)
}

function renderPost(
  table: TableMapping,
  bindType: string,
  modelName: string | undefined,
  serviceField: string,
  param: string,
  person: boolean,
): string {
  const objectName = table.objectName!
  const personArg = person ? ', User.GetPersonId()' : ''
  let body: string
  if (modelName && table.baseObjectName) {
    body = `        ${table.baseObjectName} ${param} = model.ToObject();
        return Ok(await ${serviceField}.AddAsync(${param}${personArg}));`
  } else if (modelName && person) {
    body = `        ${objectName} ${param} = model.ToObject(User.GetPersonId());
        return Ok(await ${serviceField}.AddAsync(${param}${personArg}));`
  } else if (modelName) {
    body = `        ${objectName} ${param} = model.ToObject();
        return Ok(await ${serviceField}.AddAsync(${param}));`
  } else {
    body = `        return Ok(await ${serviceField}.AddAsync(model${personArg}));`
  }

  return `    [HttpPost]
    [ProducesResponseType(typeof(${objectName}), 200)]
    public async Task<ActionResult> Post(${bindType} model)
    {
${body}
    }`
}

function renderPatch(
  table: TableMapping,
  bindType: string,
  modelName: string | undefined,
  serviceField: string,
  param: string,
  person: boolean,
  key: ColumnMapping,
  hydrate: boolean,
): string {
  const objectName = table.objectName!
  const id = camelName(key.column)
  const type = nonNullableType(key)
  const personArg = person ? ', User.GetPersonId()' : ''
  const reload = hydrate
    ? key.csharpType === 'int'
      ? `${serviceField}.GetHydratedByIdAsync(${id})`
      : `${serviceField}.GetHydratedByKeyAsync(${id})`
    : key.csharpType === 'int'
      ? `${serviceField}.GetByIdAsync(${id})`
      : `${serviceField}.GetByKeyAsync(${id})`

  let assign: string
  if (modelName) {
    const load =
      key.csharpType === 'int'
        ? `${serviceField}.GetByIdAsync(${id})`
        : `${serviceField}.GetByKeyAsync(${id})`
    assign = `        ${objectName} ${param} = await ${load} ?? throw new KeyNotFoundException();
        model.MapToObject(${param});
        await ${serviceField}.UpdateAsync(${param}${personArg});`
  } else {
    assign = `        model.${key.column} = ${id};
        await ${serviceField}.UpdateAsync(model${personArg});`
  }

  return `    [HttpPatch("{${id}}")]
    [ProducesResponseType(typeof(${objectName}), 200)]
    public async Task<ActionResult> Patch(${type} ${id}, ${bindType} model)
    {
${assign}
        return Ok(await ${reload} ?? throw new KeyNotFoundException());
    }`
}

function renderDelete(
  serviceField: string,
  person: boolean,
  key: ColumnMapping,
): string {
  const id = camelName(key.column)
  const type = nonNullableType(key)
  const personArg = person ? ', User.GetPersonId()' : ''
  const method =
    key.csharpType === 'int' ? 'DeleteByIdAsync' : 'DeleteByKeyAsync'
  const body = person
    ? `        await ${serviceField}.${method}(${id}${personArg});
        return Ok(true);`
    : `        var res = await ${serviceField}.${method}(${id});
        return Ok(res == Business.Services.RepoBases.DeleteAction.Deleted);`

  return `    [HttpDelete("{${id}}")]
    [ProducesResponseType(typeof(bool), 200)]
    public async Task<ActionResult> Delete(${type} ${id})
    {
${body}
    }`
}

function extraGetRoutes(table: TableMapping, methods: Set<string>): string[] {
  const objectName = table.objectName!
  const serviceField = `_${camelName(table.serviceName!)}`
  const routes: string[] = []
  const seen = new Set<string>()

  for (const column of table.columns) {
    if (!column.foreignKey) continue
    const kind = tableKind(column.foreignKey.tableName)
    if (kind !== 'data' && kind !== 'lookup') continue
    const id = `By${column.column}`
    if (!methods.has(id) || seen.has(id)) continue
    seen.add(id)
    const arg = camelName(column.column)
    const type = nonNullableType(column)
    const route = `by${column.column.toLowerCase()}`
    routes.push(`    [HttpGet("${route}/{${arg}}")]
    [ProducesResponseType(typeof(IEnumerable<${objectName}>), 200)]
    public async Task<ActionResult> By${column.column}(${type} ${arg}) =>
        Ok(await ${serviceField}.GetBy${column.column}Async(${arg}));`)
  }

  for (const incoming of table.bridgeIncoming ?? []) {
    const id = `By${incoming.otherKeyColumn}`
    if (!methods.has(id) || seen.has(id)) continue
    seen.add(id)
    const arg = camelName(incoming.otherKeyColumn)
    const route = `by${incoming.otherKeyColumn.toLowerCase()}`
    routes.push(`    [HttpGet("${route}/{${arg}}")]
    [ProducesResponseType(typeof(IEnumerable<${objectName}>), 200)]
    public async Task<ActionResult> By${incoming.otherKeyColumn}(${incoming.otherKeyType} ${arg}) =>
        Ok(await ${serviceField}.GetBy${incoming.otherKeyColumn}Async(${arg}));`)
  }

  return routes
}

function renderEditModel(
  nameSpace: string,
  table: TableMapping,
  modelName: string,
  properties: EditableProperty[],
): string {
  const target = table.baseObjectName ?? table.objectName!
  const needsGeneric = properties.some((property) =>
    property.csharpType.startsWith('List<'),
  )
  const needsRequired = properties.some((property) => property.required)
  const usings = [
    needsRequired ? 'using System.ComponentModel.DataAnnotations;' : undefined,
    needsGeneric ? 'using System.Collections.Generic;' : undefined,
    `using ${nameSpace}.Business;`,
  ].filter((value): value is string => Boolean(value))

  const props = properties
    .map((property) => renderModelProperty(property))
    .join('\n\n')

  const person = table.hasPersonId && !table.baseObjectName
  const toObject = table.baseObjectName
    ? renderBaseMapper(target, properties)
    : renderObjectMapper(table, target, properties, person)
  const mapper = `${toObject}

${renderMapToObject(table.objectName!, properties)}`

  return collapseExcessBlankLines(`${usings.join('\n')}

namespace ${nameSpace}.SpaModels;

public class ${modelName}
{
    #region Properties

${props}

    #endregion Properties

    #region Methods

${mapper}

    #endregion Methods
}
`)
}

function renderModelProperty(property: EditableProperty): string {
  const attributes: string[] = []
  if (property.required) attributes.push('    [Required]')
  const initializer =
    property.csharpType === 'string' && property.required ? ' = null!;' : ''
  const attrBlock = attributes.length > 0 ? `${attributes.join('\n')}\n` : ''
  return `${attrBlock}    public ${property.csharpType} ${property.name} { get; set; }${initializer}`
}

function renderMapToObject(
  objectName: string,
  properties: EditableProperty[],
): string {
  const param = camelName(objectName.replace(/Object$/, '') || objectName)
  const assignments = properties
    .map((property) => `        ${param}.${property.name} = ${property.name};`)
    .join('\n')
  return `    public void MapToObject(${objectName} ${param})
    {
${assignments}
    }`
}

function renderBaseMapper(
  target: string,
  properties: EditableProperty[],
): string {
  const assignments = properties
    .map((property) => `            ${property.name} = ${property.name},`)
    .join('\n')
  return `    public ${target} ToObject()
    {
        return new ${target}
        {
${assignments}
        };
    }`
}

function renderObjectMapper(
  table: TableMapping,
  target: string,
  properties: EditableProperty[],
  person: boolean,
): string {
  const required = table.columns.filter((column) => {
    if (column.primaryKey || column.nullable) return false
    if (isAuditColumn(column.column)) return false
    if (column.column.toLowerCase() === 'active') return false
    return properties.some((property) => property.name === column.column)
  })
  const personParam = person ? 'string personId' : ''
  const ctorArgs = [
    ...required.map((column) => column.column),
    ...(person ? ['personId'] : []),
  ].join(', ')
  const extras = properties.filter(
    (property) => !required.some((column) => column.column === property.name),
  )
  const extraAssign = extras
    .map((property) => `        value.${property.name} = ${property.name};`)
    .join('\n')

  const signature = personParam
    ? `    public ${target} ToObject(${personParam})`
    : `    public ${target} ToObject()`
  if (required.length === 0 && !person) {
    const assignments = properties
      .map((property) => `            ${property.name} = ${property.name},`)
      .join('\n')
    return `${signature}
    {
        return new ${target}
        {
${assignments}
        };
    }`
  }

  const extraBlock = extraAssign ? `\n${extraAssign}` : ''
  return `${signature}
    {
        ${target} value = new ${target}(${ctorArgs});${extraBlock}
        return value;
    }`
}

function nonNullableType(column: ColumnMapping): string {
  return column.csharpType.replace(/\?$/, '')
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}
