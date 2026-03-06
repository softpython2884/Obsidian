import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "GlVGYHqc3SyCEGnwOhP7wbn2HtcEexkS";

const CATEGORIES = [
  { id: 'trending', name: 'Trending' },
  { id: 'funny', name: 'Funny' },
  { id: 'cats', name: 'Cats' },
  { id: 'meme', name: 'Meme' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'anime', name: 'Anime' },
  { id: 'fail', name: 'Fail' },
  { id: 'love', name: 'Love' },
];

interface GifPickerProps {
  onGifSelect: (gifUrl: string) => void;
}

export const GifPicker = ({ onGifSelect }: GifPickerProps) => {
  const [gifs, setGifs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('trending');

  const fetchGifs = async (query?: string) => {
    setLoading(true);
    try {
      const endpoint = query
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20`;

      const res = await fetch(endpoint);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setActiveCategory('');
      fetchGifs(search);
    } else {
      setActiveCategory('trending');
      fetchGifs();
    }
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setSearch('');
    if (category === 'trending') {
      fetchGifs();
    } else {
      fetchGifs(category);
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-[#1E1F22] w-80">
      {/* Search Bar */}
      <div className="p-3 pb-2">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Input
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            placeholder="Search GIPHY"
            className="bg-[#111214] border-none text-white h-9 pl-9 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs rounded-md"
          />
          <Search className="absolute left-3 text-white/40" size={14} />
        </form>
      </div>

      {/* Categories */}
      <div className="px-3 pb-3">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-2 pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all",
                  activeCategory === cat.id
                    ? "bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/20"
                    : "bg-[#2B2D31] text-white/60 hover:bg-[#3F4147] hover:text-white"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <ScrollArea className="flex-1 px-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-white/40 space-y-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-[10px] uppercase font-bold tracking-widest">Searching...</span>
          </div>
        ) : gifs.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 pb-4">
            {gifs.map((gif) => (
              <div
                key={gif.id}
                className="group relative h-24 overflow-hidden rounded bg-[#111214] cursor-pointer"
                onClick={() => onGifSelect(gif.images.fixed_height.url)}
              >
                <img
                  src={gif.images.fixed_height_small.url}
                  alt={gif.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Send GIF</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-white/20">
            <span className="text-xs">No GIFs found</span>
          </div>
        )}
      </ScrollArea>

      {/* Attribution */}
      <div className="p-2 border-t border-white/5 flex items-center justify-center space-x-1 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
        <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Powered by</span>
        <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Giphy-logo.svg" alt="GIPHY" className="h-3" />
      </div>
    </div>
  );
};

// Internal Import helper
const Input = ({ className, ...props }: any) => (
  <input
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
);
