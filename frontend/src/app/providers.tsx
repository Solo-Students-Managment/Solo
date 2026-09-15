"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";

import { SoloFeedbackViewport } from "@/components/shared/SoloFeedback";
import { Skeleton } from "@/components/ui";
import { canEnableMocks } from "@/config";
import { AppQueryProvider } from "@/lib/query/provider";
import { createHttpAuthClient, setAuthClient } from "@/services/auth";
import { createHttpHomeClient, setHomeClient } from "@/services/home";
import {
  createHttpOrganizationClient,
  createHttpOrganizationMembersClient,
  setOrganizationClient,
  setOrganizationMembersClient,
} from "@/services/organization";
import { createHttpProfileClient, setProfileClient } from "@/services/profile";

type AppProvidersProps = {
  children: ReactNode;
};

function MswBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(() => !canEnableMocks());

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!canEnableMocks()) {
        setReady(true);
        return;
      }
      try {
        const { worker } = await import("@/mocks/browser");
        await worker.start({
          onUnhandledRequest: "bypass",
          quiet: true,
        });
        if (!cancelled) {
          setAuthClient(createHttpAuthClient());
          setProfileClient(createHttpProfileClient());
          setHomeClient(createHttpHomeClient());
          setOrganizationClient(createHttpOrganizationClient());
          setOrganizationMembersClient(createHttpOrganizationMembersClient());
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          // Fall back to in-memory mock clients already registered at module load.
          setReady(true);
        }
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <Skeleton className="h-10 w-48" aria-label="Loading application" />
      </div>
    );
  }

  return <>{children}</>;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppQueryProvider>
      <MswBootstrap>
        <Suspense fallback={null}>{children}</Suspense>
        <SoloFeedbackViewport />
      </MswBootstrap>
    </AppQueryProvider>
  );
}
