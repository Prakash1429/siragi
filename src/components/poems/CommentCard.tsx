'use client';

import { Comment } from '@/types';
import { useStore } from '@/store/useStore';
import { Calendar, Trash2 } from 'lucide-react';

interface CommentCardProps {
  comment: Comment;
  onDelete?: (id: string) => void;
}

export default function CommentCard({ comment, onDelete }: CommentCardProps) {
  const { user } = useStore();

  const isOwner = user?.id === comment.userId || user?.role === 'admin';

  const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="p-4 rounded-xl border border-border/40 bg-secondary/20 flex gap-3">
      {/* Avatar */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={comment.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.userUsername}`}
        alt={comment.userName}
        className="w-8 h-8 rounded-full bg-secondary shrink-0 object-cover"
      />

      {/* Body content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <div>
            <span className="text-xs font-bold text-foreground mr-1.5">{comment.userName}</span>
            <span className="text-[10px] text-muted-foreground">@{comment.userUsername}</span>
          </div>
          <span className="text-[9px] font-semibold text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed break-words font-sans">
          {comment.content}
        </p>
      </div>

      {/* Delete trigger */}
      {isOwner && onDelete && (
        <button
          onClick={() => onDelete(comment.id)}
          className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 self-start transition-all"
          title="Delete Comment"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
