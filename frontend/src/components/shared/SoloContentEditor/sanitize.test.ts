import { describe, expect, it } from "vitest";

import { sanitizeHtml } from "./sanitize";

describe("SoloContentEditor sanitization", () => {
  it("strips unsafe HTML", () => {
    const clean = sanitizeHtml('<img src=x onerror="alert(1)" /><p>ok</p>');
    expect(clean).toContain("<p>ok</p>");
    expect(clean.toLowerCase()).not.toContain("onerror");
  });
});
