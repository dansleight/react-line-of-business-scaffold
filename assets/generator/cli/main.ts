#!/usr/bin/env tsx

import { resolveSolutionPath } from "../server/findDefaultSolution.ts";
import { generateTable, type GenerateMode } from "../server/generateTable.ts";
import { loadSolution } from "../server/loadSolution.ts";
import { setTableNotes } from "../server/setNotes.ts";
import { setPrimaryTable } from "../server/setPrimaryTable.ts";
import { writeController } from "../server/writeController.ts";
import { fixEnums } from "../server/writeEnum.ts";
import type { SolutionLoadResult } from "../shared/types.ts";

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.command) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }

  const solutionPath = await resolveSolutionPath(args.sln);
  if (!solutionPath) {
    fail(
      "Unable to find a .sln file. Pass --sln <path> or place the generator next to ../../src.",
      args.json,
    );
  }

  let result: SolutionLoadResult;
  switch (args.command) {
    case "status":
      result = await loadSolution(solutionPath);
      break;
    case "enums":
      result = args.fix
        ? await fixEnums(solutionPath)
        : await loadSolution(solutionPath);
      break;
    case "generate":
    case "replace":
      if (!args.table) {
        fail(`${args.command} requires --table <name>.`, args.json);
      }
      result = await generateTable(
        solutionPath,
        args.table,
        args.command as GenerateMode,
      );
      break;
    case "primary":
      if (!args.table || args.primary === undefined) {
        fail("primary requires --table <name> and --on or --off.", args.json);
      }
      result = await setPrimaryTable(solutionPath, args.table, args.primary);
      break;
    case "notes":
      if (!args.table || args.text === undefined) {
        fail("notes requires --table <name> and --text <notes>.", args.json);
      }
      result = await setTableNotes(solutionPath, args.table, args.text);
      break;
    case "controller":
      if (!args.table) {
        fail("controller requires --table <name>.", args.json);
      }
      result = await writeController(solutionPath, args.table, {
        controllerName: args.name,
        properties: args.properties,
        methods: args.methods,
        overwrite: args.overwrite,
      });
      break;
    default:
      fail(`Unknown command: ${args.command}`, args.json);
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printResult(result);
  }

  if (result.error || result.schemaError) process.exit(1);
}

type CliArgs = {
  command?: string;
  sln?: string;
  table?: string;
  text?: string;
  name?: string;
  properties?: string[];
  methods?: string[];
  primary?: boolean;
  overwrite?: boolean;
  fix: boolean;
  json: boolean;
  help: boolean;
};

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    fix: false,
    json: false,
    help: false,
    overwrite: false,
  };
  const rest: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--help" || token === "-h") args.help = true;
    else if (token === "--json") args.json = true;
    else if (token === "--overwrite") args.overwrite = true;
    else if (token === "--fix") args.fix = true;
    else if (token === "--on") args.primary = true;
    else if (token === "--off") args.primary = false;
    else if (token === "--sln" || token === "--path") {
      args.sln = argv[index + 1];
      index += 1;
    } else if (token === "--table") {
      args.table = argv[index + 1];
      index += 1;
    } else if (token === "--text") {
      args.text = argv[index + 1];
      index += 1;
    } else if (token === "--name") {
      args.name = argv[index + 1];
      index += 1;
    } else if (token === "--properties") {
      args.properties = (argv[index + 1] ?? "")
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
      index += 1;
    } else if (token === "--methods") {
      args.methods = (argv[index + 1] ?? "")
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
      index += 1;
    } else if (token.startsWith("-")) {
      throw new Error(`Unknown option: ${token}`);
    } else {
      rest.push(token);
    }
  }

  args.command = rest[0];
  if (!args.table && rest[1]) args.table = rest[1];
  return args;
}

function printUsage(): void {
  console.log(`Generator

Usage:
  pnpm generator status [--sln path] [--json]
  pnpm generator enums --fix [--sln path] [--json]
  pnpm generator generate --table dat_Widget [--sln path] [--json]
  pnpm generator replace --table lu_Color [--sln path] [--json]
  pnpm generator primary --table dat_Widget --on|--off [--sln path] [--json]
  pnpm generator notes --table dat_Widget --text "…" [--sln path] [--json]
  pnpm generator controller --table dat_Widget [--name WidgetController] [--properties Name,ColorId] [--methods Get,Post,Patch] [--overwrite] [--sln path] [--json]
`);
}

function printResult(result: SolutionLoadResult): void {
  if (result.error) console.error(result.error);
  if (result.schemaError) console.error(result.schemaError);
  if (result.solutionPath) console.log(`Solution: ${result.solutionPath}`);
  if (result.namespace) console.log(`Namespace: ${result.namespace}`);
  if (result.connectionSource) {
    console.log(
      `Connection: ${result.connectionSource.sourceKind} (${result.connectionSource.sourceFile})`,
    );
  }
  const tables = result.tables ?? [];
  if (tables.length === 0) return;

  const enums = tables.filter((table) => table.kind === "enum");
  const pendingEnums = enums.filter(
    (table) => (table.enumAudit?.status ?? "missing") !== "correct",
  );
  console.log(`Enums: ${enums.length} (${pendingEnums.length} need fix)`);
  for (const table of tables.filter((entry) => entry.kind !== "enum")) {
    const objectStatus = table.objectAudit?.status ?? "n/a";
    const serviceStatus = table.serviceAudit?.status ?? "n/a";
    console.log(
      `${table.tableName}\t${table.role}\tobject=${objectStatus}\tservice=${serviceStatus}`,
    );
  }
}

function fail(message: string, json: boolean): never {
  if (json) console.log(JSON.stringify({ error: message }));
  else console.error(message);
  process.exit(1);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
