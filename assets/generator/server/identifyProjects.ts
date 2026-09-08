import { access, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import type { SolutionProject } from '../shared/types.ts'

export type IdentifiedProjects = {
  namespace: string
  mainProject?: SolutionProject
  businessProject?: SolutionProject
}

export async function identifyProjects(
  projects: SolutionProject[],
  solutionPath: string,
): Promise<IdentifiedProjects> {
  const solutionBase = path.basename(solutionPath, path.extname(solutionPath))
  const mainProject =
    projects.find(
      (project) =>
        !isLayerProject(project) && namesMatch(project, solutionBase),
    ) ??
    projects.find(
      (project) => !isLayerProject(project) && !project.name.includes('.'),
    )

  const namespaceFromProgram = mainProject
    ? await readNamespace(mainProject)
    : undefined
  const namespace = namespaceFromProgram ?? mainProject?.name ?? solutionBase
  const businessName = `${mainProject?.name ?? namespace}.Business`
  const businessProject = projects.find((project) =>
    namesMatch(project, businessName),
  )

  return { namespace, mainProject, businessProject }
}

function isLayerProject(project: SolutionProject): boolean {
  return (
    /\.(Business|Helper)$/i.test(project.name) ||
    /\.(Business|Helper)$/i.test(
      path.basename(project.path, path.extname(project.path)),
    )
  )
}

function namesMatch(project: SolutionProject, expected: string): boolean {
  const projectFile = path.basename(project.path, path.extname(project.path))
  const folder = path.basename(path.dirname(project.path))
  return (
    equalsIgnoreCase(project.name, expected) ||
    equalsIgnoreCase(projectFile, expected) ||
    equalsIgnoreCase(folder, expected)
  )
}

async function readNamespace(
  project: SolutionProject,
): Promise<string | undefined> {
  const programPath = path.join(path.dirname(project.path), 'Program.cs')
  if (!(await fileExists(programPath))) return undefined

  const text = await readFile(programPath, 'utf8')
  const match = text.match(/namespace\s+([A-Za-z_][\w.]*)/)
  const namespace = match?.[1]?.trim()
  return namespace && namespace.length > 0 ? namespace : undefined
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

function equalsIgnoreCase(left: string, right: string): boolean {
  return left.localeCompare(right, undefined, { sensitivity: 'accent' }) === 0
}
