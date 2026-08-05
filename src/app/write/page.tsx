'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { dbService } from '@/services/db';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { Feather, Save, Globe, FolderOpen, Tag, Music } from 'lucide-react';
import { toast } from 'sonner';

export default function WritePage() {
  const { t } = useTranslation();
  const { user } = useStore();
  const router = useRouter();

  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categorySlug, setCategorySlug] = useState('life');
  const [language, setLanguage] = useState<'ta' | 'en'>('en');
  const [tags, setTags] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Unauthorized. Only administrators can publish poems.');
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    async function loadCategories() {
      const list = await dbService.getCategories();
      setCategories(list.map((c) => ({ slug: c.slug, name: c.name })));
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in title and content.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedCategory = categories.find((c) => c.slug === categorySlug);
      
      const newPoem = await dbService.createPoem({
        title: title.trim(),
        content: content.trim(),
        authorId: user.id,
        authorName: user.name,
        authorUsername: user.username,
        language,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        categorySlug,
        categoryName: selectedCategory ? selectedCategory.name : 'Life',
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        audioUrl: audioUrl.trim() || undefined,
        audioDuration: audioUrl.trim() ? '02:00' : undefined,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast.success(t('write.success'));
      router.push(`/poem/${newPoem.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to publish poem: ${err?.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Breadcrumb items={[{ label: 'Write' }]} />

      <div className="border-b border-border/40 pb-4">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Feather className="w-6 h-6 text-primary animate-pulse" />
          {t('write.title')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('write.label_title')}
          </label>
          <input
            type="text"
            required
            placeholder="Name your masterpiece..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-secondary/30 border border-border/50 text-sm focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition-all text-foreground font-bold"
          />
        </div>

        {/* Category & Language Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
              {t('write.label_category')}
            </label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full h-12 px-3 rounded-xl bg-secondary/30 border border-border/50 text-sm focus:outline-none focus:border-primary/80 text-foreground"
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug} className="bg-card">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              {t('write.label_language')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'ta' | 'en')}
              className="w-full h-12 px-3 rounded-xl bg-secondary/30 border border-border/50 text-sm focus:outline-none focus:border-primary/80 text-foreground"
            >
              <option value="en" className="bg-card">English</option>
              <option value="ta" className="bg-card">தமிழ் (Tamil)</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('write.label_content')}
          </label>
          <textarea
            required
            rows={10}
            placeholder="Type your verses here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 rounded-xl bg-secondary/30 border border-border/50 text-base focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition-all text-foreground font-serif leading-relaxed italic"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            {t('write.label_tags')}
          </label>
          <input
            type="text"
            placeholder="love, nature, rain, etc."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-secondary/30 border border-border/50 text-sm focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition-all text-foreground"
          />
        </div>

        {/* Audio URL recitation */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-primary" />
            {t('write.label_audio')}
          </label>
          <input
            type="url"
            placeholder="https://example.com/recitation.mp3"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-secondary/30 border border-border/50 text-sm focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition-all text-foreground"
          />
        </div>

        {/* Publish trigger */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-primary-foreground font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{submitting ? t('write.btn_saving') : t('write.btn_publish')}</span>
        </button>
      </form>
    </div>
  );
}
