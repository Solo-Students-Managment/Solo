import { Suspense } from "react";

import { AppShell } from "@/components/layouts";
import { ProfilePreferencesForm } from "@/features/profile";

export default function ProfilePage() {
  return (
    <AppShell title="Solo">
      <Suspense fallback={null}>
        <ProfilePreferencesForm />
      </Suspense>
    </AppShell>
  );
}
