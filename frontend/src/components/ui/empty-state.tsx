import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "border-border bg-elevated flex flex-col items-start gap-3 rounded-lg border border-dashed p-6",
        className,
      )}
    >
      <h2 className="font-display text-foreground text-lg font-medium">
        {title}
      </h2>
      {description ? (
        <p className="text-muted max-w-prose text-sm">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
