import { beforeEach, describe, expect, it } from "vitest";

import { useFeedbackStore } from "./store";

describe("SoloFeedback store", () => {
  beforeEach(() => {
    useFeedbackStore.getState().clear();
  });

  it("queues and dismisses feedback items", () => {
    const id = useFeedbackStore.getState().push({
      tone: "success",
      title: "Saved",
    });
    expect(useFeedbackStore.getState().items).toHaveLength(1);
    useFeedbackStore.getState().dismiss(id);
    expect(useFeedbackStore.getState().items).toHaveLength(0);
  });
});
