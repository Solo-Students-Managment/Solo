import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetMockSession, getAuthClient } from "@/services/auth";

import { AccountSecurityView } from "./AccountSecurityView";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("lang=en"),
}));

function renderSecurity() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AccountSecurityView />
    </QueryClientProvider>,
  );
}

describe("AccountSecurityView", () => {
  beforeEach(async () => {
    __resetMockSession();
    await getAuthClient().login({
      phoneE164: "+989121234567",
      password: "Password1",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("shows 2FA status and sessions without writing localStorage", async () => {
    renderSecurity();
    expect(
      await screen.findByRole("heading", { name: "Account security" }),
    ).toBeTruthy();
    expect(await screen.findByText("2FA is off")).toBeTruthy();
    expect(await screen.findByText("This browser")).toBeTruthy();
    expect(window.localStorage.length).toBe(0);
  });

  it("enables TOTP after reauth and OTP confirmation", async () => {
    const user = userEvent.setup();
    renderSecurity();
    await screen.findByText("2FA is off");
    await user.click(
      screen.getByRole("button", { name: "Enable authenticator" }),
    );
    await user.type(screen.getByLabelText(/^Password$/i), "Password1");
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    await screen.findByText(/Add this secret/i);
    await user.type(screen.getByLabelText(/Verification code/i), "123456");
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(async () => {
      const status = await getAuthClient().getTwoFactorStatus();
      expect(status.enabled).toBe(true);
      expect(status.totpEnabled).toBe(true);
    });
    expect(await screen.findByText(/Save these recovery codes/i)).toBeTruthy();
    expect(window.localStorage.length).toBe(0);
  });

  it("revokes another device after reauth", async () => {
    const user = userEvent.setup();
    renderSecurity();
    await screen.findByText("iPhone");
    await user.click(screen.getByRole("button", { name: "Revoke" }));
    await user.type(screen.getByLabelText(/^Password$/i), "Password1");
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() => {
      expect(screen.queryByText("iPhone")).toBeNull();
    });
  });
});
