import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/components/providers/auth-provider';
import { SocketProvider } from '@/components/providers/socket-provider';
import { PWAProvider } from '@/components/providers/pwa-provider';

export const metadata: Metadata = {
  title: 'Obsidians',
  description: 'Une plateforme de communication moderne avec animations, thèmes et médias',
  manifest: '/manifest.json',
  themeColor: '#5865F2',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Obsidians',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fr" className="dark">
      <head>
        {/* Meta tags PWA */}
        <meta name="theme-color" content="#5865F2" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Obsidians" />
        <meta name="application-name" content="Obsidians" />
        <meta name="msapplication-TileColor" content="#5865F2" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body 
        suppressHydrationWarning 
        className="bg-[#313338] text-[#DBDEE1] antialiased"
      >
        <PWAProvider>
          <AuthProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </AuthProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
