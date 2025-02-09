export enum TopbarTheme {
  Light = "bg-light text-gray-900",
  Dark = "bg-dark text-gray-200",
  Primary = "bg-primary text-gray-100",
  Secondary = "bg-secondary text-white",
  Tertiary = "bg-tertiary text-gray-800",
  Black = "bg-black text-gray-200",
  Deep = "bg-gray-900 text-gray-200",
}

export enum NavbarTheme {
  Light = "bg-light text-gray-900",
  Dark = "bg-dark text-gray-200",
  Primary = "bg-primary text-gray-100",
  Secondary = "bg-secondary text-white",
  Tertiary = "bg-gray-800 text-gray-200",
  Black = "bg-black text-gray-200",
  Deep = "bg-gray-900 text-gray-200",
}

export enum SidebarTheme {
  Light = "bg-light text-gray-900",
  Dark = "bg-dark text-gray-200",
  Primary = "bg-gradient-primary text-gray-100",
  Secondary = "bg-gradient-secondary text-gray-800",
  Tertiary = "bg-tertiary text-gray-800",
  Black = "bg-black text-gray-200",
  Deep = "bg-gray-900 text-gray-200",
  Info = "bg-info text-white",
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
