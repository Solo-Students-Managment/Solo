export type RouteBudget = {
  route: string;
  maxFirstLoadKb: number;
  lcpMs: number;
};

export const ROUTE_BUDGETS: RouteBudget[] = [
  { route: "/", maxFirstLoadKb: 180, lcpMs: 2500 },
  { route: "/p/[slug]", maxFirstLoadKb: 150, lcpMs: 2000 },
  { route: "/admin", maxFirstLoadKb: 220, lcpMs: 3000 },
];

export function findBudget(route: string): RouteBudget | undefined {
  return ROUTE_BUDGETS.find((budget) => budget.route === route);
}

export function isWithinBudget(route: string, firstLoadKb: number): boolean {
  const budget = findBudget(route);
  if (!budget) return true;
  return firstLoadKb <= budget.maxFirstLoadKb;
}
