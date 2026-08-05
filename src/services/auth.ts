import { User } from '@/types';

export const authService = {
  // Listen to Auth changes
  onAuthChange(callback: (user: User | null) => void) {
    // Since basic login/register is removed and we use guest auto-sessions + hardcoded admin,
    // we read directly from localStorage to keep state in sync and avoid Firebase Auth collision
    const saved = localStorage.getItem('siragii_user');
    if (saved) {
      try {
        callback(JSON.parse(saved));
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }

    return () => {};
  },

  async login(username: string, password: string): Promise<User> {
    // Hardcoded Admin authentication check
    if (username === 'Prakash' && password === '24PCat032') {
      const adminUser: User = {
        id: 'admin-id',
        name: 'Prakash',
        email: 'prakash@siragii.com',
        username: 'Prakash',
        role: 'admin',
        followersCount: 0,
        followingCount: 0,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('siragii_user', JSON.stringify(adminUser));
      return adminUser;
    }

    throw new Error('Invalid administrator credentials.');
  },

  async register(name: string, email: string, username: string, password: string): Promise<User> {
    throw new Error('Registration is disabled.');
  },

  async logout(): Promise<void> {
    localStorage.removeItem('siragii_user');
  }
};
