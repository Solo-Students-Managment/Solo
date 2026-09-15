import { Suspense } from "react";

import { GlobalHomeView } from "@/features/home";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <GlobalHomeView />
    </Suspense>
  );
}
