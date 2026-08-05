export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  role: 'user' | 'admin';
  followersCount: number;
  followingCount: number;
  blockedUserIds?: string[];
  readingStreak?: number;
  badges?: string[];
  profileCompletion?: number;
  createdAt: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  streakCount?: number;
  lastActiveDate?: string;
  totalPoemsRead?: number;
  totalStoriesRead?: number;
  totalQuotesRead?: number;
  readingHistory?: ReadingHistoryItem[];
  referrer?: string;
}

export interface Poem {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  language: 'ta' | 'en';
  slug: string;
  categorySlug: string;
  categoryName: string;
  likesCount: number;
  commentsCount: number;
  favoritesCount: number;
  viewsCount: number;
  sharesCount?: number;
  downloadsCount?: number;
  readingTime?: number;
  mood?: string;
  tags: string[];
  audioUrl?: string;
  audioDuration?: string;
  status: 'published' | 'draft' | 'pending';
  publishSchedule?: string; // Scheduled publish date ISO string
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
  category?: 'poem';
  isPublished?: boolean;
  genre?: string;
}

export interface Story {
  id: string;
  title: string;
  subtitle?: string;
  coverUrl?: string;
  author: string;
  category: 'story';
  genre?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  readingTime: number;
  tags: string[];
  status: 'published' | 'draft';
  likesCount: number;
  commentsCount: number;
  sharesCount?: number;
  viewsCount?: number;
  downloadsCount?: number;
  isPublished?: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameTa: string;
  slug: string;
  description: string;
  descriptionTa: string;
  imageUrl: string;
  poemsCount: number;
  storiesCount?: number;
}

export interface Like {
  id: string;
  userId: string;
  contentId: string; // poemId, storyId, or quoteId
  contentType: 'poem' | 'story' | 'quote';
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  poemId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  contentId: string; // poemId, storyId, or quoteId
  contentType: 'poem' | 'story' | 'quote';
  contentTitle: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar?: string;
  content: string;
  replies?: CommentReply[];
  isPinned?: boolean;
  isHidden?: boolean;
  createdAt: string;
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  userId: string;
  poemIds: string[];
  storyIds?: string[];
  quoteIds?: string[];
  isPrivate: boolean;
  createdAt: string;
}

export interface Follower {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: 'like' | 'comment' | 'follow' | 'system' | 'mention' | 'achievement';
  poemId?: string;
  poemTitle?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  poemId: string;
  poemTitle: string;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface ReadingHistory {
  id: string;
  userId: string;
  poemId: string;
  poemTitle: string;
  viewedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  nameTa?: string;
  slug: string;
  count: number;
}

export interface AudioTrack {
  id: string;
  poemId: string;
  poemTitle: string;
  title: string;
  url: string;
  duration: string;
  speakerId: string;
  speakerName: string;
  likesCount: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: 'login' | 'view_poem' | 'like_poem' | 'comment_poem' | 'bookmark_poem' | 'share_poem' | 'audio_play' | 'download_poem';
  targetId?: string;
  details?: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface VisitorLog {
  id: string;
  timestamp: string;
  deviceType: string;
  browser: string;
  referrer: string;
  country: string;
  path: string;
  visitorId?: string;
}

export interface ReadingHistoryItem {
  id: string;
  type: 'poem' | 'story' | 'quote';
  title: string;
  timestamp: string;
}

export interface VisitorProfile {
  id: string;
  username: string;
  firstVisit: string;
  lastActive: string;
  totalStoriesRead: number;
  totalPoemsRead: number;
  totalQuotesRead?: number;
  totalTimeSpent: number; // in seconds
  deviceType: string;
  browser: string;
  country: string;
  visitsCount: number;
  readingHistory: ReadingHistoryItem[];
  referrer: string;
}

export interface Quote {
  id: string;
  content: string;
  author: string;
  category: 'thought' | 'quote';
  genre?: string;
  tags?: string[];
  status: 'published' | 'draft';
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  sharesCount?: number;
  createdAt: string;
  updatedAt?: string;
  isPublished?: boolean;
}

export interface Submission {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  contentType: 'poem' | 'story' | 'thought' | 'quote';
  title: string;
  content: string;
  coverUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  improvementSuggestions?: string;
  categorySlug?: string;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserQuery {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied';
  replyMessage?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}
