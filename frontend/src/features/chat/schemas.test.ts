import { describe, expect, it } from "vitest";
import { createRoomSchema, sendChatMessageSchema } from "./schemas";
describe("chat schemas", () => {
  it("accepts room and message", () => {
    expect(
      createRoomSchema.safeParse({ name: "Class A", scope: "class" }).success,
    ).toBe(true);
    expect(sendChatMessageSchema.safeParse({ body: "Hello" }).success).toBe(
      true,
    );
  });
});
