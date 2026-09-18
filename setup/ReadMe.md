# Setup

One-shot wizard that copies this template into an empty directory and names the app. It is not used at runtime. After a successful run, you can delete `setup/` from the **new** repository.

From this `setup/` folder:

```bash
pnpm i
pnpm setup
```

Prompts: backend (C# WebAPI or Python FastAPI), namespace (one identifier, no dots), database name, title, API port (`5000–5099`), and the empty destination path. SPA port is API port minus `2000`.

The script copies the chosen backend as `src/`, plus `spa-src/`, SQL scripts, and the C# generator. It rewrites namespace, ports, and connection-string placeholders, and strips `UserSecretsId` from copied `.csproj` files.

Optional logo helper (Font Awesome as a placeholder; you need a license for production use of those glyphs):

```bash
pnpm set-logo
```

If a glyph exceeds the viewBox (for example `faPerson`), edit `viewBox` in `spa-src/src/components/Logo.tsx`.
