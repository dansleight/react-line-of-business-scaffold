import { generateApi } from "swagger-typescript-api";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { config, parse } from "dotenv";

// if you are running the api with https it will error without the line below.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

config({ path: resolve(process.cwd(), ".env") });
let apiLocalOrigin = process.env.PYTHON_API_LOCAL_ORIGIN;

// if the .env.development file exists, we'll want to use the PYTHON_API_LOCAL_ORIGIN from that file
const devEnvPath = resolve(process.cwd(), "env.development");
const devEnvExists = existsSync(devEnvPath);
if (devEnvExists) {
  const devConfig = parse(readFileSync(devEnvPath));
  if (devConfig.PYTHON_API_LOCAL_ORIGIN) {
    apiLocalOrigin = devConfig.PYTHON_API_LOCAL_ORIGIN;
  }
}

console.log("PYTHON_API_LOCAL_ORIGIN: ", apiLocalOrigin);

generateApi({
  output: resolve(process.cwd(), "./src/apiClient"),
  url: `${apiLocalOrigin}/openapi.json`,
  codeGenConstructs: (constructs) => ({
    ...constructs,
    Keyword: {
      Null: "null",
      ...constructs.Keyword,
    },
    TypeField: ({ readOnly, key, value }) =>
      [...[readOnly && "readOnly "], key, ": ", value].join(""),
  }),
  modular: true,
  cleanOutput: true,
  templates: resolve(process.cwd(), "./api-templates"),
});
