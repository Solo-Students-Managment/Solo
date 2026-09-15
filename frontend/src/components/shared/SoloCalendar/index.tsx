"use client";

import {
  filterEventsForView,
  type CalendarView,
  type SoloCalendarEvent,
} from "./model";

type SoloCalendarProps = {
  events: SoloCalendarEvent[];
  view?: CalendarView;
  anchorIso?: string;
};

export function SoloCalendar({
  events,
  view = "week",
  anchorIso = new Date().toISOString(),
}: SoloCalendarProps) {
  const visible = filterEventsForView(events, view, anchorIso);

  return (
    <section className="space-y-3" aria-label="Calendar">
      <p className="text-muted text-sm">View: {view}</p>
      <ul className="space-y-2">
        {visible.map((event) => (
          <li
            key={event.id}
            className="border-border bg-elevated rounded-md border px-3 py-2 text-sm"
          >
            <p className="font-medium">{event.title}</p>
            <p className="text-muted text-xs tabular-nums">
              {event.startsAt} → {event.endsAt}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export * from "./model";
