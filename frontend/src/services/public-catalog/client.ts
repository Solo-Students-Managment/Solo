import { z } from "zod";
import { apiRequest, opaqueIdSchema, SoloApiError } from "@/services/api";

export const catalogClassStatusSchema = z.enum([
  "enrollment_open",
  "enrollment_closed",
  "active",
  "full",
]);
export type CatalogClassStatus = z.infer<typeof catalogClassStatusSchema>;

export const catalogEntrySchema = z.object({
  id: opaqueIdSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().nullable(),
  subject: z.string().min(1),
  providerName: z.string().min(1),
  providerSlug: z.string().min(1),
  seatsTotal: z.number().int().positive(),
  seatsTaken: z.number().int().nonnegative(),
  status: catalogClassStatusSchema,
  waitlistEnabled: z.boolean(),
  waitlistCount: z.number().int().nonnegative(),
});
export type CatalogEntry = z.infer<typeof catalogEntrySchema>;

export const enrollmentRequestStatusSchema = z.enum([
  "pending",
  "waitlisted",
  "accepted",
  "rejected",
]);
export type EnrollmentRequestStatus = z.infer<
  typeof enrollmentRequestStatusSchema
>;

export const enrollmentRequestSchema = z.object({
  id: opaqueIdSchema,
  catalogEntryId: opaqueIdSchema,
  status: enrollmentRequestStatusSchema,
  createdAt: z.string(),
});
export type EnrollmentRequest = z.infer<typeof enrollmentRequestSchema>;

export function seatsRemaining(entry: CatalogEntry): number {
  return Math.max(0, entry.seatsTotal - entry.seatsTaken);
}

export function canRequestEnrollment(entry: CatalogEntry): boolean {
  return entry.status === "enrollment_open" && seatsRemaining(entry) > 0;
}

export function canJoinWaitlist(entry: CatalogEntry): boolean {
  if (!entry.waitlistEnabled) return false;
  if (entry.status === "full") return true;
  if (entry.status === "enrollment_closed") return true;
  return entry.status === "enrollment_open" && seatsRemaining(entry) === 0;
}

export type PublicCatalogClient = {
  list(filters?: { q?: string; subject?: string }): Promise<CatalogEntry[]>;
  getBySlug(slug: string): Promise<CatalogEntry>;
  requestEnrollment(catalogEntryId: string): Promise<EnrollmentRequest>;
  joinWaitlist(catalogEntryId: string): Promise<EnrollmentRequest>;
  listMyRequests(): Promise<EnrollmentRequest[]>;
};

const ENTRIES: CatalogEntry[] = [
  catalogEntrySchema.parse({
    id: "cat_open_algebra",
    slug: "algebra-foundations",
    title: "Algebra Foundations",
    summary: "Core algebra for middle school.",
    subject: "Math",
    providerName: "Nimbus Academy",
    providerSlug: "nimbus-academy",
    seatsTotal: 20,
    seatsTaken: 12,
    status: "enrollment_open",
    waitlistEnabled: true,
    waitlistCount: 0,
  }),
  catalogEntrySchema.parse({
    id: "cat_full_english",
    slug: "english-conversation",
    title: "English Conversation Lab",
    summary: "Speaking practice with limited seats.",
    subject: "English",
    providerName: "Sara English",
    providerSlug: "sara-english",
    seatsTotal: 8,
    seatsTaken: 8,
    status: "full",
    waitlistEnabled: true,
    waitlistCount: 3,
  }),
  catalogEntrySchema.parse({
    id: "cat_closed_physics",
    slug: "physics-lab",
    title: "Physics Lab Intensive",
    summary: "Enrollment closed for this run.",
    subject: "Physics",
    providerName: "Reza Physics",
    providerSlug: "reza-physics",
    seatsTotal: 15,
    seatsTaken: 10,
    status: "enrollment_closed",
    waitlistEnabled: false,
    waitlistCount: 0,
  }),
];

export function createHttpPublicCatalogClient(): PublicCatalogClient {
  return {
    async list(filters) {
      const params = new URLSearchParams();
      if (filters?.q) params.set("q", filters.q);
      if (filters?.subject) params.set("subject", filters.subject);
      const qs = params.toString();
      return apiRequest(`/public/catalog${qs ? `?${qs}` : ""}`, {
        parse: (data) => z.array(catalogEntrySchema).parse(data),
      });
    },
    async getBySlug(slug) {
      try {
        return await apiRequest(`/public/catalog/${encodeURIComponent(slug)}`, {
          parse: (data) => catalogEntrySchema.parse(data),
        });
      } catch (error) {
        if (error instanceof SoloApiError) {
          throw new Error(error.apiError.code.toLowerCase());
        }
        throw error;
      }
    },
    async requestEnrollment(catalogEntryId) {
      return apiRequest("/marketplace/enrollment-requests", {
        method: "POST",
        body: JSON.stringify({ catalogEntryId, mode: "enroll" }),
        parse: (data) => enrollmentRequestSchema.parse(data),
      });
    },
    async joinWaitlist(catalogEntryId) {
      return apiRequest("/marketplace/enrollment-requests", {
        method: "POST",
        body: JSON.stringify({ catalogEntryId, mode: "waitlist" }),
        parse: (data) => enrollmentRequestSchema.parse(data),
      });
    },
    async listMyRequests() {
      return apiRequest("/marketplace/enrollment-requests", {
        parse: (data) => z.array(enrollmentRequestSchema).parse(data),
      });
    },
  };
}

export function createMockPublicCatalogClient(): PublicCatalogClient {
  const bySlug = new Map(ENTRIES.map((e) => [e.slug, { ...e }]));
  const requests: EnrollmentRequest[] = [];
  let seq = 1;

  function getEntry(id: string): CatalogEntry {
    const entry = Array.from(bySlug.values()).find((row) => row.id === id);
    if (!entry) throw new Error("not_found");
    return entry;
  }

  return {
    async list(filters) {
      return Array.from(bySlug.values()).filter((entry) => {
        if (filters?.subject && entry.subject !== filters.subject) return false;
        if (filters?.q) {
          const q = filters.q.toLowerCase();
          const hay =
            `${entry.title} ${entry.summary ?? ""} ${entry.providerName}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
    },
    async getBySlug(slug) {
      const entry = bySlug.get(slug);
      if (!entry) throw new Error("not_found");
      return entry;
    },
    async requestEnrollment(catalogEntryId) {
      const entry = getEntry(catalogEntryId);
      if (!canRequestEnrollment(entry))
        throw new Error("enrollment_unavailable");
      const row = enrollmentRequestSchema.parse({
        id: `enreq_${seq++}`,
        catalogEntryId: entry.id,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      requests.push(row);
      entry.seatsTaken += 1;
      if (seatsRemaining(entry) === 0) entry.status = "full";
      return row;
    },
    async joinWaitlist(catalogEntryId) {
      const entry = getEntry(catalogEntryId);
      if (!canJoinWaitlist(entry)) throw new Error("waitlist_unavailable");
      const row = enrollmentRequestSchema.parse({
        id: `enreq_${seq++}`,
        catalogEntryId: entry.id,
        status: "waitlisted",
        createdAt: new Date().toISOString(),
      });
      requests.push(row);
      entry.waitlistCount += 1;
      return row;
    },
    async listMyRequests() {
      return [...requests];
    },
  };
}

let activeClient: PublicCatalogClient = createMockPublicCatalogClient();

export function setPublicCatalogClient(client: PublicCatalogClient): void {
  activeClient = client;
}

export function getPublicCatalogClient(): PublicCatalogClient {
  return activeClient;
}
