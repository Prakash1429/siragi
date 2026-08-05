'use client';

import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { Quote } from '@/types';
import { Plus, Trash2, Edit3, Quote as QuoteIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form states for creating/editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [category, setCategory] = useState('General');
  const [contentType, setContentType] = useState<'thought' | 'quote'>('quote');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  const loadQuotes = async () => {
    try {
      const pub = await dbService.getQuotes('published');
      const drf = await dbService.getQuotes('draft');
      setQuotes([...pub, ...drf]);
    } catch (err) {
      toast.error('Failed to load thoughts & quotes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Quote content is required.');
      return;
    }

    const quoteData = {
      content,
      author: author.trim() || 'Anonymous',
      category: contentType,
      genre: category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      status,
      createdAt: new Date().toISOString()
    };

    try {
      if (editingQuoteId) {
        await dbService.updateQuote(editingQuoteId, quoteData);
        toast.success('Quote updated successfully.');
      } else {
        await dbService.saveQuote(quoteData);
        toast.success('Quote added successfully.');
      }
      setIsModalOpen(false);
      resetForm();
      loadQuotes();
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to save quote: ${err?.message || err}`);
    }
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuoteId(quote.id);
    setContent(quote.content);
    setAuthor(quote.author);
    setContentType(quote.category || 'quote');
    setCategory(quote.genre || 'General');
    setTags(quote.tags ? quote.tags.join(', ') : '');
    setStatus(quote.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    try {
      await dbService.deleteQuote(id);
      toast.success('Quote deleted.');
      loadQuotes();
    } catch {
      toast.error('Failed to delete quote.');
    }
  };

  const resetForm = () => {
    setEditingQuoteId(null);
    setContent('');
    setAuthor('Admin');
    setCategory('General');
    setContentType('quote');
    setTags('');
    setStatus('published');
  };

  const filteredQuotes = quotes.filter(q => 
    q.content.toLowerCase().includes(search.toLowerCase()) || 
    q.author.toLowerCase().includes(search.toLowerCase()) ||
    (q.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <QuoteIcon className="w-6 h-6 text-pink-500" />
            Thoughts & Quotes Management
          </h1>
          <p className="text-xs text-muted-foreground">Create, edit, draft and delete thoughts & quotes modules.</p>
        </div>

        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="h-10 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-pink-500/20 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Quote</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center gap-3 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search thoughts, authors or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
          />
        </div>
      </div>

      {/* Quotes Listing */}
      {loading ? (
        <div className="text-center py-20 text-xs text-muted-foreground animate-pulse">Loading thoughts & quotes...</div>
      ) : filteredQuotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className="p-5 rounded-2xl border border-border/40 bg-card/60 flex flex-col justify-between space-y-4 hover:border-pink-500/20 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                  quote.status === 'published' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {quote.status}
                </span>
              </div>

              <div className="space-y-2">
                <span className="block text-2xl text-pink-500/20 font-serif leading-none">&ldquo;</span>
                <p className="text-xs font-bold font-serif text-foreground leading-relaxed pl-3 line-clamp-3">
                  {quote.content}
                </p>
              </div>

              <div className="pt-3 border-t border-border/20 flex items-center justify-between text-[10px] text-muted-foreground">
                <div>
                  <span className="font-semibold italic">— {quote.author}</span>
                  {(quote.category || quote.genre) && (
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-secondary text-[8px] font-mono capitalize">
                      {quote.category} {quote.genre ? `(${quote.genre})` : ''}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(quote)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(quote.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border/40 rounded-3xl p-6">
          <QuoteIcon className="w-12 h-12 text-muted-foreground/35 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">No thoughts or quotes found.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl z-10 relative overflow-hidden"
            >
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4">
                {editingQuoteId ? '✏️ Edit Quote' : '✨ Add New Quote'}
              </h3>

              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                {/* Quote Content */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Quote Content</label>
                  <textarea
                    required
                    placeholder="Enter the quote text or micro-thought..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Content Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Type</label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
                    >
                      <option value="quote">Quote</option>
                      <option value="thought">Thought</option>
                    </select>
                  </div>

                  {/* Author */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Author</label>
                    <input
                      type="text"
                      placeholder="e.g. Bharathiyar"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Life, Tamil"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Tags */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. hope, tamil, motivation"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-border/20">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 px-4 rounded-xl border border-border hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all shadow-lg shadow-pink-500/25 cursor-pointer"
                  >
                    {editingQuoteId ? 'Save Changes' : 'Add Quote'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
