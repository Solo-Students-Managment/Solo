import { redactSensitive } from "@/lib/security/policy";

export type ObservabilityLevel = "info" | "warning" | "error";

export type ObservabilityEvent = {
  name: string;
  level: ObservabilityLevel;
  message: string;
  context?: Record<string, string>;
  release?: string;
  environment?: string;
  correlationId?: string;
};

export type ObservabilityBreadcrumb = {
  category: string;
  message: string;
  timestamp: number;
};

type Sink = (event: ObservabilityEvent) => void;

const sinks: Sink[] = [];
const breadcrumbs: ObservabilityBreadcrumb[] = [];
const MAX_BREADCRUMBS = 40;

let release = process.env.NEXT_PUBLIC_RELEASE_SHA ?? "local";
let environment = process.env.NEXT_PUBLIC_APP_ENV ?? "local";
let correlationId = "anon";
let sampleRate = 1;

export function configureObservability(options: {
  release?: string;
  environment?: string;
  correlationId?: string;
  sampleRate?: number;
}): void {
  if (options.release) release = options.release;
  if (options.environment) environment = options.environment;
  if (options.correlationId) correlationId = options.correlationId;
  if (typeof options.sampleRate === "number") {
    sampleRate = Math.min(1, Math.max(0, options.sampleRate));
  }
}

export function registerObservabilitySink(sink: Sink): void {
  sinks.push(sink);
}

export function addBreadcrumb(
  category: string,
  message: string,
): ObservabilityBreadcrumb {
  const crumb: ObservabilityBreadcrumb = {
    category,
    message: redactSensitive(message),
    timestamp: Date.now(),
  };
  breadcrumbs.push(crumb);
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift();
  }
  return crumb;
}

export function getBreadcrumbs(): readonly ObservabilityBreadcrumb[] {
  return breadcrumbs;
}

function shouldSample(): boolean {
  return Math.random() <= sampleRate;
}

export function captureEvent(event: ObservabilityEvent): void {
  if (!shouldSample() && event.level === "info") return;

  const safe: ObservabilityEvent = {
    ...event,
    message: redactSensitive(event.message),
    context: event.context
      ? Object.fromEntries(
          Object.entries(event.context).map(([key, value]) => [
            key,
            redactSensitive(value),
          ]),
        )
      : undefined,
    release: event.release ?? release,
    environment: event.environment ?? environment,
    correlationId: event.correlationId ?? correlationId,
  };
  for (const sink of sinks) sink(safe);
}

export function captureException(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  addBreadcrumb("exception", message);
  captureEvent({
    name: "exception",
    level: "error",
    message,
  });
}

export function captureWebVital(
  name: "LCP" | "CLS" | "INP" | "TTFB",
  value: number,
  route: string,
): void {
  captureEvent({
    name: "web-vital",
    level: "info",
    message: `${name}=${value}`,
    context: { route, metric: name, value: String(value) },
  });
}
