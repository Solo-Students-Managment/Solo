/**
 * Solo frontend folder architecture (F0-003)
 *
 * - app/          routing, layouts, page composition only
 * - features/     business features; public API via index.ts only
 * - components/   genuinely shared UI (ui / shared / layouts)
 * - lib/          infrastructure (i18n, routes, utils, query, security)
 * - services/     API/auth/realtime adapters
 * - hooks/        shared hooks (not feature-owned)
 * - store/        true global UI state only (Zustand)
 * - config/       env and runtime configuration
 * - schemas/      shared Zod schemas
 * - types/        shared types
 * - constants/    shared constants
 *
 * Import rules:
 * - Features must not import another feature's internal paths
 * - Cross-feature use goes through the feature public index
 * - app/ may import feature public APIs and shared components
 */
export const SOLO_ARCHITECTURE_VERSION = "0.1.0";
