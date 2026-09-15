"use client";

import { getPublicEnv, isProductionEnv } from "@/config/env";

const LABELS: Record<string, { fa: string; en: string }> = {
  local: { fa: "محلی", en: "Local" },
  development: { fa: "توسعه", en: "Development" },
  preview: { fa: "پیش‌نمایش", en: "Preview" },
  staging: { fa: "استیجینگ", en: "Staging" },
};

type EnvironmentBadgeProps = {
  locale?: "fa" | "en";
};

export function EnvironmentBadge({ locale = "fa" }: EnvironmentBadgeProps) {
  const env = getPublicEnv();
  if (isProductionEnv(env)) {
    return null;
  }

  const label =
    LABELS[env.NEXT_PUBLIC_APP_ENV]?.[locale] ?? env.NEXT_PUBLIC_APP_ENV;

  return (
    <div
      role="status"
      className="border-border bg-elevated text-muted pointer-events-none fixed end-3 bottom-3 z-50 rounded-md border px-2 py-1 text-xs shadow-sm"
    >
      {label}
    </div>
  );
}
