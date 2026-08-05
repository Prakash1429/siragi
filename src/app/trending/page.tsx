'use client';

import { useEffect, useState } from 'react';
import PoemCard from '@/components/poems/PoemCard';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { dbService } from '@/services/db';
import { Poem } from '@/types';
import { Sparkles } from 'lucide-react';

export default function TrendingPage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrendingData() {
      try {
        const list = await dbService.getPoems('published');
        // Sort by viewsCount desc
        const sorted = [...list].sort((a, b) => b.viewsCount - a.viewsCount);
        setPoems(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTrendingData();
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Trending' }]} />

      <div className="border-b border-border/40 pb-4">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary animate-spin-[spin_10s_linear_infinite]" />
          Trending Poems
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Discover the most viewed and liked poetry in our community today.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {poems.length > 0 ? (
            poems.map((poem) => <PoemCard key={poem.id} poem={poem} />)
          ) : (
            <p className="text-sm text-muted-foreground py-10 text-center col-span-full">
              No trending poems found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
