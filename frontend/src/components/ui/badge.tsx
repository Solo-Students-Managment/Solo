import { cn } from "@/lib/utils/cn";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger";
};

const toneClass: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-sunken text-foreground",
  brand: "bg-brand text-brand-foreground",
  success: "bg-[var(--solo-status-success-bg)] text-success",
  warning: "bg-[var(--solo-status-warning-bg)] text-warning",
  danger: "bg-[var(--solo-status-danger-bg)] text-danger",
};

export function Badge({ children, className, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
