import path from "node:path";
import { generateApi } from "swagger-typescript-api";

generateApi({
  output: path.resolve(process.cwd(), "./src/apiClient"),
  url: "http://localhost:5011/swagger/All/swagger.json",
  codeGenConstructs: (constructs) => ({
    ...constructs,
    Keyword: {
      Null: "null",
      ...constructs.Keyword,
    },
    TypeField: ({ readonly, key, value }) =>
      [...[readonly && "readonly "], key, ": ", value].join(""),
  }),
  modular: true,
});
