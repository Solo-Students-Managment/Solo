import { useAuth } from '@/app/providers/AuthContext';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const currentUser = user;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <DashboardSidebar
        user={currentUser}
        logout={logout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={currentUser} onMobileMenuToggle={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
