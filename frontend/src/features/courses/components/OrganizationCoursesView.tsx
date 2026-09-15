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
import { getCoursesClient, type Course } from "@/services/courses";
import { getOrganizationClient } from "@/services/organization";

import {
  createClassSchema,
  createCourseSchema,
  type CreateClassValues,
  type CreateCourseValues,
} from "../schemas";

const coursesQueryKeys = createQueryKeyFactory("courses");

function CourseFields({
  locale,
}: {
  locale: ReturnType<typeof resolveLocale>;
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
            onClick={() => setSelectedCourseId(row.original.id)}
          >
            <p className="font-medium">{row.original.name}</p>
            <p className="text-muted text-xs">{row.original.subjectName}</p>
          </button>
        ),
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
    ],
    [locale],
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
    (c) => c.id === selectedCourseId,
  );

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

      <SoloForm
        schema={createCourseSchema}
        defaultValues={{ name: "", subjectName: "" }}
        submitLabel={t(locale, "courses", "createCourse")}
        onSubmit={async (values) => {
          const course = await getCoursesClient().createCourse(orgId, {
            name: values.name,
            subjectId: `sub_${values.subjectName.toLowerCase().replace(/\s+/g, "_")}`,
            subjectName: values.subjectName,
          });
          setSelectedCourseId(course.id);
          pushFeedback({
            tone: "success",
            title: t(locale, "courses", "createCourseSuccess"),
          });
          await queryClient.invalidateQueries({
            queryKey: coursesQueryKeys.all(ctx),
          });
        }}
      >
        <CourseFields locale={locale} />
      </SoloForm>

      {coursesQuery.isLoading ? <Skeleton className="h-24" /> : null}
      {!coursesQuery.isLoading &&
      (coursesQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState title={t(locale, "courses", "empty")} />
      ) : (
        <SoloDataTable
          data={coursesQuery.data?.data ?? []}
          columns={columns}
          emptyLabel={t(locale, "courses", "empty")}
        />
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
              onSubmit={async (values) => {
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
            <ul className="space-y-2">
              {(classesQuery.data?.data ?? []).map((room) => (
                <li
                  key={room.id}
                  className="border-border rounded-md border p-3"
                >
                  <p className="font-medium">{room.name}</p>
                  <p className="text-muted text-xs">
                    {room.enrolledCount}/{room.capacity} · {room.status}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>
    </OrgShell>
  );
}
