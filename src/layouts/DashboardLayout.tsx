import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Ticket,
  Users,
  Wallet,
  X,
} from 'lucide-react';

import { getNavItemsForRole, ROLE_LABELS } from '@/lib/routes';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const iconMap = {
  '/dashboard': LayoutDashboard,
  '/dashboard/sessions': CalendarDays,
  '/dashboard/exams': ClipboardList,
  '/dashboard/attendance': BookOpen,
  '/dashboard/messages': MessageSquare,
  '/dashboard/tickets': Ticket,
  '/dashboard/students': Users,
  '/dashboard/admin/users': Users,
  '/dashboard/admin/analytics': BarChart3,
  '/dashboard/admin/revenue': Wallet,
} as const;

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = getNavItemsForRole(user.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">پنل آموزشی</p>
          <p className="text-muted-foreground text-xs">مدیریت زبان‌آموز</p>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = iconMap[item.href as keyof typeof iconMap] ?? LayoutDashboard;
          const active =
            location.pathname === item.href ||
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="p-4">
        <div className="mb-3 flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <Badge variant="secondary" className="mt-1">
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          خروج
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen">
      <div className="flex min-h-screen">
        <aside className="bg-sidebar hidden w-64 shrink-0 border-e lg:block">{sidebar}</aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="بستن منو"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="bg-sidebar absolute inset-y-0 inset-s-0 w-64 border-e shadow-xl">
              <div className="flex justify-end p-2">
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {sidebar}
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="bg-card flex h-14 items-center gap-3 border-b px-4 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-base font-semibold">
                {navItems.find(
                  (item) =>
                    location.pathname === item.href ||
                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                )?.label ?? 'داشبورد'}
              </h1>
            </div>
            <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
          </header>
          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
