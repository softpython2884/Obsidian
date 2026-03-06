'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, Download, Share2, Calendar, User, X, ZoomIn } from 'lucide-react';
import { MediaPreview } from './media-preview';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  size: number;
  uploadedBy: {
    id: string;
    pseudo: string;
    avatarUrl?: string;
  };
  uploadedAt: string;
  channelId: string;
  channelName: string;
  thumbnail?: string;
  duration?: number; // for videos
}

interface MediaGalleryProps {
  serverId: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'largest' | 'smallest' | 'name';
type FilterOption = 'all' | 'images' | 'videos' | 'this-week' | 'this-month';

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  serverId,
  isOpen,
  onClose,
  className
}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && serverId) {
      loadMedia();
    }
  }, [isOpen, serverId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [media, searchQuery, sortBy, filterBy]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/servers/${serverId}/media`);
      if (response.ok) {
        const serverMedia = await response.json();
        setMedia(serverMedia);
      }
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...media];

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.uploadedBy.pseudo.toLowerCase().includes(query) ||
        item.channelName.toLowerCase().includes(query)
      );
    }

    // Filtrage par type
    if (filterBy === 'images') {
      filtered = filtered.filter(item => item.type === 'image');
    } else if (filterBy === 'videos') {
      filtered = filtered.filter(item => item.type === 'video');
    } else if (filterBy === 'this-week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(item => new Date(item.uploadedAt) > weekAgo);
    } else if (filterBy === 'this-month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(item => new Date(item.uploadedAt) > monthAgo);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'oldest':
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case 'largest':
          return b.size - a.size;
        case 'smallest':
          return a.size - b.size;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredMedia(filtered);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const toggleSelection = (mediaId: string) => {
    const newSelection = new Set(selectedMediaIds);
    if (newSelection.has(mediaId)) {
      newSelection.delete(mediaId);
    } else {
      newSelection.add(mediaId);
    }
    setSelectedMediaIds(newSelection);
  };

  const selectAll = () => {
    if (selectedMediaIds.size === filteredMedia.length) {
      setSelectedMediaIds(new Set());
    } else {
      setSelectedMediaIds(new Set(filteredMedia.map(item => item.id)));
    }
  };

  const downloadSelected = async () => {
    const selectedItems = filteredMedia.filter(item => selectedMediaIds.has(item.id));
    
    for (const item of selectedItems) {
      try {
        const response = await fetch(item.url);
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = item.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error('Failed to download:', item.name, error);
      }
    }
  };

  const shareSelected = async () => {
    const selectedItems = filteredMedia.filter(item => selectedMediaIds.has(item.id));
    const urls = selectedItems.map(item => item.url).join('\n');
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${selectedItems.length} médias`,
          text: urls
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      await navigator.clipboard.writeText(urls);
    }
  };

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
            className="bg-[#2B2D31] border border-white/10 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Galerie de Médias</h2>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 gap-4">
              <div className="flex items-center space-x-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#72767D]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher des médias..."
                    className="w-full bg-[#1E1F22] text-white pl-10 pr-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#5865F2] placeholder:text-[#72767D]"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="bg-[#1E1F22] text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#5865F2]"
                >
                  <option value="all">Tous</option>
                  <option value="images">Images</option>
                  <option value="videos">Vidéos</option>
                  <option value="this-week">Cette semaine</option>
                  <option value="this-month">Ce mois</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-[#1E1F22] text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#5865F2]"
                >
                  <option value="newest">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                  <option value="largest">Plus volumineux</option>
                  <option value="smallest">Moins volumineux</option>
                  <option value="name">Nom</option>
                </select>
              </div>

              {/* View mode */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === 'grid' ? 'bg-[#5865F2] text-white' : 'text-[#B5BAC1] hover:bg-white/10'
                  )}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === 'list' ? 'bg-[#5865F2] text-white' : 'text-[#B5BAC1] hover:bg-white/10'
                  )}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Selection toolbar */}
            {selectedMediaIds.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-[#5865F2]/20 border-b border-white/10">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={selectAll}
                    className="text-white text-sm hover:underline"
                  >
                    {selectedMediaIds.size === filteredMedia.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                  </button>
                  <span className="text-white">
                    {selectedMediaIds.size} sélectionné{selectedMediaIds.size > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={downloadSelected}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={shareSelected}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-[#B5BAC1]">Chargement des médias...</div>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-[#B5BAC1]">
                  <Filter size={48} className="mb-4 opacity-50" />
                  <p className="text-sm">Aucun média trouvé</p>
                  <p className="text-xs mt-1 opacity-75">
                    {media.length === 0 ? 'Aucun média dans ce serveur' : 'Essayez de modifier les filtres'}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredMedia.map((item) => (
                    <motion.div
                      key={item.id}
                      className="relative group cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedMedia(item)}
                    >
                      {/* Checkbox */}
                      <div
                        className="absolute top-2 left-2 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMediaIds.has(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          className="w-4 h-4 bg-[#5865F2] border-2 border-white rounded"
                        />
                      </div>

                      {/* Media preview */}
                      <div className="aspect-video bg-[#1E1F22] rounded-lg overflow-hidden">
                        {item.type === 'image' ? (
                          <img
                            src={item.thumbnail || item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <img
                              src={item.thumbnail || ''}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <ZoomIn size={24} className="text-white" />
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                              {Math.floor((item.duration || 0) / 60)}:{(Math.floor((item.duration || 0) % 60)).toString().padStart(2, '0')}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg">
                        <div className="absolute bottom-0 left-0 right-0">
                          <p className="text-white text-xs truncate">{item.name}</p>
                          <p className="text-[#B5BAC1] text-xs">
                            {item.uploadedBy.pseudo} • {formatDate(item.uploadedAt)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMedia.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center space-x-4 p-3 bg-[#1E1F22] rounded-lg hover:bg-[#2F3136] transition-colors cursor-pointer"
                      whileHover={{ x: 4 }}
                      onClick={() => setSelectedMedia(item)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMediaIds.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 bg-[#5865F2] border-2 border-white rounded"
                      />

                      {/* Thumbnail */}
                      <div className="w-16 h-16 bg-[#2F3136] rounded-lg overflow-hidden flex-shrink-0">
                        {item.type === 'image' ? (
                          <img
                            src={item.thumbnail || item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <img
                              src={item.thumbnail || ''}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <ZoomIn size={16} className="text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{item.name}</p>
                        <div className="flex items-center space-x-4 text-xs text-[#B5BAC1]">
                          <span>{formatFileSize(item.size)}</span>
                          <span>{item.uploadedBy.pseudo}</span>
                          <span>{item.channelName}</span>
                          <span>{formatDate(item.uploadedAt)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 text-center">
              <p className="text-xs text-[#72767D]">
                {filteredMedia.length} média{filteredMedia.length > 1 ? 's' : ''} • {formatFileSize(filteredMedia.reduce((total, item) => total + item.size, 0))} au total
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal de visualisation individuelle
interface MediaViewerProps {
  media: MediaItem;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  media,
  isOpen,
  onClose
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-w-4xl max-h-[90vh] p-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <MediaPreview
              url={media.url}
              type={media.type}
              alt={media.name}
              onClose={onClose}
            />

            {/* Info */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white">
              <p className="font-medium">{media.name}</p>
              <div className="text-xs text-[#B5BAC1] space-y-1">
                <p>Par {media.uploadedBy.pseudo} dans #{media.channelName}</p>
                <p>Uploadé le {new Date(media.uploadedAt).toLocaleDateString('fr-FR')}</p>
                <p>{formatFileSize(media.size)}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
