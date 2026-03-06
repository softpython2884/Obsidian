'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Users, Lock, Archive, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useSocket } from '@/components/providers/socket-provider';
import { cn } from '@/lib/utils';

interface Thread {
  id: string;
  messageId: string;
  name: string;
  createdAt: string;
  messageCount: number;
  lastMessageAt: string;
  isArchived: boolean;
  isLocked: boolean;
  participants: string[];
  createdBy: string;
}

interface ThreadMessage {
  id: string;
  threadId: string;
  content: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    pseudo: string;
    avatarUrl?: string;
  };
}

interface ThreadButtonProps {
  messageId: string;
  hasThread: boolean;
  threadCount?: number;
  onCreateThread: () => void;
  onOpenThread: (threadId: string) => void;
  className?: string;
}

export const ThreadButton: React.FC<ThreadButtonProps> = ({
  messageId,
  hasThread,
  threadCount = 0,
  onCreateThread,
  onOpenThread,
  className
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => {
          if (hasThread) {
            // Ouvrir le thread existant
            onOpenThread(messageId);
          } else {
            onCreateThread();
          }
        }}
        className={cn(
          "flex items-center space-x-1 px-2 py-1 rounded-lg transition-all text-sm",
          hasThread
            ? "bg-[#5865F2] text-white"
            : "text-[#B5BAC1] hover:text-white hover:bg-white/10"
        )}
      >
        <MessageSquare size={16} />
        {hasThread && threadCount > 0 && (
          <span>{threadCount}</span>
        )}
        <span>{hasThread ? 'Voir le thread' : 'Créer un thread'}</span>
      </button>
    </div>
  );
};

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
  onCreateThread: (name: string) => void;
}

export const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
  isOpen,
  onClose,
  messageId,
  onCreateThread
}) => {
  const [threadName, setThreadName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadName.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateThread(threadName.trim());
      setThreadName('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#2B2D31] border border-white/10 rounded-xl shadow-2xl max-w-md w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Créer un thread
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#B5BAC1] mb-2">
                    Nom du thread
                  </label>
                  <input
                    type="text"
                    value={threadName}
                    onChange={(e) => setThreadName(e.target.value)}
                    placeholder="Donnez un nom à cette discussion..."
                    className="w-full bg-[#1E1F22] text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#5865F2] placeholder:text-[#72767D]"
                    autoFocus
                    maxLength={100}
                  />
                  <p className="text-xs text-[#72767D] mt-1">
                    {threadName.length}/100 caractères
                  </p>
                </div>

                <div className="flex items-center space-x-3 text-sm text-[#B5BAC1]">
                  <Lock size={16} />
                  <span>Les threads sont privés par défaut</span>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!threadName.trim() || isSubmitting}
                    className="px-4 py-2 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ThreadViewProps {
  thread: Thread;
  onClose: () => void;
  onSendMessage: (content: string) => void;
  onArchiveThread: (threadId: string) => void;
  onLockThread: (threadId: string) => void;
}

export const ThreadView: React.FC<ThreadViewProps> = ({
  thread,
  onClose,
  onSendMessage,
  onArchiveThread,
  onLockThread
}) => {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    // Charger les messages du thread
    const loadThreadMessages = async () => {
      try {
        const response = await fetch(`/api/threads/${thread.id}/messages`);
        if (response.ok) {
          const threadMessages = await response.json();
          setMessages(threadMessages);
        }
      } catch (error) {
        console.error('Failed to load thread messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThreadMessages();
  }, [thread.id]);

  useEffect(() => {
    if (!socket) return;

    const handleNewThreadMessage = (data: ThreadMessage) => {
      if (data.threadId === thread.id) {
        setMessages(prev => [...prev, data]);
        scrollToBottom();
      }
    };

    socket.on('new-thread-message', handleNewThreadMessage);
    return () => {
      socket.off('new-thread-message', handleNewThreadMessage);
    };
  }, [socket, thread.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#36393F] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#2F3136]">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <MessageSquare size={20} className="text-[#B5BAC1]" />
            <div>
              <h3 className="text-white font-semibold">{thread.name}</h3>
              <p className="text-xs text-[#B5BAC1]">
                {thread.messageCount} messages • {thread.participants.length} participants
              </p>
            </div>
          </div>
          
          {thread.isLocked && (
            <div className="flex items-center space-x-1 text-[#FEE75C]">
              <Lock size={16} />
              <span className="text-xs">Verrouillé</span>
            </div>
          )}
          
          {thread.isArchived && (
            <div className="flex items-center space-x-1 text-[#ED4245]">
              <Archive size={16} />
              <span className="text-xs">Archivé</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onLockThread(thread.id)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Lock size={20} />
          </button>
          <button
            onClick={() => onArchiveThread(thread.id)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Archive size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-[#B5BAC1]">Chargement du thread...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3"
              >
                <div className="w-8 h-8 bg-[#5865F2] rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {message.user.pseudo.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-medium text-sm">
                      {message.user.pseudo}
                    </span>
                    <span className="text-[#72767D] text-xs">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[#DCDDDE] text-sm break-words">
                    {message.content}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      {!thread.isLocked && !thread.isArchived && (
        <div className="p-4 border-t border-white/10 bg-[#2F3136]">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Envoyer un message dans le thread..."
              className="flex-1 bg-[#40444B] text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#5865F2] placeholder:text-[#72767D]"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 text-[#5865F2] hover:text-[#4752C4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Hook pour gérer les threads
export const useThreads = (messageId?: string) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);

  const createThread = async (name: string, targetMessageId: string) => {
    if (!user || !socket) return;

    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          messageId: targetMessageId,
          createdBy: user.id
        })
      });

      if (response.ok) {
        const newThread = await response.json();
        setThreads(prev => [...prev, newThread]);
        setActiveThread(newThread);
        return newThread;
      }
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  const archiveThread = async (threadId: string) => {
    try {
      const response = await fetch(`/api/threads/${threadId}/archive`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setThreads(prev => 
          prev.map(thread => 
            thread.id === threadId 
              ? { ...thread, isArchived: true }
              : thread
          )
        );
      }
    } catch (error) {
      console.error('Failed to archive thread:', error);
    }
  };

  const lockThread = async (threadId: string) => {
    try {
      const response = await fetch(`/api/threads/${threadId}/lock`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setThreads(prev => 
          prev.map(thread => 
            thread.id === threadId 
              ? { ...thread, isLocked: true }
              : thread
          )
        );
      }
    } catch (error) {
      console.error('Failed to lock thread:', error);
    }
  };

  const sendThreadMessage = async (content: string, threadId: string) => {
    if (!user || !socket) return;

    try {
      const response = await fetch('/api/threads/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          threadId,
          userId: user.id
        })
      });

      if (response.ok) {
        const message = await response.json();
        socket.emit('send-thread-message', message);
      }
    } catch (error) {
      console.error('Failed to send thread message:', error);
    }
  };

  return {
    threads,
    activeThread,
    setActiveThread,
    createThread,
    archiveThread,
    lockThread,
    sendThreadMessage
  };
};
