import { tableKind } from '../shared/conventions.ts'
import type { SolutionLoadResult } from '../shared/types.ts'
import {
  applyPrimaryTable,
  loadOrCreateGeneratorConfig,
  writeGeneratorConfig,
} from './generatorConfig.ts'
import { loadSolution } from './loadSolution.ts'

export async function setPrimaryTable(
  solutionPath: string,
  tableName: string,
  primary: boolean,
): Promise<SolutionLoadResult> {
  if (tableKind(tableName) !== 'data') {
    return {
      error: 'Only dat_ tables can be marked primary or secondary.',
    }
  }

  const config = await loadOrCreateGeneratorConfig(solutionPath)
  await writeGeneratorConfig(
    config.path,
    applyPrimaryTable(config.config, tableName, primary),
  )
  return loadSolution(solutionPath)
}
