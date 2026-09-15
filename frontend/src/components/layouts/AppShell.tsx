"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Menu, MoreHorizontal, Search } from "lucide-react";

import { Button } from "@/components/ui";
import { SoloIcon } from "@/components/ui/solo-icon";
import { routes } from "@/lib/routes";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  label: string;
};

const DESKTOP_NAV: NavItem[] = [
  { href: routes.personal.home(), label: "Home" },
  { href: routes.teacher.home(), label: "Teacher" },
  { href: routes.organization.home("demo"), label: "Organization" },
];

const MOBILE_NAV: NavItem[] = [
  { href: routes.personal.home(), label: "Home" },
  { href: routes.teacher.home(), label: "Teacher" },
  { href: routes.auth.login(), label: "Search" },
  { href: routes.states.notFound(), label: "Alerts" },
];

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
};

export function AppShell({ children, title = "Solo" }: AppShellProps) {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="bg-background text-foreground flex min-h-dvh flex-col md:flex-row">
      <aside
        className={cn(
          "border-border bg-elevated hidden w-64 shrink-0 border-e p-4 md:flex md:flex-col",
          !sidebarOpen && "md:hidden",
        )}
      >
        <p className="font-display text-brand mb-6 text-2xl font-semibold">
          {title}
        </p>
        <nav className="flex flex-col gap-2" aria-label="Primary">
          {DESKTOP_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:bg-sunken rounded-md px-3 py-2 text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border bg-elevated sticky top-0 z-20 flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="md:inline-flex"
              aria-label="Toggle navigation"
              onClick={toggleSidebar}
            >
              <SoloIcon icon={Menu} label="Toggle navigation" />
            </Button>
            <p className="font-display text-lg font-medium md:hidden">
              {title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" aria-label="Search">
              <SoloIcon icon={Search} label="Search" />
            </Button>
            <Button size="icon" variant="ghost" aria-label="Notifications">
              <span className="relative">
                <SoloIcon icon={Bell} label="Notifications" />
                <span className="bg-danger absolute -end-0.5 -top-0.5 size-2 rounded-full" />
              </span>
            </Button>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-6">
          {children}
        </div>

        <nav
          className="border-border bg-elevated fixed inset-x-0 bottom-0 z-20 flex items-stretch justify-around border-t px-2 pt-2 pb-[env(safe-area-inset-bottom)] md:hidden"
          aria-label="Mobile primary"
        >
          {MOBILE_NAV.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted flex flex-1 flex-col items-center gap-1 py-2 text-xs"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            className="text-muted flex flex-1 flex-col items-center gap-1 py-2 text-xs"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((value) => !value)}
          >
            <SoloIcon icon={MoreHorizontal} label="More" />
            More
          </button>
        </nav>
      </div>
    </div>
  );
}
