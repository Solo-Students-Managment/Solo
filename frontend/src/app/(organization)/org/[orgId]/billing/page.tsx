import { Suspense } from "react";

import { OrganizationBillingView } from "@/features/billing";

export default function OrganizationBillingPage() {
  return (
    <Suspense fallback={null}>
      <OrganizationBillingView />
    </Suspense>
  );
}
