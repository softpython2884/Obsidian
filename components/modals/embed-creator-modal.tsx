import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EmbedCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (embed: any) => void;
}

export const EmbedCreatorModal = ({ isOpen, onClose, onSend }: EmbedCreatorModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#5865F2');
  const [imageUrl, setImageUrl] = useState('');
  const [footer, setFooter] = useState('');

  const handleSend = () => {
    const embed = {
      title,
      description,
      color,
      image: imageUrl ? { url: imageUrl } : undefined,
      footer: footer ? { text: footer } : undefined,
    };
    onSend(embed);
    onClose();
    // Reset form
    setTitle('');
    setDescription('');
    setColor('#5865F2');
    setImageUrl('');
    setFooter('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#313338] text-[#DBDEE1] border-none max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-bold">Create Embed</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-bold text-[#B5BAC1] uppercase">Title</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="bg-[#1E1F22] border-none text-[#DBDEE1] mt-1 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Embed Title"
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-[#B5BAC1] uppercase">Description</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="bg-[#1E1F22] border-none text-[#DBDEE1] mt-1 min-h-[100px] focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Embed Description (Markdown supported)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold text-[#B5BAC1] uppercase">Color</Label>
              <div className="flex items-center mt-1 space-x-2">
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)} 
                  className="h-8 w-8 cursor-pointer bg-transparent border-none p-0"
                />
                <span className="text-xs text-[#949BA4]">{color}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold text-[#B5BAC1] uppercase">Image URL</Label>
              <Input 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                className="bg-[#1E1F22] border-none text-[#DBDEE1] mt-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="https://..."
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-bold text-[#B5BAC1] uppercase">Footer</Label>
            <Input 
              value={footer} 
              onChange={(e) => setFooter(e.target.value)} 
              className="bg-[#1E1F22] border-none text-[#DBDEE1] mt-1 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Footer text"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-[#DBDEE1] hover:bg-[#3F4147] hover:text-white">
            Cancel
          </Button>
          <Button onClick={handleSend} className="bg-[#5865F2] hover:bg-[#4752C4] text-white">
            Send Embed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
