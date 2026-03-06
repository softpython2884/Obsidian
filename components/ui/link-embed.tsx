'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Image as ImageIcon, Play, X, Loader2 } from 'lucide-react';
import { LinkMetadata, LinkDetector } from '@/lib/link-detector';
import { useMetadataCache } from '@/lib/metadata-cache';
import { cn } from '@/lib/utils';

interface LinkEmbedProps {
  url: string;
  className?: string;
  compact?: boolean;
}

export const LinkEmbed: React.FC<LinkEmbedProps> = ({ url, className, compact = false }) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cache = useMetadataCache();

  useEffect(() => {
    const loadMetadata = async () => {
      if (!LinkDetector.shouldEmbed(url)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        // Vérifier d'abord dans le cache
        const cachedMetadata = cache.get(url);
        if (cachedMetadata) {
          setMetadata(cachedMetadata);
          setLoading(false);
          return;
        }

        // Sinon, récupérer les métadonnées
        const data = await LinkDetector.fetchMetadata(url);
        if (data) {
          setMetadata(data);
          // Mettre en cache
          cache.set(url, data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load link metadata:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [url, cache]);

  const parsedLink = LinkDetector.parseLink(url);

  // Si c'est une image, afficher directement
  if (parsedLink.isImage && !compact) {
    return (
      <div className={cn("relative group rounded-lg overflow-hidden max-w-sm", className)}>
        <img
          src={url}
          alt="Image"
          className="w-full h-auto object-cover rounded-lg"
          loading="lazy"
          onError={() => setError(true)}
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-white/30 transition-colors"
          >
            <ExternalLink size={16} />
            <span className="text-sm">Ouvrir</span>
          </a>
        </div>
      </div>
    );
  }

  // Si c'est une vidéo YouTube
  if (parsedLink.isYouTube && parsedLink.videoId) {
    return (
      <div className={cn("rounded-lg overflow-hidden max-w-sm", className)}>
        <div className="relative aspect-video bg-black">
          <img
            src={`https://img.youtube.com/vi/${parsedLink.videoId}/maxresdefault.jpg`}
            alt="YouTube thumbnail"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 text-white p-4 rounded-full hover:bg-red-700 transition-colors"
            >
              <Play size={24} />
            </a>
          </div>
        </div>
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-white text-sm font-medium truncate">{parsedLink.displayUrl}</p>
        </div>
      </div>
    );
  }

  // Si c'est une vidéo
  if (parsedLink.isVideo && !compact) {
    return (
      <div className={cn("rounded-lg overflow-hidden max-w-sm", className)}>
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            src={url}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
        </div>
        <div className="bg-[#1a1a1a] p-3">
          <p className="text-white text-sm font-medium truncate">{parsedLink.displayUrl}</p>
        </div>
      </div>
    );
  }

  // Embed compact pour les liens simples
  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center space-x-2 text-[#5865F2] hover:text-[#4752C4] transition-colors",
          className
        )}
      >
        <ExternalLink size={14} />
        <span className="text-sm underline">{parsedLink.displayUrl}</span>
      </a>
    );
  }

  // État de chargement
  if (loading) {
    return (
      <div className={cn("bg-[#1a1a1a] border border-white/10 rounded-lg p-4 max-w-sm", className)}>
        <div className="flex items-center space-x-3">
          <Loader2 size={20} className="animate-spin text-[#5865F2]" />
          <div className="flex-1">
            <div className="h-4 bg-[#2a2a2a] rounded animate-pulse mb-2" />
            <div className="h-3 bg-[#2a2a2a] rounded animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // Erreur de chargement
  if (error || !metadata) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center space-x-2 text-[#5865F2] hover:text-[#4752C4] transition-colors",
          className
        )}
      >
        <ExternalLink size={14} />
        <span className="text-sm underline">{parsedLink.displayUrl}</span>
      </a>
    );
  }

  // Embed complet avec métadonnées
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden hover:border-[#5865F2] transition-all max-w-sm group",
        className
      )}
    >
      {metadata.image && (
        <div className="relative h-48 bg-[#2a2a2a]">
          <img
            src={metadata.image}
            alt={metadata.title || 'Preview'}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute top-2 left-2 flex items-center space-x-2">
            {metadata.favicon && (
              <img
                src={metadata.favicon}
                alt="Favicon"
                className="w-5 h-5 rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {metadata.siteName && (
              <span className="text-xs text-white/80 bg-black/50 px-2 py-1 rounded">
                {metadata.siteName}
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            {metadata.title && (
              <h3 className="text-white font-medium text-sm mb-1 line-clamp-2 group-hover:text-[#5865F2] transition-colors">
                {metadata.title}
              </h3>
            )}
            {metadata.description && (
              <p className="text-[#B5BAC1] text-xs line-clamp-3 leading-relaxed">
                {metadata.description}
              </p>
            )}
          </div>
          {!metadata.image && metadata.favicon && (
            <img
              src={metadata.favicon}
              alt="Favicon"
              className="w-8 h-8 rounded ml-3 flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-[#B5BAC1] text-xs truncate flex-1">
            {parsedLink.displayUrl}
          </span>
          <ExternalLink size={14} className="text-[#B5BAC1] group-hover:text-[#5865F2] transition-colors ml-2" />
        </div>
      </div>
    </a>
  );
};
