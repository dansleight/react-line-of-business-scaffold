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
- `themes/reedo` or `themes/hockeyclub` — original scaffold themes
- `themes/nightquay`, `draftsman`, `marquee`, `plakat`, `pilothouse`, or `gloaming` — Color Hunt palettes expanded to primary, secondary, tertiary, success, info, warning, and danger
- a file under `bootswatch/` — Cosmo, Flatly, etc.

Then `app.scss` (layout CSS) always loads. Comment the others. This is SCSS rather than a runtime switch so unused theme CSS never ships.

**Theme Lab** (`/samples/gallery`) is a live gallery of the active theme: semantic swatches, buttons, alerts, badges, progress, tables, and the form kit. Nested sample pages cover the rest of Bootstrap. Switch the import above and reload to compare. The Icons page (`/samples/icons`) shows the universal `<Icon />` tag with Font Awesome and Lucide. Data Grid (`/samples/datagrid`) shows `dataGrid<T>()` with typed columns and auto-generated columns.

Theme SCSS uses the modern Sass API (`color.mix`, `color.adjust`, `math.div`, and so on). Bootstrap 5.3 and Bootswatch still load through `@import`; Vite `quietDeps` plus `silenceDeprecations: ["import"]` cover that until Bootstrap 6. Do not add the other Sass silences back — those were hiding first-party code.

### `src/menusConfig.ts`

Left-nav (and Variable sidebar) items: `path`, `label`, `icon`, optional nested `items`. `icon` is an `AppIcon` (Font Awesome `IconDefinition` or a React component such as a Lucide export). Keep paths aligned with `src/routes.tsx`. Role filtering is stubbed in `SessionContext` (`TODO`); `getUserMenuItems` in `models/Utilities.ts` is the intended helper once you wire roles from the API.

## Icons

`<Icon icon={...} />` in `src/components/Icon.tsx` is the tag for every icon in the app. Pass a Font Awesome definition or a React component. Do not pass a string name.

```tsx
import { Icon } from "@/components/Icon";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Save } from "lucide-react";

<Icon icon={faSave} className="me-1" />
<Icon icon={Save} size="xl" className="text-primary" />
<Icon icon={faSave} spin={saving} />
```

Shared props: `size` (`xs` `sm` `lg` `xl` `2x`, a px number, or any CSS length), `className` (Bootstrap `text-*` / spacing), `fixedWidth`, `spin`, `title`, `aria-label`. Extra props (`strokeWidth`, `weight`, …) pass through to component icons.

The template ships Font Awesome (free solid + regular; swap Pro packages at work) and Lucide (`lucide-react`). Chrome and menus stay on Font Awesome so a Pro swap does not restyle the shell.

**Phosphor** is optional and is not a dependency. After `pnpm add @phosphor-icons/react`:

```tsx
import { Heart } from "@phosphor-icons/react";
<Icon icon={Heart} weight="duotone" />
```

**SVG Repo** has no npm pack. Drop a local component under `src/icons/custom/` and pass it as `icon`. Check each file’s license.

Icon-only controls need `title` or `aria-label`. Icons next to a text label default to `aria-hidden`.

## Data grids

`dataGrid<T>()` in `src/grids/kit` is the typed grid factory. Call it once at module scope so `<Grid.Column property="…" />` has intellisense for that row type. TanStack Table runs the engine; the kit renders Bootstrap tables, search, sort, paging, sticky frozen columns, and stacked cards on small viewports.

```tsx
import { dataGrid } from "@/grids/kit";

const PersonGrid = dataGrid<Person>();

<PersonGrid data={people} searchable pageSize={25}>
  <PersonGrid.Column property="displayName" header="Name" frozen="left" />
  <PersonGrid.Column property="email" />
  <PersonGrid.Column header="">
    {(row) => <Link to={`/people/${row.id}`}>Open</Link>}
  </PersonGrid.Column>
</PersonGrid>
```

Omit column children to render one column per own property (keys collected across the array, humanized headers). Pass `properties={["displayName", "email"]}` for a subset. `pageSize={false}` shows every row. Theme Lab → Data Grid has live examples.

### `src/routes.tsx`

URL → lazy page module → window title. `App.tsx` wraps each route in `Layout` and `Suspense`. Add a screen with `lazyPage` so it is its own JS chunk:

```tsx
{ path: "/people", Component: lazyPage(() => import("./pages/People"), "People"), title: "People" }
```

### Toasts

`ToastProvider` wraps the app in `main.tsx`. Call `useToast().notify(message, { accent, timeout })` from any screen. Timed toasts use `toastTimeoutMs` in `src/toastConfig.ts` (4 seconds). The host stacks at most three, oldest at the top, top-right; hovering the stack pauses every visible countdown. Theme Lab → Dialogs has fire buttons.

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

Theme Lab pages live in `src/pages/samples/` and are routed under `/samples`. Use them while picking a theme; they are tooling, not product screens. `pnpm remove-lab` deletes Theme Lab pages, `/samples` routes, and the nav item when you no longer need the gallery.
