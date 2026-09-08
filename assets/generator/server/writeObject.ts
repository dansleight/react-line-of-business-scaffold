import type { SolutionLoadResult } from '../shared/types.ts'
import { generateTables } from './generateTable.ts'

export async function writeObjects(
  solutionPath: string,
  objectNames: string[],
  overwrite = false,
): Promise<SolutionLoadResult> {
  return generateTables(
    solutionPath,
    objectNames,
    overwrite ? 'replace' : 'generate',
  )
}
