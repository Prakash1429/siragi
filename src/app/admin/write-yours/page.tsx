'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { dbService } from '@/services/db';
import { Submission, Category } from '@/types';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { 
  Sparkles, Check, X, ShieldAlert, Calendar, 
  HelpCircle, CheckCircle, AlertTriangle, User,
  FileText, Search, Loader2, ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminWriteYoursPage() {
  const { user } = useStore();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'poem' | 'story' | 'thought' | 'quote'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Review Modal state
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [categorySlug, setCategorySlug] = useState('life');
  const [rejectionReason, setRejectionReason] = useState('');
  const [improvementSuggestions, setImprovementSuggestions] = useState('');
  const [modifying, setModifying] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Unauthorized access.');
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const [subList, catList] = await Promise.all([
          dbService.getSubmissions(),
          dbService.getCategories()
        ]);
        setSubmissions(subList);
        setCategories(catList);
        if (catList.length > 0) {
          setCategorySlug(catList[0].slug);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, router]);

  // Counters
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

  const handleApprove = async () => {
    if (!selectedSub) return;
    setModifying(true);
    try {
      const selectedCategory = categories.find(c => c.slug === categorySlug);
      const catName = selectedCategory ? selectedCategory.name : 'Life';

      // 1. Update submission status to approved
      await dbService.updateSubmission(selectedSub.id, {
        status: 'approved',
        categorySlug,
        categoryName: catName
      });

      // 2. Publish resources depending on contentType
      if (selectedSub.contentType === 'poem') {
        const slug = selectedSub.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        
        await dbService.createPoem({
          title: selectedSub.title,
          content: selectedSub.content,
          authorId: selectedSub.userId,
          authorName: selectedSub.userName,
          authorUsername: selectedSub.userUsername,
          language: 'en',
          slug,
          categorySlug,
          categoryName: catName,
          tags: ['Community'],
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else if (selectedSub.contentType === 'story') {
        await dbService.createStory({
          title: selectedSub.title,
          content: selectedSub.content,
          author: selectedSub.userName,
          authorId: selectedSub.userId,
          authorUsername: selectedSub.userUsername,
          status: 'published',
          coverUrl: selectedSub.coverUrl || undefined,
          tags: ['Community'],
          category: 'story',
          genre: catName,
          readingTime: Math.max(1, Math.ceil(selectedSub.content.split(/\s+/).length / 120)),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else if (selectedSub.contentType === 'thought' || selectedSub.contentType === 'quote') {
        await dbService.saveQuote({
          content: selectedSub.content,
          author: selectedSub.userName,
          authorId: selectedSub.userId,
          authorUsername: selectedSub.userUsername,
          category: selectedSub.contentType === 'thought' ? 'thought' : 'quote',
          genre: catName,
          tags: ['Community'],
          status: 'published',
          createdAt: new Date().toISOString()
        });
      }

      // 1. Notify the author of approval
      await dbService.addNotification({
        recipientId: selectedSub.userId,
        senderId: 'admin',
        senderName: 'Admin',
        type: 'system',
        message: `Your ${selectedSub.contentType} has been approved and published.`,
        read: false,
        poemId: selectedSub.contentType === 'thought' ? 'quotes' : `${selectedSub.contentType}s`,
        poemTitle: selectedSub.title
      });

      toast.success('Submission approved and published successfully!');
      
      // Update local state list
      setSubmissions(prev =>
        prev.map(s => (s.id === selectedSub.id ? { ...s, status: 'approved', categorySlug, categoryName: catName } : s))
      );
      setSelectedSub(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve submission.');
    } finally {
      setModifying(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSub) return;
    setModifying(true);
    try {
      await dbService.updateSubmission(selectedSub.id, {
        status: 'rejected',
        rejectionReason: rejectionReason.trim() || undefined,
        improvementSuggestions: improvementSuggestions.trim() || undefined
      });

      // Notify the user of rejection status
      await dbService.addNotification({
        recipientId: selectedSub.userId,
        senderId: 'admin',
        senderName: 'Admin',
        type: 'system',
        message: `Your submission has been rejected.${rejectionReason.trim() ? ` Reason: ${rejectionReason.trim()}` : ''}`,
        read: false,
        poemId: 'write-yours',
        poemTitle: selectedSub.title
      });

      toast.success('Submission rejected.');
      
      // Update local state list
      setSubmissions(prev =>
        prev.map(s => (s.id === selectedSub.id ? { 
          ...s, 
          status: 'rejected', 
          rejectionReason: rejectionReason.trim() || undefined,
          improvementSuggestions: improvementSuggestions.trim() || undefined
        } : s))
      );
      setSelectedSub(null);
      setRejectionReason('');
      setImprovementSuggestions('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject submission.');
    } finally {
      setModifying(false);
    }
  };

  // Filter & Sort logic
  const filteredSubmissions = submissions
    .filter(s => {
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesType = typeFilter === 'all' || s.contentType === typeFilter;
      const matchesSearch =
        s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.userUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.createdAt.localeCompare(a.createdAt);
      } else {
        return a.createdAt.localeCompare(b.createdAt);
      }
    });

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Write Yours Verification' }]} />

      <div className="border-b border-border/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            Write Yours Verification
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review, categorize, and verify user submissions before publication.
          </p>
        </div>
      </div>

      {/* Counters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending */}
        <div className="p-4 rounded-xl border border-border/40 bg-secondary/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Pending Moderation</span>
            <strong className="block text-xl font-black text-foreground mt-0.5">{pendingCount}</strong>
          </div>
        </div>

        {/* Approved */}
        <div className="p-4 rounded-xl border border-border/40 bg-secondary/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Approved & Live</span>
            <strong className="block text-xl font-black text-foreground mt-0.5">{approvedCount}</strong>
          </div>
        </div>

        {/* Rejected */}
        <div className="p-4 rounded-xl border border-border/40 bg-secondary/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Rejected Submissions</span>
            <strong className="block text-xl font-black text-foreground mt-0.5">{rejectedCount}</strong>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-xl border border-border/40 bg-card/45 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 px-2 rounded-lg bg-secondary/40 border border-border/50 text-[10px] font-bold text-foreground focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">Content Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="h-9 px-2 rounded-lg bg-secondary/40 border border-border/50 text-[10px] font-bold text-foreground focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="poem">Poem</option>
              <option value="story">Story</option>
              <option value="thought">Thought</option>
              <option value="quote">Quote</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">Sort By Date</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="h-9 px-2 rounded-lg bg-secondary/40 border border-border/50 text-[10px] font-bold text-foreground focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search user, title, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary/35 border border-border/50 text-[10px] font-semibold focus:outline-none focus:border-primary text-foreground"
          />
        </div>
      </div>

      {/* Submissions Table / Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-xs text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          Loading submissions...
        </div>
      ) : filteredSubmissions.length > 0 ? (
        <div className="overflow-x-auto border border-border/40 rounded-xl bg-card">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 text-[9px] font-black uppercase text-muted-foreground tracking-wider bg-secondary/20">
                <th className="p-4">User Name</th>
                <th className="p-4">Content Type</th>
                <th className="p-4">Title</th>
                <th className="p-4">Submitted Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs font-semibold text-foreground/90">
              {filteredSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="p-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] text-muted-foreground font-black">
                      {sub.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="block font-bold">{sub.userName}</span>
                      <span className="block text-[9px] text-muted-foreground">@{sub.userUsername}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-[9px] font-bold text-primary uppercase tracking-wider">
                      {sub.contentType}
                    </span>
                  </td>
                  <td className="p-4 truncate max-w-[150px]">
                    {sub.title}
                  </td>
                  <td className="p-4 text-[10px] text-muted-foreground">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {sub.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px]">
                        <HelpCircle className="w-2.5 h-2.5" />
                        Pending
                      </span>
                    ) : sub.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px]">
                        <CheckCircle className="w-2.5 h-2.5" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px]">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        if (sub.categorySlug) {
                          setCategorySlug(sub.categorySlug);
                        }
                        setRejectionReason(sub.rejectionReason || '');
                        setImprovementSuggestions(sub.improvementSuggestions || '');
                      }}
                      className="px-3 py-1 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground font-bold text-[10px] transition-all border border-border/50"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border/40 rounded-2xl p-6">
          <FileText className="w-12 h-12 text-muted-foreground/35 mx-auto mb-3 animate-pulse" />
          <p className="text-sm font-bold text-foreground">No submissions found matching filters.</p>
          <p className="text-xs text-muted-foreground">Check other status categories or clear search query.</p>
        </div>
      )}

      {/* Review Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-border/40 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-[8px] font-black text-primary uppercase tracking-widest block w-fit">
                  Review Submission
                </span>
                <h3 className="font-bold text-foreground text-sm mt-1">{selectedSub.title}</h3>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Writer Meta Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/15 border border-border/20 text-xs">
                <User className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">Submitted by: {selectedSub.userName} (@{selectedSub.userUsername})</p>
                  <p className="text-[10px] text-muted-foreground">Type: <span className="uppercase font-extrabold">{selectedSub.contentType}</span> | Date: {new Date(selectedSub.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Cover Image Preview (if present) */}
              {selectedSub.coverUrl && (
                <div className="rounded-xl overflow-hidden border border-border/40 h-40 bg-secondary/20 relative">
                  <img src={selectedSub.coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Content Body */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Content Body</label>
                <div className="p-4 rounded-xl bg-secondary/25 border border-border/40 text-sm font-serif leading-relaxed italic whitespace-pre-line text-foreground/90 max-h-60 overflow-y-auto">
                  {selectedSub.content}
                </div>
              </div>

              {/* Moderation Actions Controls (Only active for pending, or displays final actions) */}
              <div className="space-y-4 pt-4 border-t border-border/30">
                {/* Category assignment (Only for Poem and Story) */}
                {(selectedSub.contentType === 'poem' || selectedSub.contentType === 'story') && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Assign Category
                    </label>
                    <select
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value)}
                      disabled={selectedSub.status !== 'pending'}
                      className="w-full h-11 px-3 rounded-xl bg-secondary/30 border border-border/50 text-xs focus:outline-none text-foreground font-semibold"
                    >
                      {categories.map((cat) => (
                        <option key={cat.slug} value={cat.slug} className="bg-card">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rejection Reason field */}
                {selectedSub.status === 'pending' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Rejection Reason (Why it is rejected - Optional)
                      </label>
                      <textarea
                        placeholder="Explain why the writing is rejected..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={2}
                        className="w-full p-3 rounded-xl bg-secondary/30 border border-border/50 text-xs focus:outline-none focus:border-rose-500/80 text-foreground resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        What to Improve (Suggestions - Optional)
                      </label>
                      <textarea
                        placeholder="Provide feedback on what to improve..."
                        value={improvementSuggestions}
                        onChange={(e) => setImprovementSuggestions(e.target.value)}
                        rows={2}
                        className="w-full p-3 rounded-xl bg-secondary/30 border border-border/50 text-xs focus:outline-none focus:border-rose-500/80 text-foreground resize-none"
                      />
                    </div>
                  </div>
                ) : selectedSub.status === 'rejected' ? (
                  <div className="space-y-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 text-xs text-rose-300">
                    {selectedSub.rejectionReason && (
                      <div>
                        <strong className="block font-bold">Rejection Reason:</strong>
                        <p className="mt-0.5 leading-relaxed">{selectedSub.rejectionReason}</p>
                      </div>
                    )}
                    {selectedSub.improvementSuggestions && (
                      <div className="border-t border-rose-500/10 pt-2">
                        <strong className="block font-bold">What to Improve:</strong>
                        <p className="mt-0.5 leading-relaxed">{selectedSub.improvementSuggestions}</p>
                      </div>
                    )}
                  </div>
                ) : selectedSub.status === 'approved' && selectedSub.categoryName ? (
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-300">
                    <strong className="block font-bold">Approved and published under category:</strong>
                    <p className="mt-1 uppercase tracking-wider font-extrabold">{selectedSub.categoryName}</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Modal Footer (Action Buttons) */}
            <div className="p-5 border-t border-border/40 bg-secondary/15 flex gap-3 justify-end">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 h-10 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary transition-all"
              >
                Close
              </button>

              {selectedSub.status === 'pending' && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={modifying}
                    className="px-4 h-10 rounded-xl border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>

                  <button
                    onClick={handleApprove}
                    disabled={modifying}
                    className="px-5 h-10 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-primary/10"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve & Publish
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
