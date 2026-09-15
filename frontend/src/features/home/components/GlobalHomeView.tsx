"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button, ErrorState, Skeleton } from "@/components/ui";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { routes } from "@/lib/routes";
import { getAuthClient } from "@/services/auth";
import { getHomeClient } from "@/services/home";

export function GlobalHomeView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const router = useRouter();
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const personasQuery = useQuery({
    queryKey: ["home", "personas"],
    queryFn: () => getHomeClient().listPersonas(),
    enabled: Boolean(sessionQuery.data),
  });
  const contextsQuery = useQuery({
    queryKey: ["home", "contexts"],
    queryFn: () => getHomeClient().listContexts(),
    enabled: Boolean(sessionQuery.data),
  });

  if (sessionQuery.isLoading) {
    return <Skeleton className="mx-auto mt-10 h-40 max-w-2xl" />;
  }

  if (!sessionQuery.data) {
    return (
      <main
        className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-4"
        dir={dir}
        lang={locale}
      >
        <h1 className="font-display text-brand text-3xl font-semibold">Solo</h1>
        <p className="text-muted text-sm">{t(locale, "home", "noSession")}</p>
        <Button asChild>
          <Link href={`${routes.auth.login()}?lang=${locale}`}>
            {t(locale, "home", "signIn")}
          </Link>
        </Button>
      </main>
    );
  }

  const session = sessionQuery.data;

  async function invalidateScopedCaches() {
    await queryClient.invalidateQueries();
  }

  return (
    <main
      className="bg-background text-foreground mx-auto min-h-dvh max-w-2xl space-y-8 px-4 py-10"
      dir={dir}
      lang={locale}
    >
      <header className="space-y-2">
        <p className="font-display text-brand text-3xl font-semibold">Solo</p>
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "home", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "home", "subtitle")}</p>
        <p className="text-sm">
          {session.displayName} · {session.activePersona}
        </p>
      </header>

      <section className="space-y-3" aria-labelledby="persona-title">
        <h2 id="persona-title" className="font-display text-lg font-medium">
          {t(locale, "home", "personaTitle")}
        </h2>
        {personasQuery.isLoading ? <Skeleton className="h-20 w-full" /> : null}
        {personasQuery.isError ? (
          <ErrorState
            title={t(locale, "home", "error")}
            action={
              <Button
                type="button"
                onClick={() => void personasQuery.refetch()}
              >
                {t(locale, "home", "retry")}
              </Button>
            }
          />
        ) : null}
        <div className="flex flex-wrap gap-2">
          {(personasQuery.data ?? [])
            .filter((p) => p.activated)
            .map((p) => (
              <Button
                key={p.persona}
                type="button"
                variant={
                  session.activePersona === p.persona ? "primary" : "secondary"
                }
                onClick={async () => {
                  await getAuthClient().switchPersona(p.persona);
                  await invalidateScopedCaches();
                  pushFeedback({
                    tone: "success",
                    title: t(locale, "home", "switchedPersona"),
                  });
                  await sessionQuery.refetch();
                }}
              >
                {t(locale, "home", `persona.${p.persona}`)}
              </Button>
            ))}
        </div>
        {(personasQuery.data ?? []).some(
          (p) => p.persona === "teacher" && !p.activated,
        ) ? (
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              await getHomeClient().activateTeacher();
              await getAuthClient().switchPersona("teacher");
              await invalidateScopedCaches();
              pushFeedback({
                tone: "success",
                title: t(locale, "home", "teacherActivated"),
              });
              await personasQuery.refetch();
              await sessionQuery.refetch();
            }}
          >
            {t(locale, "home", "activateTeacher")}
          </Button>
        ) : null}
        {(personasQuery.data ?? []).some(
          (p) => p.persona === "student" && !p.activated,
        ) ? (
          <Button asChild variant="secondary">
            <Link href={routes.student.activate()}>
              {t(locale, "home", "activateStudent")}
            </Link>
          </Button>
        ) : null}
        {(personasQuery.data ?? []).some(
          (p) => p.persona === "guardian" && !p.activated,
        ) ? (
          <Button asChild variant="secondary">
            <Link href={routes.guardian.activate()}>
              {t(locale, "home", "activateGuardian")}
            </Link>
          </Button>
        ) : null}
      </section>

      <section className="space-y-3" aria-labelledby="context-title">
        <h2 id="context-title" className="font-display text-lg font-medium">
          {t(locale, "home", "contextTitle")}
        </h2>
        {contextsQuery.isLoading ? <Skeleton className="h-16 w-full" /> : null}
        <div className="flex flex-wrap gap-2">
          {(contextsQuery.data ?? []).map((ctx) => (
            <Button
              key={ctx.organizationId ?? "personal"}
              type="button"
              variant={
                (session.organizationId ?? null) ===
                (ctx.organizationId ?? null)
                  ? "primary"
                  : "secondary"
              }
              onClick={async () => {
                await getAuthClient().switchContext({
                  organizationId: ctx.organizationId,
                  subjectId: null,
                });
                await invalidateScopedCaches();
                pushFeedback({
                  tone: "success",
                  title: t(locale, "home", "switchedContext"),
                });
                await sessionQuery.refetch();
              }}
            >
              {ctx.kind === "personal"
                ? t(locale, "home", "personalContext")
                : ctx.label}
            </Button>
          ))}
        </div>
      </section>

      <nav className="flex flex-wrap gap-3" aria-label="Quick links">
        <Button asChild variant="secondary">
          <Link href={routes.personal.home()}>
            {t(locale, "home", "goPersonal")}
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={routes.teacher.home()}>
            {t(locale, "home", "goTeacher")}
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={routes.student.home()}>
            {t(locale, "home", "goStudent")}
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={routes.guardian.home()}>
            {t(locale, "home", "goGuardian")}
          </Link>
        </Button>
        <Button asChild>
          <Link href={routes.organization.create()}>
            {t(locale, "home", "createOrg")}
          </Link>
        </Button>
        {session.organizationId ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push(routes.organization.home(session.organizationId!))
            }
          >
            {t(locale, "home", "goOrg")}
          </Button>
        ) : null}
      </nav>
    </main>
  );
}
