'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Users, Hash, MessageSquare, Settings, LogOut, Server, User } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'servers' | 'channels' | 'users' | 'actions';
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  servers?: any[];
  activeServer?: any;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  servers = [],
  activeServer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState<CommandItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Générer la liste des commandes
  const generateCommands = useCallback((): CommandItem[] => {
    const commands: CommandItem[] = [];

    // Navigation
    commands.push(
      {
        id: 'search-messages',
        title: 'Rechercher des messages',
        description: 'Rechercher dans tous les messages',
        icon: <Search size={16} />,
        action: () => {
          console.log('Search messages');
          onClose();
        },
        category: 'navigation',
        keywords: ['search', 'messages', 'recherche']
      },
      {
        id: 'user-settings',
        title: 'Paramètres utilisateur',
        description: 'Accéder aux paramètres du compte',
        icon: <Settings size={16} />,
        action: () => {
          console.log('Open user settings');
          onClose();
        },
        category: 'actions',
        keywords: ['settings', 'paramètres', 'compte']
      },
      {
        id: 'logout',
        title: 'Se déconnecter',
        description: 'Se déconnecter du compte',
        icon: <LogOut size={16} />,
        action: () => {
          logout();
          onClose();
        },
        category: 'actions',
        keywords: ['logout', 'déconnexion', 'quit']
      }
    );

    // Serveurs
    servers.forEach(server => {
      commands.push({
        id: `server-${server.id}`,
        title: server.name,
        description: `Aller au serveur ${server.name}`,
        icon: <Server size={16} />,
        action: () => {
          console.log('Navigate to server:', server.id);
          onClose();
        },
        category: 'servers',
        keywords: [server.name.toLowerCase()]
      });
    });

    // Salons du serveur actuel
    if (activeServer?.categories) {
      activeServer.categories.forEach((category: any) => {
        if (category.channels) {
          category.channels.forEach((channel: any) => {
            commands.push({
              id: `channel-${channel.id}`,
              title: `#${channel.name}`,
              description: `Aller au salon #${channel.name}`,
              icon: <Hash size={16} />,
              action: () => {
                console.log('Navigate to channel:', channel.id);
                onClose();
              },
              category: 'channels',
              keywords: [channel.name.toLowerCase()]
            });
          });
        }
      });
    }

    return commands;
  }, [servers, activeServer, logout, onClose]);

  // Filtrer les commandes
  useEffect(() => {
    const commands = generateCommands();
    
    if (!searchQuery.trim()) {
      setFilteredItems(commands);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = commands.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const descMatch = item.description?.toLowerCase().includes(query);
      const keywordMatch = item.keywords?.some(keyword => keyword.includes(query));
      
      return titleMatch || descMatch || keywordMatch;
    });

    setFilteredItems(filtered);
    setSelectedIndex(0);
  }, [searchQuery, generateCommands]);

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredItems.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  // Focus sur l'input à l'ouverture
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const categoryIcons = {
    navigation: <Search size={14} />,
    servers: <Server size={14} />,
    channels: <Hash size={14} />,
    users: <User size={14} />,
    actions: <Settings size={14} />
  };

  const categoryNames = {
    navigation: 'Navigation',
    servers: 'Serveurs',
    channels: 'Salons',
    users: 'Utilisateurs',
    actions: 'Actions'
  };

  // Grouper les items par catégorie
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative w-full max-w-2xl mx-4"
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            <div className="bg-[#2B2D31] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center px-4 py-3 border-b border-white/10">
                <Search size={20} className="text-[#B5BAC1] mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tapez une commande ou recherchez..."
                  className="flex-1 bg-transparent text-white placeholder-[#B5BAC1] outline-none text-sm"
                />
                <div className="flex items-center space-x-1 text-[#B5BAC1] text-xs">
                  <kbd className="px-1.5 py-0.5 bg-[#1E1F22] rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-[#1E1F22] rounded">↓</kbd>
                  <span className="mx-1">pour naviguer</span>
                  <kbd className="px-1.5 py-0.5 bg-[#1E1F22] rounded">Enter</kbd>
                  <span className="mx-1">pour sélectionner</span>
                  <kbd className="px-1.5 py-0.5 bg-[#1E1F22] rounded">Esc</kbd>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {Object.entries(groupedItems).map(([category, items], categoryIndex) => (
                  <div key={category}>
                    <div className="flex items-center px-4 py-2 text-xs font-bold uppercase text-[#B5BAC1] bg-[#1E1F22]/50">
                      {categoryIcons[category as keyof typeof categoryIcons]}
                      <span className="ml-2">{categoryNames[category as keyof typeof categoryNames]}</span>
                    </div>
                    
                    {items.map((item, index) => {
                      const globalIndex = Array.from(Object.values(groupedItems))
                        .slice(0, categoryIndex)
                        .reduce((acc, catItems) => acc + catItems.length, 0) + index;
                      
                      return (
                        <motion.button
                          key={item.id}
                          className={cn(
                            "w-full flex items-center px-4 py-3 text-left hover:bg-white/5 transition-colors",
                            globalIndex === selectedIndex && "bg-[#5865F2]/20 text-white"
                          )}
                          onClick={() => item.action()}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: globalIndex * 0.05 }}
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            <div className="flex items-center justify-center w-8 h-8 mr-3 text-[#B5BAC1]">
                              {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium text-sm">
                                {item.title}
                              </div>
                              {item.description && (
                                <div className="text-[#B5BAC1] text-xs truncate">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {globalIndex === selectedIndex && (
                            <motion.div
                              className="w-2 h-2 bg-[#5865F2] rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
                
                {filteredItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-[#B5BAC1]">
                    <Search size={48} className="mb-4 opacity-50" />
                    <p className="text-sm">Aucun résultat trouvé</p>
                    <p className="text-xs mt-1 opacity-75">Essayez avec d'autres mots-clés</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook pour utiliser la palette de commandes
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K ou Cmd+K pour ouvrir
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Escape pour fermer
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen)
  };
};
