'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { dbService } from '@/services/db';
import { UserQuery } from '@/types';
import { toast } from 'sonner';
import { 
  MessageSquare, HelpCircle, CheckCircle2, Send, Loader2, Calendar, 
  ArrowRight, ShieldCheck, MailQuestion, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QueriesPage() {
  const router = useRouter();
  const { user } = useStore();
  
  // Submit Query Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Queries list state
  const [queries, setQueries] = useState<UserQuery[]>([]);
  const [loadingQueries, setLoadingQueries] = useState(true);

  // Load support query list and poll for status changes
  useEffect(() => {
    if (!user) {
      toast.error('Please login first to submit and view support queries.');
      router.push('/login');
      return;
    }

    async function fetchQueries() {
      if (!user) return;
      try {
        const list = await dbService.getUserQueries(user.id);
        setQueries(list);
      } catch (err) {
        console.error('Error fetching support queries:', err);
      } finally {
        setLoadingQueries(false);
      }
    }

    fetchQueries();

    // Poll every 5 seconds to fetch support updates and replies in real time
    const interval = setInterval(fetchQueries, 5000);
    return () => clearInterval(interval);
  }, [user, router]);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Session expired. Please login.');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast.error('All fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      const newQuery = await dbService.submitQuery({
        userId: user.id,
        userName: user.name || 'Anonymous User',
        userUsername: user.username || 'anonymous',
        subject: subject.trim(),
        message: message.trim(),
      });

      toast.success('Your support query has been sent to the Admin team.');
      setQueries((prev) => [newQuery, ...prev]);
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Error submitting query:', err);
      toast.error('Failed to submit support query.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 min-h-screen">
      {/* Page Title Header banner */}
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6 text-left">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-primary tracking-widest">
          <MessageCircle className="w-4 h-4" />
          Support Helpdesk
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground">
          Queries & Support
        </h1>
        <p className="text-xs text-muted-foreground max-w-2xl font-medium leading-relaxed">
          Need help? Submit a support query here. Our administration team will review and reply directly to your queries below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Submit Query Form */}
        <div className="lg:col-span-5 p-6 rounded-2xl glass border border-border/40 space-y-6 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
          
          <div className="space-y-1">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <MailQuestion className="w-5 h-5 text-primary" />
              Ask a Question
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Send your questions or feedback to our team.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Subject (Required)
              </label>
              <input
                type="text"
                required
                placeholder="What is your query about?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Message Description (Required)
              </label>
              <textarea
                required
                rows={6}
                placeholder="Describe your issue or query in detail here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground font-medium leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Sending query...' : 'Submit Support Query'}
            </button>
          </form>
        </div>

        {/* Right Column: Query History Panel */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="border-b border-border/40 pb-4">
            <h2 className="text-base font-black text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Your Queries
            </h2>
            <p className="text-[10px] text-muted-foreground mt-1">
              Real-time listing of your support conversations with the admin team.
            </p>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {loadingQueries ? (
              <div className="flex items-center justify-center py-16 text-xs text-muted-foreground gap-2 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Loading support queries...
              </div>
            ) : queries.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {queries.map((q) => (
                  <motion.div
                    key={q.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 rounded-2xl border border-border/40 bg-secondary/10 hover:bg-secondary/15 transition-all space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-foreground truncate">{q.subject}</h4>
                        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Submitted: {new Date(q.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {q.status === 'pending' ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold">
                          <HelpCircle className="w-3 h-3" />
                          Awaiting Reply
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Replied
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-secondary/20 border border-border/20 text-xs text-muted-foreground font-medium leading-relaxed">
                      {q.message}
                    </div>

                    {/* Admin Reply message block */}
                    {q.status === 'replied' && q.replyMessage && (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground/90 space-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase text-primary tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                          Official Admin Response
                        </div>
                        <p className="leading-relaxed font-semibold italic text-foreground/80 pl-2 border-l border-primary/30">
                          {q.replyMessage}
                        </p>
                        {q.repliedAt && (
                          <div className="text-[9px] text-muted-foreground text-right mt-1">
                            Replied on: {new Date(q.repliedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-16 border border-dashed border-border/40 rounded-2xl p-6">
                <HelpCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2 animate-bounce" />
                <p className="text-xs font-bold text-foreground">No queries submitted yet.</p>
                <p className="text-[10px] text-muted-foreground/75 mt-1">
                  Send support requests or questions to admins using the form on the left.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
