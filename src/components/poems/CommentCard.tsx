'use client';

import { useState } from 'react';
import { Comment, CommentReply } from '@/types';
import { useStore } from '@/store/useStore';
import { Calendar, Trash2, Edit3, CornerDownRight } from 'lucide-react';
import { dbService } from '@/services/db';
import { toast } from 'sonner';

interface CommentCardProps {
  comment: Comment;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
}

export default function CommentCard({ comment, onDelete, onRefresh }: CommentCardProps) {
  const { user } = useStore();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.content);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [submittingCommentEdit, setSubmittingCommentEdit] = useState(false);

  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyText, setEditReplyText] = useState('');

  const isLoggedIn = !!user;
  const isCommentOwner = user?.id === comment.userId;
  const isModerator = user?.role === 'admin';
  const canDeleteComment = isCommentOwner || isModerator;

  const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleEditCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setSubmittingCommentEdit(true);
    try {
      await dbService.updateCommentStatus(comment.id, { content: editText.trim() });
      toast.success('Comment updated successfully.');
      setIsEditingComment(false);
      if (onRefresh) onRefresh();
    } catch {
      toast.error('Failed to update comment.');
    } finally {
      setSubmittingCommentEdit(false);
    }
  };

  const handleAddReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await dbService.addCommentReply(comment.id, {
        userId: user.id,
        userName: user.name,
        userUsername: user.username,
        userAvatar: user.avatarUrl || undefined,
        content: replyText.trim()
      });
      toast.success('Reply added.');
      setReplyText('');
      setIsReplying(false);
      if (onRefresh) onRefresh();
    } catch {
      toast.error('Failed to submit reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEditReplySubmit = async (replyId: string) => {
    if (!editReplyText.trim()) return;
    try {
      await dbService.updateCommentReply(comment.id, replyId, editReplyText.trim());
      toast.success('Reply updated.');
      setEditingReplyId(null);
      if (onRefresh) onRefresh();
    } catch {
      toast.error('Failed to update reply.');
    }
  };

  const handleDeleteReplyClick = async (replyId: string) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;
    try {
      await dbService.deleteCommentReply(comment.id, replyId);
      toast.success('Reply deleted.');
      if (onRefresh) onRefresh();
    } catch {
      toast.error('Failed to delete reply.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl border border-border/40 bg-secondary/20 flex gap-3">
        <img
          src={comment.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.userUsername}`}
          alt={comment.userName}
          className="w-8 h-8 rounded-full bg-secondary shrink-0 object-cover border border-border/10"
        />

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

          {isEditingComment ? (
            <form onSubmit={handleEditCommentSubmit} className="mt-2 space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/60 text-xs focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition-all text-foreground"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingComment(false);
                    setEditText(comment.content);
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase bg-secondary/40 hover:bg-secondary rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCommentEdit || !editText.trim()}
                  className="px-2.5 py-1 text-[10px] font-bold text-primary-foreground uppercase bg-primary hover:bg-primary/95 rounded-lg disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-foreground/90 leading-relaxed break-words font-sans">
              {comment.content}
            </p>
          )}

          {!isEditingComment && (
            <div className="flex items-center gap-3.5 mt-2.5 select-none">
              {isLoggedIn && (
                <button
                  onClick={() => {
                    setIsReplying(!isReplying);
                    setReplyText('');
                  }}
                  className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline"
                >
                  Reply
                </button>
              )}
              {isCommentOwner && (
                <button
                  onClick={() => setIsEditingComment(true)}
                  className="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-wider flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>
          )}
        </div>

        {canDeleteComment && onDelete && (
          <button
            onClick={() => onDelete(comment.id)}
            className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 self-start transition-all"
            title="Delete Comment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isReplying && (
        <form onSubmit={handleAddReplySubmit} className="pl-6 flex gap-2 items-start mt-2">
          <CornerDownRight className="w-4 h-4 text-muted-foreground/60 mt-2.5 shrink-0" />
          <div className="flex-1 space-y-2 p-3 rounded-2xl border border-border/40 bg-secondary/10">
            <textarea
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary/80 transition-all text-foreground"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsReplying(false)}
                className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase bg-secondary/40 hover:bg-secondary rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReply || !replyText.trim()}
                className="px-2.5 py-1 text-[10px] font-bold text-primary-foreground uppercase bg-primary hover:bg-primary/95 rounded-lg disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-6 border-l-2 border-primary/20 space-y-2.5 mt-2">
          {comment.replies.map((reply) => {
            const replyDate = new Date(reply.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            const isReplyOwner = user?.id === reply.userId;
            const canDeleteReply = isReplyOwner || isModerator;

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
                      <span className="text-[11px] font-extrabold text-foreground">{reply.userName}</span>
                      <span className="text-[9px] text-muted-foreground">@{reply.userUsername}</span>
                      {reply.userUsername === 'admin' && (
                        <span className="text-[8px] bg-primary/20 text-primary border border-primary/20 px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
                          Admin Reply
                        </span>
                      )}
                    </div>
                    <span className="text-[8px] font-semibold text-muted-foreground flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {replyDate}
                    </span>
                  </div>

                  {editingReplyId === reply.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editReplyText}
                        onChange={(e) => setEditReplyText(e.target.value)}
                        rows={2}
                        className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/60 text-xs focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition-all text-foreground"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingReplyId(null)}
                          className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase bg-secondary/40 hover:bg-secondary rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditReplySubmit(reply.id)}
                          className="px-2.5 py-1 text-[10px] font-bold text-primary-foreground uppercase bg-primary hover:bg-primary/95 rounded-lg"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[12px] text-foreground/90 leading-relaxed break-words font-sans">
                        {reply.content}
                      </p>
                      
                      {isReplyOwner && (
                        <button
                          onClick={() => {
                            setEditingReplyId(reply.id);
                            setEditReplyText(reply.content);
                          }}
                          className="text-[9px] font-black text-muted-foreground hover:text-foreground uppercase tracking-wider flex items-center gap-0.5 mt-1"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          Edit
                        </button>
                      )}
                    </>
                  )}
                </div>

                {canDeleteReply && (
                  <button
                    onClick={() => handleDeleteReplyClick(reply.id)}
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
