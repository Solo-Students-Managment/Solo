export type SyncState =
  "pending" | "syncing" | "synced" | "conflict" | "failed";

export type OfflineMutation = {
  id: string;
  type: string;
  payload: unknown;
  onlineOnly?: boolean;
};

export function canQueueOffline(mutation: OfflineMutation): boolean {
  return !mutation.onlineOnly;
}

export class OfflineMutationQueue {
  private items: OfflineMutation[] = [];

  enqueue(mutation: OfflineMutation): { accepted: boolean; reason?: string } {
    if (!canQueueOffline(mutation)) {
      return { accepted: false, reason: "online_only" };
    }
    this.items.push(mutation);
    return { accepted: true };
  }

  list(): OfflineMutation[] {
    return [...this.items];
  }

  clearSensitive(): void {
    this.items = [];
  }
}
