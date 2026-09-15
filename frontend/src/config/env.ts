import { z } from "zod";

const appEnvSchema = z.enum([
  "local",
  "development",
  "preview",
  "staging",
  "production",
]);

export type AppEnvironment = z.infer<typeof appEnvSchema>;

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_ENV: appEnvSchema.default("local"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .default("/api")
    .refine(
      (value) =>
        value.startsWith("/") || z.string().url().safeParse(value).success,
      { message: "Must be an absolute URL or a root-relative path" },
    ),
  NEXT_PUBLIC_ENABLE_MSW: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  NEXT_PUBLIC_ENABLE_DEV_TOOLS: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  NEXT_PUBLIC_RELEASE_SHA: z.string().optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

function readPublicEnv(): PublicEnv {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_ENABLE_MSW: process.env.NEXT_PUBLIC_ENABLE_MSW,
    NEXT_PUBLIC_ENABLE_DEV_TOOLS: process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS,
    NEXT_PUBLIC_RELEASE_SHA: process.env.NEXT_PUBLIC_RELEASE_SHA,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid public environment configuration: ${details}`);
  }

  const env = parsed.data;

  if (env.NEXT_PUBLIC_APP_ENV === "production") {
    if (env.NEXT_PUBLIC_ENABLE_MSW) {
      throw new Error("MSW must be disabled in production.");
    }
    if (env.NEXT_PUBLIC_ENABLE_DEV_TOOLS) {
      throw new Error("Dev tools must be disabled in production.");
    }
  }

  return env;
}

let cachedPublicEnv: PublicEnv | undefined;

export function getPublicEnv(): PublicEnv {
  if (!cachedPublicEnv) {
    cachedPublicEnv = readPublicEnv();
  }
  return cachedPublicEnv;
}

/** Test-only helper to clear memoized env. */
export function resetPublicEnvCache(): void {
  cachedPublicEnv = undefined;
}

export function isProductionEnv(env: PublicEnv = getPublicEnv()): boolean {
  return env.NEXT_PUBLIC_APP_ENV === "production";
}

export function canEnableMocks(env: PublicEnv = getPublicEnv()): boolean {
  return !isProductionEnv(env) && env.NEXT_PUBLIC_ENABLE_MSW;
}

export function canEnableDevTools(env: PublicEnv = getPublicEnv()): boolean {
  return !isProductionEnv(env) && env.NEXT_PUBLIC_ENABLE_DEV_TOOLS;
}
