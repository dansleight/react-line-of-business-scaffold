# Shell

## Boot

`main.tsx` renders `SettingsProvider`, then toasts, then `App`. It does not render at all inside MSAL's hidden iframe. That exception is in [auth.md](auth.md).

`SettingsProvider` calls `GET /api/settings` before the rest of the tree matters. The payload includes `msalSettings`. If the call fails, the SPA stops on an error screen. That is the API being down, or Entra config missing on the server. `App.tsx` builds MSAL from those settings.

## Layouts

Two shells, one set of routes. Pick the shell in `src/layouts/config.ts`.

`smLayoutConfig` is the default. Narrow left rail, logo, nav, avatar at the bottom.

`vLayoutConfig` is the wide chrome: optional sidebar, topbar, optional navbar. Theme class names on each config (`SideMenuTheme`, `SidebarTheme`, `TopbarTheme`, and their `dark` twins) are Bootstrap utility bundles from `src/models/Enums.ts`.

```ts
export const layoutConfig = smLayoutConfig;
// export const layoutConfig = vLayoutConfig;
```

`defaultTitle` and `titleSuffix` are the document title, not the nav label.

## Routes and menus

`src/routes.tsx` maps a path to a lazy page and a window title. `App.tsx` wraps each route in the layout and `Suspense`.

```tsx
{ path: "/people", Component: lazyPage(() => import("./pages/People"), "People"), title: "People" }
```

`lazyPage` imports a named export so the screen is its own chunk. The export name and the component name match.

`src/menusConfig.ts` is the nav: `path`, `label`, `icon`, and optional nested `items`. `icon` is an `AppIcon` (a Font Awesome definition or a component such as a Lucide icon). A route with no menu item is unreachable from the chrome. A menu item with no route is a dead link. Change them together.

Role filtering is still a stub. `getUserMenuItems` in `src/models/Utilities.ts` is the helper to use once the API sends roles.

## Headcrumb

`Headcrumb` in `src/components/Headcrumb.tsx` is the screen title, with optional parents.

| Props | Result |
|---|---|
| `title` | The `<h1>` |
| `parent` | One parent, not a link |
| `titles` and `paths` | Every title except the last is a parent. A path at the same index becomes a `Link`. The last title is the `<h1>` |

Parents render in a lighter weight, separated by `/`.

## Color mode

The preference is `light`, `dark`, or `follow`, stored in `localStorage` as `colormode`. `follow` listens to `prefers-color-scheme` and only while it is selected. A legacy `darkmode` boolean is read once (`true` becomes `dark`, `false` becomes `light`) and removed on the next save. Missing storage means `follow`.

`setColorMode` is the setter. `darkMode` is the resolved boolean. Layout chrome reads `darkMode`. The control is `ColorModeSwitch` (Light / Dark / Follow). The variable-layout header button cycles the same three.
