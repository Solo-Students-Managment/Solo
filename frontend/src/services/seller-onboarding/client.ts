import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const sellerStatusSchema = z.enum([
  "not_started",
  "pending_review",
  "active",
  "restricted",
  "rejected",
]);
export type SellerStatus = z.infer<typeof sellerStatusSchema>;

export const sellerProfileSchema = z.object({
  id: opaqueIdSchema,
  displayName: z.string().min(1),
  bio: z.string().nullable(),
  status: sellerStatusSchema,
  capabilities: z.array(z.string()),
  shopSlug: z.string().nullable(),
});
export type SellerProfile = z.infer<typeof sellerProfileSchema>;

export function canSell(profile: SellerProfile): boolean {
  return profile.status === "active";
}

export function needsOnboarding(profile: SellerProfile): boolean {
  return profile.status === "not_started" || profile.status === "rejected";
}

export type SellerOnboardingClient = {
  getMine(): Promise<SellerProfile>;
  startOnboarding(input: {
    displayName: string;
    bio?: string | null;
    shopSlug: string;
  }): Promise<SellerProfile>;
  updateProfile(input: {
    displayName?: string;
    bio?: string | null;
  }): Promise<SellerProfile>;
};

export function createHttpSellerOnboardingClient(): SellerOnboardingClient {
  return {
    async getMine() {
      return apiRequest("/seller/profile", {
        parse: (data) => sellerProfileSchema.parse(data),
      });
    },
    async startOnboarding(input) {
      return apiRequest("/seller/onboarding", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => sellerProfileSchema.parse(data),
      });
    },
    async updateProfile(input) {
      return apiRequest("/seller/profile", {
        method: "PATCH",
        body: JSON.stringify(input),
        parse: (data) => sellerProfileSchema.parse(data),
      });
    },
  };
}

export function createMockSellerOnboardingClient(): SellerOnboardingClient {
  let mine: SellerProfile = sellerProfileSchema.parse({
    id: "seller_1",
    displayName: "Demo Seller",
    bio: null,
    status: "not_started",
    capabilities: [],
    shopSlug: null,
  });
  return {
    async getMine() {
      return mine;
    },
    async startOnboarding(input) {
      if (!input.shopSlug.trim()) throw new Error("validation");
      mine = sellerProfileSchema.parse({
        ...mine,
        displayName: input.displayName,
        bio: input.bio ?? null,
        shopSlug: input.shopSlug,
        status: "pending_review",
        capabilities: ["products.draft"],
      });
      return mine;
    },
    async updateProfile(input) {
      if (mine.status === "not_started") throw new Error("not_onboarded");
      mine = sellerProfileSchema.parse({
        ...mine,
        displayName: input.displayName ?? mine.displayName,
        bio: input.bio === undefined ? mine.bio : input.bio,
      });
      return mine;
    },
  };
}

let active: SellerOnboardingClient = createMockSellerOnboardingClient();
export function setSellerOnboardingClient(c: SellerOnboardingClient) {
  active = c;
}
export function getSellerOnboardingClient() {
  return active;
}
