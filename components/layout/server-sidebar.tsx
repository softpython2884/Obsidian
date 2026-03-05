'use client';

import { Plus, Hash, Compass, MessageSquare, UserPlus, Settings, LogOut, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/auth-provider';

interface ServerSidebarProps {
  servers: any[];
  activeServer: any;
  onSelectServer: (server: any) => void;
  onOpenModal: () => void;
  onOpenServerSettings?: () => void;
  onLeaveServer?: (serverId: string) => void;
  unreadServers?: Record<string, boolean>;
  mentionServers?: Record<string, number>;
}

export const ServerSidebar = ({ servers, activeServer, onSelectServer, onOpenModal, onOpenServerSettings, onLeaveServer, unreadServers, mentionServers }: ServerSidebarProps) => {
  const { user } = useAuth();

  return (
    <div className="flex w-[72px] flex-col items-center space-y-4 bg-glass py-4 h-full z-20">
      {/* Home Button */}
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div
              className="group relative flex items-center justify-center w-full"
              onClick={() => onSelectServer(null)}
            >
              <div className={cn(
                "absolute left-0 w-1 bg-white rounded-r-full transition-all duration-300 ease-out",
                !activeServer ? "h-8 opacity-100" : "h-4 opacity-0 group-hover:opacity-50"
              )} />
              <div className={cn(
                "flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl transition-all duration-300 shadow-lg",
                !activeServer
                  ? "bg-[#5865F2] text-white shadow-[#5865F2]/20"
                  : "bg-[#1a1a1a] text-white/40 hover:bg-[#5865F2]/10 hover:text-[#5865F2]"
              )}>
                <MessageSquare size={24} />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-black text-white border-white/10 font-medium text-xs ml-2">
            Direct Messages
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="h-[1px] w-8 bg-white/5 rounded-full" />

      {/* Server List */}
      <div className="flex-1 space-y-3 overflow-y-auto w-full flex flex-col items-center no-scrollbar py-2">
        {Array.isArray(servers) && servers.map((server) => {
          const isOwner = server.ownerId === user?.id;
          const isAdmin = user?.role === 'ADMIN';

          return (
            <ContextMenu key={server.id}>
              <ContextMenuTrigger>
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div className="group relative flex items-center justify-center w-full" onClick={() => onSelectServer(server)}>
                        <div className={cn(
                          "absolute left-0 w-1 bg-white rounded-r-full transition-all duration-300 ease-out",
                          activeServer?.id === server.id ? "h-8 opacity-100" :
                            unreadServers?.[server.id] ? "h-2 opacity-100" :
                              "h-4 opacity-0 group-hover:opacity-50"
                        )} />
                        <div className={cn(
                          "flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-2xl transition-all duration-300 border border-transparent",
                          activeServer?.id === server.id
                            ? "ring-2 ring-white/10 shadow-lg shadow-black/50"
                            : "hover:bg-white/5 hover:border-white/5"
                        )}>
                          {server.imageUrl ? (
                            <img src={server.imageUrl} alt={server.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a] text-white/60 font-medium text-sm group-hover:text-white transition-colors">
                              {server.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {mentionServers?.[server.id] > 0 && (
                          <div className="absolute -bottom-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#f23f43] px-1 text-[10px] font-bold text-white shadow-sm ring-4 ring-transparent">
                            {mentionServers[server.id] > 99 ? '99+' : mentionServers[server.id]}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-black text-white border-white/10 font-medium text-xs ml-2">
                      {server.name}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-56 bg-[#111] text-white/80 border-white/10 shadow-xl rounded-xl p-1">
                <ContextMenuItem
                  className="cursor-pointer text-emerald-500 focus:bg-emerald-500/10 focus:text-emerald-500 rounded-lg text-xs font-medium"
                  onClick={() => {
                    navigator.clipboard.writeText(server.inviteCode);
                    toast.success("Invite code copied");
                  }}
                >
                  <UserPlus className="mr-2 h-3.5 w-3.5" />
                  Invite People
                </ContextMenuItem>

                {(isOwner || isAdmin) && (
                  <ContextMenuItem
                    className="cursor-pointer focus:bg-white/5 focus:text-white rounded-lg text-xs font-medium"
                    onClick={() => {
                      onSelectServer(server);
                      onOpenServerSettings?.();
                    }}
                  >
                    <Settings className="mr-2 h-3.5 w-3.5" />
                    Server Settings
                  </ContextMenuItem>
                )}

                <ContextMenuSeparator className="bg-white/5" />

                {!isOwner && (
                  <ContextMenuItem
                    className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500 rounded-lg text-xs font-medium"
                    onClick={() => onLeaveServer?.(server.id)}
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Leave Server
                  </ContextMenuItem>
                )}

                <ContextMenuItem
                  className="cursor-pointer text-white/40 focus:bg-white/5 focus:text-white rounded-lg text-[10px] font-medium"
                  onClick={() => {
                    navigator.clipboard.writeText(server.id);
                    toast.success("Server ID copied");
                  }}
                >
                  <Copy className="mr-2 h-3 w-3" />
                  Copy ID
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>

      {/* Add Server Button */}
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl bg-[#1a1a1a] text-white/40 transition-all duration-300 hover:bg-[#23a559] hover:text-white hover:shadow-lg hover:shadow-[#23a559]/20 border border-white/5 hover:border-transparent"
              onClick={onOpenModal}
            >
              <Plus size={24} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-black text-white border-white/10 font-medium text-xs ml-2">
            Add a Server
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
