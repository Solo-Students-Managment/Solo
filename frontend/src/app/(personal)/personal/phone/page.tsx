import { Suspense } from "react";

import { AppShell } from "@/components/layouts";
import { ChangePhoneForm } from "@/features/account-phone";

export default function ChangePhonePage() {
  return (
    <AppShell title="Solo">
      <Suspense fallback={null}>
        <ChangePhoneForm />
      </Suspense>
    </AppShell>
  );
}
