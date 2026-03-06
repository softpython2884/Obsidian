import { LinkMetadata } from './link-detector';

interface CacheEntry {
  metadata: LinkMetadata;
  timestamp: number;
  expiresAt: number;
}

export class MetadataCache {
  private static instance: MetadataCache;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
  private readonly MAX_CACHE_SIZE = 1000; // Maximum 1000 entrées
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // Nettoyage toutes les heures

  static getInstance(): MetadataCache {
    if (!MetadataCache.instance) {
      MetadataCache.instance = new MetadataCache();
    }
    return MetadataCache.instance;
  }

  constructor() {
    // Charger le cache depuis localStorage si disponible
    this.loadFromStorage();
    
    // Démarrer le nettoyage périodique
    this.startCleanup();
  }

  /**
   * Récupère les métadonnées depuis le cache
   */
  get(url: string): LinkMetadata | null {
    const entry = this.cache.get(url);
    
    if (!entry) {
      return null;
    }

    // Vérifier si l'entrée a expiré
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(url);
      this.saveToStorage();
      return null;
    }

    return entry.metadata;
  }

  /**
   * Stocke les métadonnées dans le cache
   */
  set(url: string, metadata: LinkMetadata): void {
    const now = Date.now();
    const entry: CacheEntry = {
      metadata,
      timestamp: now,
      expiresAt: now + this.CACHE_TTL
    };

    this.cache.set(url, entry);

    // Si le cache est trop grand, supprimer les entrées les plus anciennes
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    this.saveToStorage();
  }

  /**
   * Vérifie si une URL est dans le cache et non expirée
   */
  has(url: string): boolean {
    const entry = this.cache.get(url);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(url);
      this.saveToStorage();
      return false;
    }
    
    return true;
  }

  /**
   * Supprime une entrée du cache
   */
  delete(url: string): boolean {
    const deleted = this.cache.delete(url);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  /**
   * Retourne la taille du cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Retourne toutes les URLs du cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Supprime les entrées expirées
   */
  cleanup(): number {
    const now = Date.now();
    let deletedCount = 0;

    for (const [url, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(url);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.saveToStorage();
    }

    return deletedCount;
  }

  /**
   * Supprime les entrées les plus anciennes pour respecter la taille maximale
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toDelete = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
    
    toDelete.forEach(([url]) => {
      this.cache.delete(url);
    });
  }

  /**
   * Sauvegarde le cache dans localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const cacheData = Array.from(this.cache.entries()).map(([url, entry]) => ({
        url,
        ...entry
      }));

      localStorage.setItem('discord-clone-metadata-cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save metadata cache to localStorage:', error);
    }
  }

  /**
   * Charge le cache depuis localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('discord-clone-metadata-cache');
      if (!stored) return;

      const cacheData = JSON.parse(stored);
      const now = Date.now();

      cacheData.forEach((item: any) => {
        // Vérifier si l'entrée est encore valide
        if (now <= item.expiresAt) {
          this.cache.set(item.url, {
            metadata: item.metadata,
            timestamp: item.timestamp,
            expiresAt: item.expiresAt
          });
        }
      });

      console.log(`Loaded ${this.cache.size} metadata entries from cache`);
    } catch (error) {
      console.warn('Failed to load metadata cache from localStorage:', error);
    }
  }

  /**
   * Démarre le nettoyage périodique
   */
  private startCleanup(): void {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      const deleted = this.cleanup();
      if (deleted > 0) {
        console.log(`Cleaned up ${deleted} expired metadata cache entries`);
      }
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Exporte les statistiques du cache
   */
  getStats(): {
    size: number;
    maxSize: number;
    oldestEntry?: number;
    newestEntry?: number;
    expiredCount: number;
  } {
    if (this.cache.size === 0) {
      return {
        size: 0,
        maxSize: this.MAX_CACHE_SIZE,
        expiredCount: 0
      };
    }

    const now = Date.now();
    const timestamps = Array.from(this.cache.values()).map(entry => entry.timestamp);
    const expiredCount = Array.from(this.cache.values())
      .filter(entry => now > entry.expiresAt).length;

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
      expiredCount
    };
  }

  /**
   * Précharge les métadonnées pour une liste d'URLs
   */
  async preload(urls: string[]): Promise<void> {
    const { LinkDetector } = await import('./link-detector');
    
    const urlsToLoad = urls.filter(url => !this.has(url));
    
    if (urlsToLoad.length === 0) return;

    console.log(`Preloading metadata for ${urlsToLoad.length} URLs`);

    // Charger en parallèle avec un maximum de 5 requêtes simultanées
    const chunks = [];
    for (let i = 0; i < urlsToLoad.length; i += 5) {
      chunks.push(urlsToLoad.slice(i, i + 5));
    }

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(async (url) => {
          try {
            const metadata = await LinkDetector.fetchMetadata(url);
            if (metadata) {
              this.set(url, metadata);
            }
          } catch (error) {
            console.warn(`Failed to preload metadata for ${url}:`, error);
          }
        })
      );
    }

    console.log(`Preloading completed. Cache size: ${this.cache.size}`);
  }
}

/**
 * Hook React pour utiliser le cache de métadonnées
 */
export const useMetadataCache = () => {
  const cache = MetadataCache.getInstance();

  return {
    get: (url: string) => cache.get(url),
    set: (url: string, metadata: LinkMetadata) => cache.set(url, metadata),
    has: (url: string) => cache.has(url),
    delete: (url: string) => cache.delete(url),
    clear: () => cache.clear(),
    size: () => cache.size(),
    stats: () => cache.getStats(),
    preload: (urls: string[]) => cache.preload(urls)
  };
};
