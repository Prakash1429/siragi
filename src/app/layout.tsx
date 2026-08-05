import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/contexts/Providers';
import AppLayoutContainer from '@/components/layout/AppLayoutContainer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Siragii | Spoken Word & Classic Poetry Portal',
    template: '%s | Siragii'
  },
  description: 'The premier platform for spoken word poetry, classical stanzas, and modern verses in Tamil and English. Listen, compose, and discuss verses.',
  keywords: ['poetry', 'tamil poetry', 'spoken word', 'poems', 'literature', 'tamil kathaikal', 'kavithaigal'],
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://siragii.com'
  },
  openGraph: {
    title: 'Siragii | Poetry Workspace & Recitation Portal',
    description: 'Listen, compose, and discuss stanzas in Tamil and English with live community metrics.',
    url: 'https://siragii.com',
    siteName: 'Siragii',
    type: 'website',
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siragii | Poetry Portal',
    description: 'Bilingual poetry composition workstation and spoken recitations database.'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <Providers>
          <AppLayoutContainer>{children}</AppLayoutContainer>
        </Providers>
      </body>
    </html>
  );
}
