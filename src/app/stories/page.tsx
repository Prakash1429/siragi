'use client';

import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { Story } from '@/types';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { Compass, BookOpen, Search, Filter } from 'lucide-react';
import StoryCard from '@/components/poems/StoryCard';

export default function PublicStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  useEffect(() => {
    async function loadStories() {
      try {
        const list = await dbService.getStories('published');
        setStories(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStories();
  }, []);

  const genres = ['all', ...Array.from(new Set(stories.map(s => s.genre || s.category || 'General')))];

  const filtered = stories.filter(s => {
    const matchesGenre = selectedGenre === 'all' || (s.genre || s.category || 'General').toLowerCase() === selectedGenre.toLowerCase();
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.tags && s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Breadcrumb items={[{ label: 'Stories' }]} />

      {/* Header Banner */}
      <div className="rounded-3xl border border-border/40 p-6 md:p-8 bg-gradient-to-br from-amber-950/15 via-background to-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-xs font-bold text-amber-400 border border-amber-500/20 tracking-wide uppercase">
            <BookOpen className="w-3.5 h-3.5" /> Stories & Tales
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-amber-500" /> Short Stories & Tales
          </h1>
          <p className="text-xs text-muted-foreground max-w-md">
            Dive into a collection of interesting short stories, thriller narratives, drama, and inspiring tales.
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
            placeholder="Search stories or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary/25 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
          />
        </div>
      </div>

      {/* Genre filters */}
      {genres.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-1">
          <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`h-8 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all border ${
                selectedGenre.toLowerCase() === g.toLowerCase()
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-secondary/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              {g === 'all' ? 'All Genres' : g}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border/40 rounded-3xl p-6">
          <BookOpen className="w-12 h-12 text-muted-foreground/35 mx-auto mb-3" />
          <p className="text-base font-bold text-foreground">No stories found matching your criteria.</p>
          <p className="text-xs text-muted-foreground">Try adjusting your search query or selected genre filter.</p>
        </div>
      )}
    </div>
  );
}
