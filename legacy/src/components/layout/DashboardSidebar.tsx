import placeholder from '@/assets/png/userPlaceholder.png';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getNavItemsForRole, ROLE_LABELS } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { AuthSession } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Ticket,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const iconMap = {
  '/dashboard': LayoutDashboard,
  '/dashboard/sessions': CalendarDays,
  '/dashboard/exams': ClipboardList,
  '/dashboard/attendance': BookOpen,
  '/dashboard/schedule': CalendarDays,
  '/dashboard/homework': ClipboardList,
  '/dashboard/subscription': Wallet,
  '/dashboard/profile': Users,
  '/dashboard/messages': MessageSquare,
  '/dashboard/tickets': Ticket,
  '/dashboard/students': Users,
  '/dashboard/admin/users': Users,
  '/dashboard/admin/analytics': BarChart3,
  '/dashboard/admin/revenue': Wallet,
} as const;

interface DashboardSidebarProps {
  user: NonNullable<AuthSession['user']>;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  logout: () => void;
}
export function DashboardSidebar({
  mobileOpen,
  setMobileOpen,
  user,
  logout,
}: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = getNavItemsForRole(user.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  const sidebarContent = (
    <div className="flex h-screen flex-col bg-white">
      {/* Top Section - Logo + Close Button (Mobile) */}
      <div className="flex items-center justify-between px-6 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xs flex h-11 w-11 items-center justify-center bg-linear-to-br from-sky-400 to-indigo-500 text-white shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800">پنل آموزشی</p>
            <p className="text-xs text-slate-500">مدیریت زبان‌آموز</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
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
                'rounded-2xs flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-linear-to-r from-sky-500 to-indigo-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-slate-100" />

      {/* Bottom Section - Fixed User & Logout */}
      <div className="p-4 pb-6">
        <div className="mb-4 flex items-center gap-3">
          <Avatar className="rounded-2xs h-10 w-10 border border-slate-200">
            <AvatarFallback className="rounded-2xs bg-slate-100 text-slate-700">
              <img src={placeholder} alt="placeholder" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">{user.name}</p>
            <Badge variant="warning" className="rounded-2xs mt-1 text-xs">
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </div>

        <Button
          variant="danger"
          className="flex w-full items-center-safe justify-between"
          onClick={handleLogout}
        >
          خروج
          <LogOut className="h-4 w-4 rotate-180" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 lg:block">{sidebarContent}</aside>

      {/* Mobile Animated Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
