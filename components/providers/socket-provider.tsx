'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-provider';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  updateStatus: (status: string) => void;
  recordActivity: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  updateStatus: () => {},
  recordActivity: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const activityTimeout = useRef<NodeJS.Timeout | null>(null);

  const recordActivity = () => {
    if (socket && socket.connected) {
      socket.emit('activity');
      
      // Reset activity timeout
      if (activityTimeout.current) {
        clearTimeout(activityTimeout.current);
      }
      
      // Set new timeout to record inactivity
      activityTimeout.current = setTimeout(() => {
        // User has been inactive for a while, status will be updated by server
      }, 5 * 60 * 1000); // 5 minutes
    }
  };

  const updateStatus = (status: string) => {
    if (socket && socket.connected) {
      socket.emit('status-update', status);
    }
  };

  const startHeartbeat = () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }

    heartbeatInterval.current = setInterval(() => {
      if (socket && socket.connected) {
        socket.emit('heartbeat');
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  };

  useEffect(() => {
    if (!user) return;

    // In local dev, the socket server is on the same port
    const socketInstance = io();

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
      
      // Authenticate with user data
      socketInstance.emit('authenticate', {
        userId: user.id,
        pseudo: user.pseudo,
        status: user.state || 'ONLINE'
      });
      
      startHeartbeat();
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
      
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      if (activityTimeout.current) {
        clearTimeout(activityTimeout.current);
      }
    });

    // Listen for status updates from other users
    socketInstance.on('user-status-update', (data: { userId: string; status: string }) => {
      // This will be handled by components that need to display user statuses
      console.log(`User ${data.userId} status updated to ${data.status}`);
    });

    // Small delay to avoid synchronous state update in effect warning
    const timer = setTimeout(() => setSocket(socketInstance), 0);

    return () => {
      clearTimeout(timer);
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      if (activityTimeout.current) {
        clearTimeout(activityTimeout.current);
      }
      socketInstance.disconnect();
    };
  }, [user]);

  // Set up activity tracking for mouse movement and keyboard input
  useEffect(() => {
    const handleUserActivity = () => {
      recordActivity();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, updateStatus, recordActivity }}>
      {children}
    </SocketContext.Provider>
  );
};
