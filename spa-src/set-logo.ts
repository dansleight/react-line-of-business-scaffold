#!/usr/bin/env tsx

import fs, { readFile, writeFile } from "fs/promises";
import path from "path";
import inquirer from "inquirer";
import { Resvg } from "@resvg/resvg-js";

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

  const widthMatch = content.match(/var\s+width\s*=\s*(\d+)/);
  if (!widthMatch) throw new Error("Could not find width in icon file");

  const heightMatch = content.match(/var\s+height\s*=\s*(\d+)/);
  if (!heightMatch) throw new Error("Could not find height in icon file");

  // Try single-line first
  const pathMatch = content.match(/svgPathData\s*=\s*['"](.+?)['"]/s);
  if (pathMatch) {
    return {
      width: Number(widthMatch[1]),
      height: Number(heightMatch[1]),
      svgPathData: pathMatch[1],
    };
  }

  // Multiline fallback
  const lines = content.split("\n");
  let pathData = "";
  let inPath = false;
  for (const line of lines) {
    if (line.includes("svgPathData")) inPath = true;
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

async function svgToPng(inputPath: string, outputPath: string, width: number) {
  const svgBuffer = await readFile(inputPath);
  const svgString = svgBuffer.toString();

  const resvg = new Resvg(svgString, {
    fitTo: { mode: "width", value: width },
    background: "#ffffff", // white background
    // You can add more options like font rendering if needed
  });

  const pngBuffer = resvg.render().asPng();

  await writeFile(outputPath, pngBuffer);
  console.log(`✓ Generated ${path.basename(outputPath)}`);
}

async function main() {
  const faBasePath = path.resolve(process.cwd(), "node_modules/.pnpm/");

  try {
    await fs.access(faBasePath);
  } catch {
    console.error(
      `Could not find ${faBasePath}. You may need to run "pnpm i" in the spa-src folder.`,
    );
    process.exit(1);
  }

  const entries = await fs.readdir(faBasePath, { withFileTypes: true });
  const svgIconPackages = entries
    .filter(
      (d) =>
        d.isDirectory() &&
        d.name.startsWith("@fortawesome") && // simplified
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
        name: p.name.replace("-svg-icons", "").replace("@fortawesome+", ""),
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
    const lower = name.toLowerCase();
    iconMap.set(lower, path.join(iconsDir, file));
    if (lower.startsWith("fa")) {
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
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .split("-")
      .map((word: string, index: number) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join("");

    if (!searchName.toLowerCase().startsWith("fa")) {
      searchName =
        "fa" + searchName.charAt(0).toUpperCase() + searchName.slice(1);
    }

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

      // ... (your logo component generation logic stays exactly the same)
      let size = 576;
      let adjustedHeight = 576;
      let adjustedYStart = -32;
      let xNeg = (width - height) / 2 - 32;
      let yNeg = -32;
      if (width > height) {
        size = width;
        adjustedHeight = height;
        adjustedYStart = 0;
        xNeg = 0;
        yNeg = (height - width) / 2;
      }

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
        viewBox="0 ${adjustedYStart} ${width} ${adjustedHeight}"
      >
        {parts}
      </svg>
    );

  return (
    <svg
      id="logo"
      data-name="layer_0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 ${adjustedYStart} ${width} ${adjustedHeight}"
    >
      {parts}
    </svg>
  );
}
`;

      const outputPath = path.resolve(process.cwd(), "src/components/Logo.tsx");
      await fs.writeFile(outputPath, logoComponent.trim() + "\n", "utf-8");

      const logoSvg = `<?xml version="1.0" encoding="iso-8859-1"?>
<svg overflow="visible" id="logo" data-name="layer_0" xmlns="http://www.w3.org/2000/svg" viewBox="${xNeg} ${yNeg} ${size} ${size}">
  <style>
    .style1 { fill: black; }
    @media (prefers-color-scheme: dark) {
      .style1 { fill: white; }
    }
  </style>
  <g id="logo_1" data-name="layer_1">
    <g>
      <path class="style1" data-name="part1" d="${svgPathData}"/>
    </g>
  </g>
</svg>`;

      const svgPath = path.resolve(process.cwd(), "public/favicon.svg");
      await fs.writeFile(svgPath, logoSvg.trim(), "utf-8");

      // Generate PNGs
      await svgToPng(
        svgPath,
        path.resolve(process.cwd(), "public/favicon-32x32.png"),
        32,
      );
      await svgToPng(
        svgPath,
        path.resolve(process.cwd(), "public/favicon-16x16.png"),
        16,
      );
      await svgToPng(
        svgPath,
        path.resolve(process.cwd(), "public/android-chrome-512x512.png"),
        512,
      );
      await svgToPng(
        svgPath,
        path.resolve(process.cwd(), "public/android-chrome-192x192.png"),
        192,
      );
      await svgToPng(
        svgPath,
        path.resolve(process.cwd(), "public/apple-touch-icon.png"),
        180,
      );

      console.log(
        "\nSuccess! Logo.tsx created/updated and favicons generated.",
      );
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
