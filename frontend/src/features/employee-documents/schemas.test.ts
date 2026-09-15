import { describe, expect, it } from "vitest";
import { createEmployeeDocumentSchema } from "./schemas";
describe("employee documents schemas", () => {
  it("requires title", () => {
    expect(
      createEmployeeDocumentSchema.safeParse({
        staffDisplayName: "Sam",
        title: "",
        category: "ID",
      }).success,
    ).toBe(false);
  });
});
