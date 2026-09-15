import type { Locale } from "@/lib/i18n/locales";
import { defaultLocale } from "@/lib/i18n/locales";

import enAccountPhone from "./messages/en/accountPhone.json";
import enProfile from "./messages/en/profile.json";
import enHome from "./messages/en/home.json";
import enTeacher from "./messages/en/teacher.json";
import enStudent from "./messages/en/student.json";
import enGuardian from "./messages/en/guardian.json";
import enOrganization from "./messages/en/organization.json";
import enSubjects from "./messages/en/subjects.json";
import enAuth from "./messages/en/auth.json";
import enCommon from "./messages/en/common.json";
import enFoundation from "./messages/en/foundation.json";
import enSecurity from "./messages/en/security.json";
import faAccountPhone from "./messages/fa/accountPhone.json";
import faProfile from "./messages/fa/profile.json";
import faHome from "./messages/fa/home.json";
import faTeacher from "./messages/fa/teacher.json";
import faStudent from "./messages/fa/student.json";
import faGuardian from "./messages/fa/guardian.json";
import faOrganization from "./messages/fa/organization.json";
import faSubjects from "./messages/fa/subjects.json";
import faAuth from "./messages/fa/auth.json";
import faCommon from "./messages/fa/common.json";
import faFoundation from "./messages/fa/foundation.json";
import faSecurity from "./messages/fa/security.json";

export type MessageNamespace =
  | "common"
  | "foundation"
  | "auth"
  | "security"
  | "accountPhone"
  | "profile"
  | "home"
  | "teacher"
  | "student"
  | "guardian"
  | "organization"
  | "subjects";

type Dictionaries = Record<
  Locale,
  Record<MessageNamespace, Record<string, string>>
>;

const dictionaries: Dictionaries = {
  en: {
    common: enCommon,
    foundation: enFoundation,
    auth: enAuth,
    security: enSecurity,
    accountPhone: enAccountPhone,
    profile: enProfile,
    home: enHome,
    teacher: enTeacher,
    student: enStudent,
    guardian: enGuardian,
    organization: enOrganization,
    subjects: enSubjects,
  },
  fa: {
    common: faCommon,
    foundation: faFoundation,
    auth: faAuth,
    security: faSecurity,
    accountPhone: faAccountPhone,
    profile: faProfile,
    home: faHome,
    teacher: faTeacher,
    student: faStudent,
    guardian: faGuardian,
    organization: faOrganization,
    subjects: faSubjects,
  },
};

const missingKeys = new Set<string>();

export type TranslateParams = Record<string, string | number>;

function formatPlural(template: string, count: number): string {
  const match = template.match(
    /\{(\w+),\s*plural,\s*=0\s*\{([^}]*)\}\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\}\}/,
  );
  if (!match) {
    return template.replaceAll("{count}", String(count));
  }
  const [, , zero, one, other] = match;
  const branch = count === 0 ? zero : count === 1 ? one : other;
  return (branch ?? other ?? "")
    .replaceAll("#", String(count))
    .replaceAll("{count}", String(count));
}

export function t(
  locale: Locale,
  namespace: MessageNamespace,
  key: string,
  params?: TranslateParams,
): string {
  const primary = dictionaries[locale][namespace][key];
  const fallback = dictionaries[defaultLocale][namespace][key];
  let value = primary ?? fallback;

  if (!value) {
    const miss = `${locale}.${namespace}.${key}`;
    if (process.env.NODE_ENV !== "production" && !missingKeys.has(miss)) {
      missingKeys.add(miss);
      console.warn(`[i18n] Missing translation: ${miss}`);
    }
    return key;
  }

  if (params && "count" in params && typeof params.count === "number") {
    value = formatPlural(value, params.count);
  }

  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      value = value.replaceAll(`{${paramKey}}`, String(paramValue));
    }
  }

  return value;
}

export function getNamespaceKeys(
  locale: Locale,
  namespace: MessageNamespace,
): string[] {
  return Object.keys(dictionaries[locale][namespace]).sort();
}

export function assertNamespaceParity(namespace: MessageNamespace): string[] {
  const enKeys = new Set(getNamespaceKeys("en", namespace));
  const faKeys = new Set(getNamespaceKeys("fa", namespace));
  const missingInFa = [...enKeys].filter((key) => !faKeys.has(key));
  const missingInEn = [...faKeys].filter((key) => !enKeys.has(key));
  return [
    ...missingInFa.map((k) => `fa.${namespace}.${k}`),
    ...missingInEn.map((k) => `en.${namespace}.${k}`),
  ];
}

export function getMissingTranslationKeys(): string[] {
  return [...missingKeys];
}
