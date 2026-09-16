import { Suspense } from "react";

import { TeacherPlansView } from "@/features/teacher-plans";

export default function TeacherPlansPage() {
  return (
    <Suspense fallback={null}>
      <TeacherPlansView />
    </Suspense>
  );
}
