"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Shield, Hash, Volume2, UserX, Ban, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: any;
  onUpdateServer: (updatedServer: any) => void;
  onDeleteServer: (serverId: string) => void;
}

export const ServerSettingsModal = ({ isOpen, onClose, server, onUpdateServer, onDeleteServer }: ServerSettingsModalProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Overview State
  const [serverName, setServerName] = useState(server?.name || "");
  const [serverImage, setServerImage] = useState(server?.imageUrl || "");

  // Roles State
  const [roles, setRoles] = useState<any[]>([]);
  const [editingRole, setEditingRole] = useState<any>(null);

  // Channels State
  const [categories, setCategories] = useState<any[]>([]);

  // Members State
  const [members, setMembers] = useState<any[]>([]);

  const fetchRoles = async () => {
    try {
      const res = await fetch(`/api/servers/${server.id}/roles`);
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles", error);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch(`/api/servers/${server.id}/channels`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch channels", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/servers/${server.id}/members`);
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error("Failed to fetch members", error);
    }
  };

  const prevIsOpen = useRef(false);

  useEffect(() => {
    if (isOpen && server) {
      setServerName(server.name);
      setServerImage(server.imageUrl || "");
      fetchRoles();
      fetchChannels();
      fetchMembers();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveOverview = async () => {
    try {
      const res = await fetch(`/api/servers/${server.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: serverName, imageUrl: serverImage }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdateServer(updated);
        toast.success("Server settings updated");
      }
    } catch (error) {
      toast.error("Failed to update server");
    }
  };

  const handleDeleteServer = async () => {
    if (confirm("Are you sure you want to delete this server? This action cannot be undone.")) {
      try {
        const res = await fetch(`/api/servers/${server.id}`, { method: "DELETE" });
        if (res.ok) {
          onDeleteServer(server.id);
          onClose();
          toast.success("Server deleted");
        }
      } catch (error) {
        toast.error("Failed to delete server");
      }
    }
  };

  // Role Handlers
  const handleCreateRole = async () => {
    try {
      const res = await fetch(`/api/servers/${server.id}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Role", color: "#99AAB5" }),
      });
      if (res.ok) {
        fetchRoles();
        toast.success("Role created");
      }
    } catch (error) {
      toast.error("Failed to create role");
    }
  };

  const handleUpdateRole = async (roleId: string, data: any) => {
    try {
      const res = await fetch(`/api/servers/${server.id}/roles/${roleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        fetchRoles();
        if (editingRole?.id === roleId) {
          setEditingRole({ ...editingRole, ...data });
        }
        toast.success("Role updated");
      }
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (confirm("Delete this role?")) {
      try {
        const res = await fetch(`/api/servers/${server.id}/roles/${roleId}`, { method: "DELETE" });
        if (res.ok) {
          fetchRoles();
          setEditingRole(null);
          toast.success("Role deleted");
        }
      } catch (error) {
        toast.error("Failed to delete role");
      }
    }
  };

  // Member Handlers
  const handleKickMember = async (memberId: string) => {
    if (confirm("Kick this member?")) {
      try {
        const res = await fetch(`/api/servers/${server.id}/kick`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId }),
        });
        if (res.ok) {
          fetchMembers();
          toast.success("Member kicked");
        }
      } catch (error) {
        toast.error("Failed to kick member");
      }
    }
  };

  const handleBanMember = async (memberId: string) => {
    if (confirm("Ban this member?")) {
      try {
        const res = await fetch(`/api/servers/${server.id}/ban`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId }),
        });
        if (res.ok) {
          fetchMembers();
          toast.success("Member banned");
        }
      } catch (error) {
        toast.error("Failed to ban member");
      }
    }
  };

  if (!server) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#313338] text-white border-none max-w-4xl h-[80vh] flex p-0 overflow-hidden">
        <DialogTitle className="sr-only">Server Settings</DialogTitle>
        <DialogDescription className="sr-only">Manage your server settings, roles, and members.</DialogDescription>
        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex w-full h-full">
          <div className="w-60 bg-[#2B2D31] p-4 flex flex-col">
            <h2 className="font-bold text-[#949BA4] text-xs uppercase mb-4 px-2">Server Settings</h2>
            <TabsList className="flex flex-col h-auto bg-transparent items-stretch space-y-1 p-0">
              <TabsTrigger value="overview" className="justify-start px-2 py-1.5 data-[state=active]:bg-[#404249] data-[state=active]:text-white text-[#B5BAC1]">Overview</TabsTrigger>
              <TabsTrigger value="roles" className="justify-start px-2 py-1.5 data-[state=active]:bg-[#404249] data-[state=active]:text-white text-[#B5BAC1]">Roles</TabsTrigger>
              <TabsTrigger value="channels" className="justify-start px-2 py-1.5 data-[state=active]:bg-[#404249] data-[state=active]:text-white text-[#B5BAC1]">Channels</TabsTrigger>
              <TabsTrigger value="members" className="justify-start px-2 py-1.5 data-[state=active]:bg-[#404249] data-[state=active]:text-white text-[#B5BAC1]">Members</TabsTrigger>
            </TabsList>
            <div className="mt-auto pt-4 border-t border-[#1E1F22]">
              <Button
                variant="ghost"
                className="w-full justify-start text-[#F23F43] hover:bg-[#F23F43]/10 hover:text-[#F23F43] px-2"
                onClick={handleDeleteServer}
              >
                Delete Server
              </Button>
            </div>
          </div>

          <div className="flex-1 bg-[#313338] p-8 overflow-y-auto">
            <TabsContent value="overview" className="mt-0 space-y-6">
              <h2 className="text-xl font-bold mb-4">Server Overview</h2>
              <div className="flex space-x-8">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold text-[#B5BAC1]">Server Name</Label>
                    <Input
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                      className="bg-[#1E1F22] border-none text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs font-bold text-[#B5BAC1]">Server Avatar URL</Label>
                    <Input
                      value={serverImage}
                      onChange={(e) => setServerImage(e.target.value)}
                      placeholder="https://example.com/avatar.png"
                      className="bg-[#1E1F22] border-none text-white focus-visible:ring-1 focus-visible:ring-[#5865F2]"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-32 h-32 bg-[#1E1F22] rounded-full flex items-center justify-center overflow-hidden shrink-0 border-4 border-[#2B2D31] shadow-xl">
                    {serverImage ? (
                      <img src={serverImage} alt="Server" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-3xl font-bold text-white/20 select-none">
                        {serverName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {serverImage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 h-7"
                      onClick={() => setServerImage('')}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-[#1E1F22]">
                <Button onClick={handleSaveOverview} className="bg-[#23A559] hover:bg-[#23A559]/80 text-white min-w-[120px]">Save Changes</Button>
              </div>
            </TabsContent>

            <TabsContent value="roles" className="mt-0 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Roles</h2>
                <Button onClick={handleCreateRole} size="sm" className="bg-[#5865F2]">Create Role</Button>
              </div>
              <div className="flex flex-1 gap-4 overflow-hidden">
                <div className="w-1/3 bg-[#2B2D31] rounded overflow-y-auto">
                  {roles.map(role => (
                    <div
                      key={role.id}
                      onClick={() => setEditingRole(role)}
                      className={`p-2 cursor-pointer flex items-center justify-between hover:bg-[#404249] ${editingRole?.id === role.id ? 'bg-[#404249]' : ''}`}
                    >
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: role.color }} />
                        <span>{role.name}</span>
                      </div>
                      <ChevronRight size={16} className="text-[#B5BAC1]" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-[#2B2D31] rounded p-4 overflow-y-auto">
                  {editingRole ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-[#B5BAC1]">Role Name</Label>
                        <Input
                          value={editingRole.name}
                          onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                          className="bg-[#1E1F22] border-none text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-[#B5BAC1]">Role Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="color"
                            value={editingRole.color}
                            onChange={(e) => setEditingRole({ ...editingRole, color: e.target.value })}
                            className="w-12 h-12 p-1 bg-transparent border-none"
                          />
                          <Input
                            value={editingRole.color}
                            onChange={(e) => setEditingRole({ ...editingRole, color: e.target.value })}
                            className="bg-[#1E1F22] border-none text-white flex-1"
                          />
                        </div>
                      </div>
                      <div className="pt-4 flex justify-between">
                        <Button
                          variant="ghost"
                          className="text-[#F23F43] hover:bg-[#F23F43]/10"
                          onClick={() => handleDeleteRole(editingRole.id)}
                        >
                          Delete Role
                        </Button>
                        <Button
                          onClick={() => handleUpdateRole(editingRole.id, { name: editingRole.name, color: editingRole.color })}
                          className="bg-[#23A559] hover:bg-[#23A559]/80 text-white"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[#949BA4]">
                      Select a role to edit
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="channels" className="mt-0">
              <h2 className="text-xl font-bold mb-4">Channels</h2>
              <div className="text-[#949BA4]">Channel management coming soon...</div>
            </TabsContent>

            <TabsContent value="members" className="mt-0">
              <h2 className="text-xl font-bold mb-4">Members</h2>
              <div className="space-y-2">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 hover:bg-[#2B2D31] rounded group">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center overflow-hidden">
                        {member.user.avatarUrl ? (
                          <img src={member.user.avatarUrl} alt={member.user.pseudo} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold">{member.user.pseudo.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center">
                          {member.user.pseudo}
                          {member.user.id === server.ownerId && <Shield size={14} className="ml-1 text-[#F0B232]" />}
                        </div>
                        <div className="text-xs text-[#949BA4]">{member.user.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(member.user.id !== user?.id && (user?.id === server.ownerId || user?.role === 'ADMIN')) && member.user.id !== server.ownerId && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-[#F23F43] hover:bg-[#F23F43]/10"
                            title="Kick Member"
                            onClick={() => handleKickMember(member.id)}
                          >
                            <UserX size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-[#F23F43] hover:bg-[#F23F43]/10"
                            title="Ban Member"
                            onClick={() => handleBanMember(member.id)}
                          >
                            <Ban size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

function ChevronRight({ size, className }: { size?: number, className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  )
}
