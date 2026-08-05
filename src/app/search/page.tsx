'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dbService } from '@/services/db';
import { Poem, Category } from '@/types';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import PoemCard from '@/components/poems/PoemCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const [categories, setCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter conditions
  const [category, setCategory] = useState('all');
  const [language, setLanguage] = useState<'all' | 'ta' | 'en'>('all');
  const [mood, setMood] = useState('all');
  const [tag, setTag] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes' | 'views' | 'shares' | 'saves'>('newest');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      const cats = await dbService.getCategories();
      setCategories(cats);
    }
    loadData();
  }, []);

  useEffect(() => {
    async function performSearch() {
      setLoading(true);
      try {
        const resultsList = await dbService.advancedSearch({
          query: queryParam,
          category,
          language,
          mood,
          tag,
          sortBy
        });
        setResults(resultsList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [queryParam, category, language, mood, tag, sortBy]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 1) {
      const terms = ['love', 'nature', 'silence', 'rain', 'elango', 'watson', 'bharathi', 'stories'];
      const filtered = terms.filter(t => t.includes(val.toLowerCase()));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    dbService.logSearch(query.trim());
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSuggestionClick = (sug: string) => {
    setQuery(sug);
    setSuggestions([]);
    dbService.logSearch(sug);
    router.push(`/search?q=${encodeURIComponent(sug)}`);
  };

  return (
    <div className="space-y-6">
      {/* Search Input and suggestions */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
        <div className="relative">
          <Search className="absolute top-1/2 left-4 w-5 h-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by title, keywords or poet..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full h-12 pl-11 pr-24 rounded-2xl bg-secondary/45 border border-border/50 text-sm focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition-all text-foreground"
          />
          <button
            type="submit"
            className="absolute top-1/2 right-2 h-8 px-4 -translate-y-1/2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition-all"
          >
            Search
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 rounded-xl border border-border bg-card p-2 shadow-2xl z-30">
            {suggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleSuggestionClick(sug)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold hover:bg-secondary/60 text-foreground transition-all"
              >
                {sug}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Advanced Filter Panel */}
      <div className="p-5 rounded-2xl border border-border/40 bg-secondary/10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          Advanced Search Filters
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-2 rounded-lg bg-secondary/35 border border-border/40 text-xs text-foreground focus:outline-none focus:border-primary/80"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full h-10 px-2 rounded-lg bg-secondary/35 border border-border/40 text-xs text-foreground focus:outline-none focus:border-primary/80"
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="ta">Tamil</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Mood</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full h-10 px-2 rounded-lg bg-secondary/35 border border-border/40 text-xs text-foreground focus:outline-none focus:border-primary/80"
            >
              <option value="all">All Moods</option>
              <option value="philosophical">Philosophical</option>
              <option value="romantic">Romantic</option>
              <option value="uplifting">Uplifting</option>
              <option value="melancholic">Melancholic</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Tag</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full h-10 px-2 rounded-lg bg-secondary/35 border border-border/40 text-xs text-foreground focus:outline-none focus:border-primary/80"
            >
              <option value="all">All Tags</option>
              <option value="love">love</option>
              <option value="nature">nature</option>
              <option value="rain">rain</option>
              <option value="silence">silence</option>
              <option value="classic">classic</option>
            </select>
          </div>

          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-10 px-2 rounded-lg bg-secondary/35 border border-border/40 text-xs text-foreground focus:outline-none focus:border-primary/80"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="oldest">Oldest First</option>
              <option value="likes">Most Liked</option>
              <option value="views">Most Viewed</option>
              <option value="shares">Most Shared</option>
              <option value="saves">Most Bookmarked</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-b border-border/40 pb-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Search results: ({results.length} matches)
        </h2>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.length > 0 ? (
            results.map((item) => (
              <div key={item.id} className="relative">
                {item.author ? (
                  <div className="group rounded-2xl border border-border/40 glass p-5 space-y-3 flex flex-col justify-between h-full hover:border-primary/45 transition-all">
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        <span>Story</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{item.category}</span>
                      </div>
                      <Link href={`/story/${item.id}`}>
                        <h3 className="text-base font-black text-foreground hover:text-primary transition-colors mt-2">{item.title}</h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-3 leading-relaxed">{item.content}</p>
                    </div>
                    <div className="pt-3 border-t border-border/20 text-[10px] text-muted-foreground flex justify-between">
                      <span>By {item.author}</span>
                      <span>{item.readingTime} min</span>
                    </div>
                  </div>
                ) : (
                  <PoemCard poem={item} />
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-10 text-center col-span-full">
              No matching content found. Try using different filters or keywords.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Search' }]} />

      <div className="flex items-center gap-2 mb-4">
        <Search className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-black text-foreground">Advanced Search Directory</h1>
      </div>

      <Suspense fallback={<LoadingSkeleton type="card" count={2} />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
