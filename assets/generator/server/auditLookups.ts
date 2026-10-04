import { access, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import {
  eligibleLookupTables,
  lookupTypeName,
  lookupTypeValues,
} from '../shared/conventions.ts'
import type {
  EnumAudit,
  LookupControllerAudit,
  TableMapping,
} from '../shared/types.ts'
import { auditEnumFile, enumFilePath } from './auditEnums.ts'

export function lookupTypeFilePath(enumsFolder: string): string {
  return enumFilePath(enumsFolder, 'LookupType')
}

export function lookupControllerFilePath(controllersFolder: string): string {
  return path.join(controllersFolder, 'LookupController.cs')
}

export async function auditLookupTypeFile(
  enumsFolder: string,
  tables: TableMapping[],
): Promise<EnumAudit> {
  return auditEnumFile(
    lookupTypeFilePath(enumsFolder),
    'LookupType',
    lookupTypeValues(tables),
  )
}

export async function auditLookupControllerFile(
  controllersFolder: string,
  tables: TableMapping[],
): Promise<LookupControllerAudit> {
  const filePath = lookupControllerFilePath(controllersFolder)
  const expectedTypes = eligibleLookupTables(tables).map((table) =>
    lookupTypeName(table),
  )

  if (!(await fileExists(filePath))) {
    return {
      status: 'missing',
      filePath,
      expectedTypes,
      missingTypes: [...expectedTypes],
      extraTypes: [],
    }
  }

  const source = await readFile(filePath, 'utf8')
  const actualTypes = extractLookupTypeCases(source)
  const expected = new Set(expectedTypes)
  const actual = new Set(actualTypes)
  const missingTypes = expectedTypes.filter((name) => !actual.has(name))
  const extraTypes = actualTypes.filter(
    (name) => name !== 'Unknown' && !expected.has(name),
  )
  const hasAll = /\bAll\s*\(\s*\)/.test(source)
  const hasType = /\bType\s*\(\s*LookupType\b/.test(source)

  return {
    status:
      missingTypes.length === 0 && extraTypes.length === 0 && hasAll && hasType
        ? 'correct'
        : 'inaccurate',
    filePath,
    expectedTypes,
    missingTypes,
    extraTypes,
  }
}

export function extractLookupTypeCases(source: string): string[] {
  const values: string[] = []
  const seen = new Set<string>()
  for (const match of source.matchAll(/case\s+LookupType\.(\w+)\s*:/g)) {
    const name = match[1]
    if (!name || seen.has(name)) continue
    seen.add(name)
    values.push(name)
  }
  return values
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}
