'use client';

import Link from 'next/link';
import { Poem } from '@/types';
import { Heart, Eye, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrendingCardProps {
  poem: Poem;
  index: number;
}

export default function TrendingCard({ poem, index }: TrendingCardProps) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30 transition-all group"
    >
      {/* Ranking number badge */}
      <div className="flex flex-col items-center justify-center shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 text-primary group-hover:from-primary group-hover:to-indigo-500 group-hover:text-primary-foreground transition-all">
        {index <= 2 ? (
          <Award className="w-5 h-5" />
        ) : (
          <span className="text-sm font-black">#{index + 1}</span>
        )}
      </div>

      {/* Info Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/poem/${poem.id}`}>
          <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-all">
            {poem.title}
          </h4>
        </Link>
        <span className="text-xs text-muted-foreground truncate block">
          by {poem.authorName}
        </span>
      </div>

      {/* Stats right side */}
      <div className="flex items-center gap-3 shrink-0 text-muted-foreground text-xs">
        <span className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 text-rose-500/70" />
          <span>{poem.likesCount}</span>
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          <span>{poem.viewsCount}</span>
        </span>
      </div>
    </motion.div>
  );
}
