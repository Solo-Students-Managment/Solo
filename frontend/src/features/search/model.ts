export type SearchResult = {
  id: string;
  title: string;
  href: string;
  allowed: boolean;
  entityType?: string;
};

export type CommandAction = {
  id: string;
  label: string;
  href?: string;
  allowed: boolean;
};

export function filterAuthorizedResults<
  T extends { allowed: boolean; title?: string; label?: string },
>(items: T[]): T[] {
  return items.filter((item) => item.allowed);
}

export function mapHitsToResults(
  hits: Array<{
    id: string;
    title: string;
    href: string;
    allowed: boolean;
    entityType: string;
  }>,
): SearchResult[] {
  return hits.map((hit) => ({
    id: String(hit.id),
    title: hit.title,
    href: hit.href,
    allowed: hit.allowed,
    entityType: hit.entityType,
  }));
}

export function filterResultsByQuery(
  results: SearchResult[],
  query: string,
): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return results;
  return results.filter((result) => result.title.toLowerCase().includes(q));
}
