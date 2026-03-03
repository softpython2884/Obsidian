'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSettingsModal = ({ isOpen, onClose }: UserSettingsModalProps) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    pseudo: user?.pseudo || '',
    avatarUrl: user?.avatarUrl || '',
    bannerUrl: user?.bannerUrl || '',
    accentColor: user?.accentColor || '#5865F2',
    bio: user?.bio || '',
    status: user?.status || '',
    socialLinks: user?.socialLinks ? JSON.parse(user.socialLinks) : { github: '', youtube: '', website: '' },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...formData,
          socialLinks: JSON.stringify(formData.socialLinks),
        }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedUser = await response.json();
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#313338] text-[#DBDEE1] border-none max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white mb-4">User Settings</DialogTitle>
          <DialogDescription className="sr-only">
            Manage your account settings and profile information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-[#B5BAC1]">Identity</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#B5BAC1] mb-2 block">Username</label>
                <input
                  name="pseudo"
                  value={formData.pseudo}
                  onChange={handleChange}
                  className="w-full bg-[#1E1F22] text-white p-2 rounded border border-[#1E1F22] focus:border-[#5865F2] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#B5BAC1] mb-2 block">Accent Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    name="accentColor"
                    value={formData.accentColor}
                    onChange={handleChange}
                    className="h-10 w-10 p-0 border-none bg-transparent cursor-pointer"
                  />
                  <input
                    name="accentColor"
                    value={formData.accentColor}
                    onChange={handleChange}
                    className="flex-1 bg-[#1E1F22] text-white p-2 rounded border border-[#1E1F22] focus:border-[#5865F2] outline-none transition-colors uppercase"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#B5BAC1] mb-2 block">Avatar URL</label>
              <input
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="https://example.com/avatar.png"
                className="w-full bg-[#1E1F22] text-white p-2 rounded border border-[#1E1F22] focus:border-[#5865F2] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#B5BAC1] mb-2 block">Banner URL</label>
              <input
                name="bannerUrl"
                value={formData.bannerUrl}
                onChange={handleChange}
                placeholder="https://example.com/banner.png"
                className="w-full bg-[#1E1F22] text-white p-2 rounded border border-[#1E1F22] focus:border-[#5865F2] outline-none transition-colors"
              />
            </div>
          </div>

          <div className="h-[1px] bg-[#3F4147] w-full" />

          {/* Profile Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-[#B5BAC1]">Profile Details</h3>
            
            <div>
              <label className="text-xs font-bold uppercase text-[#B5BAC1] mb-2 block">Custom Status</label>
              <input
                name="status"
                value={formData.status}
                onChange={handleChange}
                placeholder="What's on your mind?"
                className="w-full bg-[#1E1F22] text-white p-2 rounded border border-[#1E1F22] focus:border-[#5865F2] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#B5BAC1] mb-2 block">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full bg-[#1E1F22] text-white p-2 rounded border border-[#1E1F22] focus:border-[#5865F2] outline-none transition-colors resize-none"
              />
            </div>
          </div>

          <div className="h-[1px] bg-[#3F4147] w-full" />

          {/* Connections */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-[#B5BAC1]">Connections</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#B5BAC1] mb-2 block">GitHub URL</label>
                <input
                  name="github"
                  value={formData.socialLinks.github}
                  onChange={handleSocialChange}
                  placeholder="https://github.com/username"
                  className="w-full bg-[#1E1F22] text-white p-2 rounded border border-[#1E1F22] focus:border-[#5865F2] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#B5BAC1] mb-2 block">YouTube URL</label>
                <input
                  name="youtube"
                  value={formData.socialLinks.youtube}
                  onChange={handleSocialChange}
                  placeholder="https://youtube.com/c/channel"
                  className="w-full bg-[#1E1F22] text-white p-2 rounded border border-[#1E1F22] focus:border-[#5865F2] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#B5BAC1] mb-2 block">Website URL</label>
                <input
                  name="website"
                  value={formData.socialLinks.website}
                  onChange={handleSocialChange}
                  placeholder="https://mysite.com"
                  className="w-full bg-[#1E1F22] text-white p-2 rounded border border-[#1E1F22] focus:border-[#5865F2] outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
