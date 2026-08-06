import { Poem, Category, Comment, Collection, AudioTrack, User, Report, ActivityLog, Achievement, Story, Like, VisitorLog, VisitorProfile, ReadingHistoryItem, Quote, Submission, UserQuery, Notification } from '@/types';
import { mockCategories, mockQuotes, mockAchievements } from '@/lib/firebase/mockData';
import { db, isFirebaseConfigured } from '@/lib/firebase/firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit
} from 'firebase/firestore';

const isClient = typeof window !== 'undefined';

// Helper to recursively remove undefined properties from objects before saving to Firestore
function cleanUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined).filter(val => val !== undefined);
  }
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      cleaned[key] = cleanUndefined(obj[key]);
    }
  }
  return cleaned;
}

// Local storage persistent database helpers for local-mock mode
const getPoems = (): Poem[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem('siragii_poems');
  return stored ? JSON.parse(stored) : [];
};
const setPoems = (list: Poem[]) => {
  if (isClient) localStorage.setItem('siragii_poems', JSON.stringify(list));
};

const getStories = (): Story[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem('siragii_stories');
  return stored ? JSON.parse(stored) : [];
};
const setStories = (list: Story[]) => {
  if (isClient) localStorage.setItem('siragii_stories', JSON.stringify(list));
};

const getQuotes = (): Quote[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem('siragii_quotes');
  return stored ? JSON.parse(stored) : [];
};
const setQuotes = (list: Quote[]) => {
  if (isClient) localStorage.setItem('siragii_quotes', JSON.stringify(list));
};

const getComments = (): Comment[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem('siragii_comments');
  return stored ? JSON.parse(stored) : [];
};
const setComments = (list: Comment[]) => {
  if (isClient) localStorage.setItem('siragii_comments', JSON.stringify(list));
};

const getNotifications = (): Notification[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem('siragii_notifications');
  return stored ? JSON.parse(stored) : [];
};
const setNotifications = (list: Notification[]) => {
  if (isClient) localStorage.setItem('siragii_notifications', JSON.stringify(list));
};

const getLikes = (): string[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem('siragii_likes');
  return stored ? JSON.parse(stored) : [];
};
const setLikes = (list: string[]) => {
  if (isClient) localStorage.setItem('siragii_likes', JSON.stringify(list));
};

const getFavorites = (): { [userId: string]: string[] } => {
  if (!isClient) return {};
  const stored = localStorage.getItem('siragii_favorites');
  return stored ? JSON.parse(stored) : {};
};
const setFavorites = (favs: { [userId: string]: string[] }) => {
  if (isClient) localStorage.setItem('siragii_favorites', JSON.stringify(favs));
};

const getVisitorLogs = (): VisitorLog[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem('siragii_visitors');
  return stored ? JSON.parse(stored) : [];
};
const setVisitorLogs = (list: VisitorLog[]) => {
  if (isClient) localStorage.setItem('siragii_visitors', JSON.stringify(list));
};

const getVisitorProfilesLocal = (): VisitorProfile[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem('siragii_visitor_profiles');
  return stored ? JSON.parse(stored) : [];
};
const setVisitorProfilesLocal = (list: VisitorProfile[]) => {
  if (isClient) localStorage.setItem('siragii_visitor_profiles', JSON.stringify(list));
};

const getSubmissions = (): Submission[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem('siragii_submissions');
  return stored ? JSON.parse(stored) : [];
};
const setSubmissions = (list: Submission[]) => {
  if (isClient) localStorage.setItem('siragii_submissions', JSON.stringify(list));
};

const getQueries = (): UserQuery[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem('siragii_queries');
  return stored ? JSON.parse(stored) : [];
};
const setQueries = (list: UserQuery[]) => {
  if (isClient) localStorage.setItem('siragii_queries', JSON.stringify(list));
};

const getReports = (): Report[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem('siragii_reports');
  return stored ? JSON.parse(stored) : [];
};
const setReports = (list: Report[]) => {
  if (isClient) localStorage.setItem('siragii_reports', JSON.stringify(list));
};

const getLocalCollections = (): Collection[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem('siragii_collections');
  return stored ? JSON.parse(stored) : [];
};
const setLocalCollections = (list: Collection[]) => {
  if (isClient) localStorage.setItem('siragii_collections', JSON.stringify(list));
};

// In-Memory state for collections, users, and activities
let localCollections: Collection[] = [];
let localUsers: User[] = [
  {
    id: 'admin-id',
    name: 'Administrator',
    email: 'admin@siragii.com',
    username: 'admin',
    role: 'admin',
    followersCount: 0,
    followingCount: 0,
    createdAt: '2026-01-15T00:00:00Z',
  }
];
let localActivities: ActivityLog[] = [];
let localSearchHistory: string[] = [];
let localBlockedUsers: { [userId: string]: string[] } = {};
let localFollowers: { [followingId: string]: string[] } = {};

export const dbService = {
  // --- VISITOR ANALYTICS TRACKING ---
  async logVisitor(path: string): Promise<void> {
    if (typeof window === 'undefined') return;

    // Exclude administrative routes from visitor tracking
    if (path.startsWith('/admin')) return;

    const userAgent = window.navigator.userAgent;
    let browser = 'Unknown';
    if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    let deviceType = 'Desktop';
    if (/Mobi|Android|iPhone/i.test(userAgent)) deviceType = 'Mobile';
    else if (/Tablet|iPad/i.test(userAgent)) deviceType = 'Tablet';

    // Persistent visitorId in localStorage to identify unique users clicking links
    let visitorId = localStorage.getItem('siragii_visitor_id');
    if (!visitorId) {
      visitorId = `vis-id-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
      localStorage.setItem('siragii_visitor_id', visitorId);
    }

    const newLog: VisitorLog = {
      id: `vis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      deviceType,
      browser,
      referrer: document.referrer || 'Direct',
      country: 'India', // Mock geolocation fallback
      path,
      visitorId
    };

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'visitors'), cleanUndefined(newLog));
      } catch (err) {
        console.error('Error logging visitor to Firestore:', err);
      }
    }
    
    const logs = getVisitorLogs();
    logs.push(newLog);
    setVisitorLogs(logs);
  },

  async getVisitorAnalytics(): Promise<any> {
    let logs = getVisitorLogs();
    
    if (isFirebaseConfigured && db) {
      try {
        logs = (await getDocs(collection(db, 'visitors'))).docs.map(d => d.data() as VisitorLog);
      } catch (err) {
        console.error('Error fetching visitor logs from Firestore:', err);
      }
    }

    // Filter to ONLY count real views/clicks on content detail pages (no fake page views)
    const contentLogs = logs.filter(l => l.path && (l.path.startsWith('/poem') || l.path.startsWith('/story') || l.path.startsWith('/quote') || l.path.startsWith('/quotes')));

    // Filter by daily, weekly, monthly unique users
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayLogs = contentLogs.filter(l => new Date(l.timestamp) >= oneDayAgo);
    const weeklyLogs = contentLogs.filter(l => new Date(l.timestamp) >= oneWeekAgo);
    const monthlyLogs = contentLogs.filter(l => new Date(l.timestamp) >= oneMonthAgo);

    const today = new Set(todayLogs.map(l => l.visitorId || l.id)).size;
    const weekly = new Set(weeklyLogs.map(l => l.visitorId || l.id)).size;
    const monthly = new Set(monthlyLogs.map(l => l.visitorId || l.id)).size;

    // Device breakdown
    const devicesMap: { [key: string]: number } = {};
    const browsersMap: { [key: string]: number } = {};
    const referrersMap: { [key: string]: number } = {};

    contentLogs.forEach(l => {
      devicesMap[l.deviceType] = (devicesMap[l.deviceType] || 0) + 1;
      browsersMap[l.browser] = (browsersMap[l.browser] || 0) + 1;
      referrersMap[l.referrer] = (referrersMap[l.referrer] || 0) + 1;
    });

    const deviceUsage = Object.keys(devicesMap).map(k => ({ name: k, value: devicesMap[k] }));
    const browsers = Object.keys(browsersMap).map(k => ({ name: k, value: browsersMap[k] }));
    const trafficSources = Object.keys(referrersMap).map(k => ({ name: k, value: referrersMap[k] }));

    const uniqueUsersCount = new Set(contentLogs.map(l => l.visitorId || l.id)).size;

    return {
      total: uniqueUsersCount,
      today,
      weekly,
      monthly,
      deviceUsage: deviceUsage.length > 0 ? deviceUsage : [{ name: 'Desktop', value: 1 }],
      browsers,
      trafficSources: trafficSources.length > 0 ? trafficSources : [{ name: 'Direct', value: 1 }]
    };
  },

  // --- ACTIVITY LOGS & TRACKING ---
  async logActivity(userId: string, action: ActivityLog['action'], targetId?: string, details?: string): Promise<void> {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId,
      action,
      targetId,
      details,
      createdAt: new Date().toISOString()
    };
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'activity_logs'), cleanUndefined(newLog));
      } catch (err) {
        console.error(err);
      }
    }
    localActivities.unshift(newLog);
  },

  async getActivityLogs(userId: string): Promise<ActivityLog[]> {
    return localActivities.filter(l => l.userId === userId).slice(0, 15);
  },

  async getAchievements(userId: string): Promise<Achievement[]> {
    return mockAchievements;
  },

  // --- SEARCH HISTORY ---
  async logSearch(queryText: string): Promise<void> {
    if (!localSearchHistory.includes(queryText)) {
      localSearchHistory.unshift(queryText);
    }
  },

  async getSearchHistory(): Promise<string[]> {
    return localSearchHistory.slice(0, 6);
  },

  // --- USERS & BLOCKS ---
  async getUsers(): Promise<User[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        return snap.docs.map(d => d.data() as User);
      } catch (err) {
        console.error('Error fetching users from Firestore:', err);
      }
    }
    return localUsers;
  },

  async getUserById(id: string): Promise<User | null> {
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, 'users', id));
        return docSnap.exists() ? (docSnap.data() as User) : null;
      } catch (err) {
        console.error('Error fetching user from Firestore:', err);
      }
    }
    return localUsers.find(u => u.id === id) || null;
  },

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', id), cleanUndefined(data));
      } catch (err) {
        console.error('Error updating user in Firestore:', err);
      }
    }
    const idx = localUsers.findIndex(u => u.id === id);
    if (idx !== -1) {
      localUsers[idx] = { ...localUsers[idx], ...data };
    }
  },

  async blockUser(userId: string, targetId: string): Promise<void> {
    if (!localBlockedUsers[userId]) localBlockedUsers[userId] = [];
    if (!localBlockedUsers[userId].includes(targetId)) {
      localBlockedUsers[userId].push(targetId);
    }
  },

  async isBlocked(userId: string, targetId: string): Promise<boolean> {
    return localBlockedUsers[userId]?.includes(targetId) || false;
  },

  // --- FOLLOWERS ---
  async followUser(userId: string, targetId: string): Promise<boolean> {
    if (!localFollowers[targetId]) localFollowers[targetId] = [];
    const idx = localFollowers[targetId].indexOf(userId);
    const followingUser = localUsers.find(u => u.id === userId);
    const targetUser = localUsers.find(u => u.id === targetId);

    if (idx !== -1) {
      localFollowers[targetId].splice(idx, 1);
      if (followingUser) followingUser.followingCount = Math.max(0, followingUser.followingCount - 1);
      if (targetUser) targetUser.followersCount = Math.max(0, targetUser.followersCount - 1);
      return false;
    } else {
      localFollowers[targetId].push(userId);
      if (followingUser) followingUser.followingCount += 1;
      if (targetUser) targetUser.followersCount += 1;
      return true;
    }
  },

  async isFollowing(userId: string, targetId: string): Promise<boolean> {
    return localFollowers[targetId]?.includes(userId) || false;
  },

  // --- POEMS CRUD ---
  async getPoems(status: 'published' | 'pending' | 'draft' = 'published'): Promise<Poem[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'poems'), where('status', '==', status), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Poem));
      } catch (err) {
        console.error('Error fetching poems from Firestore (falling back to localStorage):', err);
      }
    }
    return getPoems().filter(p => p.status === status);
  },

  async getPoemById(id: string): Promise<Poem | null> {
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, 'poems', id));
        return docSnap.exists() ? ({ ...docSnap.data(), id: docSnap.id } as Poem) : null;
      } catch (err) {
        console.error('Error fetching poem by ID from Firestore (falling back to localStorage):', err);
      }
    }
    return getPoems().find(p => p.id === id) || null;
  },

  async createPoem(poem: Omit<Poem, 'id' | 'likesCount' | 'commentsCount' | 'favoritesCount' | 'viewsCount'>): Promise<Poem> {
    const newPoem: Poem = {
      ...poem,
      id: `poem-${Date.now()}`,
      likesCount: 0,
      commentsCount: 0,
      favoritesCount: 0,
      viewsCount: 0,
      sharesCount: 0,
      downloadsCount: 0,
      category: 'poem',
      isPublished: poem.status === 'published',
      readingTime: Math.max(1, Math.ceil(poem.content.split(/\s+/).length / 120)),
    };

    // 1. Always write to local storage first to guarantee persistence
    const list = getPoems();
    list.unshift(newPoem);
    setPoems(list);

    // 2. Try writing to Firestore and propagate error if it fails
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'poems', newPoem.id), cleanUndefined(newPoem));
      } catch (err) {
        console.error('Error saving poem to Firestore:', err);
        throw err;
      }
    }
    
    return newPoem;
  },

  async updatePoem(id: string, data: Partial<Poem>): Promise<void> {
    // 1. Update local storage
    const list = getPoems();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      const isPublished = data.status !== undefined ? data.status === 'published' : list[idx].isPublished;
      list[idx] = { ...list[idx], ...data, isPublished, updatedAt: new Date().toISOString() };
      setPoems(list);
    }

    // 2. Try updating Firestore and propagate error if it fails
    if (isFirebaseConfigured && db) {
      try {
        const updateData: any = { ...data };
        if (data.status !== undefined) {
          updateData.isPublished = data.status === 'published';
        }
        await updateDoc(doc(db, 'poems', id), cleanUndefined(updateData));
      } catch (err) {
        console.error('Error updating poem in Firestore:', err);
        throw err;
      }
    }
  },

  async deletePoem(id: string): Promise<void> {
    // 1. Delete from local storage
    const list = getPoems().filter(p => p.id !== id);
    setPoems(list);

    // 2. Try deleting from Firestore and propagate error if it fails
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'poems', id));
      } catch (err) {
        console.error('Error deleting poem from Firestore:', err);
        throw err;
      }
    }
  },

  async incrementViews(id: string, type: 'poem' | 'story' | 'quote' = 'poem'): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        const collectionName = type === 'poem' ? 'poems' : type === 'story' ? 'stories' : 'quotes';
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const currentViews = docSnap.data().viewsCount || 0;
          await updateDoc(docRef, { viewsCount: currentViews + 1 });
        }
      } catch (err) {
        console.error('Error incrementing views in Firestore:', err);
      }
    }

    if (type === 'poem') {
      const list = getPoems();
      const idx = list.findIndex(p => p.id === id);
      if (idx !== -1) {
        list[idx].viewsCount += 1;
        setPoems(list);
      }
    } else if (type === 'story') {
      const list = getStories();
      const idx = list.findIndex(s => s.id === id);
      if (idx !== -1) {
        list[idx].viewsCount = (list[idx].viewsCount || 0) + 1;
        setStories(list);
      }
    } else {
      const list = getQuotes();
      const idx = list.findIndex(q => q.id === id);
      if (idx !== -1) {
        list[idx].viewsCount = (list[idx].viewsCount || 0) + 1;
        setQuotes(list);
      }
    }
  },

  async incrementShares(id: string, type: 'poem' | 'story' | 'quote' = 'poem'): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        const collectionName = type === 'poem' ? 'poems' : type === 'story' ? 'stories' : 'quotes';
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const currentShares = docSnap.data().sharesCount || 0;
          await updateDoc(docRef, { sharesCount: currentShares + 1 });
        }
      } catch (err) {
        console.error('Error incrementing shares in Firestore:', err);
      }
    }

    if (type === 'poem') {
      const list = getPoems();
      const idx = list.findIndex(p => p.id === id);
      if (idx !== -1) {
        list[idx].sharesCount = (list[idx].sharesCount || 0) + 1;
        setPoems(list);
      }
    } else if (type === 'story') {
      const list = getStories();
      const idx = list.findIndex(s => s.id === id);
      if (idx !== -1) {
        list[idx].sharesCount = (list[idx].sharesCount || 0) + 1;
        setStories(list);
      }
    } else if (type === 'quote') {
      const list = getQuotes();
      const idx = list.findIndex(q => q.id === id);
      if (idx !== -1) {
        list[idx].sharesCount = (list[idx].sharesCount || 0) + 1;
        setQuotes(list);
      }
    }
  },

  async incrementDownloads(id: string, type: 'poem' | 'story' | 'quote' = 'poem'): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        const collectionName = type === 'poem' ? 'poems' : type === 'story' ? 'stories' : 'quotes';
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const currentDownloads = docSnap.data().downloadsCount || 0;
          await updateDoc(docRef, { downloadsCount: currentDownloads + 1 });
        }
      } catch (err) {
        console.error('Error incrementing downloads in Firestore:', err);
      }
    }

    if (type === 'poem') {
      const list = getPoems();
      const idx = list.findIndex(p => p.id === id);
      if (idx !== -1) {
        list[idx].downloadsCount = (list[idx].downloadsCount || 0) + 1;
        setPoems(list);
      }
    } else if (type === 'story') {
      const list = getStories();
      const idx = list.findIndex(s => s.id === id);
      if (idx !== -1) {
        list[idx].downloadsCount = (list[idx].downloadsCount || 0) + 1;
        setStories(list);
      }
    } else {
      const list = getQuotes();
      const idx = list.findIndex(q => q.id === id);
      if (idx !== -1) {
        list[idx].viewsCount = (list[idx].viewsCount || 0) + 1; // fallback
        setQuotes(list);
      }
    }
  },

  // --- STORIES CRUD ---
  async getStories(status: 'published' | 'draft' = 'published'): Promise<Story[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'stories'), where('status', '==', status), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Story));
      } catch (err) {
        console.error('Error fetching stories from Firestore (falling back to localStorage):', err);
      }
    }
    return getStories().filter(s => s.status === status);
  },

  async getStoryById(id: string): Promise<Story | null> {
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, 'stories', id));
        return docSnap.exists() ? ({ ...docSnap.data(), id: docSnap.id } as Story) : null;
      } catch (err) {
        console.error('Error fetching story by ID from Firestore (falling back to localStorage):', err);
      }
    }
    return getStories().find(s => s.id === id) || null;
  },

  async createStory(story: Omit<Story, 'id' | 'likesCount' | 'commentsCount' | 'viewsCount' | 'sharesCount' | 'downloadsCount'>): Promise<Story> {
    const newStory: Story = {
      ...story,
      id: `story-${Date.now()}`,
      category: 'story',
      isPublished: story.status === 'published',
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      sharesCount: 0,
      downloadsCount: 0
    };

    // 1. Always write to local storage first
    const list = getStories();
    list.unshift(newStory);
    setStories(list);

    // 2. Try writing to Firestore and propagate error if it fails
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'stories', newStory.id), cleanUndefined(newStory));
      } catch (err) {
        console.error('Error saving story to Firestore:', err);
        throw err;
      }
    }
    
    return newStory;
  },

  async updateStory(id: string, data: Partial<Story>): Promise<void> {
    // 1. Update local storage
    const list = getStories();
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      const isPublished = data.status !== undefined ? data.status === 'published' : list[idx].isPublished;
      list[idx] = { ...list[idx], ...data, isPublished, updatedAt: new Date().toISOString() };
      setStories(list);
    }

    // 2. Try updating Firestore and propagate error if it fails
    if (isFirebaseConfigured && db) {
      try {
        const updateData: any = { ...data };
        if (data.status !== undefined) {
          updateData.isPublished = data.status === 'published';
        }
        await updateDoc(doc(db, 'stories', id), cleanUndefined(updateData));
      } catch (err) {
        console.error('Error updating story in Firestore:', err);
        throw err;
      }
    }
  },

  async deleteStory(id: string): Promise<void> {
    // 1. Delete from local storage
    const list = getStories().filter(s => s.id !== id);
    setStories(list);

    // 2. Try deleting from Firestore and propagate error if it fails
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'stories', id));
      } catch (err) {
        console.error('Error deleting story from Firestore:', err);
        throw err;
      }
    }
  },

  // --- QUOTES CRUD ---
  async getQuotes(status: 'published' | 'draft' = 'published'): Promise<Quote[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'quotes'), where('status', '==', status));
        const snap = await getDocs(q);
        return snap.docs
          .map(d => ({ ...d.data(), id: d.id } as Quote))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      } catch (err) {
        console.error('Error fetching quotes from Firestore (falling back to localStorage):', err);
      }
    }
    return getQuotes().filter(q => q.status === status);
  },

  async getQuoteById(id: string): Promise<Quote | null> {
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, 'quotes', id));
        return docSnap.exists() ? ({ ...docSnap.data(), id: docSnap.id } as Quote) : null;
      } catch (err) {
        console.error('Error fetching quote by ID from Firestore (falling back to localStorage):', err);
      }
    }
    return getQuotes().find(q => q.id === id) || null;
  },

  async saveQuote(quote: Partial<Quote>): Promise<Quote> {
    const newQuote: Quote = {
      id: quote.id || `qte-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      content: quote.content || '',
      author: quote.author || 'Anonymous',
      category: (quote.category as any) || 'quote',
      genre: quote.genre || 'General',
      tags: quote.tags || [],
      status: quote.status || 'published',
      createdAt: quote.createdAt || new Date().toISOString(),
      likesCount: quote.likesCount || 0,
      commentsCount: quote.commentsCount || 0,
      viewsCount: quote.viewsCount || 0,
      isPublished: quote.status === 'published'
    };

    // 1. Always write to local storage first
    const list = getQuotes();
    list.unshift(newQuote);
    setQuotes(list);

    // 2. Try writing to Firestore and propagate error if it fails
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'quotes', newQuote.id), cleanUndefined(newQuote));
      } catch (err) {
        console.error('Error saving quote to Firestore:', err);
        throw err;
      }
    }
    
    return newQuote;
  },

  async updateQuote(id: string, data: Partial<Quote>): Promise<void> {
    // 1. Update local storage
    const list = getQuotes();
    const idx = list.findIndex(q => q.id === id);
    if (idx !== -1) {
      const isPublished = data.status !== undefined ? data.status === 'published' : list[idx].isPublished;
      list[idx] = { ...list[idx], ...data, isPublished, updatedAt: new Date().toISOString() };
      setQuotes(list);
    }

    // 2. Try updating Firestore and propagate error if it fails
    if (isFirebaseConfigured && db) {
      try {
        const updateData: any = { ...data };
        if (data.status !== undefined) {
          updateData.isPublished = data.status === 'published';
        }
        await updateDoc(doc(db, 'quotes', id), cleanUndefined(updateData));
      } catch (err) {
        console.error('Error updating quote in Firestore:', err);
        throw err;
      }
    }
  },

  async deleteQuote(id: string): Promise<void> {
    // 1. Delete from local storage
    const list = getQuotes().filter(q => q.id !== id);
    setQuotes(list);

    // 2. Try deleting from Firestore and propagate error if it fails
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'quotes', id));
      } catch (err) {
        console.error('Error deleting quote from Firestore:', err);
        throw err;
      }
    }
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    let poemsList = getPoems();
    let storiesList = getStories();

    if (isFirebaseConfigured && db) {
      try {
        const [poemsSnap, storiesSnap] = await Promise.all([
          getDocs(collection(db, 'poems')),
          getDocs(collection(db, 'stories'))
        ]);
        poemsList = poemsSnap.docs.map(d => d.data() as Poem);
        storiesList = storiesSnap.docs.map(d => d.data() as Story);
      } catch (err) {
        console.error('Error fetching categories counts from Firestore:', err);
      }
    }

    return mockCategories.map(cat => {
      const pCount = poemsList.filter(p => p.categorySlug === cat.slug).length;
      const sCount = storiesList.filter(s => s.category?.toLowerCase() === cat.slug.toLowerCase()).length;
      return {
        ...cat,
        poemsCount: pCount,
        storiesCount: sCount
      };
    });
  },

  // --- COMMENTS ---
  async getComments(contentId: string): Promise<Comment[]> {
    let list = getComments();
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'comments'), where('contentId', '==', contentId), where('isHidden', '==', false));
        const snap = await getDocs(q);
        list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Comment));
      } catch (err) {
        console.error('Error fetching comments from Firestore:', err);
      }
    }
    return list.filter(c => !c.isHidden);
  },

  async getAllCommentsAdmin(): Promise<Comment[]> {
    let list = getComments();
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'comments'));
        list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Comment));
      } catch (err) {
        console.error('Error fetching all comments for admin:', err);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async updateCommentStatus(commentId: string, updates: Partial<Comment>): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'comments', commentId), updates);
      } catch (err) {
        console.error('Error updating comment status in Firestore:', err);
      }
    }
    const list = getComments();
    const idx = list.findIndex(c => c.id === commentId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      setComments(list);
    }
  },

  async addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'comments', newComment.id), cleanUndefined(newComment));
      } catch (err) {
        console.error('Error saving comment to Firestore:', err);
      }
    }

    const commentsList = getComments();
    commentsList.push(newComment);
    setComments(commentsList);
    
    if (comment.contentType === 'poem') {
      const list = getPoems();
      const idx = list.findIndex(p => p.id === comment.contentId);
      if (idx !== -1) {
        list[idx].commentsCount += 1;
        setPoems(list);
        if (isFirebaseConfigured && db) {
          try {
            await updateDoc(doc(db, 'poems', comment.contentId), { commentsCount: list[idx].commentsCount });
          } catch {}
        }
      }
    } else if (comment.contentType === 'story') {
      const list = getStories();
      const idx = list.findIndex(s => s.id === comment.contentId);
      if (idx !== -1) {
        list[idx].commentsCount += 1;
        setStories(list);
        if (isFirebaseConfigured && db) {
          try {
            await updateDoc(doc(db, 'stories', comment.contentId), { commentsCount: list[idx].commentsCount });
          } catch {}
        }
      }
    } else if (comment.contentType === 'quote') {
      const list = getQuotes();
      const idx = list.findIndex(q => q.id === comment.contentId);
      if (idx !== -1) {
        list[idx].commentsCount += 1;
        setQuotes(list);
        if (isFirebaseConfigured && db) {
          try {
            await updateDoc(doc(db, 'quotes', comment.contentId), { commentsCount: list[idx].commentsCount });
          } catch {}
        }
      }
    }
    return newComment;
  },

  async deleteComment(commentId: string, contentId: string, contentType: 'poem' | 'story' | 'quote' = 'poem'): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'comments', commentId));
      } catch (err) {
        console.error('Error deleting comment in Firestore:', err);
      }
    }

    const commentsList = getComments().filter(c => c.id !== commentId);
    setComments(commentsList);
    
    if (contentType === 'poem') {
      const list = getPoems();
      const idx = list.findIndex(p => p.id === contentId);
      if (idx !== -1) {
        list[idx].commentsCount = Math.max(0, list[idx].commentsCount - 1);
        setPoems(list);
        if (isFirebaseConfigured && db) {
          try {
            await updateDoc(doc(db, 'poems', contentId), { commentsCount: list[idx].commentsCount });
          } catch {}
        }
      }
    } else if (contentType === 'story') {
      const list = getStories();
      const idx = list.findIndex(s => s.id === contentId);
      if (idx !== -1) {
        list[idx].commentsCount = Math.max(0, list[idx].commentsCount - 1);
        setStories(list);
        if (isFirebaseConfigured && db) {
          try {
            await updateDoc(doc(db, 'stories', contentId), { commentsCount: list[idx].commentsCount });
          } catch {}
        }
      }
    } else if (contentType === 'quote') {
      const list = getQuotes();
      const idx = list.findIndex(q => q.id === contentId);
      if (idx !== -1) {
        list[idx].commentsCount = Math.max(0, list[idx].commentsCount - 1);
        setQuotes(list);
        if (isFirebaseConfigured && db) {
          try {
            await updateDoc(doc(db, 'quotes', contentId), { commentsCount: list[idx].commentsCount });
          } catch {}
        }
      }
    }
  },

  async likeContent(contentId: string, contentType: 'poem' | 'story' | 'quote', userId: string): Promise<boolean> {
    const key = `${contentId}:${userId}`;
    const likesList = getLikes();
    const idx = likesList.indexOf(key);

    let finalLiked = false;

    if (idx !== -1) {
      // Unlike
      likesList.splice(idx, 1);
      setLikes(likesList);
      finalLiked = false;
    } else {
      // Like
      likesList.push(key);
      setLikes(likesList);
      finalLiked = true;
    }

    // Sync counts in Firestore (unconditional of local storage presence)
    const collectionName = contentType === 'poem' ? 'poems' : contentType === 'story' ? 'stories' : 'quotes';
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, collectionName, contentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const currentLikes = docSnap.data().likesCount || 0;
          const newLikes = finalLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
          await updateDoc(docRef, { likesCount: newLikes });
        }
      } catch (err) {
        console.error('Error updating likes in Firestore:', err);
      }
    }

    // Also update local storage cache if the item exists there
    if (contentType === 'poem') {
      const list = getPoems();
      const pIdx = list.findIndex(p => p.id === contentId);
      if (pIdx !== -1) {
        list[pIdx].likesCount = finalLiked ? list[pIdx].likesCount + 1 : Math.max(0, list[pIdx].likesCount - 1);
        setPoems(list);
      }
    } else if (contentType === 'story') {
      const list = getStories();
      const sIdx = list.findIndex(s => s.id === contentId);
      if (sIdx !== -1) {
        list[sIdx].likesCount = finalLiked ? list[sIdx].likesCount + 1 : Math.max(0, list[sIdx].likesCount - 1);
        setStories(list);
      }
    } else if (contentType === 'quote') {
      const list = getQuotes();
      const qIdx = list.findIndex(q => q.id === contentId);
      if (qIdx !== -1) {
        list[qIdx].likesCount = finalLiked ? list[qIdx].likesCount + 1 : Math.max(0, list[qIdx].likesCount - 1);
        setQuotes(list);
      }
    }

    return finalLiked;
  },

  async hasLikedContent(contentId: string, userId: string): Promise<boolean> {
    const key = `${contentId}:${userId}`;
    return getLikes().includes(key);
  },

  async hasLiked(contentId: string, userId: string): Promise<boolean> {
    return this.hasLikedContent(contentId, userId);
  },

  // --- AUDIOS & COLLECTIONS (Standard structures) ---
  async getAudioTracks(): Promise<AudioTrack[]> {
    return [];
  },

  async getCollections(userId: string): Promise<Collection[]> {
    return getLocalCollections().filter(c => c.userId === userId);
  },

  async createCollection(name: string, description: string, userId: string): Promise<Collection> {
    const newCollection: Collection = {
      id: `col-${Date.now()}`,
      name,
      description,
      userId,
      poemIds: [],
      storyIds: [],
      isPrivate: false,
      createdAt: new Date().toISOString()
    };
    const current = getLocalCollections();
    current.push(newCollection);
    setLocalCollections(current);
    return newCollection;
  },

  async deleteCollection(collectionId: string, userId: string): Promise<boolean> {
    const current = getLocalCollections();
    const updated = current.filter(c => !(c.id === collectionId && c.userId === userId));
    setLocalCollections(updated);
    return true;
  },

  async addItemToCollection(collectionId: string, itemId: string, itemType: 'poem' | 'story' | 'quote', userId: string): Promise<boolean> {
    const current = getLocalCollections();
    const idx = current.findIndex(c => c.id === collectionId && c.userId === userId);
    if (idx === -1) return false;
    
    const col = current[idx];
    if (itemType === 'poem') {
      if (!col.poemIds.includes(itemId)) {
        col.poemIds.push(itemId);
      }
    } else if (itemType === 'story') {
      if (!col.storyIds) col.storyIds = [];
      if (!col.storyIds.includes(itemId)) {
        col.storyIds.push(itemId);
      }
    } else if (itemType === 'quote') {
      if (!col.quoteIds) col.quoteIds = [];
      if (!col.quoteIds.includes(itemId)) {
        col.quoteIds.push(itemId);
      }
    }
    
    current[idx] = col;
    setLocalCollections(current);
    return true;
  },

  async removeItemFromCollection(collectionId: string, itemId: string, itemType: 'poem' | 'story' | 'quote', userId: string): Promise<boolean> {
    const current = getLocalCollections();
    const idx = current.findIndex(c => c.id === collectionId && c.userId === userId);
    if (idx === -1) return false;
    
    const col = current[idx];
    if (itemType === 'poem') {
      col.poemIds = col.poemIds.filter(id => id !== itemId);
    } else if (itemType === 'story') {
      if (col.storyIds) {
        col.storyIds = col.storyIds.filter(id => id !== itemId);
      }
    } else if (itemType === 'quote') {
      if (col.quoteIds) {
        col.quoteIds = col.quoteIds.filter(id => id !== itemId);
      }
    }
    
    current[idx] = col;
    setLocalCollections(current);
    return true;
  },

  async reportPoem(poemId: string, poemTitle: string, reporterId: string, reason: string): Promise<Report> {
    const newReport: Report = {
      id: `report-${Date.now()}`,
      poemId,
      poemTitle,
      reporterId,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const reports = getReports();
    reports.push(newReport);
    setReports(reports);
    return newReport;
  },

  async getReports(): Promise<Report[]> {
    return getReports().filter(r => r.status === 'pending');
  },

  async resolveReport(id: string): Promise<void> {
    const reports = getReports();
    const idx = reports.findIndex(r => r.id === id);
    if (idx !== -1) {
      reports[idx].status = 'resolved';
      setReports(reports);
    }
  },

  async favoritePoem(poemId: string, userId: string): Promise<boolean> {
    const favs = getFavorites();
    if (!favs[userId]) favs[userId] = [];
    const idx = favs[userId].indexOf(poemId);
    
    if (idx !== -1) {
      favs[userId].splice(idx, 1);
      setFavorites(favs);
      return false;
    } else {
      favs[userId].push(poemId);
      setFavorites(favs);
      return true;
    }
  },

  async favoriteStory(storyId: string, userId: string): Promise<boolean> {
    const favs = getFavorites();
    if (!favs[userId]) favs[userId] = [];
    const idx = favs[userId].indexOf(storyId);
    
    if (idx !== -1) {
      favs[userId].splice(idx, 1);
      setFavorites(favs);
      return false;
    } else {
      favs[userId].push(storyId);
      setFavorites(favs);
      return true;
    }
  },

  async favoriteQuote(quoteId: string, userId: string): Promise<boolean> {
    const favs = getFavorites();
    if (!favs[userId]) favs[userId] = [];
    const idx = favs[userId].indexOf(quoteId);
    
    if (idx !== -1) {
      favs[userId].splice(idx, 1);
      setFavorites(favs);
      return false;
    } else {
      favs[userId].push(quoteId);
      setFavorites(favs);
      return true;
    }
  },

  async hasFavorited(poemId: string, userId: string): Promise<boolean> {
    return getFavorites()[userId]?.includes(poemId) || false;
  },

  async getRelatedPoems(poemId: string): Promise<Poem[]> {
    if (isFirebaseConfigured && db) {
      try {
        const targetPoem = await this.getPoemById(poemId);
        if (!targetPoem) return [];

        // Query poems in the same category
        const qCategory = query(
          collection(db, 'poems'),
          where('status', '==', 'published'),
          where('categorySlug', '==', targetPoem.categorySlug),
          limit(6)
        );
        const snapCategory = await getDocs(qCategory);
        let list = snapCategory.docs
          .map(d => ({ ...d.data(), id: d.id } as Poem))
          .filter(p => p.id !== poemId);

        // Fallback: If not enough related poems, load general published poems
        if (list.length < 3) {
          const qAll = query(
            collection(db, 'poems'),
            where('status', '==', 'published'),
            limit(10)
          );
          const snapAll = await getDocs(qAll);
          const allList = snapAll.docs.map(d => ({ ...d.data(), id: d.id } as Poem));
          for (const p of allList) {
            if (p.id !== poemId && !list.some(item => item.id === p.id)) {
              list.push(p);
            }
            if (list.length >= 3) break;
          }
        }
        return list.slice(0, 3);
      } catch (err) {
        console.error('Error fetching related poems from Firestore:', err);
      }
    }

    const list = getPoems();
    const p = list.find(item => item.id === poemId);
    if (!p) return list.slice(0, 3);
    return list.filter(item => item.categorySlug === p.categorySlug && item.id !== poemId).slice(0, 3);
  },

  async likePoem(poemId: string, userId: string): Promise<boolean> {
    return this.likeContent(poemId, 'poem', userId);
  },

  // --- AI FEATURES MOCK fallbacks ---
  async getMoodRecommendations(mood: string): Promise<Poem[]> {
    return getPoems().filter(p => p.mood?.toLowerCase() === mood.toLowerCase()).slice(0, 3);
  },

  async generateQuote() {
    return mockQuotes[Math.floor(Math.random() * mockQuotes.length)];
  },

  // --- ADVANCED SEARCH ---
  async advancedSearch(filters: any): Promise<any[]> {
    let poemsList = getPoems();
    let storiesList = getStories();

    if (filters.query) {
      const q = filters.query.toLowerCase();
      poemsList = poemsList.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q));
      storiesList = storiesList.filter(s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) || s.author.toLowerCase().includes(q));
    }

    if (filters.category && filters.category !== 'all') {
      poemsList = poemsList.filter(p => p.categorySlug === filters.category);
      storiesList = storiesList.filter(s => s.category.toLowerCase() === filters.category.toLowerCase());
    }

    return [...poemsList, ...storiesList];
  },

  // --- MASTER ANALYTICS OVERVIEW ---
  async getAnalytics(userId?: string) {
    let poemsList = getPoems();
    let storiesList = getStories();
    let quotesList = getQuotes();

    if (isFirebaseConfigured && db) {
      try {
        const [poemsSnap, storiesSnap, quotesSnap] = await Promise.all([
          getDocs(collection(db, 'poems')),
          getDocs(collection(db, 'stories')),
          getDocs(collection(db, 'quotes'))
        ]);
        poemsList = poemsSnap.docs.map(d => d.data() as Poem);
        storiesList = storiesSnap.docs.map(d => d.data() as Story);
        quotesList = quotesSnap.docs.map(d => d.data() as Quote);
      } catch (err) {
        console.error('Error fetching analytics from Firestore (falling back to localStorage):', err);
      }
    }

    // Calculate actual trends over the last 7 days from visitor logs
    let visitorLogsList = getVisitorLogs();
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'visitors'));
        visitorLogsList = snap.docs.map(d => d.data() as VisitorLog);
      } catch (err) {
        console.error('Error fetching visitor trends:', err);
      }
    }

    // Filter to only count content details clicks
    const contentLogs = visitorLogsList.filter(l => l.path && (l.path.startsWith('/poem') || l.path.startsWith('/story') || l.path.startsWith('/quote') || l.path.startsWith('/quotes')));
    const uniqueUsersCount = new Set(contentLogs.map(l => l.visitorId || l.id)).size;

    const totalPoems = poemsList.length;
    const totalStories = storiesList.length;
    const totalQuotes = quotesList.length;

    const totalViews = contentLogs.length;
    const totalLikes = poemsList.reduce((sum, p) => sum + (p.likesCount || 0), 0) + storiesList.reduce((sum, s) => sum + (s.likesCount || 0), 0) + quotesList.reduce((sum, q) => sum + (q.likesCount || 0), 0);
    const totalComments = poemsList.reduce((sum, p) => sum + (p.commentsCount || 0), 0) + storiesList.reduce((sum, s) => sum + (s.commentsCount || 0), 0) + quotesList.reduce((sum, q) => sum + (q.commentsCount || 0), 0);
    const totalShares = poemsList.reduce((sum, p) => sum + (p.sharesCount || 0), 0) + storiesList.reduce((sum, s) => sum + (s.sharesCount || 0), 0) + quotesList.reduce((sum, q) => sum + (q.sharesCount || 0), 0);
    const totalDownloads = poemsList.reduce((sum, p) => sum + (p.downloadsCount || 0), 0) + storiesList.reduce((sum, s) => sum + (s.downloadsCount || 0), 0);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push({
        dateStr: d.toDateString(),
        name: daysOfWeek[d.getDay()]
      });
    }

    const visitorTrends = last7Days.map(day => {
      const logsForDay = contentLogs.filter(l => new Date(l.timestamp).toDateString() === day.dateStr);
      const views = logsForDay.length;
      const uniqueSessions = new Set(logsForDay.map(l => `${l.browser}-${l.deviceType}`)).size;
      const visitors = logsForDay.length > 0 ? Math.max(1, uniqueSessions) : 0;

      return {
        name: day.name,
        views,
        visitors,
        likes: 0
      };
    });

    const categoryStats = mockCategories.map(c => ({
      name: c.name,
      value: poemsList.filter(p => p.categorySlug === c.slug).length + storiesList.filter(s => s.category.toLowerCase() === c.slug).length
    }));

    // Calculate Unique Link Clicks (one click per unique device/browser per link)
    const pathUniqueVisitors: { [path: string]: Set<string> } = {};
    contentLogs.forEach(l => {
      if (l.path) {
        if (!pathUniqueVisitors[l.path]) {
          pathUniqueVisitors[l.path] = new Set();
        }
        pathUniqueVisitors[l.path].add(l.visitorId || l.id);
      }
    });
    let uniqueLinkClicks = 0;
    Object.values(pathUniqueVisitors).forEach(set => {
      uniqueLinkClicks += set.size;
    });

    return {
      totalPoems,
      totalStories,
      totalQuotes,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      totalDownloads,
      visitorTrends,
      categoryStats,
      uniqueLinkClicks,
      rawLogs: contentLogs.map(l => ({ timestamp: l.timestamp, visitorId: l.visitorId || l.id, browser: l.browser, deviceType: l.deviceType })),
      mostPopularPoem: poemsList.length > 0 ? [...poemsList].sort((a, b) => b.viewsCount - a.viewsCount)[0] : null
    };
  },

  // --- VISITOR PROFILES MANAGEMENT ---
  async saveVisitorProfile(profile: VisitorProfile): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'visitor_profiles', profile.id), cleanUndefined(profile));
      } catch (err) {
        console.error('Error saving visitor profile to Firestore:', err);
      }
    }
    const profiles = getVisitorProfilesLocal();
    const existingIdx = profiles.findIndex(p => p.id === profile.id);
    if (existingIdx !== -1) {
      profiles[existingIdx] = profile;
    } else {
      profiles.push(profile);
    }
    setVisitorProfilesLocal(profiles);
  },

  async getVisitorProfiles(): Promise<VisitorProfile[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'visitor_profiles'));
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as VisitorProfile));
      } catch (err) {
        console.error('Error fetching visitor profiles from Firestore:', err);
      }
    }
    return getVisitorProfilesLocal();
  },

  async updateVisitorProfile(id: string, updates: Partial<VisitorProfile>): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'visitor_profiles', id), cleanUndefined(updates));
      } catch (err) {
        console.error('Error updating visitor profile in Firestore:', err);
      }
    }
    const profiles = getVisitorProfilesLocal();
    const existingIdx = profiles.findIndex(p => p.id === id);
    if (existingIdx !== -1) {
      const updated = { ...profiles[existingIdx], ...updates };
      profiles[existingIdx] = updated;
      setVisitorProfilesLocal(profiles);

      if (isClient && localStorage.getItem('siragii_visitor_id') === id) {
        localStorage.setItem('siragii_visitor_profile', JSON.stringify(updated));
      }
    }
  },

  async recordContentRead(userId: string, contentId: string, type: 'poem' | 'story' | 'quote', title: string): Promise<void> {
    // Fetch profile
    let profile: VisitorProfile | null = null;
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'visitor_profiles', userId));
        if (snap.exists()) {
          profile = snap.data() as VisitorProfile;
        }
      } catch (err) {
        console.error('Error loading visitor profile for reading history:', err);
      }
    }
    
    if (!profile) {
      const profiles = getVisitorProfilesLocal();
      profile = profiles.find(p => p.id === userId) || null;
    }

    if (!profile) return;

    // Check if already read this content to avoid duplicate increments
    const hasReadBefore = profile.readingHistory ? profile.readingHistory.some(item => item.id === contentId && item.type === type) : false;
    
    const updatedHistory = [
      ...(profile.readingHistory || []),
      { id: contentId, type, title, timestamp: new Date().toISOString() }
    ];

    const updates: Partial<VisitorProfile> = {
      readingHistory: updatedHistory,
      lastActive: new Date().toISOString()
    };

    if (!hasReadBefore) {
      if (type === 'poem') {
        updates.totalPoemsRead = (profile.totalPoemsRead || 0) + 1;
      } else if (type === 'story') {
        updates.totalStoriesRead = (profile.totalStoriesRead || 0) + 1;
      } else if (type === 'quote') {
        updates.totalQuotesRead = (profile.totalQuotesRead || 0) + 1;
      }
    }

    await this.updateVisitorProfile(userId, updates);
  },

  async getLatestUploads(): Promise<any[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    let poems: Poem[] = [];
    let stories: Story[] = [];
    let quotes: Quote[] = [];

    if (isFirebaseConfigured && db) {
      try {
        const pq = query(
          collection(db, 'poems'),
          where('createdAt', '>=', oneDayAgo),
          orderBy('createdAt', 'desc')
        );
        const psnap = await getDocs(pq);
        poems = psnap.docs.map(d => ({ ...d.data(), id: d.id } as Poem));
      } catch (err) {
        console.error('Error fetching latest poems:', err);
      }

      try {
        const sq = query(
          collection(db, 'stories'),
          where('createdAt', '>=', oneDayAgo),
          orderBy('createdAt', 'desc')
        );
        const ssnap = await getDocs(sq);
        stories = ssnap.docs.map(d => ({ ...d.data(), id: d.id } as Story));
      } catch (err) {
        console.error('Error fetching latest stories:', err);
      }

      try {
        const qq = query(
          collection(db, 'quotes'),
          where('createdAt', '>=', oneDayAgo),
          orderBy('createdAt', 'desc')
        );
        const qsnap = await getDocs(qq);
        quotes = qsnap.docs.map(d => ({ ...d.data(), id: d.id } as Quote));
      } catch (err) {
        console.error('Error fetching latest quotes:', err);
      }
    } else {
      poems = getPoems().filter(p => p.createdAt >= oneDayAgo);
      stories = getStories().filter(s => s.createdAt >= oneDayAgo);
      quotes = getQuotes().filter(q => q.createdAt >= oneDayAgo);
    }

    const publishedPoems = poems.filter(p => p.status === 'published');
    const publishedStories = stories.filter(s => s.status === 'published');
    const publishedQuotes = quotes.filter(q => q.status === 'published');

    const combined: any[] = [
      ...publishedPoems.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        author: p.authorName,
        category: 'poem',
        genre: p.categoryName,
        createdAt: p.createdAt
      })),
      ...publishedStories.map(s => ({
        id: s.id,
        title: s.title,
        content: s.content,
        author: s.author,
        category: 'story',
        genre: s.genre || s.category,
        coverUrl: s.coverUrl,
        createdAt: s.createdAt,
        readingTime: s.readingTime
      })),
      ...publishedQuotes.map(q => ({
        id: q.id,
        title: q.category === 'thought' ? 'New Thought' : 'New Quote',
        content: q.content,
        author: q.author,
        category: q.category === 'thought' ? 'thought' : 'quote',
        genre: q.genre,
        createdAt: q.createdAt
      }))
    ];

    return combined.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  submitContent: async (data: {
    userId: string;
    userName: string;
    userUsername: string;
    contentType: 'poem' | 'story' | 'thought' | 'quote';
    title: string;
    content: string;
    coverUrl?: string;
  }): Promise<Submission> => {
    const submission: Submission = {
      id: Math.random().toString(36).substring(2),
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured) {
      const docRef = await addDoc(collection(db!, 'submissions'), cleanUndefined(submission));
      submission.id = docRef.id;
      await updateDoc(doc(db!, 'submissions', docRef.id), { id: docRef.id });
    } else {
      const submissions = getSubmissions();
      submissions.push(submission);
      setSubmissions(submissions);
    }
    return submission;
  },

  getSubmissions: async (): Promise<Submission[]> => {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(query(collection(db!, 'submissions'), orderBy('createdAt', 'desc')));
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Submission));
      } catch (err) {
        console.error('Error getting submissions:', err);
        return [];
      }
    } else {
      return getSubmissions().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  },

  getSubmissionById: async (id: string): Promise<Submission | null> => {
    if (isFirebaseConfigured) {
      try {
        const docSnap = await getDoc(doc(db!, 'submissions', id));
        if (docSnap.exists()) {
          return { ...docSnap.data(), id: docSnap.id } as Submission;
        }
        return null;
      } catch (err) {
        console.error('Error getting submission by id:', err);
        return null;
      }
    } else {
      const submissions = getSubmissions();
      return submissions.find(s => s.id === id) || null;
    }
  },

  updateSubmission: async (id: string, updates: Partial<Submission>): Promise<Submission> => {
    if (isFirebaseConfigured) {
      const docRef = doc(db!, 'submissions', id);
      const cleanUpdates = cleanUndefined({ ...updates, updatedAt: new Date().toISOString() });
      await updateDoc(docRef, cleanUpdates);
      const docSnap = await getDoc(docRef);
      return { ...docSnap.data(), id: docSnap.id } as Submission;
    } else {
      const submissions = getSubmissions();
      const idx = submissions.findIndex(s => s.id === id);
      if (idx !== -1) {
        submissions[idx] = {
          ...submissions[idx],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        setSubmissions(submissions);
        return submissions[idx];
      }
      throw new Error('Submission not found');
    }
  },

  getUserSubmissions: async (userId: string): Promise<Submission[]> => {
    if (isFirebaseConfigured) {
      try {
        const qSnap = await getDocs(query(
          collection(db!, 'submissions'),
          where('userId', '==', userId)
        ));
        const list = qSnap.docs.map(d => ({ ...d.data(), id: d.id } as Submission));
        return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      } catch (err) {
        console.error('Error getting user submissions:', err);
        return [];
      }
    } else {
      return getSubmissions()
        .filter(s => s.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  },

  submitQuery: async (data: {
    userId: string;
    userName: string;
    userUsername: string;
    subject: string;
    message: string;
  }): Promise<UserQuery> => {
    const userQuery: UserQuery = {
      id: Math.random().toString(36).substring(2),
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured) {
      const docRef = await addDoc(collection(db!, 'queries'), cleanUndefined(userQuery));
      userQuery.id = docRef.id;
      await updateDoc(doc(db!, 'queries', docRef.id), { id: docRef.id });
    } else {
      const queries = getQueries();
      queries.push(userQuery);
      setQueries(queries);
    }
    return userQuery;
  },

  getUserQueries: async (userId: string): Promise<UserQuery[]> => {
    if (isFirebaseConfigured) {
      try {
        const qSnap = await getDocs(query(
          collection(db!, 'queries'),
          where('userId', '==', userId)
        ));
        const list = qSnap.docs.map(d => ({ ...d.data(), id: d.id } as UserQuery));
        return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      } catch (err) {
        console.error('Error getting user queries:', err);
        return [];
      }
    } else {
      return getQueries()
        .filter(q => q.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  },

  getAllQueries: async (): Promise<UserQuery[]> => {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(query(collection(db!, 'queries'), orderBy('createdAt', 'desc')));
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as UserQuery));
      } catch (err) {
        console.error('Error getting all queries:', err);
        return [];
      }
    } else {
      return getQueries().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  },

  replyToQuery: async (id: string, replyMessage: string): Promise<UserQuery> => {
    const updates = {
      status: 'replied' as const,
      replyMessage,
      repliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured) {
      const docRef = doc(db!, 'queries', id);
      await updateDoc(docRef, updates);
      const docSnap = await getDoc(docRef);
      return { ...docSnap.data(), id: docSnap.id } as UserQuery;
    } else {
      const queries = getQueries();
      const idx = queries.findIndex(q => q.id === id);
      if (idx !== -1) {
        queries[idx] = {
          ...queries[idx],
          ...updates,
        };
        setQueries(queries);
        return queries[idx];
      }
      throw new Error('Query not found');
    }
  },

  // --- NOTIFICATIONS ---
  addNotification: async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db!, 'notifications', newNotif.id), cleanUndefined(newNotif));
      } catch (err) {
        console.error('Error saving notification to Firestore:', err);
      }
    }
    const list = getNotifications();
    list.push(newNotif);
    setNotifications(list);
    return newNotif;
  },

  getNotifications: async (recipientId: string): Promise<Notification[]> => {
    let list = getNotifications();
    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db!, 'notifications'), 
          where('recipientId', '==', recipientId)
        );
        const snap = await getDocs(q);
        list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Notification));
      } catch (err) {
        console.error('Error fetching notifications from Firestore:', err);
      }
    }
    return list
      .filter(n => n.recipientId === recipientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  markNotificationsAsRead: async (recipientId: string): Promise<void> => {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db!, 'notifications'), where('recipientId', '==', recipientId), where('read', '==', false));
        const snap = await getDocs(q);
        const batchPromise = snap.docs.map(d => updateDoc(doc(db!, 'notifications', d.id), { read: true }));
        await Promise.all(batchPromise);
      } catch (err) {
        console.error('Error marking notifications read in Firestore:', err);
      }
    }
    const list = getNotifications();
    list.forEach(n => {
      if (n.recipientId === recipientId) {
        n.read = true;
      }
    });
    setNotifications(list);
  }
};
