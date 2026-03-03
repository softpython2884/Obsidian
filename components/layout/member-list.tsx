'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Shield, MessageSquare, UserMinus, Ban, Gavel, Crown, User } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import { useAuth } from '@/components/providers/auth-provider';

import { RoleManagementModal } from '@/components/modals/role-management-modal';

interface MemberListProps {
  server: any;
  onViewProfile: (user: any) => void;
  onStartDM?: (userId: string) => void;
}

export const MemberList = ({ server, onViewProfile, onStartDM }: MemberListProps) => {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  useEffect(() => {
    if (server) {
      fetch(`/api/servers/${server.id}/members`)
        .then((res) => res.json())
        .then((data) => setMembers(data));
    }
  }, [server]);

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/servers/${server.id}/members/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        setMembers((prev) => prev.map((m) =>
          m.id === userId ? { ...m, role } : m
        ));
      } else {
        alert('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  if (!server) return <div className="hidden w-60 flex-col bg-black/60 backdrop-blur-sm lg:flex" />;

  const admins = members.filter((m) => (m.role === 'ADMIN' || m.userId === server.ownerId) && m.user);
  const moderators = members.filter((m) => m.role === 'MODERATOR' && m.userId !== server.ownerId && m.user);
  const onlineMembers = members.filter((m) => (m.role === 'MEMBER' || !m.role) && m.userId !== server.ownerId && m.user?.state !== 'OFFLINE' && m.user?.state !== 'INVISIBLE');
  const offlineMembers = members.filter((m) => (m.user?.state === 'OFFLINE' || m.user?.state === 'INVISIBLE') && m.user);

  const handleAction = (action: string, member: any) => {
    alert(`${action} ${member.user?.pseudo || 'User'} - Feature coming soon!`);
  };

  const MemberItem = ({ member }: { member: any }) => {
    if (!member.user) return null;
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="group flex cursor-pointer items-center rounded px-2 py-1.5 hover:bg-white/[0.05]">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[#1E1F22]">
              {member.user.avatarUrl ? (
                <img src={member.user.avatarUrl} alt={member.user.pseudo} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white/60">
                  {member.user.pseudo.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={cn(
                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#2B2D31]",
                member.user.state === 'ONLINE' ? "bg-[#23A559]" :
                  member.user.state === 'IDLE' ? "bg-[#F0B232]" :
                    member.user.state === 'DND' ? "bg-[#F23F43]" : "bg-[#80848E]"
              )} />
            </div>
            <div className="ml-2 flex flex-col overflow-hidden">
              <span className="truncate text-sm font-bold leading-tight flex items-center" style={{ color: (member.role === 'ADMIN' || member.userId === server.ownerId) ? '#F04747' : member.role === 'MODERATOR' ? '#FAA61A' : '#949BA4' }}>
                {member.user.pseudo}
                {server.ownerId === member.userId && <Crown size={12} className="ml-1 text-[#F0B232]" fill="#F0B232" />}
                {member.role === 'ADMIN' && server.ownerId !== member.userId && <Shield size={12} className="ml-1 text-[#F04747]" />}
              </span>
              {member.user.status && (
                <span className="truncate text-[10px] text-[#B5BAC1] opacity-60 leading-tight">{member.user.status}</span>
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56 bg-[#111214] border-black/20 text-[#DBDEE1]">
          <ContextMenuItem
            className="focus:bg-[#5865F2] focus:text-white cursor-pointer"
            onClick={() => onViewProfile(member.user)}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </ContextMenuItem>
          <ContextMenuItem
            className="focus:bg-[#5865F2] focus:text-white cursor-pointer"
            onClick={() => {
              if (onStartDM) {
                onStartDM(member.userId);
              } else {
                handleAction('Message', member);
              }
            }}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </ContextMenuItem>

          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MODERATOR' || server.ownerId === currentUser?.id) && (
            <>
              <ContextMenuSeparator className="bg-white/5" />
              <ContextMenuItem
                className="focus:bg-[#5865F2] focus:text-white cursor-pointer"
                onClick={() => {
                  setSelectedMember(member);
                  setIsRoleModalOpen(true);
                }}
              >
                <Shield className="mr-2 h-4 w-4" />
                Manage Roles
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-white/5" />
              <ContextMenuItem
                className="text-[#F23F43] focus:bg-[#F23F43] focus:text-white cursor-pointer"
                onClick={() => handleAction('Kick', member)}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Kick {member.user.pseudo}
              </ContextMenuItem>
              <ContextMenuItem
                className="text-[#F23F43] focus:bg-[#F23F43] focus:text-white cursor-pointer"
                onClick={() => handleAction('Ban', member)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Ban {member.user.pseudo}
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <>
      <div className="hidden w-60 flex-col bg-glass lg:flex border-l border-white/5">
        <div className="flex-1 overflow-y-auto px-2 py-4 no-scrollbar">
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

      <RoleManagementModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        user={selectedMember}
        onUpdateRole={handleUpdateRole}
      />
    </>
  );
};
