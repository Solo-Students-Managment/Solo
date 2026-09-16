"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

export type AdminNavKey =
  | "dashboard"
  | "users"
  | "support"
  | "verification"
  | "audit"
  | "announcements"
  | "incidents"
  | "privacy"
  | "featureFlags"
  | "storage";

type AdminShellProps = {
  locale: Locale;
  dir: "rtl" | "ltr";
  active: AdminNavKey;
  children: ReactNode;
};

function navItems(langQuery: string) {
  return [
    {
      key: "dashboard" as const,
      href: `${routes.admin.home()}${langQuery}`,
      labelKey: "navDashboard",
    },
    {
      key: "users" as const,
      href: `${routes.admin.users()}${langQuery}`,
      labelKey: "navUsers",
    },
    {
      key: "support" as const,
      href: `${routes.admin.support()}${langQuery}`,
      labelKey: "navSupport",
    },
    {
      key: "verification" as const,
      href: `${routes.admin.verification()}${langQuery}`,
      labelKey: "navVerification",
    },
    {
      key: "audit" as const,
      href: `${routes.admin.audit()}${langQuery}`,
      labelKey: "navAudit",
    },
    {
      key: "announcements" as const,
      href: `${routes.admin.announcements()}${langQuery}`,
      labelKey: "navAnnouncements",
    },
    {
      key: "incidents" as const,
      href: `${routes.admin.incidents()}${langQuery}`,
      labelKey: "navIncidents",
    },
    {
      key: "privacy" as const,
      href: `${routes.admin.privacy()}${langQuery}`,
      labelKey: "navPrivacy",
    },
    {
      key: "featureFlags" as const,
      href: `${routes.admin.featureFlags()}${langQuery}`,
      labelKey: "navFeatureFlags",
    },
    {
      key: "storage" as const,
      href: `${routes.admin.storage()}${langQuery}`,
      labelKey: "navStorage",
    },
  ];
}

export function AdminShell({ locale, dir, active, children }: AdminShellProps) {
  const langQuery = `?lang=${locale}`;
  return (
    <div
      className="bg-canvas text-foreground flex min-h-dvh"
      dir={dir}
      lang={locale}
    >
      <aside className="border-border bg-elevated hidden w-64 shrink-0 border-e p-4 md:block">
        <p className="font-display text-lg font-medium">Solo</p>
        <p className="text-muted mb-4 text-xs">
          {t(locale, "admin", "shellTitle")}
        </p>
        <nav
          aria-label={t(locale, "admin", "navLabel")}
          className="flex flex-col gap-1"
        >
          {navItems(langQuery).map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm",
                active === item.key
                  ? "bg-brand text-brand-foreground"
                  : "hover:bg-sunken",
              )}
            >
              {t(locale, "admin", item.labelKey)}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 space-y-6 p-4 md:p-6">{children}</main>
    </div>
  );
}
