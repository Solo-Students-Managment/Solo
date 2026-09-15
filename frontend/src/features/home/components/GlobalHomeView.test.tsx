import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetMockSession, getAuthClient } from "@/services/auth";
import { __resetMockHome } from "@/services/home";

import { GlobalHomeView } from "./GlobalHomeView";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("lang=en"),
}));

function renderHome() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <GlobalHomeView />
    </QueryClientProvider>,
  );
}

describe("GlobalHomeView", () => {
  beforeEach(async () => {
    __resetMockSession();
    __resetMockHome();
    await getAuthClient().login({
      phoneE164: "+989121234567",
      password: "Password1",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("shows persona and context switchers", async () => {
    renderHome();
    expect(
      await screen.findByRole("heading", { name: "Welcome to Solo" }),
    ).toBeTruthy();
    expect(await screen.findByRole("button", { name: "Teacher" })).toBeTruthy();
    expect(
      await screen.findByRole("button", { name: "Personal" }),
    ).toBeTruthy();
  });

  it("switches persona without writing localStorage", async () => {
    const user = userEvent.setup();
    renderHome();
    const teacher = await screen.findByRole("button", { name: "Teacher" });
    await user.click(teacher);
    await waitFor(async () => {
      const session = await getAuthClient().getSession();
      expect(session?.activePersona).toBe("teacher");
    });
    expect(window.localStorage.length).toBe(0);
  });
});
