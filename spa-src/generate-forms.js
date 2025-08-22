import axios from "axios";
import fs from "fs";

// Replace with your API's OpenAPI spec URL
const OPENAPI_URL = "http://localhost:5011/swagger/v1/swagger.json";

async function generateForms() {
  try {
    // Fetch the spec from the API
    const response = await axios.get(OPENAPI_URL);

    // Parse the spec
    const spec = response.data;

    const lines = [
      "import { z } from 'zod';",
      "",
      "export interface PropDef {",
      "  property: string;",
      "  type: string;",
      "  title: string;",
      "  placeholder?: string;",
      '  fieldType: "text" | "textarea" | "email" | "number";',
      "}",
      "",
    ];
    const postSchemas = [];

    // Iterate over paths
    if (spec.paths) {
      Object.entries(spec.paths).forEach(([path, methods]) => {
        // Check if the path has a POST method
        if (methods.post) {
          const requestBody = methods.post.requestBody;
          if (
            requestBody &&
            requestBody.content &&
            requestBody.content["application/json"]
          ) {
            const jsonSchema =
              requestBody.content["application/json"].schema?.allOf?.[0]?.[
                "$ref"
              ];
            if (jsonSchema) {
              // Split the $ref string and get the last element
              const schemaName = jsonSchema.split("/").pop();
              const regex = new RegExp("_", "g");
              const method = methods.post.operationId.replace(regex, "");

              let postSchema = {
                schemaName: schemaName,
                method: method,
              };

              if (
                methods.post?.responses &&
                methods.post.responses["200"]?.content &&
                methods.post.responses["200"].content["application/json"] &&
                methods.post.responses["200"].content["application/json"][
                  "schema"
                ]
              ) {
                const res200 =
                  methods.post.responses["200"].content["application/json"][
                    "schema"
                  ];
                let responseIs = "single";
                let refAt = res200;
                if (res200.type && res200.type == "array") {
                  responsIs = "array";
                  refAt = res200["items"];
                }
                const resType = refAt["$ref"].split("/").pop();
                postSchema.responseIs = responseIs;
                postSchema.resType = resType;
              }

              postSchemas.push(postSchema);
            }
          }
        }
      });
    }

    postSchemas.forEach((schema) => {
      console.log("Schema: ", schema);
      const schemaName = schema.schemaName;
      const def = spec.components.schemas[schemaName];
      let formName = schemaName;
      if (formName.endsWith("Model"))
        formName = formName.substring(0, formName.length - 5);
      else if (formName.endsWith("Object"))
        formName = formName.substring(0, formName.length - 6);
      else if (formName.endsWith("DTO"))
        formName = formName.substring(0, formName.length - 3);
      formName += "Form";
      console.log("Form Name: ", formName);
      console.log("API Method: ", schema.method);
      if (def && def.properties) {
        lines.push(`export const ${schemaName}Schema = z.object({`);
        const propDefs = [];
        const props = [];
        Object.entries(def.properties).forEach(([propName, propDetails]) => {
          let propDef = { property: propName };
          const type = propDetails["type"];
          if (type == "string") {
            propDef.title = propDetails["title"] ?? propName;
            propDef.placeholder = propDetails["title"] ?? "";
            propDef.nullable = propDetails["nullable"] ?? false; // nullable doesn't necessarily mean required, as there may be a default
            propDef.defaultType = "text";
            propDef.type = propDetails["type"] ?? "text";
            if (propDetails["x-input-type"])
              propDef.defaultType = propDetails["x-input-type"];
            let line = `  ${propName}: z.string()`;
            if (propDetails.minLength && propDetails.minLength == 1)
              line += `.min(${propDetails.minLength}, "${propDef.title} is required")`;
            else if (propDetails.minLength && propDetails.minLength > 1)
              line += `.min(${propDetails.minLength}, "${propDef.title} is required to be at least ${propDetails.minLength} characters long.")`;
            else if (def.required && def.required[propName])
              line += `.min(1, "${propDef.title} is required")`;
            if (propDetails["maxLength"])
              line += `.max(${propDetails["maxLength"]}, "${propDef.title} max length is ${propDetails["maxLength"]}")`;

            line += `,`;
            lines.push(line);
            propDefs.push(propDef);
            props.push(
              `{"property": "${propDef.property}", "type": "${propDef.type}", "title": "${propDef.title}", "placeholder": "${propDef.placeholder}", "fieldType": "${propDef.defaultType}" }`
            );
          } else {
            console.error(`need to handle ${type}`);
          }
        });
        lines.push("});");
        lines.push("");
        lines.push(`export enum ${schemaName}Props {`);
        propDefs.forEach((propDef) => lines.push(`  ${propDef.property},`));
        lines.push("};");
        lines.push("");
        lines.push(
          `export const ${schemaName}PropDefs: PropDef[] = [${props}]`
        );
        lines.push("");

        let formTemplate = fs.readFileSync(
          "./api-templates/TemplateForm.txt",
          "utf8"
        );
        formTemplate = formTemplate
          .replaceAll("{PostObject}", schema.schemaName)
          .replaceAll("{BaseObject}", schema.resType)
          .replaceAll("{FormName}", formName)
          .replaceAll("{ApiMethod}", camelCase(schema.method));
        fs.writeFileSync(
          `./src/forms/generated/${formName}.tsx`,
          formTemplate,
          {
            flag: "w",
          }
        );
      }
    });

    let output = "";
    lines.forEach((line) => (output += line + "\n"));

    fs.writeFileSync("./src/apiClient/schemas.ts", output, { flag: "w" });
  } catch (error) {
    console.error("Error loading OpenAPI spec:", error);
  }
}

function camelCase(str) {
  // Using replace method with regEx
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index == 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

generateForms();
