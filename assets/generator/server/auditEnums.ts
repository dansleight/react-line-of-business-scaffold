import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { collapseExcessBlankLines } from './sourceFormat.ts'
import { constants } from 'node:fs'
import path from 'node:path'
import type { EnumAudit, TableMapping } from '../shared/types.ts'

export function enumFilePath(enumsFolder: string, enumName: string): string {
  return path.join(enumsFolder, `${enumName}.cs`)
}

export async function auditEnumTables(
  tables: TableMapping[],
  enumsFolder: string,
): Promise<void> {
  for (const table of tables) {
    if (table.kind !== 'enum' || !table.objectName) continue
    table.enumAudit = await auditEnumFile(
      enumFilePath(enumsFolder, table.objectName),
      table.objectName,
      table.enumValues ?? [],
    )
  }
}

export async function auditEnumFile(
  filePath: string,
  enumName: string,
  expectedValues: string[],
): Promise<EnumAudit> {
  if (!(await fileExists(filePath))) {
    return {
      status: 'missing',
      filePath,
      expectedValues,
      missingValues: [...expectedValues],
      extraValues: [],
    }
  }

  const source = await readFile(filePath, 'utf8')
  const actualValues = extractEnumValues(source, enumName)
  if (!actualValues) {
    return {
      status: 'inaccurate',
      filePath,
      expectedValues,
      missingValues: [...expectedValues],
      extraValues: [],
    }
  }

  const expected = new Set(expectedValues)
  const actual = new Set(actualValues)
  const missingValues = expectedValues.filter((value) => !actual.has(value))
  const extraValues = actualValues.filter((value) => !expected.has(value))
  const status = missingValues.length === 0 ? 'correct' : 'inaccurate'

  return {
    status,
    filePath,
    expectedValues,
    actualValues,
    missingValues,
    extraValues,
  }
}

export function extractEnumValues(
  fileContent: string,
  enumName: string,
): string[] | undefined {
  const pattern = new RegExp(`enum\\s+${enumName}\\s*\\{([\\s\\S]*?)\\}`)
  const match = fileContent.match(pattern)
  if (!match) return undefined

  const values: string[] = []
  for (const raw of match[1].split(/[,\n\r]/)) {
    const line = raw.replace(/\/\/.*$/, '').trim()
    if (!line) continue
    const identifier = line.split('=')[0]?.trim()
    if (identifier) values.push(identifier)
  }
  return values
}

export function renderEnumFile(
  nameSpace: string,
  enumName: string,
  values: string[],
): string {
  const body = values.map((value) => `    ${value}`).join(',\n')
  return collapseExcessBlankLines(
    `namespace ${nameSpace}.Business;\n\npublic enum ${enumName}\n{\n${body}\n}\n`,
  )
}

export function upsertEnumInSource(
  source: string | undefined,
  nameSpace: string,
  enumName: string,
  values: string[],
): string {
  const rendered = renderEnumFile(nameSpace, enumName, values)
  if (!source) return rendered

  const actual = extractEnumValues(source, enumName)
  const pattern = new RegExp(`(enum\\s+${enumName}\\s*\\{)[\\s\\S]*?(\\})`)
  if (!actual || !pattern.test(source)) return rendered

  const have = new Set(actual)
  const merged = [...actual]
  for (const value of values) {
    if (!have.has(value)) merged.push(value)
  }
  const body = merged.map((value) => `    ${value}`).join(',\n')
  return collapseExcessBlankLines(source.replace(pattern, `$1\n${body}\n$2`))
}

export async function writeEnumFile(
  filePath: string,
  nameSpace: string,
  enumName: string,
  values: string[],
): Promise<void> {
  let existing: string | undefined
  try {
    existing = await readFile(filePath, 'utf8')
  } catch {
    existing = undefined
  }

  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(
    filePath,
    upsertEnumInSource(existing, nameSpace, enumName, values),
    'utf8',
  )
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}
