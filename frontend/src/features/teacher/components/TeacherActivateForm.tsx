"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

import { SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { AuthShell } from "@/features/auth";
import { resolveLocale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { routes } from "@/lib/routes";
import { getAuthClient } from "@/services/auth";
import { getHomeClient } from "@/services/home";

const activateSchema = z.object({});

export function TeacherActivateForm() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const router = useRouter();

  return (
    <AuthShell
      namespace="teacher"
      titleKey="activateTitle"
      subtitleKey="activateSubtitle"
    >
      <SoloForm
        schema={activateSchema}
        defaultValues={{}}
        submitLabel={t(locale, "teacher", "activate")}
        onSubmit={async () => {
          await getHomeClient().activateTeacher();
          await getAuthClient().switchPersona("teacher");
          pushFeedback({
            tone: "success",
            title: t(locale, "teacher", "activated"),
          });
          router.push(routes.teacher.home());
        }}
      >
        <p className="text-muted text-sm">
          {t(locale, "teacher", "activateSubtitle")}
        </p>
      </SoloForm>
    </AuthShell>
  );
}
