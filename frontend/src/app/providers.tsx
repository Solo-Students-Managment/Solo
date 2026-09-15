"use client";

import type { ReactNode } from "react";

import { AppQueryProvider } from "@/lib/query/provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return <AppQueryProvider>{children}</AppQueryProvider>;
}
