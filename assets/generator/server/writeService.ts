import type { SolutionLoadResult } from '../shared/types.ts'
import { generateTables } from './generateTable.ts'

export async function writeServices(
  solutionPath: string,
  serviceNames: string[],
  overwrite = false,
): Promise<SolutionLoadResult> {
  return generateTables(solutionPath, serviceNames, overwrite ? 'replace' : 'generate')
}
