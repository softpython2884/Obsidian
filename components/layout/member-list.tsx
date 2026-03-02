'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

interface MemberListProps {
  server: any;
}

export const MemberList = ({ server }: MemberListProps) => {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (server) {
      // Fetch all users for now as a "local network" simulation
      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => setMembers(data));
    }
  }, [server]);

  if (!server) return <div className="hidden w-60 flex-col bg-[#2B2D31] lg:flex" />;

  const admins = members.filter((m) => m.role === 'ADMIN');
  const moderators = members.filter((m) => m.role === 'MODERATOR');
  const onlineMembers = members.filter((m) => m.role === 'MEMBER' && m.state === 'ONLINE');
  const offlineMembers = members.filter((m) => m.state === 'OFFLINE');

  const MemberItem = ({ member }: { member: any }) => (
    <div className="group flex cursor-pointer items-center rounded px-2 py-1.5 hover:bg-[#35373C]">
      <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[#5865F2]">
        {member.avatarUrl ? (
          <img src={member.avatarUrl} alt={member.pseudo} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
            {member.pseudo.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={cn(
          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#2B2D31]",
          member.state === 'ONLINE' ? "bg-[#23A559]" : 
          member.state === 'IDLE' ? "bg-[#F0B232]" : 
          member.state === 'DND' ? "bg-[#F23F43]" : "bg-[#80848E]"
        )} />
      </div>
      <div className="ml-2 flex flex-col overflow-hidden">
        <span className="truncate text-sm font-bold leading-tight flex items-center" style={{ color: member.role === 'ADMIN' ? '#F04747' : member.role === 'MODERATOR' ? '#FAA61A' : '#949BA4' }}>
          {member.pseudo}
          {member.role === 'ADMIN' && <Shield size={12} className="ml-1 text-[#F04747]" />}
        </span>
        {member.status && (
          <span className="truncate text-[10px] text-[#B5BAC1] leading-tight">{member.status}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="hidden w-60 flex-col bg-[#2B2D31] lg:flex">
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {admins.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-1 px-2 text-xs font-bold uppercase text-[#949BA4]">Admins — {admins.length}</h3>
            {admins.map((member) => <MemberItem key={member.id} member={member} />)}
          </div>
        )}
        {moderators.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-1 px-2 text-xs font-bold uppercase text-[#949BA4]">Moderators — {moderators.length}</h3>
            {moderators.map((member) => <MemberItem key={member.id} member={member} />)}
          </div>
        )}
        {onlineMembers.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-1 px-2 text-xs font-bold uppercase text-[#949BA4]">Online — {onlineMembers.length}</h3>
            {onlineMembers.map((member) => <MemberItem key={member.id} member={member} />)}
          </div>
        )}
        {offlineMembers.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-1 px-2 text-xs font-bold uppercase text-[#949BA4]">Offline — {offlineMembers.length}</h3>
            {offlineMembers.map((member) => <MemberItem key={member.id} member={member} />)}
          </div>
        )}
      </div>
    </div>
  );
};
