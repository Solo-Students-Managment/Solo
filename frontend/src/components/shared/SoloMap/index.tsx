"use client";

import { useEffect, useState } from "react";

import {
  createMockMapProvider,
  type MapPoint,
  type SoloMapProvider,
} from "./provider";

type SoloMapProps = {
  provider?: SoloMapProvider;
  query?: string;
};

export function SoloMap({
  provider = createMockMapProvider(),
  query = "",
}: SoloMapProps) {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    provider
      .geocode(query)
      .then((result) => {
        if (!cancelled) setPoints(result);
      })
      .catch(() => {
        if (!cancelled) setError("provider_unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [provider, query]);

  if (error) {
    return (
      <p role="alert" className="text-danger text-sm">
        Map provider unavailable
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="bg-sunken text-muted flex h-48 items-center justify-center rounded-md text-sm"
        aria-hidden
      >
        Map canvas ({provider.id})
      </div>
      <ul aria-label="Map results">
        {points.map((point) => (
          <li key={point.id} className="text-sm">
            {point.label} ({point.lat}, {point.lng})
          </li>
        ))}
      </ul>
    </div>
  );
}

export * from "./provider";
