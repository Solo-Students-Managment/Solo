import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getFoundationMessages } from "../messages";

import { FoundationControls } from "./FoundationControls";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("FoundationControls", () => {
  it("switches locale via router search param", async () => {
    const user = userEvent.setup();
    const labels = getFoundationMessages("fa");

    render(<FoundationControls locale="fa" labels={labels} />);

    await user.click(screen.getByRole("button", { name: "EN" }));
    expect(replace).toHaveBeenCalledWith("/dev/foundation?lang=en");
  });

  it("exposes theme buttons with pressed state", async () => {
    const user = userEvent.setup();
    const labels = getFoundationMessages("en");

    render(<FoundationControls locale="en" labels={labels} />);

    const dark = screen.getByRole("button", { name: labels.themeDark });
    await user.click(dark);
    expect(dark).toHaveAttribute("aria-pressed", "true");
  });
});
