import { Suspense } from "react";
import { OrganizationUsageView } from "@/features/usage";
export default function OrganizationUsagePage() {
  return (
    <Suspense fallback={null}>
      <OrganizationUsageView />
    </Suspense>
  );
}
