'use client';

import React from 'react';
import { Plus, Hash, Compass, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ServerSidebarProps {
  servers: any[];
  activeServer: any;
  onSelectServer: (server: any) => void;
  onOpenModal: () => void;
}

export const ServerSidebar = ({ servers, activeServer, onSelectServer, onOpenModal }: ServerSidebarProps) => {
  return (
    <div className="flex w-[72px] flex-col items-center space-y-4 bg-[#050505] py-4 border-r border-white/5 h-full z-20">
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
        {Array.isArray(servers) && servers.map((server) => (
          <TooltipProvider key={server.id}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="group relative flex items-center justify-center w-full" onClick={() => onSelectServer(server)}>
                  <div className={cn(
                    "absolute left-0 w-1 bg-white rounded-r-full transition-all duration-300 ease-out",
                    activeServer?.id === server.id ? "h-8 opacity-100" : "h-4 opacity-0 group-hover:opacity-50"
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
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-black text-white border-white/10 font-medium text-xs ml-2">
                {server.name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
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
