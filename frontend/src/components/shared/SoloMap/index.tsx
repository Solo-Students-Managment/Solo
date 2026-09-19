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
  /** When provided, render these points instead of geocoding `query`. */
  points?: MapPoint[];
  "aria-label"?: string;
};

export function SoloMap({
  provider = createMockMapProvider(),
  query = "",
  points: pointsProp,
  "aria-label": ariaLabel = "Map results",
}: SoloMapProps) {
  const [points, setPoints] = useState<MapPoint[]>(pointsProp ?? []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pointsProp !== undefined) {
      setPoints(pointsProp);
      setError(null);
      return;
    }
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
  }, [provider, query, pointsProp]);

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
      <ul aria-label={ariaLabel}>
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
