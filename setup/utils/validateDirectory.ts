import fs from "node:fs";
import path from "node:path";

/**
 * Validates (and creates if missing) a target directory given as a relative path.
 *
 * Returns `true` if:
 *   - The directory now exists (was created or already existed)
 *   - AND it is either completely empty OR contains **only** items that start with ".git"
 *     (typical .git folder + optionally .gitignore, .gitattributes, etc.)
 *
 * Returns `false` if:
 *   - The path points to an existing file (not a directory)
 *   - The directory contains any file/folder that does **not** start with ".git"
 *
 * @param relativePath e.g. "../../my-namespace" or "../projects/ns-xyz"
 * @returns boolean — whether the directory passes the "empty or git-only" check
 */
export function validateDirectory(relativePath: string): boolean {
  // Resolve to absolute path (makes everything safer & predictable)
  const absolutePath = path.resolve(process.cwd(), relativePath);

  // 1. Create if missing (recursive so ../../foo/bar works even if intermediates don't exist)
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
    return true; // brand new → empty → passes
  }

  // 2. Must be a directory (protect against someone putting a file there)
  const stat = fs.statSync(absolutePath);
  if (!stat.isDirectory()) {
    console.warn(`Path exists but is not a directory: ${absolutePath}`);
    return false;
  }

  // 3. Read contents
  const entries = fs.readdirSync(absolutePath);

  // Empty → good
  if (entries.length === 0) {
    return true;
  }

  // Only items starting with ".git" are allowed
  const hasOnlyGitStuff = entries.every((entry) => entry.startsWith(".git"));

  return hasOnlyGitStuff;
}
