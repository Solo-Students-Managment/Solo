"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button, Skeleton } from "@/components/ui";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { getAuthClient } from "@/services/auth";
import { getSubjectClient } from "@/services/subjects";

type SubjectSwitcherProps = {
  locale: Locale;
  organizationId: string | null;
  subjectId: string | null;
};

export function SubjectSwitcher({
  locale,
  organizationId,
  subjectId,
}: SubjectSwitcherProps) {
  const queryClient = useQueryClient();
  const subjectsQuery = useQuery({
    queryKey: ["subjects", "switcher", organizationId ?? "personal"],
    queryFn: () => getSubjectClient().list(organizationId),
  });

  return (
    <section className="space-y-3" aria-labelledby="subject-title">
      <h2 id="subject-title" className="font-display text-lg font-medium">
        {t(locale, "subjects", "switcherTitle")}
      </h2>
      {subjectsQuery.isLoading ? <Skeleton className="h-12 w-full" /> : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={subjectId === null ? "primary" : "secondary"}
          onClick={async () => {
            await getAuthClient().switchContext({
              organizationId,
              subjectId: null,
            });
            await queryClient.invalidateQueries();
            pushFeedback({
              tone: "success",
              title: t(locale, "subjects", "switched"),
            });
          }}
        >
          {t(locale, "subjects", "switcherNone")}
        </Button>
        {(subjectsQuery.data?.data ?? [])
          .filter((subject) => subject.active)
          .map((subject) => (
            <Button
              key={subject.id}
              type="button"
              variant={subjectId === subject.id ? "primary" : "secondary"}
              onClick={async () => {
                await getAuthClient().switchContext({
                  organizationId,
                  subjectId: subject.id,
                });
                await queryClient.invalidateQueries();
                pushFeedback({
                  tone: "success",
                  title: t(locale, "subjects", "switched"),
                });
              }}
            >
              {subject.name}
            </Button>
          ))}
      </div>
    </section>
  );
}
