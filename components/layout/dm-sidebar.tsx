'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Settings, UserPlus, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { User, UserX, MessageSquare, Trash2 } from 'lucide-react';

interface DMSidebarProps {
  activeChannel: any;
  onSelectChannel: (channel: any) => void;
  onOpenSettings: () => void;
}

export const DMSidebar = ({ activeChannel, onSelectChannel, onOpenSettings }: DMSidebarProps) => {
  const { user, logout } = useAuth();
  const [dms, setDms] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetch(`/api/users/${user.id}/dms`)
        .then((res) => res.json())
        .then((data) => setDms(data));
    }
  }, [user, activeChannel?.id]);

  return (
    <div className="flex w-60 flex-col bg-glass h-full border-r border-white/5">
      {/* Search/Header */}
      <div className="flex h-12 items-center border-b border-white/10 px-4 shadow-sm">
        <button
          className="flex w-full items-center rounded bg-[#1E1F22] px-2 py-1 text-sm text-[#949BA4] transition-colors hover:text-[#DBDEE1]"
          onClick={() => onSelectChannel(null)} // Go to Friends/Start DM view
        >
          Find or start a conversation
        </button>
      </div>

      {/* DM List */}
      <div className="flex-1 overflow-y-auto px-2 py-4 no-scrollbar">
        <div className="mb-2 px-2 text-xs font-bold uppercase text-[#949BA4]">Direct Messages</div>
        <div className="space-y-[2px]">
          <div
            onClick={() => onSelectChannel(null)}
            className={cn(
              "group flex cursor-pointer items-center rounded px-2 py-2 transition-colors",
              !activeChannel ? "bg-white/20 text-white" : "text-[#949BA4] hover:bg-white/10 hover:text-[#DBDEE1]"
            )}
          >
            <UserPlus size={20} className="mr-3" />
            <span className="font-medium">Friends</span>
          </div>

          {dms.map((dm) => {
            const otherMember = dm.members.find((m: any) => m.id !== user?.id);
            return (
              <ContextMenu key={dm.id}>
                <ContextMenuTrigger>
                  <div
                    onClick={() => onSelectChannel(dm)}
                    className={cn(
                      "group flex cursor-pointer items-center rounded px-2 py-2 transition-colors",
                      activeChannel?.id === dm.id ? "bg-white/20 text-white" : "text-[#949BA4] hover:bg-white/10 hover:text-[#DBDEE1]"
                    )}
                  >
                    <div className="relative mr-3 h-8 w-8 shrink-0">
                      {otherMember?.avatarUrl ? (
                        <img src={otherMember.avatarUrl} alt={otherMember.pseudo} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#5865F2] text-xs font-bold text-white">
                          {otherMember?.pseudo?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={cn(
                        "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#2B2D31]",
                        otherMember?.state === 'ONLINE' ? "bg-[#23A559]" :
                          otherMember?.state === 'IDLE' ? "bg-[#F0B232]" :
                            otherMember?.state === 'DND' ? "bg-[#F23F43]" : "bg-[#80848E]"
                      )} />
                    </div>
                    <div className="flex flex-col overflow-hidden text-left">
                      <span className="truncate font-medium text-[#DBDEE1] group-hover:text-white">
                        {otherMember?.pseudo || 'Unknown User'}
                      </span>
                      {dm.messages?.[0] && (
                        <span className="truncate text-xs text-[#949BA4]">
                          {dm.messages[0].content ? 'Message' : 'Sent an attachment'}
                        </span>
                      )}
                    </div>
                    <div className="ml-auto hidden group-hover:block text-[#B5BAC1] hover:text-white">
                      <X size={14} onClick={(e) => { e.stopPropagation(); /* Handle close DM */ }} />
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48 bg-[#111214] border-[#1e1f22] text-[#B5BAC1]">
                  <ContextMenuItem
                    className="hover:bg-[#4752C4] hover:text-white cursor-pointer"
                    onClick={() => {/* Handle view profile - need props */ }}
                  >
                    <User size={14} className="mr-2" />
                    Profile
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="hover:bg-[#4752C4] hover:text-white cursor-pointer"
                    onClick={() => onSelectChannel(dm)}
                  >
                    <MessageSquare size={14} className="mr-2" />
                    Message
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-white/5" />
                  <ContextMenuItem
                    className="text-red-400 hover:bg-red-500 hover:text-white cursor-pointer"
                    onClick={() => {/* Handle block */ }}
                  >
                    <UserX size={14} className="mr-2" />
                    Block
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-red-400 hover:bg-red-500 hover:text-white cursor-pointer"
                    onClick={() => {/* Handle close DM */ }}
                  >
                    <Trash2 size={14} className="mr-2" />
                    Close DM
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      </div>

      {/* User Footer */}
      <div className="flex h-[52px] items-center bg-black/20 px-2 border-t border-white/5">
        <div
          className="flex flex-1 cursor-pointer items-center rounded px-1 py-1 hover:bg-white/10"
          onClick={onOpenSettings}
        >
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[#5865F2]">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.pseudo} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                {user?.pseudo?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#232428]",
              user?.state === 'ONLINE' ? "bg-[#23A559]" :
                user?.state === 'IDLE' ? "bg-[#F0B232]" :
                  user?.state === 'DND' ? "bg-[#F23F43]" : "bg-[#80848E]"
            )} />
          </div>
          <div className="ml-2 flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold text-white leading-tight">{user?.pseudo}</span>
            <span className="truncate text-[10px] text-[#B5BAC1] leading-tight">#{user?.id.slice(0, 4)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <div
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-[#B5BAC1] hover:bg-white/10 hover:text-[#DBDEE1]"
            onClick={onOpenSettings}
          >
            <Settings size={20} />
          </div>
          <div
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-[#B5BAC1] hover:bg-red-500/10 hover:text-red-500"
            onClick={() => {
              if (confirm("Are you sure you want to log out?")) {
                logout();
              }
            }}
            title="Logout"
          >
            <LogOut size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};
