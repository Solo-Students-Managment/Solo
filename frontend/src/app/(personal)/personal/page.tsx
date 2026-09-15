import Link from "next/link";

import { AppShell } from "@/components/layouts";
import { routes } from "@/lib/routes";

export default function PersonalHomePage() {
  return (
    <AppShell title="Solo">
      <h1 className="font-display text-2xl font-medium">Personal home</h1>
      <p className="text-muted mt-2 text-sm">
        Capability-aware shell with desktop sidebar and mobile bottom nav.
      </p>
      <p className="mt-4 flex flex-wrap gap-4">
        <Link
          href={routes.personal.security()}
          className="text-brand text-sm underline-offset-2 hover:underline"
        >
          Account security
        </Link>
        <Link
          href={routes.personal.phone()}
          className="text-brand text-sm underline-offset-2 hover:underline"
        >
          Change phone
        </Link>
      </p>
    </AppShell>
  );
}
