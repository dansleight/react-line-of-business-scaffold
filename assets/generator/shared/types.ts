export type SolutionProject = {
  name: string
  path: string
}

export type ConnectionSourceKind =
  | 'appsettings.json'
  | 'appsettings.Development.json'
  | 'user secrets'

export type ConnectionSource = {
  projectName: string
  projectPath: string
  sourceFile: string
  sourceKind: ConnectionSourceKind
}

export type TableKind = 'data' | 'lookup' | 'enum' | 'bridge'

export type ObjectRole = 'primary' | 'secondary' | 'tertiary' | 'enum' | 'none'

export type AuditStatus = 'missing' | 'inaccurate' | 'correct'

export type GeneratorTableConfig = {
  notes?: string
}

export type GeneratorConfig = {
  version: 1
  primaryTables: string[]
  tables: Record<string, GeneratorTableConfig>
}

export type ForeignKeyRef = {
  schema: string
  tableName: string
  columnName: string
}

export type ColumnMapping = {
  column: string
  dataType: string
  dataSize: string
  nullable: boolean
  csharpType: string
  primaryKey: boolean
  unique: boolean
  foreignKey?: ForeignKeyRef
}

export type BridgePartner = {
  bridgeTableName: string
  otherTableName: string
  otherObjectName: string
  otherServiceName: string
  otherKeyColumn: string
  otherKeyType: string
  selfKeyColumn: string
  idsProperty: string
  objectsProperty: string
}

export type BridgeIncoming = {
  bridgeTableName: string
  selfKeyColumn: string
  otherTableName: string
  otherKeyColumn: string
  otherKeyType: string
}

export type EnumAudit = {
  status: AuditStatus
  filePath: string
  expectedValues: string[]
  actualValues?: string[]
  missingValues: string[]
  extraValues: string[]
}

export type ObjectAudit = {
  status: AuditStatus
  filePath: string
  baseFilePath?: string
  missingProperties: string[]
  invalidProperties: string[]
}

export type ServiceMethod = {
  name: string
  parameters: string[]
}

export type ServiceAudit = {
  status: AuditStatus
  filePath: string
  expectedMethods: ServiceMethod[]
  missingMethods: ServiceMethod[]
}

export type TableMapping = {
  schema: string
  tableName: string
  kind: TableKind
  role: ObjectRole
  objectName: string | null
  baseObjectName: string | null
  serviceName: string | null
  columns: ColumnMapping[]
  hasJoinPayload: boolean
  hasHistory: boolean
  hasActive: boolean
  hasPersonId: boolean
  bridgePartners: BridgePartner[]
  bridgeIncoming: BridgeIncoming[]
  notes: string
  canGenerate: boolean
  canReplace: boolean
  enumValues?: string[]
  enumAudit?: EnumAudit
  objectAudit?: ObjectAudit
  serviceAudit?: ServiceAudit
}

export type SolutionLoadResult = {
  cancelled?: boolean
  error?: string
  solutionPath?: string
  solutionName?: string
  namespace?: string
  mainProject?: SolutionProject
  businessProject?: SolutionProject
  projects?: SolutionProject[]
  connectionString?: string
  connectionSource?: ConnectionSource
  lookedIn?: string[]
  tables?: TableMapping[]
  schemaError?: string
  generatorConfig?: GeneratorConfig
  generatorConfigPath?: string
  controllers?: string[]
  spaModels?: string[]
}
