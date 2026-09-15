import type { CalendarEvent } from "@/services/calendar";

export function sortUpcomingEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function filterEventsByKind(
  events: CalendarEvent[],
  kind: CalendarEvent["kind"] | "all",
): CalendarEvent[] {
  if (kind === "all") return events;
  return events.filter((event) => event.kind === kind);
}
