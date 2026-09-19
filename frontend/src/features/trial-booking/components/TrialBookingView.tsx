"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { pushFeedback } from "@/components/shared/SoloFeedback";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Label,
  Skeleton,
} from "@/components/ui";
import { resolveLocale, localeDirection } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/t";
import { createQueryKeyFactory } from "@/lib/query/keys";
import { getAuthClient } from "@/services/auth";
import {
  canBookTrial,
  getTrialBookingClient,
  seatsLeft,
} from "@/services/trial-booking";

const keys = createQueryKeyFactory("trial-booking");

export function TrialBookingView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = resolveLocale(searchParams.get("lang") ?? undefined);
  const dir = localeDirection(locale);
  const providerSlug = searchParams.get("provider") ?? undefined;
  const subject = searchParams.get("subject") ?? undefined;
  const tab = searchParams.get("tab") === "mine" ? "mine" : "slots";
  const queryClient = useQueryClient();
  const ctx = { personaId: undefined, organizationId: null, subjectId: null };

  const sessionQuery = useQuery({
    queryKey: keys.detail(ctx, "session"),
    queryFn: () => getAuthClient().getSession(),
  });
  const isSignedIn = Boolean(sessionQuery.data);

  const slotsQuery = useQuery({
    queryKey: keys.list(ctx, { providerSlug, subject, tab: "slots" }),
    queryFn: () => getTrialBookingClient().listSlots({ providerSlug, subject }),
    enabled: tab === "slots",
  });

  const mineQuery = useQuery({
    queryKey: keys.list(ctx, { tab: "mine" }),
    queryFn: () => getTrialBookingClient().listMyBookings(),
    enabled: tab === "mine" && isSignedIn,
  });

  const bookMutation = useMutation({
    mutationFn: (slotId: string) => getTrialBookingClient().book(slotId),
    onSuccess: () => {
      pushFeedback({
        tone: "success",
        title: t(locale, "trialBooking", "bookSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
    onError: () => {
      pushFeedback({
        tone: "error",
        title: t(locale, "trialBooking", "bookError"),
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) =>
      getTrialBookingClient().cancel(bookingId),
    onSuccess: () => {
      pushFeedback({
        tone: "warning",
        title: t(locale, "trialBooking", "cancelSuccess"),
      });
      void queryClient.invalidateQueries({ queryKey: keys.all(ctx) });
    },
  });

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    if (!next.get("lang")) next.set("lang", locale);
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6" dir={dir} lang={locale}>
      <header className="space-y-2">
        <p className="text-muted text-sm tracking-wide uppercase">Solo</p>
        <h1 className="font-display text-3xl font-medium">
          {t(locale, "trialBooking", "title")}
        </h1>
        <p className="text-muted text-sm">
          {t(locale, "trialBooking", "subtitle")}
        </p>
      </header>

      <div className="flex flex-wrap gap-2" role="tablist">
        <Button
          type="button"
          variant={tab === "slots" ? "primary" : "secondary"}
          onClick={() => updateParams({ tab: null })}
        >
          {t(locale, "trialBooking", "tabSlots")}
        </Button>
        <Button
          type="button"
          variant={tab === "mine" ? "primary" : "secondary"}
          onClick={() => updateParams({ tab: "mine" })}
        >
          {t(locale, "trialBooking", "tabMine")}
        </Button>
      </div>

      {tab === "slots" ? (
        <>
          <form
            key={searchParams.toString()}
            className="flex flex-wrap items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const fd = new FormData(event.currentTarget);
              updateParams({
                provider: String(fd.get("provider") ?? "") || null,
                subject: String(fd.get("subject") ?? "") || null,
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="trial-provider">
                {t(locale, "trialBooking", "providerLabel")}
              </Label>
              <Input
                id="trial-provider"
                name="provider"
                defaultValue={providerSlug ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trial-subject">
                {t(locale, "trialBooking", "subjectLabel")}
              </Label>
              <Input
                id="trial-subject"
                name="subject"
                defaultValue={subject ?? ""}
              />
            </div>
            <Button type="submit">
              {t(locale, "trialBooking", "applyFilters")}
            </Button>
          </form>

          {slotsQuery.isLoading ? <Skeleton className="h-40" /> : null}
          {slotsQuery.isError ? (
            <ErrorState title={t(locale, "trialBooking", "errorTitle")} />
          ) : null}
          {slotsQuery.isSuccess && slotsQuery.data.length === 0 ? (
            <EmptyState title={t(locale, "trialBooking", "emptyTitle")} />
          ) : null}
          {slotsQuery.isSuccess && slotsQuery.data.length > 0 ? (
            <ul
              className="space-y-3"
              aria-label={t(locale, "trialBooking", "slotsLabel")}
            >
              {slotsQuery.data.map((slot) => {
                const bookable = canBookTrial(slot);
                return (
                  <li
                    key={slot.id}
                    className="border-border bg-elevated flex flex-wrap items-start justify-between gap-3 rounded-md border p-4"
                  >
                    <div className="space-y-1 text-sm">
                      <p className="font-display text-lg font-medium">
                        {slot.providerName}
                      </p>
                      <p className="text-muted">
                        {slot.subject} ·{" "}
                        {t(locale, "trialBooking", `mode.${slot.mode}`)} ·{" "}
                        {slot.durationMinutes}{" "}
                        {t(locale, "trialBooking", "minutes")}
                      </p>
                      <p>
                        <time dateTime={slot.startsAt}>{slot.startsAt}</time>
                      </p>
                      <p>
                        {t(locale, "trialBooking", "seatsLeft")}:{" "}
                        {seatsLeft(slot)}
                      </p>
                      <p>
                        {slot.price.amount} {slot.price.currency}
                      </p>
                    </div>
                    <Button
                      type="button"
                      disabled={
                        !isSignedIn || !bookable || bookMutation.isPending
                      }
                      title={
                        !isSignedIn
                          ? t(locale, "trialBooking", "signInRequired")
                          : !bookable
                            ? t(locale, "trialBooking", "slotFull")
                            : undefined
                      }
                      onClick={() => bookMutation.mutate(slot.id)}
                    >
                      {t(locale, "trialBooking", "book")}
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </>
      ) : !isSignedIn ? (
        <EmptyState title={t(locale, "trialBooking", "signInRequired")} />
      ) : mineQuery.isLoading ? (
        <Skeleton className="h-32" />
      ) : mineQuery.isError ? (
        <ErrorState title={t(locale, "trialBooking", "errorTitle")} />
      ) : mineQuery.data && mineQuery.data.length === 0 ? (
        <EmptyState title={t(locale, "trialBooking", "mineEmpty")} />
      ) : (
        <ul
          className="space-y-3"
          aria-label={t(locale, "trialBooking", "mineLabel")}
        >
          {(mineQuery.data ?? []).map((booking) => (
            <li
              key={booking.id}
              className="border-border bg-elevated flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
            >
              <div className="text-sm">
                <p className="font-medium">{booking.providerSlug}</p>
                <p data-testid={`booking-status-${booking.id}`}>
                  {t(locale, "trialBooking", `status.${booking.status}`)}
                </p>
              </div>
              {booking.status === "confirmed" ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => cancelMutation.mutate(booking.id)}
                >
                  {t(locale, "trialBooking", "cancel")}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
