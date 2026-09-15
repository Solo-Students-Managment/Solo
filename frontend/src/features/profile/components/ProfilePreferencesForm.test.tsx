import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetMockProfile, getProfileClient } from "@/services/profile";

import { ProfilePreferencesForm } from "./ProfilePreferencesForm";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("lang=en"),
}));

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ProfilePreferencesForm />
    </QueryClientProvider>,
  );
}

describe("ProfilePreferencesForm", () => {
  beforeEach(() => {
    __resetMockProfile();
  });

  afterEach(() => {
    cleanup();
  });

  it("loads and saves profile without localStorage secrets", async () => {
    const user = userEvent.setup();
    renderForm();
    expect(
      await screen.findByRole("heading", { name: "Profile & preferences" }),
    ).toBeTruthy();
    const firstName = screen.getByLabelText(/First name/i);
    await user.clear(firstName);
    await user.type(firstName, "Sara");
    await user.click(screen.getByRole("button", { name: "Save preferences" }));
    await waitFor(async () => {
      const profile = await getProfileClient().getProfile();
      expect(profile.firstName).toBe("Sara");
    });
    expect(window.localStorage.length).toBe(0);
  });
});
