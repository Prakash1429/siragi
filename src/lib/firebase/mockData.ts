import { User, Poem, Category, Comment, Collection, AudioTrack, Achievement, ActivityLog, Story } from '@/types';

export const mockUsers: User[] = [
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

export const mockCategories: Category[] = [
  { id: 'cat-love', name: 'Love', nameTa: 'காதல்', slug: 'love', description: 'Love and romance poetry.', descriptionTa: 'காதல் கவிதைகள்.', imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600', poemsCount: 0 },
  { id: 'cat-breakup', name: 'Breakup', nameTa: 'பிரிவு', slug: 'breakup', description: 'Breakup and separation poems.', descriptionTa: 'பிரிவு கவிதைகள்.', imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600', poemsCount: 0 },
  { id: 'cat-motivation', name: 'Motivation', nameTa: 'ஊக்கம்', slug: 'motivation', description: 'Motivational and inspirational stanzas.', descriptionTa: 'ஊக்கமூட்டும் கவிதைகள்.', imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600', poemsCount: 0 },
  { id: 'cat-friendship', name: 'Friendship', nameTa: 'நட்பு', slug: 'friendship', description: 'Celebrating bonds and friendships.', descriptionTa: 'நட்புக் கவிதைகள்.', imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600', poemsCount: 0 },
  { id: 'cat-life', name: 'Life', nameTa: 'வாழ்க்கை', slug: 'life', description: 'Reflections on the journey of life.', descriptionTa: 'வாழ்க்கைக் கவிதைகள்.', imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600', poemsCount: 0 },
  { id: 'cat-family', name: 'Family', nameTa: 'குடும்பம்', slug: 'family', description: 'Dedicated to parents, siblings and children.', descriptionTa: 'குடும்பக் கவிதைகள்.', imageUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=600', poemsCount: 0 },
  { id: 'cat-nature', name: 'Nature', nameTa: 'இயற்கை', slug: 'nature', description: 'Praising landscapes, sky and rivers.', descriptionTa: 'இயற்கைக் கவிதைகள்.', imageUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600', poemsCount: 0 },
  { id: 'cat-emotional', name: 'Emotional', nameTa: 'உணர்வு', slug: 'emotional', description: 'Expressing deep sentiments.', descriptionTa: 'உணர்ச்சிக் கவிதைகள்.', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600', poemsCount: 0 },
  { id: 'cat-inspirational', name: 'Inspirational', nameTa: 'எழுச்சி', slug: 'inspirational', description: 'Spreading hope and inspiration.', descriptionTa: 'எழுச்சியூட்டும் வரிகள்.', imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600', poemsCount: 0 },
  { id: 'cat-sad', name: 'Sad', nameTa: 'சோகம்', slug: 'sad', description: 'Melancholic thoughts and poetry.', descriptionTa: 'சோகக் கவிதைகள்.', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600', poemsCount: 0 },
  { id: 'cat-festival', name: 'Festival', nameTa: 'திருவிழா', slug: 'festival', description: 'Tributes to cultural festivities.', descriptionTa: 'பண்டிகைக் கவிதைகள்.', imageUrl: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=600', poemsCount: 0 },
  { id: 'cat-stories', name: 'Stories', nameTa: 'கதைகள்', slug: 'stories', description: 'Bilingual short stories and tales.', descriptionTa: 'சிறுகதைகள்.', imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600', poemsCount: 0 }
];

// Start completely empty for production-grade CMS conversion
export const mockPoems: Poem[] = [];
export const mockStories: Story[] = [];
export const mockComments: Comment[] = [];
export const mockCollections: Collection[] = [];
export const mockAudioTracks: AudioTrack[] = [];
export const mockAchievements: Achievement[] = [];
export const mockActivityLogs: ActivityLog[] = [];
export const mockTags: string[] = ['love', 'breakup', 'motivation', 'friendship', 'life', 'family', 'nature', 'emotional', 'inspirational', 'sad', 'festival', 'stories'];
export const mockQuotes = [
  { quote: "Poetry is the search for syllables to shoot at a barrier of apprehension.", author: "Wallace Stevens" },
  { quote: "தமிழ் மொழி என்பது வெறும் சொல் அல்ல, அது நம் ஆன்மாவின் சுவை.", author: "Bharathidasan" }
];
