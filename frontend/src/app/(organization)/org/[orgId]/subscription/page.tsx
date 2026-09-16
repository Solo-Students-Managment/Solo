import { Suspense } from "react";

import { OrganizationSubscriptionView } from "@/features/subscription";

export default function OrganizationSubscriptionPage() {
  return (
    <Suspense fallback={null}>
      <OrganizationSubscriptionView />
    </Suspense>
  );
}
