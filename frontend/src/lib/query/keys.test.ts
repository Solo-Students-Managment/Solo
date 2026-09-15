import { describe, expect, it } from "vitest";

import { studentsQueryKeys } from "./keys";

describe("query key factories", () => {
  it("isolates organization context in keys", () => {
    const personal = studentsQueryKeys.list(
      { personaId: "p1", organizationId: null },
      { page: 1 },
    );
    const school = studentsQueryKeys.list(
      { personaId: "p1", organizationId: "org_1" },
      { page: 1 },
    );
    expect(personal).not.toEqual(school);
    expect(school).toContain("org_1");
  });
});
