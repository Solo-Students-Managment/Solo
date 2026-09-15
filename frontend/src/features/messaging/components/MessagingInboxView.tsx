"use client";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormContext } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layouts";
import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
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
import { getMessagingClient, type MessageThread } from "@/services/messaging";
import {
  sendBroadcastSchema,
  sendDirectSchema,
  type SendBroadcastValues,
  type SendDirectValues,
} from "../schemas";

const keys = createQueryKeyFactory("messaging");

function DirectFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<SendDirectValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="msg-subject">
          {t(locale, "messaging", "subjectLabel")}
        </Label>
        <Input id="msg-subject" {...register("subjectScope")} />
        <SoloFieldError name="subjectScope" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="msg-to">
          {t(locale, "messaging", "participantLabel")}
        </Label>
        <Input id="msg-to" {...register("participantLabel")} />
        <SoloFieldError name="participantLabel" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="msg-body">{t(locale, "messaging", "bodyLabel")}</Label>
        <Input id="msg-body" {...register("body")} />
        <SoloFieldError name="body" />
      </div>
    </>
  );
}

function BroadcastFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<SendBroadcastValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="bc-subject">
          {t(locale, "messaging", "subjectLabel")}
        </Label>
        <Input id="bc-subject" {...register("subjectScope")} />
        <SoloFieldError name="subjectScope" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bc-body">{t(locale, "messaging", "bodyLabel")}</Label>
        <Input id="bc-body" {...register("body")} />
        <SoloFieldError name="body" />
      </div>
    </>
  );
}

export function MessagingInboxView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: null,
    subjectId: null,
  };
  const listQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "threads" }),
    queryFn: () => getMessagingClient().listThreads(),
    enabled: Boolean(sessionQuery.data),
  });
  const columns = useMemo<ColumnDef<MessageThread, unknown>[]>(
    () => [
      { accessorKey: "kind", header: t(locale, "messaging", "colKind") },
      {
        accessorKey: "subjectScope",
        header: t(locale, "messaging", "colSubject"),
      },
      {
        accessorKey: "participantLabel",
        header: t(locale, "messaging", "colParticipant"),
      },
      {
        accessorKey: "lastPreview",
        header: t(locale, "messaging", "colPreview"),
      },
    ],
    [locale],
  );

  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!sessionQuery.data)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "messaging", "forbidden")} />
      </div>
    );

  return (
    <AppShell title="Solo">
      <div className="space-y-6" dir={dir} lang={locale}>
        <header className="space-y-2">
          <h1 className="font-display text-2xl font-medium">
            {t(locale, "messaging", "title")}
          </h1>
          <p className="text-muted text-sm">
            {t(locale, "messaging", "subtitle")}
          </p>
        </header>
        <section className="space-y-3" aria-labelledby="direct-heading">
          <h2 id="direct-heading" className="text-lg font-medium">
            {t(locale, "messaging", "directTitle")}
          </h2>
          <SoloForm
            schema={sendDirectSchema}
            defaultValues={{ subjectScope: "", participantLabel: "", body: "" }}
            submitLabel={t(locale, "messaging", "sendDirect")}
            onSubmit={async (values: SendDirectValues) => {
              await getMessagingClient().sendDirect(values);
              pushFeedback({
                tone: "success",
                title: t(locale, "messaging", "sendSuccess"),
              });
              await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
            }}
          >
            <DirectFields locale={locale} />
          </SoloForm>
        </section>
        <section className="space-y-3" aria-labelledby="broadcast-heading">
          <h2 id="broadcast-heading" className="text-lg font-medium">
            {t(locale, "messaging", "broadcastTitle")}
          </h2>
          <SoloForm
            schema={sendBroadcastSchema}
            defaultValues={{ subjectScope: "", body: "" }}
            submitLabel={t(locale, "messaging", "sendBroadcast")}
            onSubmit={async (values: SendBroadcastValues) => {
              await getMessagingClient().sendBroadcast(values);
              pushFeedback({
                tone: "success",
                title: t(locale, "messaging", "sendSuccess"),
              });
              await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
            }}
          >
            <BroadcastFields locale={locale} />
          </SoloForm>
        </section>
        {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
        {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
          <EmptyState title={t(locale, "messaging", "empty")} />
        ) : (
          <SoloDataTable
            data={listQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "messaging", "empty")}
          />
        )}
      </div>
    </AppShell>
  );
}
