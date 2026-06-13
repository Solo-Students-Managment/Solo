const SCORE_PREFIX = 'session-score-'

function scoreKey(sessionId: string) {
  return `${SCORE_PREFIX}${sessionId}`
}

export function clampSessionScore(value: number) {
  if (Number.isNaN(value)) return 0
  return Math.min(20, Math.max(0, Math.round(value * 10) / 10))
}

export function readStoredSessionScore(sessionId: string): number | null {
  try {
    const raw = localStorage.getItem(scoreKey(sessionId))
    if (raw === null) return null
    const parsed = Number(raw)
    if (Number.isNaN(parsed)) return null
    return clampSessionScore(parsed)
  } catch {
    return null
  }
}

export function writeStoredSessionScore(sessionId: string, score: number) {
  localStorage.setItem(scoreKey(sessionId), String(clampSessionScore(score)))
}

export function resolveSessionScore(sessionId: string, defaultScore: number) {
  return readStoredSessionScore(sessionId) ?? defaultScore
}
