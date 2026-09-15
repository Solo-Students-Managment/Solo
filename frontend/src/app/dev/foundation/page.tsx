import { Suspense } from "react";

import { FoundationStatus } from "@/features/foundation";
import { resolveLocale } from "@/lib/i18n/locales";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function DevFoundationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = resolveLocale(params.lang);

  return (
    <Suspense fallback={null}>
      <FoundationStatus locale={locale} />
    </Suspense>
  );
}
