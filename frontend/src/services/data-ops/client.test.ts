import { describe, expect, it } from "vitest";
import {
  createMockDataOpsClient,
  isTerminalDataJobStatus,
  nextDataJobStatus,
  __resetMockDataOps,
} from "./client";

describe("data job status helpers", () => {
  it("advances queued to running to completed", () => {
    expect(nextDataJobStatus("queued")).toBe("running");
    expect(nextDataJobStatus("running")).toBe("completed");
    expect(nextDataJobStatus("completed")).toBeNull();
    expect(isTerminalDataJobStatus("completed")).toBe(true);
    expect(isTerminalDataJobStatus("running")).toBe(false);
  });
});

describe("data ops client", () => {
  it("creates and advances export job to completed", async () => {
    __resetMockDataOps();
    const client = createMockDataOpsClient();
    const job = await client.create("org_1", {
      jobType: "export",
      resourceKey: "students.csv",
    });
    const running = await client.advance("org_1", String(job.id));
    expect(running.status).toBe("running");
    const completed = await client.advance("org_1", String(job.id));
    expect(completed.status).toBe("completed");
  });
});
