import { describe, expect, it } from "vitest";

import { filterEventsForView } from "./model";

describe("SoloCalendar model", () => {
  it("filters events near the anchor window", () => {
    const events = [
      {
        id: "1",
        title: "A",
        startsAt: "2024-01-01T10:00:00.000Z",
        endsAt: "2024-01-01T11:00:00.000Z",
      },
      {
        id: "2",
        title: "B",
        startsAt: "2024-06-01T10:00:00.000Z",
        endsAt: "2024-06-01T11:00:00.000Z",
      },
    ];
    expect(
      filterEventsForView(events, "week", "2024-01-02T00:00:00.000Z"),
    ).toHaveLength(1);
  });
});
