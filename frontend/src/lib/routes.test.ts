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
    expect(routes.organization.members("org_1")).toBe("/org/org_1/members");
    expect(routes.organization.branches("org_1")).toBe("/org/org_1/branches");
    expect(routes.organization.facilities("org_1")).toBe(
      "/org/org_1/facilities",
    );
    expect(routes.organization.departments("org_1")).toBe(
      "/org/org_1/departments",
    );
    expect(routes.organization.positions("org_1")).toBe("/org/org_1/positions");
    expect(routes.organization.directory("org_1")).toBe("/org/org_1/directory");
    expect(routes.organization.roles("org_1")).toBe("/org/org_1/roles");
    expect(routes.organization.policies("org_1")).toBe("/org/org_1/policies");
    expect(routes.organization.shifts("org_1")).toBe("/org/org_1/shifts");
    expect(routes.organization.leave("org_1")).toBe("/org/org_1/leave");
    expect(routes.organization.staffAttendance("org_1")).toBe(
      "/org/org_1/staff-attendance",
    );
    expect(routes.organization.employeeDocuments("org_1")).toBe(
      "/org/org_1/employee-documents",
    );
    expect(routes.organization.onboarding("org_1")).toBe(
      "/org/org_1/onboarding",
    );
    expect(routes.organization.offboarding("org_1")).toBe(
      "/org/org_1/offboarding",
    );
    expect(routes.organization.approvals("org_1")).toBe("/org/org_1/approvals");
    expect(routes.organization.tasks("org_1")).toBe("/org/org_1/tasks");
    expect(routes.organization.knowledgeBase("org_1")).toBe(
      "/org/org_1/knowledge-base",
    );
    expect(routes.organization.forms("org_1")).toBe("/org/org_1/forms");
    expect(routes.organization.formSubmissions("org_1")).toBe(
      "/org/org_1/form-submissions",
    );
    expect(routes.organization.customization("org_1")).toBe(
      "/org/org_1/customization",
    );
    expect(routes.organization.automation("org_1")).toBe(
      "/org/org_1/automation",
    );
    expect(routes.organization.crm("org_1")).toBe("/org/org_1/crm");
    expect(routes.organization.dataOps("org_1")).toBe("/org/org_1/data-ops");
    expect(routes.organization.events("org_1")).toBe("/org/org_1/events");
    expect(routes.organization.analytics("org_1")).toBe("/org/org_1/analytics");
    expect(routes.organization.bulkActions("org_1")).toBe(
      "/org/org_1/bulk-actions",
    );
    expect(routes.organization.pricing("org_1")).toBe("/org/org_1/pricing");
    expect(routes.organization.checkout("org_1")).toBe("/org/org_1/checkout");
    expect(routes.organization.taxInvoices("org_1")).toBe(
      "/org/org_1/tax-invoices",
    );
    expect(routes.organization.cancel("org_1")).toBe("/org/org_1/cancel");
    expect(routes.organization.planVersions("org_1")).toBe(
      "/org/org_1/plan-versions",
    );
    expect(routes.organization.subscription("org_1")).toBe(
      "/org/org_1/subscription",
    );
    expect(routes.organization.planChange("org_1")).toBe(
      "/org/org_1/plan-change",
    );
    expect(routes.organization.billing("org_1")).toBe("/org/org_1/billing");
    expect(routes.public.form("parent-feedback")).toBe("/f/parent-feedback");
    expect(routes.organization.evaluations("org_1")).toBe(
      "/org/org_1/evaluations",
    );
    expect(routes.organization.questionBank("org_1")).toBe(
      "/org/org_1/question-bank",
    );
    expect(routes.organization.exams("org_1")).toBe("/org/org_1/exams");
    expect(routes.organization.curriculum("org_1")).toBe(
      "/org/org_1/curriculum",
    );
    expect(routes.organization.lessonPlans("org_1")).toBe(
      "/org/org_1/lesson-plans",
    );
    expect(routes.teacher.activate()).toBe("/teacher/activate");
    expect(routes.teacher.plans()).toBe("/teacher/plans");
    expect(routes.student.home()).toBe("/student");
    expect(routes.student.activate()).toBe("/student/activate");
    expect(routes.guardian.home()).toBe("/guardian");
    expect(routes.guardian.activate()).toBe("/guardian/activate");
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
