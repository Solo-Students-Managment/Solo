import { Suspense } from "react";

import { AppShell } from "@/components/layouts";
import { AccountSecurityView } from "@/features/account-security";

export default function AccountSecurityPage() {
  return (
    <AppShell title="Solo">
      <Suspense fallback={null}>
        <AccountSecurityView />
      </Suspense>
    </AppShell>
  );
}
