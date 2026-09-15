export type ThemeMode = "light" | "dark" | "system";

export function resolveThemeMode(
  mode: ThemeMode,
  prefersDark: boolean,
): "light" | "dark" {
  if (mode === "system") {
    return prefersDark ? "dark" : "light";
  }
  return mode;
}

export function applyThemeMode(
  root: {
    classList: { toggle: (token: string, force?: boolean) => void };
    dataset: DOMStringMap;
  },
  mode: ThemeMode,
  prefersDark: boolean,
): "light" | "dark" {
  const resolved = resolveThemeMode(mode, prefersDark);
  root.classList.toggle("dark", resolved === "dark");
  root.dataset.theme = mode;
  return resolved;
}

export const REQUIRED_TOKEN_VARS = [
  "--solo-surface-canvas",
  "--solo-text-primary",
  "--solo-brand",
  "--solo-status-danger",
  "--solo-ring",
  "--solo-radius-md",
  "--solo-motion-normal",
] as const;
