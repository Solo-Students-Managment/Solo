import { afterEach, describe, expect, it } from "vitest";

import {
  addBreadcrumb,
  captureEvent,
  captureWebVital,
  configureObservability,
  getBreadcrumbs,
  registerObservabilitySink,
} from "./client";

describe("observability", () => {
  afterEach(() => {
    configureObservability({
      release: "local",
      environment: "local",
      correlationId: "anon",
      sampleRate: 1,
    });
  });

  it("redacts sensitive content before emitting", () => {
    const events: Array<{ message: string }> = [];
    registerObservabilitySink((event) => events.push(event));
    captureEvent({
      name: "test",
      level: "info",
      message: "password=super-secret",
    });
    expect(events.at(-1)?.message).toContain("[REDACTED]");
  });

  it("attaches release environment and correlation metadata", () => {
    configureObservability({
      release: "abc123",
      environment: "preview",
      correlationId: "corr-1",
      sampleRate: 1,
    });
    const events: Array<{
      release?: string;
      environment?: string;
      correlationId?: string;
    }> = [];
    registerObservabilitySink((event) => events.push(event));
    captureEvent({ name: "boot", level: "info", message: "ready" });
    expect(events.at(-1)).toMatchObject({
      release: "abc123",
      environment: "preview",
      correlationId: "corr-1",
    });
  });

  it("stores redacted breadcrumbs for incident correlation", () => {
    addBreadcrumb("auth", "token=abc");
    expect(getBreadcrumbs().at(-1)?.message).toContain("[REDACTED]");
  });

  it("captures web vitals as info events", () => {
    const events: Array<{ name: string; context?: Record<string, string> }> =
      [];
    registerObservabilitySink((event) => events.push(event));
    captureWebVital("LCP", 1800, "/");
    expect(events.at(-1)).toMatchObject({
      name: "web-vital",
      context: { route: "/", metric: "LCP", value: "1800" },
    });
  });
});
