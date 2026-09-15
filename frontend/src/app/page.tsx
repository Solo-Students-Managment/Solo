import { FoundationStatus, resolveLocale } from "@/features/foundation";
import { localeDirection } from "@/lib/i18n/locales";

type HomePageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const locale = resolveLocale(params.lang);
  const dir = localeDirection(locale);

  return (
    <div lang={locale} dir={dir}>
      <FoundationStatus locale={locale} />
    </div>
  );
}
