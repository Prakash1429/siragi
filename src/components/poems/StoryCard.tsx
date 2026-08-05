'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Story } from '@/types';
import { dbService } from '@/services/db';
import { useStore } from '@/store/useStore';
import { Heart, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  const { user } = useStore();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (user) {
      dbService.hasFavorited(story.id, user.id).then(setIsFavorited);
    }
  }, [story.id, user]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please configure your username first.');
      return;
    }
    const prev = isFavorited;
    setIsFavorited(!prev);
    try {
      const fav = await dbService.favoriteStory(story.id, user.id);
      setIsFavorited(fav);
    } catch {
      setIsFavorited(prev);
      toast.error('Failed to update favorite status.');
    }
  };

  return (
    <motion.article
      whileHover={{ y: -5 }}
      className="group rounded-2xl glass-card border border-border/40 overflow-hidden flex flex-col justify-between relative"
    >
      {/* Floating Favorite Heart Icon */}
      <button
        onClick={handleFavorite}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/40 backdrop-blur-sm border border-white/10 text-white hover:text-rose-500 hover:scale-110 active:scale-95 transition-all z-20 shadow-md"
        title={isFavorited ? "Remove from Library" : "Save to Library"}
      >
        <Heart className={cn("w-4.5 h-4.5 transition-all duration-300", isFavorited ? "fill-rose-500 text-rose-500 animate-bounce" : "text-white fill-transparent")} />
      </button>

      <Link href={`/story/${story.id}`} className="block select-none cursor-pointer text-left">
        {/* Cover photo */}
        <div className="h-40 relative overflow-hidden bg-secondary">
          <img
            src={story.coverUrl || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600'}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          />
          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg bg-slate-950/70 backdrop-blur-md text-[9px] font-bold text-primary uppercase border border-primary/20">
            {story.genre || story.category}
          </span>
        </div>

        <div className="p-5 space-y-3">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(story.createdAt).toLocaleDateString()}
          </span>
          
          <h3 className="text-base font-black text-foreground group-hover:text-primary transition-all line-clamp-1">
            {story.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {story.content}
          </p>
        </div>
      </Link>

      <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-border/20 text-[10px] text-muted-foreground font-bold mt-auto">
        <span>By {story.author}</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <Clock className="w-3 h-3" />
          {story.readingTime} min read
        </span>
      </div>
    </motion.article>
  );
}
