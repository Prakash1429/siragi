'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { Feather, BookOpen, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

export default function Hero() {
  const { t } = useTranslation();
  const { user } = useStore();

  return (
    <div className="relative rounded-3xl overflow-hidden glass-card p-8 md:p-12 mb-8 bg-gradient-to-br from-indigo-950/20 via-purple-950/10 to-card border border-border/40">
      {/* Decorative gradient glowing orb */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/10 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#d4af37]/5 blur-3xl -z-10" />

      <div className="max-w-2xl space-y-6 relative z-10">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-xs font-bold text-primary border border-primary/20 tracking-wide uppercase"
        >
          <Feather className="w-3.5 h-3.5" />
          Where words meet music
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-foreground"
        >
          {t('hero.title')}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base text-muted-foreground leading-relaxed"
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center gap-4 pt-2"
        >
          {/* Explore Poems Button */}
          <Link
            href="/poems"
            className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 duration-200 cursor-pointer"
          >
            <Feather className="w-4 h-4" />
            <span>Explore Poems</span>
          </Link>

          {/* Explore Stories Button */}
          <Link
            href="/stories"
            className="h-12 px-6 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground font-bold text-sm flex items-center justify-center gap-2 border border-border/50 transition-all hover:shadow-md hover:-translate-y-0.5 duration-200 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Explore Stories</span>
          </Link>

          {/* Explore Thoughts & Quotes Button */}
          <Link
            href="/quotes"
            className="h-12 px-6 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground font-bold text-sm flex items-center justify-center gap-2 border border-border/50 transition-all hover:shadow-md hover:-translate-y-0.5 duration-200 cursor-pointer"
          >
            <Quote className="w-4 h-4 text-pink-500" />
            <span>Explore Thoughts & Quotes</span>
          </Link>

          {/* If admin, add a third option to write directly */}
          {user && user.role === 'admin' && (
            <Link
              href="/write"
              className="h-12 px-5 rounded-xl bg-secondary/30 hover:bg-secondary/50 text-[#d4af37] font-bold text-xs flex items-center justify-center gap-1.5 border border-dashed border-[#d4af37]/30 transition-all hover:-translate-y-0.5 duration-200"
            >
              <span>+ Compose</span>
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}
