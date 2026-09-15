import { describe, expect, it } from "vitest";

import { canUseFile, validateUploadSize } from "./model";

describe("SoloUploader model", () => {
  it("blocks oversized files and unsafe scan states", () => {
    expect(validateUploadSize(10, 5)).toEqual({
      ok: false,
      reason: "file_too_large",
    });
    expect(
      canUseFile({
        id: "1",
        fileName: "a.pdf",
        sizeBytes: 1,
        scanStatus: "scanning",
      }),
    ).toBe(false);
  });
});
