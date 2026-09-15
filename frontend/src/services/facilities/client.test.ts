import { describe, expect, it } from "vitest";

import { isRoomBookable } from "./client";

describe("facilities helpers", () => {
  it("only available rooms are bookable", () => {
    expect(isRoomBookable("available")).toBe(true);
    expect(isRoomBookable("maintenance")).toBe(false);
    expect(isRoomBookable("retired")).toBe(false);
  });
});
