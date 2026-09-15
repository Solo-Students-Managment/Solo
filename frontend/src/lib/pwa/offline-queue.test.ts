import { describe, expect, it } from "vitest";

import { OfflineMutationQueue } from "./offline-queue";

describe("offline mutation queue", () => {
  it("rejects online-only mutations and clears on logout", () => {
    const queue = new OfflineMutationQueue();
    expect(
      queue.enqueue({
        id: "1",
        type: "billing.change",
        payload: {},
        onlineOnly: true,
      }),
    ).toEqual({ accepted: false, reason: "online_only" });
    expect(
      queue.enqueue({ id: "2", type: "draft.save", payload: { text: "x" } }),
    ).toEqual({ accepted: true });
    queue.clearSensitive();
    expect(queue.list()).toEqual([]);
  });
});
