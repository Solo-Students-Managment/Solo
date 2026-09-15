import { Suspense } from "react";

import { TeacherActivateForm } from "@/features/teacher";

export default function TeacherActivatePage() {
  return (
    <Suspense fallback={null}>
      <TeacherActivateForm />
    </Suspense>
  );
}
