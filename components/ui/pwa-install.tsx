'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PWAInstallProps {
  className?: string;
}

export const PWAInstall: React.FC<PWAInstallProps> = ({ className }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Vérifier si c'est iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Vérifier si déjà installé
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Montrer le prompt après 2 secondes
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 2000);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      console.log('PWA installée avec succès');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Montrer le prompt d'installation natif
      await deferredPrompt.prompt();
      
      // Attendre la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`Résultat de l'installation: ${outcome}`);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Erreur lors de l\'installation PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Ne plus montrer le prompt pendant 24h
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  useEffect(() => {
    // Vérifier si le prompt a été récemment dismissé
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const timeDiff = Date.now() - parseInt(dismissed);
      if (timeDiff < 24 * 60 * 60 * 1000) { // 24 heures
        setShowInstallPrompt(false);
      }
    }
  }, []);

  // Si déjà installé ou iOS, ne rien montrer
  if (isInstalled || isIOS) {
    return null;
  }

  return (
    <AnimatePresence>
      {showInstallPrompt && (
        <motion.div
          className={cn("fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50", className)}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
        >
          <div className="bg-[#2B2D31] border border-white/10 rounded-xl shadow-2xl p-4">
            <div className="flex items-start space-x-3">
              {/* Icône */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5865F2] to-[#4752C4] rounded-xl flex items-center justify-center">
                  <Smartphone size={24} className="text-white" />
                </div>
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold mb-1">
                  Installez Discord Clone
                </h3>
                <p className="text-[#B5BAC1] text-sm mb-3">
                  Installez l'application pour un accès rapide et une expérience native.
                </p>

                {/* Boutons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleInstallClick}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors"
                  >
                    <Download size={16} />
                    <span>Installer</span>
                  </button>
                  
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 text-[#B5BAC1] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Plus tard
                  </button>
                </div>
              </div>

              {/* Bouton fermer */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 text-[#B5BAC1] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Instructions iOS (si applicable) */}
            {isIOS && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-[#72767D] text-xs">
                  Pour installer: 
                  <span className="text-[#B5BAC1]"> Partager → Ajouter à l'écran d'accueil</span>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook pour utiliser le PWA install
export const usePWAInstall = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const checkInstallable = () => {
      setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    checkInstallable();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      setDeferredPrompt(null);
      setIsInstallable(false);
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Erreur installation PWA:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    install
  };
};
