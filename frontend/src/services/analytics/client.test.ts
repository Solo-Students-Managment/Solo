import { describe, expect, it } from "vitest";
import { opaqueIdSchema } from "@/services/api";
import {
  createMockAnalyticsClient,
  isGoalMet,
  __resetMockAnalytics,
} from "./client";

describe("isGoalMet", () => {
  it("returns true when current meets target", () => {
    expect(
      isGoalMet({
        id: opaqueIdSchema.parse("goal_1"),
        organizationId: opaqueIdSchema.parse("org_1"),
        name: "Enrollments",
        targetValue: 100,
        currentValue: 100,
      }),
    ).toBe(true);
    expect(
      isGoalMet({
        id: opaqueIdSchema.parse("goal_1"),
        organizationId: opaqueIdSchema.parse("org_1"),
        name: "Enrollments",
        targetValue: 100,
        currentValue: 50,
      }),
    ).toBe(false);
  });
});

describe("analytics client", () => {
  it("creates view and goal then updates progress", async () => {
    __resetMockAnalytics();
    const client = createMockAnalyticsClient();
    await client.createView("org_1", {
      name: "Attendance trend",
      metricKey: "attendance_rate",
      alertThreshold: 80,
    });
    const goal = await client.createGoal("org_1", {
      name: "New enrollments",
      targetValue: 20,
    });
    const updated = await client.updateGoalProgress(
      "org_1",
      String(goal.id),
      20,
    );
    expect(isGoalMet(updated)).toBe(true);
  });
});
