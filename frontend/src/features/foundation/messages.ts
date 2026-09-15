import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/locales";

export type FoundationMessages = {
  brand: string;
  title: string;
  description: string;
  phase: string;
  layoutNote: string;
  languageLabel: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
};

const messages: Record<Locale, FoundationMessages> = {
  fa: {
    brand: "Solo",
    title: "پایه‌گذاری فرانت‌اند",
    description:
      "اپلیکیشن Next.js سبزِ میدان در مسیر /frontend آماده است. نمونهٔ Vite فقط در /legacy به‌عنوان مرجع باقی مانده است.",
    phase: "فاز ۰ — زیربنا",
    layoutNote: "مرزهای مخزن: /frontend · /backend · /docs · /legacy",
    languageLabel: "زبان",
    themeLabel: "پوسته",
    themeLight: "روشن",
    themeDark: "تیره",
    themeSystem: "سیستم",
  },
  en: {
    brand: "Solo",
    title: "Frontend foundation",
    description:
      "The greenfield Next.js app lives under /frontend. The Vite prototype remains reference-only in /legacy.",
    phase: "Phase 0 — Foundation",
    layoutNote: "Repository boundaries: /frontend · /backend · /docs · /legacy",
    languageLabel: "Language",
    themeLabel: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
  },
};

export function getFoundationMessages(locale: Locale): FoundationMessages {
  return messages[locale];
}

export function resolveLocale(raw: string | string[] | undefined): Locale {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && isLocale(value)) {
    return value;
  }
  return defaultLocale;
}
