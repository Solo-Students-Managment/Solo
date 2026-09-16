"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { z } from "zod";

import { SoloForm } from "@/components/shared/SoloForm";
import { useFormContext } from "react-hook-form";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import { OrgShell } from "@/features/organization";
import { ErrorState, Skeleton } from "@/components/ui";
import { resolveCapability } from "@/lib/capabilities";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { getAuthClient } from "@/services/auth";
import { getCouponsClient } from "@/services/coupons";
import { getOrganizationClient } from "@/services/organization";
import { useQuery } from "@tanstack/react-query";

const schema = z.object({ code: z.string().min(1) });

function CouponCodeField({ locale }: { locale: "en" | "fa" }) {
  const { register } = useFormContext<{ code: string }>();
  return (
    <label className="block space-y-1.5">
      <span className="text-sm">{t(locale, "coupons", "codeLabel")}</span>
      <input
        {...register("code")}
        className="border-border bg-elevated h-10 w-full max-w-sm rounded-md border px-2 text-sm"
      />
    </label>
  );
}

export function OrganizationCouponsView() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const [validation, setValidation] = useState<{
    valid: boolean;
    percentOff?: number;
  } | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getAuthClient().getSession(),
  });
  const orgQuery = useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => getOrganizationClient().get(orgId),
  });
  const canManage = resolveCapability(
    sessionQuery.data ?? null,
    "billing.manage",
  );

  const validateMutation = useMutation({
    mutationFn: (code: string) => getCouponsClient().validate(orgId, code),
    onSuccess: (result) => {
      setValidation({
        valid: result.valid,
        percentOff: result.coupon?.percentOff,
      });
      pushFeedback({
        tone: result.valid ? "success" : "warning",
        title: t(locale, "coupons", result.valid ? "valid" : "invalid"),
      });
    },
  });

  const applyMutation = useMutation({
    mutationFn: (code: string) => getCouponsClient().apply(orgId, code),
    onSuccess: (result) => {
      if (result.valid) {
        pushFeedback({
          tone: "success",
          title: t(locale, "coupons", "applied"),
        });
      }
    },
  });

  if (sessionQuery.isLoading || orgQuery.isLoading)
    return <Skeleton className="m-6 h-40" />;
  if (!orgQuery.data || !canManage.allowed) {
    return (
      <div className="p-6" dir={dir} lang={locale}>
        <ErrorState title={t(locale, "coupons", "forbidden")} />
      </div>
    );
  }

  return (
    <OrgShell
      locale={locale}
      dir={dir}
      orgId={orgQuery.data.id}
      orgName={orgQuery.data.name}
      active="coupons"
    >
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-medium">
          {t(locale, "coupons", "title")}
        </h1>
        <p className="text-muted text-sm">{t(locale, "coupons", "subtitle")}</p>
      </header>

      <SoloForm
        schema={schema}
        defaultValues={{ code: "" }}
        submitLabel={t(locale, "coupons", "validate")}
        onSubmit={async (values) => {
          await validateMutation.mutateAsync(values.code);
        }}
      >
        <CouponCodeField locale={locale} />
      </SoloForm>

      {validation?.valid ? (
        <div className="space-y-2">
          <p className="text-brand text-sm">
            {t(locale, "coupons", "percentOff")}: {validation.percentOff}%
          </p>
          <button
            type="button"
            className="bg-brand rounded-md px-3 py-2 text-sm text-white"
            disabled={applyMutation.isPending}
            onClick={() => {
              const input =
                document.querySelector<HTMLInputElement>('input[name="code"]');
              if (input?.value) applyMutation.mutate(input.value);
            }}
          >
            {t(locale, "coupons", "apply")}
          </button>
        </div>
      ) : null}
    </OrgShell>
  );
}
