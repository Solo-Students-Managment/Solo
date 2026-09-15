import { cn } from "@/lib/utils/cn";

type ErrorStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function ErrorState({
  title,
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "border-danger/40 flex flex-col items-start gap-3 rounded-lg border bg-[var(--solo-status-danger-bg)] p-6",
        className,
      )}
    >
      <h2 className="font-display text-danger text-lg font-medium">{title}</h2>
      {description ? (
        <p className="text-foreground max-w-prose text-sm">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
