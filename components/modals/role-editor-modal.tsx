'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Shield, Palette, X, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Importer toutes les icônes Lucide disponibles
import * as LucideIcons from 'lucide-react';

interface RoleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: any;
  serverRoles: any[];
  onSaveRole: (role: any) => void;
}

interface RoleData {
  name: string;
  color: string;
  permissions: string[];
  icon?: string;
  position: number;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'ADMIN', name: 'Administrateur', description: 'Accès complet au serveur' },
  { id: 'MANAGE_SERVER', name: 'Gérer le serveur', description: 'Gérer les paramètres du serveur' },
  { id: 'MANAGE_ROLES', name: 'Gérer les rôles', description: 'Créer et modifier les rôles' },
  { id: 'MANAGE_CHANNELS', name: 'Gérer les canaux', description: 'Créer et modifier les canaux' },
  { id: 'MANAGE_MESSAGES', name: 'Gérer les messages', description: 'Supprimer les messages des autres' },
  { id: 'SEND_MESSAGES', name: 'Envoyer des messages', description: 'Envoyer des messages dans les canaux' },
  { id: 'VIEW_AUDIT_LOG', name: 'Voir les journaux', description: 'Voir les journaux du serveur' },
  { id: 'PRIORITY_SPEAKER', name: 'Priorité parole', description: 'Parler en priorité dans les salons vocaux' },
  { id: 'MUTE_MEMBERS', name: 'Rendre muet', description: 'Rendre muet des membres' },
  { id: 'DEAFEN_MEMBERS', name: 'Rendre sourd', description: 'Rendre sourd des membres' },
  { id: 'MOVE_MEMBERS', name: 'Déplacer les membres', description: 'Déplacer les membres entre les salons vocaux' },
  { id: 'EMBED_LINKS', name: 'Intégrer des liens', description: 'Intégrer des liens dans les messages' },
  { id: 'ATTACH_FILES', name: 'Joindre des fichiers', description: 'Joindre des fichiers aux messages' },
  { id: 'READ_MESSAGE_HISTORY', name: 'Voir l\'historique', description: 'Voir l\'historique des messages' },
];

const ROLE_COLORS = [
  '#5865F2', '#57F287', '#ED4245', '#FEE75C', '#FFA500', '#EF4444',
  '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#8B5A2B',
  '#EAB308', '#84CC16', '#22C55E', '#A855F7', '#991B1B', '#7C3AED', '#3B82F6',
];

export const RoleEditorModal: React.FC<RoleEditorModalProps> = ({
  isOpen,
  onClose,
  role,
  serverRoles,
  onSaveRole
}) => {
  const [roleData, setRoleData] = useState<RoleData>({
    name: role?.name || '',
    color: role?.color || '#5865F2',
    permissions: role?.permissions || [],
    icon: role?.icon || 'Shield',
    position: role?.position || serverRoles?.length || 0,
  });

  const [searchIcon, setSearchIcon] = useState('');

  useEffect(() => {
    if (role) {
      setRoleData({
        name: role.name || '',
        color: role.color || '#5865F2',
        permissions: role.permissions || [],
        icon: role.icon || 'Shield',
        position: role.position || serverRoles?.length || 0,
      });
    }
  }, [role, serverRoles]);

  const handleSave = () => {
    if (!roleData.name.trim()) {
      alert('Le nom du rôle ne peut pas être vide');
      return;
    }

    const newRole = {
      ...role,
      ...roleData,
      id: role?.id || `role_${Date.now()}`
    };

    onSaveRole(newRole);
    onClose();
  };

  const togglePermission = (permissionId: string) => {
    setRoleData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const filteredIcons = Object.entries(LucideIcons)
    .filter(([name]) => 
      name.toLowerCase().includes(searchIcon.toLowerCase()) &&
      name !== 'createLucideIcon' && 
      name !== 'default'
    )
    .map(([name, component]) => ({ name, component }));

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || Shield;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#313338] text-[#DBDEE1] border-none max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {role ? 'Modifier le rôle' : 'Créer un rôle'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Nom du rôle */}
          <div>
            <label className="block text-[#B5BAC1] text-sm font-medium mb-2">
              Nom du rôle
            </label>
            <input
              type="text"
              value={roleData.name}
              onChange={(e) => setRoleData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Entrez un nom de rôle..."
              className="w-full bg-[#202225] text-white placeholder-[#72767D] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
            />
          </div>

          {/* Couleur du rôle */}
          <div>
            <label className="block text-[#B5BAC1] text-sm font-medium mb-2">
              Couleur du rôle
            </label>
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-8 gap-2">
                {ROLE_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setRoleData(prev => ({ ...prev, color }))}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all",
                      roleData.color === color
                        ? "border-white scale-110"
                        : "border-transparent hover:border-white/50"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={roleData.color}
                onChange={(e) => setRoleData(prev => ({ ...prev, color: e.target.value }))}
                className="w-20 h-10 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Icône du rôle */}
          <div>
            <label className="block text-[#B5BAC1] text-sm font-medium mb-2">
              Icône du rôle
            </label>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 bg-[#202225] text-white rounded-lg hover:bg-white/10 transition-colors">
                    {(() => {
                      const IconComponent = getIconComponent(roleData.icon);
                      return <IconComponent size={20} className="text-[#B5BAC1]" />;
                    })()}
                    <ChevronDown size={16} className="text-[#B5BAC1]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#202225] border border-white/10 max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Rechercher une icône..."
                      value={searchIcon}
                      onChange={(e) => setSearchIcon(e.target.value)}
                      className="w-full bg-[#111214] text-white placeholder-[#72767D] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#5865F2] mb-2"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filteredIcons.map(({ name, component: IconComponent }) => (
                      <DropdownMenuItem
                        key={name}
                        onClick={() => setRoleData(prev => ({ ...prev, icon: name }))}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-white/10 cursor-pointer"
                      >
                        <IconComponent size={16} className="text-[#B5BAC1]" />
                        <span className="text-white text-sm">{name}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Position du rôle */}
          <div>
            <label className="block text-[#B5BAC1] text-sm font-medium mb-2">
              Position du rôle
            </label>
            <input
              type="number"
              value={roleData.position}
              onChange={(e) => setRoleData(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
              min={0}
              max={serverRoles?.length || 0}
              className="w-full bg-[#202225] text-white placeholder-[#72767D] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
            />
            <div className="text-[#72767D] text-xs mt-1">
              Position pour l'ordre d'affichage (0 = le plus haut)
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-[#B5BAC1] text-sm font-medium mb-3">
              Permissions du rôle
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {AVAILABLE_PERMISSIONS.map((permission) => {
                const hasPermission = roleData.permissions.includes(permission.id);
                
                return (
                  <div
                    key={permission.id}
                    onClick={() => togglePermission(permission.id)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                      hasPermission
                        ? "bg-[#5865F2]/20 border border-[#5865F2]/50"
                        : "bg-[#2F3136] border border-white/10 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-[#5865F2] flex items-center justify-center">
                        {hasPermission && <Check size={12} className="text-white" />}
                      </div>
                      <div>
                        <div className="text-white font-medium">{permission.name}</div>
                        <div className="text-[#B5BAC1] text-xs">{permission.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aperçu du rôle */}
          <div className="bg-[#2F3136] p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: roleData.color }}
              >
                {(() => {
                  const IconComponent = getIconComponent(roleData.icon);
                  return <IconComponent size={24} />;
                })()}
              </div>
              <div>
                <div className="text-white font-medium">{roleData.name || 'Nouveau Rôle'}</div>
                <div className="text-[#B5BAC1] text-sm">
                  {roleData.permissions.length} permission(s) • Position {roleData.position}
                </div>
              </div>
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
            disabled={!roleData.name.trim()}
            className={cn(
              "px-4 py-2 bg-[#5865F2] text-white rounded hover:bg-[#4752C4] transition-colors",
              !roleData.name.trim() && "opacity-50 cursor-not-allowed"
            )}
          >
            {role ? 'Modifier' : 'Créer'} le rôle
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
