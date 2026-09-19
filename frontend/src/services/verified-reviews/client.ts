import { z } from "zod";
import { apiRequest, opaqueIdSchema, SoloApiError } from "@/services/api";

export const reviewTargetKindSchema = z.enum([
  "teacher",
  "school",
  "institute",
]);
export type ReviewTargetKind = z.infer<typeof reviewTargetKindSchema>;

export const verifiedReviewSchema = z.object({
  id: opaqueIdSchema,
  targetSlug: z.string().min(1),
  targetKind: reviewTargetKindSchema,
  rating: z.number().int().min(1).max(5),
  body: z.string().min(1).max(2000),
  authorDisplayName: z.string().min(1),
  verifiedEnrollment: z.literal(true),
  createdAt: z.string(),
  status: z.enum(["published", "moderated", "hidden"]),
});
export type VerifiedReview = z.infer<typeof verifiedReviewSchema>;

export function isReviewVisible(review: VerifiedReview): boolean {
  return review.status === "published" && review.verifiedEnrollment;
}

export function averageRating(reviews: VerifiedReview[]): number | null {
  const visible = reviews.filter(isReviewVisible);
  if (visible.length === 0) return null;
  return visible.reduce((sum, row) => sum + row.rating, 0) / visible.length;
}

export type VerifiedReviewsClient = {
  listByTarget(slug: string): Promise<VerifiedReview[]>;
  canReview(slug: string): Promise<boolean>;
  submit(input: {
    targetSlug: string;
    rating: number;
    body: string;
  }): Promise<VerifiedReview>;
};

const SEED: VerifiedReview[] = [
  verifiedReviewSchema.parse({
    id: "rev_1",
    targetSlug: "sara-english",
    targetKind: "teacher",
    rating: 5,
    body: "Clear lessons and patient coaching.",
    authorDisplayName: "Verified learner",
    verifiedEnrollment: true,
    createdAt: "2026-08-01T12:00:00.000Z",
    status: "published",
  }),
  verifiedReviewSchema.parse({
    id: "rev_hidden",
    targetSlug: "sara-english",
    targetKind: "teacher",
    rating: 1,
    body: "Hidden moderated review",
    authorDisplayName: "Hidden",
    verifiedEnrollment: true,
    createdAt: "2026-08-02T12:00:00.000Z",
    status: "moderated",
  }),
];

const ELIGIBLE = new Set(["sara-english", "nimbus-academy"]);

export function createHttpVerifiedReviewsClient(): VerifiedReviewsClient {
  return {
    async listByTarget(slug) {
      return apiRequest(`/public/reviews/${encodeURIComponent(slug)}`, {
        parse: (data) => z.array(verifiedReviewSchema).parse(data),
      });
    },
    async canReview(slug) {
      try {
        const result = await apiRequest(
          `/marketplace/reviews/eligibility/${encodeURIComponent(slug)}`,
          {
            parse: (data) => z.object({ eligible: z.boolean() }).parse(data),
          },
        );
        return result.eligible;
      } catch (error) {
        if (error instanceof SoloApiError && error.apiError.status === 401) {
          return false;
        }
        throw error;
      }
    },
    async submit(input) {
      return apiRequest("/marketplace/reviews", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => verifiedReviewSchema.parse(data),
      });
    },
  };
}

export function createMockVerifiedReviewsClient(): VerifiedReviewsClient {
  const reviews = [...SEED];
  let seq = 10;
  return {
    async listByTarget(slug) {
      return reviews.filter(
        (row) => row.targetSlug === slug && isReviewVisible(row),
      );
    },
    async canReview(slug) {
      return ELIGIBLE.has(slug);
    },
    async submit(input) {
      if (!ELIGIBLE.has(input.targetSlug)) {
        throw new Error("not_eligible");
      }
      if (input.rating < 1 || input.rating > 5) throw new Error("validation");
      const row = verifiedReviewSchema.parse({
        id: `rev_${seq++}`,
        targetSlug: input.targetSlug,
        targetKind: "teacher",
        rating: input.rating,
        body: input.body,
        authorDisplayName: "You",
        verifiedEnrollment: true,
        createdAt: new Date().toISOString(),
        status: "published",
      });
      reviews.push(row);
      return row;
    },
  };
}

let activeClient: VerifiedReviewsClient = createMockVerifiedReviewsClient();

export function setVerifiedReviewsClient(client: VerifiedReviewsClient): void {
  activeClient = client;
}

export function getVerifiedReviewsClient(): VerifiedReviewsClient {
  return activeClient;
}
