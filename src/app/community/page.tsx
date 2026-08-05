'use client';

import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { User } from '@/types';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { Users, UserCheck, UserPlus, Heart } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

export default function CommunityPage() {
  const { user } = useStore();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<{ [userId: string]: boolean }>({});

  useEffect(() => {
    async function loadCommunity() {
      try {
        const list = await dbService.getUsers();
        // Remove self from listing
        const filtered = list.filter((u) => u.id !== user?.id);
        setUsersList(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCommunity();
  }, [user]);

  const handleFollowToggle = (targetId: string, name: string) => {
    if (!user) {
      toast.error('Please login to follow writers.');
      return;
    }

    const currentlyFollowing = followingMap[targetId] || false;
    setFollowingMap((prev) => ({ ...prev, [targetId]: !currentlyFollowing }));
    
    // Update users count locally
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === targetId) {
          return {
            ...u,
            followersCount: currentlyFollowing ? Math.max(0, u.followersCount - 1) : u.followersCount + 1,
          };
        }
        return u;
      })
    );

    toast.success(currentlyFollowing ? `Unfollowed ${name}` : `Following ${name}!`);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Community' }]} />

      <div className="border-b border-border/40 pb-4">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Poetry Community
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Meet and follow other talented poets and spoken word artists in Siragii.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton type="list" count={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {usersList.map((poet) => {
            const isFollowing = followingMap[poet.id] || false;

            return (
              <div key={poet.id} className="p-5 rounded-2xl border border-border/40 bg-card hover:border-primary/30 transition-all flex flex-col items-center text-center space-y-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${poet.username}`}
                  alt={poet.name}
                  className="w-16 h-16 rounded-full border-2 border-border object-cover bg-secondary"
                />

                <div>
                  <h3 className="font-bold text-foreground truncate max-w-[180px]">{poet.name}</h3>
                  <span className="text-[10px] text-muted-foreground">@{poet.username}</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[32px]">
                  {poet.bio || 'Poet writing verses on life and human emotions.'}
                </p>

                {/* Follower Stats */}
                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                  <span>
                    <strong className="text-foreground">{poet.followersCount}</strong> followers
                  </span>
                  <span>
                    <strong className="text-foreground">{poet.followingCount}</strong> following
                  </span>
                </div>

                {/* Follow Button */}
                <button
                  onClick={() => handleFollowToggle(poet.id, poet.name)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isFollowing
                      ? 'bg-secondary text-foreground hover:bg-rose-500/10 hover:text-rose-500 border border-border/50'
                      : 'bg-primary hover:bg-primary/95 text-primary-foreground shadow-md shadow-primary/10'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
