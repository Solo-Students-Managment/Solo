import { Suspense } from "react";

import { OrganizationDashboardView } from "@/features/organization";

export default function OrganizationHomePage() {
  return (
    <Suspense fallback={null}>
      <OrganizationDashboardView />
    </Suspense>
  );
}
