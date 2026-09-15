import { getPublicEnv } from "@/config";

import { apiErrorSchema, type ApiError } from "./contracts";

export class SoloApiError extends Error {
  readonly apiError: ApiError;

  constructor(apiError: ApiError) {
    super(apiError.messageKey);
    this.name = "SoloApiError";
    this.apiError = apiError;
  }
}

const MESSAGE_CATALOG: Record<string, { en: string; fa: string }> = {
  "errors.unauthorized": {
    en: "You need to sign in again.",
    fa: "لطفاً دوباره وارد شوید.",
  },
  "errors.forbidden": {
    en: "You do not have permission for this action.",
    fa: "اجازه انجام این کار را ندارید.",
  },
  "errors.not_found": {
    en: "The requested item was not found.",
    fa: "مورد درخواستی پیدا نشد.",
  },
  "errors.validation": {
    en: "Please fix the highlighted fields.",
    fa: "لطفاً فیلدهای مشخص‌شده را اصلاح کنید.",
  },
  "errors.rate_limited": {
    en: "Too many requests. Try again shortly.",
    fa: "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.",
  },
  "errors.server": {
    en: "Something went wrong on our side.",
    fa: "خطایی در سمت سرور رخ داد.",
  },
  "errors.offline": {
    en: "You appear to be offline.",
    fa: "به نظر می‌رسد اتصال اینترنت ندارید.",
  },
};

export function localizeApiError(
  error: ApiError,
  locale: "fa" | "en" = "fa",
): string {
  return MESSAGE_CATALOG[error.messageKey]?.[locale] ?? error.messageKey;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit & { parse?: (data: unknown) => T },
): Promise<T> {
  const env = getPublicEnv();
  const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(
      payload ?? {
        code: "UNKNOWN",
        messageKey: "errors.server",
        status: response.status,
      },
    );
    throw new SoloApiError(
      parsed.success
        ? parsed.data
        : {
            code: "UNKNOWN",
            messageKey: "errors.server",
            status: response.status,
            fieldErrors: {},
          },
    );
  }

  return init?.parse ? init.parse(payload) : (payload as T);
}
