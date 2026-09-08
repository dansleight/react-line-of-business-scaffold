import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { SolutionProject } from '../shared/types.ts'

const PROJECT_FILE_PATTERN = /\.(cs|fs|vb)proj$/i

export async function parseSolutionFile(
  solutionPath: string,
): Promise<SolutionProject[]> {
  const content = stripBom(await readFile(solutionPath, 'utf8'))
  const extension = path.extname(solutionPath).toLowerCase()

  if (extension === '.slnx') {
    return parseSlnx(solutionPath, content)
  }

  return parseSln(solutionPath, content)
}

function parseSln(solutionPath: string, content: string): SolutionProject[] {
  const solutionDir = path.dirname(solutionPath)
  const projects: SolutionProject[] = []
  const pattern =
    /^Project\("[^"]+"\)\s*=\s*"([^"]+)"\s*,\s*"([^"]+)"/gm

  for (const match of content.matchAll(pattern)) {
    const name = match[1]
    const relativePath = toPlatformPath(match[2])
    if (!PROJECT_FILE_PATTERN.test(relativePath)) continue

    projects.push({
      name,
      path: path.resolve(solutionDir, relativePath),
    })
  }

  return projects
}

function parseSlnx(solutionPath: string, content: string): SolutionProject[] {
  const solutionDir = path.dirname(solutionPath)
  const projects: SolutionProject[] = []
  const pattern = /<Project\b([^>]*)>/gi

  for (const match of content.matchAll(pattern)) {
    const attributes = match[1]
    const pathMatch = attributes.match(/\bPath\s*=\s*(?:"([^"]+)"|'([^']+)')/i)
    const relativePath = toPlatformPath(pathMatch?.[1] ?? pathMatch?.[2] ?? '')
    if (!relativePath || !PROJECT_FILE_PATTERN.test(relativePath)) continue

    projects.push({
      name: path.basename(relativePath, path.extname(relativePath)),
      path: path.resolve(solutionDir, relativePath),
    })
  }

  return projects
}

function toPlatformPath(value: string): string {
  return value.replace(/[\\/]/g, path.sep)
}

function stripBom(value: string): string {
  return value.replace(/^\uFEFF/, '')
}
