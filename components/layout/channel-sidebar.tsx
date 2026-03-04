'use client';

import React from 'react';
import { Hash, ChevronDown, Settings, Mic, Headphones, Settings2, Shield, UserPlus, LogOut, Trash2, Volume2, Lock, Copy } from 'lucide-react';
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

interface ChannelSidebarProps {
  server: any;
  activeChannel: any;
  onSelectChannel: (channel: any) => void;
  onOpenSettings: () => void;
  onOpenServerSettings?: () => void;
  onLeaveServer?: () => void;
}

export const ChannelSidebar = ({ server, activeChannel, onSelectChannel, onOpenSettings, onOpenServerSettings, onLeaveServer }: ChannelSidebarProps) => {
  const { user, logout } = useAuth();
  const [isMicMuted, setIsMicMuted] = React.useState(false);
  const [isDeafened, setIsDeafened] = React.useState(false);

  if (!server) {
    return (
      <div className="flex w-64 flex-col bg-[#0a0a0a] border-r border-white/5 h-full">
        <div className="flex h-14 items-center border-b border-white/5 px-4">
          <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    );
  }

  const isOwner = server.ownerId === user?.id;
  const member = server.members?.find((m: any) => m.userId === user?.id);
  const isAdmin = member?.roles?.some((r: any) => r.permissions === 'ADMIN') || user?.role === 'ADMIN';

  return (
    <div className="flex w-64 flex-col bg-glass h-full font-sans">
      {/* Server Header */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex h-14 cursor-pointer items-center justify-between border-b border-white/5 px-4 transition-colors hover:bg-white/[0.02]">
            <h1 className="truncate font-semibold text-white text-sm tracking-wide">{server.name}</h1>
            <ChevronDown size={16} className="text-white/40" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#111] text-white/80 border-white/10 shadow-xl rounded-xl p-1">
          <DropdownMenuLabel className="text-[10px] font-bold uppercase text-white/40 px-2 py-1.5 tracking-wider">
            {server.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/5" />

          {server.inviteCode && (
            <DropdownMenuItem
              className="cursor-pointer text-emerald-500 focus:bg-emerald-500/10 focus:text-emerald-500 rounded-lg text-xs font-medium"
              onClick={() => {
                navigator.clipboard.writeText(server.inviteCode);
                toast.success(`Invite code copied: ${server.inviteCode}`);
              }}
            >
              <UserPlus className="mr-2 h-3.5 w-3.5" />
              <span>Invite People</span>
            </DropdownMenuItem>
          )}

          {(server.ownerId === user?.id || user?.role === 'ADMIN') && (
            <DropdownMenuItem
              className="cursor-pointer text-white/80 focus:bg-white/5 focus:text-white rounded-lg text-xs font-medium"
              onClick={onOpenServerSettings}
            >
              <Settings className="mr-2 h-3.5 w-3.5" />
              <span>Server Settings</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-white/5" />

          {server.ownerId !== user?.id && (
            <DropdownMenuItem
              className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500 rounded-lg text-xs font-medium"
              onClick={onLeaveServer}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              <span>Leave Server</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto px-2 py-4 no-scrollbar space-y-6">
        {server.categories?.map((category: any) => (
          <div key={category.id} className="mb-2">
            <ContextMenu>
              <ContextMenuTrigger>
                <div className="mb-1 flex items-center px-2 text-[10px] font-bold uppercase text-white/30 tracking-wider hover:text-white/50 transition-colors cursor-default">
                  <ChevronDown size={10} className="mr-1" />
                  {category.name}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48 bg-[#111214] border-[#1e1f22] text-[#B5BAC1]">
                <ContextMenuItem
                  className="hover:bg-white/10 hover:text-white cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(category.id);
                    toast.success("Category ID Copied");
                  }}
                >
                  <Copy size={14} className="mr-2" />
                  Copy ID
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <div className="space-y-[1px]">
              {category.channels?.filter((channel: any) => {
                if (isOwner || isAdmin) return true;
                if (!channel.isPrivate) return true;

                // For private channels, check if user has an allowed role
                return channel.allowedRoles?.some((allowedRole: any) =>
                  member?.roles?.some((memberRole: any) => memberRole.id === allowedRole.id)
                );
              }).map((channel: any) => (
                <ContextMenu key={channel.id}>
                  <ContextMenuTrigger>
                    <div
                      onClick={() => onSelectChannel(channel)}
                      className={cn(
                        "group flex cursor-pointer items-center rounded-lg px-2 py-1.5 transition-all duration-200",
                        activeChannel?.id === channel.id
                          ? "bg-white/10 text-white"
                          : "text-white/40 hover:bg-white/5 hover:text-white/80"
                      )}
                    >
                      {channel.isPrivate ? (
                        <Lock size={14} className={cn("mr-2", activeChannel?.id === channel.id ? "text-[#F0B232]" : "text-[#F0B232]/40 group-hover:text-[#F0B232]/60")} />
                      ) : (
                        channel.type === 'VOICE' ? (
                          <Volume2 size={16} className={cn("mr-2", activeChannel?.id === channel.id ? "text-white/60" : "text-white/20 group-hover:text-white/40")} />
                        ) : (
                          <Hash size={16} className={cn("mr-2", activeChannel?.id === channel.id ? "text-white/60" : "text-white/20 group-hover:text-white/40")} />
                        )
                      )}
                      <span className={cn("truncate text-sm font-medium", activeChannel?.id === channel.id ? "text-white" : "text-white/60 group-hover:text-white/90")}>{channel.name}</span>
                      {((server.ownerId === user?.id || isAdmin) && activeChannel?.id !== channel.id) && (
                        <Settings
                          size={12}
                          className="ml-auto hidden text-white/20 group-hover:block hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenServerSettings?.();
                          }}
                        />
                      )}
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-48 bg-[#111214] border-[#1e1f22] text-[#B5BAC1]">
                    {(isOwner || isAdmin) && (
                      <>
                        <ContextMenuItem
                          className="hover:bg-[#4752C4] hover:text-white cursor-pointer"
                          onClick={() => onOpenServerSettings?.()}
                        >
                          <Settings size={14} className="mr-2" />
                          Edit Channel
                        </ContextMenuItem>
                        <ContextMenuItem
                          className="text-red-400 hover:bg-red-500 hover:text-white cursor-pointer"
                          onClick={() => {
                            if (confirm(`Delete #${channel.name}?`)) {
                              fetch(`/api/servers/${server.id}/channels/${channel.id}`, { method: 'DELETE' })
                                .then(res => res.ok && onOpenServerSettings?.());
                            }
                          }}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Delete Channel
                        </ContextMenuItem>
                        <ContextMenuSeparator className="bg-white/5" />
                      </>
                    )}
                    <ContextMenuItem
                      className="hover:bg-white/10 hover:text-white cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(channel.id);
                        toast.success("ID Copied");
                      }}
                    >
                      <Copy size={14} className="mr-2" />
                      Copy ID
                    </ContextMenuItem>
                  </ContextMenuContent>

                </ContextMenu>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer - Minimal */}
      <div className="bg-transparent px-3 py-3 border-t border-white/5">
        <div className="flex items-center justify-between bg-black/20 rounded-xl p-0.5">
          <div
            className="flex flex-1 cursor-pointer items-center rounded-lg px-1 py-1 hover:bg-white/5 transition-colors"
            onClick={onOpenSettings}
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[#5865F2] shadow-inner">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.pseudo} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                  {user?.pseudo?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={cn(
                "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#232428]",
                user?.state === 'ONLINE' ? "bg-emerald-500" :
                  user?.state === 'IDLE' ? "bg-amber-500" :
                    user?.state === 'DND' ? "bg-red-500" : "bg-white/20"
              )} />
            </div>
            <div className="ml-2.5 flex flex-col overflow-hidden">
              <span className="truncate text-xs font-semibold text-white leading-tight">{user?.pseudo}</span>
              <span className="truncate text-[10px] text-white/30 leading-tight font-mono">#{user?.id.slice(0, 4)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-0.5 ml-1">
            <div
              className={cn("p-1.5 rounded-lg cursor-pointer transition-colors", isMicMuted ? "text-red-500 bg-red-500/10 hover:bg-red-500/20" : "text-white/40 hover:bg-white/10 hover:text-white")}
              onClick={() => setIsMicMuted(!isMicMuted)}
            >
              <Mic size={14} className={cn(isMicMuted && "fill-current")} />
            </div>
            <div
              className={cn("p-1.5 rounded-lg cursor-pointer transition-colors", isDeafened ? "text-red-500 bg-red-500/10 hover:bg-red-500/20" : "text-white/40 hover:bg-white/10 hover:text-white")}
              onClick={() => setIsDeafened(!isDeafened)}
            >
              <Headphones size={14} className={cn(isDeafened && "fill-current")} />
            </div>
            <div className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer text-white/40 hover:text-white transition-colors" onClick={onOpenSettings}>
              <Settings2 size={14} />
            </div>
            <div
              className="p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer text-white/40 hover:text-red-500 transition-colors"
              onClick={() => {
                if (confirm("Are you sure you want to log out?")) {
                  logout();
                }
              }}
              title="Logout"
            >
              <LogOut size={14} />
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};
