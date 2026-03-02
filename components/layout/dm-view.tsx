'use client';

import React, { useState } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

interface DMViewProps {
  onStartDM: (userId: string) => void;
}

export const DMView = ({ onStartDM }: DMViewProps) => {
  const [userId, setUserId] = useState('');

  const handleStart = () => {
    if (userId.trim()) {
      onStartDM(userId.trim());
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-black/40 backdrop-blur-sm h-full">
      <div className="flex h-12 items-center border-b border-white/10 px-4 shadow-sm bg-black/20">
        <div className="flex items-center space-x-2 text-[#949BA4]">
          <UserPlus size={24} />
          <span className="font-bold text-white">Friends</span>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <h2 className="mb-2 text-xs font-bold uppercase text-[#949BA4]">Add Friend / Start DM</h2>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter a User ID"
              className="w-full rounded bg-[#1E1F22] px-4 py-2.5 text-[#DBDEE1] placeholder-[#949BA4] outline-none focus:ring-2 focus:ring-[#5865F2]"
            />
          </div>
          <button
            onClick={handleStart}
            disabled={!userId}
            className="rounded bg-[#5865F2] px-4 py-2.5 font-medium text-white hover:bg-[#4752C4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start DM
          </button>
        </div>
        
        <div className="mt-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 h-40 w-60 bg-contain bg-center bg-no-repeat opacity-50" style={{ backgroundImage: "url('https://discord.com/assets/a188414ce83f2454b9d71a47c3d95909.svg')" }} />
          <p className="text-[#949BA4]">Wumpus is waiting on friends. You don't have to though!</p>
        </div>
      </div>
    </div>
  );
};
