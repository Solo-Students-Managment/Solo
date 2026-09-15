"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

type OrgShellProps = {
  locale: Locale;
  dir: "rtl" | "ltr";
  orgId: string;
  orgName: string;
  active: "home" | "members" | "subjects" | "students";
  children: ReactNode;
};

export function OrgShell({
  locale,
  dir,
  orgId,
  orgName,
  active,
  children,
}: OrgShellProps) {
  const langQuery = locale === "en" ? "?lang=en" : "?lang=fa";

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
          <Link
            href={`${routes.organization.home(orgId)}${langQuery}`}
            className={cn(
              "hover:bg-sunken rounded-md px-3 py-2 text-sm",
              active === "home" && "bg-sunken font-medium",
            )}
          >
            {t(locale, "organization", "navHome")}
          </Link>
          <Link
            href={`${routes.organization.members(orgId)}${langQuery}`}
            className={cn(
              "hover:bg-sunken rounded-md px-3 py-2 text-sm",
              active === "members" && "bg-sunken font-medium",
            )}
          >
            {t(locale, "organization", "navMembers")}
          </Link>
          <Link
            href={`${routes.organization.subjects(orgId)}${langQuery}`}
            className={cn(
              "hover:bg-sunken rounded-md px-3 py-2 text-sm",
              active === "subjects" && "bg-sunken font-medium",
            )}
          >
            {t(locale, "organization", "navSubjects")}
          </Link>
          <Link
            href={`${routes.organization.students(orgId)}${langQuery}`}
            className={cn(
              "hover:bg-sunken rounded-md px-3 py-2 text-sm",
              active === "students" && "bg-sunken font-medium",
            )}
          >
            {t(locale, "organization", "navStudents")}
          </Link>
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
        <Link
          href={`${routes.organization.home(orgId)}${langQuery}`}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm whitespace-nowrap",
            active === "home" && "bg-sunken font-medium",
          )}
        >
          {t(locale, "organization", "navHome")}
        </Link>
        <Link
          href={`${routes.organization.members(orgId)}${langQuery}`}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm whitespace-nowrap",
            active === "members" && "bg-sunken font-medium",
          )}
        >
          {t(locale, "organization", "navMembers")}
        </Link>
        <Link
          href={`${routes.organization.subjects(orgId)}${langQuery}`}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm whitespace-nowrap",
            active === "subjects" && "bg-sunken font-medium",
          )}
        >
          {t(locale, "organization", "navSubjects")}
        </Link>
        <Link
          href={`${routes.organization.students(orgId)}${langQuery}`}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm whitespace-nowrap",
            active === "students" && "bg-sunken font-medium",
          )}
        >
          {t(locale, "organization", "navStudents")}
        </Link>
      </div>
      <main className="flex-1 space-y-6 px-4 py-6">{children}</main>
    </div>
  );
}
