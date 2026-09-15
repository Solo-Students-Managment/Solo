import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetMockSession, getAuthClient } from "@/services/auth";
import { __resetMockHome } from "@/services/home";
import { __resetMockGuardian } from "@/services/guardian";

import { GuardianActivateForm } from "./GuardianActivateForm";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams("lang=en"),
}));

function renderActivate() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <GuardianActivateForm />
    </QueryClientProvider>,
  );
}

describe("GuardianActivateForm", () => {
  beforeEach(async () => {
    __resetMockSession();
    __resetMockHome();
    __resetMockGuardian();
    push.mockReset();
    await getAuthClient().login({
      phoneE164: "+989121234567",
      password: "Password1",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("activates guardian only by accepting a pending relationship", async () => {
    const user = userEvent.setup();
    renderActivate();
    expect(await screen.findByText("Sara")).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Accept relationship" }),
    );
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/guardian");
    });
    const session = await getAuthClient().getSession();
    expect(session?.activePersona).toBe("guardian");
    expect(window.localStorage.length).toBe(0);
  });
});
