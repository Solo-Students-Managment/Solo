import { z } from "zod";
import { apiRequest, moneySchema, opaqueIdSchema } from "@/services/api";
import {
  formatCatalogMoney,
  type MarketCode,
  marketCodeSchema,
} from "@/services/pricing";

export const teacherPlanCodeSchema = z.enum([
  "teacher_free",
  "teacher_pro",
  "teacher_business",
]);
export type TeacherPlanCode = z.infer<typeof teacherPlanCodeSchema>;

export const teacherPlanStatusSchema = z.enum(["active", "trial", "expired"]);
export type TeacherPlanStatus = z.infer<typeof teacherPlanStatusSchema>;

export const teacherSubscriptionSchema = z.object({
  userId: opaqueIdSchema,
  planCode: teacherPlanCodeSchema,
  status: teacherPlanStatusSchema,
  trialDaysLeft: z.number().int().nonnegative().nullable(),
  trialEndsAt: z.string().nullable(),
  marketCode: marketCodeSchema,
});
export type TeacherSubscription = z.infer<typeof teacherSubscriptionSchema>;

export const teacherPlanOfferSchema = z.object({
  code: teacherPlanCodeSchema,
  name: z.string().min(1),
  monthlyPrice: moneySchema,
  featureSummary: z.string().min(1),
  trialEligible: z.boolean(),
  highlight: z.boolean(),
});
export type TeacherPlanOffer = z.infer<typeof teacherPlanOfferSchema>;

const TRIAL_DAYS = 14;

const seedOffers: Record<MarketCode, TeacherPlanOffer[]> = {
  IR: [
    teacherPlanOfferSchema.parse({
      code: "teacher_free",
      name: "Teacher Free",
      monthlyPrice: { amount: 0, currency: "IRR" },
      featureSummary: "Core teaching tools and one class",
      trialEligible: false,
      highlight: false,
    }),
    teacherPlanOfferSchema.parse({
      code: "teacher_pro",
      name: "Teacher Pro",
      monthlyPrice: { amount: 490000, currency: "IRR" },
      featureSummary: "Advanced analytics, templates, and exports",
      trialEligible: true,
      highlight: true,
    }),
    teacherPlanOfferSchema.parse({
      code: "teacher_business",
      name: "Teacher Business",
      monthlyPrice: { amount: 1290000, currency: "IRR" },
      featureSummary: "Multi-class ops, CRM-lite, and priority support",
      trialEligible: true,
      highlight: false,
    }),
  ],
  GLOBAL: [
    teacherPlanOfferSchema.parse({
      code: "teacher_free",
      name: "Teacher Free",
      monthlyPrice: { amount: 0, currency: "USD" },
      featureSummary: "Core teaching tools and one class",
      trialEligible: false,
      highlight: false,
    }),
    teacherPlanOfferSchema.parse({
      code: "teacher_pro",
      name: "Teacher Pro",
      monthlyPrice: { amount: 12, currency: "USD" },
      featureSummary: "Advanced analytics, templates, and exports",
      trialEligible: true,
      highlight: true,
    }),
    teacherPlanOfferSchema.parse({
      code: "teacher_business",
      name: "Teacher Business",
      monthlyPrice: { amount: 29, currency: "USD" },
      featureSummary: "Multi-class ops, CRM-lite, and priority support",
      trialEligible: true,
      highlight: false,
    }),
  ],
};

export function offersForMarket(marketCode: MarketCode): TeacherPlanOffer[] {
  return seedOffers[marketCode] ?? [];
}

export function formatPlanPrice(amount: number, currency: "IRR" | "USD") {
  return formatCatalogMoney(amount, currency);
}

export function isTrialActive(subscription: TeacherSubscription): boolean {
  return subscription.status === "trial";
}

export function canStartTrial(
  subscription: TeacherSubscription,
  planCode: TeacherPlanCode,
): boolean {
  if (planCode === "teacher_free") return false;
  if (subscription.planCode === planCode && subscription.status !== "expired") {
    return false;
  }
  if (subscription.status === "trial" && subscription.planCode === planCode) {
    return false;
  }
  return true;
}

export function trialBlockedReason(
  subscription: TeacherSubscription,
  planCode: TeacherPlanCode,
): "already_active" | "not_eligible" | null {
  if (planCode === "teacher_free") return "not_eligible";
  if (
    subscription.planCode === planCode &&
    (subscription.status === "active" || subscription.status === "trial")
  ) {
    return "already_active";
  }
  return null;
}

export type TeacherPlansClient = {
  getSubscription(): Promise<TeacherSubscription>;
  listOffers(marketCode: MarketCode): Promise<TeacherPlanOffer[]>;
  startTrial(planCode: TeacherPlanCode): Promise<TeacherSubscription>;
};

const memory = new Map<string, TeacherSubscription>();

function defaultSubscription(userId: string): TeacherSubscription {
  return teacherSubscriptionSchema.parse({
    userId,
    planCode: "teacher_free",
    status: "active",
    trialDaysLeft: null,
    trialEndsAt: null,
    marketCode: "IR",
  });
}

export function createHttpTeacherPlansClient(): TeacherPlansClient {
  return {
    async getSubscription() {
      return apiRequest("/teacher/plans/subscription", {
        parse: (data) => teacherSubscriptionSchema.parse(data),
      });
    },
    async listOffers(marketCode) {
      return apiRequest(
        `/teacher/plans/offers?market=${encodeURIComponent(marketCode)}`,
        {
          parse: (data) => z.array(teacherPlanOfferSchema).parse(data),
        },
      );
    },
    async startTrial(planCode) {
      return apiRequest("/teacher/plans/trial", {
        method: "POST",
        body: JSON.stringify({ planCode }),
        parse: (data) => teacherSubscriptionSchema.parse(data),
      });
    },
  };
}

export function createMockTeacherPlansClient(
  userId = "usr_demo",
): TeacherPlansClient {
  return {
    async getSubscription() {
      return memory.get(userId) ?? defaultSubscription(userId);
    },
    async listOffers(marketCode) {
      return offersForMarket(marketCode);
    },
    async startTrial(planCode) {
      const current = memory.get(userId) ?? defaultSubscription(userId);
      if (!canStartTrial(current, planCode)) {
        throw new Error("trial_not_allowed");
      }
      const endsAt = new Date(
        Date.now() + TRIAL_DAYS * 86_400_000,
      ).toISOString();
      const next = teacherSubscriptionSchema.parse({
        userId,
        planCode,
        status: "trial",
        trialDaysLeft: TRIAL_DAYS,
        trialEndsAt: endsAt,
        marketCode: current.marketCode,
      });
      memory.set(userId, next);
      return next;
    },
  };
}

let client: TeacherPlansClient = createMockTeacherPlansClient();
export function getTeacherPlansClient() {
  return client;
}
export function setTeacherPlansClient(next: TeacherPlansClient) {
  client = next;
}
export function __resetMockTeacherPlans() {
  memory.clear();
  client = createMockTeacherPlansClient();
}
