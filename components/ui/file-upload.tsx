'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Image as ImageIcon, Video, Music, FileText, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onFileUpload: (file: File, onProgress: (progress: number) => void) => Promise<string>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  onFileUpload,
  maxFiles = 10,
  maxSize = 25 * 1024 * 1024, // 25MB
  acceptedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.txt', '.zip'],
  className,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon size={24} />;
    if (file.type.startsWith('video/')) return <Video size={24} />;
    if (file.type.startsWith('audio/')) return <Music size={24} />;
    if (file.type === 'application/pdf') return <FileText size={24} />;
    if (file.type.includes('zip') || file.type.includes('rar')) return <Archive size={24} />;
    return <File size={24} />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `Le fichier est trop volumineux (${formatFileSize(file.size)} > ${formatFileSize(maxSize)})`;
    }

    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return `Type de fichier non accepté: ${file.type}`;
    }

    return null;
  };

  const processFiles = async (files: FileList) => {
    const validFiles: File[] = [];
    const newUploadedFiles: UploadedFile[] = [];

    // Validation
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);

      if (error) {
        newUploadedFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          progress: 0,
          status: 'error',
          error
        });
      } else {
        validFiles.push(file);
        newUploadedFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          progress: 0,
          status: 'uploading'
        });
      }
    }

    // Limiter le nombre de fichiers
    const remainingSlots = maxFiles - uploadedFiles.length;
    const filesToProcess = validFiles.slice(0, remainingSlots);

    if (filesToProcess.length < validFiles.length) {
      console.warn(`${validFiles.length - filesToProcess.length} fichiers ignorés (limite de ${maxFiles} fichiers)`);
    }

    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);

    // Upload des fichiers valides
    for (const file of filesToProcess) {
      try {
        const url = await onFileUpload(file, (progress) => {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.file === file 
                ? { ...f, progress }
                : f
            )
          );
        });

        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === file 
              ? { ...f, status: 'completed', progress: 100 }
              : f
          )
        );
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === file 
              ? { ...f, status: 'error', error: 'Erreur lors de l\'upload' }
              : f
          )
        );
      }
    }

    onFilesSelected(filesToProcess);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const retryUpload = async (file: UploadedFile) => {
    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === file.id 
          ? { ...f, status: 'uploading', progress: 0, error: undefined }
          : f
      )
    );

    try {
      const url = await onFileUpload(file.file, (progress) => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, progress }
              : f
          )
        );
      });

      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'completed', progress: 100 }
            : f
        )
      );
    } catch (error) {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'error', error: 'Erreur lors de l\'upload' }
            : f
        )
      );
    }
  };

  return (
    <div className={cn("file-upload", className)}>
      {/* Zone de drag & drop */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-all",
          isDragging 
            ? "border-[#5865F2] bg-[#5865F2]/10" 
            : "border-white/20 hover:border-white/30",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            className="p-4 bg-[#5865F2]/20 rounded-full"
          >
            <Upload size={48} className="text-[#5865F2]" />
          </motion.div>

          <div>
            <p className="text-white font-medium mb-2">
              {isDragging ? 'Lâchez les fichiers ici' : 'Glissez-déposez des fichiers'}
            </p>
            <p className="text-[#B5BAC1] text-sm">
              ou cliquez pour sélectionner
            </p>
          </div>

          <div className="text-xs text-[#72767D] space-y-1">
            <p>Maximum {maxFiles} fichiers • {formatFileSize(maxSize)} max par fichier</p>
            <p>Formats acceptés: {acceptedTypes.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* Liste des fichiers uploadés */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-white font-medium">Fichiers ({uploadedFiles.length})</h4>
          
          <AnimatePresence>
            {uploadedFiles.map((uploadedFile) => (
              <motion.div
                key={uploadedFile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center space-x-3 p-3 bg-[#2B2D31] rounded-lg"
              >
                <div className="text-[#B5BAC1]">
                  {getFileIcon(uploadedFile.file)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-[#72767D] text-xs">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                </div>

                {/* Progress bar */}
                {uploadedFile.status === 'uploading' && (
                  <div className="flex-1 max-w-xs">
                    <div className="h-1 bg-[#1E1F22] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#5865F2]"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadedFile.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-[#72767D] text-xs mt-1">
                      {uploadedFile.progress}%
                    </p>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center space-x-2">
                  {uploadedFile.status === 'completed' && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}

                  {uploadedFile.status === 'error' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">!</span>
                      </div>
                      <button
                        onClick={() => retryUpload(uploadedFile)}
                        className="text-[#5865F2] hover:text-[#4752C4] text-sm"
                      >
                        Réessayer
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-1 text-[#B5BAC1] hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// Hook pour l'upload de fichiers
export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadFile = async (file: File, onProgress: (progress: number) => void): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.url);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };

  return {
    uploadFile,
    uploadProgress
  };
};
