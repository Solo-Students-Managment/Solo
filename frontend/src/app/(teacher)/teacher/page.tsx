import { Suspense } from "react";

import { TeacherDashboardView } from "@/features/teacher";

export default function TeacherHomePage() {
  return (
    <Suspense fallback={null}>
      <TeacherDashboardView />
    </Suspense>
  );
}
