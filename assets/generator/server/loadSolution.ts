import { access, readdir } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import type { SolutionLoadResult } from '../shared/types.ts'
import { findDefaultConnection } from './findConnectionString.ts'
import { loadOrCreateGeneratorConfig } from './generatorConfig.ts'
import { identifyProjects } from './identifyProjects.ts'
import { parseSolutionFile } from './parseSolution.ts'
import { projectFolders, webApiFolders } from './projectPaths.ts'
import { readSchema } from './readSchema.ts'

const SOLUTION_EXTENSIONS = new Set(['.sln', '.slnx'])

export async function loadSolution(
  solutionPath: string,
): Promise<SolutionLoadResult> {
  const resolved = path.resolve(solutionPath)
  const extension = path.extname(resolved).toLowerCase()

  if (!SOLUTION_EXTENSIONS.has(extension)) {
    return {
      error: 'Please choose a .sln or .slnx file.',
      solutionPath: resolved,
    }
  }

  if (!(await fileExists(resolved))) {
    return {
      error: `Solution file not found: ${resolved}`,
      solutionPath: resolved,
    }
  }

  const projects = await parseSolutionFile(resolved)
  const identified = await identifyProjects(projects, resolved)
  const connection = await findDefaultConnection(
    projects,
    resolved,
    identified.mainProject,
  )
  const solutionName = path.basename(resolved)

  const smokeError = smokeTestError(identified, connection.connectionString, projects.length)

  const plate = await loadOrCreateGeneratorConfig(resolved)
  const folders = projectFolders({
    businessProject: identified.businessProject,
    namespace: identified.namespace,
    solutionPath: resolved,
  })

  const result: SolutionLoadResult = {
    solutionPath: resolved,
    solutionName,
    namespace: identified.namespace,
    mainProject: identified.mainProject,
    businessProject: identified.businessProject,
    projects,
    connectionString: connection.connectionString,
    connectionSource: connection.connectionSource,
    lookedIn: connection.lookedIn,
    generatorConfig: plate.config,
    generatorConfigPath: plate.path,
    error: smokeError,
  }

  const apiFolders = webApiFolders({ mainProject: identified.mainProject })
  if (apiFolders) {
    result.controllers = await listCsharpNames(apiFolders.controllersFolder)
    result.spaModels = await listCsharpNames(apiFolders.spaModelsFolder)
  }

  if (!connection.connectionString) {
    return result
  }

  try {
    result.tables = await readSchema({
      connectionString: connection.connectionString,
      generatorConfig: plate.config,
      enumsFolder: folders?.enumsFolder,
      modelsFolder: folders?.modelsFolder,
      servicesFolder: folders?.servicesFolder,
    })
  } catch (error) {
    result.schemaError =
      error instanceof Error
        ? error.message
        : 'Failed to read the database schema.'
  }

  return result
}

function smokeTestError(
  identified: {
    namespace?: string
    mainProject?: { name: string }
    businessProject?: { name: string }
  },
  connectionString: string | undefined,
  projectCount: number,
): string | undefined {
  if (projectCount === 0) {
    return 'No C# / F# / VB projects were found in this solution.'
  }
  if (!identified.mainProject) {
    return 'Unable to find a WebAPI project (a project with Program.cs) in this solution.'
  }
  if (!identified.businessProject) {
    const expected = identified.namespace
      ? `${identified.namespace}.Business`
      : '{namespace}.Business'
    return `Unable to find the ${expected} project.`
  }
  if (!connectionString) {
    return 'Unable to determine the DefaultConnection string. Looked in appsettings.json, appsettings.Development.json, and user secrets for the projects in this solution.'
  }
  return undefined
}

async function listCsharpNames(folder: string): Promise<string[]> {
  try {
    const entries = await readdir(folder)
    return entries
      .filter((name) => name.toLowerCase().endsWith('.cs'))
      .map((name) => name.slice(0, -3))
      .sort((left, right) => left.localeCompare(right))
  } catch {
    return []
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}
