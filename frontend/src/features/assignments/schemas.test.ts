import { describe, expect, it } from "vitest";

import {
  createAssignmentSchema,
  createTeamSchema,
  findAssignmentByTitle,
  parseMemberNames,
  peerReviewSchema,
  recordSubmissionSchema,
} from "./schemas";

describe("assignments schemas", () => {
  it("accepts advanced homework payload", () => {
    expect(
      createAssignmentSchema.safeParse({
        title: "Essay 1",
        type: "homework",
        dueAt: "2026-10-01T12:00:00.000Z",
        collaborationMode: "group",
        peerReviewEnabled: "yes",
        maxRevisions: 2,
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

  it("parses team members and finds assignments by title", () => {
    expect(parseMemberNames("Ali, Sara")).toEqual(["Ali", "Sara"]);
    expect(
      findAssignmentByTitle([{ title: "Homework 1" }], "homework 1")?.title,
    ).toBe("Homework 1");
    expect(
      createTeamSchema.safeParse({
        assignmentTitle: "Homework 1",
        teamName: "Alpha",
        memberNames: "Ali, Sara",
      }).success,
    ).toBe(true);
    expect(
      peerReviewSchema.safeParse({
        assignmentTitle: "Homework 1",
        reviewerName: "Ali",
        revieweeName: "Sara",
        score: 88,
      }).success,
    ).toBe(true);
  });
});
