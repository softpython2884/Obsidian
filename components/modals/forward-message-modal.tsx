import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/providers/auth-provider';

interface ForwardMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForward: (channelId: string) => void;
  currentServerId?: string;
}

export const ForwardMessageModal = ({ isOpen, onClose, onForward, currentServerId }: ForwardMessageModalProps) => {
  const { user } = useAuth();
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>('');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');

  const channels = React.useMemo(() => {
    if (!selectedServerId || servers.length === 0) return [];
    const server = servers.find(s => s.id === selectedServerId);
    if (!server) return [];
    const allChannels = server.categories?.flatMap((c: any) => c.channels) || [];
    return allChannels.filter((c: any) => c.type === 'TEXT');
  }, [selectedServerId, servers]);

  useEffect(() => {
    if (isOpen && user) {
      // Fetch user's servers
      fetch(`/api/servers?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
            setServers(data);
            let initialServerId = '';
            if (currentServerId) {
                initialServerId = currentServerId;
            } else if (data.length > 0) {
                initialServerId = data[0].id;
            }
            
            if (initialServerId) {
                setSelectedServerId(initialServerId);
                const server = data.find((s: any) => s.id === initialServerId);
                if (server) {
                    const allChannels = server.categories?.flatMap((c: any) => c.channels) || [];
                    const textChannels = allChannels.filter((c: any) => c.type === 'TEXT');
                    if (textChannels.length > 0) {
                        setSelectedChannelId(textChannels[0].id);
                    }
                }
            }
        })
        .catch(err => console.error("Failed to fetch servers", err));
    }
  }, [isOpen, currentServerId, user]);

  const handleServerChange = (serverId: string) => {
      setSelectedServerId(serverId);
      const server = servers.find(s => s.id === serverId);
      if (server) {
          const allChannels = server.categories?.flatMap((c: any) => c.channels) || [];
          const textChannels = allChannels.filter((c: any) => c.type === 'TEXT');
          if (textChannels.length > 0) {
              setSelectedChannelId(textChannels[0].id);
          } else {
              setSelectedChannelId('');
          }
      }
  };

  const handleForward = () => {
    if (selectedChannelId) {
      onForward(selectedChannelId);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#313338] text-[#DBDEE1] border-none max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-bold">Forward Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-bold text-[#B5BAC1] uppercase">Select Server</Label>
            <Select onValueChange={handleServerChange} value={selectedServerId}>
              <SelectTrigger className="w-full bg-[#1E1F22] border-none text-[#DBDEE1] mt-1">
                <SelectValue placeholder="Select a server" />
              </SelectTrigger>
              <SelectContent className="bg-[#1E1F22] border-[#2B2D31] text-[#DBDEE1]">
                {servers.map((server) => (
                  <SelectItem key={server.id} value={server.id} className="focus:bg-[#35373C] focus:text-white cursor-pointer">
                    {server.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-bold text-[#B5BAC1] uppercase">Select Channel</Label>
            <Select onValueChange={setSelectedChannelId} value={selectedChannelId}>
              <SelectTrigger className="w-full bg-[#1E1F22] border-none text-[#DBDEE1] mt-1">
                <SelectValue placeholder="Select a channel" />
              </SelectTrigger>
              <SelectContent className="bg-[#1E1F22] border-[#2B2D31] text-[#DBDEE1]">
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id} className="focus:bg-[#35373C] focus:text-white cursor-pointer">
                    # {channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-[#DBDEE1] hover:bg-[#3F4147] hover:text-white">
            Cancel
          </Button>
          <Button onClick={handleForward} className="bg-[#5865F2] hover:bg-[#4752C4] text-white" disabled={!selectedChannelId}>
            Forward
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
