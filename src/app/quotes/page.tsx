'use client';

import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { Quote } from '@/types';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { useStore } from '@/store/useStore';
import { Quote as QuoteIcon, Heart, MessageCircle, Share2, Sparkles, Filter, Search, Eye, FolderHeart } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import AddToCollectionModal from '@/components/shared/AddToCollectionModal';

export default function PublicQuotesPage() {
  const { user } = useStore();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedMap, setLikedMap] = useState<{ [quoteId: string]: boolean }>({});
  const [favoritesMap, setFavoritesMap] = useState<{ [quoteId: string]: boolean }>({});
  const [showCollectionModal, setShowCollectionModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function loadQuotes() {
      try {
        const list = await dbService.getQuotes('published');
        setQuotes(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadQuotes();
  }, []);

  useEffect(() => {
    if (user && quotes.length > 0) {
      const checkLikesAndFavs = async () => {
        const tempLikes: { [quoteId: string]: boolean } = {};
        const tempFavs: { [quoteId: string]: boolean } = {};
        for (const q of quotes) {
          const liked = await dbService.hasLiked(q.id, user.id);
          const faved = await dbService.hasFavorited(q.id, user.id);
          tempLikes[q.id] = liked;
          tempFavs[q.id] = faved;
        }
        setLikedMap(tempLikes);
        setFavoritesMap(tempFavs);
      };
      checkLikesAndFavs();
    }
  }, [quotes, user]);

  const handleLike = async (quoteId: string) => {
    if (!user) {
      toast.error('Please configure your username to like thoughts.');
      return;
    }
    try {
      const liked = await dbService.likeContent(quoteId, 'quote', user.id);
      setLikedMap((prev) => ({ ...prev, [quoteId]: liked }));
      setQuotes((prev) =>
        prev.map((q) => {
          if (q.id === quoteId) {
            return {
              ...q,
              likesCount: liked ? q.likesCount + 1 : Math.max(0, q.likesCount - 1),
            };
          }
          return q;
        })
      );
      toast.success(liked ? 'Added to liked thoughts' : 'Removed from liked thoughts');
    } catch {
      toast.error('Failed to toggle like.');
    }
  };

  const handleFavorite = async (quoteId: string) => {
    if (!user) {
      toast.error('Please configure your username to save thoughts.');
      return;
    }
    try {
      const faved = await dbService.favoriteQuote(quoteId, user.id);
      setFavoritesMap((prev) => ({ ...prev, [quoteId]: faved }));
      toast.success(faved ? 'Added to favorites' : 'Removed from favorites');
    } catch {
      toast.error('Failed to update favorite status.');
    }
  };

  const handleShare = async (quote: Quote) => {
    try {
      await dbService.incrementShares(quote.id, 'quote');
    } catch (err) {
      console.error(err);
    }
    if (navigator.share) {
      navigator.share({
        title: `Quote by ${quote.author}`,
        text: `"${quote.content}" — ${quote.author}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`"${quote.content}" — ${quote.author}`);
      toast.success('Quote copied to clipboard!');
    }
  };

  // Unique categories list
  const categories = ['all', ...Array.from(new Set(quotes.map((q) => q.category || 'General')))];

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (q.category || 'General') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Breadcrumb items={[{ label: 'Thoughts & Quotes' }]} />

      {/* Header Banner */}
      <div className="rounded-3xl border border-border/40 p-6 md:p-8 bg-gradient-to-br from-amber-950/15 via-background to-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-xs font-bold text-amber-400 border border-amber-500/20 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Thoughts & Sayings
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-2">
            <QuoteIcon className="w-8 h-8 text-amber-500" /> Thoughts & Quotes
          </h1>
          <p className="text-xs text-muted-foreground max-w-md">
            Explore and share beautiful verses, micro-thoughts, and daily quotes from classic and contemporary writers.
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
            placeholder="Search thoughts or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary/25 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
          />
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0 hidden sm:inline" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`h-8 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all border ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-secondary/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : filteredQuotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredQuotes.map((quote) => {
              const isLiked = likedMap[quote.id] || false;
              return (
                <motion.article
                  key={quote.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group p-6 rounded-2xl glass-card gradient-border flex flex-col justify-between space-y-4 relative overflow-hidden h-[280px]"
                >
                  <Link href={`/quote/${quote.id}`} onClick={() => dbService.incrementViews(quote.id, 'quote')} className="block select-none cursor-pointer text-left h-full flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
                    
                    {/* Floating Action Icons */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!user) {
                            toast.error('Please configure your username first.');
                            return;
                          }
                          setShowCollectionModal(quote.id);
                        }}
                        className="p-1.5 rounded-full bg-slate-950/40 backdrop-blur-sm border border-white/10 text-white hover:text-primary hover:scale-110 active:scale-95 transition-all shadow-md"
                        title="Add to Collection"
                      >
                        <FolderHeart className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFavorite(quote.id);
                        }}
                        className="p-1.5 rounded-full bg-slate-950/40 backdrop-blur-sm border border-white/10 text-white hover:text-rose-500 hover:scale-110 active:scale-95 transition-all shadow-md"
                        title={favoritesMap[quote.id] ? "Remove from Library" : "Save to Library"}
                      >
                        <Heart className={`w-3.5 h-3.5 transition-all duration-300 ${favoritesMap[quote.id] ? 'fill-rose-500 text-rose-500 animate-bounce' : 'text-white fill-transparent'}`} />
                      </button>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <span className="block text-[44px] text-primary/15 font-serif leading-none h-6">&ldquo;</span>
                      <p className="text-base font-bold text-foreground font-serif leading-relaxed pl-4 line-clamp-3">
                        {quote.content}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/10 flex items-center justify-between text-[11px] text-muted-foreground relative z-10 mt-auto">
                      <span className="font-semibold italic">— {quote.author}</span>
                      <div className="flex items-center gap-1 text-[10px]">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground/75" />
                        <span>{quote.viewsCount || 0}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="pt-2 border-t border-border/10 flex items-center justify-between text-[11px] text-muted-foreground relative z-10">
                    <div className="flex items-center gap-3 w-full justify-end">
                      {/* Like button */}
                      <button
                        onClick={() => handleLike(quote.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                          isLiked
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 font-bold'
                            : 'bg-secondary/35 border-border/40 hover:bg-rose-500/5 hover:text-rose-400'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{quote.likesCount}</span>
                      </button>

                      {/* Share button */}
                      <button
                        onClick={() => handleShare(quote)}
                        className="p-1.5 rounded-full bg-secondary/35 border border-border/40 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                        aria-label="Share Quote"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {quote.category && (
                        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-[9px] font-bold text-primary border border-primary/20 uppercase tracking-wider">
                          {quote.category}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border/40 rounded-3xl p-6">
          <QuoteIcon className="w-12 h-12 text-muted-foreground/35 mx-auto mb-3 animate-pulse" />
          <p className="text-base font-bold text-foreground">No thoughts or quotes match your search.</p>
          <p className="text-xs text-muted-foreground">Try clearing filters or search for another author name.</p>
        </div>
      )}

      {showCollectionModal && (
        <AddToCollectionModal
          itemId={showCollectionModal}
          itemType="quote"
          onClose={() => setShowCollectionModal(null)}
        />
      )}
    </div>
  );
}
