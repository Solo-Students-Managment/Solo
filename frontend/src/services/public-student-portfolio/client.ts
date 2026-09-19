import { z } from "zod";
import { apiRequest, opaqueIdSchema, SoloApiError } from "@/services/api";

export const portfolioStatusSchema = z.enum([
  "unpublished",
  "published",
  "moderated",
]);
export type PortfolioStatus = z.infer<typeof portfolioStatusSchema>;

export const publicStudentPortfolioSchema = z.object({
  id: opaqueIdSchema,
  slug: z.string().min(1),
  displayName: z.string().min(1),
  headline: z.string().nullable(),
  about: z.string().nullable(),
  interests: z.array(z.string()),
  isMinor: z.boolean(),
  status: portfolioStatusSchema,
  // Explicitly no grades/attendance/messages/payments in public contract
});
export type PublicStudentPortfolio = z.infer<
  typeof publicStudentPortfolioSchema
>;

export function sanitizePortfolioForPublic(
  portfolio: PublicStudentPortfolio,
): PublicStudentPortfolio {
  // Minor-safe: keep only non-sensitive fields (already enforced by schema)
  return publicStudentPortfolioSchema.parse({
    ...portfolio,
    about: portfolio.isMinor
      ? portfolio.about
        ? portfolio.about.slice(0, 280)
        : null
      : portfolio.about,
  });
}

export type PublicStudentPortfolioClient = {
  getBySlug(slug: string): Promise<PublicStudentPortfolio>;
  getMine(): Promise<PublicStudentPortfolio>;
  publish(): Promise<PublicStudentPortfolio>;
  unpublish(): Promise<PublicStudentPortfolio>;
};

const bySlug = new Map<string, PublicStudentPortfolio>();
let mine: PublicStudentPortfolio | null = null;

function seed() {
  if (mine) return;
  mine = publicStudentPortfolioSchema.parse({
    id: "pub_stu_1",
    slug: "aria-learner",
    displayName: "Aria Learner",
    headline: "Curious about science",
    about: "I enjoy robotics clubs.",
    interests: ["Robotics", "Art"],
    isMinor: true,
    status: "unpublished",
  });
  bySlug.set(mine.slug, mine);
  const published = publicStudentPortfolioSchema.parse({
    id: "pub_stu_pub",
    slug: "mina-portfolio",
    displayName: "Mina Student",
    headline: "Creative writing",
    about: "Stories and poetry.",
    interests: ["Writing"],
    isMinor: true,
    status: "published",
  });
  bySlug.set(published.slug, published);
}

export function createHttpPublicStudentPortfolioClient(): PublicStudentPortfolioClient {
  return {
    async getBySlug(slug) {
      try {
        return await apiRequest(
          `/public/students/${encodeURIComponent(slug)}`,
          {
            parse: (data) => publicStudentPortfolioSchema.parse(data),
          },
        );
      } catch (error) {
        if (error instanceof SoloApiError)
          throw new Error(error.apiError.code.toLowerCase());
        throw error;
      }
    },
    async getMine() {
      return apiRequest("/student/public-portfolio", {
        parse: (data) => publicStudentPortfolioSchema.parse(data),
      });
    },
    async publish() {
      return apiRequest("/student/public-portfolio/publish", {
        method: "POST",
        parse: (data) => publicStudentPortfolioSchema.parse(data),
      });
    },
    async unpublish() {
      return apiRequest("/student/public-portfolio/unpublish", {
        method: "POST",
        parse: (data) => publicStudentPortfolioSchema.parse(data),
      });
    },
  };
}

export function createMockPublicStudentPortfolioClient(): PublicStudentPortfolioClient {
  return {
    async getBySlug(slug) {
      seed();
      const row = bySlug.get(slug);
      if (!row) throw new Error("not_found");
      if (row.status !== "published") throw new Error(row.status);
      return sanitizePortfolioForPublic(row);
    },
    async getMine() {
      seed();
      return mine!;
    },
    async publish() {
      seed();
      mine = publicStudentPortfolioSchema.parse({
        ...mine!,
        status: "published",
      });
      bySlug.set(mine.slug, mine);
      return mine;
    },
    async unpublish() {
      seed();
      mine = publicStudentPortfolioSchema.parse({
        ...mine!,
        status: "unpublished",
      });
      bySlug.set(mine.slug, mine);
      return mine;
    },
  };
}

let client: PublicStudentPortfolioClient =
  createMockPublicStudentPortfolioClient();
export function getPublicStudentPortfolioClient() {
  return client;
}
export function setPublicStudentPortfolioClient(
  next: PublicStudentPortfolioClient,
) {
  client = next;
}
