'use client';

import { useEffect, useState } from 'react';
import CategoryCard from '@/components/home/CategoryCard';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { dbService } from '@/services/db';
import { Category } from '@/types';
import { Compass } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await dbService.getCategories();
        setCategories(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Categories' }]} />

      <div className="flex items-center gap-2 mb-4">
        <Compass className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-black text-foreground">Explore Poem Categories</h1>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
