import type { ConnectionPool } from 'mssql'
import { defaultGeneratorConfig } from '../shared/conventions.ts'
import type { GeneratorConfig, TableMapping } from '../shared/types.ts'
import { auditEnumTables } from './auditEnums.ts'
import { auditModelTables } from './auditObjects.ts'
import { auditServiceTables } from './auditServices.ts'
import { applyGenerationFlags, toTableMappings, type SchemaRow } from './schemaModel.ts'
import { quoteId, withSql } from './sqlPool.ts'

const SCHEMA_QUERY = `
SELECT
    t.TABLE_SCHEMA AS [schemaName],
    t.TABLE_NAME AS [tableName],
    c.COLUMN_NAME AS [columnName],
    c.ORDINAL_POSITION AS [orderNum],
    c.DATA_TYPE AS [dataType],
    IIF(c.IS_NULLABLE = 'YES', 'True', 'False') AS [nullable],
    c.CHARACTER_MAXIMUM_LENGTH AS [charMaxLen],
    c.NUMERIC_PRECISION AS [numericPrecision],
    c.NUMERIC_SCALE AS [numericScale],
    n.CONSTRAINT_TYPE AS [constraintType],
    k2.TABLE_SCHEMA AS [foreignSchema],
    k2.TABLE_NAME AS [foreignTableName],
    k2.COLUMN_NAME AS [foreignColumnName]
FROM    INFORMATION_SCHEMA.TABLES t
    LEFT JOIN INFORMATION_SCHEMA.COLUMNS c
        ON    t.TABLE_CATALOG = c.TABLE_CATALOG
        AND    t.TABLE_SCHEMA = c.TABLE_SCHEMA
        AND    t.TABLE_NAME = c.TABLE_NAME
    LEFT JOIN (
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
            JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS n
                ON    k.CONSTRAINT_CATALOG = n.CONSTRAINT_CATALOG
                AND    k.CONSTRAINT_SCHEMA = n.CONSTRAINT_SCHEMA
                AND    k.CONSTRAINT_NAME = n.CONSTRAINT_NAME
            LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS r
                ON    k.CONSTRAINT_CATALOG = r.CONSTRAINT_CATALOG
                AND    k.CONSTRAINT_SCHEMA = r.CONSTRAINT_SCHEMA
                AND k.CONSTRAINT_NAME = r.CONSTRAINT_NAME
        )
        ON    c.TABLE_CATALOG = k.TABLE_CATALOG
        AND    c.TABLE_SCHEMA = k.TABLE_SCHEMA
        AND    c.TABLE_NAME = k.TABLE_NAME
        AND c.COLUMN_NAME = k.COLUMN_NAME
    LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE k2
        ON    k.ORDINAL_POSITION = k2.ORDINAL_POSITION
        AND    r.UNIQUE_CONSTRAINT_CATALOG = k2.CONSTRAINT_CATALOG
        AND r.UNIQUE_CONSTRAINT_SCHEMA = k2.CONSTRAINT_SCHEMA
        AND r.UNIQUE_CONSTRAINT_NAME = k2.CONSTRAINT_NAME
WHERE    t.TABLE_TYPE = 'BASE TABLE'
ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION
`

export type ReadSchemaOptions = {
  connectionString: string
  generatorConfig?: GeneratorConfig
  enumsFolder?: string
  modelsFolder?: string
  servicesFolder?: string
}

export async function readSchema(
  options: ReadSchemaOptions | string,
): Promise<TableMapping[]> {
  const normalized: ReadSchemaOptions =
    typeof options === 'string'
      ? { connectionString: options }
      : options
  const config = normalized.generatorConfig ?? defaultGeneratorConfig()

  return withSql(normalized.connectionString, async (pool) => {
    const result = await pool.request().query<SchemaRow>(SCHEMA_QUERY)
    const tables = toTableMappings(result.recordset, config)
    await attachEnumValues(pool, tables)
    if (normalized.enumsFolder) {
      await auditEnumTables(tables, normalized.enumsFolder)
    }
    if (normalized.modelsFolder) {
      await auditModelTables(tables, normalized.modelsFolder)
    }
    if (normalized.servicesFolder) {
      await auditServiceTables(tables, normalized.servicesFolder)
    }
    for (const table of tables) applyGenerationFlags(table)
    return tables
  })
}

async function attachEnumValues(
  pool: ConnectionPool,
  tables: TableMapping[],
): Promise<void> {
  for (const table of tables) {
    if (table.kind !== 'enum') continue
    const valueColumn =
      table.columns.find((column) => column.primaryKey) ?? table.columns[0]
    if (!valueColumn) {
      table.enumValues = []
      continue
    }

    const sql = `SELECT ${quoteId(valueColumn.column)} AS [value] FROM ${quoteId(table.schema)}.${quoteId(table.tableName)}`
    try {
      const result = await pool.request().query<{ value: unknown }>(sql)
      const values = result.recordset
        .map((row) => (row.value == null ? '' : String(row.value).trim()))
        .filter((value) => value.length > 0)
      values.sort((left, right) => left.localeCompare(right))
      table.enumValues = values
    } catch {
      table.enumValues = []
    }
  }
}
