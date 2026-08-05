'use client';

import { User } from '@/types';
import { useStore } from '@/store/useStore';
import { Calendar, Users, Heart, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface ProfileCardProps {
  profileUser: User;
  poemsCount?: number;
}

export default function ProfileCard({ profileUser, poemsCount = 0 }: ProfileCardProps) {
  const { user } = useStore();

  const isSelf = user?.id === profileUser.id;

  const formattedDate = new Date(profileUser.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="rounded-2xl glass-card border border-border/40 p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/10 blur-2xl -z-10" />

      {/* Avatar */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={profileUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profileUser.username}`}
        alt={profileUser.name}
        className="w-24 h-24 rounded-full border-2 border-primary/20 object-cover bg-secondary"
      />

      {/* Details info */}
      <div className="flex-1 min-w-0 text-center md:text-left space-y-3">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center justify-center md:justify-start gap-2">
            {profileUser.name}
            {profileUser.role === 'admin' && (
              <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Admin
              </span>
            )}
          </h2>
          <span className="text-xs text-muted-foreground">@{profileUser.username}</span>
        </div>

        {profileUser.bio && (
          <p className="text-sm text-foreground/80 leading-relaxed font-sans max-w-xl">
            {profileUser.bio}
          </p>
        )}

        {/* Info stats */}
        <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap text-xs text-muted-foreground font-semibold">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-400" />
            <strong className="text-foreground">{profileUser.followersCount}</strong> followers
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            <strong className="text-foreground">{profileUser.followingCount}</strong> following
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-primary" />
            <strong className="text-foreground">{poemsCount}</strong> poems
          </span>
        </div>

        <div className="text-[10px] text-muted-foreground flex items-center justify-center md:justify-start gap-1 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          <span>Joined {formattedDate}</span>
        </div>
      </div>

      {/* Action button: Edit profile if self */}
      {isSelf && (
        <Link
          href="/profile/edit"
          className="self-center md:self-start shrink-0 px-4 py-2 rounded-xl bg-secondary border border-border/50 hover:bg-secondary/80 hover:border-primary/50 text-xs font-bold text-foreground transition-all"
        >
          Edit Profile
        </Link>
      )}
    </div>
  );
}
