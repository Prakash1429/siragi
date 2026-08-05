'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { authService } from '@/services/auth';
import { dbService } from '@/services/db';
import ThemeToggle from '../shared/ThemeToggle';
import LanguageSwitcher from '../shared/LanguageSwitcher';
import { Menu, Search, PenSquare, LogOut, User as UserIcon, LayoutDashboard, Feather, Bookmark, Heart, Settings, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { VisitorProfile } from '@/types';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { t, language } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [profile, setProfile] = useState<VisitorProfile | null>(null);

  useEffect(() => {
    const unsub = authService.onAuthChange((userData) => {
      setUser(userData);
    });
    return () => unsub();
  }, [setUser]);

  useEffect(() => {
    if (showDropdown) {
      const stored = localStorage.getItem('siragii_visitor_profile');
      if (stored) {
        setProfile(JSON.parse(stored));
      }

      const visitorId = localStorage.getItem('siragii_visitor_id');
      if (visitorId) {
        dbService.getVisitorProfiles().then(profiles => {
          const latest = profiles.find(p => p.id === visitorId);
          if (latest) {
            setProfile(latest);
            localStorage.setItem('siragii_visitor_profile', JSON.stringify(latest));
          }
        });
      }
    }
  }, [showDropdown]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    localStorage.removeItem('siragii_visitor_profile');
    localStorage.removeItem('siragii_user');
    localStorage.removeItem('siragii_visitor_id');
    sessionStorage.removeItem('siragii_session_active');
    setUser(null);
    setShowDropdown(false);
    toast.success('Logged out successfully.');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left Side: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg hover:bg-secondary/50 md:hidden text-muted-foreground hover:text-foreground transition-all"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <Link href="/" className="flex items-center gap-3 font-black tracking-tight text-primary hover:opacity-90 transition-all">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 shadow-md shrink-0">
              <img
                src="/images/logo.jpg"
                alt="Siragii Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-2xl md:text-3xl font-black font-serif italic tracking-wider select-none flex items-center">
              {language === 'ta' ? (
                <>
                  <span style={{ color: '#FF6B5E' }}>சி</span>
                  <span style={{ color: '#FF9F5A' }}>ற</span>
                  <span style={{ color: '#FFD45C' }}>கி...</span>
                </>
              ) : (
                <>
                  <span style={{ color: '#FF6B5E' }}>Sira</span>
                  <span style={{ color: '#FF9F5A' }}>gi</span>
                  <span style={{ color: '#FFD45C' }}>i...</span>
                </>
              )}
            </span>
          </Link>
        </div>



        {/* Right Side: Theme, Language, Write, User Profile */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />

          {user && user.role === 'admin' && !pathname.startsWith('/admin') && (
            <Link
              href="/write"
              className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm transition-all shadow-lg shadow-primary/25"
            >
              <PenSquare className="w-4 h-4" />
              <span>{t('nav.write')}</span>
            </Link>
          )}

          {!pathname.startsWith('/admin') && (!user || user.role !== 'admin') && (
            <Link
              href="/admin/login"
              className="h-10 px-5 rounded-full border border-border hover:bg-secondary text-sm font-bold text-foreground flex items-center justify-center transition-all"
            >
              Admin Login
            </Link>
          )}

          {user && !pathname.startsWith('/admin') && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1 rounded-full border border-border/60 hover:border-primary transition-all overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  {/* Telemetry profile details */}
                  {profile ? (
                    <div className="px-3 py-2.5 border-b border-border/40 mb-2 bg-secondary/15 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                          alt={user.name}
                          className="w-9 h-9 rounded-full border border-primary/20 bg-secondary"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-foreground truncate">{profile.username}</p>
                          <p className="text-[9px] text-muted-foreground font-mono truncate">{profile.id.slice(0, 12)}...</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] pt-2 border-t border-border/20 text-muted-foreground">
                        <div>Streak: <strong className="text-foreground">1 Day 🔥</strong></div>
                        <div>Poems: <strong className="text-foreground">{profile.totalPoemsRead || 0}</strong></div>
                        <div>Stories: <strong className="text-foreground">{profile.totalStoriesRead || 0}</strong></div>
                        <div>Quotes: <strong className="text-foreground">{profile.totalQuotesRead || 0}</strong></div>
                        <div className="col-span-2 border-b border-border/10 pb-1">History: <strong className="text-foreground">{profile.readingHistory ? profile.readingHistory.length : 0}</strong></div>
                        <div className="col-span-2 pt-1">Joined: <span className="font-semibold text-foreground">{new Date(profile.firstVisit).toLocaleDateString()}</span></div>
                        <div className="col-span-2">Active: <span className="font-semibold text-foreground">{new Date(profile.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-2 border-b border-border/60 mb-1.5">
                      <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <a
                      href="https://www.instagram.com/echo._of_.words?igsh=MWlyZmRwZ2d0NnIz"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/65 transition-all text-left"
                    >
                      <InstagramIcon className="w-4 h-4 text-pink-500" />
                      <span>📸 Instagram</span>
                    </a>

                    <Link
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/65 transition-all text-left"
                    >
                      <UserIcon className="w-4 h-4 text-primary" />
                      <span>👤 My Profile</span>
                    </Link>

                    <Link
                      href="/profile/edit"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/65 transition-all text-left"
                    >
                      <Settings className="w-4 h-4 text-amber-500" />
                      <span>⚙️ Settings</span>
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/65 transition-all border-t border-border/20 pt-2 text-left"
                      >
                        <LayoutDashboard className="w-4 h-4 text-sky-400" />
                        <span>💼 Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all text-left border-t border-border/20 mt-1.5"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>🚪 Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
