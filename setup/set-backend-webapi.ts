#!/usr/bin/env tsx

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { glob } from "glob";
import {
  generateGuid,
  safeRename,
  recursiveRenameContaining,
  interpolate,
  replaceInFile,
  removeFromFile,
  removePackageScripts,
} from "./utilities";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const SETUP_DIR = __dirname; // <-- critical: exclude this entire folder
const CONFIG_PATH = path.join(SETUP_DIR, "webapi/webapi.config.json");

async function main() {
  console.log("Setting up .NET WebAPI project...\n");

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "namespace",
      message: "What is the namespace for your WebAPI project?",
      validate: (v) =>
        /^[a-zA-Z][a-zA-Z0-9.]*$/.test(v) || "Valid C# namespace required",
    },
    {
      type: "input",
      name: "database",
      message: "Default database name (empty = 'Scaffold'):",
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
  const dbName = database.trim() || "Scaffold";
  const projectGuid = generateGuid(ns + ".WebApi");
  const solutionGuid = generateGuid(ns + ".Solution");
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
            `Renamed: ${step.target} → ${path.relative(PROJECT_ROOT, to)}`
          );
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
                "g"
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

  // === RECURSIVE RENAME: Scaffold → Namespace (folders + files) ===
  const srcDir = path.join(PROJECT_ROOT, "src");

  if (await fs.stat(srcDir).catch(() => false)) {
    console.log(`\nRecursively renaming all 'Scaffold' → '${ns}' in src/ ...`);
    await recursiveRenameContaining(srcDir, "Scaffold", ns.split(".").pop()!);
  }

  // Rename solution file (outside src/)
  const oldSln = path.join(PROJECT_ROOT, "Scaffold.sln");
  const newSlnName = `${ns.split(".").pop()}.sln`;
  const newSln = path.join(PROJECT_ROOT, newSlnName);

  if (await fs.stat(oldSln).catch(() => false)) {
    await safeRename(oldSln, newSln, "Solution file");
    console.log(`Solution renamed: Scaffold.sln → ${newSlnName}`);
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
  const filesToProcess = glob.sync(
    "**/*.{cs,csproj,sln,json,ts,tsx,js,jsx,sql}",
    {
      cwd: PROJECT_ROOT,
      absolute: true,
      ignore: [
        "**/node_modules/**",
        "**/bin/**",
        "**/obj/**",
        "**/setup/**", // Critical: never touch setup folder
        "**/.git/**",
      ],
    }
  );

  for (const file of filesToProcess) {
    try {
      const content = await fs.readFile(file, "utf-8");
      let updated = content
        .replace(/Scaffold/g, ns) // namespace
        .replace(/\{Database\}/g, dbName); // DB name

      // Replace old placeholder GUIDs
      updated = updated.replace(
        /[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/gi,
        (match) => {
          const lower = match.toLowerCase();
          if (
            lower.includes("0000") ||
            lower.includes("1111") ||
            content.includes("Scaffold")
          ) {
            return file.endsWith(".sln") ? solutionGuid : projectGuid;
          }
          return match;
        }
      );

      if (updated !== content) {
        await fs.writeFile(file, updated);
        console.log(`Updated: ${path.relative(PROJECT_ROOT, file)}`);
      }
    } catch {}
  }

  // Clean bin/obj
  for (const dir of glob
    .sync("**/bin", { cwd: PROJECT_ROOT })
    .concat(glob.sync("**/obj", { cwd: PROJECT_ROOT }))
    .concat(glob.sync("**/.vs", { cwd: PROJECT_ROOT }))) {
    const full = path.resolve(PROJECT_ROOT, dir);
    if (!full.includes(SETUP_DIR)) {
      await fs.rm(full, { recursive: true, force: true });
      console.log(`Cleaned: ${dir}/`);
    }
  }

  // Remove UserSecretsId from all .csproj files (clean template)
  const csprojFiles = glob.sync("**/*.csproj", {
    cwd: PROJECT_ROOT,
    absolute: true,
    ignore: ["**/node_modules/**", "**/setup/**"],
  });

  for (const file of csprojFiles) {
    try {
      const content = await fs.readFile(file, "utf-8");
      const cleaned = content
        .replace(/<UserSecretsId>.*?<\/UserSecretsId>\s*/gis, "")
        .replace(
          // Also remove empty <PropertyGroup> if that's all it contained
          /<PropertyGroup>\s*<\/PropertyGroup>/gis,
          ""
        );

      if (cleaned !== content) {
        await fs.writeFile(file, cleaned);
        console.log(
          `Cleaned UserSecretsId: ${path.relative(PROJECT_ROOT, file)}`
        );
      }
    } catch (err) {
      // ignore if file not readable
    }
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
    execSync("npm install", {
      cwd: spaDir,
      stdio: "inherit", // shows progress
    });

    console.log("\nAll dependencies installed successfully!");
    console.log("You can now run:");
    console.log("   cd spa-src");
    console.log("   npm run dev");
    console.log("");
    console.log("API will be at: https://localhost:" + apiPort);
    console.log("SPA will be at:  http://localhost:" + spaPort);
  } catch (err) {
    console.error("\nFailed to install dependencies. Run manually:");
    console.error("   cd spa-src && npm install");
  }

  console.log("\nProject successfully initialized!");
  console.log(`   Namespace: ${ns}`);
  console.log(`   Database : ${dbName}`);
  console.log(`   Title    : ${title}`);
  console.log("\nNext steps:");
  console.log("   cd spa-src && npm install");
  console.log("   dotnet restore && dotnet build");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
