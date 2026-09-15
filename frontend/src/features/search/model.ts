export type SearchResult = {
  id: string;
  title: string;
  href: string;
  allowed: boolean;
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
