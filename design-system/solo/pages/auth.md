# Auth pages override — Solo

Inherits `design-system/solo/MASTER.md`.

## Pattern
Minimal single-column auth: brand wordmark, one form, one primary CTA, secondary text links. No card-everywhere chrome; use elevated surface only for the form column on large screens.

## UX
- Visible labels (never placeholder-only)
- Inline field errors near inputs
- Submit shows loading then success/error via SoloFeedback
- OTP: 6-digit, auto-advance optional, resend with cooldown
- Phone: calling-code select + national number; store/submit E.164 only in API body (never in URL)
- Keyboard: logical tab order, focus ring on all controls
- Touch targets ≥ 44px on primary actions

## Motion
150–200ms opacity/color only; respect `prefers-reduced-motion`.

## Anti-patterns
- Storing password/OTP/tokens in localStorage or URL
- Email as login identifier
- Dark-mode-first auth screens
