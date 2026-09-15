"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormContext } from "react-hook-form";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Label,
  Skeleton,
} from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import { canRsvp, getEventsClient, type OrgEvent } from "@/services/events";
import { createEventSchema, type CreateEventValues } from "../schemas";

const keys = createQueryKeyFactory("events");

function EventFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateEventValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="evt-title">{t(locale, "events", "titleLabel")}</Label>
        <Input id="evt-title" {...register("title")} />
        <SoloFieldError name="title" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="evt-starts">
          {t(locale, "events", "startsAtLabel")}
        </Label>
        <Input
          id="evt-starts"
          type="datetime-local"
          {...register("startsAt")}
        />
        <SoloFieldError name="startsAt" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="evt-capacity">
          {t(locale, "events", "capacityLabel")}
        </Label>
        <Input
          id="evt-capacity"
          type="number"
          min={1}
          {...register("capacity")}
        />
        <SoloFieldError name="capacity" />
      </div>
      <div className="flex min-h-11 items-center gap-2">
        <input
          id="evt-waitlist"
          type="checkbox"
          className="size-4"
          {...register("waitlistEnabled")}
        />
        <Label htmlFor="evt-waitlist">
          {t(locale, "events", "waitlistLabel")}
        </Label>
      </div>
    </>
  );
}

export function OrganizationEventsView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const orgQuery = useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => getOrganizationClient().get(orgId),
  });
  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: orgId,
    subjectId: null,
  };
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );
  const listQuery = useQuery({
    queryKey: keys.list(ctx, {}),
    queryFn: () => getEventsClient().list(orgId),
    enabled: canManage.allowed,
  });

  async function rsvpEvent(event: OrgEvent) {
    if (!canRsvp(event)) {
      pushFeedback({
        tone: "error",
        title: t(locale, "events", "rsvpBlocked"),
      });
      return;
    }
    await getEventsClient().rsvp(orgId, String(event.id));
    pushFeedback({
      tone: event.rsvpCount + 1 > event.capacity ? "info" : "success",
      title:
        event.rsvpCount + 1 > event.capacity
          ? t(locale, "events", "rsvpWaitlist")
          : t(locale, "events", "rsvpSuccess"),
    });
    await queryClient.refetchQueries({ queryKey: keys.lists(ctx) });
  }

  async function checkInEvent(event: OrgEvent) {
    try {
      await getEventsClient().checkIn(orgId, String(event.id));
      pushFeedback({
        tone: "success",
        title: t(locale, "events", "checkInSuccess"),
      });
      await queryClient.refetchQueries({ queryKey: keys.lists(ctx) });
    } catch {
      pushFeedback({
        tone: "error",
        title: t(locale, "events", "checkInBlocked"),
      });
    }
  }

  const columns = useMemo<ColumnDef<OrgEvent, unknown>[]>(
    () => [
      { accessorKey: "title", header: t(locale, "events", "colTitle") },
      { accessorKey: "startsAt", header: t(locale, "events", "colStartsAt") },
      {
        id: "rsvp",
        header: t(locale, "events", "colRsvp"),
        cell: ({ row }) => `${row.original.rsvpCount}/${row.original.capacity}`,
      },
      {
        accessorKey: "checkedInCount",
        header: t(locale, "events", "colCheckedIn"),
      },
      {
        id: "actions",
        header: t(locale, "events", "colActions"),
        cell: ({ row }) => {
          const event = row.original;
          return (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="min-h-11"
                disabled={!canRsvp(event)}
                onClick={() => void rsvpEvent(event)}
              >
                {t(locale, "events", "rsvp")}
              </Button>
              <Button
                type="button"
                className="min-h-11"
                onClick={() => void checkInEvent(event)}
              >
                {t(locale, "events", "checkIn")}
              </Button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, orgId, sessionQuery.data?.userId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "events", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "events", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="events"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "events", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "events", "subtitle")}</p>
      </header>

      <SoloForm
        schema={createEventSchema}
        defaultValues={{
          title: "",
          startsAt: "",
          capacity: 50,
          waitlistEnabled: true,
        }}
        submitLabel={t(locale, "events", "createEvent")}
        onSubmit={async (values: CreateEventValues) => {
          await getEventsClient().create(orgId, values);
          pushFeedback({
            tone: "success",
            title: t(locale, "events", "createSuccess"),
          });
          await queryClient.refetchQueries({ queryKey: keys.lists(ctx) });
        }}
      >
        <EventFields locale={locale} />
      </SoloForm>

      {listQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!listQuery.isLoading && (listQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "events", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={listQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "events", "empty")}
          />
        </div>
      )}
    </OrgShell>
  );
}
