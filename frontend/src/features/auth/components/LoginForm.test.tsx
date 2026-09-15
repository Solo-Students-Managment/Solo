import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetMockSession, getAuthClient } from "@/services/auth";

import { LoginForm } from "./LoginForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("lang=en"),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    __resetMockSession();
  });

  afterEach(() => {
    cleanup();
  });

  it("signs in with phone and password without writing localStorage", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    const form = screen.getByRole("form", { name: "Sign in" });
    await user.type(
      within(form).getByLabelText(/mobile number/i),
      "9121234567",
    );
    await user.type(within(form).getByLabelText(/^password$/i), "Password1");
    await user.click(within(form).getByRole("button", { name: "Sign in" }));
    await expect(getAuthClient().getSession()).resolves.not.toBeNull();
    expect(window.localStorage.length).toBe(0);
  });

  it("shows denial path for wrong password", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    const form = screen.getByRole("form", { name: "Sign in" });
    await user.type(
      within(form).getByLabelText(/mobile number/i),
      "9121234567",
    );
    await user.type(within(form).getByLabelText(/^password$/i), "WrongPass");
    await user.click(within(form).getByRole("button", { name: "Sign in" }));
    await expect(getAuthClient().getSession()).resolves.toBeNull();
  });
});
