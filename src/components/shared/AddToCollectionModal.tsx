'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { dbService } from '@/services/db';
import { Collection } from '@/types';
import { Folder, Plus, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddToCollectionModalProps {
  itemId: string;
  itemType: 'poem' | 'story' | 'quote';
  onClose: () => void;
}

export default function AddToCollectionModal({ itemId, itemType, onClose }: AddToCollectionModalProps) {
  const { user } = useStore();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newColName, setNewColName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadCollections() {
      if (!user) return;
      try {
        const list = await dbService.getCollections(user.id);
        setCollections(list);
      } catch {
        toast.error('Failed to load collections.');
      } finally {
        setLoading(false);
      }
    }
    loadCollections();
  }, [user]);

  const handleToggleCollection = async (col: Collection) => {
    if (!user) return;
    const isCurrentlyIn = itemType === 'poem'
      ? col.poemIds.includes(itemId)
      : itemType === 'story'
      ? (col.storyIds || []).includes(itemId)
      : (col.quoteIds || []).includes(itemId);

    try {
      if (isCurrentlyIn) {
        await dbService.removeItemFromCollection(col.id, itemId, itemType, user.id);
        setCollections(prev => prev.map(c => {
          if (c.id === col.id) {
            if (itemType === 'poem') {
              return { ...c, poemIds: c.poemIds.filter(id => id !== itemId) };
            } else if (itemType === 'story') {
              return { ...c, storyIds: (c.storyIds || []).filter(id => id !== itemId) };
            } else {
              return { ...c, quoteIds: (c.quoteIds || []).filter(id => id !== itemId) };
            }
          }
          return c;
        }));
        toast.success('Removed from collection.');
      } else {
        await dbService.addItemToCollection(col.id, itemId, itemType, user.id);
        setCollections(prev => prev.map(c => {
          if (c.id === col.id) {
            if (itemType === 'poem') {
              return { ...c, poemIds: [...c.poemIds, itemId] };
            } else if (itemType === 'story') {
              return { ...c, storyIds: [...(c.storyIds || []), itemId] };
            } else {
              return { ...c, quoteIds: [...(c.quoteIds || []), itemId] };
            }
          }
          return c;
        }));
        toast.success('Added to collection!');
      }
    } catch {
      toast.error('Failed to update collection.');
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newColName.trim()) return;

    setCreating(true);
    try {
      const newCol = await dbService.createCollection(newColName.trim(), '', user.id);
      await dbService.addItemToCollection(newCol.id, itemId, itemType, user.id);
      
      // Update local state
      const updatedCol = {
        ...newCol,
        poemIds: itemType === 'poem' ? [itemId] : [],
        storyIds: itemType === 'story' ? [itemId] : [],
        quoteIds: itemType === 'quote' ? [itemId] : []
      };
      
      setCollections(prev => [updatedCol, ...prev]);
      setNewColName('');
      toast.success(`Created collection "${newCol.name}" and added item!`);
    } catch {
      toast.error('Failed to create collection.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground text-sm">Save to Collections</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Collections List */}
        <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
          {loading ? (
            <div className="flex justify-center py-6 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : collections.length > 0 ? (
            collections.map((col) => {
              const isIn = itemType === 'poem'
                ? col.poemIds.includes(itemId)
                : itemType === 'story'
                ? (col.storyIds || []).includes(itemId)
                : (col.quoteIds || []).includes(itemId);

              return (
                <button
                  key={col.id}
                  onClick={() => handleToggleCollection(col)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border/30 hover:bg-secondary/40 transition-all text-left text-xs font-semibold text-foreground/90"
                >
                  <span className="truncate">{col.name}</span>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    isIn ? 'bg-primary border-primary text-primary-foreground' : 'border-border/60 text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  </div>
                </button>
              );
            })
          ) : (
            <p className="text-center py-6 text-xs text-muted-foreground italic">
              No collections created yet.
            </p>
          )}
        </div>

        {/* Create new collection inline */}
        <form onSubmit={handleCreateAndAdd} className="flex gap-2 pt-2 border-t border-border/20">
          <input
            type="text"
            required
            placeholder="New collection name..."
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            className="flex-1 h-9 px-3 rounded-lg bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/45 transition-all text-foreground"
          />
          <button
            type="submit"
            disabled={creating}
            className="h-9 px-3 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-all disabled:opacity-50 shadow-sm"
          >
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
