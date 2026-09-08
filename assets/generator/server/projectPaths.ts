import path from 'node:path'
import type { SolutionLoadResult, SolutionProject } from '../shared/types.ts'

export type ProjectFolders = {
  root: string
  enumsFolder: string
  modelsFolder: string
  servicesFolder: string
}

export type WebApiFolders = {
  root: string
  controllersFolder: string
  spaModelsFolder: string
}

export function projectFolders(
  result: Pick<
    SolutionLoadResult,
    'businessProject' | 'namespace' | 'solutionPath'
  >,
): ProjectFolders | undefined {
  const root = businessRoot(result.businessProject, result.namespace, result.solutionPath)
  if (!root) return undefined
  return {
    root,
    enumsFolder: path.join(root, 'Enums'),
    modelsFolder: path.join(root, 'Models'),
    servicesFolder: path.join(root, 'Services'),
  }
}

export function webApiFolders(
  result: Pick<SolutionLoadResult, 'mainProject'>,
): WebApiFolders | undefined {
  if (!result.mainProject) return undefined
  const root = path.dirname(result.mainProject.path)
  return {
    root,
    controllersFolder: path.join(root, 'Controllers'),
    spaModelsFolder: path.join(root, 'SpaModels'),
  }
}

function businessRoot(
  businessProject?: SolutionProject,
  namespace?: string,
  solutionPath?: string,
): string | undefined {
  if (businessProject) return path.dirname(businessProject.path)
  if (namespace && solutionPath) {
    return path.join(path.dirname(solutionPath), `${namespace}.Business`)
  }
  return undefined
}
