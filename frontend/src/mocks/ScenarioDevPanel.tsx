"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { canEnableDevTools } from "@/config";

import {
  getMockScenario,
  setMockLatency,
  setMockScenario,
  type MockScenario,
} from "./handlers";

const SCENARIOS: MockScenario[] = [
  "success",
  "empty",
  "forbidden",
  "not_found",
  "conflict",
  "rate_limited",
  "server_error",
  "offline",
];

export function ScenarioDevPanel() {
  const [scenario, setScenario] = useState<MockScenario>(getMockScenario());

  if (!canEnableDevTools()) {
    return null;
  }

  return (
    <section className="border-border bg-elevated space-y-3 rounded-lg border p-4">
      <h2 className="font-display text-lg font-medium">Mock scenarios</h2>
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((value) => (
          <Button
            key={value}
            size="sm"
            variant={scenario === value ? "primary" : "secondary"}
            onClick={() => {
              setMockScenario(value);
              setScenario(value);
            }}
          >
            {value}
          </Button>
        ))}
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setMockLatency(400);
        }}
      >
        Latency 400ms
      </Button>
    </section>
  );
}
