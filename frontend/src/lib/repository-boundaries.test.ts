import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "../../..");

describe("F0-001 repository boundaries", () => {
  it("keeps the greenfield Next.js app under /frontend", () => {
    expect(existsSync(path.join(repoRoot, "frontend/package.json"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "frontend/src/app/page.tsx"))).toBe(
      true,
    );
  });

  it("keeps backend as a placeholder only", () => {
    expect(existsSync(path.join(repoRoot, "backend/README.md"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "backend/src"))).toBe(false);
  });

  it("preserves the Vite prototype under /legacy as reference-only", () => {
    expect(existsSync(path.join(repoRoot, "legacy/package.json"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "legacy/src"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "src/main.tsx"))).toBe(false);
  });
});
