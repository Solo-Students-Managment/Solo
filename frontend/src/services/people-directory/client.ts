import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const presenceStatusSchema = z.enum([
  "online",
  "available",
  "busy",
  "in_class",
  "in_meeting",
  "dnd",
  "away",
  "offline",
]);
export type PresenceStatus = z.infer<typeof presenceStatusSchema>;

export const PRESENCE_STATUSES = presenceStatusSchema.options;

/** Directory entries expose display identity only — never email/phone. */
export const directoryPersonSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  displayName: z.string().min(1),
  roleLabel: z.string().min(1),
  departmentName: z.string().nullable(),
  teamNames: z.array(z.string()),
  presenceStatus: presenceStatusSchema,
  presenceVisible: z.boolean(),
});
export type DirectoryPerson = z.infer<typeof directoryPersonSchema>;
export const directoryCollectionSchema = collectionSchema(
  directoryPersonSchema,
);

export type PeopleDirectoryClient = {
  list(organizationId: string): Promise<{
    data: DirectoryPerson[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  setPresence(
    organizationId: string,
    personId: string,
    status: PresenceStatus,
  ): Promise<DirectoryPerson>;
};

const memory = new Map<string, DirectoryPerson[]>();

function meta(data: DirectoryPerson[]) {
  return {
    data,
    meta: {
      page: 1,
      pageSize: Math.max(data.length, 1),
      totalItems: data.length,
      totalPages: 1,
    },
  };
}

export function isPresenceVisibleToViewer(
  person: Pick<DirectoryPerson, "presenceVisible">,
) {
  return person.presenceVisible;
}

export function resolveVisiblePresence(
  person: Pick<DirectoryPerson, "presenceStatus" | "presenceVisible">,
): PresenceStatus | "hidden" {
  if (!person.presenceVisible) return "hidden";
  return person.presenceStatus;
}

function seed(organizationId: string): DirectoryPerson[] {
  const existing = memory.get(organizationId);
  if (existing) return existing;
  const seeded = [
    directoryPersonSchema.parse({
      id: opaqueIdSchema.parse("dir_owner1"),
      organizationId: opaqueIdSchema.parse(organizationId),
      displayName: "Org Owner",
      roleLabel: "Owner",
      departmentName: "Academics",
      teamNames: ["Leadership"],
      presenceStatus: "available",
      presenceVisible: true,
    }),
    directoryPersonSchema.parse({
      id: opaqueIdSchema.parse("dir_staff1"),
      organizationId: opaqueIdSchema.parse(organizationId),
      displayName: "Sam Staff",
      roleLabel: "Teacher",
      departmentName: "Academics",
      teamNames: ["Curriculum Leads"],
      presenceStatus: "in_class",
      presenceVisible: true,
    }),
    directoryPersonSchema.parse({
      id: opaqueIdSchema.parse("dir_priv1"),
      organizationId: opaqueIdSchema.parse(organizationId),
      displayName: "Private Person",
      roleLabel: "Support",
      departmentName: null,
      teamNames: [],
      presenceStatus: "busy",
      presenceVisible: false,
    }),
  ];
  memory.set(organizationId, seeded);
  return seeded;
}

export function createHttpPeopleDirectoryClient(): PeopleDirectoryClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/directory`,
        { parse: (data) => directoryCollectionSchema.parse(data) },
      );
    },
    async setPresence(organizationId, personId, status) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/directory/${encodeURIComponent(personId)}/presence`,
        {
          method: "POST",
          body: JSON.stringify({ status }),
          parse: (data) => directoryPersonSchema.parse(data),
        },
      );
    },
  };
}

export function createMockPeopleDirectoryClient(): PeopleDirectoryClient {
  return {
    async list(organizationId) {
      return meta(seed(organizationId));
    },
    async setPresence(organizationId, personId, status) {
      const rows = seed(organizationId);
      const idx = rows.findIndex((row) => String(row.id) === String(personId));
      if (idx < 0) throw new Error("not found");
      const updated = directoryPersonSchema.parse({
        ...rows[idx],
        presenceStatus: status,
      });
      const next = [...rows];
      next[idx] = updated;
      memory.set(organizationId, next);
      return updated;
    },
  };
}

let client: PeopleDirectoryClient = createMockPeopleDirectoryClient();
export function getPeopleDirectoryClient() {
  return client;
}
export function setPeopleDirectoryClient(next: PeopleDirectoryClient) {
  client = next;
}
export function __resetMockPeopleDirectory() {
  memory.clear();
  client = createMockPeopleDirectoryClient();
}
