'use client';

import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { Poem, Category } from '@/types';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import PoemCard from '@/components/poems/PoemCard';
import { Feather, Calendar, Eye, Heart, Search, Filter } from 'lucide-react';

export default function PublicPoemsPage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLanguage, setActiveLanguage] = useState<'all' | 'ta' | 'en'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadPoems() {
      try {
        const [list, categoriesList] = await Promise.all([
          dbService.getPoems('published'),
          dbService.getCategories()
        ]);
        setPoems(list);
        setCategories(categoriesList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPoems();
  }, []);

  const filtered = poems.filter(p => {
    const matchesLanguage = activeLanguage === 'all' || p.language?.toLowerCase() === activeLanguage;
    const matchesCategory = selectedCategory === 'all' || p.categorySlug === selectedCategory;
    const matchesSearch = (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.authorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesLanguage && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Breadcrumb items={[{ label: 'Poems' }]} />

      {/* Header Banner */}
      <div className="rounded-3xl border border-border/40 p-6 md:p-8 bg-gradient-to-br from-amber-950/15 via-background to-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-xs font-bold text-amber-400 border border-amber-500/20 tracking-wide uppercase">
            <Feather className="w-3.5 h-3.5" /> Poetry & Verses
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-2">
            <Feather className="w-8 h-8 text-amber-500 animate-pulse" /> Poetry Catalogue
          </h1>
          <p className="text-xs text-muted-foreground max-w-md">
            Explore classic and contemporary poems, beautiful rhymes, and verses composed by talented writers.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search poems or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary/25 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
          />
        </div>

        {/* Language Switcher Bar */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'en', 'ta'].map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLanguage(lang as any)}
              className={`h-8 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all border ${
                activeLanguage === lang
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-secondary/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              {lang === 'all' ? 'All Languages' : lang === 'ta' ? 'தமிழ்' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-1">
          <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={`h-8 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all border ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-secondary/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-secondary/40'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`h-8 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all border ${
                selectedCategory === cat.slug
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-secondary/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((poem) => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border/40 rounded-3xl p-6">
          <Feather className="w-12 h-12 text-muted-foreground/35 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">No poems found for the selected filters.</p>
        </div>
      )}
    </div>
  );
}
