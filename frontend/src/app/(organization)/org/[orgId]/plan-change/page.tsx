import { Suspense } from "react";

import { OrganizationPlanChangeView } from "@/features/plan-change";

export default function OrganizationPlanChangePage() {
  return (
    <Suspense fallback={null}>
      <OrganizationPlanChangeView />
    </Suspense>
  );
}
