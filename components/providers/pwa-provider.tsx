'use client';

import React, { useEffect, useState } from 'react';
import { SplashScreen, useSplashScreen } from '@/components/ui/splash-screen';
import { PWAInstall } from '@/components/ui/pwa-install';

interface PWAProviderProps {
  children: React.ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const { isVisible, isReady, handleComplete } = useSplashScreen();
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);

  useEffect(() => {
    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker enregistré:', registration);
          setIsServiceWorkerReady(true);

          // Écouter les mises à jour du Service Worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nouvelle version disponible
                  console.log('Nouvelle version de l\'app disponible');
                  
                  // Notifier l'utilisateur (optionnel)
                  if (confirm('Une nouvelle version est disponible. Voulez-vous recharger ?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Erreur d\'enregistrement du Service Worker:', error);
        });
    }

    // Gérer le thème de couleur pour la status bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#5865F2');
    }

    // Gérer l'orientation pour mobile
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      document.body.setAttribute('data-orientation', isLandscape ? 'landscape' : 'portrait');
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Gérer le mode plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement !== null;
      document.body.setAttribute('data-fullscreen', isFullscreen.toString());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Gérer la connexion réseau
  useEffect(() => {
    const handleOnline = () => {
      console.log('Connexion rétablie');
      document.body.setAttribute('data-online', 'true');
    };

    const handleOffline = () => {
      console.log('Connexion perdue');
      document.body.setAttribute('data-online', 'false');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // État initial
    document.body.setAttribute('data-online', navigator.onLine.toString());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Splash Screen */}
      <SplashScreen isVisible={isVisible} onComplete={handleComplete} />
      
      {/* Contenu principal (affiché quand le splash screen est terminé) */}
      {isReady && (
        <>
          {/* Prompt d'installation PWA */}
          <PWAInstall />
          
          {/* Application */}
          {children}
        </>
      )}
      
      {/* Indicateur de chargement du Service Worker */}
      {!isServiceWorkerReady && isReady && (
        <div className="fixed top-4 right-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-3 py-2 text-yellow-500 text-sm">
          Service Worker en cours de chargement...
        </div>
      )}
    </>
  );
};
