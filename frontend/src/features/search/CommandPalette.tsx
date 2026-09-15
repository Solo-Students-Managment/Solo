"use client";

import { useEffect, useMemo, useState } from "react";

import {
  filterAuthorizedResults,
  type CommandAction,
  type SearchResult,
} from "./model";

type CommandPaletteProps = {
  results: SearchResult[];
  actions: CommandAction[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CommandPalette({
  results,
  actions,
  open: openProp,
  onOpenChange,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const isOpen = openProp ?? open;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const next = !isOpen;
        setOpen(next);
        onOpenChange?.(next);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onOpenChange]);

  const visibleResults = useMemo(
    () => filterAuthorizedResults(results),
    [results],
  );
  const visibleActions = useMemo(
    () => filterAuthorizedResults(actions),
    [actions],
  );

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Command palette"
      className="border-border bg-elevated fixed inset-x-4 top-24 z-50 mx-auto max-w-lg rounded-lg border p-3 shadow-md"
    >
      <p className="text-muted mb-2 text-xs">Search & commands</p>
      <ul className="space-y-1">
        {visibleResults.map((result) => (
          <li key={result.id}>
            <a
              className="hover:bg-sunken block rounded-md px-2 py-1 text-sm"
              href={result.href}
            >
              {result.title}
            </a>
          </li>
        ))}
        {visibleActions.map((action) => (
          <li key={action.id} className="px-2 py-1 text-sm">
            {action.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export * from "./model";
