"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormContext } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layouts";
import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import {
  getNotificationsClient,
  type AppNotification,
} from "@/services/notifications";
import {
  notificationPreferencesFormSchema,
  type NotificationPreferencesFormValues,
} from "../schemas";

const keys = createQueryKeyFactory("notifications");

function PrefFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<NotificationPreferencesFormValues>();
  const fields = [
    ["inApp", "prefInApp"],
    ["sms", "prefSms"],
    ["webPush", "prefWebPush"],
    ["quietHoursEnabled", "prefQuietHours"],
  ] as const;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map(([name, labelKey]) => (
        <label key={name} className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register(name)} />
          <span>{t(locale, "notifications", labelKey)}</span>
        </label>
      ))}
    </div>
  );
}

export function NotificationCenterView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const personaId = sessionQuery.data?.userId;
  const ctx = useMemo(
    () => ({
      personaId,
      organizationId: null,
      subjectId: null,
    }),
    [personaId],
  );
  const listQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "inbox" }),
    queryFn: () => getNotificationsClient().list(),
    enabled: Boolean(sessionQuery.data),
  });
  const prefsQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "prefs" }),
    queryFn: () => getNotificationsClient().getPreferences(),
    enabled: Boolean(sessionQuery.data),
  });
  const columns = useMemo<ColumnDef<AppNotification, unknown>[]>(
    () => [
      {
        accessorKey: "category",
        header: t(locale, "notifications", "colCategory"),
        cell: ({ row }) =>
          t(locale, "notifications", `category.${row.original.category}`),
      },
      {
        accessorKey: "title",
        header: t(locale, "notifications", "colTitle"),
      },
      {
        accessorKey: "unread",
        header: t(locale, "notifications", "colUnread"),
        cell: ({ row }) =>
          row.original.unread
            ? t(locale, "notifications", "unread")
            : t(locale, "notifications", "read"),
      },
      {
        id: "mark",
        header: t(locale, "notifications", "colActions"),
        cell: ({ row }) =>
          row.original.unread ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={async () => {
                await getNotificationsClient().markRead(
                  String(row.original.id),
                );
                await queryClient.invalidateQueries({
                  queryKey: keys.all(ctx),
                });
              }}
            >
              {t(locale, "notifications", "markRead")}
            </Button>
          ) : null,
      },
    ],
    [locale, queryClient, ctx],
  );

  if (sessionQuery.isLoading || prefsQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!sessionQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "notifications", "forbidden")} />
      </div>
    );
  }

  return (
    <AppShell title="Solo">
      <div className="space-y-6" dir={dir} lang={locale}>
        <header className="space-y-2">
          <h1 className="font-display text-2xl font-medium">
            {t(locale, "notifications", "title")}
          </h1>
          <p className="text-muted text-sm">
            {t(locale, "notifications", "subtitle")}
          </p>
        </header>
        {prefsQuery.data ? (
          <SoloForm
            schema={notificationPreferencesFormSchema}
            defaultValues={prefsQuery.data}
            submitLabel={t(locale, "notifications", "savePrefs")}
            onSubmit={async (values: NotificationPreferencesFormValues) => {
              await getNotificationsClient().updatePreferences(values);
              pushFeedback({
                tone: "success",
                title: t(locale, "notifications", "prefsSaved"),
              });
              await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
            }}
          >
            <PrefFields locale={locale} />
          </SoloForm>
        ) : null}
        {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
          <EmptyState title={t(locale, "notifications", "empty")} />
        ) : (
          <SoloDataTable
            data={listQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "notifications", "empty")}
          />
        )}
      </div>
    </AppShell>
  );
}
