import { Suspense } from "react";

import { SupportRecoveryForm } from "@/features/account-phone";

export default function AuthRecoverPage() {
  return (
    <Suspense fallback={null}>
      <SupportRecoveryForm />
    </Suspense>
  );
}
