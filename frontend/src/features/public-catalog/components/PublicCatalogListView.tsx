"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Label,
  Skeleton,
} from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { routes } from "@/lib/routes";
import { getPublicCatalogClient } from "@/services/public-catalog";

const keys = createQueryKeyFactory("public-catalog");

export function PublicCatalogListView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const q = searchParams.get("q") ?? undefined;
  const subject = searchParams.get("subject") ?? undefined;
  const ctx = { personaId: undefined, organizationId: null, subjectId: null };

  const listQuery = useQuery({
    queryKey: keys.list(ctx, { q, subject }),
    queryFn: () => getPublicCatalogClient().list({ q, subject }),
  });

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    if (!next.get("lang")) next.set("lang", locale);
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "publicCatalog", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "publicCatalog", "subtitle")}
        </p>
      </header>

      <form
        key={searchParams.toString()}
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const fd = new FormData(event.currentTarget);
          updateParams({
            q: String(fd.get("q") ?? "") || null,
            subject: String(fd.get("subject") ?? "") || null,
          });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="cat-q">
            {t(locale, "publicCatalog", "queryLabel")}
          </Label>
          <Input id="cat-q" name="q" defaultValue={q ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-subject">
            {t(locale, "publicCatalog", "subjectLabel")}
          </Label>
          <Input id="cat-subject" name="subject" defaultValue={subject ?? ""} />
        </div>
        <Button type="submit">
          {t(locale, "publicCatalog", "applyFilters")}
        </Button>
      </form>

      {listQuery.isLoading ? <Skeleton className="h-40" /> : null}
      {listQuery.isError ? (
        <ErrorState title={t(locale, "publicCatalog", "errorTitle")} />
      ) : null}
      {listQuery.isSuccess && listQuery.data.length === 0 ? (
        <EmptyState title={t(locale, "publicCatalog", "emptyTitle")} />
      ) : null}
      {listQuery.isSuccess && listQuery.data.length > 0 ? (
        <ul
          className="space-y-3"
          aria-label={t(locale, "publicCatalog", "resultsLabel")}
        >
          {listQuery.data.map((entry) => (
            <li
              key={entry.id}
              className="border-border bg-elevated space-y-1 rounded-md border p-4"
            >
              <Link
                href={`${routes.public.catalogDetail(entry.slug)}?lang=${locale}`}
                className="font-display text-lg font-medium underline-offset-2 hover:underline"
              >
                {entry.title}
              </Link>
              <p className="text-muted text-sm">
                {entry.providerName} · {entry.subject} ·{" "}
                {t(locale, "publicCatalog", `status.${entry.status}`)}
              </p>
              {entry.summary ? (
                <p className="text-sm">{entry.summary}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
