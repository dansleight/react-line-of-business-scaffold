import {
  compareTables,
  defaultRole,
  isActiveColumn,
  isHistoryStamp,
  isIgnoredTable,
  isPersonStamp,
  plannedBaseObjectName,
  plannedObjectName,
  plannedServiceName,
  pluralName,
  tableKind,
  tableSingularName,
} from '../shared/conventions.ts'
import type {
  BridgeIncoming,
  BridgePartner,
  ForeignKeyRef,
  GeneratorConfig,
  TableMapping,
} from '../shared/types.ts'
import { csharpTypeFromSql, formatDataSize } from './csharpTypes.ts'
import { tableNotes as notesFromConfig } from './generatorConfig.ts'

export type SchemaRow = {
  schemaName: string
  tableName: string
  columnName: string
  orderNum: number
  dataType: string
  nullable: string | boolean
  charMaxLen: number | null
  numericPrecision: number | null
  numericScale: number | null
  constraintType: string | null
  foreignSchema: string | null
  foreignTableName: string | null
  foreignColumnName: string | null
}

export function toTableMappings(
  rows: SchemaRow[],
  config: GeneratorConfig,
): TableMapping[] {
  const byTable = new Map<string, TableMapping>()

  for (const row of rows) {
    if (!row.tableName || !row.columnName) continue
    const kind = tableKind(row.tableName)
    if (!kind || isIgnoredTable(row.tableName)) continue

    const key = `${row.schemaName}.${row.tableName}`
    let table = byTable.get(key)
    if (!table) {
      const role = defaultRole(row.tableName, kind, config)
      table = {
        schema: row.schemaName,
        tableName: row.tableName,
        kind,
        role,
        objectName: plannedObjectName(row.tableName, kind, role),
        baseObjectName: null,
        serviceName: plannedServiceName(row.tableName, role),
        columns: [],
        hasJoinPayload: false,
        hasHistory: false,
        hasActive: false,
        hasPersonId: false,
        bridgePartners: [],
        bridgeIncoming: [],
        notes: notesFromConfig(config, row.tableName),
        canGenerate: false,
        canReplace: false,
      }
      byTable.set(key, table)
    }

    mergeColumn(table, row)
  }

  for (const table of byTable.values()) {
    table.hasJoinPayload = table.columns.some((column) => !column.foreignKey)
    table.hasHistory = table.columns.some((column) =>
      isHistoryStamp(column.column),
    )
    table.hasActive = table.columns.some((column) =>
      isActiveColumn(column.column),
    )
    table.hasPersonId = table.columns.some((column) =>
      isPersonStamp(column.column),
    )
    table.baseObjectName = plannedBaseObjectName(
      table.objectName,
      table.hasHistory,
    )
    if (table.kind === 'enum') {
      for (const column of table.columns) {
        column.csharpType = table.objectName ?? tableSingularName(table.tableName)
      }
    }
  }

  const tables = [...byTable.values()].sort(compareTables)
  attachBridges(tables)
  return tables
}

function attachBridges(tables: TableMapping[]): void {
  const bridges = tables.filter((table) => table.kind === 'bridge')

  for (const table of tables) {
    table.bridgePartners = []
    table.bridgeIncoming = []
  }

  for (const bridge of bridges) {
    const foreignKeys = bridge.columns.filter((column) => column.foreignKey)
    if (foreignKeys.length < 2) continue

    for (const selfFk of foreignKeys) {
      const selfTable = tables.find(
        (entry) => entry.tableName === selfFk.foreignKey?.tableName,
      )
      if (!selfTable || (selfTable.kind !== 'data' && selfTable.kind !== 'lookup')) {
        continue
      }

      for (const otherFk of foreignKeys) {
        if (otherFk.column === selfFk.column) continue
        const otherName = otherFk.foreignKey?.tableName
        if (!otherName) continue
        const otherKind = tableKind(otherName)
        if (otherKind !== 'data' && otherKind !== 'lookup') continue
        const other = tables.find((entry) => entry.tableName === otherName)
        const otherSingular = tableSingularName(otherName)

        const incoming: BridgeIncoming = {
          bridgeTableName: bridge.tableName,
          selfKeyColumn: selfFk.column,
          otherTableName: otherName,
          otherKeyColumn: otherFk.column,
          otherKeyType: nonNullableCsharp(otherFk.csharpType),
        }
        if (
          !selfTable.bridgeIncoming.some(
            (entry) =>
              entry.bridgeTableName === incoming.bridgeTableName &&
              entry.otherKeyColumn === incoming.otherKeyColumn,
          )
        ) {
          selfTable.bridgeIncoming.push(incoming)
        }

        if (selfTable.role !== 'primary') continue

        const partner: BridgePartner = {
          bridgeTableName: bridge.tableName,
          otherTableName: otherName,
          otherObjectName:
            other?.objectName ?? `${otherSingular}Object`,
          otherServiceName:
            other?.serviceName ?? `${otherSingular}Service`,
          otherKeyColumn: otherFk.column,
          otherKeyType: nonNullableCsharp(otherFk.csharpType),
          selfKeyColumn: selfFk.column,
          idsProperty: `${otherSingular}Ids`,
          objectsProperty: pluralName(otherSingular),
        }
        if (
          !selfTable.bridgePartners.some(
            (entry) =>
              entry.bridgeTableName === partner.bridgeTableName &&
              entry.idsProperty === partner.idsProperty,
          )
        ) {
          selfTable.bridgePartners.push(partner)
        }
      }
    }
  }
}

function nonNullableCsharp(type: string): string {
  return type.replace(/\?$/, '')
}

export function applyGenerationFlags(table: TableMapping): void {
  if (table.kind === 'enum') {
    const status = table.enumAudit?.status ?? 'missing'
    table.canGenerate = status !== 'correct'
    table.canReplace = false
    return
  }

  if (!table.objectName || !table.serviceName) {
    table.canGenerate = false
    table.canReplace = false
    return
  }

  const objectStatus = table.objectAudit?.status ?? 'missing'
  const serviceStatus = table.serviceAudit?.status ?? 'missing'
  table.canGenerate = objectStatus === 'missing' || serviceStatus === 'missing'
  table.canReplace = objectStatus !== 'missing' || serviceStatus !== 'missing'
}

function mergeColumn(table: TableMapping, row: SchemaRow): void {
  let column = table.columns.find((entry) => entry.column === row.columnName)
  if (!column) {
    column = {
      column: row.columnName,
      dataType: row.dataType,
      dataSize: formatDataSize({
        dataType: row.dataType,
        charMaxLength: row.charMaxLen,
        numericPrecision: row.numericPrecision,
        numericScale: row.numericScale,
      }),
      nullable: parseNullable(row.nullable),
      csharpType: csharpTypeFor(row),
      primaryKey: false,
      unique: false,
    }
    table.columns.push(column)
  }

  const constraint = row.constraintType?.toUpperCase()
  if (constraint === 'PRIMARY KEY') column.primaryKey = true
  if (constraint === 'UNIQUE') column.unique = true
  if (
    constraint === 'FOREIGN KEY' &&
    row.foreignTableName &&
    row.foreignColumnName
  ) {
    const foreignKey: ForeignKeyRef = {
      schema: row.foreignSchema ?? table.schema,
      tableName: row.foreignTableName,
      columnName: row.foreignColumnName,
    }
    column.foreignKey = foreignKey
    if (tableKind(foreignKey.tableName) === 'enum') {
      column.csharpType = tableSingularName(foreignKey.tableName)
    }
  }
}

function csharpTypeFor(row: SchemaRow): string {
  if (row.foreignTableName && tableKind(row.foreignTableName) === 'enum') {
    return tableSingularName(row.foreignTableName)
  }
  return csharpTypeFromSql(row.dataType)
}

function parseNullable(value: string | boolean): boolean {
  if (typeof value === 'boolean') return value
  const normalized = value.trim().toLowerCase()
  return normalized === 'true' || normalized === 'yes'
}
