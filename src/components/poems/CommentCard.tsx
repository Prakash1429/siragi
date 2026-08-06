'use client';

import { Comment } from '@/types';
import { useStore } from '@/store/useStore';
import { Calendar, Trash2 } from 'lucide-react';

interface CommentCardProps {
  comment: Comment;
  onDelete?: (id: string) => void;
  onDeleteReply?: (commentId: string, replyId: string) => void;
}

export default function CommentCard({ comment, onDelete, onDeleteReply }: CommentCardProps) {
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
    <div className="space-y-3">
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

      {/* Admin replies list */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-6 border-l-2 border-primary/20 space-y-2">
          {comment.replies.map((reply) => {
            const replyDate = new Date(reply.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            const isAdmin = true; // replies are from admin
            return (
              <div key={reply.id} className="p-3.5 rounded-xl border border-primary/15 bg-primary/5 flex gap-2.5 relative group">
                <img
                  src={reply.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${reply.userUsername}`}
                  alt={reply.userName}
                  className="w-6.5 h-6.5 rounded-full bg-secondary shrink-0 object-cover border border-primary/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-extrabold text-primary">{reply.userName}</span>
                      <span className="text-[8px] bg-primary/20 text-primary border border-primary/20 px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
                        Admin Reply
                      </span>
                    </div>
                    <span className="text-[8px] font-semibold text-muted-foreground flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {replyDate}
                    </span>
                  </div>
                  <p className="text-[12px] text-foreground/90 leading-relaxed break-words font-sans">
                    {reply.content}
                  </p>
                </div>

                {/* If the current viewer is admin, show a delete trigger for their own reply */}
                {user?.role === 'admin' && onDeleteReply && (
                  <button
                    onClick={() => onDeleteReply(comment.id, reply.id)}
                    className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 self-start transition-all absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100"
                    title="Delete Reply"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
