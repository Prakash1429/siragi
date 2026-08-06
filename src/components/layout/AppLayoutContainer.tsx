'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';
import ScrollIndicator from '../shared/ScrollIndicator';
import CommandPalette from '../shared/CommandPalette';
import { toast } from 'sonner';
import SplashScreen from '../shared/SplashScreen';
import { dbService } from '@/services/db';
import { VisitorProfile } from '@/types';
import { Feather, ArrowRight } from 'lucide-react';

export default function AppLayoutContainer({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useStore();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showSplash, setShowSplash] = useState(false);

  // Username Prompt States
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [promptUsername, setPromptUsername] = useState('');
  const [submittingPrompt, setSubmittingPrompt] = useState(false);

  // Splash Screen initial loader (Exactly 10 seconds)
  useEffect(() => {
    const shown = sessionStorage.getItem('siragii_splash_shown');
    if (!shown) {
      setShowSplash(true);
      sessionStorage.setItem('siragii_splash_shown', 'true');
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Authentication Route Guards & Visitor Profile Setup
  useEffect(() => {
    if (showSplash) return;

    const publicPaths = ['/login', '/register', '/forgot-password', '/admin/login'];
    
    // Check if visitor profile is configured
    const storedProfile = localStorage.getItem('siragii_visitor_profile');
    
    // If not configured, and not visiting public paths, show prompt screen
    if (!storedProfile && !publicPaths.includes(pathname)) {
      setShowUsernamePrompt(true);
      setCheckingAuth(false);
      return;
    }

    let storedUser = localStorage.getItem('siragii_user');

    // Setup guest user session matching the visitor profile username
    if (storedProfile && !storedUser) {
      try {
        const profile = JSON.parse(storedProfile);
        const guestUser = {
          id: profile.id,
          name: profile.username,
          username: profile.username,
          email: `${profile.id}@siragii.com`,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`,
          role: 'user' as const,
          followersCount: 0,
          followingCount: 0,
          createdAt: profile.firstVisit,
          streakCount: 0,
          totalPoemsRead: 0,
          totalStoriesRead: 0,
          totalQuotesRead: 0,
          readingHistory: [],
          referrer: ''
        };
        localStorage.setItem('siragii_user', JSON.stringify(guestUser));
        storedUser = JSON.stringify(guestUser);
        useStore.getState().setUser(guestUser);
      } catch {
        localStorage.removeItem('siragii_visitor_profile');
        setShowUsernamePrompt(true);
        setCheckingAuth(false);
        return;
      }
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        
        // Admin path restrictions: only role === 'admin' can access `/admin/*`
        if (pathname.startsWith('/admin') && pathname !== '/admin/login' && parsed.role !== 'admin') {
          toast.error('Access denied. Administrator privileges required.');
          router.push('/');
          return;
        }
        
        // Redirect public login/register paths to home page
        if (publicPaths.includes(pathname) && pathname !== '/admin/login') {
          router.push('/');
          return;
        }
        
        if (!useStore.getState().user) {
          useStore.getState().setUser(parsed);
        }
      } catch {
        localStorage.removeItem('siragii_user');
        router.push('/');
        return;
      }
    }
    setCheckingAuth(false);
  }, [pathname, router, showSplash]);

  // Track page views & session status
  useEffect(() => {
    if (showSplash || showUsernamePrompt || checkingAuth) return;

    const storedProfile = localStorage.getItem('siragii_visitor_profile');
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile) as VisitorProfile;
        
        // Track session visit increment
        const sessionActive = sessionStorage.getItem('siragii_session_active');
        const updates: Partial<VisitorProfile> = {
          lastActive: new Date().toISOString()
        };

        if (!sessionActive) {
          updates.visitsCount = (profile.visitsCount || 0) + 1;
          sessionStorage.setItem('siragii_session_active', 'true');
        }

        dbService.updateVisitorProfile(profile.id, updates);
        
        // Sync local storage profile
        localStorage.setItem('siragii_visitor_profile', JSON.stringify({ ...profile, ...updates }));
      } catch (err) {
        console.error('Error tracking session visit:', err);
      }
    }
  }, [showSplash, showUsernamePrompt, checkingAuth]);

  // Poll for admin reply notifications
  useEffect(() => {
    if (!user) return;

    const checkNotifications = async () => {
      try {
        const notifs = await dbService.getNotifications(user.id);
        const unread = notifs.filter(n => !n.read);
        
        if (unread.length > 0) {
          unread.forEach(n => {
            toast.info(n.message, {
              duration: 8000,
              action: {
                label: 'View',
                onClick: () => {
                  if (n.poemId) {
                    router.push(`/poem/${n.poemId}`);
                  }
                }
              }
            });

            if (user.enableNotifications !== false && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('Siragii Reply Alert', {
                body: n.message,
                icon: '/icon.png'
              });
            }
          });

          await dbService.markNotificationsAsRead(user.id);
        }
      } catch (err) {
        console.error('Error fetching admin reply notifications:', err);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, [user, router]);

  // Tracks active time spent (every 5 seconds)
  useEffect(() => {
    if (showSplash || showUsernamePrompt || checkingAuth) return;

    const interval = setInterval(() => {
      // Only count if page is active/visible to the user (no background idle time counting!)
      if (document.visibilityState === 'visible') {
        const storedProfile = localStorage.getItem('siragii_visitor_profile');
        if (storedProfile) {
          try {
            const profile = JSON.parse(storedProfile) as VisitorProfile;
            const newTime = (profile.totalTimeSpent || 0) + 5;
            
            // Update db and local storage
            dbService.updateVisitorProfile(profile.id, { totalTimeSpent: newTime });
            localStorage.setItem('siragii_visitor_profile', JSON.stringify({ ...profile, totalTimeSpent: newTime }));
          } catch {}
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [showSplash, showUsernamePrompt, checkingAuth]);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptUsername.trim()) return;

    setSubmittingPrompt(true);
    try {
      const userAgent = window.navigator.userAgent;
      let browser = 'Unknown';
      if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Edge';

      let deviceType = 'Desktop';
      if (/Mobi|Android|iPhone/i.test(userAgent)) deviceType = 'Mobile';
      else if (/Tablet|iPad/i.test(userAgent)) deviceType = 'Tablet';

      const trimmedUsername = promptUsername.trim();
      const existingProfiles = await dbService.getVisitorProfiles();
      const existingProfile = existingProfiles.find(p => p.username.toLowerCase() === trimmedUsername.toLowerCase());

      if (existingProfile) {
        // Reuse existing visitor profile
        const updatedProfile: VisitorProfile = {
          ...existingProfile,
          lastActive: new Date().toISOString(),
          visitsCount: (existingProfile.visitsCount || 1) + 1,
          deviceType,
          browser
        };

        await dbService.saveVisitorProfile(updatedProfile);
        localStorage.setItem('siragii_visitor_id', updatedProfile.id);
        localStorage.setItem('siragii_visitor_profile', JSON.stringify(updatedProfile));

        // Auto guest login session
        const guestUser = {
          id: updatedProfile.id,
          name: updatedProfile.username,
          username: updatedProfile.username,
          email: `${updatedProfile.id}@siragii.com`,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${updatedProfile.username}`,
          role: 'user' as const,
          followersCount: 0,
          followingCount: 0,
          createdAt: updatedProfile.firstVisit
        };
        localStorage.setItem('siragii_user', JSON.stringify(guestUser));
        useStore.getState().setUser(guestUser);

        sessionStorage.setItem('siragii_session_active', 'true');
        setShowUsernamePrompt(false);
        toast.success(`Welcome back, ${updatedProfile.username}!`);
      } else {
        // Create new profile
        const visitorId = localStorage.getItem('siragii_visitor_id') || `usr-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        if (!localStorage.getItem('siragii_visitor_id')) {
          localStorage.setItem('siragii_visitor_id', visitorId);
        }

        const newProfile: VisitorProfile = {
          id: visitorId,
          username: trimmedUsername,
          firstVisit: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          totalStoriesRead: 0,
          totalPoemsRead: 0,
          totalTimeSpent: 0,
          deviceType,
          browser,
          country: 'India',
          visitsCount: 1,
          readingHistory: [],
          referrer: document.referrer || 'Direct'
        };

        // Save to Firebase & Local Storage
        await dbService.saveVisitorProfile(newProfile);
        localStorage.setItem('siragii_visitor_profile', JSON.stringify(newProfile));

        // Auto guest login session
        const guestUser = {
          id: newProfile.id,
          name: newProfile.username,
          username: newProfile.username,
          email: `${newProfile.id}@siragii.com`,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${newProfile.username}`,
          role: 'user' as const,
          followersCount: 0,
          followingCount: 0,
          createdAt: newProfile.firstVisit
        };
        localStorage.setItem('siragii_user', JSON.stringify(guestUser));
        useStore.getState().setUser(guestUser);

        sessionStorage.setItem('siragii_session_active', 'true');
        setShowUsernamePrompt(false);
        toast.success(`Welcome to Siragii, ${newProfile.username}!`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to register username.');
    } finally {
      setSubmittingPrompt(false);
    }
  };

  // Keyboard Hotkeys
  useEffect(() => {
    let keysPressed: { [key: string]: boolean } = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.key) return;
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
        return;
      }

      keysPressed[e.key.toLowerCase()] = true;

      if (e.key === '?') {
        toast.info('Keyboard Shortcuts: Ctrl+K Command Palette, G+H Home, G+D Dashboard, G+S Search, G+W Composer', {
          duration: 5000
        });
      }

      if (keysPressed['g']) {
        if (e.key.toLowerCase() === 'h') {
          router.push('/');
          toast.success('Navigated Home');
        } else if (e.key.toLowerCase() === 'd') {
          router.push('/profile/dashboard');
          toast.success('Navigated to Dashboard');
        } else if (e.key.toLowerCase() === 's') {
          router.push('/search');
          toast.success('Navigated to Search');
        } else if (e.key.toLowerCase() === 'w') {
          router.push('/write');
          toast.success('Navigated to Composer');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.key) return;
      keysPressed[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [router]);

  // Render a loading state during authorization check to prevent flash
  if (showSplash) {
    return <SplashScreen />;
  }

  if (showUsernamePrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center relative px-4 py-12 bg-black overflow-hidden select-none">
        <style>{`
          @keyframes float-bubble-prompt {
            0% {
              transform: translateY(-20vh) translateX(0px) scale(0.6) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 0.45;
            }
            90% {
              opacity: 0.45;
            }
            100% {
              transform: translateY(110vh) translateX(25px) scale(1.1) rotate(180deg);
              opacity: 0;
            }
          }
        `}</style>

        {/* Floating Transparent Bubbles */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => {
            const size = Math.random() * 20 + 8; // 8px to 28px
            return (
              <div
                key={i}
                className="absolute rounded-full border border-white/20 bg-gradient-to-tr from-white/5 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.05),inset_0_0_8px_rgba(255,255,255,0.1)]"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 100}%`,
                  animation: `float-bubble-prompt ${Math.random() * 5 + 4}s infinite linear`,
                  animationDelay: `${Math.random() * 6}s`
                }}
              >
                {/* Highlight dot inside bubble */}
                <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-white/40" />
              </div>
            );
          })}
        </div>

        <div className="w-full max-w-sm rounded-3xl border border-border/40 bg-card/85 backdrop-blur-md p-8 shadow-2xl space-y-6 text-center z-10 relative">
          <div className="space-y-2">
            <div className="w-16 h-16 flex items-center justify-center mx-auto bg-transparent overflow-hidden">
              <video
                src="/images/logo-animation.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover scale-[1.25] mix-blend-multiply invert dark:mix-blend-screen dark:invert-0 transform-gpu pointer-events-none"
              />
            </div>
            <h2 className="text-xl font-black text-foreground">Welcome to Siragii</h2>
            <p className="text-xs text-muted-foreground">Please choose a reader username to continue.</p>
          </div>

          <form onSubmit={handlePromptSubmit} className="space-y-4">
            <div className="space-y-1">
              <input
                type="text"
                required
                maxLength={20}
                placeholder="Please enter your username to continue."
                value={promptUsername}
                onChange={(e) => setPromptUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="w-full h-12 px-4 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground text-center font-bold tracking-wider"
              />
              <p className="text-[9px] text-muted-foreground mt-1">Letters, numbers, and underscores allowed.</p>
            </div>

            <button
              type="submit"
              disabled={submittingPrompt || !promptUsername.trim() || promptUsername.trim().length < 3}
              className="w-full h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
            >
              <span>{submittingPrompt ? 'Connecting...' : 'Enter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (checkingAuth) {
    const publicPaths = ['/login', '/register', '/forgot-password', '/admin/login'];
    if (!publicPaths.includes(pathname)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center py-20 text-xs text-muted-foreground animate-pulse">
            Authenticating session...
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* SaaS Aurora background glow wrappers */}
      <div className="aurora-bg">
        <div className="aurora-glow-1" />
        <div className="aurora-glow-2" />
      </div>

      {/* Scroll indicator & progress bar */}
      <ScrollIndicator />

      {/* Command Palette search */}
      <CommandPalette />

      {/* Navbar at top */}
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main workspace layout */}
      <div className="flex flex-1 relative z-10">
        {/* Left sidebar - hidden on admin and authentication pages */}
        {!pathname.startsWith('/admin') && !['/login', '/register', '/forgot-password', '/admin/login'].includes(pathname) && (
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        )}

        {/* Content body */}
        <main className="flex-1 px-4 py-6 md:px-8 max-w-7xl mx-auto pb-24 md:pb-8 w-full">
          {children}
        </main>
      </div>

      {/* Mobile-only Bottom navigation bar - hidden on admin and authentication pages */}
      {!pathname.startsWith('/admin') && !['/login', '/register', '/forgot-password', '/admin/login'].includes(pathname) && (
        <BottomNavigation />
      )}
    </div>
  );
}
