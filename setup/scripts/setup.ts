#!/usr/bin/env tsx

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { glob } from "glob";
import {
  interpolate,
  replaceInFile,
  removeFromFile,
  removePackageScripts,
  splitByCase,
} from "../utils/utilities";
import { validateDirectory } from "../utils/validateDirectory";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

async function main() {
  console.clear();
  const set1 = await inquirer.prompt([
    {
      type: "list",
      name: "backend",
      message: "Which backend do you want to use?",
      choices: ["Python FastAPI", "C# WebAPI"],
    },
    {
      type: "input",
      name: "namespace",
      message: "What is the namespace for this project? (No spaces)",
      validate: (v) =>
        /^[a-zA-Z][a-zA-Z0-9.]*$/.test(v) || "Valid namespace required",
    },
  ]);
  const { backend, namespace: ns } = set1;
  const recport = 5000 + Math.floor(Math.random() * (92 - 13 + 1)) + 13;
  const propPath = path.resolve(`../../${ns}`);
  const propPathValid = validateDirectory(propPath);

  const set2 = await inquirer.prompt([
    {
      type: "input",
      name: "database",
      message: "Database name:",
      default: ns,
    },
    {
      type: "input",
      name: "title",
      message: "Application title:",
      default: splitByCase(ns),
      validate: (v) => v.trim().length > 0 || "Title is required",
    },
    {
      type: "number",
      name: "port",
      message: "Port for WebAPI (5000–5099):",
      default: recport,
      validate: (input) => {
        const n = Number(input);
        if (Number.isInteger(n) && n >= 5000 && n <= 5099) {
          return true;
        }
        return "Please enter a port number between 5000 and 5099";
      },
    },
    {
      type: "input",
      name: "path",
      message: "Repository Root:",
      default: propPathValid ? propPath : "",
      validate: (input) => {
        if (validateDirectory(input)) return true;
        return "The path you entered is not valid, please paste a path to a directory that is empty or is an empty repository.";
      },
    },
  ]);
  const { database, title, port, path: rootPath } = set2;

  const apiPort = Number(port);
  const spaPort = apiPort - 2000;
  const dbName = database.trim() || ns;
  const nslower = ns.toLowerCase();

  console.log(`\nConfiguration:`);
  console.log(`   Backend     : ${backend}`);
  console.log(`   Path        : ${rootPath}`);
  console.log(`   Namespace   : ${ns}`);
  console.log(`    -lower     : ${nslower}`);
  console.log(`   Database    : ${dbName}`);
  console.log(`   Title       : ${title}`);
  console.log(`   API Port    : ${apiPort}`);
  console.log(`   SPA Port    : ${spaPort}\n`);

  const cpargs = {
    recursive: true,
    force: true,
  };

  console.info("Copying files...");

  // src
  let src_from = path.resolve(PROJECT_ROOT, "src");
  if (backend == "Python FastAPI") {
    src_from = path.resolve(PROJECT_ROOT, "python-src");
  }
  const src_to = path.resolve(rootPath, "src");
  await fs.cp(src_from, src_to, cpargs);

  // spa-src
  await fs.rm(path.resolve(PROJECT_ROOT, "spa-src/node_modules"), {
    recursive: true,
    force: true,
  });
  await fs.cp(
    path.resolve(PROJECT_ROOT, "spa-src"),
    path.resolve(rootPath, "spa-src"),
    cpargs,
  );

  // assets
  await fs.cp(
    path.resolve(PROJECT_ROOT, "assets"),
    path.resolve(rootPath, "assets"),
    cpargs,
  );

  // Load config
  const config = JSON.parse(
    await fs.readFile(
      path.resolve(PROJECT_ROOT, "setup/fastapi/setup-config.json"),
      "utf-8",
    ),
  );

  // Run file operations from config (safe: only explicit paths)
  for (const step of config.steps) {
    // if (step.comment) console.log(`// ${step.comment}`);
    try {
      switch (step.action) {
        case "remove":
          for (const f of step.files || []) {
            const p = path.resolve(rootPath, f);
            await fs.rm(p, { recursive: true, force: true });
            // console.log(`Removed: ${f}`);
          }
          break;
        case "rename":
          const from = path.resolve(rootPath, step.target!);
          const to = path.resolve(rootPath, step.to!);
          await fs.rename(from, to);
          // console.log(
          //   `Renamed: ${step.target} → ${path.relative(rootPath, to)}`,
          // );
          break;
        case "copy":
          const copy_from = path.resolve(rootPath, step.from!);
          const copy_to = path.resolve(rootPath, step.to!);
          await fs.copyFile(copy_from, copy_to);
          // console.log(`Copied: ${step.from} → ${step.to}`);
          break;
        case "replace":
          const target = path.resolve(rootPath, step.target!);
          const source = path.resolve(rootPath, step.with!);
          await fs.copyFile(source, target);
          // console.log(`Replaced: ${step.target}`);
          break;
        case "replace-text": {
          const targets = Array.isArray(step.target)
            ? step.target
            : [step.target];
          const search = step.regex
            ? new RegExp(step.match, "g")
            : new RegExp(
                step.match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "g",
              );

          const replacement = interpolate(step.to, {
            apiPort,
            spaPort,
            ns,
            title,
            dbName,
            nslower,
          });

          for (const targetGlob of targets) {
            const matches = glob.sync(targetGlob, {
              cwd: rootPath,
              absolute: true,
              ignore: [
                "**/node_modules/**",
                "**/dist/**",
                "**/bin/**",
                "**/obj/**",
                "**/setup/**",
              ],
            });

            if (matches.length === 0) {
              // Optional: warn only if not using wildcards
              if (!targetGlob.includes("*") && !targetGlob.includes("**")) {
                console.log(`No files found for: ${targetGlob}`);
              }
              continue;
            }

            for (const file of matches) {
              await replaceInFile(rootPath, file, search, replacement);
            }
          }
          break;
        }
        case "remove-text": {
          const targetPath = path.resolve(rootPath, step.target);
          const regex = new RegExp(step.match, "gm");
          await removeFromFile(rootPath, targetPath, regex);
          break;
        }
        case "remove-scripts": {
          const targetPath = path.resolve(rootPath, step.target);
          const scripts = Array.isArray(step.scripts) ? step.scripts : [];
          await removePackageScripts(targetPath, scripts);
          break;
        }
      }
    } catch (e: any) {
      console.warn(`Skipped: ${e.message}`);
    }
  }

  // CRITICAL: Title first — prevents "Scaffold" in title from being overwritten
  const titleFiles = [
    "spa-src/src/layout/Layout.tsx",
    "spa-src/src/layoutConfig.ts",
  ];
  for (const rel of titleFiles) {
    const file = path.resolve(rootPath, rel);
    if (await fs.stat(file).catch(() => false)) {
      const content = await fs.readFile(file, "utf-8");
      const updated = content.replace(/Scaffold/g, title);
      await fs.writeFile(file, updated);
      // console.log(`Title updated: ${rel}`);
    }
  }

  // Now do namespace & DB replacements
  const filesToProcess = glob.sync("**/*.{py,json,ts,tsx,js,jsx,sql}", {
    cwd: rootPath,
    absolute: true,
    ignore: ["**/node_modules/**", "**/bin/**", "**/obj/**", "**/.git/**"],
  });

  for (const file of filesToProcess) {
    try {
      const content = await fs.readFile(file, "utf-8");
      let updated = content
        .replace(/Scaffold/g, ns) // namespace
        .replace(/\{Database\}/g, dbName); // DB name

      if (updated !== content) {
        await fs.writeFile(file, updated);
        // console.log(`Updated: ${path.relative(rootPath, file)}`);
      }
    } catch {}
  }

  console.log("Setup succeeded:");
  console.log(`   Project Root: ${rootPath}`);
  console.log("Next steps:");
  console.log(
    " - Provision SQL Server database using scripts in ./assets/DbScripts/SqlServer",
  );
  console.log(
    " - Update environment variables in ./src/docker-compose-override.yml:",
  );
  console.log("    - IdP settings are required");
  console.log("    - Confirm Database Settings");
  console.log("Further instructions can be found in ./ReadMe.md");
  console.log("GOOD LUCK!");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
