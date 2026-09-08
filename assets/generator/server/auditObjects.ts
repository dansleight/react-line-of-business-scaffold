import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import {
  isAuditColumn,
  tableKind,
  tableSingularName,
} from '../shared/conventions.ts'
import type {
  ColumnMapping,
  ObjectAudit,
  TableMapping,
} from '../shared/types.ts'
import {
  camelName,
  constructorDefault,
  isDateTimeProperty,
  propertyTypeString,
} from './csharpTypes.ts'
import { collapseExcessBlankLines } from './sourceFormat.ts'

export function isScaffoldedObject(table: TableMapping): boolean {
  return table.kind === 'lookup' || table.kind === 'data'
}

export function objectFilePath(modelsFolder: string, objectName: string): string {
  return path.join(modelsFolder, `${objectName}.cs`)
}

export async function auditModelTables(
  tables: TableMapping[],
  modelsFolder: string,
): Promise<void> {
  for (const table of tables) {
    if (!isScaffoldedObject(table) || !table.objectName) continue
    table.objectAudit = await auditObjectFile(modelsFolder, table, tables)
  }
}

export async function auditObjectFile(
  modelsFolder: string,
  table: TableMapping,
  allTables: TableMapping[] = [],
): Promise<ObjectAudit> {
  const objectName = table.objectName!
  const filePath = objectFilePath(modelsFolder, objectName)
  const baseFilePath = table.baseObjectName
    ? objectFilePath(modelsFolder, table.baseObjectName)
    : undefined
  const expected = expectedProperties(table, allTables)

  if (!(await fileExists(filePath))) {
    return {
      status: 'missing',
      filePath,
      baseFilePath,
      missingProperties: expected.map((property) => property.name),
      invalidProperties: [],
    }
  }

  const sources = [await readFile(filePath, 'utf8')]
  if (baseFilePath && (await fileExists(baseFilePath))) {
    sources.push(await readFile(baseFilePath, 'utf8'))
  }

  const actual = sources.flatMap((source) =>
    extractPublicProperties(source),
  )
  const byName = new Map(actual.map((property) => [property.name, property]))

  const missingProperties: string[] = []
  const invalidProperties: string[] = []
  for (const property of expected) {
    const found = byName.get(property.name)
    if (!found) {
      missingProperties.push(property.name)
      continue
    }
    if (normalizeType(found.type) !== normalizeType(property.type)) {
      invalidProperties.push(property.name)
    }
  }

  return {
    status:
      missingProperties.length === 0 && invalidProperties.length === 0
        ? 'correct'
        : 'inaccurate',
    filePath,
    baseFilePath,
    missingProperties,
    invalidProperties,
  }
}

export async function writeObjectFiles(
  modelsFolder: string,
  nameSpace: string,
  table: TableMapping,
  allTables: TableMapping[],
  overwrite: boolean,
): Promise<boolean> {
  if (!table.objectName) return false
  const objectPath = objectFilePath(modelsFolder, table.objectName)
  const basePath = table.baseObjectName
    ? objectFilePath(modelsFolder, table.baseObjectName)
    : undefined

  let wrote = false
  if (basePath && table.baseObjectName) {
    if (overwrite || !(await fileExists(basePath))) {
      await mkdir(path.dirname(basePath), { recursive: true })
      await writeFile(
        basePath,
        renderBaseObjectFile(nameSpace, table),
        'utf8',
      )
      wrote = true
    }
  }

  if (overwrite || !(await fileExists(objectPath))) {
    await mkdir(path.dirname(objectPath), { recursive: true })
    await writeFile(
      objectPath,
      renderObjectFile(nameSpace, table, allTables),
      'utf8',
    )
    wrote = true
  }

  return wrote
}

export function renderBaseObjectFile(
  nameSpace: string,
  table: TableMapping,
): string {
  const baseName = table.baseObjectName!
  const business = businessColumns(table)
  const extended = renderExtendedPropertiesRegion(table)
  const dates = renderDatesAsStringsRegion(business)
  const regions = [
    renderNamedRegion('Properties', renderPropertiesRegion(business)),
  ]
  if (extended) regions.push(renderNamedRegion('Extended Properties', extended))
  if (dates) regions.push(renderNamedRegion('Dates As Strings', dates))

  return collapseExcessBlankLines(`${objectUsings(table, business)}

namespace ${nameSpace}.Business;

public class ${baseName}
{
${regions.join('\n').replace(/\n+$/, '')}
}
`)
}

export function renderObjectFile(
  nameSpace: string,
  table: TableMapping,
  allTables: TableMapping[] = [],
): string {
  const objectName = table.objectName!
  const owned = table.hasHistory ? auditColumns(table) : table.columns
  const extended = table.hasHistory
    ? undefined
    : renderExtendedPropertiesRegion(table)
  const derived = renderDerivedPropertiesRegion(table, allTables)
  const dates = renderDatesAsStringsRegion(owned)
  const regions = [
    renderNamedRegion('Properties', renderPropertiesRegion(owned)),
  ]
  if (extended) regions.push(renderNamedRegion('Extended Properties', extended))
  if (derived) regions.push(renderNamedRegion('Derived Properties', derived))
  if (dates) regions.push(renderNamedRegion('Dates As Strings', dates))
  regions.push(
    renderNamedRegion(
      'Constructor',
      renderConstructorRegion(objectName, table),
    ),
  )
  if (table.hasHistory && table.baseObjectName) {
    regions.push(
      renderNamedRegion(
        'Methods',
        renderMapFrom(table),
      ),
    )
  }

  const inherits = table.baseObjectName ? ` : ${table.baseObjectName}` : ''

  return collapseExcessBlankLines(`${objectUsings(table, owned)}

namespace ${nameSpace}.Business;

[Table("${table.tableName}")]
public class ${objectName}${inherits}
{
${regions.join('\n').replace(/\n+$/, '')}
}
`)
}

export function lookupNavigationName(column: ColumnMapping): string {
  if (/id$/i.test(column.column) && column.column.length > 2) {
    return column.column.replace(/id$/i, '')
  }
  return tableSingularName(column.foreignKey?.tableName ?? column.column)
}

export function lookupNavigations(
  table: TableMapping,
  allTables: TableMapping[],
): { name: string; type: string }[] {
  return table.columns.flatMap((column) => {
    if (
      !column.foreignKey ||
      tableKind(column.foreignKey.tableName) !== 'lookup'
    ) {
      return []
    }
    const related = allTables.find(
      (entry) => entry.tableName === column.foreignKey?.tableName,
    )
    const typeName =
      related?.objectName ??
      `${tableSingularName(column.foreignKey.tableName)}Object`
    return [{ name: lookupNavigationName(column), type: `${typeName}?` }]
  })
}

export function extractPublicProperties(
  source: string,
): { name: string; type: string }[] {
  const properties: { name: string; type: string }[] = []
  const pattern =
    /public\s+([\w.?[\]<>]+)\s+(\w+)\s*(?:\{|=>)/g
  for (const match of source.matchAll(pattern)) {
    properties.push({ type: match[1], name: match[2] })
  }
  return properties
}

function expectedProperties(
  table: TableMapping,
  allTables: TableMapping[],
): { name: string; type: string }[] {
  const expected = table.columns.map((column) => ({
    name: column.column,
    type: propertyTypeString(column),
  }))

  for (const partner of table.bridgePartners ?? []) {
    expected.push({
      name: partner.idsProperty,
      type: `List<${partner.otherKeyType}>?`,
    })
    expected.push({
      name: partner.objectsProperty,
      type: `List<${partner.otherObjectName}>?`,
    })
  }

  for (const navigation of lookupNavigations(table, allTables)) {
    expected.push(navigation)
  }

  for (const column of table.columns.filter((entry) =>
    isDateTimeProperty(entry),
  )) {
    expected.push({
      name: `${column.column}String`,
      type: column.nullable ? 'string?' : 'string',
    })
  }

  return expected
}

function businessColumns(table: TableMapping): ColumnMapping[] {
  return table.columns.filter((column) => !isAuditColumn(column.column))
}

function auditColumns(table: TableMapping): ColumnMapping[] {
  return table.columns.filter((column) => isAuditColumn(column.column))
}

function objectUsings(table: TableMapping, columns: ColumnMapping[]): string {
  const usings = [
    'using System.ComponentModel.DataAnnotations;',
    'using System.ComponentModel.DataAnnotations.Schema;',
  ]
  if ((table.bridgePartners ?? []).length > 0) {
    usings.splice(2, 0, 'using System.Collections.Generic;')
  }
  if (columns.some((column) => isDateTimeProperty(column))) {
    usings.push('using Newtonsoft.Json;')
  }
  return usings.join('\n')
}

function renderNamedRegion(name: string, body: string): string {
  return `    #region ${name}\n\n${normalizeRegionBody(body)}    #endregion ${name}\n`
}

function renderPropertiesRegion(columns: ColumnMapping[]): string {
  return columns
    .map((column) => {
      const type = propertyTypeString(column)
      const initializer =
        type === 'string' && !column.nullable ? ' = null!;' : ''
      return `    ${propertyAttributes(column)}\n    public ${type} ${column.column} { get; set; }${initializer}`
    })
    .join('\n\n')
}

function renderExtendedPropertiesRegion(
  table: TableMapping,
): string | undefined {
  if ((table.bridgePartners ?? []).length === 0) return undefined
  return table.bridgePartners
    .map(
      (partner) =>
        `    public List<${partner.otherKeyType}>? ${partner.idsProperty} { get; set; }`,
    )
    .join('\n\n')
}

function renderDerivedPropertiesRegion(
  table: TableMapping,
  allTables: TableMapping[],
): string | undefined {
  const navigations = [
    ...lookupNavigations(table, allTables),
    ...(table.bridgePartners ?? []).map((partner) => ({
      name: partner.objectsProperty,
      type: `List<${partner.otherObjectName}>?`,
    })),
  ]
  if (navigations.length === 0) return undefined
  return navigations
    .map(
      (navigation) =>
        `    public ${navigation.type} ${navigation.name} { get; set; }`,
    )
    .join('\n\n')
}

function renderDatesAsStringsRegion(
  columns: ColumnMapping[],
): string | undefined {
  const dates = columns.filter((column) => isDateTimeProperty(column))
  if (dates.length === 0) return undefined

  return dates
    .map((column) => {
      const access = column.nullable ? '?.' : '.'
      const type = column.nullable ? 'string?' : 'string'
      return `    [JsonProperty("${camelName(column.column)}")]
    public ${type} ${column.column}String => ${column.column}${access}ToString("MMM d, yyyy");`
    })
    .join('\n\n')
}

function renderConstructorRegion(
  objectName: string,
  table: TableMapping,
): string {
  const internalAssignments = table.columns
    .map((column) => {
      const value = constructorDefault(column)
      return value ? `        ${column.column} = ${value};` : undefined
    })
    .filter((line): line is string => Boolean(line))

  const internalBody =
    internalAssignments.length > 0
      ? `\n${internalAssignments.join('\n')}\n    `
      : '\n    '

  let source = `    internal ${objectName}()
    {${internalBody}}
`

  if (table.baseObjectName) {
    source += renderBaseConstructor(objectName, table)
  }

  const required = requiredConstructorColumns(table)
  const personParam = createdPersonParameter(table)
  if (required.length === 0 && !personParam) return source

  const args = [
    ...required.map(
      (column) =>
        `${propertyTypeString({ ...column, nullable: false })} ${camelName(column.column)}`,
    ),
    ...(personParam ? [`string ${personParam}`] : []),
  ].join(',\n        ')

  const assignments = [
    ...required.map(
      (column) => `        ${column.column} = ${camelName(column.column)};`,
    ),
    ...publicConstructorDefaults(table, personParam),
  ].join('\n')

  source += `
    public ${objectName}(
        ${args}
    )
    {
${assignments}
    }
`
  return source
}

function renderBaseConstructor(
  objectName: string,
  table: TableMapping,
): string {
  const baseName = table.baseObjectName!
  const person = table.hasPersonId
  const args = person
    ? `${baseName} value, string personId`
    : `${baseName} value`
  const assignments = [
    ...businessColumns(table).map(
      (column) => `        ${column.column} = value.${column.column};`,
    ),
    ...(table.bridgePartners ?? []).map(
      (partner) =>
        `        ${partner.idsProperty} = value.${partner.idsProperty};`,
    ),
    ...publicConstructorDefaults(table, person ? 'personId' : undefined),
  ].join('\n')

  return `
    public ${objectName}(${args})
    {
${assignments}
    }
`
}

function renderMapFrom(table: TableMapping): string {
  const assignments = [
    ...businessColumns(table)
      .filter((column) => !column.primaryKey)
      .map((column) => `        ${column.column} = value.${column.column};`),
    ...(table.bridgePartners ?? []).map(
      (partner) =>
        `        ${partner.idsProperty} = value.${partner.idsProperty};`,
    ),
  ]

  return `    public void MapFrom(${table.baseObjectName} value)
    {
${assignments.join('\n')}
    }
`
}

function requiredConstructorColumns(table: TableMapping): ColumnMapping[] {
  return table.columns.filter((column) => {
    if (column.primaryKey || column.nullable) return false
    if (isAuditColumn(column.column)) return false
    if (column.column.toLowerCase() === 'active') return false
    return true
  })
}

function createdPersonParameter(table: TableMapping): string | undefined {
  const created = table.columns.find(
    (column) => column.column.toLowerCase() === 'createdpersonid',
  )
  return created ? 'createdPersonId' : undefined
}

function publicConstructorDefaults(
  table: TableMapping,
  personParam: string | undefined,
): string[] {
  const lines: string[] = []
  for (const column of table.columns) {
    if (column.column.toLowerCase() === 'active' && !column.nullable) {
      lines.push(`        ${column.column} = true;`)
    }
    if (column.column.toLowerCase() === 'createdon' && !column.nullable) {
      lines.push(`        ${column.column} = DateTime.Now;`)
    }
    if (
      personParam &&
      column.column.toLowerCase() === 'createdpersonid'
    ) {
      lines.push(`        ${column.column} = ${personParam};`)
    }
  }
  return lines
}

function propertyAttributes(column: ColumnMapping): string {
  const attributes: string[] = []
  if (column.foreignKey && tableKind(column.foreignKey.tableName) === 'enum') {
    attributes.push('Column(TypeName = "nvarchar")')
  } else {
    attributes.push('Column')
  }
  if (column.primaryKey) attributes.push('Key')
  if (isDateTimeProperty(column)) attributes.push('JsonIgnore')
  return `[${attributes.join(', ')}]`
}

function normalizeRegionBody(value: string): string {
  return `${value.replace(/^\n+/, '').replace(/\n+$/, '')}\n\n`
}

function normalizeType(value: string): string {
  return value.replace(/\s+/g, '')
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}
