'use client';

import React, { useEffect, useState } from 'react';
import PoemCard from '@/components/poems/PoemCard';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { dbService } from '@/services/db';
import { Poem, Category, Story } from '@/types';
import { Sparkles, Feather, BookOpen, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryDetailPage({ params }: PageProps) {
  const { slug } = React.use(params);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'poems' | 'stories'>('poems');

  useEffect(() => {
    async function loadCategoryData() {
      try {
        const [allPoems, allStories, allCategories] = await Promise.all([
          dbService.getPoems('published'),
          dbService.getStories('published'),
          dbService.getCategories(),
        ]);
        const cat = allCategories.find((c) => c.slug === slug) || null;
        setCategory(cat);
        
        // Filter poems by category slug
        const filteredPoems = allPoems.filter((p) => p.categorySlug === slug);
        setPoems(filteredPoems);

        // Filter stories by category slug
        const filteredStories = allStories.filter(
          (s) => s.category?.toLowerCase() === slug.toLowerCase()
        );
        setStories(filteredStories);

        // If the category is "Stories", default to the stories tab
        if (slug === 'stories') {
          setActiveTab('stories');
        } else if (filteredPoems.length === 0 && filteredStories.length > 0) {
          setActiveTab('stories');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryData();
  }, [slug]);

  if (loading) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  const categoryName = category ? category.name : 'Category';

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Categories', href: '/categories' },
          { label: categoryName },
        ]}
      />

      <div className="border-b border-border/40 pb-5">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          {categoryName} Directory
        </h1>
        {category && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {/* Tabs selection: Poems / Stories (Only show if both are present in category) */}
      {poems.length > 0 && stories.length > 0 && (
        <div className="flex border-b border-border/40 gap-6">
          <button
            onClick={() => setActiveTab('poems')}
            className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'poems' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Feather className="w-4 h-4" />
            <span>Poems ({poems.length})</span>
            {activeTab === 'poems' && (
              <motion.div
                layoutId="categoryActiveLine"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'stories' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Stories ({stories.length})</span>
            {activeTab === 'stories' && (
              <motion.div
                layoutId="categoryActiveLine"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        </div>
      )}

      {/* Tab contents */}
      {activeTab === 'poems' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {poems.length > 0 ? (
            poems.map((poem) => <PoemCard key={poem.id} poem={poem} />)
          ) : (
            <p className="text-sm text-muted-foreground py-12 text-center col-span-full border border-dashed border-border/40 rounded-3xl">
              No poems found under this category.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.length > 0 ? (
            stories.map((story) => (
              <motion.article
                key={story.id}
                whileHover={{ y: -5 }}
                className="group rounded-2xl glass-card border border-border/40 overflow-hidden flex flex-col justify-between"
              >
                <Link href={`/story/${story.id}`} onClick={() => dbService.incrementViews(story.id, 'story')} className="block select-none cursor-pointer text-left">
                  {/* Cover photo */}
                  <div className="h-40 relative overflow-hidden bg-secondary">
                    <img
                      src={story.coverUrl || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600'}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg bg-slate-950/70 backdrop-blur-md text-[9px] font-bold text-primary uppercase border border-primary/20">
                      {story.category}
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

                {/* Footer */}
                <div className="p-5 pt-0 border-t border-border/30 mt-auto flex items-center justify-between text-muted-foreground text-xs font-semibold">
                  <span>By {story.author}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {story.readingTime} min
                  </span>
                </div>
              </motion.article>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-12 text-center col-span-full border border-dashed border-border/40 rounded-3xl">
              No stories found under this category.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
