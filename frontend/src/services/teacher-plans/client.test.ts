import { describe, expect, it } from "vitest";
import {
  canStartTrial,
  createMockTeacherPlansClient,
  isTrialActive,
  offersForMarket,
  teacherSubscriptionSchema,
  trialBlockedReason,
} from "./client";

describe("teacher-plans helpers", () => {
  it("lists market-specific offers with demo Price Book amounts", () => {
    const ir = offersForMarket("IR");
    const global = offersForMarket("GLOBAL");
    expect(ir.map((o) => o.code)).toEqual([
      "teacher_free",
      "teacher_pro",
      "teacher_business",
    ]);
    expect(global.every((o) => o.monthlyPrice.currency === "USD")).toBe(true);
    expect(ir.every((o) => o.monthlyPrice.currency === "IRR")).toBe(true);
  });

  it("allows Pro/Business trial start from free plan", async () => {
    const client = createMockTeacherPlansClient("usr_trial");
    const sub = await client.getSubscription();
    expect(canStartTrial(sub, "teacher_pro")).toBe(true);
    expect(canStartTrial(sub, "teacher_free")).toBe(false);
    const trial = await client.startTrial("teacher_pro");
    expect(isTrialActive(trial)).toBe(true);
    expect(trial.planCode).toBe("teacher_pro");
    expect(canStartTrial(trial, "teacher_pro")).toBe(false);
    expect(trialBlockedReason(trial, "teacher_pro")).toBe("already_active");
  });

  it("blocks duplicate trial while active", async () => {
    const client = createMockTeacherPlansClient("usr_dup");
    await client.startTrial("teacher_business");
    const sub = teacherSubscriptionSchema.parse(await client.getSubscription());
    expect(sub.status).toBe("trial");
    await expect(client.startTrial("teacher_business")).rejects.toThrow(
      "trial_not_allowed",
    );
  });
});
