import { access, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type {
  ConnectionSource,
  ConnectionSourceKind,
  SolutionProject,
} from '../shared/types.ts'

type ConnectionSearchResult = {
  connectionString?: string
  connectionSource?: ConnectionSource
  lookedIn: string[]
}

const SETTINGS_LAYERS: { fileName: string; kind: ConnectionSourceKind }[] = [
  { fileName: 'appsettings.json', kind: 'appsettings.json' },
  {
    fileName: 'appsettings.Development.json',
    kind: 'appsettings.Development.json',
  },
]

export async function findDefaultConnection(
  projects: SolutionProject[],
  solutionPath: string,
  preferred?: SolutionProject,
): Promise<ConnectionSearchResult> {
  const lookedIn: string[] = []

  if (preferred) {
    const found = await readProjectConnection(preferred, lookedIn)
    if (found) return { ...found, lookedIn }
  }

  const ranked = await rankProjects(projects, solutionPath)

  for (const project of ranked) {
    if (preferred && project.path === preferred.path) continue
    const found = await readProjectConnection(project, lookedIn)
    if (found) return { ...found, lookedIn }
  }

  return { lookedIn }
}

async function rankProjects(
  projects: SolutionProject[],
  solutionPath: string,
): Promise<SolutionProject[]> {
  const solutionDir = path.dirname(solutionPath)
  const solutionBase = path.basename(solutionPath, path.extname(solutionPath))
  const candidates = [...projects]

  const conventionDir = path.join(solutionDir, solutionBase)
  const conventionProj = path.join(conventionDir, `${solutionBase}.csproj`)
  const alreadyListed = candidates.some(
    (project) => path.resolve(project.path) === path.resolve(conventionProj),
  )

  if (!alreadyListed && (await fileExists(conventionProj))) {
    candidates.push({ name: solutionBase, path: conventionProj })
  }

  const scored = await Promise.all(
    candidates.map(async (project) => ({
      project,
      score: await scoreProject(project, solutionBase),
    })),
  )

  scored.sort((a, b) => b.score - a.score)
  return scored.map((entry) => entry.project)
}

async function scoreProject(
  project: SolutionProject,
  solutionBase: string,
): Promise<number> {
  const projectBase = path.basename(project.path, path.extname(project.path))
  const projectDir = path.dirname(project.path)
  const folderName = path.basename(projectDir)
  let score = 0

  if (equalsIgnoreCase(projectBase, solutionBase)) score += 10
  if (equalsIgnoreCase(folderName, solutionBase)) score += 8
  if (equalsIgnoreCase(project.name, solutionBase)) score += 6
  if (await fileExists(path.join(projectDir, 'appsettings.json'))) score += 5
  if (await fileExists(path.join(projectDir, 'appsettings.Development.json'))) {
    score += 5
  }
  if (await fileExists(path.join(projectDir, 'Program.cs'))) score += 2

  return score
}

async function readProjectConnection(
  project: SolutionProject,
  lookedIn: string[],
): Promise<Omit<ConnectionSearchResult, 'lookedIn'> | undefined> {
  const projectDir = path.dirname(project.path)
  let connectionString: string | undefined
  let connectionSource: ConnectionSource | undefined

  for (const layer of SETTINGS_LAYERS) {
    const settingsPath = path.join(projectDir, layer.fileName)
    lookedIn.push(settingsPath)
    const fromFile = await readConnectionFromJsonFile(settingsPath)
    if (fromFile) {
      connectionString = fromFile
      connectionSource = {
        projectName: project.name,
        projectPath: project.path,
        sourceFile: settingsPath,
        sourceKind: layer.kind,
      }
    }
  }

  const secretsId = await readUserSecretsId(project.path)
  if (secretsId) {
    const secretsPath = userSecretsPath(secretsId)
    lookedIn.push(secretsPath)
    const fromSecrets = await readConnectionFromJsonFile(secretsPath)
    if (fromSecrets) {
      connectionString = fromSecrets
      connectionSource = {
        projectName: project.name,
        projectPath: project.path,
        sourceFile: secretsPath,
        sourceKind: 'user secrets',
      }
    }
  }

  if (!connectionString || !connectionSource) return undefined
  return { connectionString, connectionSource }
}

async function readUserSecretsId(
  projectPath: string,
): Promise<string | undefined> {
  if (!(await fileExists(projectPath))) return undefined

  const csproj = await readFile(projectPath, 'utf8')
  const match = csproj.match(
    /<UserSecretsId>\s*([^<]+?)\s*<\/UserSecretsId>/i,
  )
  const secretsId = match?.[1]?.trim()
  return secretsId && secretsId.length > 0 ? secretsId : undefined
}

function userSecretsPath(secretsId: string): string {
  if (process.platform === 'win32') {
    const appData =
      process.env.APPDATA ?? path.join(os.homedir(), 'AppData', 'Roaming')
    return path.join(
      appData,
      'Microsoft',
      'UserSecrets',
      secretsId,
      'secrets.json',
    )
  }

  return path.join(
    os.homedir(),
    '.microsoft',
    'usersecrets',
    secretsId,
    'secrets.json',
  )
}

async function readConnectionFromJsonFile(
  filePath: string,
): Promise<string | undefined> {
  if (!(await fileExists(filePath))) return undefined

  try {
    const parsed = parseJsonLoose(await readFile(filePath, 'utf8'))
    return extractDefaultConnection(parsed)
  } catch {
    return undefined
  }
}

function extractDefaultConnection(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined

  const record = value as Record<string, unknown>
  const nested = record.ConnectionStrings
  if (nested && typeof nested === 'object') {
    const fromNested = (nested as Record<string, unknown>).DefaultConnection
    if (typeof fromNested === 'string' && fromNested.trim().length > 0) {
      return fromNested
    }
  }

  const flattened = record['ConnectionStrings:DefaultConnection']
  if (typeof flattened === 'string' && flattened.trim().length > 0) {
    return flattened
  }

  return undefined
}

function parseJsonLoose(text: string): unknown {
  const withoutBom = text.replace(/^\uFEFF/, '')
  try {
    return JSON.parse(withoutBom)
  } catch {
    const withoutComments = withoutBom
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1')
    try {
      return JSON.parse(withoutComments)
    } catch {
      return JSON.parse(withoutComments.replace(/,\s*([}\]])/g, '$1'))
    }
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

function equalsIgnoreCase(left: string, right: string): boolean {
  return left.localeCompare(right, undefined, { sensitivity: 'accent' }) === 0
}
