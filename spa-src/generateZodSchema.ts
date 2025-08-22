import { Project } from "ts-morph";
import fs from "fs";

function generateZodSchema(
  typeName: string,
  sourceFile: string,
  outputFile: string
) {
  const project = new Project();
  const source = project.addSourceFileAtPath(sourceFile);
  const interfaceDecl = source.getInterfaceOrThrow(typeName);

  const properties: string[] = [];

  for (const prop of interfaceDecl.getProperties()) {
    const propName = prop.getName();
    const propType = prop.getType().getText();
    const isOptional = prop.hasQuestionToken();

    let zodValidator: string;

    if (propType === "string") {
      zodValidator = isOptional
        ? `z.string().optional()`
        : `z.string().min(1, "${propName} is required")`;
    } else if (propType === "number") {
      zodValidator = isOptional
        ? `z.number().optional()`
        : `z.number().min(0, "${propName} must be positive")`;
    } else if (propType === "boolean") {
      zodValidator = isOptional ? `z.boolean().optional()` : `z.boolean()`;
    } else {
      // Fallback for unsupported types
      zodValidator = isOptional ? `z.any().optional()` : `z.any()`;
    }

    properties.push(`  ${propName}: ${zodValidator}`);
  }

  const schemaContent = properties.length
    ? `{\n${properties.join(",\n")}\n}`
    : "{}";

  const output =
    `import { z } from 'zod';\n\n` +
    `export const ${typeName}Schema = z.object(${schemaContent});\n`;

  fs.writeFileSync(outputFile, output, { flag: "w" });
}

export default generateZodSchema;

// Usage
generateZodSchema(
  "AddWidgetModel",
  "./src/apiClient/data-contracts.ts",
  "./src/apiClient/schemas.ts"
);
