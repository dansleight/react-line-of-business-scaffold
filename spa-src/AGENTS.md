# SPA

This folder is the frontend editor. Open the editor here, not at the repository root. The other editor is the root, and it owns SQL, the generator, and the API. You meet over HTTP.

An agent in this folder stays on screens, forms, menus, theme, and browser sign-in. If a field is missing from the client, stop. The table changes first, then the generator, then `pnpm generate-api`. Do not add the property to a C# class or to `src/apiClient/` by hand. Do not scaffold the API from this folder.

Stack: Vite, React 19, TypeScript, React Router, Bootstrap 5, MSAL. The API origin in development is the Vite proxy. Entra ids arrive from `GET /api/settings`.

From this folder, with the API already running:

```bash
pnpm i
pnpm dev
pnpm generate-api
```

`pnpm set-logo` writes the logo. `pnpm remove-lab` removes Theme Lab when you are done picking a theme. The template production script is `pnpm build:webapi`. Setup renames the one you kept to `pnpm build:release`.

## Rules

- Add a screen with `lazyPage` in `src/routes.tsx` and a matching item in `src/menusConfig.ts`. The path, the menu, and the page move together.
- `src/apiClient/` is generated. Run `pnpm generate-api` after a controller change. Do not hand-edit those files.
- Leave `src/contexts/` alone, and leave the silent-iframe check in `src/main.tsx` alone. The one-second wait in `IdentityContext` stays. Login loops start when it is removed. See [docs/auth.md](docs/auth.md).
- Leave the API project's `Services/RepoBases/` alone. That is `MappedTableBinder`, `DapperRepositoryBase`, and `MappedTableRepository`.
- Icons go through `<Icon />`. Chrome and menus stay on Font Awesome. Phosphor is not installed. Do not add it unless the task asks for that pack.
- Sass keeps `silenceDeprecations: ["import"]` and nothing else. One theme import is active in `src/assets/scss/theme.scss`.
- Do not raise Vite's chunk warning limit to hide a bundle. Pages are already split with `lazyPage`.

## Read before you change it

| Area | Doc |
|---|---|
| Layouts, boot, day-to-day commands | [README.md](README.md) |
| Shell, routes, menus, Headcrumb, color mode | [docs/shell.md](docs/shell.md) |
| Browser sign-in | [docs/auth.md](docs/auth.md) |
| Forms | [docs/forms.md](docs/forms.md) |
| Generated client, lookups, grids | [docs/data.md](docs/data.md) |
| Theme, icons, logo, Theme Lab | [docs/theme.md](docs/theme.md) |
