"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layouts";
import {
  EmptyState,
  ErrorState,
  Input,
  Label,
  Skeleton,
} from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getSearchClient } from "@/services/search";
import { CommandPalette } from "../CommandPalette";
import {
  filterAuthorizedResults,
  filterResultsByQuery,
  mapHitsToResults,
} from "../model";

const keys = createQueryKeyFactory("search");

export function GlobalSearchView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const [query, setQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: null,
    subjectId: null,
  };
  const searchQuery = useQuery({
    queryKey: keys.list(ctx, { q: query }),
    queryFn: () => getSearchClient().search(query),
    enabled: Boolean(sessionQuery.data),
  });

  const results = useMemo(() => {
    const mapped = mapHitsToResults(searchQuery.data?.data ?? []);
    return filterAuthorizedResults(filterResultsByQuery(mapped, query));
  }, [searchQuery.data, query]);

  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!sessionQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "search", "forbidden")} />
      </div>
    );
  }

  return (
    <AppShell title="Solo">
      <div className="space-y-6" dir={dir} lang={locale}>
        <header className="space-y-2">
          <h1 className="font-display text-2xl font-medium">
            {t(locale, "search", "title")}
          </h1>
          <p className="text-muted text-sm">
            {t(locale, "search", "subtitle")}
          </p>
        </header>
        <div className="max-w-lg space-y-1.5">
          <Label htmlFor="global-search">
            {t(locale, "search", "queryLabel")}
          </Label>
          <Input
            id="global-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setPaletteOpen(true)}
            placeholder={t(locale, "search", "queryPlaceholder")}
          />
        </div>
        {searchQuery.isLoading ? <Skeleton className="h-24" /> : null}
        {!searchQuery.isLoading && results.length === 0 ? (
          <EmptyState title={t(locale, "search", "empty")} />
        ) : (
          <ul className="space-y-2">
            {results.map((result) => (
              <li key={result.id}>
                <a
                  className="text-brand text-sm underline-offset-2 hover:underline"
                  href={result.href}
                >
                  {result.title}
                  {result.entityType ? (
                    <span className="text-muted ms-2 text-xs">
                      {t(locale, "search", `entity.${result.entityType}`)}
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        )}
        <CommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          results={results}
          actions={[
            {
              id: "open-messages",
              label: t(locale, "search", "actionMessages"),
              href: "/personal/messages",
              allowed: true,
            },
          ]}
        />
      </div>
    </AppShell>
  );
}
