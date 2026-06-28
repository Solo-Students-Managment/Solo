import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNavItemsForRole, ROLE_LABELS } from '@/lib/routes';
import type { AuthSession } from '@/types';
import { MenuSquareIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface DashboardHeaderProps {
  user: NonNullable<AuthSession['user']>;
  onMobileMenuToggle: () => void;
}

export function DashboardHeader({ user, onMobileMenuToggle }: DashboardHeaderProps) {
  const location = useLocation();

  const navItems = getNavItemsForRole(user.role);

  const currentPageLabel =
    navItems.find(
      (item) =>
        location.pathname === item.href ||
        (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
    )?.label ?? 'داشبورد';

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-slate-100 bg-white/95 px-6 backdrop-blur-xl">
      <Button
        variant="ghost"
        size="icon"
        className="text-slate-600 lg:hidden"
        onClick={onMobileMenuToggle}
      >
        <MenuSquareIcon className="h-6 w-6" />
      </Button>

      <div className="flex-1 px-4">
        <h1 className="text-lg font-semibold text-slate-800">{currentPageLabel}</h1>
      </div>

      <Badge variant="warning" className="rounded-2xs border-0 font-medium">
        {ROLE_LABELS[user.role]}
      </Badge>
    </header>
  );
}
