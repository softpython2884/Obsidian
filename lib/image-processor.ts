export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  preserveAspectRatio?: boolean;
}

export interface ProcessedImage {
  blob: Blob;
  url: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
  format: string;
}

export class ImageProcessor {
  private static canvas: HTMLCanvasElement;
  private static ctx: CanvasRenderingContext2D;

  static {
    // Initialiser le canvas hors du DOM
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d')!;
    }
  }

  /**
   * Compresse une image
   */
  static async compressImage(
    file: File,
    options: CompressionOptions = {}
  ): Promise<ProcessedImage> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg',
      preserveAspectRatio = true
    } = options;

    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier n\'est pas une image');
    }

    const originalSize = file.size;
    
    // Charger l'image
    const img = await this.loadImage(file);
    
    // Calculer les nouvelles dimensions
    const { width, height } = this.calculateDimensions(
      img.width,
      img.height,
      maxWidth,
      maxHeight,
      preserveAspectRatio
    );

    // Configurer le canvas
    this.canvas.width = width;
    this.canvas.height = height;

    // Dessiner l'image compressée
    this.ctx.drawImage(img, 0, 0, width, height);

    // Convertir en blob
    const mimeType = this.getMimeType(format);
    const blob = await this.canvasToBlob(mimeType, quality);
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      originalSize,
      compressedSize: blob.size,
      compressionRatio: (1 - blob.size / originalSize) * 100,
      width,
      height,
      format: mimeType
    };
  }

  /**
   * Crée des thumbnails pour les images
   */
  static async createThumbnail(
    file: File,
    size: number = 200
  ): Promise<ProcessedImage> {
    return this.compressImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'jpeg'
    });
  }

  /**
   * Crée des thumbnails pour les vidéos (première frame)
   */
  static async createVideoThumbnail(
    file: File,
    size: number = 200
  ): Promise<ProcessedImage> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        video.currentTime = 0.1; // Capturer à 0.1s
      };
      
      video.onseeked = () => {
        try {
          this.canvas.width = size;
          this.canvas.height = size;
          
          // Calculer les dimensions pour maintenir l'aspect ratio
          const videoAspect = video.videoWidth / video.videoHeight;
          let width = size;
          let height = size;
          
          if (videoAspect > 1) {
            height = size / videoAspect;
          } else {
            width = size * videoAspect;
          }
          
          // Centrer l'image dans le canvas
          const x = (size - width) / 2;
          const y = (size - height) / 2;
          
          this.ctx.fillStyle = '#000';
          this.ctx.fillRect(0, 0, size, size);
          this.ctx.drawImage(video, x, y, width, height);
          
          this.canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({
                blob,
                url,
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio: 0,
                width: size,
                height: size,
                format: 'image/jpeg'
              });
            } else {
              reject(new Error('Failed to create video thumbnail'));
            }
          }, 'image/jpeg', 0.8);
        } catch (error) {
          reject(error);
        }
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Détecte le type d'image et retourne des informations
   */
  static async analyzeImage(file: File): Promise<{
    width: number;
    height: number;
    aspectRatio: number;
    format: string;
    size: number;
  }> {
    const img = await this.loadImage(file);
    
    return {
      width: img.width,
      height: img.height,
      aspectRatio: img.width / img.height,
      format: file.type,
      size: file.size
    };
  }

  /**
   * Optimise automatiquement une image selon son contenu
   */
  static async autoOptimize(file: File): Promise<ProcessedImage> {
    const analysis = await this.analyzeImage(file);
    
    // Options basées sur le type d'image
    let options: CompressionOptions = {
      quality: 0.8,
      format: 'jpeg'
    };

    // Pour les grandes images
    if (analysis.width > 2048 || analysis.height > 2048) {
      options.maxWidth = 1920;
      options.maxHeight = 1080;
      options.quality = 0.7;
    }
    // Pour les images moyennes
    else if (analysis.width > 1024 || analysis.height > 1024) {
      options.maxWidth = 1280;
      options.maxHeight = 720;
      options.quality = 0.8;
    }
    // Pour les petites images, ne pas trop compresser
    else {
      options.maxWidth = analysis.width;
      options.maxHeight = analysis.height;
      options.quality = 0.9;
    }

    // Utiliser WebP pour les photos si supporté
    if (this.supportsWebP() && file.type.startsWith('image/')) {
      options.format = 'webp';
      options.quality = options.quality! - 0.1; // WebP peut utiliser une qualité légèrement inférieure
    }

    // Pour les images avec transparence, utiliser PNG
    if (file.type === 'image/png' || file.type === 'image/gif') {
      options.format = 'png';
    }

    return this.compressImage(file, options);
  }

  /**
   * Vérifie si le navigateur supporte WebP
   */
  private static supportsWebP(): boolean {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Charge une image depuis un fichier
   */
  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      
      // Créer une URL temporaire
      const url = URL.createObjectURL(file);
      img.src = url;
      
      // Nettoyer l'URL après le chargement
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
    });
  }

  /**
   * Calcule les dimensions optimales
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    preserveAspectRatio: boolean
  ): { width: number; height: number } {
    if (!preserveAspectRatio) {
      return {
        width: Math.min(originalWidth, maxWidth),
        height: Math.min(originalHeight, maxHeight)
      };
    }

    const aspectRatio = originalWidth / originalHeight;
    let width = originalWidth;
    let height = originalHeight;

    // Réduire si nécessaire
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { width, height };
  }

  /**
   * Convertit le canvas en blob
   */
  private static canvasToBlob(
    mimeType: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * Retourne le MIME type selon le format
   */
  private static getMimeType(format: string): string {
    switch (format) {
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  /**
   * Nettoie les URLs créées
   */
  static revokeUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Batch processing pour plusieurs images
   */
  static async compressBatch(
    files: File[],
    options: CompressionOptions = {}
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];
    
    for (const file of files) {
      try {
        const processed = await this.compressImage(file, options);
        results.push(processed);
      } catch (error) {
        console.error(`Failed to compress ${file.name}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Crée un sprite sheet à partir de plusieurs images
   */
  static async createSpriteSheet(
    images: File[],
    options: {
      spriteSize?: number;
      padding?: number;
      columns?: number;
    } = {}
  ): Promise<ProcessedImage> {
    const {
      spriteSize = 64,
      padding = 2,
      columns = Math.ceil(Math.sqrt(images.length))
    } = options;

    const rows = Math.ceil(images.length / columns);
    const canvasWidth = columns * (spriteSize + padding) + padding;
    const canvasHeight = rows * (spriteSize + padding) + padding;

    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    // Fond transparent
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Charger et dessiner chaque image
    for (let i = 0; i < images.length; i++) {
      try {
        const img = await this.loadImage(images[i]);
        const col = i % columns;
        const row = Math.floor(i / columns);
        const x = col * (spriteSize + padding) + padding;
        const y = row * (spriteSize + padding) + padding;

        // Centrer l'image dans la case du sprite
        const scale = Math.min(spriteSize / img.width, spriteSize / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (spriteSize - scaledWidth) / 2;
        const offsetY = (spriteSize - scaledHeight) / 2;

        this.ctx.drawImage(img, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
      } catch (error) {
        console.error(`Failed to add image ${images[i].name} to sprite sheet:`, error);
      }
    }

    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve({
            blob,
            url,
            originalSize: images.reduce((total, file) => total + file.size, 0),
            compressedSize: blob.size,
            compressionRatio: 0,
            width: canvasWidth,
            height: canvasHeight,
            format: 'image/png'
          });
        } else {
          reject(new Error('Failed to create sprite sheet'));
        }
      }, 'image/png');
    });
  }
}

// Hook React pour utiliser le processeur d'images
import { useState } from 'react';

export const useImageProcessor = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processImage = async (
    file: File,
    options?: CompressionOptions
  ): Promise<ProcessedImage> => {
    setProcessing(true);
    setProgress(0);

    try {
      const result = await ImageProcessor.compressImage(file, options);
      setProgress(100);
      return result;
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const processBatch = async (
    files: File[],
    options?: CompressionOptions
  ): Promise<ProcessedImage[]> => {
    setProcessing(true);
    setProgress(0);

    try {
      const results = await ImageProcessor.compressBatch(files, options);
      setProgress(100);
      return results;
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  return {
    processImage,
    processBatch,
    processing,
    progress,
    autoOptimize: (file: File) => ImageProcessor.autoOptimize(file),
    createThumbnail: (file: File, size?: number) => ImageProcessor.createThumbnail(file, size),
    createVideoThumbnail: (file: File, size?: number) => ImageProcessor.createVideoThumbnail(file, size)
  };
};
