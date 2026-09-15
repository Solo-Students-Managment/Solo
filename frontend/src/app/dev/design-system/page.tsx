import { canEnableDevTools } from "@/config";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Input,
  Label,
  Skeleton,
} from "@/components/ui";
import { notFound } from "next/navigation";

export default function DesignSystemShowcasePage() {
  if (!canEnableDevTools()) {
    notFound();
  }

  return (
    <main
      className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12"
      dir="ltr"
    >
      <header className="space-y-2">
        <h1 className="font-display text-foreground text-3xl font-semibold">
          Solo design system
        </h1>
        <p className="text-muted">
          Non-production showcase for tokens, controls, empty/error states.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Form controls</h2>
        <div className="grid max-w-sm gap-2">
          <Label htmlFor="demo-input">Label</Label>
          <Input id="demo-input" placeholder="Type here" />
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <Badge>Neutral</Badge>
        <Badge tone="brand">Brand</Badge>
        <Badge tone="success">Success</Badge>
        <Badge tone="warning">Warning</Badge>
        <Badge tone="danger">Danger</Badge>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <EmptyState
          title="Nothing here yet"
          description="Empty states use semantic surfaces and clear next actions."
          action={<Button size="sm">Create</Button>}
        />
        <ErrorState
          title="Something went wrong"
          description="Error states expose recovery actions without leaking internals."
          action={
            <Button variant="secondary" size="sm">
              Retry
            </Button>
          }
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Skeleton</h2>
        <Skeleton className="h-10 w-full" />
      </section>
    </main>
  );
}
