import { describe, expect, it } from "vitest";
import { opaqueIdSchema } from "@/services/api";
import { filterEventsByKind, sortUpcomingEvents } from "./model";

const events = [
  {
    id: opaqueIdSchema.parse("a"),
    title: "B",
    startsAt: "2026-02-02T10:00:00.000Z",
    endsAt: "2026-02-02T11:00:00.000Z",
    kind: "assignment" as const,
  },
  {
    id: opaqueIdSchema.parse("b"),
    title: "A",
    startsAt: "2026-02-01T10:00:00.000Z",
    endsAt: "2026-02-01T11:00:00.000Z",
    kind: "session" as const,
  },
];

describe("calendar upcoming model", () => {
  it("sorts by start and filters kind", () => {
    expect(sortUpcomingEvents(events)[0]?.title).toBe("A");
    expect(filterEventsByKind(events, "session")).toHaveLength(1);
  });
});
