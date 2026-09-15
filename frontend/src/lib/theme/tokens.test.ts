import { describe, expect, it } from "vitest";

import {
  applyThemeMode,
  REQUIRED_TOKEN_VARS,
  resolveThemeMode,
} from "./tokens";

describe("theme tokens", () => {
  it("resolves system preference", () => {
    expect(resolveThemeMode("system", true)).toBe("dark");
    expect(resolveThemeMode("system", false)).toBe("light");
    expect(resolveThemeMode("dark", false)).toBe("dark");
  });

  it("applies dark class for dark mode", () => {
    const toggled: Array<[string, boolean | undefined]> = [];
    const root = {
      classList: {
        toggle: (token: string, force?: boolean) => {
          toggled.push([token, force]);
        },
      },
      dataset: {} as DOMStringMap,
    };
    expect(applyThemeMode(root, "dark", false)).toBe("dark");
    expect(toggled).toEqual([["dark", true]]);
    expect(root.dataset.theme).toBe("dark");
  });

  it("lists required semantic token variables", () => {
    expect(REQUIRED_TOKEN_VARS.length).toBeGreaterThan(5);
    expect(REQUIRED_TOKEN_VARS).toContain("--solo-brand");
  });
});
