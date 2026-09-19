"use client";

import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

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
import {
  aiPersonaSchema,
  getAiAssistantClient,
  type AiPersona,
} from "@/services/ai-assistant";

const keys = createQueryKeyFactory("ai-assistant");
const ctx = { personaId: undefined, organizationId: null, subjectId: null };

function resolvePersona(raw: string | null): AiPersona {
  const parsed = aiPersonaSchema.safeParse(raw ?? "teacher");
  return parsed.success ? parsed.data : "teacher";
}

export function AiAssistantView() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const persona = resolvePersona(searchParams.get("persona"));
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });

  const entriesQuery = useQuery({
    queryKey: keys.list(ctx, { persona, kind: "entries" }),
    queryFn: () => getAiAssistantClient().listEntryPoints(persona),
    enabled: Boolean(sessionQuery.data),
  });

  const threadsQuery = useQuery({
    queryKey: keys.list(ctx, { persona, kind: "threads" }),
    queryFn: () => getAiAssistantClient().listThreads(persona),
    enabled: Boolean(sessionQuery.data),
  });

  const threadQuery = useQuery({
    queryKey: keys.detail(ctx, activeThreadId ?? "none"),
    queryFn: () => getAiAssistantClient().getThread(activeThreadId!),
    enabled: Boolean(activeThreadId),
  });

  const startMutation = useMutation({
    mutationFn: (entryPointId: string) => {
      const entry = entriesQuery.data?.find((e) => e.id === entryPointId);
      return getAiAssistantClient().startThread({
        persona,
        entryPointId,
        title: entry ? t(locale, "aiAssistant", entry.titleKey) : "AI chat",
        firstMessage: entry?.promptPreset ?? (message || "Hello"),
      });
    },
    onSuccess: (thread) => {
      setActiveThreadId(thread.id);
      pushFeedback({
        tone: "success",
        title: t(locale, "aiAssistant", "startSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      getAiAssistantClient().sendMessage(activeThreadId!, content),
    onSuccess: () => {
      setMessage("");
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
    onError: () => {
      pushFeedback({
        tone: "error",
        title: t(locale, "aiAssistant", "sendError"),
      });
    },
  });

  if (!sessionQuery.data && !sessionQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl p-6" dir={dir} lang={locale}>
        <EmptyState title={t(locale, "aiAssistant", "signInRequired")} />
      </main>
    );
  }
  if (sessionQuery.isLoading || entriesQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "aiAssistant", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "aiAssistant", "subtitle")}
        </p>
        <p className="text-sm" data-testid="ai-persona">
          {t(locale, "aiAssistant", "personaLabel")}:{" "}
          {t(locale, "aiAssistant", `persona.${persona}`)}
        </p>
        <p className="text-muted text-xs" role="note">
          {t(locale, "aiAssistant", "humanReviewNote")}
        </p>
      </header>

      <section aria-label={t(locale, "aiAssistant", "entriesLabel")}>
        <h2 className="font-display mb-2 text-lg">
          {t(locale, "aiAssistant", "entriesLabel")}
        </h2>
        {entriesQuery.isError ? (
          <ErrorState title={t(locale, "aiAssistant", "errorTitle")} />
        ) : null}
        {entriesQuery.data?.length === 0 ? (
          <EmptyState title={t(locale, "aiAssistant", "entriesEmpty")} />
        ) : (
          <ul className="space-y-2">
            {entriesQuery.data?.map((entry) => (
              <li
                key={entry.id}
                className="border-border bg-elevated flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
              >
                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    {t(locale, "aiAssistant", entry.titleKey)}
                  </p>
                  <p className="text-muted">
                    {t(locale, "aiAssistant", entry.descriptionKey)}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => startMutation.mutate(entry.id)}
                  disabled={startMutation.isPending}
                >
                  {t(locale, "aiAssistant", "start")}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label={t(locale, "aiAssistant", "threadsLabel")}>
        <h2 className="font-display mb-2 text-lg">
          {t(locale, "aiAssistant", "threadsLabel")}
        </h2>
        {threadsQuery.data?.length === 0 ? (
          <EmptyState title={t(locale, "aiAssistant", "threadsEmpty")} />
        ) : (
          <ul className="space-y-2">
            {threadsQuery.data?.map((thread) => (
              <li key={thread.id}>
                <Button
                  type="button"
                  variant={
                    activeThreadId === thread.id ? "primary" : "secondary"
                  }
                  onClick={() => setActiveThreadId(thread.id)}
                >
                  {thread.title}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {activeThreadId && threadQuery.data ? (
        <section
          aria-label={t(locale, "aiAssistant", "conversationLabel")}
          className="space-y-3"
        >
          <h2 className="font-display text-lg">
            {t(locale, "aiAssistant", "conversationLabel")}
          </h2>
          <ul className="space-y-2" data-testid="ai-messages">
            {threadQuery.data.messages.map((msg) => (
              <li
                key={msg.id}
                className="border-border rounded-md border p-3 text-sm"
              >
                <p className="text-muted text-xs uppercase">{msg.role}</p>
                <p>{msg.content}</p>
                {msg.sources.length > 0 ? (
                  <p className="text-muted mt-1 text-xs">
                    {t(locale, "aiAssistant", "sourcesLabel")}:{" "}
                    {msg.sources.join(", ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (message.trim()) sendMutation.mutate(message.trim());
            }}
          >
            <div className="min-w-[16rem] flex-1 space-y-1.5">
              <Label htmlFor="ai-msg">
                {t(locale, "aiAssistant", "messageLabel")}
              </Label>
              <Input
                id="ai-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={sendMutation.isPending}>
              {t(locale, "aiAssistant", "send")}
            </Button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
