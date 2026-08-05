'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { authService } from '@/services/auth';
import { Feather, UserPlus, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !username || !password) return;

    setLoading(true);
    try {
      const newUser = await authService.register(name, email, username, password);
      setUser(newUser);
      toast.success(`Account created! Welcome to Siragii, ${name}.`);
      router.push('/profile');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 p-6 md:p-8 rounded-3xl border border-border/40 glass-card space-y-6">
      <div className="text-center space-y-2">
        <Feather className="w-10 h-10 text-primary mx-auto" />
        <h1 className="text-2xl font-black text-foreground">Create Account</h1>
        <p className="text-xs text-muted-foreground">Join our community of global poets.</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Display Name</label>
          <div className="relative">
            <User className="absolute top-1/2 left-3.5 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              required
              placeholder="e.g. Subramania Bharati"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/30 border border-border/50 text-xs focus:outline-none focus:border-primary/80 text-foreground"
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Username</label>
          <div className="relative">
            <User className="absolute top-1/2 left-3.5 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              required
              placeholder="e.g. bharati_poet"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/30 border border-border/50 text-xs focus:outline-none focus:border-primary/80 text-foreground"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3.5 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              placeholder="poet@siragii.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/30 border border-border/50 text-xs focus:outline-none focus:border-primary/80 text-foreground"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3.5 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/30 border border-border/50 text-xs focus:outline-none focus:border-primary/80 text-foreground"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-primary/20 mt-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>{loading ? 'Creating...' : 'Register'}</span>
        </button>
      </form>

      <div className="border-t border-border/40 pt-4 text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
