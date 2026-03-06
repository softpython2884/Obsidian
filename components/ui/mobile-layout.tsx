'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Search, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  sidebarContent,
  className
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  if (!isMobile) {
    return <div className={cn("mobile-layout", className)}>{children}</div>;
  }

  return (
    <div className={cn("mobile-layout md:hidden", className)}>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#2B2D31] border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative flex flex-col w-80 max-w-full bg-[#2B2D31] h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-white font-semibold">Menu</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-14 h-screen">
        {children}
      </div>
    </div>
  );
};

interface MobileBottomNavProps {
  activeChannel?: string;
  onNavigate?: (destination: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeChannel,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState('chat');

  const tabs = [
    { id: 'servers', icon: '🏠', label: 'Serveurs' },
    { id: 'chat', icon: '💬', label: 'Chat' },
    { id: 'dms', icon: '👥', label: 'MPs' },
    { id: 'notifications', icon: '🔔', label: 'Notifs' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#2B2D31] border-t border-white/10 md:hidden">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              onNavigate?.(tab.id);
            }}
            className={cn(
              "flex flex-col items-center p-2 rounded-lg transition-colors",
              activeTab === tab.id
                ? "text-white"
                : "text-[#B5BAC1] hover:text-white"
            )}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

interface MobileMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MobileMessageInput: React.FC<MobileMessageInputProps> = ({
  value,
  onChange,
  onSend,
  placeholder = "Envoyer un message...",
  disabled = false
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#2B2D31] border-t border-white/10 p-4 md:hidden">
      <div className="flex items-center space-x-2">
        <button className="p-2 text-[#B5BAC1] hover:text-white transition-colors">
          ➕
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-[#1E1F22] text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-[#5865F2] placeholder-[#72767D]"
          />
        </div>
        
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="p-2 text-[#5865F2] hover:text-[#4752C4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

interface MobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const MobileSheet: React.FC<MobileSheetProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#2B2D31] rounded-t-2xl max-h-[80vh] overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-[#4752C4] rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Hook pour détecter si on est sur mobile
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Hook pour détecter l'orientation
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  return orientation;
};
