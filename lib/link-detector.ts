export interface LinkMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
  favicon?: string;
  color?: string;
}

export interface ParsedLink {
  url: string;
  displayUrl: string;
  isImage: boolean;
  isVideo: boolean;
  isYouTube: boolean;
  videoId?: string;
}

export class LinkDetector {
  private static readonly URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>"{}|\\^`[\]]+/gi;
  private static readonly IMAGE_REGEX = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
  private static readonly VIDEO_REGEX = /\.(mp4|webm|ogg|mov|avi)$/i;
  private static readonly YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;

  /**
   * Extrait tous les liens d'un texte
   */
  static extractLinks(text: string): string[] {
    const matches = text.match(this.URL_REGEX);
    if (!matches) return [];
    
    // Normaliser les URLs et dédupliquer
    const urls = matches.map(url => {
      if (url.startsWith('www.')) {
        return `https://${url}`;
      }
      return url;
    });
    
    return [...new Set(urls)];
  }

  /**
   * Parse un lien pour déterminer son type
   */
  static parseLink(url: string): ParsedLink {
    const cleanUrl = this.normalizeUrl(url);
    const displayUrl = this.createDisplayUrl(cleanUrl);
    
    const isImage = this.IMAGE_REGEX.test(cleanUrl);
    const isVideo = this.VIDEO_REGEX.test(cleanUrl);
    const youtubeMatch = cleanUrl.match(this.YOUTUBE_REGEX);
    const isYouTube = !!youtubeMatch;
    const videoId = youtubeMatch ? youtubeMatch[1] : undefined;

    return {
      url: cleanUrl,
      displayUrl,
      isImage,
      isVideo,
      isYouTube,
      videoId
    };
  }

  /**
   * Normalise une URL
   */
  private static normalizeUrl(url: string): string {
    if (url.startsWith('www.')) {
      return `https://${url}`;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  /**
   * Crée une URL d'affichage simplifiée
   */
  private static createDisplayUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      let display = urlObj.hostname;
      
      if (urlObj.pathname && urlObj.pathname !== '/') {
        display += urlObj.pathname;
      }
      
      // Limiter la longueur
      if (display.length > 40) {
        display = display.substring(0, 37) + '...';
      }
      
      return display;
    } catch {
      return url.length > 40 ? url.substring(0, 37) + '...' : url;
    }
  }

  /**
   * Récupère les métadonnées d'une URL
   */
  static async fetchMetadata(url: string): Promise<LinkMetadata | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Failed to fetch metadata for ${url}: ${response.status}`);
        return null;
      }

      const html = await response.text();
      return this.parseMetadata(html, url);
    } catch (error) {
      console.error(`Error fetching metadata for ${url}:`, error);
      return null;
    }
  }

  /**
   * Parse le HTML pour extraire les métadonnées Open Graph
   */
  private static parseMetadata(html: string, url: string): LinkMetadata {
    const metadata: LinkMetadata = { url };

    try {
      const urlObj = new URL(url);
      metadata.siteName = this.getMetaContent(html, 'og:site_name') || urlObj.hostname;
    } catch {
      metadata.siteName = new URL(url).hostname;
    }

    // Open Graph tags
    metadata.title = this.getMetaContent(html, 'og:title') || 
                   this.getMetaContent(html, 'title') ||
                   this.extractTitle(html);
    
    metadata.description = this.getMetaContent(html, 'og:description') || 
                          this.getMetaContent(html, 'description') ||
                          this.extractDescription(html);
    
    metadata.image = this.getMetaContent(html, 'og:image') || 
                   this.getMetaContent(html, 'twitter:image');
    
    metadata.type = this.getMetaContent(html, 'og:type') || 'website';
    metadata.color = this.getMetaContent(html, 'theme-color');

    // Favicon
    const favicon = this.getMetaContent(html, 'favicon') ||
                   this.findFavicon(html, url);
    if (favicon) {
      metadata.favicon = this.resolveUrl(favicon, url);
    }

    // Résoudre les URLs relatives
    if (metadata.image) {
      metadata.image = this.resolveUrl(metadata.image, url);
    }

    return metadata;
  }

  /**
   * Extrait le contenu d'une meta tag
   */
  private static getMetaContent(html: string, property: string): string | undefined {
    const patterns = [
      new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i')
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1];
    }

    return undefined;
  }

  /**
   * Extrait le titre de la page
   */
  private static extractTitle(html: string): string | undefined {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : undefined;
  }

  /**
   * Extrait une description depuis le contenu
   */
  private static extractDescription(html: string): string | undefined {
    // Essayer de trouver une meta description
    const metaDesc = this.getMetaContent(html, 'description');
    if (metaDesc) return metaDesc;

    // Sinon, essayer d'extraire du texte pertinent
    const cleanHtml = html.replace(/<script[^>]*>.*?<\/script>/gi, '')
                          .replace(/<style[^>]*>.*?<\/style>/gi, '')
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();

    if (cleanHtml.length > 200) {
      return cleanHtml.substring(0, 197) + '...';
    }

    return cleanHtml || undefined;
  }

  /**
   * Trouve le favicon
   */
  private static findFavicon(html: string, baseUrl: string): string | undefined {
    const patterns = [
      /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:icon|shortcut icon)["']/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1];
    }

    // Fallback vers favicon.ico
    try {
      const urlObj = new URL(baseUrl);
      return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch {
      return undefined;
    }
  }

  /**
   * Résout une URL relative par rapport à une URL de base
   */
  private static resolveUrl(url: string, baseUrl: string): string {
    try {
      return new URL(url, baseUrl).href;
    } catch {
      return url;
    }
  }

  /**
   * Vérifie si une URL est valide
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(this.normalizeUrl(url));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Détermine si une URL nécessite un embed
   */
  static shouldEmbed(url: string): boolean {
    const parsed = this.parseLink(url);
    
    // Embed pour les images, vidéos, YouTube
    if (parsed.isImage || parsed.isVideo || parsed.isYouTube) {
      return true;
    }

    // Embed pour les sites web populaires
    const popularSites = [
      'youtube.com', 'youtu.be', 'twitter.com', 'x.com',
      'github.com', 'stackoverflow.com', 'reddit.com',
      'spotify.com', 'twitch.tv', 'instagram.com',
      'facebook.com', 'linkedin.com', 'medium.com'
    ];

    try {
      const hostname = new URL(parsed.url).hostname.toLowerCase();
      return popularSites.some(site => hostname.includes(site));
    } catch {
      return false;
    }
  }
}
