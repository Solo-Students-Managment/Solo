import { Suspense } from "react";
import { OrganizationCheckoutView } from "@/features/checkout";

export default function OrganizationCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <OrganizationCheckoutView />
    </Suspense>
  );
}
