'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Shield, UserX, UserCheck, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => setUsers(data));
      
      // Fetch logs if implemented
    }
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#313338] text-white">
        <h1 className="text-2xl font-bold">Access Denied</h1>
      </div>
    );
  }

  const handleBan = async (userId: string) => {
    // Implement ban logic
    alert(`Banning user ${userId}`);
  };

  const handleRename = async (userId: string) => {
    const newName = prompt('New pseudo:');
    if (newName) {
      // Implement rename logic
    }
  };

  return (
    <div className="min-h-screen bg-[#313338] p-8 text-[#DBDEE1]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="flex items-center text-3xl font-bold text-white">
            <Shield className="mr-3 text-[#F04747]" size={32} />
            Admin Dashboard
          </h1>
          <Button variant="outline" onClick={() => window.location.href = '/'}>Back to App</Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* User Management */}
          <div className="rounded-lg bg-[#2B2D31] p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-white">User Management</h2>
            <div className="space-y-4">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between rounded bg-[#1E1F22] p-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#5865F2] flex items-center justify-center font-bold">
                      {u.pseudo.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="font-bold text-white">{u.pseudo}</p>
                      <p className="text-xs text-[#949BA4]">{u.id}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleRename(u.id)}>
                      <Edit3 size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[#F04747]" onClick={() => handleBan(u.id)}>
                      <UserX size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Moderation Logs */}
          <div className="rounded-lg bg-[#2B2D31] p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-white">Moderation Logs</h2>
            <div className="space-y-2 text-sm">
              <div className="rounded border-l-4 border-[#F04747] bg-[#1E1F22] p-2">
                <span className="font-bold text-[#F04747]">[BAN]</span> Admin banned user CyberPunk_01
                <p className="text-[10px] text-[#949BA4]">2 minutes ago</p>
              </div>
              <div className="rounded border-l-4 border-[#FAA61A] bg-[#1E1F22] p-2">
                <span className="font-bold text-[#FAA61A]">[RENAME]</span> Admin renamed user User123 to Ghost
                <p className="text-[10px] text-[#949BA4]">15 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
