'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Hash, PlusCircle, Gift, Sticker, Smile, Send, Shield, Pencil, Trash2, X, Check } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useSocket } from '@/components/providers/socket-provider';
import { decrypt } from '@/lib/encryption';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatAreaProps {
  channel: any;
  onViewProfile: (user: any) => void;
}

export const ChatArea = ({ channel, onViewProfile }: ChatAreaProps) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showNewMessages, setShowNewMessages] = useState(false);
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowNewMessages(false);
  };

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsNearBottom(isBottom);
      if (isBottom) setShowNewMessages(false);
    }
  };

  useEffect(() => {
    if (channel) {
      // Fetch messages
      fetch(`/api/messages?channelId=${channel.id}`)
        .then((res) => res.json())
        .then((data) => {
          const decryptedMessages = data.map((msg: any) => ({
            ...msg,
            content: decrypt(msg.content)
          }));
          setMessages(decryptedMessages);
          setTimeout(scrollToBottom, 100);
        });

      // Join room
      if (socket) {
        socket.emit('join-room', channel.id);
      }
    }
  }, [channel, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('new-message', (message: any) => {
        const decryptedMsg = {
          ...message,
          content: decrypt(message.content)
        };
        setMessages((prev) => [...prev, decryptedMsg]);
        
        if (isNearBottom) {
          setTimeout(scrollToBottom, 100);
        } else {
          setShowNewMessages(true);
        }
      });

      socket.on('user-typing', (data: any) => {
        if (data.isTyping) {
          setTypingUsers((prev) => Array.from(new Set([...prev, data.pseudo])));
        } else {
          setTypingUsers((prev) => prev.filter((u) => u !== data.pseudo));
        }
      });

      return () => {
        socket.off('new-message');
        socket.off('user-typing');
      };
    }
  }, [socket]);

  useEffect(() => {
    // Scroll to bottom on initial load
    if (messages.length > 0 && isNearBottom) {
      setTimeout(() => scrollToBottom(), 0);
    }
  }, [messages, isNearBottom]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || !channel) return;

    const content = inputValue;
    setInputValue('');
    scrollToBottom();

    // Handle commands
    if (content.startsWith('/')) {
      if (content === '/clear') {
        setMessages([]);
        return;
      }
      if (content === '/help') {
        const helpMsg = {
          id: 'help-' + Date.now(),
          content: 'Available commands: /help, /nick [name], /clear',
          user: { pseudo: 'System', role: 'ADMIN' },
          createdAt: new Date(),
          isSystem: true
        };
        setMessages((prev) => [...prev, helpMsg]);
        return;
      }
    }

    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        userId: user.id,
        channelId: channel.id,
      }),
    });

    const newMessage = await response.json();
    
    if (socket) {
      socket.emit('send-message', {
        channelId: channel.id,
        message: newMessage
      });
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isTyping && socket && user) {
      setIsTyping(true);
      socket.emit('typing', { channelId: channel.id, pseudo: user.pseudo, isTyping: true });
      setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing', { channelId: channel.id, pseudo: user.pseudo, isTyping: false });
      }, 3000);
    }
  };

  const handleEditMessage = (msg: any) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (msgId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/messages/${msgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        const updatedMsg = await response.json();
        setMessages((prev) => prev.map((m) => 
          m.id === msgId ? { ...m, content: decrypt(updatedMsg.content), updatedAt: updatedMsg.updatedAt } : m
        ));
        setEditingMessageId(null);
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/messages/${msgId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  if (!channel) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-[#949BA4]">Select a channel to start chatting</h2>
      </div>
    );
  }

  const getChannelName = () => {
    if (channel.type === 'DM') {
      const otherMember = channel.members?.find((m: any) => m.id !== user?.id);
      return otherMember?.pseudo || 'Unknown User';
    }
    return channel.name;
  };

  const channelName = getChannelName();

  return (
    <div className="flex flex-1 flex-col bg-black/40 backdrop-blur-sm h-full overflow-hidden relative">
      {/* Chat Header */}
      <div className="flex h-12 shrink-0 items-center border-b border-white/10 px-4 shadow-sm bg-black/20">
        {channel.type === 'DM' ? (
          <div className="mr-2 h-6 w-6 rounded-full bg-[#5865F2] flex items-center justify-center text-[10px] font-bold text-white">
            @
          </div>
        ) : (
          <Hash size={24} className="mr-2 text-[#80848E]" />
        )}
        <h3 className="font-bold text-white">{channelName}</h3>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-1 pb-24 no-scrollbar relative"
        ref={scrollAreaRef}
        onScroll={handleScroll}
      >
        <div className="mb-8 mt-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#41434A] text-white">
            {channel.type === 'DM' ? (
              <img 
                src={channel.members?.find((m: any) => m.id !== user?.id)?.avatarUrl || ''} 
                alt={channelName}
                className="h-full w-full rounded-full object-cover"
                onError={(e) => { e.currentTarget.src = ''; e.currentTarget.style.display = 'none'; }} 
              />
            ) : (
              <Hash size={40} />
            )}
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">
            {channel.type === 'DM' ? channelName : `Welcome to #${channelName}!`}
          </h1>
          <p className="text-[#B5BAC1]">
            {channel.type === 'DM' 
              ? `This is the beginning of your direct message history with ${channelName}.`
              : `This is the start of the #${channelName} channel.`}
          </p>
        </div>

        {messages.map((msg, index) => {
          const isCompact = index > 0 && 
            messages[index - 1].user.id === msg.user.id && 
            (new Date(msg.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime()) < 60000;

          return (
            <div 
              key={msg.id} 
              className={cn(
                "group flex items-start space-x-4 px-4 hover:bg-white/5 pr-4",
                isCompact ? "py-0.5" : "py-1 mt-4"
              )}
            >
              {!isCompact ? (
                <div 
                  className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#5865F2] mt-0.5 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onViewProfile(msg.user)}
                >
                  {msg.user?.avatarUrl ? (
                    <img src={msg.user.avatarUrl} alt={msg.user.pseudo} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                      {msg.user?.pseudo?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-10 shrink-0 text-[10px] text-[#949BA4] opacity-0 group-hover:opacity-100 text-right self-center select-none">
                  {format(new Date(msg.createdAt), 'HH:mm')}
                </div>
              )}

              <div className="flex flex-col min-w-0 w-full relative">
                {!isCompact && (
                  <div className="flex items-center space-x-2">
                    <span 
                      className="font-bold text-white hover:underline cursor-pointer flex items-center" 
                      style={{ color: msg.user?.role === 'ADMIN' ? '#F04747' : msg.user?.role === 'MODERATOR' ? '#FAA61A' : '#DBDEE1' }}
                      onClick={() => onViewProfile(msg.user)}
                    >
                      {msg.user?.pseudo}
                      {msg.user?.role === 'ADMIN' && <Shield size={14} className="ml-1 text-[#F04747]" />}
                    </span>
                    <span className="text-xs text-[#949BA4]">{format(new Date(msg.createdAt), 'HH:mm')}</span>
                  </div>
                )}
                
                {editingMessageId === msg.id ? (
                  <div className="mt-1">
                    <input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(msg.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="w-full bg-[#383A40] text-white rounded p-2 outline-none border border-blue-500"
                      autoFocus
                    />
                    <div className="text-xs text-[#949BA4] mt-1">
                      escape to cancel • enter to save
                    </div>
                  </div>
                ) : (
                  <p className={cn("text-[#DBDEE1] whitespace-pre-wrap break-words", isCompact && "leading-[1.375rem]")}>
                    {msg.content}
                    {msg.updatedAt !== msg.createdAt && <span className="text-[10px] text-[#949BA4] ml-1">(edited)</span>}
                  </p>
                )}

                {msg.gifUrl && (
                  <img src={msg.gifUrl} alt="GIF" className="mt-2 max-w-xs rounded-lg" />
                )}
                
                {/* Message Actions */}
                <div className="absolute right-0 -top-2 bg-[#313338] border border-[#2B2D31] rounded shadow-sm p-1 hidden group-hover:flex items-center space-x-1 z-10">
                  <div 
                    className="p-1 hover:bg-[#404249] rounded cursor-pointer text-[#B5BAC1] hover:text-[#DBDEE1]"
                    title="Add Reaction"
                    onClick={() => alert('Reactions coming soon!')}
                  >
                    <Smile size={16} />
                  </div>
                  {(user?.id === msg.user.id || user?.role === 'ADMIN') && (
                    <>
                      <div 
                        className="p-1 hover:bg-[#404249] rounded cursor-pointer text-[#B5BAC1] hover:text-[#DBDEE1]"
                        title="Edit"
                        onClick={() => handleEditMessage(msg)}
                      >
                        <Pencil size={16} />
                      </div>
                      <div 
                        className="p-1 hover:bg-[#404249] rounded cursor-pointer text-[#F23F43] hover:text-[#F23F43]"
                        title="Delete"
                        onClick={() => handleDeleteMessage(msg.id)}
                      >
                        <Trash2 size={16} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
        
        {/* New Messages Indicator */}
        {showNewMessages && (
          <div 
            className="fixed bottom-24 right-8 bg-[#5865F2] text-white px-4 py-2 rounded-full cursor-pointer shadow-lg hover:bg-[#4752C4] transition-colors z-50 flex items-center animate-bounce"
            onClick={scrollToBottom}
          >
            <span className="font-bold text-sm">New Messages</span>
            <span className="ml-2 text-xs">↓</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md px-4 pb-6 pt-2 border-t border-white/5">
        <div className="relative flex items-center rounded-lg bg-[#383A40]/50 px-4 py-2.5 border border-white/5">
          <PlusCircle size={24} className="mr-4 shrink-0 cursor-pointer text-[#B5BAC1] hover:text-[#DBDEE1]" />
          <input
            value={inputValue}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Message ${channel.type === 'DM' ? '@' + channelName : '#' + channelName}`}
            className="flex-1 bg-transparent text-[#DBDEE1] outline-none placeholder:text-[#949BA4] min-w-0"
          />
          <div className="flex items-center space-x-3 text-[#B5BAC1] shrink-0 ml-2">
            <Gift size={24} className="cursor-pointer hover:text-[#DBDEE1]" />
            <Sticker size={24} className="cursor-pointer hover:text-[#DBDEE1]" />
            <Smile size={24} className="cursor-pointer hover:text-[#DBDEE1]" />
            <Send 
              size={24} 
              className="cursor-pointer hover:text-[#DBDEE1]" 
              onClick={handleSendMessage}
            />
          </div>
        </div>
        <div className="mt-1 h-4 text-xs text-[#B5BAC1]">
          {typingUsers.length > 0 && (
            <span>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
