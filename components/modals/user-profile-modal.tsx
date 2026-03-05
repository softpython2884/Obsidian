'use client';

import React from 'react';
import { Shield, Github, Youtube, Globe, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onStartDM?: (userId: string) => void;
  coords?: { x: number, y: number } | null;
}

export const UserProfileModal = ({ isOpen, onClose, user, onStartDM, coords }: UserProfileModalProps) => {
  if (!user) return null;

  const socialLinks = user.socialLinks ? JSON.parse(user.socialLinks) : {};

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100]"
          onClick={onClose}
        />
      )}

      {isOpen && (
        <div
          className="fixed z-[101] bg-[#111214] p-0 overflow-hidden border-none w-[340px] max-w-[90vw] text-[#DBDEE1] rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: coords ? `${coords.y}px` : '50%',
            left: coords ? `${coords.x}px` : '50%',
            transform: coords ? undefined : 'translate(-50%, -50%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* Banner - More compact */}
          <div
            className="h-[60px] w-full relative"
            style={{
              backgroundColor: user.accentColor || '#5865F2',
              backgroundImage: user.bannerUrl ? `url(${user.bannerUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />

          {/* Avatar - Smaller and overlapping banner */}
          <div className="absolute top-[28px] left-[16px]">
            <div className="h-[80px] w-[80px] rounded-full bg-[#111214] p-[6px]">
              <div className="h-full w-full rounded-full overflow-hidden bg-[#313338] relative">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.pseudo} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/50 bg-[#5865F2]">
                    {user.pseudo?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={cn(
                "absolute bottom-[2px] right-[2px] h-[22px] w-[22px] rounded-full border-[4px] border-[#111214]",
                user.state === 'ONLINE' ? "bg-[#23A559]" :
                  user.state === 'IDLE' ? "bg-[#F0B232]" :
                    user.state === 'DND' ? "bg-[#F23F43]" : "bg-[#80848E]"
              )} />
            </div>
          </div>

          {/* Content - Compact layout */}
          <div className="mt-[54px] px-4 pb-4">
            <div className="bg-[#1e1f22] rounded-lg p-3 border border-white/[0.02]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center">
                    {user.pseudo}
                    {user.role === 'ADMIN' && <Shield size={16} className="ml-1.5 text-[#F04747]" />}
                  </h2>
                  <p className="text-[#B5BAC1] text-xs font-medium">{user.pseudo?.toLowerCase()}</p>
                </div>
                {onStartDM && (
                  <button
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white"
                    onClick={() => {
                      onStartDM(user.id);
                      onClose();
                    }}
                    title="Message"
                  >
                    <MessageSquare size={18} />
                  </button>
                )}
              </div>

              <div className="w-full h-[1px] bg-white/[0.05] my-3" />

              {/* Status */}
              {user.status && (
                <div className="mb-3">
                  <h3 className="text-[10px] font-bold uppercase text-[#B5BAC1] mb-1 tracking-wider">Status</h3>
                  <p className="text-[#DBDEE1] text-xs">{user.status}</p>
                </div>
              )}

              {/* Bio */}
              <div className="mb-3">
                <h3 className="text-[10px] font-bold uppercase text-[#B5BAC1] mb-1 tracking-wider">About Me</h3>
                <p className="text-[#DBDEE1] text-xs whitespace-pre-wrap leading-relaxed">
                  {user.bio || "No bio yet."}
                </p>
              </div>

              {/* Member Since */}
              <div className="mb-3">
                <h3 className="text-[10px] font-bold uppercase text-[#B5BAC1] mb-1 tracking-wider">Member Since</h3>
                <p className="text-[#DBDEE1] text-[11px]">
                  {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Social Links */}
              {(socialLinks.github || socialLinks.youtube || socialLinks.website) && (
                <div>
                  <h3 className="text-[10px] font-bold uppercase text-[#B5BAC1] mb-1 tracking-wider">Connections</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {socialLinks.github && (
                      <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#2B2D31] hover:bg-[#35373C] rounded transition-colors text-[#DBDEE1]">
                        <Github size={16} />
                      </a>
                    )}
                    {socialLinks.youtube && (
                      <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#2B2D31] hover:bg-[#35373C] rounded transition-colors text-[#FF0000]">
                        <Youtube size={16} />
                      </a>
                    )}
                    {socialLinks.website && (
                      <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#2B2D31] hover:bg-[#35373C] rounded transition-colors text-[#3BA55C]">
                        <Globe size={16} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                <span className="text-[9px] text-white/20 font-mono">ID: {user.id}</span>
                <button
                  className="text-[10px] text-[#5865F2] hover:underline"
                  onClick={() => {
                    navigator.clipboard.writeText(user.id);
                  }}
                >
                  Copy ID
                </button>
              </div>
            </div>
          </div>
      )}
        </>
      );
};
