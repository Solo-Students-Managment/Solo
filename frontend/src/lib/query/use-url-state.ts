"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = useMemo(
    () => ({
      tab: searchParams.get("tab") ?? undefined,
      page: Number(searchParams.get("page") ?? "1"),
      sort: searchParams.get("sort") ?? undefined,
      filter: searchParams.get("filter") ?? undefined,
      view: searchParams.get("view") ?? undefined,
    }),
    [searchParams],
  );

  const setValues = useCallback(
    (next: Partial<typeof values>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(next)) {
        if (
          value === undefined ||
          value === "" ||
          (value === 1 && key === "page")
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  return { values, setValues };
}
