'use client';

import React, { useEffect, useState } from 'react';
import { Story, Comment } from '@/types';
import { dbService } from '@/services/db';
import { useStore } from '@/store/useStore';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import CommentCard from '@/components/poems/CommentCard';
import { Heart, MessageSquare, Calendar, Clock, ArrowLeft, ArrowRight, User, Bookmark, FolderHeart } from 'lucide-react';
import ShareMenu from '@/components/shared/ShareMenu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AddToCollectionModal from '@/components/shared/AddToCollectionModal';

interface StoryPageProps {
  params: Promise<{ id: string }>;
}

export default function StoryDetailPage({ params }: StoryPageProps) {
  const { id } = React.use(params);
  const { user } = useStore();

  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Previous/Next Navigation
  const [prevId, setPrevId] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string | null>(null);

  // 1. Initial Page Load & Analytics Logging (only runs once per id)
  useEffect(() => {
    async function loadStoryDetails() {
      try {
        const data = await dbService.getStoryById(id);
        if (data) {
          setStory(data);
          setLikesCount(data.likesCount);

          const commentList = await dbService.getComments(id);
          setComments(commentList);

          // Fetch sibling stories for navigation
          const allStories = await dbService.getStories('published');
          const currentIdx = allStories.findIndex(s => s.id === id);
          if (currentIdx > 0) setNextId(allStories[currentIdx - 1].id);
          if (currentIdx !== -1 && currentIdx < allStories.length - 1) setPrevId(allStories[currentIdx + 1].id);

          // Increment view count & log visitor (with rate limiting to prevent accidental refreshes)
          const lastViewedKey = `siragii_last_viewed_story_${id}`;
          const lastViewed = localStorage.getItem(lastViewedKey);
          const nowStr = Date.now().toString();
          
          if (!lastViewed || Date.now() - parseInt(lastViewed, 10) > 5000) {
            await dbService.incrementViews(id, 'story');
            await dbService.logVisitor(`/story/${id}`);
            localStorage.setItem(lastViewedKey, nowStr);
          }
          
          // ALWAYS record to unique visitor reading history profile
          const visitorId = user?.id || localStorage.getItem('siragii_visitor_id');
          if (visitorId) {
            await dbService.recordContentRead(visitorId, id, 'story', data.title);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStoryDetails();
  }, [id, user]);

  // 2. User Session-specific checks (liked & favorited state)
  useEffect(() => {
    async function checkUserInteractions() {
      if (!user) return;
      try {
        const [liked, fav] = await Promise.all([
          dbService.hasLikedContent(id, user.id),
          dbService.hasFavorited(id, user.id)
        ]);
        setIsLiked(liked);
        setIsFavorited(fav);
      } catch (err) {
        console.error('Error checking user interactions:', err);
      }
    }
    checkUserInteractions();
  }, [id, user]);

  const handleLike = async () => {
    if (!user || !story) {
      toast.error('Please login to like stories.');
      return;
    }
    const liked = await dbService.likeContent(story.id, 'story', user.id);
    setIsLiked(liked);
    setLikesCount(prev => liked ? prev + 1 : Math.max(0, prev - 1));
  };

  const handleFavorite = async () => {
    if (!user || !story) {
      toast.error('Please configure your username first.');
      return;
    }
    const fav = await dbService.favoriteStory(story.id, user.id);
    setIsFavorited(fav);
    toast.success(fav ? 'Added to library!' : 'Removed from library.');
  };

  const handleShare = async () => {
    if (!story) return;
    const url = `${window.location.origin}/story/${story.id}`;
    try {
      await navigator.clipboard.writeText(url);
      await dbService.incrementShares(story.id, 'story');
      toast.success('Story link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !story) {
      toast.error('Please login to comment.');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const added = await dbService.addComment({
        contentId: story.id,
        contentType: 'story',
        contentTitle: story.title,
        userId: user.id,
        userName: user.name,
        userUsername: user.username,
        userAvatar: user.avatarUrl,
        content: newComment.trim(),
      });
      setComments(prev => [...prev, added]);
      setNewComment('');
      toast.success('Comment posted!');
    } catch {
      toast.error('Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <LoadingSkeleton type="profile" />;
  if (!story) return <div className="text-center py-20 font-bold">Story not found.</div>;

  return (
    <>
      <div className="space-y-8 max-w-4xl mx-auto px-4">
      <Breadcrumb
        items={[
          { label: 'Stories', href: '/stories' },
          { label: story.title },
        ]}
      />

      <article className="rounded-3xl border border-border/40 glass-card overflow-hidden">
        {/* Cover Photo */}
        {story.coverUrl && (
          <div className="h-64 md:h-80 w-full relative">
            <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
          </div>
        )}

        <div className="p-6 md:p-10 space-y-6">
          {/* Header Metadata */}
          <div className="flex items-center justify-between gap-4 border-b border-border/20 pb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-4 h-4 text-primary" />
              <span className="font-bold text-foreground">By {story.author}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(story.createdAt).toLocaleDateString()}</span>
            </div>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {story.readingTime} min read
            </span>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-foreground">{story.title}</h1>
            {story.subtitle && <p className="text-sm text-muted-foreground italic">{story.subtitle}</p>}
          </div>

          {/* Content */}
          <div className="text-sm md:text-base leading-relaxed font-sans text-foreground/90 whitespace-pre-line space-y-4 pt-4">
            {story.content}
          </div>

          {/* Interaction Bar */}
          <div className="border-t border-border/20 pt-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-2 text-xs font-bold transition-all hover:scale-105",
                  isLiked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
                )}
              >
                <Heart className={cn("w-4.5 h-4.5", isLiked && "fill-rose-500")} />
                <span>{likesCount} Likes</span>
              </button>
              <span className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                <MessageSquare className="w-4.5 h-4.5" />
                <span>{comments.length} Comments</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ShareMenu contentId={story.id} contentType="story" title={story.title} />
              <button
                onClick={() => setShowCollectionModal(true)}
                className="p-2.5 rounded-xl border border-border/40 text-white hover:text-primary bg-slate-950/40 transition-all hover:scale-110 active:scale-95 shadow-md backdrop-blur-sm"
                title="Add to Collection"
              >
                <FolderHeart className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={handleFavorite}
                className={cn(
                  "p-2.5 rounded-xl border transition-all hover:scale-110 active:scale-95 shadow-md backdrop-blur-sm",
                  isFavorited
                    ? "bg-rose-500/10 border-rose-500/25 text-rose-500"
                    : "border-border/40 text-white hover:text-rose-500 bg-slate-950/40"
                )}
                title={isFavorited ? "Remove from Library" : "Save to Library"}
              >
                <Heart className={cn("w-4.5 h-4.5 transition-all duration-300", isFavorited && "fill-rose-500")} />
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Sibling navigation */}
      <div className="flex items-center justify-between gap-4">
        {prevId ? (
          <Link
            href={`/story/${prevId}`}
            className="flex items-center gap-1.5 text-xs font-bold hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Story</span>
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground/45 flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4 opacity-50" />
            No Previous Story
          </span>
        )}

        {nextId ? (
          <Link
            href={`/story/${nextId}`}
            className="flex items-center gap-1.5 text-xs font-bold hover:text-primary transition-colors"
          >
            <span>Next Story</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground/45 flex items-center gap-1.5">
            No Next Story
            <ArrowRight className="w-4 h-4 opacity-50" />
          </span>
        )}
      </div>

      {/* Comment Section */}
      <section className="space-y-6">
        <h3 className="text-base font-bold text-foreground">Discussions</h3>
        <form onSubmit={handleAddComment} className="flex flex-col gap-3">
          <textarea
            placeholder="Add to the conversation..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="w-full p-4 rounded-2xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary text-foreground"
          />
          <button
            type="submit"
            disabled={submittingComment || !newComment.trim()}
            className="self-end px-5 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl transition-all shadow-md"
          >
            {submittingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} onDelete={() => {}} />
          ))}
        </div>
      </section>
      </div>

      {showCollectionModal && (
        <AddToCollectionModal
          itemId={story.id}
          itemType="story"
          onClose={() => setShowCollectionModal(false)}
        />
      )}
    </>
  );
}
