export enum TopbarTheme {
  Light = "bg-light text-bg-light",
  Dark = "bg-dark text-bg-dark",
  Primary = "bg-primary text-bg-primary",
  Secondary = "bg-secondary text-bg-secondary",
  Tertiary = "bg-tertiary text-bg-tertiary",
  Black = "bg-black text-gray-200",
  Deep = "bg-gray-900 text-gray-200",
}

export enum NavbarTheme {
  Light = "bg-light text-bg-light",
  Dark = "bg-dark text-bg-dark",
  Primary = "bg-primary text-bg-primary",
  Secondary = "bg-secondary text-bg-secondary",
  Tertiary = "bg-tertiary text-bg-tertiary",
  Black = "bg-black text-gray-200",
  Deep = "bg-gray-900 text-gray-200",
}

export enum SidebarTheme {
  Light = "bg-light text-bg-light",
  Dark = "bg-dark text-bg-dark",
  Primary = "bg-primary text-bg-primary",
  Secondary = "bg-secondary text-bg-secondary",
  Tertiary = "bg-tertiary text-bg-tertiary",
  Black = "bg-black text-gray-200",
  Deep = "bg-gray-900 text-gray-200",
  Info = "bg-info text-white",
}

export enum SideMenuTheme {
  Light = "bg-light text-bg-light",
  Dark = "bg-dark text-bg-dark",
  Primary = "bg-primary text-bg-primary",
  Secondary = "bg-secondary text-bg-secondary",
  Tertiary = "bg-tertiary text-bg-tertiary",
  Black = "bg-black text-gray-200",
  Deep = "bg-gray-900 text-gray-200",
  Info = "bg-info text-white",
  Body = "bg-body text-bg-body",
}

export enum TextColor {
  Primary = "text-primary",
  BgPrimary = "bg-transparent text-bg-primary",
  Secondary = "text-secondary",
  BgSecondary = "bg-transparent text-bg-secondary",
  Tertiary = "text-tertiary",
  BgTertiary = "bg-transparent text-bg-tertiary",
  Black = "text-black",
  BgBlack = "text-gray-200",
  Deep = "text-gray-900",
  BgDeep = "text-gray-100",
  Info = "text-info",
  BgInfo = "bg-transparent text-bg-info",
  BgBody = "bg-transparent text-bg-body",
  Warning = "text-warning",
  BgWarning = "bg-transparent text-bg-warning",
  Success = "text-success",
  BgSuccess = "bg-transparent text-bg-success",
  Danger = "text-danger",
  BgDanger = "bg-transparent text-bg-danger",
  Muted = "text-muted",
}

export enum LayoutType {
  SideMenu = "sidemenu",
  Variable = "variable",
}

/*
------------------------------------------------------------------------------------------------------
Grid Breakpoints
  This enum and array must be defined to match the values that bootstrap is using.
------------------------------------------------------------------------------------------------------
*/
export enum GridBreakpoint {
  xs = 0,
  sm = 576,
  md = 768,
  lg = 992,
  xl = 1200,
  xxl = 1400,
}

export const gridBreakpoints: GridBreakpoint[] = [
  GridBreakpoint.xs,
  GridBreakpoint.sm,
  GridBreakpoint.md,
  GridBreakpoint.lg,
  GridBreakpoint.xl,
  GridBreakpoint.xxl,
];
