export type UploadScanStatus =
  "uploading" | "scanning" | "safe" | "blocked" | "scan_failed";

export type UploadItem = {
  id: string;
  fileName: string;
  sizeBytes: number;
  scanStatus: UploadScanStatus;
};

export function canUseFile(item: UploadItem): boolean {
  return item.scanStatus === "safe";
}

export function validateUploadSize(
  sizeBytes: number,
  maxBytes: number,
): { ok: boolean; reason?: string } {
  if (sizeBytes > maxBytes) {
    return { ok: false, reason: "file_too_large" };
  }
  return { ok: true };
}
