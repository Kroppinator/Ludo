import type { Metadata, Viewport } from 'next';
import { Righteous } from 'next/font/google';
import Starfield from '@/components/Starfield';
import './globals.css';

// Retro display font for the disco look.
const disco = Righteous({ weight: '400', subsets: ['latin'], variable: '--font-disco' });

export const metadata: Metadata = {
  applicationName: 'Chill dein Leben, Digga!',
  title: 'Chill dein Leben, Digga!',
  description: 'Das klassische Brettspiel für 2–4 Spieler – optimiert für Tablet und Smartphone.',
  authors: [
    { name: 'Kroppinator', url: 'https://github.com/Kroppinator' },
    { name: 'Claude (Anthropic)', url: 'https://www.anthropic.com' },
  ],
  creator: 'Kroppinator & Claude',
  publisher: 'Kroppinator',
  keywords: ['Chill dein Leben Digga', 'Ludo', 'Brettspiel', 'board game', 'Pöppel'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={disco.variable}>
      <body className="min-h-dvh">
        <Starfield />
        {children}
      </body>
    </html>
  );
}
