'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Shield, Users, UserPlus, X, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChannelPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: any;
  server: any;
  serverRoles: any[];
  serverMembers: any[];
  onUpdatePermissions: (channelId: string, permissions: any) => void;
}

interface ChannelPermissions {
  allowedRoles: string[];
  allowedMembers: string[];
  isPrivate: boolean;
}

export const ChannelPermissionsModal: React.FC<ChannelPermissionsModalProps> = ({
  isOpen,
  onClose,
  channel,
  server,
  serverRoles,
  serverMembers,
  onUpdatePermissions
}) => {
  const [permissions, setPermissions] = useState<ChannelPermissions>({
    allowedRoles: channel?.allowedRoles?.map((r: any) => r.id) || [],
    allowedMembers: channel?.allowedMembers?.map((m: any) => m.id) || [],
    isPrivate: channel?.isPrivate || false
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'roles' | 'members'>('roles');

  useEffect(() => {
    if (channel) {
      setPermissions({
        allowedRoles: channel.allowedRoles?.map((r: any) => r.id) || [],
        allowedMembers: channel.allowedMembers?.map((m: any) => m.id) || [],
        isPrivate: channel.isPrivate || false
      });
    }
  }, [channel]);

  const handleToggleRole = (roleId: string) => {
    setPermissions(prev => ({
      ...prev,
      allowedRoles: prev.allowedRoles.includes(roleId)
        ? prev.allowedRoles.filter(id => id !== roleId)
        : [...prev.allowedRoles, roleId]
    }));
  };

  const handleToggleMember = (memberId: string) => {
    setPermissions(prev => ({
      ...prev,
      allowedMembers: prev.allowedMembers.includes(memberId)
        ? prev.allowedMembers.filter(id => id !== memberId)
        : [...prev.allowedMembers, memberId]
    }));
  };

  const handleSave = () => {
    onUpdatePermissions(channel.id, permissions);
    onClose();
  };

  const filteredRoles = serverRoles.filter((role: any) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMembers = serverMembers.filter((member: any) =>
    member.user?.pseudo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.pseudo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (roleId: string) => {
    const role = serverRoles.find((r: any) => r.id === roleId);
    return role?.color || '#B5BAC1';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#313338] text-[#DBDEE1] border-none max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Permissions du canal #{channel?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Toggle Private Channel */}
          <div className="flex items-center justify-between p-4 bg-[#2F3136] rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-[#B5BAC1]" />
              <div>
                <div className="text-white font-medium">Canal Privé</div>
                <div className="text-[#B5BAC1] text-sm">
                  Seuls les rôles et membres sélectionnés peuvent voir ce canal
                </div>
              </div>
            </div>
            <button
              onClick={() => setPermissions(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                permissions.isPrivate ? "bg-[#5865F2]" : "bg-[#4F545C]"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  permissions.isPrivate ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('roles')}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                activeTab === 'roles'
                  ? "text-white border-b-2 border-[#5865F2]"
                  : "text-[#B5BAC1] hover:text-white"
              )}
            >
              Rôles ({permissions.allowedRoles.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                activeTab === 'members'
                  ? "text-white border-b-2 border-[#5865F2]"
                  : "text-[#B5BAC1] hover:text-white"
              )}
            >
              Membres ({permissions.allowedMembers.length})
            </button>
          </div>

          {/* Search */}
          <div className="px-2">
            <input
              type="text"
              placeholder={`Rechercher ${activeTab === 'roles' ? 'des rôles' : 'des membres'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#202225] text-white placeholder-[#72767D] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
            />
          </div>

          {/* Content */}
          <ScrollArea className="max-h-60 px-2">
            {activeTab === 'roles' && (
              <div className="space-y-2">
                {filteredRoles.map((role: any) => {
                  const isSelected = permissions.allowedRoles.includes(role.id);
                  const roleColor = getRoleColor(role.id);
                  
                  return (
                    <div
                      key={role.id}
                      onClick={() => handleToggleRole(role.id)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                        isSelected
                          ? "bg-[#5865F2]/20 border border-[#5865F2]/50"
                          : "bg-[#2F3136] border border-white/10 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: roleColor }}
                        />
                        <span className="text-white font-medium">{role.name}</span>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center",
                        isSelected
                          ? "bg-[#5865F2] border-[#5865F2]"
                          : "border-[#4F545C]"
                      )}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-2">
                {filteredMembers.map((member: any) => {
                  const isSelected = permissions.allowedMembers.includes(member.user?.id || member.id);
                  
                  return (
                    <div
                      key={member.user?.id || member.id}
                      onClick={() => handleToggleMember(member.user?.id || member.id)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                        isSelected
                          ? "bg-[#5865F2]/20 border border-[#5865F2]/50"
                          : "bg-[#2F3136] border border-white/10 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white text-sm font-bold">
                          {(member.user?.pseudo || member.pseudo)?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {member.user?.pseudo || member.pseudo}
                          </div>
                          <div className="text-[#B5BAC1] text-sm">
                            {member.roles?.map((r: any) => r.name).join(', ') || 'Aucun rôle'}
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center",
                        isSelected
                          ? "bg-[#5865F2] border-[#5865F2]"
                          : "border-[#4F545C]"
                      )}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Summary */}
          <div className="bg-[#2F3136] p-4 rounded-lg">
            <div className="text-[#B5BAC1] text-sm">
              {permissions.isPrivate ? (
                <div>
                  <span className="text-white font-medium">
                    {permissions.allowedRoles.length + permissions.allowedMembers.length}
                  </span>{' '}
                  utilisateur(s) autorisé(s) à voir ce canal privé
                </div>
              ) : (
                <div className="text-white font-medium">
                  Ce canal est public - tous les membres peuvent le voir
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="bg-[#2F3136] px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#B5BAC1] hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#5865F2] text-white rounded hover:bg-[#4752C4] transition-colors"
          >
            Sauvegarder
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
