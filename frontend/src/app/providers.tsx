"use client";

import { Suspense, useEffect, type ReactNode } from "react";

import { SoloFeedbackViewport } from "@/components/shared/SoloFeedback";
import { canEnableMocks } from "@/config";
import { AppQueryProvider } from "@/lib/query/provider";
import { createHttpAuthClient, setAuthClient } from "@/services/auth";
import { createHttpProfileClient, setProfileClient } from "@/services/profile";

type AppProvidersProps = {
  children: ReactNode;
};

function MswBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!canEnableMocks()) return;
      try {
        const { worker } = await import("@/mocks/browser");
        await worker.start({
          onUnhandledRequest: "bypass",
          quiet: true,
        });
        if (!cancelled) {
          setAuthClient(createHttpAuthClient());
          setProfileClient(createHttpProfileClient());
        }
      } catch {
        // Keep in-memory mock auth client when the worker cannot start.
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

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
