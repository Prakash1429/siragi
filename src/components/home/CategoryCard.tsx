'use client';

import Link from 'next/link';
import { Category } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { language } = useTranslation();
  
  const name = language === 'ta' ? category.nameTa : category.name;
  const description = language === 'ta' ? category.descriptionTa : category.description;

  return (
    <Link href={`/category/${category.slug}`} className="block">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="relative h-60 rounded-2xl overflow-hidden group border border-border/30 shadow-md cursor-pointer"
      >
        {/* Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={category.imageUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content Details */}
        <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end h-full">
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full self-start mb-2 border border-primary/20">
            {category.poemsCount > 0 && (category.storiesCount ?? 0) > 0
              ? `${category.poemsCount} poems • ${category.storiesCount} stories`
              : category.poemsCount > 0
              ? `${category.poemsCount} poems`
              : (category.storiesCount ?? 0) > 0
              ? `${category.storiesCount} stories`
              : '0 items'}
          </span>
          <h3 className="text-lg font-black text-foreground mb-1 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Action Visual Indicator */}
          <div
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground transform translate-x-2 group-hover:translate-x-0 duration-300"
          >
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
