import { equalsIgnoreCase, uniqueNames } from '../shared/conventions.ts'
import type { SolutionLoadResult, TableMapping } from '../shared/types.ts'
import { isScaffoldedObject, writeObjectFiles } from './auditObjects.ts'
import { serviceFilePath, writeServiceFile } from './auditServices.ts'
import { loadSolution } from './loadSolution.ts'
import { projectFolders } from './projectPaths.ts'

export type GenerateMode = 'generate' | 'replace'

export async function generateTable(
  solutionPath: string,
  tableName: string,
  mode: GenerateMode,
): Promise<SolutionLoadResult> {
  return generateTables(solutionPath, [tableName], mode)
}

export async function generateTables(
  solutionPath: string,
  tableNames: string[],
  mode: GenerateMode,
): Promise<SolutionLoadResult> {
  const names = uniqueNames(tableNames)
  if (names.length === 0) {
    return { error: 'At least one table name is required.' }
  }

  const loaded = await loadSolution(solutionPath)
  if (loaded.error && !loaded.tables) return loaded
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
      error: 'Could not determine the Business project folders.',
    }
  }

  const overwrite = mode === 'replace'
  const missing: string[] = []
  let wrote = false

  for (const name of names) {
    const table = findGeneratableTable(loaded.tables ?? [], name)
    if (!table || !table.objectName || !table.serviceName) {
      missing.push(name)
      continue
    }

    const objectWrote = await writeObjectFiles(
      folders.modelsFolder,
      loaded.namespace,
      table,
      loaded.tables ?? [],
      overwrite,
    )
    const serviceWrote = await writeServiceFile(
      table.serviceAudit?.filePath ??
        serviceFilePath(folders.servicesFolder, table.serviceName),
      loaded.namespace,
      table,
      overwrite,
    )
    wrote = wrote || objectWrote || serviceWrote
  }

  if (missing.length === names.length) {
    return {
      ...loaded,
      error: `Table${missing.length === 1 ? '' : 's'} ${missing.join(', ')} not found among generatable objects.`,
    }
  }

  const reloaded = await loadSolution(solutionPath)
  if (missing.length > 0) {
    return {
      ...reloaded,
      error: `Wrote files, but ${missing.join(', ')} ${missing.length === 1 ? 'was' : 'were'} not found among generatable objects.`,
    }
  }
  if (!wrote && mode === 'generate') {
    return {
      ...reloaded,
      error: 'Nothing to generate. Use replace to overwrite existing files.',
    }
  }
  return reloaded
}

export function findGeneratableTable(
  tables: TableMapping[],
  name: string,
): TableMapping | undefined {
  return tables.find((entry) => {
    if (!isScaffoldedObject(entry)) return false
    return (
      equalsIgnoreCase(entry.tableName, name) ||
      (entry.objectName != null && equalsIgnoreCase(entry.objectName, name)) ||
      (entry.serviceName != null && equalsIgnoreCase(entry.serviceName, name))
    )
  })
}
