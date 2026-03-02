'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  pseudo: string;
  avatarUrl?: string;
  bannerUrl?: string;
  accentColor?: string;
  bio?: string;
  status?: string;
  socialLinks?: string;
  role: string;
  isHost: boolean;
  state?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (pseudo: string, avatarUrl?: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('discord_clone_user');
    const timer = setTimeout(() => {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const login = async (pseudo: string, avatarUrl?: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo, avatarUrl }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      if (data.id) {
        setUser(data);
        localStorage.setItem('discord_clone_user', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: Network error or server is down.');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('discord_clone_user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('discord_clone_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
