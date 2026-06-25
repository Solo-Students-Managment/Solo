const APPROVALS_KEY = 'session-approvals';

export interface SessionApproval {
  sessionId: string;
  parentId: string;
  confirmedAt: string;
}

function readApprovals(): Record<string, SessionApproval> {
  try {
    const raw = localStorage.getItem(APPROVALS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, SessionApproval>;
  } catch {
    return {};
  }
}

function writeApprovals(approvals: Record<string, SessionApproval>) {
  localStorage.setItem(APPROVALS_KEY, JSON.stringify(approvals));
}

export function readStoredApproval(sessionId: string): SessionApproval | null {
  return readApprovals()[sessionId] ?? null;
}

export function resolveParentConfirmed(sessionId: string, defaultConfirmed?: boolean): boolean {
  if (readStoredApproval(sessionId)) return true;
  return defaultConfirmed ?? false;
}

export function approveSession(sessionId: string, parentId: string) {
  const approvals = readApprovals();
  approvals[sessionId] = {
    sessionId,
    parentId,
    confirmedAt: new Date().toISOString(),
  };
  writeApprovals(approvals);
}
