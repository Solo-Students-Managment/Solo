import { Suspense } from "react";

import { AuthShell, ResetPasswordForm } from "@/features/auth";

export default function AuthResetPage() {
  return (
    <Suspense fallback={null}>
      <AuthShell titleKey="resetTitle" subtitleKey="resetSubtitle">
        <ResetPasswordForm />
      </AuthShell>
    </Suspense>
  );
}
