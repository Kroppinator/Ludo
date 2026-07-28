import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mensch Ärgere Dich nicht',
  description: 'Das klassische Brettspiel für 2–4 Spieler – optimiert für Tablet und Smartphone.',
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
