'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { dbService } from '@/services/db';
import { UserQuery } from '@/types';
import { toast } from 'sonner';
import { 
  MessageSquare, HelpCircle, CheckCircle2, Send, Loader2, Calendar, 
  ArrowRight, ShieldCheck, MailQuestion, MessageCircle, X, Search, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminQueriesPage() {
  const router = useRouter();
  const { user } = useStore();
  
  // Queries state
  const [queries, setQueries] = useState<UserQuery[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected query for replying modal
  const [selectedQuery, setSelectedQuery] = useState<UserQuery | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Unauthorized access.');
      router.push('/login');
      return;
    }

    async function loadAllQueries() {
      try {
        const list = await dbService.getAllQueries();
        setQueries(list);
      } catch (err) {
        console.error('Error fetching support queries:', err);
        toast.error('Failed to load support queries.');
      } finally {
        setLoading(false);
      }
    }

    loadAllQueries();
  }, [user, router]);

  // Reply handler
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery) return;
    if (!replyText.trim()) {
      toast.error('Please enter a response.');
      return;
    }

    setSendingReply(true);
    try {
      const updated = await dbService.replyToQuery(selectedQuery.id, replyText.trim());
      
      toast.success('Reply submitted successfully.');
      
      // Update local state list
      setQueries((prev) => 
        prev.map((q) => q.id === selectedQuery.id ? updated : q)
      );

      setSelectedQuery(null);
      setReplyText('');
    } catch (err) {
      console.error('Error replying to query:', err);
      toast.error('Failed to submit reply.');
    } finally {
      setSendingReply(false);
    }
  };

  // Filter logic
  const filteredQueries = queries.filter((q) => {
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    const matchesSearch = 
      q.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.userUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col gap-1 border-b border-border/40 pb-5">
        <h1 className="text-xl md:text-2xl font-black text-foreground">
          Queries & Support Moderation
        </h1>
        <p className="text-xs text-muted-foreground font-medium">
          Answer support messages and user inquiries in real time.
        </p>
      </div>

      {/* Control Panel: Filters & Search bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border/40">
        {/* Status filters */}
        <div className="flex gap-2 w-full md:w-auto">
          {(['all', 'pending', 'replied'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 h-9 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/10'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {status === 'all' ? 'All Queries' : status === 'pending' ? 'Pending' : 'Replied'}
            </button>
          ))}
        </div>

        {/* Search Input bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search queries, username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
          />
        </div>
      </div>

      {/* Main List Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-xs text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          Loading queries database...
        </div>
      ) : filteredQueries.length > 0 ? (
        <div className="overflow-x-auto border border-border/40 rounded-xl bg-card">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 text-[9px] font-black uppercase text-muted-foreground tracking-wider bg-secondary/20">
                <th className="p-4">User Info</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Submitted Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs font-semibold text-foreground/90">
              {filteredQueries.map((q) => (
                <tr key={q.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="p-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] text-muted-foreground font-black">
                      {q.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="block font-bold">{q.userName}</span>
                      <span className="block text-[9px] text-muted-foreground">@{q.userUsername}</span>
                    </div>
                  </td>
                  <td className="p-4 truncate max-w-[200px] font-black text-foreground">
                    {q.subject}
                  </td>
                  <td className="p-4 text-[10px] text-muted-foreground">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {q.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-extrabold uppercase">
                        <HelpCircle className="w-2.5 h-2.5" />
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-extrabold uppercase">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Replied
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedQuery(q);
                        setReplyText(q.replyMessage || '');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground font-extrabold text-[10px] uppercase tracking-wider transition-all border border-border/50"
                    >
                      {q.status === 'pending' ? 'Reply' : 'View / Edit Reply'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border/40 rounded-xl p-6">
          <FileText className="w-12 h-12 text-muted-foreground/35 mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-bold text-foreground">No queries found matching filters.</p>
          <p className="text-xs text-muted-foreground">Check other status categories or clear search query.</p>
        </div>
      )}

      {/* Reply Dialog Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-border/40 bg-secondary/15 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <MailQuestion className="w-4 h-4 text-primary" />
                  Support Case Details
                </h3>
                <span className="text-[10px] text-muted-foreground font-bold">
                  Submitted by {selectedQuery.userName} (@{selectedQuery.userUsername})
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedQuery(null);
                  setReplyText('');
                }}
                className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/70 flex items-center justify-center text-muted-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* User Query Block */}
              <div className="p-4 rounded-2xl bg-secondary/25 border border-border/40 space-y-2">
                <span className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  User Message Subject:
                </span>
                <strong className="block text-sm text-foreground">{selectedQuery.subject}</strong>
                <p className="text-xs text-foreground/80 leading-relaxed font-semibold mt-2 pl-3 border-l border-border/60">
                  {selectedQuery.message}
                </p>
                <span className="block text-[9px] text-muted-foreground mt-1">
                  Submitted on: {new Date(selectedQuery.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Admin Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  {selectedQuery.status === 'replied' ? 'Edit Response Message' : 'Response Message'}
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Type your reply to the user support query here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground font-medium leading-relaxed"
                />

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedQuery(null);
                      setReplyText('');
                    }}
                    className="px-4 h-10 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="px-5 h-10 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sendingReply ? 'Sending Response...' : 'Send Response'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
