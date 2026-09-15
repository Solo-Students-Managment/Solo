import { cn } from "@/lib/utils/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("bg-sunken animate-pulse rounded-md", className)}
      aria-hidden
    />
  );
}
