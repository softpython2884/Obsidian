'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { DiscordLayout } from '@/components/layout/discord-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn } from 'lucide-react';

export default function Home() {
  const { user, isLoading, login } = useAuth();
  const [pseudo, setPseudo] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1E1F22]">
        <div className="text-xl font-semibold text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1E1F22]">
        <div className="w-full max-w-md rounded-lg bg-[#313338] p-8 shadow-2xl">
          <h1 className="mb-6 text-center text-2xl font-bold text-white">Welcome back!</h1>
          <p className="mb-8 text-center text-[#B5BAC1]">Enter a pseudo to join the local network.</p>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-[#B5BAC1]">Pseudo</label>
              <Input
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="e.g. CyberPunk_01"
                className="border-none bg-[#1E1F22] text-white focus-visible:ring-1 focus-visible:ring-[#5865F2]"
                onKeyDown={(e) => e.key === 'Enter' && pseudo && login(pseudo)}
              />
            </div>
            
            <Button
              onClick={async () => {
                if (!pseudo) return;
                setIsLoggingIn(true);
                await login(pseudo);
                setIsLoggingIn(false);
              }}
              disabled={!pseudo || isLoggingIn}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
            >
              {isLoggingIn ? 'Joining...' : 'Join Server'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <DiscordLayout />;
}
