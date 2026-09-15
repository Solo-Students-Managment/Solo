import { Suspense } from "react";

import { AuthShell, OtpLoginForm } from "@/features/auth";

export default function AuthOtpPage() {
  return (
    <Suspense fallback={null}>
      <AuthShell titleKey="otpTitle" subtitleKey="otpSubtitle">
        <OtpLoginForm />
      </AuthShell>
    </Suspense>
  );
}
