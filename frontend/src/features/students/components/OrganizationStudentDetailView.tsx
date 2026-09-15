"use client";

import { useFormContext } from "react-hook-form";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { PhoneFields, toE164 } from "@/features/auth";
import { OrgShell } from "@/features/organization";
import {
  EmptyState,
  ErrorState,
  Input,
  Label,
  Skeleton,
} from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { studentsQueryKeys } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import { getOrganizationClient } from "@/services/organization";
import { getStudentsManageClient } from "@/services/students";

import { linkGuardianSchema, type LinkGuardianValues } from "../schemas";

function GuardianFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
}) {
  const { register } = useFormContext<LinkGuardianValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="guardian-display-name">
          {t(locale, "students", "displayNameLabel")}
        </Label>
        <Input id="guardian-display-name" {...register("displayName")} />
        <SoloFieldError name="displayName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="guardian-relationship">
          {t(locale, "students", "relationshipLabel")}
        </Label>
        <Input id="guardian-relationship" {...register("relationshipLabel")} />
        <SoloFieldError name="relationshipLabel" />
      </div>
      <PhoneFields locale={locale} />
    </>
  );
}

export function OrganizationStudentDetailView() {
  const params = useParams<{ orgId: string; studentId: string }>();
  const { orgId, studentId } = params;
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
  const detailQuery = useQuery({
    queryKey: studentsQueryKeys.detail(ctx, studentId),
    queryFn: () => getStudentsManageClient().get(orgId, studentId),
    enabled: Boolean(sessionQuery.data),
  });

  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );

  if (sessionQuery.isLoading || orgQuery.isLoading || detailQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }

  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "students", "forbidden")} />
      </div>
    );
  }

  if (!orgQuery.data || detailQuery.isError || !detailQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "students", "loadError")} />
      </div>
    );
  }

  const student = detailQuery.data;

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgId}
      orgName={orgQuery.data.name}
      active="students"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "students", "detailTitle")}
        </h1>
        <p className="font-medium">{student.displayName}</p>
        <p className="text-muted text-sm">{student.phoneMasked}</p>
        <p className="text-xs">
          {t(locale, "students", `status.${student.status}`)} ·{" "}
          {t(locale, "students", "statsSubjects")}:{" "}
          {student.activeSubjectsCount}
        </p>
      </header>

      <section className="space-y-3" aria-labelledby="guardians-title">
        <h2 id="guardians-title" className="font-display text-xl font-medium">
          {t(locale, "students", "guardiansTitle")}
        </h2>
        {student.guardians.length === 0 ? (
          <EmptyState title={t(locale, "students", "empty")} />
        ) : (
          <ul className="space-y-2">
            {student.guardians.map((guardian) => (
              <li
                key={guardian.id}
                className="border-border rounded-md border p-3"
              >
                <p className="font-medium">{guardian.displayName}</p>
                <p className="text-muted text-xs">
                  {guardian.relationshipLabel} · {guardian.phoneMasked} ·{" "}
                  {guardian.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="link-guardian">
        <h2 id="link-guardian" className="font-display text-xl font-medium">
          {t(locale, "students", "linkGuardianTitle")}
        </h2>
        <SoloForm
          schema={linkGuardianSchema}
          defaultValues={{
            displayName: "",
            relationshipLabel: "Parent",
            callingCode: "+98",
            nationalNumber: "",
          }}
          submitLabel={t(locale, "students", "linkGuardianSubmit")}
          onSubmit={async (values) => {
            await getStudentsManageClient().linkGuardian(orgId, studentId, {
              displayName: values.displayName,
              relationshipLabel: values.relationshipLabel,
              phoneE164: toE164(values.callingCode, values.nationalNumber),
            });
            pushFeedback({
              tone: "success",
              title: t(locale, "students", "linkGuardianSuccess"),
            });
            await queryClient.invalidateQueries({
              queryKey: studentsQueryKeys.all(ctx),
            });
          }}
        >
          <GuardianFields locale={locale} />
        </SoloForm>
      </section>
    </OrgShell>
  );
}
