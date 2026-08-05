'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Poem } from '@/types';
import { dbService } from '@/services/db';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Heart, Share2, Eye, Calendar, Clock, MessageSquare, Globe, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PoemCardProps {
  poem: Poem;
}

export default function PoemCard({ poem }: PoemCardProps) {
  const { t, language } = useTranslation();
  const { user, setCurrentTrack } = useStore();
  
  // Optimistic UI States
  const [likes, setLikes] = useState(poem.likesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favorites, setFavorites] = useState(poem.favoritesCount);
  const [shares, setShares] = useState(poem.sharesCount || 0);

  useEffect(() => {
    if (user) {
      dbService.hasLiked(poem.id, user.id).then(setIsLiked);
      dbService.hasFavorited(poem.id, user.id).then(setIsFavorited);
    }
  }, [poem.id, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to like poems.');
      return;
    }
    // Optimistic Update
    const prevIsLiked = isLiked;
    setIsLiked(!prevIsLiked);
    setLikes((prev) => (prevIsLiked ? prev - 1 : prev + 1));

    try {
      const liked = await dbService.likePoem(poem.id, user.id);
      setIsLiked(liked); // sync with db return value
    } catch {
      // rollback
      setIsLiked(prevIsLiked);
      setLikes((prev) => (prevIsLiked ? prev + 1 : prev - 1));
      toast.error('Failed to update like status.');
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to save favorites.');
      return;
    }
    // Optimistic Update
    const prevIsFav = isFavorited;
    setIsFavorited(!prevIsFav);
    setFavorites((prev) => (prevIsFav ? prev - 1 : prev + 1));

    try {
      const fav = await dbService.favoritePoem(poem.id, user.id);
      setIsFavorited(fav);
    } catch {
      // rollback
      setIsFavorited(prevIsFav);
      setFavorites((prev) => (prevIsFav ? prev + 1 : prev - 1));
      toast.error('Failed to save favorite.');
    }
  };



  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/poem/${poem.id}`;
    
    // Optimistic update
    setShares(prev => prev + 1);
    
    try {
      await navigator.clipboard.writeText(url);
      await dbService.incrementShares(poem.id, 'poem');
      toast.success('Link copied to clipboard!');
    } catch {
      setShares(prev => Math.max(0, prev - 1));
      toast.error('Failed to copy link.');
    }
  };

  const formattedDate = new Date(poem.createdAt).toLocaleDateString(
    language === 'ta' ? 'ta-IN' : 'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  return (
    <motion.article 
      whileHover={{ y: -5 }}
      className="group rounded-2xl glass-card gradient-border p-6 flex flex-col justify-between h-[360px] relative"
    >
      {/* Floating Favorite Heart Icon */}
      <button
        onClick={handleFavorite}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/40 backdrop-blur-sm border border-white/10 text-white hover:text-rose-500 hover:scale-110 active:scale-95 transition-all z-20 shadow-md"
        title={isFavorited ? "Remove from Library" : "Save to Library"}
      >
        <Heart className={cn("w-4.5 h-4.5 transition-all duration-300", isFavorited ? "fill-rose-500 text-rose-500 animate-bounce" : "text-white fill-transparent")} />
      </button>

      <Link href={`/poem/${poem.id}`} onClick={() => dbService.incrementViews(poem.id, 'poem')} className="block select-none cursor-pointer text-left">
        {/* Header: User details, Published date */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${poem.authorUsername}`}
              alt={poem.authorName}
              className="w-8 h-8 rounded-full bg-secondary shrink-0"
            />
            <div className="overflow-hidden">
              <span className="block text-xs font-bold text-foreground truncate flex items-center gap-1">
                <User className="w-3 h-3 text-muted-foreground" />
                {poem.authorName}
              </span>
              <span className="block text-[10px] text-muted-foreground">@{poem.authorUsername}</span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
        </div>

        {/* Title and tags */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {poem.categoryName}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-0.5">
              <Globe className="w-2.5 h-2.5" />
              {poem.language === 'ta' ? 'தமிழ்' : 'English'}
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {poem.readingTime || 1} min
            </span>
          </div>
          <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-all line-clamp-1">
            {poem.title}
          </h3>
        </div>

        {/* Content Snippet */}
        <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed font-serif whitespace-pre-line mb-4 italic">
          {poem.content}
        </p>
      </Link>

      {/* Live Statistics Footer */}
      <div className="border-t border-border/40 pt-4 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Likes */}
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1 text-xs font-bold transition-all hover:scale-105",
              isLiked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
            )}
            title="Likes"
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-rose-500")} />
            <span>{likes}</span>
          </button>

          {/* Comments */}
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-semibold" title="Comments">
            <MessageSquare className="w-4 h-4" />
            <span>{poem.commentsCount}</span>
          </span>

          {/* Saves */}
          <button
            onClick={handleFavorite}
            className={cn(
              "flex items-center gap-1 text-xs font-bold transition-all hover:scale-105",
              isFavorited ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
            )}
            title="Saves"
          >
            <Heart className={cn("w-4 h-4", isFavorited && "fill-rose-500")} />
            <span>{favorites}</span>
          </button>

          {/* Shares */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-xs text-muted-foreground font-semibold hover:text-primary transition-colors"
            title="Shares"
          >
            <Share2 className="w-4 h-4" />
            <span>{shares}</span>
          </button>

          {/* Views */}
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-semibold" title="Views">
            <Eye className="w-4 h-4" />
            <span>{poem.viewsCount}</span>
          </span>
        </div>

      </div>
    </motion.article>
  );
}
