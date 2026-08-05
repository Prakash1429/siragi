'use client';

import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { Comment } from '@/types';
import { MessageSquare, Trash2, EyeOff, Eye, Pin, Calendar, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllComments = async () => {
    try {
      const list = await dbService.getAllCommentsAdmin();
      setComments(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load comments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllComments();
  }, []);

  const handleDeleteComment = async (com: Comment) => {
    try {
      await dbService.deleteComment(com.id, com.contentId, com.contentType);
      setComments((prev) => prev.filter((c) => c.id !== com.id));
      toast.success('Comment deleted.');
    } catch {
      toast.error('Failed to delete comment.');
    }
  };

  const handleToggleHide = async (com: Comment) => {
    try {
      const nextState = !com.isHidden;
      await dbService.updateCommentStatus(com.id, { isHidden: nextState });
      toast.success(nextState ? 'Comment hidden.' : 'Comment approved/visible.');
      loadAllComments();
    } catch {
      toast.error('Failed to update visibility status.');
    }
  };

  const handleTogglePin = async (com: Comment) => {
    try {
      const nextState = !com.isPinned;
      await dbService.updateCommentStatus(com.id, { isPinned: nextState });
      toast.success(nextState ? 'Comment pinned.' : 'Comment unpinned.');
      loadAllComments();
    } catch {
      toast.error('Failed to update pinned status.');
    }
  };

  if (loading) {
    return <div className="h-40 flex items-center justify-center text-xs animate-pulse text-muted-foreground">Loading comments moderation database...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/40 pb-2.5">
        <MessageSquare className="w-4.5 h-4.5 text-primary" />
        Comments Moderation Queue ({comments.length})
      </h3>

      {comments.length > 0 ? (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-secondary/40 text-muted-foreground font-bold border-b border-border/40 uppercase tracking-wider text-[10px]">
                <th className="p-3">User (Commenter)</th>
                <th className="p-3">Commented Text</th>
                <th className="p-3">Target Content (Poem / Story)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {comments.map((com) => (
                <tr key={com.id} className="hover:bg-secondary/20 transition-all">
                  {/* User Profile */}
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={com.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${com.userUsername}`}
                        alt={com.userName}
                        className="w-8 h-8 rounded-full border border-primary/20 bg-secondary shrink-0"
                      />
                      <div className="min-w-0">
                        <strong className="block text-foreground truncate">@{com.userUsername}</strong>
                        <span className="block text-[10px] text-muted-foreground truncate">{com.userName}</span>
                      </div>
                    </div>
                  </td>

                  {/* Comment text */}
                  <td className="p-3 max-w-[280px]">
                    <div className="space-y-1">
                      <p className="text-foreground leading-relaxed break-words font-semibold">"{com.content}"</p>
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(com.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </td>

                  {/* Poem / Story Linked Details */}
                  <td className="p-3 max-w-[220px]">
                    <div className="space-y-1">
                      <Link
                        href={`/${com.contentType}/${com.contentId}`}
                        className="font-bold text-foreground hover:text-primary transition-all flex items-center gap-1 hover:underline truncate"
                      >
                        <LinkIcon className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                        <span>{com.contentTitle}</span>
                      </Link>
                      <span className={`inline-flex px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-[8px] ${
                        com.contentType === 'poem' 
                          ? 'bg-primary/10 text-primary' 
                          : com.contentType === 'story' 
                            ? 'bg-indigo-500/10 text-indigo-400' 
                            : 'bg-pink-500/10 text-pink-400'
                      }`}>
                        {com.contentType}
                      </span>
                    </div>
                  </td>

                  {/* Visibility status */}
                  <td className="p-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px] ${
                      com.isHidden
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {com.isHidden ? 'Hidden' : 'Approved'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleTogglePin(com)}
                      className={`p-1 rounded hover:bg-secondary/50 transition-all ${
                        com.isPinned ? 'text-amber-400' : 'text-muted-foreground'
                      }`}
                      title={com.isPinned ? 'Unpin Comment' : 'Pin Comment'}
                    >
                      <Pin className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => handleToggleHide(com)}
                      className={`p-1 rounded hover:bg-secondary/50 transition-all ${
                        com.isHidden ? 'text-rose-400' : 'text-muted-foreground hover:text-emerald-400'
                      }`}
                      title={com.isHidden ? 'Approve Comment' : 'Hide Comment'}
                    >
                      {com.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteComment(com)}
                      className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      title="Delete Comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border/40 rounded-3xl p-6">
          <MessageSquare className="w-12 h-12 text-muted-foreground/35 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">No comments in moderation queue.</p>
        </div>
      )}
    </div>
  );
}
