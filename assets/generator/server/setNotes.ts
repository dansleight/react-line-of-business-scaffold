import type { SolutionLoadResult } from '../shared/types.ts'
import {
  applyTableNotes,
  loadOrCreateGeneratorConfig,
  writeGeneratorConfig,
} from './generatorConfig.ts'
import { loadSolution } from './loadSolution.ts'

export async function setTableNotes(
  solutionPath: string,
  tableName: string,
  notes: string,
): Promise<SolutionLoadResult> {
  const config = await loadOrCreateGeneratorConfig(solutionPath)
  await writeGeneratorConfig(
    config.path,
    applyTableNotes(config.config, tableName, notes),
  )
  return loadSolution(solutionPath)
}
