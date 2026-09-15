import { AppShell } from "@/components/layouts";

export default function PersonalHomePage() {
  return (
    <AppShell title="Solo">
      <h1 className="font-display text-2xl font-medium">Personal home</h1>
      <p className="text-muted mt-2 text-sm">
        Capability-aware shell with desktop sidebar and mobile bottom nav.
      </p>
    </AppShell>
  );
}
