'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Shield, Github, Youtube, Globe, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onStartDM?: (userId: string) => void;
}

export const UserProfileModal = ({ isOpen, onClose, user, onStartDM }: UserProfileModalProps) => {
  if (!user) return null;

  const socialLinks = user.socialLinks ? JSON.parse(user.socialLinks) : {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="bg-[#111214] p-0 overflow-hidden border-none w-[600px] max-w-full text-[#DBDEE1]"
        aria-describedby="user-profile-description"
      >
        <DialogTitle className="sr-only">User Profile: {user.pseudo}</DialogTitle>
        <DialogDescription id="user-profile-description" className="sr-only">
          Profile details for {user.pseudo}, including bio, roles, and social links.
        </DialogDescription>
        {/* Banner */}
        <div 
          className="h-[210px] w-full relative"
          style={{ 
            backgroundColor: user.accentColor || '#5865F2',
            backgroundImage: user.bannerUrl ? `url(${user.bannerUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Avatar */}
        <div className="absolute top-[160px] left-[20px]">
          <div className="h-[92px] w-[92px] rounded-full bg-[#111214] p-[6px]">
            <div className="h-full w-full rounded-full overflow-hidden bg-[#5865F2]">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.pseudo} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                  {user.pseudo?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className={cn(
              "absolute bottom-[6px] right-[6px] h-6 w-6 rounded-full border-[4px] border-[#111214]",
              user.state === 'ONLINE' ? "bg-[#23A559]" : 
              user.state === 'IDLE' ? "bg-[#F0B232]" : 
              user.state === 'DND' ? "bg-[#F23F43]" : "bg-[#80848E]"
            )} />
          </div>
        </div>

        {/* Content */}
        <div className="mt-[50px] px-4 pb-4 bg-[#111214]">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                {user.pseudo}
                {user.role === 'ADMIN' && <Shield size={20} className="ml-2 text-[#F04747]" />}
              </h2>
              <p className="text-[#B5BAC1] text-sm">{user.id}</p>
            </div>
            <button 
              className="bg-[#248046] hover:bg-[#1A6334] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              onClick={() => {
                if (onStartDM) {
                  onStartDM(user.id);
                  onClose();
                } else {
                  alert('Feature coming soon!');
                }
              }}
            >
              Send Message
            </button>
          </div>

          <div className="mt-4 p-3 bg-[#1E1F22] rounded-lg border border-[#2B2D31]">
             {/* Status */}
             {user.status && (
              <div className="mb-4">
                <p className="text-[#DBDEE1] text-sm">{user.status}</p>
              </div>
            )}

            <div className="w-full h-[1px] bg-[#3F4147] my-3" />

            {/* Bio */}
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase text-[#B5BAC1] mb-2">About Me</h3>
              <p className="text-[#DBDEE1] text-sm whitespace-pre-wrap">
                {user.bio || "This user hasn't written a bio yet."}
              </p>
            </div>

            {/* Member Since */}
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase text-[#B5BAC1] mb-2">Member Since</h3>
              <p className="text-[#DBDEE1] text-sm">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Social Links */}
            {(socialLinks.github || socialLinks.youtube || socialLinks.website) && (
              <div>
                <h3 className="text-xs font-bold uppercase text-[#B5BAC1] mb-2">Connections</h3>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.github && (
                    <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-[#2B2D31] hover:bg-[#35373C] px-3 py-2 rounded border border-[#1E1F22] text-sm text-[#DBDEE1] transition-colors">
                      <Github size={16} />
                      <span>GitHub</span>
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-[#2B2D31] hover:bg-[#35373C] px-3 py-2 rounded border border-[#1E1F22] text-sm text-[#DBDEE1] transition-colors">
                      <Youtube size={16} className="text-[#FF0000]" />
                      <span>YouTube</span>
                    </a>
                  )}
                  {socialLinks.website && (
                    <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-[#2B2D31] hover:bg-[#35373C] px-3 py-2 rounded border border-[#1E1F22] text-sm text-[#DBDEE1] transition-colors">
                      <Globe size={16} className="text-[#3BA55C]" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
