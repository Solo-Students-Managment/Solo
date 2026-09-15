const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

export function isSafeExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return SAFE_PROTOCOLS.has(url.protocol);
  } catch {
    return value.startsWith("/");
  }
}

export type StorageClass = "ephemeral" | "ui" | "sensitive";

export function assertStorageAllowed(
  classification: StorageClass,
  target: "memory" | "session" | "local",
): boolean {
  if (classification === "sensitive") {
    return target === "memory";
  }
  if (classification === "ui") {
    return target === "memory" || target === "session";
  }
  return true;
}

export function redactSensitive(value: string): string {
  return value
    .replace(/(password|otp|token|secret)=([^&\s]+)/gi, "$1=[REDACTED]")
    .replace(/\+?\d{10,15}/g, "[REDACTED_PHONE]");
}
