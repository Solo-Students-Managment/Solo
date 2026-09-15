"use client";

import type { ReactNode } from "react";

import type { Capability } from "./engine";
import { resolveCapability } from "./engine";
import type { Session } from "@/services/auth";

type CapabilityGateProps = {
  session: Session | null;
  capability: Capability;
  children: ReactNode;
  fallback?: ReactNode;
};

export function CapabilityGate({
  session,
  capability,
  children,
  fallback = null,
}: CapabilityGateProps) {
  const result = resolveCapability(session, capability);
  if (!result.allowed) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
