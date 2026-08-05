'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, HelpCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEmail('');
      toast.success('Password reset link sent to your email.');
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 md:p-8 rounded-3xl border border-border/40 glass-card space-y-6">
      <div className="text-center space-y-2">
        <HelpCircle className="w-10 h-10 text-primary mx-auto animate-pulse" />
        <h1 className="text-2xl font-black text-foreground">Reset Password</h1>
        <p className="text-xs text-muted-foreground">Enter your email and we will send you a reset link.</p>
      </div>

      <form onSubmit={handleReset} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg"
        >
          {loading ? 'Sending Link...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="border-t border-border/40 pt-4 text-center">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold transition-all">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
}
