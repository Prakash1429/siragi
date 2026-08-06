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
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);

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

  const handleAddReply = async (comment: Comment) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const newReply = {
        id: `reply-${Date.now()}`,
        userId: 'admin',
        userName: 'Admin',
        userUsername: 'admin',
        content: replyText.trim(),
        createdAt: new Date().toISOString()
      };

      const updatedReplies = editingReplyId 
        ? (comment.replies || []).map(r => r.id === editingReplyId ? { ...r, content: replyText.trim() } : r)
        : [...(comment.replies || []), newReply];

      await dbService.updateCommentStatus(comment.id, { replies: updatedReplies });
      
      if (!editingReplyId) {
        try {
          const userProfile = await dbService.getUserById(comment.userId);
          if (!userProfile || userProfile.enableNotifications !== false) {
            await dbService.addNotification({
              recipientId: comment.userId,
              senderId: 'admin',
              senderName: 'Admin',
              type: 'comment',
              message: `Admin replied to your comment: "${replyText.trim()}"`,
              read: false,
              poemId: comment.contentId,
              poemTitle: comment.contentTitle
            });
          }
        } catch (err) {
          console.error('Error logging reply notification:', err);
        }
      }

      toast.success(editingReplyId ? 'Reply updated.' : 'Reply posted.');
      setReplyingCommentId(null);
      setEditingReplyId(null);
      setReplyText('');
      loadAllComments();
    } catch {
      toast.error('Failed to submit reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (comment: Comment, replyId: string) => {
    try {
      const updatedReplies = (comment.replies || []).filter(r => r.id !== replyId);
      await dbService.updateCommentStatus(comment.id, { replies: updatedReplies });
      toast.success('Reply deleted.');
      loadAllComments();
    } catch {
      toast.error('Failed to delete reply.');
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
                    <div className="space-y-2">
                      <div>
                        <p className="text-foreground leading-relaxed break-words font-semibold">"{com.content}"</p>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-medium mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(com.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Display replies if they exist */}
                      {com.replies && com.replies.length > 0 && (
                        <div className="pl-3 border-l-2 border-primary/20 space-y-1.5 mt-2">
                          {com.replies.map((reply) => (
                            <div key={reply.id} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10 text-[11px] space-y-1">
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <span className="font-extrabold text-primary text-[10px]">Admin Reply</span>
                                <span className="text-[8px] text-muted-foreground">{new Date(reply.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-foreground/90 font-medium leading-normal break-words">{reply.content}</p>
                              
                              <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-border/20">
                                <button
                                  onClick={() => {
                                    setReplyingCommentId(com.id);
                                    setEditingReplyId(reply.id);
                                    setReplyText(reply.content);
                                  }}
                                  className="text-[9px] font-bold text-primary hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteReply(com, reply.id)}
                                  className="text-[9px] font-bold text-rose-400 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply textbox or trigger */}
                      {replyingCommentId === com.id ? (
                        <div className="space-y-1.5 mt-2 p-2.5 rounded-xl border border-border/40 bg-secondary/15">
                          <textarea
                            placeholder="Write an admin reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={2}
                            className="w-full p-2 rounded-lg bg-secondary/35 border border-border/50 text-[11px] text-foreground focus:outline-none focus:border-primary font-medium"
                          />
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => {
                                setReplyingCommentId(null);
                                setEditingReplyId(null);
                                setReplyText('');
                              }}
                              className="px-2 py-1 text-[9px] font-bold text-muted-foreground uppercase bg-secondary/40 hover:bg-secondary rounded"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAddReply(com)}
                              disabled={submittingReply || !replyText.trim()}
                              className="px-2 py-1 text-[9px] font-bold text-primary-foreground uppercase bg-primary hover:bg-primary/95 rounded disabled:opacity-50"
                            >
                              {submittingReply ? 'Saving...' : 'Submit'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        (!com.replies || com.replies.length === 0) && (
                          <button
                            onClick={() => {
                              setReplyingCommentId(com.id);
                              setEditingReplyId(null);
                              setReplyText('');
                            }}
                            className="mt-1 text-[10px] font-black text-primary uppercase tracking-wider hover:underline block text-left"
                          >
                            Reply
                          </button>
                        )
                      )}
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
