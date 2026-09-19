import { z } from "zod";
import { apiRequest, opaqueIdSchema, SoloApiError } from "@/services/api";

export const publicSchoolKindSchema = z.enum(["school", "institute"]);
export type PublicSchoolKind = z.infer<typeof publicSchoolKindSchema>;

export const publicSchoolStatusSchema = z.enum([
  "unpublished",
  "published",
  "moderated",
]);
export type PublicSchoolStatus = z.infer<typeof publicSchoolStatusSchema>;

export const publicSchoolProfileSchema = z.object({
  id: opaqueIdSchema,
  kind: publicSchoolKindSchema,
  slug: z.string().min(1),
  displayName: z.string().min(1),
  headline: z.string().nullable(),
  about: z.string().nullable(),
  city: z.string().nullable(),
  status: publicSchoolStatusSchema,
  organizationId: opaqueIdSchema,
});
export type PublicSchoolProfile = z.infer<typeof publicSchoolProfileSchema>;

export function isSchoolPubliclyVisible(status: PublicSchoolStatus) {
  return status === "published";
}

export type PublicSchoolProfileClient = {
  getBySlug(slug: string): Promise<PublicSchoolProfile>;
  getForOrg(organizationId: string): Promise<PublicSchoolProfile>;
  publish(organizationId: string): Promise<PublicSchoolProfile>;
  unpublish(organizationId: string): Promise<PublicSchoolProfile>;
};

const bySlug = new Map<string, PublicSchoolProfile>();
const byOrg = new Map<string, PublicSchoolProfile>();

function seed() {
  if (bySlug.size) return;
  const unpublished = publicSchoolProfileSchema.parse({
    id: "pub_school_1",
    kind: "school",
    slug: "sunrise-school",
    displayName: "Sunrise School",
    headline: "K-12 learning community",
    about: "Full-time academic programs.",
    city: "Tehran",
    status: "unpublished",
    organizationId: "org_seed_school",
  });
  const published = publicSchoolProfileSchema.parse({
    id: "pub_inst_1",
    kind: "institute",
    slug: "nova-institute",
    displayName: "Nova Institute",
    headline: "Language & STEM institute",
    about: "Evening and weekend courses.",
    city: "Shiraz",
    status: "published",
    organizationId: "org_seed_institute",
  });
  for (const row of [unpublished, published]) {
    bySlug.set(row.slug, row);
    byOrg.set(row.organizationId, row);
  }
}

export function createHttpPublicSchoolProfileClient(): PublicSchoolProfileClient {
  return {
    async getBySlug(slug) {
      try {
        return await apiRequest(`/public/schools/${encodeURIComponent(slug)}`, {
          parse: (data) => publicSchoolProfileSchema.parse(data),
        });
      } catch (error) {
        if (error instanceof SoloApiError) {
          throw new Error(error.apiError.code.toLowerCase());
        }
        throw error;
      }
    },
    async getForOrg(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/public-profile`,
        { parse: (data) => publicSchoolProfileSchema.parse(data) },
      );
    },
    async publish(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/public-profile/publish`,
        {
          method: "POST",
          parse: (data) => publicSchoolProfileSchema.parse(data),
        },
      );
    },
    async unpublish(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/public-profile/unpublish`,
        {
          method: "POST",
          parse: (data) => publicSchoolProfileSchema.parse(data),
        },
      );
    },
  };
}

export function createMockPublicSchoolProfileClient(): PublicSchoolProfileClient {
  return {
    async getBySlug(slug) {
      seed();
      const row = bySlug.get(slug);
      if (!row) throw new Error("not_found");
      if (!isSchoolPubliclyVisible(row.status)) throw new Error(row.status);
      return row;
    },
    async getForOrg(organizationId) {
      seed();
      let row = byOrg.get(organizationId);
      if (!row) {
        row = publicSchoolProfileSchema.parse({
          id: `pub_org_${organizationId}`,
          kind: "school",
          slug: `org-${organizationId}`,
          displayName: "Organization School",
          headline: null,
          about: null,
          city: null,
          status: "unpublished",
          organizationId,
        });
        byOrg.set(organizationId, row);
        bySlug.set(row.slug, row);
      }
      return row;
    },
    async publish(organizationId) {
      const current = await this.getForOrg(organizationId);
      const next = publicSchoolProfileSchema.parse({
        ...current,
        status: "published",
      });
      byOrg.set(organizationId, next);
      bySlug.set(next.slug, next);
      return next;
    },
    async unpublish(organizationId) {
      const current = await this.getForOrg(organizationId);
      const next = publicSchoolProfileSchema.parse({
        ...current,
        status: "unpublished",
      });
      byOrg.set(organizationId, next);
      bySlug.set(next.slug, next);
      return next;
    },
  };
}

let client: PublicSchoolProfileClient = createMockPublicSchoolProfileClient();
export function getPublicSchoolProfileClient() {
  return client;
}
export function setPublicSchoolProfileClient(next: PublicSchoolProfileClient) {
  client = next;
}
