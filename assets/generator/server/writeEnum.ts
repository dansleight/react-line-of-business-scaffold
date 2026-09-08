import { equalsIgnoreCase, uniqueNames } from '../shared/conventions.ts'
import type { SolutionLoadResult, TableMapping } from '../shared/types.ts'
import { enumFilePath, writeEnumFile } from './auditEnums.ts'
import { loadSolution } from './loadSolution.ts'
import { projectFolders } from './projectPaths.ts'

export async function writeEnum(
  solutionPath: string,
  enumName: string,
): Promise<SolutionLoadResult> {
  return writeEnums(solutionPath, [enumName])
}

export async function writeEnums(
  solutionPath: string,
  enumNames: string[],
): Promise<SolutionLoadResult> {
  const names = uniqueNames(enumNames)
  if (names.length === 0) {
    return { error: 'At least one enum name is required.' }
  }

  const loaded = await loadSolution(solutionPath)
  if (!loaded.namespace) {
    return {
      ...loaded,
      error: loaded.error ?? 'Unable to determine the project namespace.',
    }
  }

  const folders = projectFolders(loaded)
  if (!folders) {
    return {
      ...loaded,
      error: 'Could not determine the Business Enums folder.',
    }
  }

  const missing: string[] = []
  for (const enumName of names) {
    const table = findEnumTable(loaded.tables ?? [], enumName)
    if (!table || !table.objectName) {
      missing.push(enumName)
      continue
    }

    const filePath =
      table.enumAudit?.filePath ??
      enumFilePath(folders.enumsFolder, table.objectName)
    await writeEnumFile(
      filePath,
      loaded.namespace,
      table.objectName,
      table.enumValues ?? [],
    )
  }

  if (missing.length === names.length) {
    return {
      ...loaded,
      error: `Enum${missing.length === 1 ? '' : 's'} ${missing.join(', ')} not found in the database schema.`,
    }
  }

  const reloaded = await loadSolution(solutionPath)
  if (missing.length > 0) {
    return {
      ...reloaded,
      error: `Wrote enums, but ${missing.join(', ')} ${missing.length === 1 ? 'was' : 'were'} not found in the database schema.`,
    }
  }
  return reloaded
}

export async function fixEnums(solutionPath: string): Promise<SolutionLoadResult> {
  const loaded = await loadSolution(solutionPath)
  const names = (loaded.tables ?? [])
    .filter(enumNeedsFix)
    .map((table) => table.objectName!)

  if (names.length === 0) return loaded
  return writeEnums(solutionPath, names)
}

function enumNeedsFix(table: TableMapping): boolean {
  if (table.kind !== 'enum' || !table.objectName) return false
  const status = table.enumAudit?.status ?? 'missing'
  if (status === 'missing') return true
  return (table.enumAudit?.missingValues.length ?? 0) > 0
}

function findEnumTable(
  tables: TableMapping[],
  enumName: string,
): TableMapping | undefined {
  return tables.find(
    (entry) =>
      entry.kind === 'enum' &&
      (equalsIgnoreCase(entry.objectName ?? '', enumName) ||
        equalsIgnoreCase(entry.tableName, enumName)),
  )
}
