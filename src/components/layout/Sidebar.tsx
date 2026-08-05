'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useStore } from '@/store/useStore';
import { 
  Home, 
  Compass, 
  TrendingUp, 
  Heart, 
  FolderHeart, 
  Users, 
  PenSquare,
  Settings,
  X,
  Feather,
  BookOpen,
  Quote,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user } = useStore();

  const menuItems = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.poems'), href: '/poems', icon: Feather },
    { name: t('nav.stories'), href: '/stories', icon: BookOpen },
    { name: 'Thoughts & Quotes', href: '/quotes', icon: Quote },
    { name: 'Write Yours', href: '/write-yours', icon: PenSquare },
    { name: t('nav.categories'), href: '/categories', icon: Compass },
    { name: t('nav.trending'), href: '/trending', icon: TrendingUp },
    { name: 'Queries', href: '/queries', icon: MessageSquare },
  ];

  const userMenuItems = [
    { name: t('nav.favorites'), href: '/favorites', icon: Heart },
    { name: t('nav.collections'), href: '/collections', icon: FolderHeart },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-5 px-4 bg-card border-r border-border/40">
      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
          Discover
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className={cn("w-4.5 h-4.5 transition-transform", !isActive && "group-hover:scale-110")} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* User Items */}
        {user && (
          <div className="pt-6 space-y-1">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
              Library
            </div>
            {userMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <item.icon className={cn("w-4.5 h-4.5 transition-transform", !isActive && "group-hover:scale-110")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer / CTA inside Sidebar */}
      {user && user.role === 'admin' && (
        <div className="mt-auto pt-6 border-t border-border/40">
          <Link
            href="/write"
            onClick={onClose}
            className="flex sm:hidden items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20"
          >
            <PenSquare className="w-4 h-4" />
            <span>{t('nav.write')}</span>
          </Link>
        </div>
      )}
      <div className="hidden sm:block text-[11px] text-muted-foreground text-center">
        © 2026 Siragii
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent left side) */}
      <aside className="hidden md:block w-64 shrink-0 h-[calc(100vh-64px)] sticky top-16">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-background/60 backdrop-blur-sm transition-opacity" 
            onClick={onClose}
          />
          
          {/* Drawer content */}
          <div className="relative flex flex-col w-64 max-w-xs bg-card shadow-2xl h-full slide-in-from-left duration-200">
            {/* Close button inside drawer */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-secondary/80 border border-border/50 text-muted-foreground hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
