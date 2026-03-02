import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/components/providers/auth-provider';
import { SocketProvider } from '@/components/providers/socket-provider';

export const metadata: Metadata = {
  title: 'Discord Local Clone',
  description: 'A secure, high-performance local Discord clone.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className="bg-[#313338] text-[#DBDEE1] antialiased">
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
