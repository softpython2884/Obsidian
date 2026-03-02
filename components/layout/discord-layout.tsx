'use client';

import React, { useState, useEffect } from 'react';
import { ServerSidebar } from './server-sidebar';
import { ChannelSidebar } from './channel-sidebar';
import { ChatArea } from './chat-area';
import { MemberList } from './member-list';
import { ServerModal } from '@/components/modals/server-modal';
import { useAuth } from '@/components/providers/auth-provider';
import { Toaster } from 'sonner';
import { UserSettingsModal } from '@/components/modals/user-settings-modal';
import { UserProfileModal } from '@/components/modals/user-profile-modal';
import { DMSidebar } from '@/components/layout/dm-sidebar';
import { DMView } from '@/components/layout/dm-view';

export const DiscordLayout = () => {
  const { user } = useAuth();
  const [activeServer, setActiveServer] = useState<any>(null);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [servers, setServers] = useState<any[]>([]);

  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    // Temporary fix for existing messages showing as edited
    fetch('/api/admin/fix-db').catch(console.error);
  }, []);

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
    try {
      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ownerId: user.id }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to create server: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const newServer = await response.json();
      setServers([...servers, newServer]);
      setActiveServer(newServer);
      if (newServer.categories?.[0]?.channels?.[0]) {
        setActiveChannel(newServer.categories[0].channels[0]);
      }
      setIsServerModalOpen(false);
    } catch (error) {
      console.error('Error creating server:', error);
      alert('Failed to create server. Please check your connection.');
    }
  };

  const handleJoinServer = async (inviteCode: string) => {
    if (!user) return;
    try {
      const response = await fetch('/api/servers/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode, userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to join server: ${errorData.error || 'Invalid invite code'}`);
        return;
      }

      const joinedServer = await response.json();
      
      // Check if already in server list to avoid duplicates
      if (!servers.find(s => s.id === joinedServer.id)) {
        setServers([...servers, joinedServer]);
      }
      
      setActiveServer(joinedServer);
      if (joinedServer.categories?.[0]?.channels?.[0]) {
        setActiveChannel(joinedServer.categories[0].channels[0]);
      }
      setIsServerModalOpen(false);
    } catch (error) {
      console.error('Error joining server:', error);
      alert('Failed to join server. Please check your connection.');
    }
  };

  const handleStartDM = async (targetUserId: string) => {
    if (!user) return;
    try {
      const response = await fetch('/api/channels/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, targetUserId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to start DM: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const dmChannel = await response.json();
      setActiveChannel(dmChannel);
    } catch (error) {
      console.error('Error starting DM:', error);
      alert('Failed to start DM.');
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent">
      {/* Server Sidebar */}
      <ServerSidebar 
        servers={servers} 
        activeServer={activeServer} 
        onSelectServer={(server) => {
          setActiveServer(server);
          if (server) {
            if (server.categories?.[0]?.channels?.[0]) {
              setActiveChannel(server.categories[0].channels[0]);
            } else {
              setActiveChannel(null);
            }
          } else {
            setActiveChannel(null);
          }
        }}
        onOpenModal={() => setIsServerModalOpen(true)}
      />
      
      {activeServer ? (
        <>
          {/* Channel Sidebar */}
          <ChannelSidebar 
            server={activeServer} 
            activeChannel={activeChannel} 
            onSelectChannel={setActiveChannel}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
          
          {/* Main Chat Area */}
          <ChatArea 
            channel={activeChannel} 
            onViewProfile={setSelectedUser}
          />
          
          {/* Member List */}
          <MemberList 
            server={activeServer} 
            onViewProfile={setSelectedUser}
          />
        </>
      ) : (
        <>
          <DMSidebar 
            activeChannel={activeChannel} 
            onSelectChannel={setActiveChannel}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
          {activeChannel ? (
            <ChatArea 
              channel={activeChannel} 
              onViewProfile={setSelectedUser}
            />
          ) : (
            <DMView onStartDM={handleStartDM} />
          )}
        </>
      )}

      {/* Server Modal */}
      <ServerModal 
        isOpen={isServerModalOpen} 
        onClose={() => setIsServerModalOpen(false)} 
        onCreateServer={handleCreateServer}
        onJoinServer={handleJoinServer}
      />

      {/* User Settings Modal */}
      <UserSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />

      <Toaster theme="dark" position="bottom-center" />
    </div>
  );
};
