import { describe, expect, it } from "vitest";

import { SoloRealtimeClient } from "./client";

describe("SoloRealtimeClient", () => {
  it("deduplicates events and drops context topics", () => {
    const client = new SoloRealtimeClient();
    client.connect();
    const received: string[] = [];
    const unsubscribe = client.subscribe("chat:1", (event) => {
      received.push(String(event.payload));
    });
    client.publish({ topic: "chat:1", id: "e1", payload: "hi" });
    client.publish({ topic: "chat:1", id: "e1", payload: "hi" });
    expect(received).toEqual(["hi"]);
    client.dropContext(["chat:1"]);
    client.publish({ topic: "chat:1", id: "e2", payload: "later" });
    expect(received).toEqual(["hi"]);
    unsubscribe();
    client.disconnect();
    expect(client.getStatus()).toBe("closed");
  });
});
