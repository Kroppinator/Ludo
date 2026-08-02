import type { Metadata, Viewport } from 'next';
import './globals.css';

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
    <html lang="de">
      <body className="bg-board-bg min-h-screen">
        {children}
      </body>
    </html>
  );
}
