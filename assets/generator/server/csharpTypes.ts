const STRING_TYPES = new Set([
  'char',
  'nchar',
  'ntext',
  'nvarchar',
  'text',
  'varchar',
  'xml',
  'sysname',
  'json',
])

const BYTE_ARRAY_TYPES = new Set([
  'binary',
  'image',
  'rowversion',
  'timestamp',
  'varbinary',
])

const DATE_TYPES = new Set([
  'date',
  'datetime',
  'datetime2',
  'smalldatetime',
])

const DECIMAL_TYPES = new Set(['decimal', 'money', 'numeric', 'smallmoney'])

const CHAR_SIZE_TYPES = new Set([
  'char',
  'nchar',
  'varchar',
  'nvarchar',
  'binary',
  'varbinary',
])

const MAX_TEXT_TYPES = new Set(['ntext', 'text', 'image', 'xml', 'json'])

const SQL_TO_CSHARP: Record<string, string> = {
  bigint: 'long',
  bit: 'bool',
  datetimeoffset: 'DateTimeOffset',
  float: 'double',
  int: 'int',
  real: 'float',
  smallint: 'short',
  time: 'TimeSpan',
  tinyint: 'byte',
  uniqueidentifier: 'Guid',
  sql_variant: 'object',
}

export function propertyTypeString(column: {
  csharpType: string
  nullable: boolean
}): string {
  if (column.csharpType === 'string' || column.csharpType === 'byte[]') {
    return column.nullable ? `${column.csharpType}?` : column.csharpType
  }
  if (!column.nullable || column.csharpType.endsWith('?')) {
    return column.csharpType
  }
  return `${column.csharpType}?`
}

export function camelName(name: string): string {
  if (name.length === 0) return name
  return name.charAt(0).toLowerCase() + name.slice(1)
}

export function constructorDefault(column: {
  column: string
  csharpType: string
  nullable: boolean
}): string | undefined {
  if (column.nullable) return undefined
  if (column.column.toLowerCase() === 'active' && column.csharpType === 'bool') {
    return 'true'
  }
  switch (column.csharpType) {
    case 'string':
      return 'null!'
    case 'byte[]':
      return '[]'
    case 'DateTime':
      return 'DateTime.Now'
    case 'DateTimeOffset':
      return 'DateTimeOffset.Now'
    case 'Guid':
      return 'Guid.Empty'
    default:
      return undefined
  }
}

export function isDateTimeProperty(column: { csharpType: string }): boolean {
  return column.csharpType === 'DateTime'
}

export function csharpTypeFromSql(dataType: string): string {
  const normalized = dataType.trim().toLowerCase()
  if (STRING_TYPES.has(normalized)) return 'string'
  if (BYTE_ARRAY_TYPES.has(normalized)) return 'byte[]'
  if (DATE_TYPES.has(normalized)) return 'DateTime'
  if (DECIMAL_TYPES.has(normalized)) return 'decimal'
  return SQL_TO_CSHARP[normalized] ?? 'unknown'
}

export function formatDataSize(column: {
  dataType: string
  charMaxLength?: number | null
  numericPrecision?: number | null
  numericScale?: number | null
}): string {
  const dataType = column.dataType.trim().toLowerCase()

  if (MAX_TEXT_TYPES.has(dataType)) return 'max'

  if (CHAR_SIZE_TYPES.has(dataType)) {
    if (column.charMaxLength == null) return ''
    if (column.charMaxLength < 0) return 'max'
    return String(column.charMaxLength)
  }

  if (
    (dataType === 'decimal' || dataType === 'numeric') &&
    column.numericPrecision != null
  ) {
    if (column.numericScale == null) return String(column.numericPrecision)
    return `${column.numericPrecision},${column.numericScale}`
  }

  return ''
}
