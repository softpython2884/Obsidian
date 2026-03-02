'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Hash, PlusCircle, Gift, Sticker, Smile, Send, Shield } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useSocket } from '@/components/providers/socket-provider';
import { decrypt } from '@/lib/encryption';
import { format } from 'date-fns';

interface ChatAreaProps {
  channel: any;
}

export const ChatArea = ({ channel }: ChatAreaProps) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || !channel) return;

    const content = inputValue;
    setInputValue('');

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

  if (!channel) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-[#313338]">
        <h2 className="text-xl font-bold text-[#949BA4]">Select a channel to start chatting</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[#313338]">
      {/* Chat Header */}
      <div className="flex h-12 items-center border-b border-[#1E1F22] px-4 shadow-sm">
        <Hash size={24} className="mr-2 text-[#80848E]" />
        <h3 className="font-bold text-white">{channel.name}</h3>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="mb-8 mt-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#41434A] text-white">
            <Hash size={40} />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">Welcome to #{channel.name}!</h1>
          <p className="text-[#B5BAC1]">This is the start of the #{channel.name} channel.</p>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className="group flex items-start space-x-4 px-1 py-1 hover:bg-[#2E3035]">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-[#5865F2] mt-0.5">
              {msg.user?.avatarUrl ? (
                <img src={msg.user.avatarUrl} alt={msg.user.pseudo} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                  {msg.user?.pseudo?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white hover:underline cursor-pointer flex items-center" style={{ color: msg.user?.role === 'ADMIN' ? '#F04747' : msg.user?.role === 'MODERATOR' ? '#FAA61A' : '#DBDEE1' }}>
                  {msg.user?.pseudo}
                  {msg.user?.role === 'ADMIN' && <Shield size={14} className="ml-1 text-[#F04747]" />}
                </span>
                <span className="text-xs text-[#949BA4]">{format(new Date(msg.createdAt), 'HH:mm')}</span>
              </div>
              <p className="text-[#DBDEE1] whitespace-pre-wrap">{msg.content}</p>
              {msg.gifUrl && (
                <img src={msg.gifUrl} alt="GIF" className="mt-2 max-w-xs rounded-lg" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="px-4 pb-6">
        <div className="relative flex items-center rounded-lg bg-[#383A40] px-4 py-2.5">
          <PlusCircle size={24} className="mr-4 cursor-pointer text-[#B5BAC1] hover:text-[#DBDEE1]" />
          <input
            value={inputValue}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Message #${channel.name}`}
            className="flex-1 bg-transparent text-[#DBDEE1] outline-none placeholder:text-[#949BA4]"
          />
          <div className="flex items-center space-x-3 text-[#B5BAC1]">
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
