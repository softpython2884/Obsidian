'use client';

import React from 'react';
import { Plus, Hash, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ServerSidebarProps {
  servers: any[];
  activeServer: any;
  onSelectServer: (server: any) => void;
  onCreateServer: (name: string) => void;
}

export const ServerSidebar = ({ servers, activeServer, onSelectServer, onCreateServer }: ServerSidebarProps) => {
  return (
    <div className="flex w-[72px] flex-col items-center space-y-3 bg-[#1E1F22] py-3">
      {/* Home Button */}
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="group relative flex items-center">
              <div className={cn(
                "absolute -left-1 w-1 bg-white rounded-r-full transition-all duration-200",
                !activeServer ? "h-8" : "h-2 group-hover:h-5"
              )} />
              <div className={cn(
                "flex h-12 w-12 cursor-pointer items-center justify-center rounded-[24px] bg-[#313338] text-[#DBDEE1] transition-all duration-200 hover:rounded-[16px] hover:bg-[#5865F2] hover:text-white",
                !activeServer && "rounded-[16px] bg-[#5865F2] text-white"
              )}>
                <Hash size={28} />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-black text-white border-none font-bold">
            Direct Messages
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="h-[2px] w-8 rounded-full bg-[#35363C]" />

      {/* Server List */}
      {servers.map((server) => (
        <TooltipProvider key={server.id}>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="group relative flex items-center" onClick={() => onSelectServer(server)}>
                <div className={cn(
                  "absolute -left-1 w-1 bg-white rounded-r-full transition-all duration-200",
                  activeServer?.id === server.id ? "h-10" : "h-0 group-hover:h-5"
                )} />
                <div className={cn(
                  "flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-[24px] bg-[#313338] text-[#DBDEE1] transition-all duration-200 hover:rounded-[16px] hover:bg-[#5865F2] hover:text-white",
                  activeServer?.id === server.id && "rounded-[16px] bg-[#5865F2] text-white"
                )}>
                  {server.imageUrl ? (
                    <img src={server.imageUrl} alt={server.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-semibold">{server.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black text-white border-none font-bold">
              {server.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {/* Add Server Button */}
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div 
              className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-[24px] bg-[#313338] text-[#23A559] transition-all duration-200 hover:rounded-[16px] hover:bg-[#23A559] hover:text-white"
              onClick={() => {
                const name = prompt('Server Name:');
                if (name) onCreateServer(name);
              }}
            >
              <Plus size={24} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-black text-white border-none font-bold">
            Add a Server
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-[24px] bg-[#313338] text-[#23A559] transition-all duration-200 hover:rounded-[16px] hover:bg-[#23A559] hover:text-white">
              <Compass size={24} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-black text-white border-none font-bold">
            Explore Discoverable Servers
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
