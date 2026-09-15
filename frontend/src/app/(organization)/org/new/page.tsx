import { Suspense } from "react";

import { CreateOrganizationForm } from "@/features/organization";

export default function CreateOrganizationPage() {
  return (
    <Suspense fallback={null}>
      <CreateOrganizationForm />
    </Suspense>
  );
}
