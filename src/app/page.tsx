'use client';

import { useEffect, useState } from 'react';
import Hero from '@/components/home/Hero';
import CategoryCard from '@/components/home/CategoryCard';
import PoemCard from '@/components/poems/PoemCard';
import TrendingCard from '@/components/home/TrendingCard';
import LatestUploadCard, { LatestUploadItem } from '@/components/home/LatestUploadCard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { dbService } from '@/services/db';
import { Poem, Category, Story, Quote } from '@/types';
import { 
  Sparkles, ArrowRight, BookOpen, Quote as QuoteIcon, Headphones, Users, 
  Feather, Award, Heart, MessageSquare, Eye, Share2, BookOpenCheck,
  Search, X, AlertCircle, TrendingUp, MousePointerClick
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import CountUp from '@/components/shared/CountUp';

export default function HomePage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [latestUploads, setLatestUploads] = useState<LatestUploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBlinkingCursor, setShowBlinkingCursor] = useState(false);

  useEffect(() => {
    const handleHashCheck = () => {
      if (window.location.hash === '#write-yours') {
        const el = document.getElementById('write-yours');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setShowBlinkingCursor(true);
        setTimeout(() => {
          setShowBlinkingCursor(false);
        }, 3000);
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [poemsList, storiesList, categoriesList, quotesList, latestList] = await Promise.all([
          dbService.getPoems('published'),
          dbService.getStories('published'),
          dbService.getCategories(),
          dbService.getQuotes('published'),
          dbService.getLatestUploads()
        ]);
        setPoems(poemsList);
        setStories(storiesList);
        setCategories(categoriesList);
        setQuotes(quotesList);
        setLatestUploads(latestList);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);


  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const trendingPoems = [...poems].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 4);
  const popularStories = [...stories].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 3);
  const popularPoems = [...poems].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 3);

  const totalViews = poems.reduce((sum, p) => sum + p.viewsCount, 0) + stories.reduce((sum, s) => sum + (s.viewsCount || 0), 0) + quotes.reduce((sum, q) => sum + (q.viewsCount || 0), 0);
  const totalLikes = poems.reduce((sum, p) => sum + p.likesCount, 0) + stories.reduce((sum, s) => sum + s.likesCount, 0) + quotes.reduce((sum, q) => sum + (q.likesCount || 0), 0);

  // Real-time search filtering logic
  const query = searchQuery.trim().toLowerCase();
  const matchesPoem = poems.filter(p => {
    const titleMatch = p.title.toLowerCase().includes(query);
    const catMatch = p.categoryName.toLowerCase().includes(query);
    const tagMatch = p.tags && p.tags.some(t => t.toLowerCase().includes(query));
    return titleMatch || catMatch || tagMatch;
  });

  const matchesStory = stories.filter(s => {
    const titleMatch = s.title.toLowerCase().includes(query);
    const catMatch = s.category ? s.category.toLowerCase().includes(query) : false;
    const tagMatch = s.tags && s.tags.some(t => t.toLowerCase().includes(query));
    return titleMatch || catMatch || tagMatch;
  });

  // Sort to display titles starting with search query at the top
  const sortResults = (list: any[]) => {
    return [...list].sort((a, b) => {
      const aTitle = (a.title || '').toLowerCase();
      const bTitle = (b.title || '').toLowerCase();
      const aStarts = aTitle.startsWith(query);
      const bStarts = bTitle.startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });
  };

  const filteredPoems = query ? sortResults(matchesPoem) : [];
  const filteredStories = query ? sortResults(matchesStory) : [];

  if (loading) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  return (
    <div className="space-y-16">
      {/* 1. Hero Banner */}
      <Hero />

      {/* 2. Search Bar Section */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search poems and stories by title, category, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-12 rounded-2xl bg-secondary/20 border border-border/40 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60 transition-all shadow-md backdrop-blur-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary/40 rounded-full transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {searchQuery.trim() ? (
        /* Render Search Results */
        <section className="space-y-8 animate-in fade-in duration-300">
          <div className="border-b border-border/40 pb-4">
            <h3 className="text-lg font-black text-foreground">
              Search Results for &ldquo;{searchQuery}&rdquo;
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Found {filteredPoems.length} poems and {filteredStories.length} stories
            </p>
          </div>

          {filteredPoems.length === 0 && filteredStories.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border/40 rounded-3xl max-w-xl mx-auto p-6 space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-500/60 mx-auto animate-bounce" />
              <p className="text-base font-bold text-foreground">No poems or stories found.</p>
              <p className="text-xs text-muted-foreground">Try checking your spelling or search for another keyword.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Matching Poems */}
              {filteredPoems.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-foreground flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <Feather className="w-4.5 h-4.5 text-primary" />
                    Poems ({filteredPoems.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredPoems.map((poem) => (
                      <PoemCard key={poem.id} poem={poem} />
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Stories */}
              {filteredStories.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-foreground flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <BookOpenCheck className="w-4.5 h-4.5 text-emerald-400" />
                    Stories ({filteredStories.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStories.map((story) => (
                      <motion.article
                        key={story.id}
                        whileHover={{ y: -4 }}
                        className="group rounded-2xl border border-border/40 glass overflow-hidden flex flex-col justify-between"
                      >
                        <Link href={`/story/${story.id}`} onClick={() => dbService.incrementViews(story.id, 'story')} className="block select-none cursor-pointer text-left">
                          <div className="h-32 bg-secondary relative overflow-hidden">
                            <img src={story.coverUrl || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600'} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                          </div>
                          <div className="p-4 space-y-2">
                            <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{story.title}</h4>
                            <p className="text-[10px] text-muted-foreground line-clamp-2">{story.content}</p>
                          </div>
                        </Link>
                        <div className="p-4 pt-0 border-t border-border/20 mt-auto flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>By {story.author}</span>
                          <span>{story.readingTime} min</span>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* 3. Poetry & Stories Categories */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Explore Categories
              </h2>
              <Link href="/categories" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>

          {/* Trending Poems */}
          {trendingPoems.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                  Trending Poems
                </h2>
                <Link href="/trending" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingPoems.map((poem, index) => (
                  <TrendingCard key={poem.id} poem={poem} index={index} />
                ))}
              </div>
            </section>
          )}

          {/* Write Yours CTA Section */}
          <section id="write-yours" className="p-6 md:p-8 rounded-3xl glass-card gradient-border flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="space-y-2 relative z-10 text-left">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-[9px] font-bold text-amber-500 border border-amber-500/20 uppercase tracking-widest">
                <Feather className="w-3 h-3 text-amber-500" /> Share Your Voice
              </span>
              <h2 className="text-xl md:text-2xl font-black text-foreground">Write Yours</h2>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                Are you an aspiring writer? Share your poetry, short stories, thoughts, or quotes with our growing community. Submissions undergo a quick verification check and are published after approval.
              </p>
            </div>
            
            <div className="relative shrink-0">
              <Link 
                href="/write-yours"
                className="h-11 px-6 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/15 shrink-0 z-10"
              >
                <Feather className="w-3.5 h-3.5" />
                Write Yours
              </Link>

              {/* Blinking hand cursor overlay guide */}
              {showBlinkingCursor && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 15, x: 15 }}
                  animate={{
                    opacity: [0, 1, 0.3, 1, 0],
                    scale: [0.8, 1.25, 0.9, 1.25, 0.8],
                    y: [15, 0, 8, 0, 15],
                    x: [15, 0, 8, 0, 15]
                  }}
                  transition={{ duration: 2.2, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] }}
                  className="absolute -bottom-3 -right-3 text-amber-400 bg-slate-950/85 p-1.5 rounded-full border border-amber-500/40 shadow-xl pointer-events-none z-30 flex items-center justify-center"
                >
                  <MousePointerClick className="w-5 h-5 animate-pulse" />
                </motion.div>
              )}
            </div>
          </section>

          {/* Latest Uploads */}
          {/* 3. Latest Releases */}
          <section className="space-y-6">
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Latest Releases
            </h2>
            {latestUploads.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestUploads.map((item) => (
                  <LatestUploadCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border/40 rounded-3xl p-6">
                <Feather className="w-10 h-10 text-muted-foreground/35 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No new uploads in the last 24 hours. Check back later!</p>
              </div>
            )}
          </section>

          {/* 4. Popular Short Stories */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-emerald-400" />
                Popular Short Stories
              </h2>
              <Link href="/stories" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Browse Stories <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {popularStories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {popularStories.map((story) => (
                  <motion.article
                    key={story.id}
                    whileHover={{ y: -4 }}
                    className="group rounded-2xl border border-border/40 glass overflow-hidden flex flex-col justify-between"
                  >
                    <Link href={`/story/${story.id}`} onClick={() => dbService.incrementViews(story.id, 'story')} className="block select-none cursor-pointer text-left">
                      <div className="h-32 bg-secondary relative overflow-hidden">
                        <img src={story.coverUrl || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600'} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{story.title}</h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{story.content}</p>
                      </div>
                    </Link>
                    <div className="p-4 pt-0 border-t border-border/20 mt-auto flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>By {story.author}</span>
                      <span>{story.readingTime} min</span>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border/40 rounded-3xl p-6">
                <BookOpenCheck className="w-10 h-10 text-muted-foreground/35 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No stories published yet.</p>
              </div>
            )}
          </section>

          {/* Popular Poems */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <Feather className="w-5 h-5 text-purple-400" />
                Popular Poems
              </h2>
              <Link href="/poems" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Browse Poems <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {popularPoems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {popularPoems.map((poem) => (
                  <PoemCard key={poem.id} poem={poem} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border/40 rounded-3xl p-6">
                <Feather className="w-10 h-10 text-muted-foreground/35 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No poems published yet.</p>
              </div>
            )}
          </section>

          {/* 4.5 Thoughts & Quotes */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <QuoteIcon className="w-5 h-5 text-pink-500" />
                Thoughts & Quotes
              </h2>
              <Link href="/quotes" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Browse Thoughts & Quotes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {quotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quotes.slice(0, 4).map((quote) => (
                  <motion.article
                    key={quote.id}
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-2xl border border-border/40 bg-secondary/10 flex flex-col justify-between space-y-4 hover:border-pink-500/30 transition-all duration-300 relative overflow-hidden"
                  >
                    <Link href={`/quote/${quote.id}`} className="block select-none cursor-pointer text-left h-full flex flex-col justify-between">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-500/5 to-transparent rounded-bl-full pointer-events-none" />
                      <div className="space-y-2 relative z-10">
                        <span className="block text-[32px] text-pink-500/20 font-serif leading-none h-6">&ldquo;</span>
                        <p className="text-sm font-bold text-foreground font-serif leading-relaxed pl-4 line-clamp-3">
                          {quote.content}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-border/10 flex items-center justify-between text-[11px] text-muted-foreground relative z-10 mt-4">
                        <span className="font-semibold italic">— {quote.author}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-rose-500/80" /> {quote.likesCount}
                          </span>
                          {quote.category && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                              {quote.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border/40 rounded-3xl p-6">
                <QuoteIcon className="w-10 h-10 text-muted-foreground/35 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No thoughts or quotes published yet.</p>
              </div>
            )}
          </section>
        </>
      )}

      {/* 5. Statistics Counter */}
      <section className="p-8 rounded-3xl glass border border-border/40 space-y-6">
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest text-muted-foreground text-center">
          Siragii Platform Activity Metrics
        </h3>
        <div className="grid grid-cols-1 min-[450px]:grid-cols-3 gap-4 min-[450px]:gap-6 text-center">
          <div className="p-4 rounded-2xl bg-secondary/20">
            <strong className="block text-xl md:text-2xl font-black text-foreground">
              <CountUp end={poems.length} />
            </strong>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Total Poems</span>
          </div>
          <div className="p-4 rounded-2xl bg-secondary/20">
            <strong className="block text-xl md:text-2xl font-black text-foreground">
              <CountUp end={stories.length} />
            </strong>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Total Stories</span>
          </div>
          <div className="p-4 rounded-2xl bg-secondary/20">
            <strong className="block text-xl md:text-2xl font-black text-foreground">
              <CountUp end={quotes.length} />
            </strong>
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Total Quotes</span>
          </div>
        </div>
      </section>

    </div>
  );
}
