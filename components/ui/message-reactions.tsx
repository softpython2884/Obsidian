'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Plus, X } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useSocket } from '@/components/providers/socket-provider';
import { cn } from '@/lib/utils';

interface Reaction {
  id: string;
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (reactionId: string) => void;
  className?: string;
}

// Liste d'emojis par défaut
const DEFAULT_EMOJIS = [
  '👍', '👎', '❤️', '😂', '😮', '😢', '😡',
  '🎉', '🤔', '👀', '🎯', '🔥', '💯', '⭐',
  '🚀', '💪', '🙏', '👏', '🎊', '✨'
];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  onAddReaction,
  onRemoveReaction,
  className
}) => {
  const { user } = useAuth();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchEmoji, setSearchEmoji] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReactionClick = (reaction: Reaction) => {
    if (reaction.hasReacted) {
      onRemoveReaction(reaction.id);
    } else {
      onAddReaction(reaction.emoji);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onAddReaction(emoji);
    setShowEmojiPicker(false);
    setSearchEmoji('');
  };

  const filteredEmojis = DEFAULT_EMOJIS.filter(emoji =>
    emoji.includes(searchEmoji) || 
    emoji.toLowerCase().includes(searchEmoji.toLowerCase())
  );

  if (reactions.length === 0) {
    return (
      <div className={cn("flex items-center", className)}>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="flex items-center space-x-1 px-2 py-1 text-[#B5BAC1] hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm"
        >
          <Plus size={16} />
          <span>Ajouter une réaction</span>
        </button>

        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              ref={pickerRef}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bottom-full mb-2 left-0 bg-[#2B2D31] border border-white/10 rounded-lg shadow-xl p-3 z-50"
            >
              <input
                type="text"
                placeholder="Rechercher un emoji..."
                value={searchEmoji}
                onChange={(e) => setSearchEmoji(e.target.value)}
                className="w-full bg-[#1E1F22] text-white px-3 py-2 rounded mb-3 outline-none focus:ring-2 focus:ring-[#5865F2] placeholder:text-[#72767D]"
                autoFocus
              />
              
              <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                {filteredEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="p-2 hover:bg-white/10 rounded transition-colors text-xl"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1 mt-2", className)}>
      {reactions.map((reaction) => (
        <motion.button
          key={reaction.id}
          onClick={() => handleReactionClick(reaction)}
          className={cn(
            "flex items-center space-x-1 px-2 py-1 rounded-lg transition-all text-sm",
            reaction.hasReacted
              ? "bg-[#5865F2] text-white"
              : "bg-[#2B2D31] text-[#B5BAC1] hover:bg-[#3F4147] hover:text-white"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-base">{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </motion.button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="flex items-center space-x-1 px-2 py-1 text-[#B5BAC1] hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm"
        >
          <Plus size={16} />
        </button>

        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              ref={pickerRef}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bottom-full mb-2 left-0 bg-[#2B2D31] border border-white/10 rounded-lg shadow-xl p-3 z-50"
            >
              <input
                type="text"
                placeholder="Rechercher un emoji..."
                value={searchEmoji}
                onChange={(e) => setSearchEmoji(e.target.value)}
                className="w-full bg-[#1E1F22] text-white px-3 py-2 rounded mb-3 outline-none focus:ring-2 focus:ring-[#5865F2] placeholder:text-[#72767D]"
                autoFocus
              />
              
              <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                {filteredEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="p-2 hover:bg-white/10 rounded transition-colors text-xl"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface ReactionUsersProps {
  reaction: Reaction;
  isOpen: boolean;
  onClose: () => void;
}

export const ReactionUsersModal: React.FC<ReactionUsersProps> = ({
  reaction,
  isOpen,
  onClose
}) => {
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
            className="bg-[#2B2D31] border border-white/10 rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{reaction.emoji}</span>
                <h3 className="text-white font-semibold">
                  Réactions ({reaction.count})
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {reaction.users.map((userId, index) => (
                <div
                  key={userId}
                  className="flex items-center space-x-3 p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 bg-[#5865F2] rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {userId.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">User {index + 1}</p>
                    <p className="text-[#B5BAC1] text-sm">ID: {userId}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook pour gérer les réactions
export const useReactions = (messageId: string) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const addReaction = (emoji: string) => {
    if (!user || !socket) return;

    socket.emit('add-reaction', {
      messageId,
      emoji,
      userId: user.id
    });
  };

  const removeReaction = (reactionId: string) => {
    if (!user || !socket) return;

    socket.emit('remove-reaction', {
      messageId,
      reactionId,
      userId: user.id
    });
  };

  useEffect(() => {
    if (!socket) return;

    const handleReactionUpdate = (data: { messageId: string; reactions: Reaction[] }) => {
      if (data.messageId === messageId) {
        setReactions(data.reactions);
      }
    };

    socket.on('reaction-update', handleReactionUpdate);
    return () => {
      socket.off('reaction-update', handleReactionUpdate);
    };
  }, [socket, messageId]);

  return {
    reactions,
    addReaction,
    removeReaction
  };
};
