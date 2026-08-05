'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { authService } from '@/services/auth';
import { Feather, LogIn, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();
  const router = useRouter();

  // Autofill if remember me was active
  useEffect(() => {
    const saved = localStorage.getItem('siragii_remember');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);

      if (rememberMe) {
        localStorage.setItem('siragii_remember', email);
      } else {
        localStorage.removeItem('siragii_remember');
      }

      toast.success(`Welcome back, ${loggedUser.name}!`);
      
      // Redirect to Home Dashboard / Homepage
      router.push('/');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 md:p-8 rounded-3xl border border-border/40 glass-card space-y-6">
      <div className="text-center space-y-2">
        <Feather className="w-10 h-10 text-primary mx-auto" />
        <h1 className="text-2xl font-black text-foreground">Welcome Back</h1>
        <p className="text-xs text-muted-foreground">Sign in to explore poems, write comments and share.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email / Username</label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3.5 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              required
              placeholder="Username or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/30 border border-border/50 text-xs focus:outline-none focus:border-primary/80 text-foreground"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
            <Link href="/forgot-password" className="text-[10px] text-primary font-bold hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3.5 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-secondary/30 border border-border/50 text-xs focus:outline-none focus:border-primary/80 text-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-border/50 text-primary bg-secondary/30 focus:ring-primary/30"
          />
          <label htmlFor="rememberMe" className="text-[11px] font-semibold text-muted-foreground select-none cursor-pointer">
            Remember Me
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-primary/20 mt-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? 'Signing in...' : 'Sign In'}</span>
        </button>
      </form>

      <div className="border-t border-border/40 pt-4 text-center text-xs text-muted-foreground space-y-2">
        <div>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Register now
          </Link>
        </div>
        <div className="pt-2 border-t border-border/10">
          <Link href="/admin/login" className="text-[10px] text-muted-foreground hover:text-primary transition-all font-semibold uppercase tracking-wider">
            Admin Control Center
          </Link>
        </div>
      </div>
    </div>
  );
}
