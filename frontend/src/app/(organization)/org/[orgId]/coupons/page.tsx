import { Suspense } from "react";
import { OrganizationCouponsView } from "@/features/coupons";
export default function OrganizationCouponsPage() {
  return (
    <Suspense fallback={null}>
      <OrganizationCouponsView />
    </Suspense>
  );
}
