# Siragii - Poetry Portal (Tamil & English)

Siragii is a premium, feature-rich Tamil and English poetry portal. Built using Next.js 15, TypeScript, Tailwind CSS, Zustand, and Firebase, it combines a modern glassmorphic look with seamless client-side translations, custom media recitations, and comprehensive administrative oversight dashboards.

## ✨ Features

- **Bilingual Interface**: Native support for English and Tamil (தமிழ்). Instant interface localization via client-side translation hooks.
- **Poetry Composition**: Styled composition canvas supporting category indexing, language flags, tags, and media link recitations.
- **Spoken Word Recitations**: Bottom-docked media player to stream spoken recitations uploaded by poets.
- **Curated Reading Lists**: Optimistic user interactions for liking, bookmarking (favorites), and grouping poems into custom folders (collections).
- **Poet Directory**: Follow and explore bios of other writers in the community.
- **Admin Control Panel**: Advanced dashboard for moderating reported poems, comments, analytics charts, managing roles, and setting system settings.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, custom CSS glassmorphism, Framer Motion
- **State Management**: Zustand
- **Database / Auth**: Firebase (Authentication, Firestore, Storage) with a local mock fallback layer
- **Component Libraries**: Lucide Icons, Sonner notifications, Recharts analytics, React H5 Audio Player

---

## ⚙️ Firebase Setup

1. **Environment Variables**: Add your Firebase configuration keys to `.env.local` at the root of the project:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
   ```

2. **Fallback Mode**: If these credentials are left blank, the portal will automatically run in **Local Fallback Mode**, pulling rich pre-seeded mock poetry, comments, and analytics charts. This ensures the app is immediately previewable and functional.

---

## 📁 Folder Structure

```
siragii/
├── public/
│   ├── locales/
│   │   ├── en/common.json     # English translations dictionary
│   │   └── ta/common.json     # Tamil translations dictionary
│   └── images/
├── src/
│   ├── app/                   # App router pages (Root layout, Admin control panel, etc.)
│   ├── components/
│   │   ├── audio/             # Global audio reciter
│   │   ├── home/              # Hero banner, category & trending cards
│   │   ├── layout/            # Navbar, footer, sidebars, mobile bottom navigation
│   │   ├── poems/             # Poem cards, comments
│   │   ├── profile/           # User cards
│   │   └── shared/            # Theme toggler, language switchers, breadcrumbs, searchbars
│   ├── hooks/
│   │   └── useTranslation.ts  # Dynamic language translator hook
│   ├── lib/
│   │   ├── firebase/          # Firebase client config & mock data generators
│   │   └── utils.ts           # Tailwind merge helpers
│   ├── services/
│   │   ├── auth.ts            # Auth service resolver
│   │   └── db.ts              # Data collections CRUD service
│   ├── store/
│   │   └── useStore.ts        # Zustand global state store
│   └── types/
│       └── index.ts           # Schema models (Poems, Categories, Users, etc.)
```

---

## 🚀 Installation & Running

Follow these two simple steps to run the portal:

1. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
   *(Note: The `--legacy-peer-deps` flag is recommended due to React 19 package peer compatibility checks).*

2. **Launch Dev Server**:
   ```bash
   npm run dev
   ```

The application will be accessible at: [http://localhost:3000](http://localhost:3000).

---

## 📦 Production Deployment

To build a production bundle:
```bash
npm run build
npm start
```
The static compiler evaluates and optimizes all routes automatically.
