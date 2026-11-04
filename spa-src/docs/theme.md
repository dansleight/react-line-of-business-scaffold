# Theme, icons, and the logo

## One compiled theme

`src/assets/scss/theme.scss` has one active import, then `app.scss`. Comment the others. Unused theme CSS stays out of the bundle. This is a build choice, not a runtime switch.

- `./bootstrap.scss` is stock Bootstrap 5 plus this repo's variable overrides.
- `themes/reedo` and `themes/hockeyclub` are the original scaffold themes.
- `themes/nightquay`, `draftsman`, `marquee`, `plakat`, `pilothouse`, and `gloaming` are Color Hunt palettes expanded to the full Bootstrap color set.
- A file under `bootswatch/` is Cosmo, Flatly, and the rest.

Sass uses the modern API (`color.mix`, `color.adjust`, `math.div`). Bootstrap 5.3 and Bootswatch still load through `@import`. Vite's `silenceDeprecations` list is `["import"]` only. Do not add the other silences back.

**Theme Lab** (`/samples/gallery`) is the live gallery of the active theme: swatches, buttons, alerts, the form kit, grids, and the other Bootstrap surfaces. Switch the import above and reload to compare.

Theme Lab pages live in `src/pages/samples/` and are routed under `/samples`. `pnpm remove-lab` deletes Theme Lab pages, `/samples` routes, the nav item, and this gallery paragraph.

## Icons

`<Icon icon={...} />` in `src/components/Icon.tsx` is the only icon tag. Pass a Font Awesome definition or a component. Do not pass a string name.

```tsx
import { Icon } from "@/components/Icon";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Save } from "lucide-react";

<Icon icon={faSave} className="me-1" />
<Icon icon={Save} size="xl" className="text-primary" />
```

Shared props are `size` (`xs`, `sm`, `lg`, `xl`, `2x`, a pixel number, or any CSS length), `className`, `fixedWidth`, `spin`, `title`, and `aria-label`. Extra props such as `strokeWidth` pass through to component icons.

The template ships Font Awesome free (solid and regular) and Lucide. Chrome and menus stay on Font Awesome so a Pro swap does not restyle the shell. Phosphor is not a dependency. An SVG you own can live under `src/icons/custom/` and be passed as `icon`. Check the file's license.

Icon-only controls need `title` or `aria-label`. Icons next to a text label default to `aria-hidden`.

## Logo

`pnpm set-logo` asks for a Font Awesome glyph and writes `src/components/Logo.tsx`, plus the favicon files. The free kit is what the template is allowed to ship. A production app needs a license. If a glyph overflows the viewBox (for example a wide person icon), edit `viewBox` in `Logo.tsx`.

## NoteCard

`NoteCard` is a compressed header (title, switches, buttons, an ellipsis menu) over a body. The ellipsis is a raw SVG so the control still renders if an icon package is removed. Spacing and the header's fixed height live in `src/assets/scss/custom/_notecards.scss`. Pass `className` for a surface such as `bg-primary text-bg-primary`. The Containers page in Theme Lab is the example.

## Toasts

`useToast().notify(message, { accent, timeout })` works from any screen under `ToastProvider`. The default timeout is `toastTimeoutMs` in `src/toastConfig.ts` (4 seconds). The host shows at most three, oldest at the top, top-right. Hovering the stack pauses the countdowns.
