'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { authService } from '@/services/auth';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users as UsersIcon, 
  Feather, 
  Compass, 
  MessageSquare, 
  BarChart3, 
  Settings as SettingsIcon, 
  ShieldAlert,
  LogOut,
  BookOpen,
  Quote,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setAuthorized(true);
      return;
    }

    // If not logged in or not admin, redirect to admin login
    if (!user || user.role !== 'admin') {
      toast.error('Please login as admin first.');
      router.push('/admin/login');
      return;
    }

    setAuthorized(true);

    // Inactivity session check (expiring after 15 minutes of inactivity)
    const checkInactivity = () => {
      const start = sessionStorage.getItem('admin_session_start');
      if (start) {
        const diff = Date.now() - parseInt(start, 10);
        if (diff > 900000) { // 15 mins
          toast.error('Session expired due to inactivity.');
          authService.logout().then(() => {
            setUser(null);
            router.push('/admin/login');
          });
        }
      }
    };

    const resetTimer = () => {
      sessionStorage.setItem('admin_session_start', Date.now().toString());
    };

    const interval = setInterval(checkInactivity, 30000); // Check every 30s
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [user, router, pathname, setUser]);

  // If page is admin login, render cleanly without navigation sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!user || !authorized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 animate-bounce" />
        <h2 className="text-xl font-black">Unauthorized Access</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          You do not have the required permissions to view this administrative page.
        </p>
        <Link href="/admin/login" className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl transition-all">
          Go to Login
        </Link>
      </div>
    );
  }

  const adminMenu = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User', href: '/admin/users', icon: UsersIcon },
    { name: 'Poems', href: '/admin/poems', icon: Feather },
    { name: 'Stories', href: '/admin/stories', icon: BookOpen },
    { name: 'Thoughts & Quotes', href: '/admin/quotes', icon: Quote },
    { name: 'Write Yours Verification', href: '/admin/write-yours', icon: Sparkles },
    { name: 'Support Queries', href: '/admin/queries', icon: HelpCircle },
    { name: 'Categories', href: '/admin/categories', icon: Compass },
    { name: 'Comments', href: '/admin/comments', icon: MessageSquare },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    toast.success('Logged out successfully.');
    router.push('/admin/login');
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="border-b border-border/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground">Control Center</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage Siragii portal records.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 text-xs font-bold transition-all self-start sm:self-center"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Admin Navigation Sidebar */}
        <aside className="lg:col-span-1 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 border-b lg:border-b-0 lg:border-r border-border/40 shrink-0">
          {adminMenu.map((item) => {
            const isActive = pathname === item.href || (item.href === '/admin/dashboard' && pathname === '/admin');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap lg:w-full",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </aside>

        {/* Content Box */}
        <div className="lg:col-span-3 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
