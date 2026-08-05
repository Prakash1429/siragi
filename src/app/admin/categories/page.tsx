'use client';

import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { Category } from '@/types';
import { Compass, Plus } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const list = await dbService.getCategories();
        setCategories(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (loading) {
    return <div className="h-40 flex items-center justify-center text-xs animate-pulse">Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Compass className="w-4.5 h-4.5 text-primary" />
          Poetry Categories ({categories.length})
        </h3>
      </div>

      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-secondary/40 text-muted-foreground font-bold border-b border-border/40">
              <th className="p-3">Name (En)</th>
              <th className="p-3">Name (Ta)</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Poems Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-secondary/20">
                <td className="p-3 font-semibold text-foreground">{cat.name}</td>
                <td className="p-3 font-semibold">{cat.nameTa}</td>
                <td className="p-3 text-muted-foreground">{cat.slug}</td>
                <td className="p-3 font-bold text-primary">{cat.poemsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
