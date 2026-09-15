"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

type OrgNavKey =
  | "home"
  | "members"
  | "branches"
  | "facilities"
  | "departments"
  | "positions"
  | "directory"
  | "roles"
  | "policies"
  | "shifts"
  | "leave"
  | "staffAttendance"
  | "employeeDocuments"
  | "onboarding"
  | "offboarding"
  | "approvals"
  | "tasks"
  | "knowledgeBase"
  | "forms"
  | "formSubmissions"
  | "subjects"
  | "students"
  | "courses"
  | "enrollments"
  | "sessions"
  | "attendance"
  | "assignments"
  | "gradebook"
  | "evaluations"
  | "questionBank"
  | "exams"
  | "curriculum"
  | "lessonPlans"
  | "tuition"
  | "resources"
  | "reports";

type OrgShellProps = {
  locale: Locale;
  dir: "rtl" | "ltr";
  orgId: string;
  orgName: string;
  active: OrgNavKey;
  children: ReactNode;
};

function navItems(orgId: string, langQuery: string) {
  return [
    {
      key: "home" as const,
      href: `${routes.organization.home(orgId)}${langQuery}`,
      labelKey: "navHome",
    },
    {
      key: "members" as const,
      href: `${routes.organization.members(orgId)}${langQuery}`,
      labelKey: "navMembers",
    },
    {
      key: "branches" as const,
      href: `${routes.organization.branches(orgId)}${langQuery}`,
      labelKey: "navBranches",
    },
    {
      key: "facilities" as const,
      href: `${routes.organization.facilities(orgId)}${langQuery}`,
      labelKey: "navFacilities",
    },
    {
      key: "departments" as const,
      href: `${routes.organization.departments(orgId)}${langQuery}`,
      labelKey: "navDepartments",
    },
    {
      key: "positions" as const,
      href: `${routes.organization.positions(orgId)}${langQuery}`,
      labelKey: "navPositions",
    },
    {
      key: "directory" as const,
      href: `${routes.organization.directory(orgId)}${langQuery}`,
      labelKey: "navDirectory",
    },
    {
      key: "roles" as const,
      href: `${routes.organization.roles(orgId)}${langQuery}`,
      labelKey: "navRoles",
    },
    {
      key: "policies" as const,
      href: `${routes.organization.policies(orgId)}${langQuery}`,
      labelKey: "navPolicies",
    },
    {
      key: "shifts" as const,
      href: `${routes.organization.shifts(orgId)}${langQuery}`,
      labelKey: "navShifts",
    },
    {
      key: "leave" as const,
      href: `${routes.organization.leave(orgId)}${langQuery}`,
      labelKey: "navLeave",
    },
    {
      key: "staffAttendance" as const,
      href: `${routes.organization.staffAttendance(orgId)}${langQuery}`,
      labelKey: "navStaffAttendance",
    },
    {
      key: "employeeDocuments" as const,
      href: `${routes.organization.employeeDocuments(orgId)}${langQuery}`,
      labelKey: "navEmployeeDocuments",
    },
    {
      key: "onboarding" as const,
      href: `${routes.organization.onboarding(orgId)}${langQuery}`,
      labelKey: "navOnboarding",
    },
    {
      key: "offboarding" as const,
      href: `${routes.organization.offboarding(orgId)}${langQuery}`,
      labelKey: "navOffboarding",
    },
    {
      key: "approvals" as const,
      href: `${routes.organization.approvals(orgId)}${langQuery}`,
      labelKey: "navApprovals",
    },
    {
      key: "tasks" as const,
      href: `${routes.organization.tasks(orgId)}${langQuery}`,
      labelKey: "navTasks",
    },
    {
      key: "knowledgeBase" as const,
      href: `${routes.organization.knowledgeBase(orgId)}${langQuery}`,
      labelKey: "navKnowledgeBase",
    },
    {
      key: "forms" as const,
      href: `${routes.organization.forms(orgId)}${langQuery}`,
      labelKey: "navForms",
    },
    {
      key: "formSubmissions" as const,
      href: `${routes.organization.formSubmissions(orgId)}${langQuery}`,
      labelKey: "navFormSubmissions",
    },
    {
      key: "subjects" as const,
      href: `${routes.organization.subjects(orgId)}${langQuery}`,
      labelKey: "navSubjects",
    },
    {
      key: "students" as const,
      href: `${routes.organization.students(orgId)}${langQuery}`,
      labelKey: "navStudents",
    },
    {
      key: "courses" as const,
      href: `${routes.organization.courses(orgId)}${langQuery}`,
      labelKey: "navCourses",
    },
    {
      key: "enrollments" as const,
      href: `${routes.organization.enrollments(orgId)}${langQuery}`,
      labelKey: "navEnrollments",
    },
    {
      key: "sessions" as const,
      href: `${routes.organization.sessions(orgId)}${langQuery}`,
      labelKey: "navSessions",
    },
    {
      key: "attendance" as const,
      href: `${routes.organization.attendance(orgId)}${langQuery}`,
      labelKey: "navAttendance",
    },
    {
      key: "assignments" as const,
      href: `${routes.organization.assignments(orgId)}${langQuery}`,
      labelKey: "navAssignments",
    },
    {
      key: "gradebook" as const,
      href: `${routes.organization.gradebook(orgId)}${langQuery}`,
      labelKey: "navGradebook",
    },
    {
      key: "evaluations" as const,
      href: `${routes.organization.evaluations(orgId)}${langQuery}`,
      labelKey: "navEvaluations",
    },
    {
      key: "questionBank" as const,
      href: `${routes.organization.questionBank(orgId)}${langQuery}`,
      labelKey: "navQuestionBank",
    },
    {
      key: "exams" as const,
      href: `${routes.organization.exams(orgId)}${langQuery}`,
      labelKey: "navExams",
    },
    {
      key: "curriculum" as const,
      href: `${routes.organization.curriculum(orgId)}${langQuery}`,
      labelKey: "navCurriculum",
    },
    {
      key: "lessonPlans" as const,
      href: `${routes.organization.lessonPlans(orgId)}${langQuery}`,
      labelKey: "navLessonPlans",
    },
    {
      key: "tuition" as const,
      href: `${routes.organization.tuition(orgId)}${langQuery}`,
      labelKey: "navTuition",
    },
    {
      key: "resources" as const,
      href: `${routes.organization.resources(orgId)}${langQuery}`,
      labelKey: "navResources",
    },
    {
      key: "reports" as const,
      href: `${routes.organization.reports(orgId)}${langQuery}`,
      labelKey: "navReports",
    },
  ];
}

export function OrgShell({
  locale,
  dir,
  orgId,
  orgName,
  active,
  children,
}: OrgShellProps) {
  const langQuery = locale === "en" ? "?lang=en" : "?lang=fa";
  const items = navItems(orgId, langQuery);

  return (
    <div
      className="bg-background text-foreground flex min-h-dvh flex-col md:flex-row"
      dir={dir}
      lang={locale}
    >
      <aside className="border-border bg-elevated hidden w-64 shrink-0 border-e p-4 md:flex md:flex-col">
        <p className="font-display text-brand mb-2 text-2xl font-semibold">
          Solo
        </p>
        <p className="text-muted mb-6 text-xs">{orgName}</p>
        <nav className="flex flex-col gap-2" aria-label="Organization">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "hover:bg-sunken rounded-md px-3 py-2 text-sm",
                active === item.key && "bg-sunken font-medium",
              )}
            >
              {t(locale, "organization", item.labelKey)}
            </Link>
          ))}
          <span className="text-muted px-3 py-2 text-sm">
            {t(locale, "organization", "navSettings")}
          </span>
          <Link
            href={routes.home(locale)}
            className="hover:bg-sunken rounded-md px-3 py-2 text-sm"
          >
            {t(locale, "organization", "navGlobalHome")}
          </Link>
        </nav>
      </aside>
      <div className="border-border flex gap-2 overflow-x-auto border-b px-4 py-3 md:hidden">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm whitespace-nowrap",
              active === item.key && "bg-sunken font-medium",
            )}
          >
            {t(locale, "organization", item.labelKey)}
          </Link>
        ))}
      </div>
      <main className="flex-1 space-y-6 px-4 py-6">{children}</main>
    </div>
  );
}
