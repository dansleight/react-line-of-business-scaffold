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
} from "./utils/utilities";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SETUP_DIR = __dirname; // <-- critical: exclude this entire folder
const CONFIG_PATH = path.join(SETUP_DIR, "./fastapi.config.json");

async function main() {
  // Take type, name, message, choices[, default, filter, loop] properties. (Note: default must be set to the index or value of one of the entries in choices)
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "backend",
      message: "Which backend do you want to use?",
      choices: ["Python FastAPI", "C# WebAPI"],
    },
  ]);

  const { backend } = answers;
  console.log(`Backend: ${backend}`);
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
