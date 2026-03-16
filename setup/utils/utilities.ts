#!/usr/bin/env tsx

import fs from "fs/promises";
import { createHash } from "crypto";
import path from "path";

// Stable GUID generator
export function generateGuid(seed: string): string {
  const hash = createHash("md5").update(seed).digest("hex");
  return `${hash.substr(0, 8)}-${hash.substr(8, 4)}-${hash.substr(
    12,
    4,
  )}-${hash.substr(16, 4)}-${hash.substr(20, 12)}`.toUpperCase();
}

export async function safeRename(
  oldPath: string,
  newPath: string,
  description: string,
) {
  for (let i = 1; i <= 5; i++) {
    try {
      await fs.rename(oldPath, newPath);
      // console.log(`${description} renamed successfully`);
      return;
    } catch (err: any) {
      if ((err.code === "EPERM" || err.code === "EBUSY") && i < 5) {
        console.log(
          `   Retrying ${description} (${i}/5)... (Windows file lock)`,
        );
        await new Promise((r) => setTimeout(r, 1200));
        continue;
      }
      console.error(`Failed to rename ${description}:`, err.message);
      console.error("\nTip: Close any programs using the folder:");
      console.error("   • VS Code (fully close it)");
      console.error("   • Stop 'dotnet watch run'");
      console.error("   • Close File Explorer tabs");
      process.exit(1);
    }
  }
}

export async function recursiveRenameContaining(
  baseDir: string,
  oldName: string,
  newName: string,
) {
  const items = await fs.readdir(baseDir, { withFileTypes: true });

  // First: rename FILES (top-down)
  for (const item of items) {
    if (!item.isDirectory()) {
      const oldPath = path.join(baseDir, item.name);
      if (item.name.includes(oldName)) {
        const newFileName = item.name.replace(oldName, newName);
        const newPath = path.join(baseDir, newFileName);
        await safeRename(
          oldPath,
          newPath,
          `File: ${item.name} → ${newFileName}`,
        );
      }
    }
  }

  // Then: recurse into subdirectories
  for (const item of items) {
    if (item.isDirectory()) {
      const dirPath = path.join(baseDir, item.name);
      await recursiveRenameContaining(dirPath, oldName, newName);
    }
  }

  // Finally: rename the current directory itself (bottom-up)
  if (path.basename(baseDir).includes(oldName)) {
    const newDirName = path.basename(baseDir).replace(oldName, newName);
    const newDirPath = path.join(path.dirname(baseDir), newDirName);
    if (baseDir !== newDirPath) {
      await safeRename(
        baseDir,
        newDirPath,
        `Folder: ${path.basename(baseDir)} → ${newDirName}`,
      );
    }
  }
}

// Simple template string replacer (supports ${apiPort}, ${spaPort}, etc.)
export function interpolate(str: string, vars: Record<string, any>): string {
  return str.replace(/\${([^}]+)}/g, (_, key) => String(vars[key] ?? ""));
}

// Safe file text replacement
export async function replaceInFile(
  projectRoot: string,
  filePath: string,
  search: string | RegExp,
  replacement: string,
) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const updated = content.replace(search, replacement);
    if (updated !== content) {
      await fs.writeFile(filePath, updated);
      // console.log(`Updated: ${path.relative(projectRoot, filePath)}`);
      return true;
    }
  } catch {
    // file doesn't exist or not readable → silently skip
  }
  return false;
}

// Remove matching lines + clean up empty/whitespace-only lines after
export async function removeFromFile(
  projectRoot: string,
  filePath: string,
  pattern: RegExp,
) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n");
    const filtered = lines.filter((line) => !pattern.test(line));

    // Remove any empty lines that were left behind (optional: only if they were adjacent to removed lines)
    const cleaned =
      filtered
        .join("\n")
        .replace(/\n\s*\n\s*\n/g, "\n\n") // collapse triple+ newlines
        .replace(/^\s*\n/gm, "") // remove leading blank lines per section
        .trim() + "\n";

    if (cleaned !== content) {
      await fs.writeFile(filePath, cleaned);
      // console.log(`Cleaned lines: ${path.relative(projectRoot, filePath)}`);
    }
  } catch {
    // ignore missing files
  }
}

export async function removePackageScripts(
  filePath: string,
  scriptsToRemove: string[],
) {
  let changed = false;
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const pkg = JSON.parse(raw);

    if (pkg.scripts && typeof pkg.scripts === "object") {
      for (const script of scriptsToRemove) {
        if (script in pkg.scripts) {
          delete pkg.scripts[script];
          // console.log(`Removed script: "${script}"`);
          changed = true;
        }
      }

      if (changed) {
        // Preserve formatting: 2-space indent, trailing newline
        await fs.writeFile(filePath, JSON.stringify(pkg, null, 2) + "\n");
        // console.log(`Updated package.json scripts`);
      }
    }
  } catch (err) {
    console.warn(
      `Could not update ${filePath}:`,
      err instanceof Error ? err.message : err,
    );
  }
}

export function splitByCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}
