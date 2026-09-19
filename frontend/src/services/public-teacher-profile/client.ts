import { z } from "zod";
import { apiRequest, opaqueIdSchema, SoloApiError } from "@/services/api";

export const publicProfileKindSchema = z.enum([
  "teacher",
  "school",
  "institute",
  "student",
]);
export type PublicProfileKind = z.infer<typeof publicProfileKindSchema>;

export const publicProfileStatusSchema = z.enum([
  "unpublished",
  "published",
  "moderated",
]);
export type PublicProfileStatus = z.infer<typeof publicProfileStatusSchema>;

export const publicTeacherProfileSchema = z.object({
  id: opaqueIdSchema,
  kind: z.literal("teacher"),
  slug: z.string().min(1),
  displayName: z.string().min(1),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  subjects: z.array(z.string()),
  locationLabel: z.string().nullable(),
  status: publicProfileStatusSchema,
  ownerUserId: opaqueIdSchema,
});
export type PublicTeacherProfile = z.infer<typeof publicTeacherProfileSchema>;

export function isPubliclyVisible(
  status: PublicProfileStatus,
): status is "published" {
  return status === "published";
}

export type PublicTeacherProfileClient = {
  getBySlug(slug: string): Promise<PublicTeacherProfile>;
  getMine(): Promise<PublicTeacherProfile>;
  updateMine(input: {
    headline?: string | null;
    bio?: string | null;
    subjects?: string[];
    locationLabel?: string | null;
  }): Promise<PublicTeacherProfile>;
  publish(): Promise<PublicTeacherProfile>;
  unpublish(): Promise<PublicTeacherProfile>;
};

const bySlug = new Map<string, PublicTeacherProfile>();
let mine: PublicTeacherProfile | null = null;

function seedMine(): PublicTeacherProfile {
  if (mine) return mine;
  mine = publicTeacherProfileSchema.parse({
    id: "pub_teacher_1",
    kind: "teacher",
    slug: "neda-math",
    displayName: "Neda Teacher",
    headline: "Math tutor for middle school",
    bio: "10 years teaching algebra and geometry.",
    subjects: ["Algebra", "Geometry"],
    locationLabel: "Tehran",
    status: "unpublished",
    ownerUserId: "usr_1",
  });
  bySlug.set(mine.slug, mine);
  // Also seed a published demo for public smoke without auth publish step
  const published = publicTeacherProfileSchema.parse({
    ...mine,
    id: "pub_teacher_published",
    slug: "sara-english",
    displayName: "Sara English",
    headline: "English conversation coach",
    bio: "IELTS and conversation practice.",
    subjects: ["English"],
    locationLabel: "Isfahan",
    status: "published",
    ownerUserId: "usr_demo_teacher",
  });
  bySlug.set(published.slug, published);
  return mine;
}

export function createHttpPublicTeacherProfileClient(): PublicTeacherProfileClient {
  return {
    async getBySlug(slug) {
      try {
        return await apiRequest(
          `/public/teachers/${encodeURIComponent(slug)}`,
          {
            parse: (data) => publicTeacherProfileSchema.parse(data),
          },
        );
      } catch (error) {
        if (error instanceof SoloApiError) {
          throw new Error(error.apiError.code.toLowerCase());
        }
        throw error;
      }
    },
    async getMine() {
      return apiRequest("/teacher/public-profile", {
        parse: (data) => publicTeacherProfileSchema.parse(data),
      });
    },
    async updateMine(input) {
      return apiRequest("/teacher/public-profile", {
        method: "PATCH",
        body: JSON.stringify(input),
        parse: (data) => publicTeacherProfileSchema.parse(data),
      });
    },
    async publish() {
      return apiRequest("/teacher/public-profile/publish", {
        method: "POST",
        parse: (data) => publicTeacherProfileSchema.parse(data),
      });
    },
    async unpublish() {
      return apiRequest("/teacher/public-profile/unpublish", {
        method: "POST",
        parse: (data) => publicTeacherProfileSchema.parse(data),
      });
    },
  };
}

export function createMockPublicTeacherProfileClient(): PublicTeacherProfileClient {
  return {
    async getBySlug(slug) {
      seedMine();
      const row = bySlug.get(slug);
      if (!row) {
        const err = new Error("not_found");
        throw err;
      }
      if (!isPubliclyVisible(row.status)) {
        const err = new Error(row.status);
        throw err;
      }
      return row;
    },
    async getMine() {
      return seedMine();
    },
    async updateMine(input) {
      const current = seedMine();
      mine = publicTeacherProfileSchema.parse({
        ...current,
        ...input,
        subjects: input.subjects ?? current.subjects,
      });
      bySlug.set(mine.slug, mine);
      return mine;
    },
    async publish() {
      const current = seedMine();
      mine = publicTeacherProfileSchema.parse({
        ...current,
        status: "published",
      });
      bySlug.set(mine.slug, mine);
      return mine;
    },
    async unpublish() {
      const current = seedMine();
      mine = publicTeacherProfileSchema.parse({
        ...current,
        status: "unpublished",
      });
      bySlug.set(mine.slug, mine);
      return mine;
    },
  };
}

let client: PublicTeacherProfileClient = createMockPublicTeacherProfileClient();
export function getPublicTeacherProfileClient() {
  return client;
}
export function setPublicTeacherProfileClient(
  next: PublicTeacherProfileClient,
) {
  client = next;
}
