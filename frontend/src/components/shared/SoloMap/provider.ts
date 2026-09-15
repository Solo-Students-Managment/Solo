export type MapPoint = {
  id: string;
  label: string;
  lat: number;
  lng: number;
};

export type SoloMapProvider = {
  id: string;
  geocode(query: string): Promise<MapPoint[]>;
  reverseGeocode(lat: number, lng: number): Promise<MapPoint | null>;
};

export function createMockMapProvider(): SoloMapProvider {
  return {
    id: "mock",
    async geocode(query) {
      return [
        {
          id: "pt_1",
          label: query || "Tehran",
          lat: 35.6892,
          lng: 51.389,
        },
      ];
    },
    async reverseGeocode(lat, lng) {
      return {
        id: "pt_rev",
        label: `${lat.toFixed(3)}, ${lng.toFixed(3)}`,
        lat,
        lng,
      };
    },
  };
}

export function haversineKm(
  a: Pick<MapPoint, "lat" | "lng">,
  b: Pick<MapPoint, "lat" | "lng">,
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
