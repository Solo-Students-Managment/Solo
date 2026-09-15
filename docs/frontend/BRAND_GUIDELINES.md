# Solo Brand Guidelines (Phase 0)

## Name

Solo

## Personality

Modern, professional, educational, calm. Friendly without childish cues. Data-dense for staff; calmer for students/guardians.

## Color

Use semantic tokens (`--solo-brand`, surfaces, status). Do not hardcode raw palette values in feature pages.

## Typography

- Persian / Latin pairing via `--font-solo-sans` (Vazirmatn) and `--font-solo-display` (Source Sans 3)
- Tabular numerals for grades, billing, and tables (`.tabular-nums`)

## Assets

Replaceable paths are defined in `frontend/src/lib/brand/assets.ts`:

- mark / wordmark / app icon / favicon
- light and dark variants

## Icons

Use `SoloIcon` over Lucide. Icon-only controls require accessible labels. Directional chevrons must be RTL-aware via `DirectionalChevron`.
