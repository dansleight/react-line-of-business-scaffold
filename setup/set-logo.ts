#!/usr/bin/env tsx

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resolveIconFile(iconFilePath: string): Promise<string> {
  let currentPath = iconFilePath;
  let depth = 0;

  while (depth < 10) {
    const content = await fs.readFile(currentPath, "utf-8");

    const sourceMatch = content.match(
      /var\s+source\s*=\s*require\(['"]\.\/([^'"]+)['"]\)/,
    );
    if (!sourceMatch) return currentPath;

    const aliasName = sourceMatch[1];
    currentPath = path.join(path.dirname(currentPath), `${aliasName}.js`);
    depth++;
  }

  throw new Error("Too many alias redirects (possible loop)");
}

async function extractIconMetadata(iconFilePath: string): Promise<{
  width: number;
  height: number;
  svgPathData: string;
}> {
  const finalPath = await resolveIconFile(iconFilePath);
  const content = await fs.readFile(finalPath, "utf-8");

  // Extract width
  const widthMatch = content.match(/var\s+width\s*=\s*(\d+)/);
  if (!widthMatch) throw new Error("Could not find width in icon file");

  // Extract height
  const heightMatch = content.match(/var\s+height\s*=\s*(\d+)/);
  if (!heightMatch) throw new Error("Could not find height in icon file");

  // Extract svgPathData (supports single or double quotes, multiline with +)
  const pathMatch = content.match(/svgPathData\s*=\s*['"](.+?)['"]/s);
  if (!pathMatch) {
    // Some icons use: svgPathData = '...' + '...' (multiline)
    const lines = content.split("\n");
    let pathData = "";
    let inPath = false;
    for (const line of lines) {
      if (line.includes("svgPathData")) {
        inPath = true;
      }
      if (inPath) {
        const m = line.match(/['"](.+?)['"]/);
        if (m) pathData += m[1];
        if (line.includes(";")) break;
      }
    }
    if (!pathData) throw new Error("Could not extract svgPathData");
    return {
      width: Number(widthMatch[1]),
      height: Number(heightMatch[1]),
      svgPathData: pathData,
    };
  }

  return {
    width: Number(widthMatch[1]),
    height: Number(heightMatch[1]),
    svgPathData: pathMatch[1],
  };
}

async function main() {
  const faBasePath = path.resolve(
    process.cwd(),
    "../spa-src/node_modules/.pnpm/",
  );

  try {
    await fs.access(faBasePath);
  } catch {
    console.error(
      `Cound not find ${faBasePath}. You may need to run "pnpm i" in the spa-src folder.`,
    );
    process.exit(1);
  }

  const entries = await fs.readdir(faBasePath, { withFileTypes: true });
  const svgIconPackages = entries
    .filter(
      (d) =>
        d.isDirectory() &&
        d.name.startsWith("@fortawesome+") &&
        d.name.includes("-svg-icons"),
    )
    .map((d) => ({ name: d.name, fullPath: path.join(faBasePath, d.name) }));

  if (svgIconPackages.length === 0) {
    console.error("No FontAwesome SVG icon packages found.");
    process.exit(1);
  }

  const { selectedPackage } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedPackage",
      message: "Which icon package?",
      choices: svgIconPackages.map((p) => ({
        name: p.name.replace("-svg-icons", ""),
        value: p,
      })),
    },
  ]);

  const iconsDir =
    selectedPackage.fullPath +
    "/node_modules/@" +
    selectedPackage.name.split("@")[1].replace("+", "/");
  const files = await fs.readdir(iconsDir);
  const jsFiles = files.filter((f) => f.endsWith(".js"));

  const iconMap = new Map<string, string>();
  for (const file of jsFiles) {
    const name = file.replace(/\.js$/i, "");
    iconMap.set(name.toLowerCase(), path.join(iconsDir, file));
    if (name.toLowerCase().startsWith("fa")) {
      const shortName = name.slice(2);
      const key = shortName.charAt(0).toLowerCase() + shortName.slice(1);
      if (!iconMap.has(key)) iconMap.set(key, path.join(iconsDir, file));
    }
  }

  while (true) {
    const { rawInput } = await inquirer.prompt([
      {
        type: "input",
        name: "rawInput",
        message: "Enter icon name (e.g. house, rocket, github, react):",
        validate: (i) => i.trim().length > 0 || "Required",
      },
    ]);

    let searchName = rawInput
      .trim()
      .toLowerCase()
      .replace(/-+/g, "-") // collapse multiple hyphens
      .replace(/^-|-$/g, "") // remove leading/trailing hyphens
      .split("-")
      .map((word: string, index: number) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join("");
    if (!searchName.toLowerCase().startsWith("fa")) {
      searchName =
        "fa" + searchName.charAt(0).toUpperCase() + searchName.slice(1);
    }

    console.log("searchName: ", searchName);

    const iconFilePath = iconMap.get(searchName.toLowerCase());
    if (!iconFilePath) {
      console.log(`Icon "${searchName}" not found in ${selectedPackage.name}`);
      const { again } = await inquirer.prompt({
        type: "confirm",
        name: "again",
        message: "Try again?",
        default: true,
      });
      if (!again) process.exit(0);
      continue;
    }

    try {
      console.log(`Resolving ${searchName}...`);
      const { width, height, svgPathData } =
        await extractIconMetadata(iconFilePath);

      const displayName = searchName.replace(/^fa/, "");

      const logoComponent = `type LogoProps = {
  size?: number;
};

export function Logo({ size }: LogoProps) {
  const parts = (
    <g id="logo_1" data-name="layer_1">
      <g>
        <path
          fill="currentColor"
          data-name="part1"
          d="${svgPathData}"
        />
      </g>
    </g>
  );

  if (size)
    return (
      <svg
        id="logo"
        width={size}
        height={size}
        data-name="layer_0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 ${width} ${height}"
      >
        {parts}
      </svg>
    );

  return (
    <svg
      id="logo"
      data-name="layer_0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 ${width} ${height}"
    >
      {parts}
    </svg>
  );
}
`;

      const outputPath = path.resolve(
        process.cwd(),
        "../spa-src/src/components/Logo.tsx",
      );
      await fs.writeFile(outputPath, logoComponent.trim() + "\n", "utf-8");

      console.log("\nSuccess! Logo.tsx created/updated");
      console.log(`   Icon: ${displayName} (${searchName})`);
      console.log(`   Size: ${width}×${height}`);
      console.log(`   viewBox: 0 0 ${width} ${height}`);
      console.log(`   File: ${outputPath}\n`);

      process.exit(0);
    } catch (err: any) {
      console.error("Failed:", err.message);
      const { again } = await inquirer.prompt({
        type: "confirm",
        name: "again",
        message: "Try another icon?",
        default: true,
      });
      if (!again) process.exit(0);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
