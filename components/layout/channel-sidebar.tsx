'use client';

import React from 'react';
import { Hash, ChevronDown, Settings, Mic, Headphones, Settings2, Shield, UserPlus, LogOut, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChannelSidebarProps {
  server: any;
  activeChannel: any;
  onSelectChannel: (channel: any) => void;
  onOpenSettings: () => void;
  onOpenServerSettings?: () => void;
  onLeaveServer?: () => void;
}

export const ChannelSidebar = ({ server, activeChannel, onSelectChannel, onOpenSettings, onOpenServerSettings, onLeaveServer }: ChannelSidebarProps) => {
  const { user } = useAuth();

  if (!server) {
    return (
      <div className="flex w-60 flex-col bg-black/60 backdrop-blur-sm">
        <div className="flex h-12 items-center border-b border-white/10 px-4 shadow-sm">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-60 flex-col bg-black/60 backdrop-blur-sm">
      {/* Server Header */}
      <div className="flex h-12 cursor-pointer items-center justify-between border-b border-white/10 px-4 shadow-sm transition-colors hover:bg-white/5">
        <h1 className="truncate font-bold text-white">{server.name}</h1>
        <div className="flex items-center space-x-2">
          {server.inviteCode && (server.ownerId === user?.id || server.isInviteCodeVisible) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(server.inviteCode);
                toast.success(`Invite code copied: ${server.inviteCode}`);
              }}
              className="text-[#B5BAC1] hover:text-white"
              title="Copy Invite Code"
            >
              <UserPlus size={16} />
            </button>
          )}
          <ChevronDown size={20} className="text-[#B5BAC1]" />
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto px-2 py-4 no-scrollbar">
        {server.categories?.map((category: any) => (
          <div key={category.id} className="mb-4">
            <div className="mb-1 flex items-center px-1 text-xs font-bold uppercase text-[#949BA4]">
              <ChevronDown size={12} className="mr-1" />
              {category.name}
            </div>
            <div className="space-y-[2px]">
              {category.channels?.map((channel: any) => (
                <div
                  key={channel.id}
                  onClick={() => onSelectChannel(channel)}
                  className={cn(
                    "group flex cursor-pointer items-center rounded px-2 py-1 transition-colors",
                    activeChannel?.id === channel.id 
                      ? "bg-white/20 text-white" 
                      : "text-[#949BA4] hover:bg-white/10 hover:text-[#DBDEE1]"
                  )}
                >
                  <Hash size={20} className="mr-1.5 text-[#80848E]" />
                  <span className="truncate font-medium">{channel.name}</span>
                  {activeChannel?.id !== channel.id && (
                    <Settings size={14} className="ml-auto hidden text-[#B5BAC1] group-hover:block hover:text-[#DBDEE1]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="flex h-[52px] items-center bg-black/40 px-2 border-t border-white/5">
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
          {user?.role === 'ADMIN' && (
            <div 
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-[#F04747] hover:bg-[#3F4147] hover:text-[#F04747]"
              onClick={() => window.location.href = '/admin'}
              title="Admin Dashboard"
            >
              <Shield size={20} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
