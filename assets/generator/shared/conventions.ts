import type {
  ColumnMapping,
  GeneratorConfig,
  ObjectRole,
  TableKind,
  TableMapping,
} from './types.ts'

export type EditableProperty = {
  name: string
  csharpType: string
  required: boolean
}

export type ControllerAction = {
  id: string
  http: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  label: string
}

export const IGNORED_TABLES = [
  'dat_Config',
  'dat_ConfigUser',
  'dat_SerilogLogs',
  'dat_Log',
  'dat_UserAvatar',
  'dat_User',
] as const

const IGNORED_TABLE_SET = new Set(
  IGNORED_TABLES.map((name) => name.toLowerCase()),
)

const PREFIX_TO_KIND = {
  dat_: 'data',
  lu_: 'lookup',
  enum_: 'enum',
  br_: 'bridge',
} as const satisfies Record<string, TableKind>

const KIND_ORDER: Record<TableKind, number> = {
  data: 0,
  lookup: 1,
  enum: 2,
  bridge: 3,
}

const HISTORY_STAMPS = new Set(['createdon', 'updatedon', 'deletedon'])
const PERSON_STAMPS = new Set([
  'createdpersonid',
  'updatedpersonid',
  'deletedpersonid',
])

export function isIgnoredTable(tableName: string): boolean {
  return IGNORED_TABLE_SET.has(tableName.toLowerCase())
}

export function tableKind(tableName: string): TableKind | undefined {
  const lower = tableName.toLowerCase()
  const prefix = Object.keys(PREFIX_TO_KIND).find((candidate) =>
    lower.startsWith(candidate),
  )
  return prefix
    ? PREFIX_TO_KIND[prefix as keyof typeof PREFIX_TO_KIND]
    : undefined
}

export function tableSingularName(tableName: string): string {
  const separator = tableName.indexOf('_')
  return separator >= 0 ? tableName.slice(separator + 1) : tableName
}

export function pluralName(singular: string): string {
  if (singular.toLowerCase().endsWith('y') && singular.length > 1) {
    return `${singular.slice(0, -1)}ies`
  }
  return `${singular}s`
}

export function defaultGeneratorConfig(): GeneratorConfig {
  return {
    version: 1,
    primaryTables: [],
    tables: {},
  }
}

export function defaultRole(
  tableName: string,
  kind: TableKind,
  config: GeneratorConfig,
): ObjectRole {
  if (kind === 'enum') return 'enum'
  if (kind === 'lookup') return 'tertiary'
  if (kind === 'bridge') return 'none'
  if (config.primaryTables.some((name) => equalsIgnoreCase(name, tableName))) {
    return 'primary'
  }
  return 'secondary'
}

export function plannedObjectName(
  tableName: string,
  kind: TableKind,
  role: ObjectRole,
): string | null {
  const singular = tableSingularName(tableName)
  if (kind === 'enum') return singular
  if (role === 'none') return null
  return `${singular}Object`
}

export function plannedBaseObjectName(
  objectName: string | null,
  hasHistory: boolean,
): string | null {
  if (!objectName || !hasHistory) return null
  if (!objectName.endsWith('Object')) return `${objectName}Base`
  return `${objectName.slice(0, -'Object'.length)}BaseObject`
}

export function plannedServiceName(
  tableName: string,
  role: ObjectRole,
): string | null {
  if (role === 'none' || role === 'enum') return null
  return `${tableSingularName(tableName)}Service`
}

export function isHistoryStamp(column: string): boolean {
  return HISTORY_STAMPS.has(column.toLowerCase())
}

export function isPersonStamp(column: string): boolean {
  return PERSON_STAMPS.has(column.toLowerCase())
}

export function isAuditColumn(column: string): boolean {
  return isHistoryStamp(column) || isPersonStamp(column)
}

export function isActiveColumn(column: string): boolean {
  return column.toLowerCase() === 'active'
}

export function equalsIgnoreCase(left: string, right: string): boolean {
  return left.localeCompare(right, undefined, { sensitivity: 'accent' }) === 0
}

export function compareTables(
  left: { kind: TableKind; tableName: string },
  right: { kind: TableKind; tableName: string },
): number {
  const byKind = KIND_ORDER[left.kind] - KIND_ORDER[right.kind]
  if (byKind !== 0) return byKind
  return left.tableName.localeCompare(right.tableName)
}

export function editableProperties(table: TableMapping): EditableProperty[] {
  const properties: EditableProperty[] = []
  for (const column of table.columns) {
    if (column.primaryKey || isAuditColumn(column.column)) continue
    const csharpType =
      column.nullable &&
      column.csharpType !== 'string' &&
      column.csharpType !== 'byte[]' &&
      !column.csharpType.endsWith('?')
        ? `${column.csharpType}?`
        : column.nullable &&
            (column.csharpType === 'string' || column.csharpType === 'byte[]')
          ? `${column.csharpType}?`
          : column.csharpType
    properties.push({
      name: column.column,
      csharpType,
      required: !column.nullable && column.column.toLowerCase() !== 'active',
    })
  }
  for (const partner of table.bridgePartners ?? []) {
    properties.push({
      name: partner.idsProperty,
      csharpType: `List<${partner.otherKeyType}>?`,
      required: false,
    })
  }
  return properties
}

export function controllerActions(table: TableMapping): ControllerAction[] {
  const actions: ControllerAction[] = [
    { id: 'Get', http: 'GET', label: 'Get()' },
  ]
  if (table.hasActive || hasDeletedOnColumn(table)) {
    actions.push({ id: 'All', http: 'GET', label: 'All()' })
  }

  const key = singlePrimaryKey(table)
  if (key) {
    actions.push({
      id: 'GetById',
      http: 'GET',
      label: `GetById(${key.column})`,
    })
  }

  actions.push({ id: 'Post', http: 'POST', label: 'Post()' })

  if (key) {
    actions.push({
      id: 'Patch',
      http: 'PATCH',
      label: `Patch(${key.column})`,
    })
    actions.push({
      id: 'Delete',
      http: 'DELETE',
      label: `Delete(${key.column})`,
    })
  }

  const seen = new Set<string>()
  for (const column of table.columns) {
    if (!column.foreignKey) continue
    const kind = tableKind(column.foreignKey.tableName)
    if (kind !== 'data' && kind !== 'lookup') continue
    const id = `By${column.column}`
    if (seen.has(id)) continue
    seen.add(id)
    actions.push({
      id,
      http: 'GET',
      label: `By${column.column}(${column.column})`,
    })
  }
  for (const incoming of table.bridgeIncoming ?? []) {
    const id = `By${incoming.otherKeyColumn}`
    if (seen.has(id)) continue
    seen.add(id)
    actions.push({
      id,
      http: 'GET',
      label: `By${incoming.otherKeyColumn}(${incoming.otherKeyColumn})`,
    })
  }

  return actions
}

export function singlePrimaryKey(table: TableMapping): ColumnMapping | undefined {
  const keys = table.columns.filter((column) => column.primaryKey)
  return keys.length === 1 ? keys[0] : undefined
}

export function hasDeletedOnColumn(table: TableMapping): boolean {
  return table.columns.some(
    (column) => column.column.toLowerCase() === 'deletedon',
  )
}

export function normalizeControllerIdentifier(
  value: string | undefined,
  singular: string,
): string | undefined {
  const fallback = `${singular}Controller`
  const raw = (value ?? fallback).trim()
  if (!raw) return fallback
  const withSuffix = /controller$/i.test(raw) ? raw : `${raw}Controller`
  const name = withSuffix.charAt(0).toUpperCase() + withSuffix.slice(1)
  if (!/^[A-Za-z][A-Za-z0-9]*Controller$/.test(name)) return undefined
  return name
}

export function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>()
  const unique: string[] = []
  for (const name of names) {
    const trimmed = name.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(trimmed)
  }
  return unique
}
