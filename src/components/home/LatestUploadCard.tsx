'use client';

import Link from 'next/link';
import { Calendar, Clock, Feather, BookOpen, Quote as QuoteIcon, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export interface LatestUploadItem {
  id: string;
  title: string;
  content: string;
  author: string;
  category: 'poem' | 'story' | 'thought' | 'quote';
  genre?: string;
  coverUrl?: string;
  createdAt: string;
  readingTime?: number;
}

interface LatestUploadCardProps {
  item: LatestUploadItem;
}

export default function LatestUploadCard({ item }: LatestUploadCardProps) {
  const isStory = item.category === 'story';
  
  // Detail page routes mapping
  const getDetailRoute = () => {
    switch (item.category) {
      case 'poem':
        return `/poem/${item.id}`;
      case 'story':
        return `/story/${item.id}`;
      case 'thought':
      case 'quote':
        return `/quote/${item.id}`;
      default:
        return '/';
    }
  };

  // Badge colors and category icons mapping
  const getCategoryStyles = () => {
    switch (item.category) {
      case 'poem':
        return {
          pill: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
          gradient: 'from-purple-600/40 to-indigo-900/40',
          icon: <Feather className="w-8 h-8 text-purple-300" />
        };
      case 'story':
        return {
          pill: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          gradient: 'from-emerald-600/40 to-teal-900/40',
          icon: <BookOpen className="w-8 h-8 text-emerald-300" />
        };
      case 'thought':
        return {
          pill: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
          gradient: 'from-pink-600/40 to-rose-900/40',
          icon: <Sparkles className="w-8 h-8 text-pink-300" />
        };
      case 'quote':
        return {
          pill: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
          gradient: 'from-sky-600/40 to-blue-900/40',
          icon: <QuoteIcon className="w-8 h-8 text-sky-300" />
        };
    }
  };

  const styles = getCategoryStyles();
  const detailRoute = getDetailRoute();

  // Format date and time
  const formattedDate = new Date(item.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group rounded-2xl glass-card border border-border/40 overflow-hidden flex flex-col justify-between relative shadow-lg"
    >
      <Link href={detailRoute} className="block text-left select-none cursor-pointer">
        {/* Cover photo or gradient header */}
        <div className="h-44 relative overflow-hidden bg-secondary/20 flex items-center justify-center border-b border-border/10">
          {isStory && item.coverUrl ? (
            <img
              src={item.coverUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${styles?.gradient} flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="p-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner z-10"
              >
                {styles?.icon}
              </motion.div>
            </div>
          )}

          {/* Floating Category Badge Pill */}
          <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${styles?.pill}`}>
            {item.category}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3 flex-grow">
          {/* Timestamp and genre sub-badge */}
          <div className="flex items-center justify-between text-[9px] text-muted-foreground font-bold">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            {item.genre && (
              <span className="px-1.5 py-0.5 rounded bg-secondary/35 text-foreground/75 uppercase tracking-wide">
                {item.genre}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-black text-foreground group-hover:text-primary transition-all line-clamp-1 leading-snug">
            {item.title}
          </h3>

          {/* Preview content snippet */}
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-medium">
            {item.content}
          </p>
        </div>
      </Link>

      {/* Card Footer Actions */}
      <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-border/20 text-[10px] text-muted-foreground font-bold mt-auto bg-slate-950/10">
        <span>By {item.author || 'Prakash'}</span>
        
        <Link 
          href={detailRoute}
          className="flex items-center gap-1.5 text-primary hover:text-primary-light transition-all select-none group/btn cursor-pointer py-1 px-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20"
        >
          <span>Read</span>
          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.article>
  );
}
