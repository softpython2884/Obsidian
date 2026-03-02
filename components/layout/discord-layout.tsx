'use client';

import React, { useState, useEffect } from 'react';
import { ServerSidebar } from './server-sidebar';
import { ChannelSidebar } from './channel-sidebar';
import { ChatArea } from './chat-area';
import { MemberList } from './member-list';
import { useAuth } from '@/components/providers/auth-provider';

export const DiscordLayout = () => {
  const { user } = useAuth();
  const [activeServer, setActiveServer] = useState<any>(null);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [servers, setServers] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetch(`/api/servers?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setServers(data);
          if (data.length > 0) {
            setActiveServer(data[0]);
            if (data[0].categories?.[0]?.channels?.[0]) {
              setActiveChannel(data[0].categories[0].channels[0]);
            }
          }
        });
    }
  }, [user]);

  const handleCreateServer = async (name: string) => {
    if (!user) return;
    const response = await fetch('/api/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, ownerId: user.id }),
    });
    const newServer = await response.json();
    setServers([...servers, newServer]);
    setActiveServer(newServer);
    setActiveChannel(newServer.categories[0].channels[0]);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#313338]">
      {/* Server Sidebar */}
      <ServerSidebar 
        servers={servers} 
        activeServer={activeServer} 
        onSelectServer={setActiveServer}
        onCreateServer={handleCreateServer}
      />
      
      {/* Channel Sidebar */}
      <ChannelSidebar 
        server={activeServer} 
        activeChannel={activeChannel} 
        onSelectChannel={setActiveChannel}
      />
      
      {/* Main Chat Area */}
      <ChatArea 
        channel={activeChannel} 
      />
      
      {/* Member List */}
      <MemberList server={activeServer} />
    </div>
  );
};
