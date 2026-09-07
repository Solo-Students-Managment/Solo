export type MockRecordStatus = 'draft' | 'active' | 'pending' | 'completed' | 'blocked';

export interface MockRecord {
  id: string;
  title: string;
  subtitle: string;
  ownerRole: string;
  status: MockRecordStatus;
  date: string;
  amount?: number;
  notes?: string;
}

const KEY_PREFIX = 'solo-prd-mock-';

function key(scope: string) {
  return `${KEY_PREFIX}${scope}`;
}

function read<T>(scope: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key(scope));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(scope: string, value: T) {
  localStorage.setItem(key(scope), JSON.stringify(value));
}

export function createMockId(scope: string) {
  return `${scope}-${crypto.randomUUID()}`;
}

export function readMockRecords(scope: string, seed: MockRecord[]) {
  const stored = read<MockRecord[]>(scope, []);
  const storedIds = new Set(stored.map((item) => item.id));
  return [...stored, ...seed.filter((item) => !storedIds.has(item.id))].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function addMockRecord(scope: string, input: Omit<MockRecord, 'id' | 'date'>) {
  const record: MockRecord = {
    ...input,
    id: createMockId(scope),
    date: new Date().toISOString(),
  };
  const stored = read<MockRecord[]>(scope, []);
  write(scope, [record, ...stored]);
  return record;
}

export function updateMockRecordStatus(scope: string, id: string, status: MockRecordStatus) {
  const stored = read<MockRecord[]>(scope, []);
  const next = stored.map((item) => (item.id === id ? { ...item, status } : item));
  write(scope, next);
}

export function deleteMockRecord(scope: string, id: string) {
  const stored = read<MockRecord[]>(scope, []);
  write(
    scope,
    stored.filter((item) => item.id !== id)
  );
}

export function seedRecord(
  scope: string,
  index: number,
  title: string,
  subtitle: string,
  ownerRole = 'teacher',
  status: MockRecordStatus = 'active'
): MockRecord {
  return {
    id: `${scope}-seed-${index}`,
    title,
    subtitle,
    ownerRole,
    status,
    date: new Date(Date.now() - index * 86_400_000).toISOString(),
  };
}

export const STATUS_LABELS: Record<MockRecordStatus, string> = {
  draft: 'پیش‌نویس',
  active: 'فعال',
  pending: 'در انتظار',
  completed: 'تکمیل‌شده',
  blocked: 'مسدود',
};
