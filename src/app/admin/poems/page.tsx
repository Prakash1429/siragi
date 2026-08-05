'use client';

import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { Poem } from '@/types';
import { Plus, Trash2, Edit3, Eye, Feather, Search, Calendar, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPoemsPage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form states for creating/editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoemId, setEditingPoemId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [authorName, setAuthorName] = useState('Admin');
  const [categoryName, setCategoryName] = useState('Life');
  const [language, setLanguage] = useState<'ta' | 'en'>('en');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'published' | 'draft' | 'pending'>('published');
  const [publishSchedule, setPublishSchedule] = useState('');

  // Preview Mode
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const loadPoems = async () => {
    try {
      const pub = await dbService.getPoems('published');
      const drf = await dbService.getPoems('draft');
      const pen = await dbService.getPoems('pending');
      setPoems([...pub, ...drf, ...pen]);
    } catch (err) {
      toast.error('Failed to load poems.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoems();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and Content are required.');
      return;
    }

    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');

    const poemData = {
      title,
      subtitle,
      content,
      authorId: 'admin-id',
      authorName,
      authorUsername: 'admin',
      language,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      categorySlug,
      categoryName,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      status,
      publishSchedule: publishSchedule || undefined,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingTime: Math.max(1, Math.ceil(content.split(/\s+/).length / 120))
    };

    try {
      if (editingPoemId) {
        await dbService.updatePoem(editingPoemId, poemData);
        toast.success('Poem updated successfully.');
      } else {
        await dbService.createPoem(poemData);
        toast.success('Poem added successfully.');
      }
      setIsModalOpen(false);
      resetForm();
      loadPoems();
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to save poem: ${err?.message || err}`);
    }
  };

  const handleEdit = (poem: Poem) => {
    setEditingPoemId(poem.id);
    setTitle(poem.title);
    setSubtitle(poem.subtitle || '');
    setAuthorName(poem.authorName);
    setCategoryName(poem.categoryName);
    setLanguage(poem.language);
    setContent(poem.content);
    setCoverUrl(poem.coverUrl || '');
    setTags(poem.tags.join(', '));
    setStatus(poem.status);
    setPublishSchedule(poem.publishSchedule || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this poem?')) return;
    try {
      await dbService.deletePoem(id);
      toast.success('Poem deleted.');
      loadPoems();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const resetForm = () => {
    setEditingPoemId(null);
    setTitle('');
    setSubtitle('');
    setAuthorName('Admin');
    setCategoryName('Life');
    setLanguage('en');
    setContent('');
    setCoverUrl('');
    setTags('');
    setStatus('published');
    setPublishSchedule('');
    setIsPreviewMode(false);
  };

  const filtered = poems.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
          <Feather className="w-5 h-5 text-primary" />
          Manage Poems
        </h2>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Poem</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search poems by title or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none text-foreground"
        />
      </div>

      {/* Poem grid list */}
      {loading ? (
        <div className="text-center py-10 text-xs text-muted-foreground animate-pulse">Loading poems...</div>
      ) : filtered.length > 0 ? (
        <div className="border border-border/40 rounded-2xl overflow-hidden glass">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/45 border-b border-border/40 text-muted-foreground font-bold">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Language</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map(poem => (
                <tr key={poem.id} className="hover:bg-secondary/15 transition-all">
                  <td className="p-4 font-bold text-foreground">
                    <div>{poem.title}</div>
                    <div className="text-[10px] text-muted-foreground font-normal">By {poem.authorName}</div>
                  </td>
                  <td className="p-4">{poem.categoryName}</td>
                  <td className="p-4 uppercase">{poem.language}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      poem.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {poem.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(poem)}
                      className="p-1.5 hover:bg-secondary rounded-lg text-primary transition-all"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(poem.id)}
                      className="p-1.5 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border/40 rounded-3xl p-6">
          <Feather className="w-12 h-12 text-muted-foreground/35 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">No poems uploaded. Click add poem to start fresh!</p>
        </div>
      )}

      {/* Create / Edit Modal with Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl rounded-2xl glass border border-border/40 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-sm font-bold text-foreground">
                {editingPoemId ? 'Edit Poem' : 'Add New Poem'}
              </h3>
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="px-3 py-1 bg-secondary hover:bg-secondary/80 text-[10px] font-bold rounded-lg"
              >
                {isPreviewMode ? 'Back to Editor' : 'Live Preview'}
              </button>
            </div>

            {isPreviewMode ? (
              <div className="space-y-4 py-4 text-center">
                {coverUrl && (
                  <img src={coverUrl} alt="Cover" className="w-full h-40 object-cover rounded-xl mb-4" />
                )}
                <h1 className="text-xl font-black text-foreground">{title || 'Poem Title'}</h1>
                <p className="text-xs text-muted-foreground italic">{subtitle}</p>
                <div className="poem-text text-sm italic text-foreground max-w-md mx-auto whitespace-pre-line leading-relaxed font-serif pt-4">
                  {content || 'Poem content goes here...'}
                </div>
                <div className="text-[10px] text-muted-foreground pt-4 border-t border-border/20">
                  By {authorName} | Language: {language === 'ta' ? 'Tamil' : 'English'}
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateOrUpdate} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-secondary/35 border border-border/50 text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Subtitle (Optional)</label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-secondary/35 border border-border/50 text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Author</label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-secondary/35 border border-border/50 text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Category</label>
                    <select
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-secondary/35 border border-border/50 text-foreground"
                    >
                      <option value="Love">Love</option>
                      <option value="Breakup">Breakup</option>
                      <option value="Motivation">Motivation</option>
                      <option value="Friendship">Friendship</option>
                      <option value="Life">Life</option>
                      <option value="Family">Family</option>
                      <option value="Nature">Nature</option>
                      <option value="Emotional">Emotional</option>
                      <option value="Inspirational">Inspirational</option>
                      <option value="Sad">Sad</option>
                      <option value="Festival">Festival</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-lg bg-secondary/35 border border-border/50 text-foreground"
                    >
                      <option value="en">English</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Cover Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-secondary/35 border border-border/50 text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Poem Content</label>
                  <textarea
                    rows={5}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 rounded-lg bg-secondary/35 border border-border/50 text-foreground font-serif leading-relaxed text-sm italic"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="love, rain"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-secondary/35 border border-border/50 text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-lg bg-secondary/35 border border-border/50 text-foreground"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="pending">Pending/Scheduled</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Publish Schedule
                    </label>
                    <input
                      type="date"
                      value={publishSchedule}
                      onChange={(e) => setPublishSchedule(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-secondary/35 border border-border/50 text-foreground"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-border/40 hover:bg-secondary/40 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl font-bold"
                  >
                    Save Poem
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
