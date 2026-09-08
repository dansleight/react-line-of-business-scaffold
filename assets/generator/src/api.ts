import type { SolutionLoadResult } from '../shared/types.ts'

export async function defaultSolution(): Promise<{
  path?: string
  missing?: boolean
}> {
  return postJson('/api/default-solution')
}

export async function selectSolution(): Promise<SolutionLoadResult> {
  return postJson('/api/select-solution')
}

export async function loadSolution(
  path: string,
): Promise<SolutionLoadResult> {
  return postJson('/api/load-solution', { path })
}

export async function writeEnums(
  path: string,
  enumNames: string[],
): Promise<SolutionLoadResult> {
  return postJson('/api/write-enum', { path, enumNames })
}

export async function fixEnums(path: string): Promise<SolutionLoadResult> {
  return postJson('/api/fix-enums', { path })
}

export async function generateTable(
  path: string,
  tableName: string,
): Promise<SolutionLoadResult> {
  return postJson('/api/generate', { path, tableName })
}

export async function replaceTable(
  path: string,
  tableName: string,
): Promise<SolutionLoadResult> {
  return postJson('/api/replace', { path, tableName })
}

export async function setPrimaryTable(
  path: string,
  tableName: string,
  primary: boolean,
): Promise<SolutionLoadResult> {
  return postJson('/api/set-primary-table', { path, tableName, primary })
}

export async function setTableNotes(
  path: string,
  tableName: string,
  notes: string,
): Promise<SolutionLoadResult> {
  return postJson('/api/set-notes', { path, tableName, notes })
}

export async function writeController(
  path: string,
  tableName: string,
  options: {
    controllerName?: string
    properties?: string[]
    methods?: string[]
    overwrite?: boolean
  } = {},
): Promise<SolutionLoadResult> {
  return postJson('/api/write-controller', {
    path,
    tableName,
    controllerName: options.controllerName,
    properties: options.properties,
    methods: options.methods,
    overwrite: options.overwrite,
  })
}

async function postJson<T>(
  url: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: body
      ? {
          'Content-Type': 'application/json',
        }
      : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = (await response.json()) as T & { error?: string }
  if (!response.ok && !payload.error) {
    return { error: `Request failed (${response.status})` } as T
  }

  return payload
}
