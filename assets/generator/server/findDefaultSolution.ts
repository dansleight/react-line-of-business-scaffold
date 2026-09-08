import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const SOLUTION_EXTENSIONS = new Set([".sln", ".slnx"]);

export async function findDefaultSolution(
  cwd: string = process.cwd(),
): Promise<string | undefined> {
  return findSolutionInDirectory(path.resolve(cwd, "../../src"));
}

export async function resolveSolutionPath(
  input?: string,
  cwd: string = process.cwd(),
): Promise<string | undefined> {
  if (input && input.trim()) {
    const resolved = path.resolve(cwd, input.trim());
    try {
      const info = await stat(resolved);
      if (info.isFile() && isSolutionFile(resolved)) return resolved;
      if (info.isDirectory()) {
        const found = await findSolutionInDirectory(resolved);
        if (found) return found;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  return findDefaultSolution(cwd);
}

async function findSolutionInDirectory(
  directory: string,
): Promise<string | undefined> {
  let entries: string[];
  try {
    entries = await readdir(directory);
  } catch {
    return undefined;
  }

  const matches = entries
    .filter((name) => isSolutionFile(name))
    .map((name) => path.join(directory, name))
    .sort((left, right) => left.localeCompare(right));

  return matches[0];
}

function isSolutionFile(filePath: string): boolean {
  return SOLUTION_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}
