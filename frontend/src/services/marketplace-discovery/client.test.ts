import { describe, expect, it } from "vitest";
import { opaqueIdSchema } from "@/services/api";
import {
  createMockMarketplaceDiscoveryClient,
  matchesDiscoveryFilters,
  toMapPoints,
  type DiscoveryItem,
} from "./client";

const base: DiscoveryItem = {
  id: opaqueIdSchema.parse("disc_1"),
  kind: "teacher",
  slug: "sara-english",
  displayName: "Sara English",
  headline: "English coach",
  subjects: ["English"],
  city: "Isfahan",
  lat: 32.65,
  lng: 51.66,
  status: "published",
};

describe("marketplace discovery", () => {
  it("filters by kind subject city and query", () => {
    expect(matchesDiscoveryFilters(base, { kind: "teacher" })).toBe(true);
    expect(matchesDiscoveryFilters(base, { kind: "school" })).toBe(false);
    expect(matchesDiscoveryFilters(base, { subject: "English" })).toBe(true);
    expect(matchesDiscoveryFilters(base, { subject: "Math" })).toBe(false);
    expect(matchesDiscoveryFilters(base, { city: "isfahan" })).toBe(true);
    expect(matchesDiscoveryFilters(base, { q: "conversation" })).toBe(false);
    expect(matchesDiscoveryFilters(base, { q: "sara" })).toBe(true);
  });

  it("filters by radius using haversine", () => {
    expect(
      matchesDiscoveryFilters(base, {
        nearLat: 32.65,
        nearLng: 51.66,
        radiusKm: 5,
      }),
    ).toBe(true);
    expect(
      matchesDiscoveryFilters(base, {
        nearLat: 35.68,
        nearLng: 51.38,
        radiusKm: 50,
      }),
    ).toBe(false);
  });

  it("maps items to map points and supports save/unsave", async () => {
    const client = createMockMarketplaceDiscoveryClient();
    const results = await client.search({
      kind: "teacher",
      subject: "English",
    });
    expect(results).toHaveLength(1);
    expect(toMapPoints(results)[0]?.label).toBe("Sara English");
    const saved = await client.save(results[0]!.id);
    expect(await client.listSaved()).toHaveLength(1);
    await client.unsave(saved.id);
    expect(await client.listSaved()).toHaveLength(0);
  });
});
