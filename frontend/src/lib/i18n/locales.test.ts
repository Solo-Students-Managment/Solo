import { describe, expect, it } from "vitest";
import { isLocale, localeDirection, defaultLocale } from "@/lib/i18n/locales";
import {
  getFoundationMessages,
  resolveLocale,
} from "@/features/foundation/messages";
import { routes } from "@/lib/routes";

describe("locale helpers", () => {
  it("accepts only fa and en", () => {
    expect(isLocale("fa")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
  });

  it("maps direction correctly", () => {
    expect(localeDirection("fa")).toBe("rtl");
    expect(localeDirection("en")).toBe("ltr");
  });

  it("resolves invalid lang params to default locale", () => {
    expect(resolveLocale(undefined)).toBe(defaultLocale);
    expect(resolveLocale("nope")).toBe(defaultLocale);
    expect(resolveLocale(["en"])).toBe("en");
  });
});

describe("foundation messages", () => {
  it("returns localized foundation copy without product feature claims", () => {
    const fa = getFoundationMessages("fa");
    const en = getFoundationMessages("en");

    expect(fa.brand).toBe("Solo");
    expect(en.brand).toBe("Solo");
    expect(fa.description).toContain("/frontend");
    expect(en.description).toContain("/legacy");
    expect(fa.title).not.toMatch(/MockFeaturePage/i);
  });
});

describe("typed routes", () => {
  it("builds home routes without sensitive identifiers", () => {
    expect(routes.home()).toBe("/");
    expect(routes.home("en")).toBe("/?lang=en");
    expect(routes.home("fa")).not.toMatch(/token|password|otp|phone/i);
  });
});
