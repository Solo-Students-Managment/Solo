"use client";

import { useMemo, useState } from "react";
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
import {
  getCoursesClient,
  type ClassRoom,
  type Course,
  type Term,
} from "@/services/courses";
import { getOrganizationClient } from "@/services/organization";

import {
  createClassSchema,
  createCourseSchema,
  createTermSchema,
  type CreateClassValues,
  type CreateCourseValues,
  type CreateTermValues,
} from "../schemas";

const coursesQueryKeys = createQueryKeyFactory("courses");
const selectClassName =
  "border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm";

function TermFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateTermValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="term-name">
          {t(locale, "courses", "termNameLabel")}
        </Label>
        <Input id="term-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="term-start">
          {t(locale, "courses", "startsOnLabel")}
        </Label>
        <Input id="term-start" type="date" {...register("startsOn")} />
        <SoloFieldError name="startsOn" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="term-end">{t(locale, "courses", "endsOnLabel")}</Label>
        <Input id="term-end" type="date" {...register("endsOn")} />
        <SoloFieldError name="endsOn" />
      </div>
    </>
  );
}

function CourseFields({
  locale,
  terms,
}: {
  locale: ReturnType<typeof resolveLocale>;
  terms: Term[];
}) {
  const { register } = useFormContext<CreateCourseValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="course-name">{t(locale, "courses", "nameLabel")}</Label>
        <Input id="course-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="course-subject">
          {t(locale, "courses", "subjectLabel")}
        </Label>
        <Input id="course-subject" {...register("subjectName")} />
        <SoloFieldError name="subjectName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="course-term">{t(locale, "courses", "termLabel")}</Label>
        <select
          id="course-term"
          className={selectClassName}
          {...register("termId")}
        >
          <option value="">—</option>
          {terms.map((term) => (
            <option key={String(term.id)} value={String(term.id)}>
              {term.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

function ClassFields({ locale }: { locale: ReturnType<typeof resolveLocale> }) {
  const { register } = useFormContext<CreateClassValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="class-name">
          {t(locale, "courses", "classNameLabel")}
        </Label>
        <Input id="class-name" {...register("name")} />
        <SoloFieldError name="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="class-capacity">
          {t(locale, "courses", "capacityLabel")}
        </Label>
        <Input
          id="class-capacity"
          type="number"
          min={1}
          {...register("capacity")}
        />
        <SoloFieldError name="capacity" />
      </div>
    </>
  );
}

export function OrganizationCoursesView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

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
  const termsQuery = useQuery({
    queryKey: coursesQueryKeys.list(ctx, { resource: "terms" }),
    queryFn: () => getCoursesClient().listTerms(orgId),
    enabled: Boolean(sessionQuery.data),
  });
  const coursesQuery = useQuery({
    queryKey: coursesQueryKeys.list(ctx, { resource: "courses" }),
    queryFn: () => getCoursesClient().listCourses(orgId),
    enabled: Boolean(sessionQuery.data),
  });
  const classesQuery = useQuery({
    queryKey: coursesQueryKeys.list(ctx, {
      resource: "classes",
      courseId: selectedCourseId,
    }),
    queryFn: () =>
      getCoursesClient().listClasses(orgId, selectedCourseId as string),
    enabled: Boolean(sessionQuery.data && selectedCourseId),
  });

  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "students.manage",
  );

  const columns = useMemo<ColumnDef<Course, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: t(locale, "courses", "colCourse"),
        cell: ({ row }) => (
          <button
            type="button"
            className="text-start"
            onClick={() => setSelectedCourseId(String(row.original.id))}
          >
            <p className="font-medium">{row.original.name}</p>
            <p className="text-muted text-xs">{row.original.subjectName}</p>
          </button>
        ),
      },
      {
        accessorKey: "termName",
        header: t(locale, "courses", "colTerm"),
        cell: ({ row }) => row.original.termName ?? "—",
      },
      {
        accessorKey: "classesCount",
        header: t(locale, "courses", "colClasses"),
      },
      {
        accessorKey: "status",
        header: t(locale, "courses", "colStatus"),
        cell: ({ row }) =>
          t(locale, "courses", `status.${row.original.status}`),
      },
      {
        id: "actions",
        header: t(locale, "courses", "colActions"),
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={async () => {
              try {
                const cloned = await getCoursesClient().cloneCourse(
                  orgId,
                  String(row.original.id),
                );
                setSelectedCourseId(String(cloned.id));
                pushFeedback({
                  tone: "success",
                  title: t(locale, "courses", "cloneSuccess"),
                });
                await queryClient.invalidateQueries({
                  queryKey: coursesQueryKeys.all(ctx),
                });
              } catch {
                pushFeedback({
                  tone: "error",
                  title: t(locale, "courses", "loadError"),
                });
              }
            }}
          >
            {t(locale, "courses", "cloneCourse")}
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, orgId, queryClient, sessionQuery.data?.userId],
  );

  const classColumns = useMemo<ColumnDef<ClassRoom, unknown>[]>(
    () => [
      { accessorKey: "name", header: t(locale, "courses", "classNameLabel") },
      {
        accessorKey: "status",
        header: t(locale, "courses", "colStatus"),
        cell: ({ row }) =>
          t(locale, "courses", `classStatus.${row.original.status}`),
      },
      {
        accessorKey: "midCourseEntry",
        header: t(locale, "courses", "colMidEntry"),
        cell: ({ row }) =>
          row.original.midCourseEntry
            ? t(locale, "courses", "midEntry.yes")
            : t(locale, "courses", "midEntry.no"),
      },
      {
        id: "actions",
        header: t(locale, "courses", "colClasses"),
        cell: ({ row }) =>
          selectedCourseId ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await getCoursesClient().continueClass(
                    orgId,
                    selectedCourseId,
                    String(row.original.id),
                  );
                  pushFeedback({
                    tone: "success",
                    title: t(locale, "courses", "continueSuccess"),
                  });
                  await queryClient.invalidateQueries({
                    queryKey: coursesQueryKeys.all(ctx),
                  });
                }}
              >
                {t(locale, "courses", "continueClass")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await getCoursesClient().midCourseEntry(
                    orgId,
                    selectedCourseId,
                    String(row.original.id),
                  );
                  pushFeedback({
                    tone: "success",
                    title: t(locale, "courses", "midCourseSuccess"),
                  });
                  await queryClient.invalidateQueries({
                    queryKey: coursesQueryKeys.all(ctx),
                  });
                }}
              >
                {t(locale, "courses", "midCourseEntry")}
              </Button>
            </div>
          ) : null,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, orgId, queryClient, selectedCourseId, sessionQuery.data?.userId],
  );

  if (sessionQuery.isLoading || orgQuery.isLoading) {
    return <Skeleton className="m-6 h-40" />;
  }
  if (!orgQuery.data) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "courses", "loadError")} />
      </div>
    );
  }
  if (!canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "courses", "forbidden")} />
      </div>
    );
  }

  const selected = coursesQuery.data?.data.find(
    (c) => String(c.id) === selectedCourseId,
  );
  const terms = termsQuery.data?.data ?? [];

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgId}
      orgName={orgQuery.data.name}
      active="courses"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "courses", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "courses", "subtitle")}</p>
      </header>

      <section className="space-y-3" aria-labelledby="terms-heading">
        <h2 id="terms-heading" className="font-display text-xl font-medium">
          {t(locale, "courses", "termsTitle")}
        </h2>
        <SoloForm
          schema={createTermSchema}
          defaultValues={{ name: "", startsOn: "", endsOn: "" }}
          submitLabel={t(locale, "courses", "createTerm")}
          onSubmit={async (values: CreateTermValues) => {
            await getCoursesClient().createTerm(orgId, values);
            pushFeedback({
              tone: "success",
              title: t(locale, "courses", "createTermSuccess"),
            });
            await queryClient.invalidateQueries({
              queryKey: coursesQueryKeys.all(ctx),
            });
          }}
        >
          <TermFields locale={locale} />
        </SoloForm>
        {!termsQuery.isLoading && terms.length === 0 ? (
          <EmptyState title={t(locale, "courses", "termsEmpty")} />
        ) : (
          <ul className="space-y-1 text-sm">
            {terms.map((term) => (
              <li key={String(term.id)}>
                {term.name} · {term.startsOn} → {term.endsOn}
              </li>
            ))}
          </ul>
        )}
      </section>

      <SoloForm
        schema={createCourseSchema}
        defaultValues={{ name: "", subjectName: "", termId: "" }}
        submitLabel={t(locale, "courses", "createCourse")}
        onSubmit={async (values: CreateCourseValues) => {
          const course = await getCoursesClient().createCourse(orgId, {
            name: values.name,
            subjectId: `sub_${values.subjectName.toLowerCase().replace(/\s+/g, "_")}`,
            subjectName: values.subjectName,
            termId: values.termId || null,
          });
          setSelectedCourseId(String(course.id));
          pushFeedback({
            tone: "success",
            title: t(locale, "courses", "createCourseSuccess"),
          });
          await queryClient.invalidateQueries({
            queryKey: coursesQueryKeys.all(ctx),
          });
        }}
      >
        <CourseFields locale={locale} terms={terms} />
      </SoloForm>

      {coursesQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!coursesQuery.isLoading &&
      (coursesQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "courses", "empty")} />
      ) : (
        <div className="overflow-x-auto">
          <SoloDataTable
            data={coursesQuery.data?.data ?? []}
            columns={columns}
            emptyLabel={t(locale, "courses", "empty")}
          />
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-xl font-medium">
          {selected
            ? t(locale, "courses", "classesFor", { name: selected.name })
            : t(locale, "courses", "selectCourse")}
        </h2>
        {selected ? (
          <>
            <SoloForm
              schema={createClassSchema}
              defaultValues={{ name: "", capacity: 20 }}
              submitLabel={t(locale, "courses", "createClass")}
              onSubmit={async (values: CreateClassValues) => {
                await getCoursesClient().createClass(orgId, selected.id, {
                  name: values.name,
                  capacity: values.capacity,
                });
                pushFeedback({
                  tone: "success",
                  title: t(locale, "courses", "createClassSuccess"),
                });
                await queryClient.invalidateQueries({
                  queryKey: coursesQueryKeys.all(ctx),
                });
              }}
            >
              <ClassFields locale={locale} />
            </SoloForm>
            <div className="overflow-x-auto">
              <SoloDataTable
                data={classesQuery.data?.data ?? []}
                columns={classColumns}
                emptyLabel={t(locale, "courses", "selectCourse")}
              />
            </div>
          </>
        ) : null}
      </section>
    </OrgShell>
  );
}
