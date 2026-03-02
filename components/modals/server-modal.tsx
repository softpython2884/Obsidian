"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateServer: (name: string) => void;
  onJoinServer: (code: string) => void;
}

export const ServerModal = ({ isOpen, onClose, onCreateServer, onJoinServer }: ServerModalProps) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [serverName, setServerName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleCreate = () => {
    if (serverName.trim()) {
      onCreateServer(serverName);
      setServerName("");
      onClose();
    }
  };

  const handleJoin = () => {
    if (inviteCode.trim()) {
      onJoinServer(inviteCode);
      setInviteCode("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#313338] text-white border-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {activeTab === 'create' ? 'Create a Server' : 'Join a Server'}
          </DialogTitle>
          <DialogDescription className="text-center text-[#B5BAC1]">
            {activeTab === 'create' 
              ? "Your server is where you and your friends hang out. Make yours and start talking." 
              : "Enter an invite below to join an existing server."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center space-x-4 mb-4">
          <Button 
            variant={activeTab === 'create' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('create')}
            className={activeTab === 'create' ? "bg-[#5865F2] hover:bg-[#4752C4]" : "text-[#B5BAC1] hover:text-white hover:bg-[#3F4147]"}
          >
            Create
          </Button>
          <Button 
            variant={activeTab === 'join' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('join')}
            className={activeTab === 'join' ? "bg-[#5865F2] hover:bg-[#4752C4]" : "text-[#B5BAC1] hover:text-white hover:bg-[#3F4147]"}
          >
            Join
          </Button>
        </div>

        <div className="space-y-4 py-4">
          {activeTab === 'create' ? (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase text-[#B5BAC1]">Server Name</Label>
              <Input
                id="name"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="My awesome server"
                className="bg-[#1E1F22] border-none text-white focus-visible:ring-1 focus-visible:ring-[#5865F2]"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="code" className="text-xs font-bold uppercase text-[#B5BAC1]">Invite Code</Label>
              <Input
                id="code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="hX9zK2m"
                className="bg-[#1E1F22] border-none text-white focus-visible:ring-1 focus-visible:ring-[#5865F2]"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-[#B5BAC1] hover:text-white hover:underline">
            Back
          </Button>
          <Button 
            onClick={activeTab === 'create' ? handleCreate : handleJoin}
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
            disabled={activeTab === 'create' ? !serverName.trim() : !inviteCode.trim()}
          >
            {activeTab === 'create' ? 'Create' : 'Join Server'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
