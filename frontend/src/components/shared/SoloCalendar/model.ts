export type CalendarView = "month" | "week" | "day" | "agenda";

export type SoloCalendarEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
};

export function filterEventsForView(
  events: SoloCalendarEvent[],
  view: CalendarView,
  anchorIso: string,
): SoloCalendarEvent[] {
  const anchor = Date.parse(anchorIso);
  const dayMs = 24 * 60 * 60 * 1000;
  const windowMs =
    view === "day" ? dayMs : view === "week" ? dayMs * 7 : dayMs * 31;
  return events.filter((event) => {
    const start = Date.parse(event.startsAt);
    return Math.abs(start - anchor) <= windowMs;
  });
}
