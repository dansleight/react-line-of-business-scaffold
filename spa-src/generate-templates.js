import { generateTemplates } from "swagger-typescript-api";
import { resolve } from "path";

generateTemplates({
  output: resolve(process.cwd(), "./api-templates-default"),
  modular: true,
});
