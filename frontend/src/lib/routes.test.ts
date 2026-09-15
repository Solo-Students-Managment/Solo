import { describe, expect, it } from "vitest";

import {
  buildListSearch,
  isAppHomeRoute,
  routes,
  validateReturnUrl,
  withReturnUrl,
} from "./routes";

describe("typed routes", () => {
  it("builds surface routes without sensitive identifiers", () => {
    expect(routes.home()).toBe("/");
    expect(routes.teacher.home()).toBe("/teacher");
    expect(routes.personal.security()).toBe("/personal/security");
    expect(routes.personal.phone()).toBe("/personal/phone");
    expect(routes.personal.profile()).toBe("/personal/profile");
    expect(routes.auth.recover()).toBe("/auth/recover");
    expect(routes.organization.home("org_1")).toBe("/org/org_1");
    expect(routes.organization.create()).toBe("/org/new");
    expect(routes.teacher.activate()).toBe("/teacher/activate");
    expect(routes.public.profile("ali-school")).toBe("/p/ali-school");
    expect(routes.home("fa")).not.toMatch(/token|password|otp|phone/i);
    expect(isAppHomeRoute(routes.home("en"))).toBe(true);
  });

  it("serializes list search params", () => {
    expect(buildListSearch({ page: 1, tab: "active" })).toBe("?tab=active");
    expect(buildListSearch({ page: 2, sort: "name" })).toBe(
      "?page=2&sort=name",
    );
  });

  it("validates return URLs against open redirects and sensitive params", () => {
    expect(validateReturnUrl("/teacher")).toBe("/teacher");
    expect(validateReturnUrl("https://evil.example")).toBe("/");
    expect(validateReturnUrl("//evil.example")).toBe("/");
    expect(validateReturnUrl("/x?token=1")).toBe("/");
    expect(withReturnUrl(routes.auth.login(), "/teacher")).toContain(
      "returnUrl=%2Fteacher",
    );
  });
});
