import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const storageQuotaSchema = z.object({
  usedBytes: z.number().nonnegative(),
  quotaBytes: z.number().positive(),
  quarantinedFiles: z.number().int().nonnegative(),
});
export type StorageQuota = z.infer<typeof storageQuotaSchema>;

export const storageFileSchema = z.object({
  id: opaqueIdSchema,
  name: z.string().min(1),
  sizeBytes: z.number().nonnegative(),
  quarantined: z.boolean(),
});
export type StorageFile = z.infer<typeof storageFileSchema>;

export type StorageAdminClient = {
  getQuota(): Promise<StorageQuota>;
  listFiles(): Promise<StorageFile[]>;
  quarantine(fileId: string): Promise<StorageFile>;
  release(fileId: string): Promise<StorageFile>;
};

const quota: StorageQuota = {
  usedBytes: 1_200_000_000,
  quotaBytes: 5_000_000_000,
  quarantinedFiles: 0,
};
const files: StorageFile[] = [];

function seed() {
  if (files.length) return;
  files.push(
    storageFileSchema.parse({
      id: "sf_1",
      name: "lesson.pdf",
      sizeBytes: 2_000_000,
      quarantined: false,
    }),
    storageFileSchema.parse({
      id: "sf_2",
      name: "scan.exe",
      sizeBytes: 500_000,
      quarantined: false,
    }),
  );
}

export function createHttpStorageAdminClient(): StorageAdminClient {
  return {
    async getQuota() {
      return apiRequest("/admin/storage/quota", {
        parse: (d) => storageQuotaSchema.parse(d),
      });
    },
    async listFiles() {
      return apiRequest("/admin/storage/files", {
        parse: (d) => z.array(storageFileSchema).parse(d),
      });
    },
    async quarantine(fileId) {
      return apiRequest(
        `/admin/storage/files/${encodeURIComponent(fileId)}/quarantine`,
        { method: "POST", parse: (d) => storageFileSchema.parse(d) },
      );
    },
    async release(fileId) {
      return apiRequest(
        `/admin/storage/files/${encodeURIComponent(fileId)}/release`,
        { method: "POST", parse: (d) => storageFileSchema.parse(d) },
      );
    },
  };
}

export function createMockStorageAdminClient(): StorageAdminClient {
  return {
    async getQuota() {
      seed();
      return {
        ...quota,
        quarantinedFiles: files.filter((f) => f.quarantined).length,
      };
    },
    async listFiles() {
      seed();
      return [...files];
    },
    async quarantine(fileId) {
      seed();
      const idx = files.findIndex((f) => f.id === fileId);
      if (idx < 0) throw new Error("not_found");
      files[idx] = storageFileSchema.parse({
        ...files[idx],
        quarantined: true,
      });
      return files[idx]!;
    },
    async release(fileId) {
      seed();
      const idx = files.findIndex((f) => f.id === fileId);
      if (idx < 0) throw new Error("not_found");
      files[idx] = storageFileSchema.parse({
        ...files[idx],
        quarantined: false,
      });
      return files[idx]!;
    },
  };
}

let client: StorageAdminClient = createMockStorageAdminClient();
export function getStorageAdminClient() {
  return client;
}
export function setStorageAdminClient(next: StorageAdminClient) {
  client = next;
}
