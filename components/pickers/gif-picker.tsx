import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const MOCK_GIFS = [
  "https://media.tenor.com/m807D2j-sQIAAAAC/cat-cat-jumping.gif",
  "https://media.tenor.com/h5y1k7-8c8IAAAAC/cat-cat-walking.gif",
  "https://media.tenor.com/pUj8yL8570IAAAAC/cat-cat-eating.gif",
  "https://media.tenor.com/1w7kG7L5w-8AAAAC/cat-cat-sleeping.gif",
  "https://media.tenor.com/2nZ3q2-8c8IAAAAC/cat-cat-playing.gif",
  "https://media.tenor.com/3nZ3q2-8c8IAAAAC/cat-cat-running.gif",
  "https://media.tenor.com/4nZ3q2-8c8IAAAAC/cat-cat-meowing.gif",
  "https://media.tenor.com/5nZ3q2-8c8IAAAAC/cat-cat-purring.gif",
  "https://media.tenor.com/6nZ3q2-8c8IAAAAC/cat-cat-hissing.gif",
  "https://media.tenor.com/7nZ3q2-8c8IAAAAC/cat-cat-scratching.gif",
];

interface GifPickerProps {
  onGifSelect: (gifUrl: string) => void;
}

export const GifPicker = ({ onGifSelect }: GifPickerProps) => {
  return (
    <div className="w-full h-full p-2">
      <input 
        type="text" 
        placeholder="Search Tenor (Mock)..." 
        className="w-full bg-[#1E1F22] text-[#DBDEE1] rounded p-2 mb-2 outline-none text-sm"
        disabled
      />
      <ScrollArea className="h-64 w-full">
        <div className="grid grid-cols-2 gap-2">
          {MOCK_GIFS.map((gif, index) => (
            <img 
              key={index} 
              src={gif} 
              alt="GIF" 
              className="w-full h-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onGifSelect(gif)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
