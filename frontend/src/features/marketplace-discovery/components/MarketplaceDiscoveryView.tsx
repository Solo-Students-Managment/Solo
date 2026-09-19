"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { SoloMap } from "@/components/shared/SoloMap";
import { pushFeedback } from "@/components/shared/SoloFeedback";
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
import {
  discoveryKindSchema,
  getMarketplaceDiscoveryClient,
  toMapPoints,
  type DiscoveryFilters,
  type DiscoveryKind,
} from "@/services/marketplace-discovery";
import { getAuthClient } from "@/services/auth";

const keys = createQueryKeyFactory("marketplace-discovery");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function parseFilters(sp: URLSearchParams): DiscoveryFilters {
  const kindRaw = sp.get("kind") ?? undefined;
  const kindParsed = kindRaw
    ? discoveryKindSchema.safeParse(kindRaw)
    : undefined;
  return {
    q: sp.get("q") ?? undefined,
    kind: kindParsed?.success ? kindParsed.data : undefined,
    subject: sp.get("subject") ?? undefined,
    city: sp.get("city") ?? undefined,
  };
}

export function MarketplaceDiscoveryView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const view = searchParams.get("view") === "map" ? "map" : "list";
  const tab = searchParams.get("tab") === "saved" ? "saved" : "discover";
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const queryClient = useQueryClient();
  const ctx = { personaId: undefined, organizationId: null, subjectId: null };

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    if (!next.get("lang")) next.set("lang", locale);
    router.replace(`${pathname}?${next.toString()}`);
  }

  const searchQuery = useQuery({
    queryKey: keys.list(ctx, { ...filters, view, tab }),
    queryFn: () => getMarketplaceDiscoveryClient().search(filters),
    enabled: tab === "discover",
  });

  const savedQuery = useQuery({
    queryKey: keys.list(ctx, { tab: "saved" }),
    queryFn: () => getMarketplaceDiscoveryClient().listSaved(),
    enabled: tab === "saved",
  });

  const saveMutation = useMutation({
    mutationFn: (discoveryItemId: string) =>
      getMarketplaceDiscoveryClient().save(discoveryItemId),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "marketplaceDiscovery", "saveSuccess"),
      });
      void queryClient.invalidateQueries({
        queryKey: keys.list(ctx, { tab: "saved" }),
      });
    },
    onError: () => {
      pushFeedback({
        tone: "error",
        title: t(locale, "marketplaceDiscovery", "saveError"),
      });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (savedItemId: string) =>
      getMarketplaceDiscoveryClient().unsave(savedItemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: keys.list(ctx, { tab: "saved" }),
      });
    },
  });

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const isSignedIn = Boolean(sessionQuery.data);

  const mapPoints = toMapPoints(searchQuery.data ?? []);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "marketplaceDiscovery", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "marketplaceDiscovery", "subtitle")}
        </p>
      </header>

      <div className="flex flex-wrap gap-2" role="tablist">
        <Button
          type="button"
          variant={tab === "discover" ? "primary" : "secondary"}
          onClick={() => updateParams({ tab: null })}
        >
          {t(locale, "marketplaceDiscovery", "tabDiscover")}
        </Button>
        <Button
          type="button"
          variant={tab === "saved" ? "primary" : "secondary"}
          onClick={() => updateParams({ tab: "saved" })}
        >
          {t(locale, "marketplaceDiscovery", "tabSaved")}
        </Button>
      </div>

      {tab === "discover" ? (
        <>
          <form
            key={searchParams.toString()}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault();
              const fd = new FormData(event.currentTarget);
              updateParams({
                q: String(fd.get("q") ?? "") || null,
                kind: String(fd.get("kind") ?? "") || null,
                subject: String(fd.get("subject") ?? "") || null,
                city: String(fd.get("city") ?? "") || null,
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="disc-q">
                {t(locale, "marketplaceDiscovery", "queryLabel")}
              </Label>
              <Input
                id="disc-q"
                name="q"
                defaultValue={filters.q ?? ""}
                placeholder={t(
                  locale,
                  "marketplaceDiscovery",
                  "queryPlaceholder",
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="disc-kind">
                {t(locale, "marketplaceDiscovery", "kindLabel")}
              </Label>
              <select
                id="disc-kind"
                name="kind"
                className={selectClassName}
                defaultValue={filters.kind ?? ""}
              >
                <option value="">
                  {t(locale, "marketplaceDiscovery", "kindAll")}
                </option>
                {(["teacher", "school", "institute"] as DiscoveryKind[]).map(
                  (kind) => (
                    <option key={kind} value={kind}>
                      {t(locale, "marketplaceDiscovery", `kind.${kind}`)}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="disc-subject">
                {t(locale, "marketplaceDiscovery", "subjectLabel")}
              </Label>
              <Input
                id="disc-subject"
                name="subject"
                defaultValue={filters.subject ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="disc-city">
                {t(locale, "marketplaceDiscovery", "cityLabel")}
              </Label>
              <Input
                id="disc-city"
                name="city"
                defaultValue={filters.city ?? ""}
              />
            </div>
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
              <Button type="submit">
                {t(locale, "marketplaceDiscovery", "applyFilters")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  updateParams({
                    q: null,
                    kind: null,
                    subject: null,
                    city: null,
                  })
                }
              >
                {t(locale, "marketplaceDiscovery", "clearFilters")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  updateParams({ view: view === "map" ? "list" : "map" })
                }
              >
                {view === "map"
                  ? t(locale, "marketplaceDiscovery", "viewList")
                  : t(locale, "marketplaceDiscovery", "viewMap")}
              </Button>
            </div>
          </form>

          {searchQuery.isLoading ? <Skeleton className="h-40" /> : null}
          {searchQuery.isError ? (
            <ErrorState
              title={t(locale, "marketplaceDiscovery", "errorTitle")}
            />
          ) : null}
          {searchQuery.isSuccess && searchQuery.data.length === 0 ? (
            <EmptyState
              title={t(locale, "marketplaceDiscovery", "emptyTitle")}
            />
          ) : null}

          {searchQuery.isSuccess && searchQuery.data.length > 0 ? (
            view === "map" ? (
              <section
                aria-label={t(locale, "marketplaceDiscovery", "mapLabel")}
              >
                <SoloMap
                  points={mapPoints}
                  aria-label={t(locale, "marketplaceDiscovery", "mapResults")}
                />
              </section>
            ) : (
              <ul
                className="space-y-3"
                aria-label={t(locale, "marketplaceDiscovery", "resultsLabel")}
              >
                {searchQuery.data.map((item) => (
                  <li
                    key={item.id}
                    className="border-border bg-elevated flex flex-wrap items-start justify-between gap-3 rounded-md border p-4"
                  >
                    <div className="space-y-1">
                      <Link
                        href={`${routes.public.profile(item.slug)}?lang=${locale}`}
                        className="font-display text-lg font-medium underline-offset-2 hover:underline"
                      >
                        {item.displayName}
                      </Link>
                      <p className="text-muted text-sm">
                        {t(locale, "marketplaceDiscovery", `kind.${item.kind}`)}
                        {" · "}
                        {item.city}
                      </p>
                      {item.headline ? (
                        <p className="text-sm">{item.headline}</p>
                      ) : null}
                      <ul className="mt-1 flex flex-wrap gap-1">
                        {item.subjects.map((subject) => (
                          <li
                            key={subject}
                            className="border-border rounded border px-2 py-0.5 text-xs"
                          >
                            {subject}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={!isSignedIn || saveMutation.isPending}
                      title={
                        !isSignedIn
                          ? t(locale, "marketplaceDiscovery", "signInToSave")
                          : undefined
                      }
                      onClick={() => saveMutation.mutate(item.id)}
                    >
                      {t(locale, "marketplaceDiscovery", "saveItem")}
                    </Button>
                  </li>
                ))}
              </ul>
            )
          ) : null}
        </>
      ) : (
        <>
          {!isSignedIn ? (
            <EmptyState
              title={t(locale, "marketplaceDiscovery", "signInToSave")}
            />
          ) : savedQuery.isLoading ? (
            <Skeleton className="h-32" />
          ) : savedQuery.isError ? (
            <ErrorState
              title={t(locale, "marketplaceDiscovery", "errorTitle")}
            />
          ) : savedQuery.data && savedQuery.data.length === 0 ? (
            <EmptyState
              title={t(locale, "marketplaceDiscovery", "savedEmpty")}
            />
          ) : (
            <ul
              className="space-y-3"
              aria-label={t(locale, "marketplaceDiscovery", "savedLabel")}
            >
              {(savedQuery.data ?? []).map((item) => (
                <li
                  key={item.id}
                  className="border-border bg-elevated flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
                >
                  <Link
                    href={`${routes.public.profile(item.slug)}?lang=${locale}`}
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    {item.displayName}
                  </Link>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => unsaveMutation.mutate(item.id)}
                  >
                    {t(locale, "marketplaceDiscovery", "unsaveItem")}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
