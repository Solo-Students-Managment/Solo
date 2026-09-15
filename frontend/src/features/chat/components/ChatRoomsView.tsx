"use client";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormContext } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layouts";
import { SoloDataTable } from "@/components/shared/SoloDataTable";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
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
import { getAuthClient } from "@/services/auth";
import { getChatClient, type ChatRoom } from "@/services/chat";
import {
  createRoomSchema,
  sendChatMessageSchema,
  type CreateRoomValues,
  type SendChatMessageValues,
} from "../schemas";

const keys = createQueryKeyFactory("chat");

function RoomFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateRoomValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="chat-name">{t(locale, "chat", "nameLabel")}</Label>
        <Input id="chat-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="chat-scope">{t(locale, "chat", "scopeLabel")}</Label>
        <select
          id="chat-scope"
          className="border-border bg-elevated w-full rounded-md border px-3 py-2 text-sm"
          {...register("scope")}
        >
          {(
            ["direct", "group", "class", "subject", "organization"] as const
          ).map((scope) => (
            <option key={scope} value={scope}>
              {t(locale, "chat", `scope.${scope}`)}
            </option>
          ))}
        </select>
        <SoloFieldError name="scope" />
      </div>
    </>
  );
}

function MessageFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<SendChatMessageValues>();
  return (
    <div className="space-y-1.5">
      <Label htmlFor="chat-body">{t(locale, "chat", "bodyLabel")}</Label>
      <Input id="chat-body" {...register("body")} />
      <SoloFieldError name="body" />
    </div>
  );
}

export function ChatRoomsView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const ctx = {
    personaId: sessionQuery.data?.userId,
    organizationId: null,
    subjectId: null,
  };
  const roomsQuery = useQuery({
    queryKey: keys.list(ctx, { resource: "rooms" }),
    queryFn: () => getChatClient().listRooms(),
    enabled: Boolean(sessionQuery.data),
  });
  const messagesQuery = useQuery({
    queryKey: keys.detail(ctx, activeRoomId ?? "none"),
    queryFn: () => getChatClient().listMessages(activeRoomId!),
    enabled: Boolean(sessionQuery.data && activeRoomId),
  });
  const columns = useMemo<ColumnDef<ChatRoom, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "chat", "colName") },
      {
        accessorKey: "scope",
        header: t(locale, "chat", "colScope"),
        cell: ({ row }) => t(locale, "chat", `scope.${row.original.scope}`),
      },
      { accessorKey: "memberCount", header: t(locale, "chat", "colMembers") },
      {
        id: "open",
        header: t(locale, "chat", "colOpen"),
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setActiveRoomId(String(row.original.id))}
          >
            {t(locale, "chat", "openRoom")}
          </Button>
        ),
      },
    ],
    [locale],
  );

  if (sessionQuery.isLoading) return <Skeleton className="m-6 h-40" />;
  if (!sessionQuery.data)
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "chat", "forbidden")} />
      </div>
    );

  return (
    <AppShell title="Solo">
      <div className="space-y-6" dir={dir} lang={locale}>
        <header className="space-y-2">
          <h1 className="font-display text-2xl font-medium">
            {t(locale, "chat", "title")}
          </h1>
          <p className="text-muted text-sm">{t(locale, "chat", "subtitle")}</p>
        </header>
        <SoloForm
          schema={createRoomSchema}
          defaultValues={{ name: "", scope: "group" }}
          submitLabel={t(locale, "chat", "createSubmit")}
          onSubmit={async (values: CreateRoomValues) => {
            await getChatClient().createRoom(values);
            pushFeedback({
              tone: "success",
              title: t(locale, "chat", "createSuccess"),
            });
            await queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
          }}
        >
          <RoomFields locale={locale} />
        </SoloForm>
        {roomsQuery.isLoading ? <Skeleton className="h-24" /> : null}
        {!roomsQuery.isLoading && (roomsQuery.data?.data.length ?? 0) === 0 ? (
          <EmptyState title={t(locale, "chat", "emptyRooms")} />
        ) : (
          <SoloDataTable
            data={roomsQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "chat", "emptyRooms")}
          />
        )}
        {activeRoomId ? (
          <section className="space-y-3" aria-labelledby="room-messages">
            <h2 id="room-messages" className="text-lg font-medium">
              {t(locale, "chat", "messagesTitle")}
            </h2>
            <ul className="space-y-2">
              {(messagesQuery.data?.data ?? []).map((msg) => (
                <li
                  key={String(msg.id)}
                  className="border-border rounded-md border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{msg.authorLabel}: </span>
                  {msg.body}
                </li>
              ))}
            </ul>
            {(messagesQuery.data?.data.length ?? 0) === 0 ? (
              <EmptyState title={t(locale, "chat", "emptyMessages")} />
            ) : null}
            <SoloForm
              schema={sendChatMessageSchema}
              defaultValues={{ body: "" }}
              submitLabel={t(locale, "chat", "sendSubmit")}
              onSubmit={async (values: SendChatMessageValues) => {
                await getChatClient().sendMessage(activeRoomId, values.body);
                pushFeedback({
                  tone: "success",
                  title: t(locale, "chat", "sendSuccess"),
                });
                await queryClient.invalidateQueries({
                  queryKey: keys.detail(ctx, activeRoomId),
                });
              }}
            >
              <MessageFields locale={locale} />
            </SoloForm>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
