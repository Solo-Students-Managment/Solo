type RealtimeStatus = "idle" | "connecting" | "open" | "closed";

type RealtimeEvent = {
  topic: string;
  id: string;
  payload: unknown;
  sequence?: number;
};

type Listener = (event: RealtimeEvent) => void;

export class SoloRealtimeClient {
  private status: RealtimeStatus = "idle";
  private readonly listeners = new Map<string, Set<Listener>>();
  private readonly seen = new Set<string>();

  connect(): void {
    this.status = "open";
  }

  disconnect(): void {
    this.status = "closed";
    this.listeners.clear();
  }

  getStatus(): RealtimeStatus {
    return this.status;
  }

  subscribe(topic: string, listener: Listener): () => void {
    const set = this.listeners.get(topic) ?? new Set<Listener>();
    set.add(listener);
    this.listeners.set(topic, set);
    return () => {
      set.delete(listener);
      if (set.size === 0) this.listeners.delete(topic);
    };
  }

  publish(event: RealtimeEvent): void {
    if (this.seen.has(event.id)) return;
    this.seen.add(event.id);
    this.listeners.get(event.topic)?.forEach((listener) => listener(event));
  }

  dropContext(topics: string[]): void {
    for (const topic of topics) {
      this.listeners.delete(topic);
    }
  }
}
