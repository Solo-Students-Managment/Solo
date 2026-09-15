import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";
import { EmptyState } from "./empty-state";
import { SoloIcon } from "./solo-icon";
import { Home } from "lucide-react";

describe("Button", () => {
  it("invokes onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        title="No students"
        description="Invite your first student."
      />,
    );
    expect(screen.getByText("No students")).toBeInTheDocument();
    expect(screen.getByText("Invite your first student.")).toBeInTheDocument();
  });
});

describe("SoloIcon", () => {
  it("requires a label for non-decorative icons", () => {
    expect(() => render(<SoloIcon icon={Home} />)).toThrow(/requires label/);
  });

  it("exposes accessible label", () => {
    render(<SoloIcon icon={Home} label="Home" />);
    expect(screen.getByLabelText("Home")).toBeInTheDocument();
  });
});
