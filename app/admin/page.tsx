'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AdminPage() {
  const [code, setCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (code === '3044') {
      setIsAuthenticated(true);
      toast.success('Access granted');
    } else {
      toast.error('Invalid access code');
    }
  };

  const handleResetDB = async () => {
    if (!confirm('WARNING: This will delete ALL data (users, servers, messages). Are you sure?')) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reset-db?code=${code}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast.success('Database reset successfully');
        setTimeout(() => window.location.href = '/', 2000);
      } else {
        toast.error('Failed to reset database');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1E1F22]">
        <div className="w-full max-w-md rounded-lg bg-[#313338] p-8 shadow-2xl">
          <h1 className="mb-6 text-center text-2xl font-bold text-white">Admin Access</h1>
          <div className="space-y-4">
            <Input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter access code"
              className="border-none bg-[#1E1F22] text-white focus-visible:ring-1 focus-visible:ring-[#5865F2]"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button
              onClick={handleLogin}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
            >
              Enter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#1E1F22] text-white">
      <div className="w-full max-w-2xl rounded-lg bg-[#313338] p-8 shadow-2xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-[#F23F43]">DANGER ZONE</h1>
        
        <div className="space-y-6">
          <div className="rounded-lg border border-[#F23F43] bg-[#F23F43]/10 p-6">
            <h2 className="mb-2 text-xl font-bold text-[#F23F43]">Reset Database</h2>
            <p className="mb-4 text-[#B5BAC1]">
              This will permanently delete all users, servers, channels, and messages. 
              This action cannot be undone.
            </p>
            <Button 
              onClick={handleResetDB} 
              disabled={isLoading}
              className="bg-[#F23F43] hover:bg-[#D83C3E] text-white font-bold"
            >
              {isLoading ? 'Resetting...' : 'NUKE DATABASE'}
            </Button>
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="border-[#4E5058] text-[#DBDEE1] hover:bg-[#4E5058]"
            >
              Return to App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
