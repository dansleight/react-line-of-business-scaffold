#!/usr/bin/env tsx

/**
 * Strip Theme Lab from a generated SPA.
 *
 * Deletes `src/pages/samples/`, drops `/samples` routes, removes the Theme Lab
 * nav item, and trims Theme Lab copy from this folder's README. Product kits
 * (forms, grids, icons, toasts) stay.
 *
 * Run from spa-src: `pnpm remove-lab`
 */

import { access, readFile, rm, writeFile } from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const SAMPLES_DIR = path.join(ROOT, "src/pages/samples");
const ROUTES_FILE = path.join(ROOT, "src/routes.tsx");
const MENUS_FILE = path.join(ROOT, "src/menusConfig.ts");
const README_FILE = path.join(ROOT, "README.md");

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function matchingBracket(
  source: string,
  openIndex: number,
  openChar: string,
  closeChar: string,
): number {
  let depth = 0;
  for (let i = openIndex; i < source.length; i++) {
    const char = source[i];
    if (char === openChar) depth += 1;
    else if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error(`Unbalanced ${openChar}${closeChar} starting at ${openIndex}`);
}

function stripSampleImports(source: string): string {
  return source.replace(
    /^import(?:\s+type)?\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+["']\.\/pages\/samples\/[^"']+["'];\r?\n/gm,
    "",
  );
}

function stripSampleRoutes(source: string): string {
  const marker = "export const routes";
  const markerAt = source.indexOf(marker);
  if (markerAt < 0) return source;
  const eq = source.indexOf("=", markerAt);
  if (eq < 0) return source;
  const arrayStart = source.indexOf("[", eq);
  if (arrayStart < 0) return source;
  const arrayEnd = matchingBracket(source, arrayStart, "[", "]");
  const inner = source.slice(arrayStart + 1, arrayEnd);

  const kept: string[] = [];
  let i = 0;
  while (i < inner.length) {
    while (i < inner.length && /\s/.test(inner[i])) i += 1;
    if (i >= inner.length) break;
    if (inner[i] !== "{") {
      i += 1;
      continue;
    }
    const end = matchingBracket(inner, i, "{", "}");
    const object = inner.slice(i, end + 1);
    if (!/path:\s*["']\/samples(?:\/|$)/.test(object)) kept.push(object);
    i = end + 1;
    while (i < inner.length && /\s/.test(inner[i])) i += 1;
    if (inner[i] === ",") i += 1;
  }

  const rebuilt =
    kept.length === 0 ? "\n" : `\n  ${kept.join(",\n  ")},\n`;
  return source.slice(0, arrayStart + 1) + rebuilt + source.slice(arrayEnd);
}

function stripNamedImport(source: string, name: string): string {
  const ident = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source
    .replace(new RegExp(`\\s*${ident},\\r?\\n`), "\n")
    .replace(new RegExp(`,\\s*${ident}(?=[\\s}\\n])`), "");
}

function stripConstBlock(source: string, name: string): string {
  const match = source.match(
    new RegExp(`const\\s+${name}\\s*:\\s*\\w+\\s*=\\s*`),
  );
  if (!match || match.index == null) return source;
  const braceAt = source.indexOf("{", match.index);
  if (braceAt < 0) return source;
  const braceEnd = matchingBracket(source, braceAt, "{", "}");
  let finish = braceEnd + 1;
  if (source[finish] === ";") finish += 1;
  while (source[finish] === "\r" || source[finish] === "\n") finish += 1;
  let start = match.index;
  if (start > 0 && source[start - 1] === "\n") start -= 1;
  return source.slice(0, start) + "\n" + source.slice(finish);
}

function stripIdentifierFromArray(source: string, name: string): string {
  return source
    .replace(new RegExp(`,\\s*${name}\\b`), "")
    .replace(new RegExp(`\\b${name}\\s*,\\s*`), "");
}

function collapseBlankLines(source: string): string {
  return source.replace(/\n{3,}/g, "\n\n").replace(/\s+$/g, "\n");
}

function stripReadmeLabCopy(source: string): string {
  return source
    .replace(
      /\*\*Theme Lab\*\* \(`\/samples\/gallery`\)[\s\S]*?\n\n/,
      "",
    )
    .replace(/\s*Theme Lab → Data Grid has live examples\./, "")
    .replace(/\s*Theme Lab → Dialogs has fire buttons\./, "")
    .replace(
      /\nTheme Lab pages live in `src\/pages\/samples\/`[\s\S]*?\n/,
      "\n",
    )
    .replace(
      /\n`pnpm remove-lab` deletes Theme Lab[\s\S]*?\n/,
      "\n",
    );
}

async function main() {
  if (!(await exists(ROUTES_FILE)) || !(await exists(MENUS_FILE))) {
    console.error(
      "Run this from spa-src (needs src/routes.tsx and src/menusConfig.ts).",
    );
    process.exit(1);
  }

  const changed: string[] = [];

  if (await exists(SAMPLES_DIR)) {
    await rm(SAMPLES_DIR, { recursive: true, force: true });
    changed.push("deleted src/pages/samples/");
  }

  const routesBefore = await readFile(ROUTES_FILE, "utf-8");
  const routesAfter = collapseBlankLines(
    stripSampleRoutes(stripSampleImports(routesBefore)),
  );
  if (routesAfter !== routesBefore) {
    await writeFile(ROUTES_FILE, routesAfter);
    changed.push("updated src/routes.tsx");
  }

  const menusBefore = await readFile(MENUS_FILE, "utf-8");
  let menusAfter = stripConstBlock(menusBefore, "themeLab");
  menusAfter = stripIdentifierFromArray(menusAfter, "themeLab");
  if (!/\bfaPalette\b/.test(menusAfter.replace(/import\s*\{[\s\S]*?\}/, ""))) {
    menusAfter = stripNamedImport(menusAfter, "faPalette");
  }
  menusAfter = collapseBlankLines(menusAfter);
  if (menusAfter !== menusBefore) {
    await writeFile(MENUS_FILE, menusAfter);
    changed.push("updated src/menusConfig.ts");
  }

  if (await exists(README_FILE)) {
    const readmeBefore = await readFile(README_FILE, "utf-8");
    const readmeAfter = collapseBlankLines(stripReadmeLabCopy(readmeBefore));
    if (readmeAfter !== readmeBefore) {
      await writeFile(README_FILE, readmeAfter);
      changed.push("updated README.md");
    }
  }

  if (changed.length === 0) {
    console.log("Theme Lab is already removed.");
    return;
  }

  for (const line of changed) console.log(`✓ ${line}`);
  console.log("Theme Lab removed. Form kit, data grid, icons, and toasts remain.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
