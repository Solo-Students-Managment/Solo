import { z } from "zod";
import { apiRequest, opaqueIdSchema, SoloApiError } from "@/services/api";

export type DiscoveryMapPoint = {
  id: string;
  label: string;
  lat: number;
  lng: number;
};

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export const discoveryKindSchema = z.enum(["teacher", "school", "institute"]);
export type DiscoveryKind = z.infer<typeof discoveryKindSchema>;

export const discoveryItemSchema = z.object({
  id: opaqueIdSchema,
  kind: discoveryKindSchema,
  slug: z.string().min(1),
  displayName: z.string().min(1),
  headline: z.string().nullable(),
  subjects: z.array(z.string()),
  city: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  status: z.literal("published"),
});
export type DiscoveryItem = z.infer<typeof discoveryItemSchema>;

export const discoveryFiltersSchema = z.object({
  q: z.string().optional(),
  kind: discoveryKindSchema.optional(),
  subject: z.string().optional(),
  city: z.string().optional(),
  /** Approximate search center for radius filter */
  nearLat: z.number().optional(),
  nearLng: z.number().optional(),
  radiusKm: z.number().positive().optional(),
});
export type DiscoveryFilters = z.infer<typeof discoveryFiltersSchema>;

export const savedItemSchema = z.object({
  id: opaqueIdSchema,
  discoveryItemId: opaqueIdSchema,
  slug: z.string().min(1),
  displayName: z.string().min(1),
  kind: discoveryKindSchema,
  savedAt: z.string(),
});
export type SavedItem = z.infer<typeof savedItemSchema>;

export function matchesDiscoveryFilters(
  item: DiscoveryItem,
  filters: DiscoveryFilters,
): boolean {
  if (filters.kind && item.kind !== filters.kind) return false;
  if (filters.city && item.city.toLowerCase() !== filters.city.toLowerCase()) {
    return false;
  }
  if (filters.subject) {
    const needle = filters.subject.toLowerCase();
    if (!item.subjects.some((s) => s.toLowerCase() === needle)) return false;
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    const hay =
      `${item.displayName} ${item.headline ?? ""} ${item.subjects.join(" ")} ${item.city}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (
    filters.nearLat !== undefined &&
    filters.nearLng !== undefined &&
    filters.radiusKm !== undefined
  ) {
    const dist = haversineKm(
      { lat: filters.nearLat, lng: filters.nearLng },
      { lat: item.lat, lng: item.lng },
    );
    if (dist > filters.radiusKm) return false;
  }
  return true;
}

export function toMapPoints(items: DiscoveryItem[]): DiscoveryMapPoint[] {
  return items.map((item) => ({
    id: item.id,
    label: item.displayName,
    lat: item.lat,
    lng: item.lng,
  }));
}

export type MarketplaceDiscoveryClient = {
  search(filters: DiscoveryFilters): Promise<DiscoveryItem[]>;
  listSaved(): Promise<SavedItem[]>;
  save(discoveryItemId: string): Promise<SavedItem>;
  unsave(savedItemId: string): Promise<void>;
};

const CATALOG: DiscoveryItem[] = [
  discoveryItemSchema.parse({
    id: "disc_teacher_sara",
    kind: "teacher",
    slug: "sara-english",
    displayName: "Sara English",
    headline: "English conversation coach",
    subjects: ["English"],
    city: "Isfahan",
    lat: 32.6539,
    lng: 51.666,
    status: "published",
  }),
  discoveryItemSchema.parse({
    id: "disc_teacher_reza",
    kind: "teacher",
    slug: "reza-physics",
    displayName: "Reza Physics",
    headline: "High school physics",
    subjects: ["Physics"],
    city: "Tehran",
    lat: 35.6892,
    lng: 51.389,
    status: "published",
  }),
  discoveryItemSchema.parse({
    id: "disc_school_nimbus",
    kind: "school",
    slug: "nimbus-academy",
    displayName: "Nimbus Academy",
    headline: "STEM-focused school",
    subjects: ["Math", "Science"],
    city: "Tehran",
    lat: 35.7219,
    lng: 51.3347,
    status: "published",
  }),
  discoveryItemSchema.parse({
    id: "disc_institute_poly",
    kind: "institute",
    slug: "polyglot-institute",
    displayName: "Polyglot Institute",
    headline: "Language institute",
    subjects: ["English", "French"],
    city: "Shiraz",
    lat: 29.5918,
    lng: 52.5837,
    status: "published",
  }),
];

function seedSaved(): Map<string, SavedItem> {
  return new Map();
}

export function createHttpMarketplaceDiscoveryClient(): MarketplaceDiscoveryClient {
  return {
    async search(filters) {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.kind) params.set("kind", filters.kind);
      if (filters.subject) params.set("subject", filters.subject);
      if (filters.city) params.set("city", filters.city);
      if (filters.nearLat !== undefined)
        params.set("nearLat", String(filters.nearLat));
      if (filters.nearLng !== undefined)
        params.set("nearLng", String(filters.nearLng));
      if (filters.radiusKm !== undefined)
        params.set("radiusKm", String(filters.radiusKm));
      const qs = params.toString();
      return apiRequest(`/public/discovery${qs ? `?${qs}` : ""}`, {
        parse: (data) => z.array(discoveryItemSchema).parse(data),
      });
    },
    async listSaved() {
      try {
        return await apiRequest("/marketplace/saved-items", {
          parse: (data) => z.array(savedItemSchema).parse(data),
        });
      } catch (error) {
        if (error instanceof SoloApiError && error.apiError.status === 401) {
          return [];
        }
        throw error;
      }
    },
    async save(discoveryItemId) {
      return apiRequest("/marketplace/saved-items", {
        method: "POST",
        body: JSON.stringify({ discoveryItemId }),
        parse: (data) => savedItemSchema.parse(data),
      });
    },
    async unsave(savedItemId) {
      await apiRequest(
        `/marketplace/saved-items/${encodeURIComponent(savedItemId)}`,
        {
          method: "DELETE",
          parse: () => undefined,
        },
      );
    },
  };
}

export function createMockMarketplaceDiscoveryClient(): MarketplaceDiscoveryClient {
  const saved = seedSaved();
  let seq = 1;
  return {
    async search(filters) {
      return CATALOG.filter((item) => matchesDiscoveryFilters(item, filters));
    },
    async listSaved() {
      return Array.from(saved.values());
    },
    async save(discoveryItemId) {
      const item = CATALOG.find((row) => row.id === discoveryItemId);
      if (!item) throw new Error("not_found");
      const existing = Array.from(saved.values()).find(
        (row) => row.discoveryItemId === discoveryItemId,
      );
      if (existing) return existing;
      const row = savedItemSchema.parse({
        id: `saved_${seq++}`,
        discoveryItemId: item.id,
        slug: item.slug,
        displayName: item.displayName,
        kind: item.kind,
        savedAt: new Date().toISOString(),
      });
      saved.set(row.id, row);
      return row;
    },
    async unsave(savedItemId) {
      saved.delete(savedItemId);
    },
  };
}

let activeClient: MarketplaceDiscoveryClient =
  createMockMarketplaceDiscoveryClient();

export function setMarketplaceDiscoveryClient(
  client: MarketplaceDiscoveryClient,
): void {
  activeClient = client;
}

export function getMarketplaceDiscoveryClient(): MarketplaceDiscoveryClient {
  return activeClient;
}
