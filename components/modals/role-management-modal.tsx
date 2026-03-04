import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  member: any;
  serverRoles: any[];
  onUpdateRoles: (userId: string, roleIds: string[]) => void;
}

export const RoleManagementModal = ({ isOpen, onClose, user, member, serverRoles, onUpdateRoles }: RoleManagementModalProps) => {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  useEffect(() => {
    if (member?.roles) {
      setSelectedRoleIds(member.roles.map((r: any) => r.id));
    } else {
      setSelectedRoleIds([]);
    }
  }, [member, isOpen]);

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = () => {
    onUpdateRoles(user.id, selectedRoleIds);
    onClose();
  };

  if (!user || !member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#313338] text-[#DBDEE1] border-none max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Manage Roles for {user.pseudo}</DialogTitle>
          <DialogDescription className="text-[#B5BAC1]">
            Assign roles to this member to grant them specific permissions.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] mt-4 pr-4">
          <div className="space-y-1">
            {serverRoles.sort((a, b) => b.position - a.position).map((role) => (
              <div
                key={role.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded cursor-pointer transition-colors hover:bg-[#35373C]",
                  selectedRoleIds.includes(role.id) && "bg-[#404249]"
                )}
                onClick={() => toggleRole(role.id)}
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3 shadow-sm"
                    style={{ backgroundColor: role.color }}
                  />
                  <span className={cn(
                    "font-medium text-sm",
                    selectedRoleIds.includes(role.id) ? "text-white" : "text-[#B5BAC1]"
                  )}>
                    {role.name}
                  </span>
                </div>
                <div className={cn(
                  "w-5 h-5 border-2 rounded flex items-center justify-center transition-all",
                  selectedRoleIds.includes(role.id)
                    ? "bg-[#5865F2] border-[#5865F2]"
                    : "border-[#4E5058]"
                )}>
                  {selectedRoleIds.includes(role.id) && <Check size={14} className="text-white" />}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6 bg-[#2B2D31] -mx-6 -mb-6 p-4">
          <div className="flex justify-end w-full space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white hover:underline"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-2 rounded text-sm font-medium transition-colors shadow-lg shadow-[#5865F2]/20"
            >
              Save Changes
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
