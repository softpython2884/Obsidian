'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2 } from 'lucide-react';

interface SplashScreenProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible, onComplete }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // Simuler le chargement
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#36393F] flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Logo animé */}
      <motion.div
        className="mb-8"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 20,
          duration: 1.5 
        }}
      >
        <div className="relative">
          {/* Cercle de fond */}
          <div className="w-24 h-24 bg-gradient-to-br from-[#5865F2] to-[#4752C4] rounded-2xl flex items-center justify-center shadow-2xl">
            <MessageSquare size={48} className="text-white" />
          </div>
          
          {/* Effet de brillance */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{
              background: [
                "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
                "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </motion.div>

      {/* Nom de l'application */}
      <motion.h1
        className="text-3xl font-bold text-white mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Discord Clone
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="text-[#B5BAC1] text-sm mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        Communication moderne et réactive
      </motion.p>

      {/* Barre de progression */}
      <motion.div
        className="w-64 mb-4"
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "100%" }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <div className="w-full bg-[#2F3136] rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#5865F2] to-[#4752C4]"
            initial={{ width: "0%" }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Texte de chargement */}
      <motion.div
        className="flex items-center space-x-2 text-[#B5BAC1] text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <Loader2 size={16} className="animate-spin" />
        <span>Chargement... {Math.round(loadingProgress)}%</span>
      </motion.div>

      {/* Points animés en bas */}
      <motion.div
        className="absolute bottom-8 flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-[#5865F2] rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>

      {/* Version */}
      <motion.div
        className="absolute bottom-2 text-[#72767D] text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        v1.0.0
      </motion.div>
    </motion.div>
  );
};

// Hook pour gérer le splash screen
export const useSplashScreen = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Vérifier si c'est le premier chargement
    const hasVisited = localStorage.getItem('discord-clone-visited');
    
    if (!hasVisited) {
      setIsVisible(true);
      localStorage.setItem('discord-clone-visited', 'true');
    } else {
      setIsReady(true);
    }
  }, []);

  const handleComplete = () => {
    setIsVisible(false);
    setIsReady(true);
  };

  const showSplash = () => {
    setIsVisible(true);
    setIsReady(false);
  };

  return {
    isVisible,
    isReady,
    showSplash,
    handleComplete
  };
};
