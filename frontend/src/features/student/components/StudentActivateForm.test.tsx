import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetMockSession, getAuthClient } from "@/services/auth";
import { __resetMockHome } from "@/services/home";
import { __resetMockStudent } from "@/services/student";

import { StudentActivateForm } from "./StudentActivateForm";

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
      <StudentActivateForm />
    </QueryClientProvider>,
  );
}

describe("StudentActivateForm", () => {
  beforeEach(async () => {
    __resetMockSession();
    __resetMockHome();
    __resetMockStudent();
    push.mockReset();
    await getAuthClient().login({
      phoneE164: "+989121234567",
      password: "Password1",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("activates student only by accepting a pending relationship", async () => {
    const user = userEvent.setup();
    renderActivate();
    expect(await screen.findByText("Mathematics")).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Accept relationship" }),
    );
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/student");
    });
    const session = await getAuthClient().getSession();
    expect(session?.activePersona).toBe("student");
    expect(window.localStorage.length).toBe(0);
  });
});
