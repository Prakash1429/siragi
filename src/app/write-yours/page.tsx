'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { dbService } from '@/services/db';
import { Submission } from '@/types';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { Feather, Save, FileText, Sparkles, FolderOpen, Calendar, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function UserWriteYoursPage() {
  const { user } = useStore();
  const router = useRouter();

  const [contentType, setContentType] = useState<'poem' | 'story' | 'thought' | 'quote'>('poem');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error('Please configure your username first.');
      router.push('/profile');
      return;
    }

    async function loadHistory() {
      if (!user) return;
      try {
        const list = await dbService.getUserSubmissions(user.id);
        setSubmissions(list);
      } catch (err) {
        console.error('Error loading submissions:', err);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistory();

    const interval = setInterval(loadHistory, 5000);
    return () => clearInterval(interval);
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in title and content.');
      return;
    }

    setSubmitting(true);
    try {
      const added = await dbService.submitContent({
        userId: user.id,
        userName: user.name,
        userUsername: user.username,
        contentType,
        title: title.trim(),
        content: content.trim(),
        coverUrl: coverUrl.trim() || undefined,
      });

      // Add notification for submission received
      await dbService.addNotification({
        recipientId: user.id,
        senderId: 'system',
        senderName: 'System',
        type: 'system',
        message: 'Your submission has been received for verification.',
        read: false,
        poemId: 'write-yours',
        poemTitle: title.trim()
      });

      toast.success('Your submission has been sent for verification and will be published after admin approval.');
      
      // Reset form
      setTitle('');
      setContent('');
      setCoverUrl('');
      
      // Update local history
      setSubmissions((prev) => [added, ...prev]);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to submit content.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'Write Yours' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-border/40 pb-4">
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              <Feather className="w-6 h-6 text-primary animate-pulse" />
              Write Yours
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Submit your own poems, stories, thoughts, or quotes for review and publication.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-2xl glass-card border border-border/40">
            {/* Content Type select dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-primary" />
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
              >
                <option value="poem" className="bg-card">Poem</option>
                <option value="story" className="bg-card">Story</option>
                <option value="thought" className="bg-card">Thought</option>
                <option value="quote" className="bg-card">Quote</option>
              </select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Title
              </label>
              <input
                type="text"
                required
                placeholder="Give your writing a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground font-bold"
              />
            </div>

            {/* Content Body */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Content
              </label>
              <textarea
                required
                rows={contentType === 'story' ? 12 : 7}
                placeholder={
                  contentType === 'poem'
                    ? "Type your verses here..."
                    : contentType === 'story'
                    ? "Write your short tale here..."
                    : "Share your thoughts or quote..."
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 rounded-xl bg-secondary/35 border border-border/50 text-sm focus:outline-none focus:border-primary text-foreground font-serif leading-relaxed italic"
              />
            </div>

            {/* Optional Cover Image (Only for Poem/Story/Quote etc) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Cover Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/cover.jpg"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Send for Verification'}
            </button>
          </form>
        </div>

        {/* Right Column: History Status Panel */}
        <div className="space-y-6">
          <div className="border-b border-border/40 pb-4">
            <h2 className="text-base font-black text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Submission History
            </h2>
            <p className="text-[10px] text-muted-foreground mt-1">
              Track the verification status of your previous uploads.
            </p>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {loadingHistory ? (
              <div className="text-center py-10 text-xs text-muted-foreground animate-pulse">
                Loading history...
              </div>
            ) : submissions.length > 0 ? (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl border border-border/40 bg-secondary/10 hover:bg-secondary/15 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">{sub.title}</h4>
                      <span className="inline-block px-2 py-0.5 mt-1 rounded bg-primary/10 text-[8px] font-black text-primary uppercase tracking-wider">
                        {sub.contentType}
                      </span>
                    </div>

                    {/* Status Badge */}
                    {sub.status === 'pending' ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold">
                        <HelpCircle className="w-3 h-3" />
                        Pending
                      </span>
                    ) : sub.status === 'approved' ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold">
                        <CheckCircle className="w-3 h-3" />
                        Approved by Admin
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        Rejected by Admin
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-muted-foreground/85 line-clamp-2 leading-relaxed">
                    {sub.content}
                  </p>

                  {/* Rejection Reason and Improvement suggestions display */}
                  {sub.status === 'rejected' && (sub.rejectionReason || sub.improvementSuggestions) && (
                    <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/15 text-[10px] text-rose-300 space-y-2">
                      {sub.rejectionReason && (
                        <div>
                          <strong className="block font-bold text-rose-200">Rejection Reason:</strong>
                          <p className="mt-0.5 leading-relaxed">{sub.rejectionReason}</p>
                        </div>
                      )}
                      {sub.improvementSuggestions && (
                        <div className={sub.rejectionReason ? "border-t border-rose-500/10 pt-1.5" : ""}>
                          <strong className="block font-bold text-amber-300">What to Improve:</strong>
                          <p className="mt-0.5 leading-relaxed text-amber-200/90">{sub.improvementSuggestions}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Approval details display */}
                  {sub.status === 'approved' && sub.categoryName && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-[10px] text-emerald-300">
                      <strong className="block font-bold text-emerald-200">Approval Details:</strong>
                      <p className="mt-0.5 leading-relaxed">
                        Approved and published under category:{' '}
                        <span className="font-extrabold uppercase tracking-wide text-emerald-100">{sub.categoryName}</span>
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground border-t border-border/10 pt-2">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-border/40 rounded-2xl p-6">
                <Sparkles className="w-8 h-8 text-muted-foreground/35 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-muted-foreground">No submissions yet.</p>
                <p className="text-[10px] text-muted-foreground/75 mt-1">Your writings will appear here once submitted.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
