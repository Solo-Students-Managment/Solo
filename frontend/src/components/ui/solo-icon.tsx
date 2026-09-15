"use client";

import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type SoloIconProps = {
  icon: LucideIcon;
  label?: string;
  className?: string;
  decorative?: boolean;
};

export function SoloIcon({
  icon: Icon,
  label,
  className,
  decorative = false,
}: SoloIconProps) {
  if (!decorative && !label) {
    throw new Error("SoloIcon requires label unless decorative is true.");
  }

  return (
    <Icon
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      className={cn("size-4 shrink-0", className)}
    />
  );
}

type DirectionalChevronProps = {
  direction: "start" | "end";
  label: string;
  className?: string;
  isRtl?: boolean;
};

export function DirectionalChevron({
  direction,
  label,
  className,
  isRtl = false,
}: DirectionalChevronProps) {
  const pointsStart =
    (direction === "start" && !isRtl) || (direction === "end" && isRtl);
  const Icon = pointsStart ? ChevronLeft : ChevronRight;
  return <SoloIcon icon={Icon} label={label} className={className} />;
}
