'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Smile, Gift, Star, Heart, Laugh, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Sticker {
  id: string;
  url: string;
  name: string;
  category: string;
  isGif?: boolean;
  width?: number;
  height?: number;
}

interface StickerCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  stickers: Sticker[];
}

interface StickerGifPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onStickerSelect: (sticker: Sticker) => void;
  className?: string;
}

// Composant pour l'icône Clock manquante
const Clock = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Données de stickers par défaut (à remplacer par API)
const DEFAULT_STICKERS: StickerCategory[] = [
  {
    id: 'recent',
    name: 'Récents',
    icon: <Clock size={20} />,
    stickers: []
  },
  {
    id: 'smiles',
    name: 'Smiles',
    icon: <Smile size={20} />,
    stickers: [
      { id: 'smile1', url: '😊', name: 'Smile', category: 'smiles' },
      { id: 'laugh1', url: '😂', name: 'Laugh', category: 'smiles' },
      { id: 'love1', url: '😍', name: 'Love', category: 'smiles' },
      { id: 'wink1', url: '😉', name: 'Wink', category: 'smiles' },
      { id: 'cool1', url: '😎', name: 'Cool', category: 'smiles' },
      { id: 'think1', url: '🤔', name: 'Thinking', category: 'smiles' },
      { id: 'sad1', url: '😢', name: 'Sad', category: 'smiles' },
      { id: 'angry1', url: '😡', name: 'Angry', category: 'smiles' },
    ]
  },
  {
    id: 'hearts',
    name: 'Cœurs',
    icon: <Heart size={20} />,
    stickers: [
      { id: 'heart1', url: '❤️', name: 'Red Heart', category: 'hearts' },
      { id: 'heart2', url: '💕', name: 'Two Hearts', category: 'hearts' },
      { id: 'heart3', url: '💖', name: 'Sparkling Heart', category: 'hearts' },
      { id: 'heart4', url: '💗', name: 'Growing Heart', category: 'hearts' },
      { id: 'heart5', url: '💝', name: 'Heart with Ribbon', category: 'hearts' },
      { id: 'heart6', url: '💞', name: 'Revolving Hearts', category: 'hearts' },
      { id: 'heart7', url: '💓', name: 'Beating Heart', category: 'hearts' },
      { id: 'heart8', url: '💘', name: 'Cupid', category: 'hearts' },
    ]
  },
  {
    id: 'reactions',
    name: 'Réactions',
    icon: <ThumbsUp size={20} />,
    stickers: [
      { id: 'thumbsup1', url: '👍', name: 'Thumbs Up', category: 'reactions' },
      { id: 'thumbsdown1', url: '👎', name: 'Thumbs Down', category: 'reactions' },
      { id: 'clap1', url: '👏', name: 'Clap', category: 'reactions' },
      { id: 'fire1', url: '🔥', name: 'Fire', category: 'reactions' },
      { id: '1001', url: '💯', name: '100', category: 'reactions' },
      { id: 'party1', url: '🎉', name: 'Party', category: 'reactions' },
      { id: 'eyes1', url: '👀', name: 'Eyes', category: 'reactions' },
      { id: 'pray1', url: '🙏', name: 'Pray', category: 'reactions' },
    ]
  },
  {
    id: 'animals',
    name: 'Animaux',
    icon: '🐶',
    stickers: [
      { id: 'dog1', url: '🐶', name: 'Dog', category: 'animals' },
      { id: 'cat1', url: '🐱', name: 'Cat', category: 'animals' },
      { id: 'mouse1', url: '🐭', name: 'Mouse', category: 'animals' },
      { id: 'rabbit1', url: '🐰', name: 'Rabbit', category: 'animals' },
      { id: 'fox1', url: '🦊', name: 'Fox', category: 'animals' },
      { id: 'bear1', url: '🐻', name: 'Bear', category: 'animals' },
      { id: 'panda1', url: '🐼', name: 'Panda', category: 'animals' },
      { id: 'koala1', url: '🐨', name: 'Koala', category: 'animals' },
    ]
  }
];

export const StickerGifPicker: React.FC<StickerGifPickerProps> = ({
  isOpen,
  onClose,
  onStickerSelect,
  className
}) => {
  const [selectedCategory, setSelectedCategory] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentStickers, setRecentStickers] = useState<Sticker[]>([]);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const [gifResults, setGifResults] = useState<Sticker[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Charger les stickers récents depuis localStorage
    const loadRecentStickers = () => {
      try {
        const stored = localStorage.getItem('discord-clone-recent-stickers');
        if (stored) {
          setRecentStickers(JSON.parse(stored));
        }
      } catch (error) {
        console.warn('Failed to load recent stickers:', error);
      }
    };

    loadRecentStickers();
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const addToRecent = (sticker: Sticker) => {
    const updated = [sticker, ...recentStickers.filter(s => s.id !== sticker.id)].slice(0, 20);
    setRecentStickers(updated);
    
    try {
      localStorage.setItem('discord-clone-recent-stickers', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save recent stickers:', error);
    }
  };

  const handleStickerClick = (sticker: Sticker) => {
    addToRecent(sticker);
    onStickerSelect(sticker);
    onClose();
  };

  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      setGifResults([]);
      return;
    }

    setIsLoadingGifs(true);
    try {
      // Simuler une recherche GIF (remplacer par API réelle comme Giphy)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock de résultats GIF
      const mockGifs: Sticker[] = [
        {
          id: `gif_${Date.now()}_1`,
          url: `https://media.giphy.com/media/mock_${query}/giphy.gif`,
          name: `${query} GIF 1`,
          category: 'gifs',
          isGif: true
        },
        {
          id: `gif_${Date.now()}_2`,
          url: `https://media.giphy.com/media/mock_${query}_2/giphy.gif`,
          name: `${query} GIF 2`,
          category: 'gifs',
          isGif: true
        }
      ];
      
      setGifResults(mockGifs);
    } catch (error) {
      console.error('Failed to search GIFs:', error);
      setGifResults([]);
    } finally {
      setIsLoadingGifs(false);
    }
  };

  // Debounce pour la recherche GIF
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.startsWith('gif:')) {
        searchGifs(searchQuery.substring(4));
      } else {
        setGifResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const getCurrentStickers = (): Sticker[] => {
    if (searchQuery.startsWith('gif:')) {
      return gifResults;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return DEFAULT_STICKERS.flatMap(category =>
        category.stickers.filter(sticker =>
          sticker.name.toLowerCase().includes(query) ||
          sticker.category.toLowerCase().includes(query)
        )
      );
    }

    if (selectedCategory === 'recent') {
      return recentStickers;
    }

    const category = DEFAULT_STICKERS.find(cat => cat.id === selectedCategory);
    return category?.stickers || [];
  };

  const currentStickers = getCurrentStickers();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#2B2D31] border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-semibold flex items-center space-x-2">
                <Gift size={20} />
                <span>Stickers & GIFs</span>
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#72767D]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des stickers... (gif: pour des GIFs)"
                  className="w-full bg-[#1E1F22] text-white pl-10 pr-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#5865F2] placeholder:text-[#72767D]"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex items-center space-x-1 p-4 border-b border-white/10 overflow-x-auto">
              {DEFAULT_STICKERS.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap",
                    selectedCategory === category.id
                      ? "bg-[#5865F2] text-white"
                      : "text-[#B5BAC1] hover:text-white hover:bg-white/10"
                  )}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </div>

            {/* Stickers Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingGifs ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-[#B5BAC1]">Recherche de GIFs...</div>
                </div>
              ) : currentStickers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-[#B5BAC1]">
                  <Gift size={48} className="mb-4 opacity-50" />
                  <p className="text-sm">Aucun sticker trouvé</p>
                  <p className="text-xs mt-1 opacity-75">
                    Essayez "gif: chat" pour chercher des GIFs
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {currentStickers.map((sticker) => (
                    <motion.button
                      key={sticker.id}
                      onClick={() => handleStickerClick(sticker)}
                      className="aspect-square p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center text-2xl"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {sticker.isGif ? (
                        <div className="relative w-full h-full">
                          <img
                            src={sticker.url}
                            alt={sticker.name}
                            className="w-full h-full object-cover rounded"
                            loading="lazy"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                            GIF
                          </div>
                        </div>
                      ) : (
                        sticker.url
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 text-center">
              <p className="text-xs text-[#72767D]">
                Powered by Discord Clone • {currentStickers.length} stickers
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Bouton pour ouvrir le picker
interface StickerButtonProps {
  onStickerSelect: (sticker: Sticker) => void;
  disabled?: boolean;
  className?: string;
}

export const StickerButton: React.FC<StickerButtonProps> = ({
  onStickerSelect,
  disabled = false,
  className
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsPickerOpen(true)}
        disabled={disabled}
        className={cn(
          "p-2 text-[#B5BAC1] hover:text-white hover:bg-white/10 rounded-lg transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <Gift size={20} />
      </button>

      <StickerGifPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onStickerSelect={onStickerSelect}
      />
    </>
  );
};

// Hook pour gérer les stickers
export const useStickers = () => {
  const [recentStickers, setRecentStickers] = useState<Sticker[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('discord-clone-recent-stickers');
      if (stored) {
        setRecentStickers(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load recent stickers:', error);
    }
  }, []);

  const addRecentSticker = (sticker: Sticker) => {
    const updated = [sticker, ...recentStickers.filter(s => s.id !== sticker.id)].slice(0, 20);
    setRecentStickers(updated);
    
    try {
      localStorage.setItem('discord-clone-recent-stickers', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save recent stickers:', error);
    }
  };

  return {
    recentStickers,
    addRecentSticker
  };
};
