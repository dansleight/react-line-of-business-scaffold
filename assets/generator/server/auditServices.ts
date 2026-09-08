import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import { tableKind, tableSingularName } from '../shared/conventions.ts'
import type {
  ColumnMapping,
  ServiceAudit,
  ServiceMethod,
  TableMapping,
} from '../shared/types.ts'
import { isScaffoldedObject, lookupNavigationName } from './auditObjects.ts'
import { camelName } from './csharpTypes.ts'
import { collapseExcessBlankLines } from './sourceFormat.ts'

export function serviceFilePath(
  servicesFolder: string,
  serviceName: string,
): string {
  return path.join(servicesFolder, `${serviceName}.cs`)
}

export async function auditServiceTables(
  tables: TableMapping[],
  servicesFolder: string,
): Promise<void> {
  for (const table of tables) {
    if (!isScaffoldedObject(table) || !table.serviceName) continue
    table.serviceAudit = await auditServiceFile(
      serviceFilePath(servicesFolder, table.serviceName),
      table,
    )
  }
}

export async function auditServiceFile(
  filePath: string,
  table: TableMapping,
): Promise<ServiceAudit> {
  const expectedMethods = expectedServiceMethods(table)
  if (!(await fileExists(filePath))) {
    return {
      status: 'missing',
      filePath,
      expectedMethods,
      missingMethods: expectedMethods,
    }
  }

  const source = await readFile(filePath, 'utf8')
  const actual = extractServiceMethods(source, table.serviceName!)
  const missingMethods = expectedMethods.filter(
    (expected) => !actual.some((candidate) => methodsMatch(expected, candidate)),
  )

  return {
    status: missingMethods.length === 0 ? 'correct' : 'inaccurate',
    filePath,
    expectedMethods,
    missingMethods,
  }
}

export async function writeServiceFile(
  filePath: string,
  nameSpace: string,
  table: TableMapping,
  overwrite: boolean,
): Promise<boolean> {
  if (!overwrite && (await fileExists(filePath))) return false
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, renderServiceFile(nameSpace, table), 'utf8')
  return true
}

export function expectedServiceMethods(table: TableMapping): ServiceMethod[] {
  const objectName = table.objectName ?? `${tableSingularName(table.tableName)}Object`
  const methods: ServiceMethod[] = [{ name: 'GetAsync', parameters: [] }]

  if (table.hasActive || hasDeletedOn(table)) {
    methods.push({ name: 'GetAllAsync', parameters: [] })
  }

  const key = singleKey(table)
  if (key?.csharpType === 'int') {
    methods.push({ name: 'GetByIdAsync', parameters: ['int'] })
  } else if (key?.csharpType === 'string') {
    methods.push({ name: 'GetByKeyAsync', parameters: ['string'] })
  }

  const directGetNames = new Set<string>()
  for (const column of parentFilterColumns(table)) {
    const name = `GetBy${column.column}Async`
    directGetNames.add(name)
    methods.push({
      name,
      parameters: [nonNullableType(column)],
    })
  }
  for (const incoming of table.bridgeIncoming ?? []) {
    const name = `GetBy${incoming.otherKeyColumn}Async`
    if (directGetNames.has(name)) continue
    methods.push({
      name,
      parameters: [incoming.otherKeyType],
    })
  }

  if (table.kind === 'lookup') {
    methods.push({ name: 'CachedGetAsync', parameters: [] })
    methods.push({ name: 'CachedGetAllAsync', parameters: [] })
    if (key?.csharpType === 'int') {
      methods.push({ name: 'CachedGetByIdAsync', parameters: ['int'] })
    } else if (key?.csharpType === 'string') {
      methods.push({ name: 'CachedGetByKeyAsync', parameters: ['string'] })
    }
  }

  const person = table.hasPersonId ? ['string'] : []
  methods.push({ name: 'AddAsync', parameters: [objectName, ...person] })
  methods.push({ name: 'UpdateAsync', parameters: [objectName, ...person] })
  methods.push({ name: 'DeleteAsync', parameters: [objectName, ...person] })
  if (key?.csharpType === 'int') {
    methods.push({ name: 'DeleteByIdAsync', parameters: ['int', ...person] })
  } else if (key?.csharpType === 'string') {
    methods.push({ name: 'DeleteByKeyAsync', parameters: ['string', ...person] })
  }

  if (table.baseObjectName && table.hasPersonId) {
    methods.push({
      name: 'AddAsync',
      parameters: [table.baseObjectName, 'string'],
    })
    methods.push({
      name: 'UpdateAsync',
      parameters: [table.baseObjectName, 'string'],
    })
  } else if (table.baseObjectName) {
    methods.push({ name: 'AddAsync', parameters: [table.baseObjectName] })
    methods.push({ name: 'UpdateAsync', parameters: [table.baseObjectName] })
  }

  if ((table.bridgePartners ?? []).length > 0) {
    methods.push({ name: 'HydrateAsync', parameters: [objectName] })
    methods.push({
      name: 'HydrateAsync',
      parameters: [`IEnumerable<${objectName}>`],
    })
    if (key?.csharpType === 'int') {
      methods.push({ name: 'GetHydratedByIdAsync', parameters: ['int'] })
    } else if (key?.csharpType === 'string') {
      methods.push({ name: 'GetHydratedByKeyAsync', parameters: ['string'] })
    }
  }

  return methods
}

export function renderServiceFile(
  nameSpace: string,
  table: TableMapping,
): string {
  const serviceName =
    table.serviceName ?? `${tableSingularName(table.tableName)}Service`
  const objectName =
    table.objectName ?? `${tableSingularName(table.tableName)}Object`
  const repoName = `${tableSingularName(table.tableName)}Repository`
  const param = camelName(tableSingularName(table.tableName))
  const person = table.hasPersonId
  const personArg = person ? ', string personId' : ''
  const personPass = person ? ', personId' : ''
  const key = singleKey(table)

  const methods: string[] = [
    `    public Task<IEnumerable<${objectName}>> GetAsync() => _repo.GetAsync();`,
  ]

  if (table.hasActive || hasDeletedOn(table)) {
    methods.push(
      `    public Task<IEnumerable<${objectName}>> GetAllAsync() => _repo.GetAllAsync();`,
    )
  }

  if (key?.csharpType === 'int') {
    const id = camelName(key.column)
    methods.push(
      `    public Task<${objectName}?> GetByIdAsync(int ${id}) => _repo.GetByIdAsync(${id});`,
    )
  } else if (key?.csharpType === 'string') {
    const id = camelName(key.column)
    methods.push(
      `    public Task<${objectName}?> GetByKeyAsync(string ${id}) => _repo.GetByKeyAsync(${id});`,
    )
  }

  const directGets = parentFilterColumns(table)
  for (const column of directGets) {
    const type = nonNullableType(column)
    const arg = camelName(column.column)
    methods.push(
      `    public Task<IEnumerable<${objectName}>> GetBy${column.column}Async(${type} ${arg}) =>
        _repo.GetAsync(new { ${column.column} = ${arg} });`,
    )
  }

  const directGetNames = new Set(
    directGets.map((column) => `GetBy${column.column}Async`),
  )
  for (const incoming of table.bridgeIncoming ?? []) {
    const methodName = `GetBy${incoming.otherKeyColumn}Async`
    if (directGetNames.has(methodName)) continue
    const arg = camelName(incoming.otherKeyColumn)
    methods.push(
      `    public Task<IEnumerable<${objectName}>> ${methodName}(${incoming.otherKeyType} ${arg}) =>
        _repo.${methodName}(${arg});`,
    )
  }

  if (table.kind === 'lookup') {
    methods.push(
      `    public Task<IEnumerable<${objectName}>> CachedGetAsync() => _repo.CachedGetAsync();`,
      `    public Task<IEnumerable<${objectName}>> CachedGetAllAsync() => _repo.CachedGetAllAsync();`,
    )
    if (key?.csharpType === 'int') {
      const id = camelName(key.column)
      methods.push(
        `    public Task<${objectName}?> CachedGetByIdAsync(int ${id}) => _repo.CachedGetByIdAsync(${id});`,
      )
    } else if (key?.csharpType === 'string') {
      const id = camelName(key.column)
      methods.push(
        `    public async Task<${objectName}?> CachedGetByKeyAsync(string ${id})
    {
        IEnumerable<${objectName}> all = await _repo.CachedGetAllAsync();
        return all.SingleOrDefault(item => item.${key.column} == ${id});
    }`,
      )
    }
  }

  if (table.baseObjectName) {
    methods.push(
      `    public Task<${objectName}> AddAsync(${objectName} ${param}${personArg}) => _repo.InsertAsync(${param}${personPass});`,
      `    public Task<${objectName}> AddAsync(${table.baseObjectName} ${param}Base${personArg})
    {
        ${objectName} ${param} = new ${objectName}(${param}Base${person ? ', personId' : ''});
        return AddAsync(${param}${personPass});
    }`,
      `    public Task UpdateAsync(${objectName} ${param}${personArg}) => _repo.UpdateAsync(${param}${personPass});`,
      renderBaseUpdate(table, objectName, param, person),
    )
  } else {
    methods.push(
      `    public Task<${objectName}> AddAsync(${objectName} ${param}${personArg}) => _repo.InsertAsync(${param}${personPass});`,
      `    public Task UpdateAsync(${objectName} ${param}${personArg}) => _repo.UpdateAsync(${param}${personPass});`,
    )
  }

  methods.push(
    `    public Task<DeleteAction> DeleteAsync(${objectName} ${param}${personArg}) => _repo.DeleteAsync(${param}${personPass});`,
  )
  if (key?.csharpType === 'int') {
    const id = camelName(key.column)
    methods.push(
      `    public Task<DeleteAction> DeleteByIdAsync(int ${id}${personArg}) => _repo.DeleteByIdAsync(${id}${personPass});`,
    )
  } else if (key?.csharpType === 'string') {
    const id = camelName(key.column)
    methods.push(
      `    public Task<DeleteAction> DeleteByKeyAsync(string ${id}${personArg}) => _repo.DeleteByKeyAsync(${id}${personPass});`,
    )
  }

  if ((table.bridgePartners ?? []).length > 0) {
    methods.push(renderHydrateMethods(table, objectName, param, key))
  }

  const extras = injectedServices(table)
  const extraFields = extras
    .map((service) => `    private readonly ${service.type} ${service.field};`)
    .join('\n')
  const ctorParams = [
    `        ILogger<${serviceName}> logger`,
    `        ${repoName} repo`,
    ...extras.map((service) => `        ${service.type} ${service.param}`),
  ].join(',\n')
  const ctorAssignments = [
    '        _logger = logger;',
    '        _repo = repo;',
    ...extras.map((service) => `        ${service.field} = ${service.param};`),
  ].join('\n')
  const repoExtras = renderRepositoryExtras(table, objectName)

  return collapseExcessBlankLines(`using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ${nameSpace}.Business.Models.Config;
using ${nameSpace}.Business.Services.Caching;
using ${nameSpace}.Business.Services.RepoBases;

namespace ${nameSpace}.Business;

public class ${serviceName}
{
    private readonly ILogger<${serviceName}> _logger;
    private readonly ${repoName} _repo;
${extraFields ? `${extraFields}\n` : ''}
    public ${serviceName}(
${ctorParams}
    )
    {
${ctorAssignments}
    }

${methods.join('\n\n')}
}

public partial class ${repoName} : MappedTableRepository<${objectName}>
{
    public ${repoName}(
        ILogger<${repoName}> logger,
        IOptions<DataAccessSettings> config,
        MappedTableBinder tableBinder,
        IAppCache appCache,
        MappedTableChangeBus changeBus) : base(logger, config, appCache, tableBinder, changeBus)
    {
    }
${repoExtras}
}
`)
}

function renderBaseUpdate(
  table: TableMapping,
  objectName: string,
  param: string,
  person: boolean,
): string {
  const key = singleKey(table)
  const personArg = person ? ', string personId' : ''
  const personPass = person ? ', personId' : ''
  if (!table.baseObjectName) return ''

  let load: string
  if (key?.csharpType === 'int') {
    load = `await GetByIdAsync(${param}Base.${key.column})`
  } else if (key?.csharpType === 'string') {
    load = `await GetByKeyAsync(${param}Base.${key.column})`
  } else {
    return `    public Task UpdateAsync(${table.baseObjectName} ${param}Base${personArg}) =>
        UpdateAsync(new ${objectName}(${param}Base${person ? ', personId' : ''})${personPass});`
  }

  return `    public async Task UpdateAsync(${table.baseObjectName} ${param}Base${personArg})
    {
        ${objectName}? current = ${load};
        if (current == null) throw new KeyNotFoundException();
        current.MapFrom(${param}Base);
        await _repo.UpdateAsync(current${personPass});
    }`
}

function injectedServices(table: TableMapping): {
  type: string
  field: string
  param: string
}[] {
  const services: { type: string; field: string; param: string }[] = []
  const seen = new Set<string>()

  for (const column of table.columns) {
    if (
      !column.foreignKey ||
      tableKind(column.foreignKey.tableName) !== 'lookup'
    ) {
      continue
    }
    const type = `${tableSingularName(column.foreignKey.tableName)}Service`
    if (seen.has(type)) continue
    seen.add(type)
    const param = camelName(type)
    services.push({ type, field: `_${param}`, param })
  }

  for (const partner of table.bridgePartners ?? []) {
    if (seen.has(partner.otherServiceName)) continue
    seen.add(partner.otherServiceName)
    const param = camelName(partner.otherServiceName)
    services.push({
      type: partner.otherServiceName,
      field: `_${param}`,
      param,
    })
  }

  return services
}

function renderHydrateMethods(
  table: TableMapping,
  objectName: string,
  param: string,
  key: ColumnMapping | undefined,
): string {
  const lookups = table.columns.filter(
    (column) =>
      column.foreignKey &&
      tableKind(column.foreignKey.tableName) === 'lookup',
  )
  const partners = table.bridgePartners ?? []
  const taskDecls: string[] = []
  const taskNames: string[] = []
  const assignments: string[] = []

  for (const column of lookups) {
    const service = `_${camelName(tableSingularName(column.foreignKey!.tableName))}Service`
    const navigation = lookupNavigationName(column)
    const task = `${camelName(navigation)}Task`
    const cached =
      column.csharpType.replace(/\?$/, '') === 'string'
        ? 'CachedGetByKeyAsync'
        : 'CachedGetByIdAsync'
    const objectType = `${tableSingularName(column.foreignKey!.tableName)}Object`
    if (column.nullable) {
      const local = camelName(column.column)
      taskDecls.push(
        `        Task<${objectType}?> ${task} = ${param}.${column.column} is ${column.csharpType.replace(/\?$/, '')} ${local}
            ? ${service}.${cached}(${local})
            : Task.FromResult<${objectType}?>(null);`,
      )
    } else {
      taskDecls.push(
        `        Task<${objectType}?> ${task} = ${service}.${cached}(${param}.${column.column});`,
      )
    }
    taskNames.push(task)
    assignments.push(`        ${param}.${navigation} = await ${task};`)
  }

  for (const partner of partners) {
    const idsTask = `${camelName(partner.idsProperty)}Task`
    const objectsTask = `${camelName(partner.objectsProperty)}Task`
    const service = `_${camelName(partner.otherServiceName)}`
    const getBy = `GetBy${partner.selfKeyColumn}Async`
    taskDecls.push(
      `        Task<List<${partner.otherKeyType}>> ${idsTask} = _repo.Get${partner.idsProperty}Async(${param}.${partner.selfKeyColumn});`,
      `        Task<IEnumerable<${partner.otherObjectName}>> ${objectsTask} = ${service}.${getBy}(${param}.${partner.selfKeyColumn});`,
    )
    taskNames.push(idsTask, objectsTask)
    assignments.push(
      `        ${param}.${partner.idsProperty} = await ${idsTask};`,
      `        ${param}.${partner.objectsProperty} = (await ${objectsTask}).ToList();`,
    )
  }

  const hydrateOne = `    public async Task HydrateAsync(${objectName} ${param})
    {
${taskDecls.join('\n')}

        await Task.WhenAll(${taskNames.join(', ')});

${assignments.join('\n')}
    }`

  const hydrateMany = `    public Task HydrateAsync(IEnumerable<${objectName}> ${param}s) =>
        Task.WhenAll(${param}s.Select(HydrateAsync));`

  let getHydrated = ''
  if (key?.csharpType === 'int') {
    const id = camelName(key.column)
    getHydrated = `
    public async Task<${objectName}?> GetHydratedByIdAsync(int ${id})
    {
        ${objectName}? ${param} = await GetByIdAsync(${id});
        if (${param} == null) return null;
        await HydrateAsync(${param});
        return ${param};
    }`
  } else if (key?.csharpType === 'string') {
    const id = camelName(key.column)
    getHydrated = `
    public async Task<${objectName}?> GetHydratedByKeyAsync(string ${id})
    {
        ${objectName}? ${param} = await GetByKeyAsync(${id});
        if (${param} == null) return null;
        await HydrateAsync(${param});
        return ${param};
    }`
  }

  return `${hydrateOne}

${hydrateMany}
${getHydrated}`
}

function renderRepositoryExtras(
  table: TableMapping,
  objectName: string,
): string {
  const chunks: string[] = []
  const directGetNames = new Set(
    parentFilterColumns(table).map((column) => `GetBy${column.column}Async`),
  )

  for (const incoming of table.bridgeIncoming ?? []) {
    const methodName = `GetBy${incoming.otherKeyColumn}Async`
    if (directGetNames.has(methodName)) continue
    const arg = camelName(incoming.otherKeyColumn)
    chunks.push(`
    public Task<IEnumerable<${objectName}>> ${methodName}(${incoming.otherKeyType} ${arg})
    {
        string sql = """
            SELECT  item.*
            FROM    ${incoming.bridgeTableName} bridge
                JOIN ${table.tableName} item
                    ON  bridge.${incoming.selfKeyColumn} = item.${incoming.selfKeyColumn}
            WHERE   bridge.${incoming.otherKeyColumn} = @${incoming.otherKeyColumn}
            """;
        return QueryAsync<${objectName}>(sql, new { ${incoming.otherKeyColumn} = ${arg} });
    }`)
  }

  for (const partner of table.bridgePartners ?? []) {
    const selfKey = table.columns.find((column) => column.primaryKey)
    const paramType = selfKey ? nonNullableType(selfKey) : 'int'
    const arg = camelName(partner.selfKeyColumn)
    chunks.push(`
    public async Task<List<${partner.otherKeyType}>> Get${partner.idsProperty}Async(${paramType} ${arg})
    {
        string sql = """
            SELECT  ${partner.otherKeyColumn}
            FROM    ${partner.bridgeTableName}
            WHERE   ${partner.selfKeyColumn} = @${partner.selfKeyColumn}
            """;
        return (await QueryAsync<${partner.otherKeyType}>(sql, new { ${partner.selfKeyColumn} = ${arg} })).ToList();
    }`)
  }

  return chunks.join('\n')
}

function parentFilterColumns(table: TableMapping): ColumnMapping[] {
  return table.columns.filter((column) => {
    if (!column.foreignKey) return false
    const kind = tableKind(column.foreignKey.tableName)
    return kind === 'data' || kind === 'lookup'
  })
}

function singleKey(table: TableMapping): ColumnMapping | undefined {
  const keys = table.columns.filter((column) => column.primaryKey)
  return keys.length === 1 ? keys[0] : undefined
}

function hasDeletedOn(table: TableMapping): boolean {
  return table.columns.some(
    (column) => column.column.toLowerCase() === 'deletedon',
  )
}

function nonNullableType(column: ColumnMapping): string {
  return column.csharpType.replace(/\?$/, '')
}

function extractServiceMethods(
  source: string,
  serviceName: string,
): ServiceMethod[] {
  const classPattern = new RegExp(
    `class\\s+${serviceName}\\b([\\s\\S]*?)(?:class\\s+\\w+|$)`,
  )
  const block = source.match(classPattern)?.[1] ?? source
  const methods: ServiceMethod[] = []
  const pattern =
    /public\s+(?:async\s+)?(?:[\w.?[\]<>,\s]+)\s+(\w+)\s*\(([^)]*)\)/g
  for (const match of block.matchAll(pattern)) {
    const name = match[1]
    if (name === serviceName) continue
    methods.push({
      name,
      parameters: splitParameters(match[2]),
    })
  }
  return methods
}

function splitParameters(value: string): string[] {
  if (!value.trim()) return []
  return value.split(',').map((parameter) => {
    const trimmed = parameter.trim()
    const parts = trimmed.split(/\s+/)
    if (parts.length < 2) return trimmed
    return parts.slice(0, -1).join(' ').replace(/\s+/g, '')
  })
}

function methodsMatch(expected: ServiceMethod, actual: ServiceMethod): boolean {
  if (expected.name !== actual.name) return false
  if (expected.parameters.length !== actual.parameters.length) return false
  return expected.parameters.every(
    (parameter, index) =>
      normalizeType(parameter) === normalizeType(actual.parameters[index] ?? ''),
  )
}

function normalizeType(value: string): string {
  return value.replace(/\s+/g, '').replace(/\?$/, '')
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}
