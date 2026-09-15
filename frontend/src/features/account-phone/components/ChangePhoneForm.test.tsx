import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetMockSession, getAuthClient } from "@/services/auth";

import { ChangePhoneForm } from "./ChangePhoneForm";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("lang=en"),
}));

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ChangePhoneForm />
    </QueryClientProvider>,
  );
}

describe("ChangePhoneForm", () => {
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

  it("changes phone after password and dual OTP without localStorage", async () => {
    const user = userEvent.setup();
    renderForm();
    expect(
      await screen.findByRole("heading", { name: "Change phone number" }),
    ).toBeTruthy();
    await user.type(screen.getByLabelText(/^Password$/i), "Password1");
    await user.type(screen.getByLabelText(/Mobile number/i), "9331112233");
    await user.click(
      screen.getByRole("button", { name: "Send verification codes" }),
    );
    expect(
      await screen.findByText(/Codes sent\. Current number/i),
    ).toBeTruthy();
    await user.type(
      screen.getByLabelText(/Code sent to current phone/i),
      "123456",
    );
    await user.type(screen.getByLabelText(/Code sent to new phone/i), "123456");
    await user.click(
      screen.getByRole("button", { name: "Confirm phone change" }),
    );
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Send verification codes" }),
      ).toBeTruthy();
    });
    expect(window.localStorage.length).toBe(0);
  });

  it("rejects wrong password on begin", async () => {
    const user = userEvent.setup();
    renderForm();
    await screen.findByRole("heading", { name: "Change phone number" });
    await user.type(screen.getByLabelText(/^Password$/i), "WrongPass1");
    await user.type(screen.getByLabelText(/Mobile number/i), "9331112233");
    await user.click(
      screen.getByRole("button", { name: "Send verification codes" }),
    );
    await waitFor(() => {
      expect(screen.queryByRole("status")).toBeNull();
    });
  });
});
