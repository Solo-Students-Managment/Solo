import { Suspense } from "react";
import { OrganizationAddOnsView } from "@/features/add-ons";
export default function OrganizationAddOnsPage() {
  return (
    <Suspense fallback={null}>
      <OrganizationAddOnsView />
    </Suspense>
  );
}
