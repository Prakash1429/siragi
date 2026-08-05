import { create } from 'zustand';
import { User, AudioTrack, Notification } from '@/types';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  language: 'en' | 'ta';
  setLanguage: (lang: 'en' | 'ta') => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTrack: AudioTrack | null;
  setCurrentTrack: (track: AudioTrack | null) => void;
  playlist: AudioTrack[];
  setPlaylist: (tracks: AudioTrack[]) => void;
  notifications: Notification[];
  setNotifications: (notifs: Notification[]) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  language: 'en',
  setLanguage: (language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('siragii_lang', language);
    }
    set({ language });
  },
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  currentTrack: null,
  setCurrentTrack: (currentTrack) => set({ currentTrack, isPlaying: !!currentTrack }),
  playlist: [],
  setPlaylist: (playlist) => set({ playlist }),
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
}));
