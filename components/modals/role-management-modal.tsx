'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdateRole: (userId: string, role: string) => void;
}

const roles = [
  { id: 'ADMIN', name: 'Admin', color: '#F04747', icon: Shield },
  { id: 'MODERATOR', name: 'Moderator', color: '#FAA61A', icon: Shield },
  { id: 'MEMBER', name: 'Member', color: '#949BA4', icon: null },
];

export const RoleManagementModal = ({ isOpen, onClose, user, onUpdateRole }: RoleManagementModalProps) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || 'MEMBER');

  const handleSave = () => {
    onUpdateRole(user.id, selectedRole);
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#313338] text-[#DBDEE1] border-none">
        <DialogHeader>
          <DialogTitle className="text-white">Manage Roles for {user.pseudo}</DialogTitle>
          <DialogDescription className="text-[#B5BAC1]">
            Select a role to assign to this user.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 mt-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className={cn(
                "flex items-center justify-between p-3 rounded cursor-pointer transition-colors border border-transparent",
                selectedRole === role.id ? "bg-[#404249] border-[#5865F2]" : "hover:bg-[#35373C]"
              )}
              onClick={() => setSelectedRole(role.id)}
            >
              <div className="flex items-center">
                {role.icon && <role.icon size={16} className="mr-2" style={{ color: role.color }} />}
                <span style={{ color: selectedRole === role.id ? 'white' : role.color }} className="font-medium">
                  {role.name}
                </span>
              </div>
              {selectedRole === role.id && <Check size={16} className="text-[#5865F2]" />}
            </div>
          ))}
        </div>

        <DialogFooter className="mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white hover:underline mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Save Changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
