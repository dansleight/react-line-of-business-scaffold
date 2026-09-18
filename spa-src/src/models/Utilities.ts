import { MenuItem } from "./Interfaces";

export const hasValidRole = (
  valid: string | string[],
  roles: string[],
): boolean => {
  const validSet = new Set(typeof valid === "string" ? [valid] : valid);
  return roles.some((role) => validSet.has(role));
};

const menuItemIsVisible = (
  menuItem: MenuItem,
  userRoles: string[] | undefined | null,
): boolean => {
  if (menuItem.roles == undefined) return true; // == will match null with undefined
  if (typeof menuItem.roles === "string" && menuItem.roles.trim() == "")
    return true;
  if (Array.isArray(menuItem.roles) && menuItem.roles.length == 0) return true;
  // we've now accounted for all scenarios where nothing is required, so we know a role is required
  if (userRoles == undefined || userRoles.length == 0) return false;
  if (typeof menuItem.roles === "string") {
    return userRoles.includes(menuItem.roles);
  }
  // both roles and userRoles are arrays
  return userRoles.some((value) => menuItem.roles?.includes(value));
};

export const getUserMenuItems = (
  menuItems: MenuItem[],
  userRoles: string[] | undefined | null,
): MenuItem[] => {
  const filteredItems: MenuItem[] = [];
  menuItems.map((menuItem) => {
    if (menuItemIsVisible(menuItem, userRoles)) {
      if (menuItem.items && menuItem.items.length > 0) {
        menuItem.items = getUserMenuItems(menuItem.items, userRoles);
        if (menuItem.items.length > 0) filteredItems.push(menuItem);
      } else {
        filteredItems.push(menuItem);
      }
    }
  });
  return filteredItems;
};

export const smartSplit = (input: string): string => {
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
};

/** SHA-256 hex of trimmed lowercase email, as Gravatar requires. */
export async function gravatarHash(email: string): Promise<string> {
  const bytes = new TextEncoder().encode(email.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
