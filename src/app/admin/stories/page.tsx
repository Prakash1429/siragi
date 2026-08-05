'use client';

import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { Story } from '@/types';
import { Plus, Trash2, Edit3, Eye, FileText, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form states for creating/editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [category, setCategory] = useState('stories');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  const loadStories = async () => {
    try {
      const pub = await dbService.getStories('published');
      const drf = await dbService.getStories('draft');
      setStories([...pub, ...drf]);
    } catch (err) {
      toast.error('Failed to load stories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and Content are required.');
      return;
    }

    const storyData = {
      title,
      subtitle,
      author,
      category: 'story' as const,
      genre: category,
      content,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      status,
      createdAt: new Date().toISOString(),
      readingTime: Math.max(1, Math.ceil(content.split(/\s+/).length / 180))
    };

    try {
      if (editingStoryId) {
        await dbService.updateStory(editingStoryId, storyData);
        toast.success('Story updated successfully.');
      } else {
        await dbService.createStory(storyData);
        toast.success('Story added successfully.');
      }
      setIsModalOpen(false);
      resetForm();
      loadStories();
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to save story: ${err?.message || err}`);
    }
  };

  const handleEdit = (story: Story) => {
    setEditingStoryId(story.id);
    setTitle(story.title);
    setSubtitle(story.subtitle || '');
    setAuthor(story.author);
    setCategory(story.genre || 'stories');
    setContent(story.content);
    setCoverUrl(story.coverUrl || '');
    setTags(story.tags.join(', '));
    setStatus(story.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    try {
      await dbService.deleteStory(id);
      toast.success('Story deleted.');
      loadStories();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const resetForm = () => {
    setEditingStoryId(null);
    setTitle('');
    setSubtitle('');
    setAuthor('Admin');
    setCategory('stories');
    setContent('');
    setCoverUrl('');
    setTags('');
    setStatus('published');
  };

  const filtered = stories.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Manage Stories
        </h2>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Story</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search stories by title or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none text-foreground"
        />
      </div>

      {/* Story grid list */}
      {loading ? (
        <div className="text-center py-10 text-xs text-muted-foreground animate-pulse">Loading stories...</div>
      ) : filtered.length > 0 ? (
        <div className="border border-border/40 rounded-2xl overflow-hidden glass">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/45 border-b border-border/40 text-muted-foreground font-bold">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map(story => (
                <tr key={story.id} className="hover:bg-secondary/15 transition-all">
                  <td className="p-4 font-bold text-foreground">
                    <div>{story.title}</div>
                    <div className="text-[10px] text-muted-foreground font-normal">By {story.author}</div>
                  </td>
                  <td className="p-4 capitalize">{story.genre || story.category}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      story.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {story.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(story)}
                      className="p-1.5 hover:bg-secondary rounded-lg text-primary transition-all"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
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
          <FileText className="w-12 h-12 text-muted-foreground/35 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">No stories uploaded. Click add story to start fresh!</p>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl rounded-2xl glass border border-border/40 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-sm font-bold text-foreground">
              {editingStoryId ? 'Edit Story' : 'Add New Story'}
            </h3>

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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Author</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-secondary/35 border border-border/50 text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Category</label>
                  <input
                    type="text"
                    readOnly
                    value="stories"
                    className="w-full h-10 px-3 rounded-lg bg-secondary/15 border border-border/50 text-muted-foreground cursor-not-allowed select-none"
                  />
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
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Content</label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 rounded-lg bg-secondary/35 border border-border/50 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="tag1, tag2"
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
                  </select>
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
                  Save Story
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
