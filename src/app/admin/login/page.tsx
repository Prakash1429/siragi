'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { authService } from '@/services/auth';
import { Eye, EyeOff, ShieldCheck, Lock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser } = useStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      // Authenticate
      const userProfile = await authService.login(username, password);
      
      if (userProfile.role !== 'admin') {
        toast.error('Unauthorized. Access denied.');
        await authService.logout();
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(userProfile);
      toast.success('Admin authenticated successfully.');
      
      // Store session login time for inactivity check (e.g. 30 mins)
      sessionStorage.setItem('admin_session_start', Date.now().toString());
      
      router.push('/admin/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-12">
      {/* SaaS Aurora background glow */}
      <div className="aurora-bg">
        <div className="aurora-glow-1" />
        <div className="aurora-glow-2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-border/40 glass p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-foreground">Control Center Login</h2>
          <p className="text-xs text-muted-foreground">Admin credentials required to view dashboards.</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Username</label>
            <div className="relative">
              <UserIcon className="absolute top-1/2 left-3.5 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                required
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3.5 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
