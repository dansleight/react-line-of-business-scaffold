# SPA

Vite + React + TypeScript. In Development it talks to the API through the Vite proxy (`/api`, `/hub`), so you do not put Entra client ids in frontend env files. On boot, `SettingsProvider` calls **`GET /api/settings`**. That payload includes `msalSettings` (`clientId`, `authority`, `apiScope`) which `App.tsx` uses to construct MSAL. If settings fail to load, the SPA stops with an error screen — that is usually the API not running or Entra config missing on the server.

## Layouts

There are two shells. Both share routes, menus, session, and the form kit. Pick one in `src/layouts/config.ts`.

**Side menu** (`smLayoutConfig`) is the default. Narrow left rail, logo, nav, user avatar at the bottom. Suited to focused LOB screens.

**Variable** (`vLayoutConfig`) is the fuller admin chrome: optional sidebar (narrow or full / Metis), topbar, optional horizontal navbar, search/alerts/messages slots. Use it when the app needs more persistent tools than a single rail.

Switch by exporting the one you want:

```ts
export const layoutConfig = smLayoutConfig;
// export const layoutConfig = vLayoutConfig;
```

Theme enums on each config (`SideMenuTheme`, `SidebarTheme`, `TopbarTheme`, …) are Bootstrap utility class bundles from `src/models/Enums.ts`. Light and dark variants are separate properties (`theme` / `darkTheme`, `topbarTheme` / `topbarDarkTheme`). Dark mode itself is a `localStorage` flag (`darkmode`) applied as `data-bs-theme` on `<html>`.

`defaultTitle` and `titleSuffix` are document titles, not the nav label.

## Settings files (and why they exist)

Configuration is split so **auth stays on the server**, **ports stay in the dev toolchain**, and **look-and-feel stays in source you actually edit**.

### `src/layouts/config.ts`

Which shell, colors, which Variable regions are on. This is the layout product switch. It is code, not env, because you choose it per app and it ships in the bundle.

### `src/assets/scss/theme.scss`

Visual theme. Exactly **one** of the first imports should be active:

- `./bootstrap.scss` — stock Bootstrap 5, plus this repo's variable overrides
- `themes/reedo` or `themes/hockeyclub` — themes that ship with the scaffold
- a file under `bootswatch/` — Cosmo, Flatly, etc.

Then `app.scss` (layout CSS) always loads. Comment the others. This is SCSS rather than a runtime switch so unused Bootswatch CSS never ships.

### `src/menusConfig.ts`

Left-nav (and Variable sidebar) items: `path`, `label`, `icon`, optional nested `items`. Keep paths aligned with `src/routes.tsx`. Role filtering is stubbed in `SessionContext` (`TODO`); `getUserMenuItems` in `models/Utilities.ts` is the intended helper once you wire roles from the API.

### `src/routes.tsx`

URL → page component → window title. `App.tsx` wraps each route in `Layout`. Add pages here when you add screens.

### `src/appConfig.ts`

MSAL *shape* and SPA origin only. `clientId` / `authority` are placeholders; real values come from `/api/settings`. `webApiConfig.origin` is empty in dev so `fetch` uses same-origin `/api/...` and Vite proxies to the API. `redirectUri` defaults to `http://localhost:{spaPort}` and can be overridden with `REDIRECT_URI` if you ever need a non-default host. `loginRequest.scopes` (`User.Read`) is Graph for Entra; non-Entra providers use `apiScope` from settings instead.

### `vite.config.ts`

Dev server port and proxy target. `setup` writes these to match the API port you chose (`API 50xx` → SPA `30xx`). If you change the API port later, change the proxy `target` here and `applicationUrl` in the API `launchSettings.json` together. `/hub` is proxied for SignalR.

### `generate-api.js` and env files

`pnpm generate-api` pulls `swagger.json` from the running API and rewrites `src/apiClient/`. It reads `API_LOCAL_ORIGIN` from `.env` or `env.development` in this folder (e.g. `http://localhost:5011`). The generated client is what forms and pages import. Run it whenever controllers change.

`NODE_TLS_REJECT_UNAUTHORIZED=0` in that script is only so local HTTPS certificates do not block codegen. Do not point it at a public URL.

## Run

API first, then:

```bash
pnpm i
pnpm dev
```

`pnpm generate-api` with Swagger up. Production builds: `pnpm build:webapi` (output under the C# `ClientApp/dist`) or `pnpm build:fastapi`.

Sample Bootstrap/theme pages live in `sample-pages/` and are not routed. Open them if you are picking a Bootswatch file; they are not part of the app shell.
