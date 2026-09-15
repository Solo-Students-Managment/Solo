import { Suspense } from "react";

import { AuthShell, SignupForm } from "@/features/auth";

export default function AuthSignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthShell titleKey="signupTitle" subtitleKey="signupSubtitle">
        <SignupForm />
      </AuthShell>
    </Suspense>
  );
}
