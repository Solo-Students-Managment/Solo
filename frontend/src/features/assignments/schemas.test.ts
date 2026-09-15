import { describe, expect, it } from "vitest";

import { createAssignmentSchema, recordSubmissionSchema } from "./schemas";

describe("assignments schemas", () => {
  it("accepts homework payload", () => {
    expect(
      createAssignmentSchema.safeParse({
        title: "Essay 1",
        type: "homework",
        dueAt: "2026-10-01T12:00:00.000Z",
      }).success,
    ).toBe(true);
  });

  it("accepts non-video submission and rejects empty student", () => {
    expect(
      recordSubmissionSchema.safeParse({
        assignmentTitle: "Essay 1",
        studentDisplayName: "Sara",
        mimeHint: "pdf",
      }).success,
    ).toBe(true);
    expect(
      recordSubmissionSchema.safeParse({
        assignmentTitle: "Essay 1",
        studentDisplayName: "",
        mimeHint: "pdf",
      }).success,
    ).toBe(false);
    expect(
      recordSubmissionSchema.safeParse({
        assignmentTitle: "Essay 1",
        studentDisplayName: "Sara",
        mimeHint: "video",
      }).success,
    ).toBe(false);
  });
});
