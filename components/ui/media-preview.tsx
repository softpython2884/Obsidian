'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, ZoomIn, ZoomOut, RotateCw, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaPreviewProps {
  url: string;
  type: 'image' | 'video';
  alt?: string;
  className?: string;
  onClose?: () => void;
  showControls?: boolean;
  autoPlay?: boolean;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  url,
  type,
  alt = '',
  className,
  onClose,
  showControls = true,
  autoPlay = false
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = alt || `media-${Date.now()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Failed to download media:', error);
    }
  }, [url, alt]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: alt,
          url: url
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback: copier dans le presse-papiers
      navigator.clipboard.writeText(url);
    }
  }, [url, alt]);

  const MediaComponent = () => {
    if (type === 'image') {
      return (
        <img
          ref={imageRef}
          src={url}
          alt={alt}
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease'
          }}
        />
      );
    }

    return (
      <video
        ref={videoRef}
        src={url}
        className="max-w-full max-h-full object-contain"
        autoPlay={autoPlay}
        controls={false}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={handlePlayPause}
      />
    );
  };

  return (
    <>
      {/* Preview normal */}
      <div className={cn("relative group", className)}>
        <div className="relative overflow-hidden rounded-lg bg-[#1E1F22]">
          <MediaComponent />
          
          {/* Overlay au hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            {type === 'video' && !isPlaying && (
              <motion.button
                className="p-4 bg-white/20 backdrop-blur-sm rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePlayPause}
              >
                <Play size={24} className="text-white" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Contrôles */}
        {showControls && (
          <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
            >
              <Download size={16} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
            >
              <Share2 size={16} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Contrôles vidéo */}
        {type === 'video' && showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              <button
                onClick={handleMuteToggle}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <div className="flex-1">
                <div className="bg-white/30 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal plein écran */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              className="relative max-w-full max-h-full p-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <MediaComponent />
              
              {/* Contrôles plein écran */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                {type === 'image' && (
                  <>
                    <button
                      onClick={handleZoomIn}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                    >
                      <ZoomIn size={20} />
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                    >
                      <ZoomOut size={20} />
                    </button>
                    <button
                      onClick={handleRotate}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                    >
                      <RotateCw size={20} />
                    </button>
                  </>
                )}
                
                <button
                  onClick={handleDownload}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                >
                  <Download size={20} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                >
                  <Share2 size={20} />
                </button>
                
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Info zoom/rotation */}
              {type === 'image' && (zoom !== 1 || rotation !== 0) && (
                <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
                  Zoom: {Math.round(zoom * 100)}% • Rotation: {rotation}°
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Composant pour grilles de médias
interface MediaGridProps {
  media: Array<{
    url: string;
    type: 'image' | 'video';
    alt?: string;
  }>;
  maxDisplay?: number;
  className?: string;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  media,
  maxDisplay = 4,
  className
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const displayMedia = media.slice(0, maxDisplay);
  const remainingCount = media.length - maxDisplay;

  const getGridClass = (count: number): string => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    return 'grid-cols-2';
  };

  return (
    <div className={cn("media-grid", className)}>
      <div className={cn("grid gap-2", getGridClass(displayMedia.length))}>
        {displayMedia.map((item, index) => (
          <div
            key={index}
            className="relative aspect-video cursor-pointer group"
            onClick={() => setSelectedIndex(index)}
          >
            <MediaPreview
              url={item.url}
              type={item.type}
              alt={item.alt}
              className="w-full h-full"
              showControls={false}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {item.type === 'video' && (
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                    <Play size={24} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Compteur pour les médias supplémentaires */}
        {remainingCount > 0 && (
          <div className="relative aspect-video cursor-pointer group bg-[#2B2D31] rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                +{remainingCount}
              </div>
              <div className="text-sm text-[#B5BAC1]">
                {remainingCount === 1 ? 'fichier' : 'fichiers'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de sélection */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
          >
            <motion.div
              className="relative max-w-4xl max-h-[90vh] p-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation */}
              {media.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedIndex((selectedIndex - 1 + media.length) % media.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setSelectedIndex((selectedIndex + 1) % media.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  >
                    →
                  </button>
                </>
              )}

              {/* Média */}
              <MediaPreview
                url={media[selectedIndex].url}
                type={media[selectedIndex].type}
                alt={media[selectedIndex].alt}
                onClose={() => setSelectedIndex(null)}
              />

              {/* Compteur */}
              {media.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                  {selectedIndex + 1} / {media.length}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
