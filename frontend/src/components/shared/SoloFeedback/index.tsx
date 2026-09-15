"use client";

import { useFeedbackStore } from "./store";
import { cn } from "@/lib/utils/cn";

const toneClass = {
  info: "border-info/30 bg-[var(--solo-status-info-bg)]",
  success: "border-success/30 bg-[var(--solo-status-success-bg)]",
  warning: "border-warning/30 bg-[var(--solo-status-warning-bg)]",
  error: "border-danger/30 bg-[var(--solo-status-danger-bg)]",
} as const;

export function SoloFeedbackViewport() {
  const items = useFeedbackStore((state) => state.items);
  const dismiss = useFeedbackStore((state) => state.dismiss);

  return (
    <div
      className="pointer-events-none fixed end-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role="status"
          className={cn(
            "pointer-events-auto rounded-md border px-3 py-2 shadow-sm",
            toneClass[item.tone],
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-foreground text-sm font-medium">
                {item.title}
              </p>
              {item.description ? (
                <p className="text-muted text-xs">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="text-muted text-xs underline"
              onClick={() => dismiss(item.id)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function pushFeedback(
  input: Parameters<ReturnType<typeof useFeedbackStore.getState>["push"]>[0],
): string {
  return useFeedbackStore.getState().push(input);
}
