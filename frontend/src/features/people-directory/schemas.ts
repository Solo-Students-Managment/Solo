import {
  PRESENCE_STATUSES,
  type PresenceStatus,
} from "@/services/people-directory";

export type DirectoryFilter = "all" | PresenceStatus;

export function resolveDirectoryFilter(raw: string | null): DirectoryFilter {
  if (raw === "all" || raw === null || raw === "") return "all";
  if ((PRESENCE_STATUSES as readonly string[]).includes(raw)) {
    return raw as PresenceStatus;
  }
  return "all";
}

export function filterDirectoryPeople<
  T extends { presenceStatus: string; presenceVisible: boolean },
>(people: T[], filter: DirectoryFilter): T[] {
  if (filter === "all") return people;
  return people.filter(
    (person) => person.presenceVisible && person.presenceStatus === filter,
  );
}
