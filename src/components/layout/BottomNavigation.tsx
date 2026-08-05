'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useStore } from '@/store/useStore';
import { Home, Compass, PenSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user } = useStore();

  const navItems = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.categories'), href: '/categories', icon: Compass },
    { name: t('nav.write'), href: user?.role === 'admin' ? '/write' : '/write-yours', icon: PenSquare },
    { name: t('nav.profile'), href: user ? '/profile' : '/login', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-background/90 backdrop-blur-md border-t border-border/40 md:hidden flex items-center justify-around px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn("w-5 h-5 mb-1 transition-transform", isActive && "scale-110")} />
            <span className="text-[10px] font-bold tracking-tight truncate max-w-[64px]">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
