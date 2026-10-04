# Generator

Scaffolds C# Business objects and services from a SQL Server schema for the
line-of-business template.

```bash
pnpm install
pnpm dev
```

Open http://localhost:3199. The UI defaults to `../../src/*.sln`.

Agents and scripts should use the CLI (same core as the UI; no Vite server):

```bash
pnpm generator status --sln ../Clean/src/Clean.sln --json
pnpm generator enums --fix --sln ../Clean/src/Clean.sln
pnpm generator lookups --fix --sln ../Clean/src/Clean.sln
pnpm generator generate --table lu_Color --sln ../Clean/src/Clean.sln
pnpm generator replace --table dat_Widget --sln ../Clean/src/Clean.sln
```

`lu_*` tables generate `IStaticLookupItem` on the object, upsert `LookupType`, and rewrite `LookupController` (`All()` and `Type(LookupType)`). Data tables (`dat_*`) are unchanged. The UI lists them in separate sections.
