"use client";

import { useFormContext } from "react-hook-form";

import { PhoneFields, toE164 } from "@/features/auth";
import { Input, Label } from "@/components/ui";
import { SoloFieldError, SoloForm } from "@/components/shared/SoloForm";
import { pushFeedback } from "@/components/shared/SoloFeedback";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import {
  ASSIGNABLE_ORG_ROLES,
  getOrganizationMembersClient,
  type OrgRole,
} from "@/services/organization";

import {
  inviteStaffSchema,
  isOnline,
  type InviteStaffValues,
} from "../invite-schemas";

type InviteStaffFormProps = {
  locale: Locale;
  orgId: string;
  canInvite: boolean;
  onInvited: () => Promise<void>;
};

function Fields({ locale }: { locale: Locale }) {
  const { register } = useFormContext<InviteStaffValues>();
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="invite-display-name">
          {t(locale, "organization", "inviteDisplayName")}
        </Label>
        <Input id="invite-display-name" {...register("displayName")} />
        <SoloFieldError name="displayName" />
      </div>
      <PhoneFields locale={locale} />
      <div className="space-y-1.5">
        <Label htmlFor="invite-role">
          {t(locale, "organization", "inviteRole")}
        </Label>
        <select
          id="invite-role"
          className="border-border bg-elevated h-10 w-full rounded-md border px-2 text-sm"
          {...register("role")}
        >
          {ASSIGNABLE_ORG_ROLES.map((role) => (
            <option key={role} value={role}>
              {t(locale, "organization", `role.${role}`)}
            </option>
          ))}
        </select>
        <SoloFieldError name="role" />
      </div>
    </>
  );
}

export function InviteStaffForm({
  locale,
  orgId,
  canInvite,
  onInvited,
}: InviteStaffFormProps) {
  if (!canInvite) {
    return (
      <p className="text-muted text-sm" role="status">
        {t(locale, "organization", "inviteForbidden")}
      </p>
    );
  }

  return (
    <section className="space-y-3" aria-labelledby="invite-staff-title">
      <div>
        <h2
          id="invite-staff-title"
          className="font-display text-xl font-medium"
        >
          {t(locale, "organization", "inviteTitle")}
        </h2>
        <p className="text-muted text-sm">
          {t(locale, "organization", "inviteSubtitle")}
        </p>
      </div>
      <SoloForm
        schema={inviteStaffSchema}
        defaultValues={{
          displayName: "",
          callingCode: "+98",
          nationalNumber: "",
          role: "teacher" as OrgRole,
        }}
        submitLabel={t(locale, "organization", "inviteSubmit")}
        onSubmit={async (values) => {
          if (!isOnline()) {
            pushFeedback({
              tone: "error",
              title: t(locale, "organization", "offline"),
            });
            return;
          }
          try {
            await getOrganizationMembersClient().inviteStaff(orgId, {
              phoneE164: toE164(values.callingCode, values.nationalNumber),
              role: values.role,
              displayName: values.displayName,
            });
            pushFeedback({
              tone: "success",
              title: t(locale, "organization", "inviteSuccess"),
            });
            await onInvited();
          } catch {
            pushFeedback({
              tone: "error",
              title: t(locale, "organization", "inviteError"),
            });
          }
        }}
      >
        <Fields locale={locale} />
      </SoloForm>
    </section>
  );
}
