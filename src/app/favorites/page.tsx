'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { dbService } from '@/services/db';
import { Poem, Story, Quote } from '@/types';
import PoemCard from '@/components/poems/PoemCard';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { Bookmark, Heart, FolderHeart, Eye, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import StoryCard from '@/components/poems/StoryCard';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AddToCollectionModal from '@/components/shared/AddToCollectionModal';

export default function FavoritesPage() {
  const { user } = useStore();
  const router = useRouter();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [activeTab, setActiveTab] = useState<'poems' | 'stories' | 'quotes'>('poems');
  const [likedMap, setLikedMap] = useState<{ [quoteId: string]: boolean }>({});
  const [showCollectionModal, setShowCollectionModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error('Please configure your username first.');
      router.push('/');
      return;
    }

    async function loadFavorites() {
      if (!user) return;
      try {
        const [allPoems, allStories, allQuotes] = await Promise.all([
          dbService.getPoems('published'),
          dbService.getStories('published'),
          dbService.getQuotes('published')
        ]);
        
        // Filter poems that the user favorited
        const favPoems: Poem[] = [];
        for (const p of allPoems) {
          const isFav = await dbService.hasFavorited(p.id, user.id);
          if (isFav) favPoems.push(p);
        }
        setPoems(favPoems);

        // Filter stories that the user favorited
        const favStories: Story[] = [];
        for (const s of allStories) {
          const isFav = await dbService.hasFavorited(s.id, user.id);
          if (isFav) favStories.push(s);
        }
        setStories(favStories);

        // Filter quotes that the user favorited
        const favQuotes: Quote[] = [];
        const tempLikes: { [quoteId: string]: boolean } = {};
        for (const q of allQuotes) {
          const isFav = await dbService.hasFavorited(q.id, user.id);
          if (isFav) {
            favQuotes.push(q);
            const liked = await dbService.hasLiked(q.id, user.id);
            tempLikes[q.id] = liked;
          }
        }
        setQuotes(favQuotes);
        setLikedMap(tempLikes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, [user, router]);

  const handleLike = async (quoteId: string) => {
    if (!user) return;
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
    } catch {
      toast.error('Failed to toggle like.');
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
        url: `${window.location.origin}/quote/${quote.id}`,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`"${quote.content}" — ${quote.author}`);
      toast.success('Quote copied to clipboard!');
    }
  };

  const handleFavorite = async (quoteId: string) => {
    if (!user) return;
    try {
      const faved = await dbService.favoriteQuote(quoteId, user.id);
      if (!faved) {
        setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
        toast.success('Removed from favorites');
      }
    } catch {
      toast.error('Failed to update favorite status.');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Favorites' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-500 fill-amber-500/10" />
            My Bookmarks & Favorites
          </h1>
          <p className="text-xs text-muted-foreground">
            Your curated lists of saved poetry recitations and short tales.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-secondary/30 p-0.5 rounded-lg border border-border/30 text-[10px] font-bold self-start">
          <button
            onClick={() => setActiveTab('poems')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'poems' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Poems ({poems.length})
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'stories' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Stories ({stories.length})
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'quotes' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Thoughts & Quotes ({quotes.length})
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : activeTab === 'poems' ? (
        /* Poems Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {poems.length > 0 ? (
            poems.map((poem) => <PoemCard key={poem.id} poem={poem} />)
          ) : (
            <p className="text-sm text-muted-foreground py-10 text-center col-span-full">
              You haven&apos;t favorited any poems yet. Explore the portal and click the Bookmark icon to save!
            </p>
          )}
        </div>
      ) : activeTab === 'stories' ? (
        /* Stories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.length > 0 ? (
            stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-10 text-center col-span-full">
              You haven&apos;t favorited any stories yet. Explore the portal and click the Heart icon to save!
            </p>
          )}
        </div>
      ) : (
        /* Quotes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {quotes.length > 0 ? (
              quotes.map((quote) => {
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
                          title="Remove from Library"
                        >
                          <Heart className="w-3.5 h-3.5 transition-all duration-300 fill-rose-500 text-rose-500" />
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
              })
            ) : (
              <p className="text-sm text-muted-foreground py-10 text-center col-span-full">
                You haven&apos;t favorited any thoughts or quotes yet. Explore the portal and click the Heart icon to save!
              </p>
            )}
          </AnimatePresence>
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
