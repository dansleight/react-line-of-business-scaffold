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
} from "../utils/utilities";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SETUP_DIR = __dirname; // <-- critical: exclude this entire folder
const CONFIG_PATH = path.join(SETUP_DIR, "./fastapi.config.json");

async function main() {
  console.log("Setting up Python FastAPI project...\n");

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "namespace",
      message: "What is the name for your WebAPI project? (No spaces)",
      validate: (v) =>
        /^[a-zA-Z][a-zA-Z0-9.]*$/.test(v) || "Valid namespace required",
    },
    {
      type: "input",
      name: "database",
      message: "Default database name (empty = same as name):",
      default: "",
    },
    {
      type: "input",
      name: "title",
      message: "Application title:",
      validate: (v) => v.trim().length > 0 || "Title is required",
    },
    {
      type: "number",
      name: "port",
      message: "Port for WebAPI (5000–5099):",
      default: 5000,
      validate: (input) => {
        const n = Number(input);
        if (Number.isInteger(n) && n >= 5000 && n <= 5099) {
          return true;
        }
        return "Please enter a port number between 5000 and 5099";
      },
    },
  ]);

  const { namespace: ns, database, title, port } = answers;
  const apiPort = Number(port);
  const spaPort = apiPort - 2000;
  const dbName = database.trim() || ns;
  const nslower = ns.toLowerCase();

  console.log(`\nConfiguration:`);
  console.log(`   Namespace   : ${ns}`);
  console.log(`   Database    : ${dbName}`);
  console.log(`   Title       : ${title}`);
  console.log(`   API Port    : ${apiPort}`);
  console.log(`   SPA Port    : ${spaPort}\n`);

  // Load config
  const config = JSON.parse(await fs.readFile(CONFIG_PATH, "utf-8"));

  // Run file operations from config (safe: only explicit paths)
  for (const step of config.steps) {
    if (step.comment) console.log(`// ${step.comment}`);
    try {
      switch (step.action) {
        case "remove":
          for (const f of step.files || []) {
            const p = path.resolve(PROJECT_ROOT, f);
            await fs.rm(p, { recursive: true, force: true });
            console.log(`Removed: ${f}`);
          }
          break;
        case "rename":
          const from = path.resolve(PROJECT_ROOT, step.target!);
          const to = path.resolve(PROJECT_ROOT, step.to!);
          await fs.rename(from, to);
          console.log(
            `Renamed: ${step.target} → ${path.relative(PROJECT_ROOT, to)}`,
          );
          break;
        case "copy":
          const copy_from = path.resolve(PROJECT_ROOT, step.from!);
          const copy_to = path.resolve(PROJECT_ROOT, step.to!);
          await fs.copyFile(copy_from, copy_to);
          console.log(`Copied: ${step.from} → ${step.to}`);
          break;
        case "replace":
          const target = path.resolve(PROJECT_ROOT, step.target!);
          const source = path.resolve(PROJECT_ROOT, step.with!);
          await fs.copyFile(source, target);
          console.log(`Replaced: ${step.target}`);
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
              cwd: PROJECT_ROOT,
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
              await replaceInFile(PROJECT_ROOT, file, search, replacement);
            }
          }
          break;
        }
        case "remove-text": {
          const targetPath = path.resolve(PROJECT_ROOT, step.target);
          const regex = new RegExp(step.match, "gm");
          await removeFromFile(PROJECT_ROOT, targetPath, regex);
          break;
        }
        case "remove-scripts": {
          const targetPath = path.resolve(PROJECT_ROOT, step.target);
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
    const file = path.resolve(PROJECT_ROOT, rel);
    if (await fs.stat(file).catch(() => false)) {
      const content = await fs.readFile(file, "utf-8");
      const updated = content.replace(/Scaffold/g, title);
      await fs.writeFile(file, updated);
      console.log(`Title updated: ${rel}`);
    }
  }

  // Now do namespace & DB replacements — but EXCLUDE setup/ entirely
  const filesToProcess = glob.sync("**/*.{py,json,ts,tsx,js,jsx,sql}", {
    cwd: PROJECT_ROOT,
    absolute: true,
    ignore: [
      "**/node_modules/**",
      "**/bin/**",
      "**/obj/**",
      "**/setup/**", // Critical: never touch setup folder
      "**/.git/**",
    ],
  });

  for (const file of filesToProcess) {
    try {
      const content = await fs.readFile(file, "utf-8");
      let updated = content
        .replace(/Scaffold/g, ns) // namespace
        .replace(/\{Database\}/g, dbName); // DB name

      if (updated !== content) {
        await fs.writeFile(file, updated);
        console.log(`Updated: ${path.relative(PROJECT_ROOT, file)}`);
      }
    } catch {}
  }

  // Final step: Clean install to fix broken .bin links
  console.log("\nInstalling SPA dependencies (this may take a minute)...");

  try {
    const spaDir = path.join(PROJECT_ROOT, "spa-src");

    // Delete node_modules and lockfiles to force full reinstall
    await fs.rm(path.join(spaDir, "node_modules"), {
      recursive: true,
      force: true,
    });
    await fs.rm(path.join(spaDir, "package-lock.json"), { force: true });
    await fs.rm(path.join(spaDir, "pnpm-lock.yaml"), { force: true });
    await fs.rm(path.join(spaDir, "yarn.lock"), { force: true });

    console.log("Cleaned old node_modules and lockfiles");

    // Run npm install
    const { execSync } = await import("child_process");
    execSync("pnpm install", {
      cwd: spaDir,
      stdio: "inherit", // shows progress
    });

    console.log("\nAll dependencies installed successfully!");
    console.log("You can now run:");
    console.log("   cd ../spa-src");
    console.log("   npm run dev");
    console.log("");
    console.log("API will be at: https://localhost:" + apiPort);
    console.log("SPA will be at:  http://localhost:" + spaPort);
  } catch (err) {
    console.error("\nFailed to install dependencies. Run manually:");
    console.error("   cd spa-src && npm install");
  }

  console.log("\nProject successfully initialized!");
  console.log(`   Name     : ${ns}`);
  console.log(`   Database : ${dbName}`);
  console.log(`   Title    : ${title}`);
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
