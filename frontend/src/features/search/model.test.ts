import { describe, expect, it } from "vitest";
import {
  filterAuthorizedResults,
  filterResultsByQuery,
  mapHitsToResults,
} from "./model";

describe("search authorization filter", () => {
  it("never returns unauthorized titles", () => {
    const result = filterAuthorizedResults([
      { allowed: true, title: "Visible" },
      { allowed: false, title: "Secret" },
    ]);
    expect(result).toEqual([{ allowed: true, title: "Visible" }]);
  });

  it("maps hits and filters by query without leaking denied items", () => {
    const mapped = mapHitsToResults([
      {
        id: "1",
        title: "Algebra course",
        href: "/org/demo/courses",
        allowed: true,
        entityType: "course",
      },
      {
        id: "2",
        title: "Private message",
        href: "/personal/messages",
        allowed: false,
        entityType: "message",
      },
    ]);
    const visible = filterAuthorizedResults(
      filterResultsByQuery(mapped, "alge"),
    );
    expect(visible).toEqual([
      {
        id: "1",
        title: "Algebra course",
        href: "/org/demo/courses",
        allowed: true,
        entityType: "course",
      },
    ]);
  });
});
