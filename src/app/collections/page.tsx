'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { dbService } from '@/services/db';
import { Collection, Poem, Story, Quote } from '@/types';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { FolderHeart, Plus, Folder, BookOpen, Trash2, FileText, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CollectionsPage() {
  const { user } = useStore();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  // New Collection Form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Please configure your username first.');
      router.push('/');
      return;
    }

    async function loadCollectionsData() {
      if (!user) return;
      try {
        const [colList, poemList, storyList, quoteList] = await Promise.all([
          dbService.getCollections(user.id),
          dbService.getPoems('published'),
          dbService.getStories('published'),
          dbService.getQuotes('published'),
        ]);
        setCollections(colList);
        setPoems(poemList);
        setStories(storyList);
        setQuotes(quoteList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCollectionsData();
  }, [user, router]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const added = await dbService.createCollection(name.trim(), description.trim(), user.id);
      setCollections((prev) => [added, ...prev]);
      setName('');
      setDescription('');
      setShowForm(false);
      toast.success('Collection created!');
    } catch {
      toast.error('Failed to create collection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!user) return;
    try {
      await dbService.deleteCollection(collectionId, user.id);
      setCollections((prev) => prev.filter(c => c.id !== collectionId));
      toast.success('Collection deleted.');
    } catch {
      toast.error('Failed to delete collection.');
    }
  };

  const handleRemoveItem = async (collectionId: string, itemId: string, itemType: 'poem' | 'story' | 'quote') => {
    if (!user) return;
    try {
      await dbService.removeItemFromCollection(collectionId, itemId, itemType, user.id);
      setCollections((prev) =>
        prev.map((c) => {
          if (c.id === collectionId) {
            if (itemType === 'poem') {
              return { ...c, poemIds: c.poemIds.filter((id) => id !== itemId) };
            } else if (itemType === 'story') {
              return { ...c, storyIds: (c.storyIds || []).filter((id) => id !== itemId) };
            } else {
              return { ...c, quoteIds: (c.quoteIds || []).filter((id) => id !== itemId) };
            }
          }
          return c;
        })
      );
      toast.success('Item removed from collection.');
    } catch {
      toast.error('Failed to remove item.');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Collections' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-primary" />
            My Poetry Collections
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Group poems into custom thematic folders.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 self-start transition-all shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Create Collection
        </button>
      </div>

      {/* New Collection Form */}
      {showForm && (
        <form onSubmit={handleCreateCollection} className="p-5 rounded-2xl border border-border/40 bg-secondary/15 space-y-4 max-w-md animate-in fade-in slide-in-from-top-2 duration-150">
          <h3 className="text-sm font-bold text-foreground">New Collection Details</h3>
          <div className="space-y-3">
            <input
              type="text"
              required
              placeholder="Collection Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition-all text-foreground"
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition-all text-foreground"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 h-8 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 h-8 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg transition-all shadow-sm"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSkeleton type="list" count={2} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.length > 0 ? (
            collections.map((col) => {
              const colPoems = poems.filter((p) => col.poemIds.includes(p.id));
              const colStories = stories.filter((s) => (col.storyIds || []).includes(s.id));
              const colQuotes = quotes.filter((q) => (col.quoteIds || []).includes(q.id));
              const totalItems = colPoems.length + colStories.length + colQuotes.length;

              return (
                <div key={col.id} className="p-5 rounded-2xl border border-border/40 bg-card hover:border-primary/30 transition-all space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-5 h-5 text-indigo-400 fill-indigo-400/10" />
                      <div>
                        <h3 className="font-bold text-foreground leading-none">{col.name}</h3>
                        {col.description && (
                          <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                            {col.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground font-bold whitespace-nowrap">
                        {totalItems} items
                      </span>
                      <button
                        onClick={() => handleDeleteCollection(col.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        title="Delete collection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* List titles in collection */}
                  <div className="space-y-1 pt-2 border-t border-border/40 max-h-[180px] overflow-y-auto divide-y divide-border/10">
                    {totalItems > 0 ? (
                      <>
                        {/* Poems */}
                        {colPoems.map((p) => (
                           <div key={p.id} className="group flex items-center justify-between gap-2 py-2 text-xs font-semibold">
                             <div className="flex items-center gap-2 min-w-0">
                               <BookOpen className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                               <a href={`/poem/${p.id}`} className="truncate text-foreground/90 hover:text-primary transition-all">
                                 {p.title}
                               </a>
                               <span className="text-[8px] uppercase tracking-wider px-1 bg-primary/10 text-primary rounded font-bold shrink-0">
                                 Poem
                               </span>
                             </div>
                             <button
                               onClick={() => handleRemoveItem(col.id, p.id, 'poem')}
                               className="p-1 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                               title="Remove item"
                             >
                               <X className="w-3 h-3" />
                             </button>
                           </div>
                        ))}

                        {/* Stories */}
                        {colStories.map((s) => (
                           <div key={s.id} className="group flex items-center justify-between gap-2 py-2 text-xs font-semibold">
                             <div className="flex items-center gap-2 min-w-0">
                               <FileText className="w-3.5 h-3.5 text-indigo-400/60 shrink-0" />
                               <a href={`/story/${s.id}`} className="truncate text-foreground/90 hover:text-primary transition-all">
                                 {s.title}
                               </a>
                               <span className="text-[8px] uppercase tracking-wider px-1 bg-indigo-500/10 text-indigo-400 rounded font-bold shrink-0">
                                 Story
                               </span>
                             </div>
                             <button
                               onClick={() => handleRemoveItem(col.id, s.id, 'story')}
                               className="p-1 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                               title="Remove item"
                             >
                               <X className="w-3 h-3" />
                             </button>
                           </div>
                        ))}

                        {/* Quotes */}
                        {colQuotes.map((q) => (
                           <div key={q.id} className="group flex items-center justify-between gap-2 py-2 text-xs font-semibold">
                             <div className="flex items-center gap-2 min-w-0">
                               <Sparkles className="w-3.5 h-3.5 text-amber-500/60 shrink-0" />
                               <a href={`/quote/${q.id}`} className="truncate text-foreground/90 hover:text-primary transition-all">
                                 {q.content.substring(0, 35)}...
                               </a>
                               <span className="text-[8px] uppercase tracking-wider px-1 bg-amber-500/10 text-amber-400 rounded font-bold shrink-0">
                                 Quote
                               </span>
                             </div>
                             <button
                               onClick={() => handleRemoveItem(col.id, q.id, 'quote')}
                               className="p-1 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                               title="Remove item"
                             >
                               <X className="w-3 h-3" />
                             </button>
                           </div>
                        ))}
                      </>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic py-3 text-center">
                        No items added to this collection yet.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground py-10 text-center col-span-full">
              You haven&apos;t created any collections yet. Click Create Collection above to start!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
