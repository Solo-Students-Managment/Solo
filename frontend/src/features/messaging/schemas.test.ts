import { describe, expect, it } from "vitest";
import { sendBroadcastSchema, sendDirectSchema } from "./schemas";
describe("messaging schemas", () => {
  it("accepts direct and broadcast", () => {
    expect(
      sendDirectSchema.safeParse({
        subjectScope: "Math",
        participantLabel: "Sara",
        body: "Hi",
      }).success,
    ).toBe(true);
    expect(
      sendBroadcastSchema.safeParse({ subjectScope: "Math", body: "Reminder" })
        .success,
    ).toBe(true);
  });
});
