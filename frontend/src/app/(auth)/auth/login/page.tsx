import { Suspense } from "react";

import { AuthShell, LoginForm } from "@/features/auth";

export default function AuthLoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthShell titleKey="loginTitle" subtitleKey="loginSubtitle">
        <LoginForm />
      </AuthShell>
    </Suspense>
  );
}
