"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { Button, ErrorState, Skeleton } from "@/components/ui";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { securityQueryKeys } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";

import { isOnline } from "../schemas";
import { ReauthForm } from "./ReauthForm";
import { SessionsPanel } from "./SessionsPanel";
import { TwoFactorPanel } from "./TwoFactorPanel";

export function AccountSecurityView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });

  const session = sessionQuery.data ?? null;
  const capability = resolveCapability(session, "account.security.manage");
  const ctx = {
    personaId: session?.userId ?? "persona:none",
    organizationId: null,
    subjectId: null,
  };

  const twoFactorQuery = useQuery({
    queryKey: securityQueryKeys.detail(ctx, "2fa"),
    queryFn: () => getAuthClient().getTwoFactorStatus(),
    enabled: Boolean(session) && capability.allowed,
  });

  if (sessionQuery.isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!session) {
    return (
      <ErrorState
        title={t(locale, "security", "capabilityDenied")}
        description={t(locale, "security", "reason.permission")}
      />
    );
  }

  if (!capability.allowed && capability.reason === "reauth_required") {
    return (
      <div className="mx-auto max-w-md space-y-4" dir={dir} lang={locale}>
        <ErrorState
          title={t(locale, "security", "reauthRequired")}
          description={t(locale, "security", "reason.reauth_required")}
        />
        <ReauthForm
          locale={locale}
          onCancel={() => undefined}
          onSubmit={async ({ password }) => {
            if (!isOnline()) {
              pushFeedback({
                tone: "error",
                title: t(locale, "security", "offline"),
              });
              return;
            }
            try {
              await getAuthClient().reauth(password);
              await queryClient.invalidateQueries({ queryKey: ["auth"] });
            } catch {
              pushFeedback({
                tone: "error",
                title: t(locale, "security", "invalidCredentials"),
              });
            }
          }}
        />
      </div>
    );
  }

  if (!capability.allowed) {
    return (
      <ErrorState
        title={t(locale, "security", "capabilityDenied")}
        description={t(locale, "security", "reason.permission")}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10" dir={dir} lang={locale}>
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "security", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "security", "subtitle")}
        </p>
      </header>

      {twoFactorQuery.isLoading ? <Skeleton className="h-32 w-full" /> : null}
      {twoFactorQuery.isError ? (
        <ErrorState
          title={t(locale, "security", "sessionsError")}
          action={
            <Button type="button" onClick={() => void twoFactorQuery.refetch()}>
              {t(locale, "security", "retry")}
            </Button>
          }
        />
      ) : null}
      {twoFactorQuery.data ? (
        <TwoFactorPanel
          locale={locale}
          status={twoFactorQuery.data}
          onChanged={() => {
            void queryClient.invalidateQueries({
              queryKey: securityQueryKeys.all(ctx),
            });
          }}
        />
      ) : null}

      <SessionsPanel locale={locale} personaId={session.userId} />
    </div>
  );
}
