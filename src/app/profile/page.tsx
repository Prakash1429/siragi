'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { dbService } from '@/services/db';
import { VisitorProfile, ReadingHistoryItem, Poem, Story, Collection } from '@/types';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { BookOpen, Clock, Flame, ShieldAlert, Award, Calendar, Bookmark, Heart, Edit3, Check, Folder } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function ProfilePage() {
  const { user } = useStore();
  const router = useRouter();
  const [profile, setProfile] = useState<VisitorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'likes' | 'collections'>('history');
  const [favItems, setFavItems] = useState<{ id: string; title: string; type: 'poem' | 'story' | 'quote' }[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  
  // Editable Bio
  const [bio, setBio] = useState('Poetry and story enthusiast.');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [savingBio, setSavingBio] = useState(false);

  // Favorite Category
  const [favCategory, setFavCategory] = useState('None yet');

  useEffect(() => {
    if (!user) {
      toast.error('Please configure your username first.');
      router.push('/');
      return;
    }

    const currentUserId = user.id;

    async function loadProfileData() {
      try {
        const [list, allPoems, allStories, allQuotes, colList] = await Promise.all([
          dbService.getVisitorProfiles(),
          dbService.getPoems('published'),
          dbService.getStories('published'),
          dbService.getQuotes('published'),
          dbService.getCollections(currentUserId)
        ]);
        setCollections(colList);
        
        // Filter out bookmarked items
        const bookmarked: { id: string; title: string; type: 'poem' | 'story' | 'quote' }[] = [];
        for (const p of allPoems) {
          if (await dbService.hasFavorited(p.id, currentUserId)) {
            bookmarked.push({ id: p.id, title: p.title, type: 'poem' });
          }
        }
        for (const s of allStories) {
          if (await dbService.hasFavorited(s.id, currentUserId)) {
            bookmarked.push({ id: s.id, title: s.title, type: 'story' });
          }
        }
        for (const q of allQuotes) {
          if (await dbService.hasLiked(q.id, currentUserId)) {
            bookmarked.push({ id: q.id, title: q.content.slice(0, 40) + '...', type: 'quote' });
          }
        }
        setFavItems(bookmarked);

        const found = list.find((p) => p.id === currentUserId);
        if (found) {
          setProfile(found);
          
          // Load custom bio from localStorage if available
          const savedBio = localStorage.getItem(`siragii_bio_${currentUserId}`);
          if (savedBio) setBio(savedBio);

          // Calculate favorite category based on reading history
          if (found.readingHistory && found.readingHistory.length > 0) {
            const counts: { [key: string]: number } = {};
            found.readingHistory.forEach(item => {
              counts[item.type] = (counts[item.type] || 0) + 1;
            });
            const topType = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
            setFavCategory(topType === 'poem' ? 'Tamil Poetry (கவிதை)' : topType === 'story' ? 'Short Stories (கதை)' : 'Thoughts & Quotes');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfileData();
  }, [user, router]);

  const handleSaveBio = async () => {
    if (!user || !profile) return;
    setSavingBio(true);
    try {
      localStorage.setItem(`siragii_bio_${user.id}`, bio);
      // Wait, we can also update the bio on the visitor profile doc in Firestore!
      await dbService.updateVisitorProfile(user.id, { referrer: `Bio: ${bio}` } as any);
      setIsEditingBio(false);
      toast.success('Bio updated successfully!');
    } catch {
      toast.error('Failed to save bio.');
    } finally {
      setSavingBio(false);
    }
  };

  const formatTimeSpent = (seconds: number) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  if (!user) return null;
  if (loading || !profile) {
    return <div className="h-40 flex items-center justify-center text-xs animate-pulse">Loading profile dashboard...</div>;
  }

  // Calculate achievements
  const achievements = [
    {
      id: 'first_read',
      name: 'First Steps',
      desc: 'Opened your first poem or story on Siragii.',
      unlocked: (profile.totalPoemsRead || 0) + (profile.totalStoriesRead || 0) >= 1,
      badge: '🏅'
    },
    {
      id: 'avid_reader',
      name: 'Avid Reader',
      desc: 'Viewed 5 or more unique publications.',
      unlocked: (profile.totalPoemsRead || 0) + (profile.totalStoriesRead || 0) >= 5,
      badge: '📚'
    },
    {
      id: 'time_lord',
      name: 'Golden Quill Fan',
      desc: 'Spent 5 or more active minutes on the website.',
      unlocked: (profile.totalTimeSpent || 0) >= 300,
      badge: '⚡'
    },
    {
      id: 'streak_builder',
      name: 'Active Streak',
      desc: 'Logged more than 2 visitor sessions.',
      unlocked: (profile.visitsCount || 0) >= 2,
      badge: '🔥'
    }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Reader Profile' }]} />

      {/* Top Banner Card */}
      <div className="relative p-6 rounded-3xl border border-border/40 bg-card overflow-hidden shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 z-10">
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
            alt={user.name}
            className="w-16 h-16 rounded-full border border-primary bg-secondary shrink-0"
          />
          <div className="space-y-1">
            <h2 className="text-xl font-black text-foreground">@{profile.username}</h2>
            <p className="text-[10px] text-muted-foreground font-mono select-all">User ID: {profile.id}</p>
            
            {/* Bio Field */}
            <div className="flex items-center gap-2 pt-1">
              {isEditingBio ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="h-8 px-2.5 rounded-lg bg-secondary border border-border/50 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleSaveBio}
                    disabled={savingBio}
                    className="p-1 rounded bg-primary text-primary-foreground hover:bg-primary/95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground italic">"{bio}"</p>
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="space-y-1.5 text-[10px] text-muted-foreground md:text-right z-10 font-bold uppercase tracking-wider">
          <div className="flex items-center md:justify-end gap-1">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Joined: {new Date(profile.firstVisit).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center md:justify-end gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Last Active: {new Date(profile.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl border border-border/40 bg-secondary/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary shrink-0 text-primary">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Reading Streak</span>
            <strong className="block text-md font-black text-foreground">1 Day Streak</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/40 bg-secondary/10 flex items-center gap-3 col-span-1 md:col-span-2">
          <div className="p-2 rounded-lg bg-secondary shrink-0 text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Content Read</span>
            <strong className="block text-md font-black text-foreground">
              {profile.totalQuotesRead || 0} thoughts & quotes • {profile.totalPoemsRead || 0} poems • {profile.totalStoriesRead || 0} stories
            </strong>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/40 bg-secondary/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary shrink-0 text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Active Time Spent</span>
            <strong className="block text-md font-black text-foreground">
              {formatTimeSpent(profile.totalTimeSpent)}
            </strong>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/40 bg-secondary/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary shrink-0 text-rose-500">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Favorite Category</span>
            <strong className="block text-md font-black text-foreground">{favCategory}</strong>
          </div>
        </div>
      </div>

      {/* Achievement Badges Section */}
      <section className="p-5 rounded-2xl border border-border/40 bg-card space-y-4">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
          <Award className="w-4 h-4 text-primary" />
          Unlocked Achievements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                badge.unlocked
                  ? 'border-primary/30 bg-primary/5 text-foreground'
                  : 'border-border/30 bg-secondary/5 opacity-40 grayscale text-muted-foreground'
              }`}
            >
              <span className="text-3xl">{badge.badge}</span>
              <strong className="block text-xs font-bold">{badge.name}</strong>
              <p className="text-[9px] text-muted-foreground">{badge.desc}</p>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                badge.unlocked ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
              }`}>
                {badge.unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* History and Liked list tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-border/40 text-xs font-bold gap-4">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === 'history' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Reading History ({profile.readingHistory ? profile.readingHistory.length : 0})
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === 'likes' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Liked & Bookmarked ({favItems.length})
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === 'collections' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Collections ({collections.length})
          </button>
        </div>

        {activeTab === 'history' ? (
          /* Reading History Tab */
          <div className="rounded-xl border border-border/40 bg-card overflow-hidden divide-y divide-border/20 text-xs">
            {profile.readingHistory && profile.readingHistory.length > 0 ? (
              profile.readingHistory.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-secondary/10">
                  <div className="space-y-0.5">
                    <strong className="block text-foreground">{item.title}</strong>
                    <span className={`inline-flex px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-[8px] ${
                      item.type === 'poem' 
                        ? 'bg-primary/10 text-primary' 
                        : item.type === 'story' 
                          ? 'bg-indigo-500/10 text-indigo-400' 
                          : 'bg-pink-500/10 text-pink-400'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">No reading history logs recorded yet.</div>
            )}
          </div>
        ) : activeTab === 'likes' ? (
          /* Liked & Bookmarked Tab */
          <div className="rounded-xl border border-border/40 bg-card overflow-hidden divide-y divide-border/20 text-xs">
            {favItems.length > 0 ? (
              favItems.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-secondary/10">
                  <div className="space-y-0.5">
                    <Link href={`/${item.type}/${item.id}`} className="block text-foreground hover:text-primary transition-all font-bold">
                      {item.title}
                    </Link>
                    <span className={`inline-flex px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-[8px] ${
                      item.type === 'poem' 
                        ? 'bg-primary/10 text-primary' 
                        : item.type === 'story' 
                          ? 'bg-indigo-500/10 text-indigo-400' 
                          : 'bg-pink-500/10 text-pink-400'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <span className={`inline-flex px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-[8px] ${
                    item.type === 'quote' ? 'bg-[#ff2d55]/10 text-[#ff2d55]' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {item.type === 'quote' ? 'Liked' : 'Bookmarked'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">No favorited or bookmarked items yet.</div>
            )}
          </div>
        ) : (
          /* Collections Tab */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {collections.length > 0 ? (
              collections.map((col) => {
                const count = col.poemIds.length + (col.storyIds || []).length;
                return (
                  <div key={col.id} className="p-4 rounded-xl border border-border/40 bg-card flex flex-col justify-between hover:border-primary/30 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-indigo-400" />
                        <strong className="text-xs text-foreground block">{col.name}</strong>
                      </div>
                      {col.description && (
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{col.description}</p>
                      )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-border/10 flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                      <span>{count} items</span>
                      <Link href="/collections" className="text-primary hover:underline">
                        Manage →
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground col-span-full border border-dashed border-border/30 rounded-xl">
                No collections created yet.
                <div className="mt-2">
                  <Link href="/collections" className="text-xs text-primary font-bold hover:underline">
                    Create your first collection →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
