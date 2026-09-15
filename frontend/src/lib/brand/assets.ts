export type BrandAssetVariant = "light" | "dark";

export type BrandAssets = {
  mark: Record<BrandAssetVariant, string>;
  wordmark: Record<BrandAssetVariant, string>;
  appIcon: Record<BrandAssetVariant, string>;
  favicon: Record<BrandAssetVariant, string>;
};

/** Replaceable brand asset paths — swap files without changing call sites. */
export const soloBrandAssets: BrandAssets = {
  mark: {
    light: "/brand/mark-light.svg",
    dark: "/brand/mark-dark.svg",
  },
  wordmark: {
    light: "/brand/wordmark-light.svg",
    dark: "/brand/wordmark-dark.svg",
  },
  appIcon: {
    light: "/brand/app-icon-light.svg",
    dark: "/brand/app-icon-dark.svg",
  },
  favicon: {
    light: "/brand/favicon-light.svg",
    dark: "/brand/favicon-dark.svg",
  },
};

export function resolveBrandAsset(
  kind: keyof BrandAssets,
  variant: BrandAssetVariant,
): string {
  return soloBrandAssets[kind][variant];
}
