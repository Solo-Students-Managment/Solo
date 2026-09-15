import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetMockSession, getAuthClient } from "@/services/auth";
import {
  __resetMockOrganizations,
  getOrganizationClient,
} from "@/services/organization";

import { OrganizationMembersView } from "./OrganizationMembersView";

const orgIdRef = { current: "org_pending" };

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ orgId: orgIdRef.current }),
  useSearchParams: () => new URLSearchParams("lang=en"),
}));

function renderMembers() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <OrganizationMembersView />
    </QueryClientProvider>,
  );
}

describe("OrganizationMembersView", () => {
  beforeEach(async () => {
    __resetMockSession();
    __resetMockOrganizations();
    await getAuthClient().login({
      phoneE164: "+989121234567",
      password: "Password1",
    });
    const org = await getOrganizationClient().create({
      name: "Members Test Org",
      type: "school",
    });
    orgIdRef.current = org.id;
    await getAuthClient().switchPersona("organization");
    await getAuthClient().switchContext({
      organizationId: org.id,
      subjectId: null,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("lists owner and invites staff", async () => {
    const user = userEvent.setup();
    renderMembers();
    expect(
      await screen.findByRole("heading", { name: "Staff & membership" }),
    ).toBeTruthy();
    expect(await screen.findByText("Demo User")).toBeTruthy();

    await user.type(screen.getByLabelText("Display name"), "Staff One");
    await user.type(screen.getByLabelText("Mobile number"), "9125556677");
    await user.click(screen.getByRole("button", { name: "Send invite" }));

    await waitFor(() => {
      expect(screen.getByText("Staff One")).toBeTruthy();
    });
    expect(window.localStorage.length).toBe(0);
  });
});
