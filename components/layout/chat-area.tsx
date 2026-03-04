'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Hash, Plus, Gift, Smile, Send, Shield, Pencil, Trash2, X, Check, Image as ImageIcon, CornerUpRight, MoreHorizontal, Reply } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useSocket } from '@/components/providers/socket-provider';
import { decrypt } from '@/lib/encryption';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { GifPicker } from '@/components/pickers/gif-picker';
import { EmbedCreatorModal } from '@/components/modals/embed-creator-modal';
import { ForwardMessageModal } from '@/components/modals/forward-message-modal';
import { processCommand, commands } from '@/lib/commands'; // Import commands

interface ChatAreaProps {
  channel: any;
  server?: any;
  onViewProfile: (user: any) => void;
}

export const ChatArea = ({ channel, server, onViewProfile }: ChatAreaProps) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showNewMessages, setShowNewMessages] = useState(false);

  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [messageToForward, setMessageToForward] = useState<any>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<any[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // ... (keep existing scroll logic and useEffects for fetching messages/socket)

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
          if (Array.isArray(data)) {
            const decryptedMessages = data.map((msg: any) => ({
              ...msg,
              content: decrypt(msg.content)
            }));
            setMessages(decryptedMessages);
          } else {
            console.error('API returned non-array data:', data);
          }
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
  }, [socket, isNearBottom]);

  useEffect(() => {
    // Scroll to bottom on initial load
    if (messages.length > 0 && isNearBottom) {
      setTimeout(() => scrollToBottom(), 0);
    }
  }, [messages, isNearBottom]);

  const handleSendEmbed = async (embedData: any) => {
    if (!channel || !user) return;
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '',
          channelId: channel.id,
          isEmbed: true,
          embedData: embedData,
        }),
      });
      if (response.ok) {
        const newMessage = await response.json();
        socket?.emit('send-message', {
          channelId: channel.id,
          message: newMessage
        });
      }
    } catch (error) {
      console.error('Error sending embed:', error);
    }
  };

  const handleForwardMessage = async (targetChannelId: string) => {
    if (!messageToForward || !user) return;
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageToForward.content,
          channelId: targetChannelId,
          userId: user.id,
          isForwarded: true,
          forwardedFrom: messageToForward.id,
        }),
      });
      if (response.ok) {
        if (targetChannelId === channel.id) {
          const newMessage = await response.json();
          socket?.emit('send-message', {
            channelId: channel.id,
            message: newMessage
          });
        } else {
          alert('Message forwarded!');
        }
      }
    } catch (error) {
      console.error('Error forwarding message:', error);
    }
  };

  const handleGifSelect = async (gifUrl: string) => {
    if (!channel || !user) return;
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '',
          channelId: channel.id,
          gifUrl,
        }),
      });
      if (response.ok) {
        const newMessage = await response.json();
        socket?.emit('send-message', {
          channelId: channel.id,
          message: newMessage
        });
      }
    } catch (error) {
      console.error('Error sending GIF:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || !channel) return;

    const content = inputValue;
    setInputValue('');
    scrollToBottom();

    // Handle commands
    if (content.startsWith('/')) {
      const result = await processCommand(content, { setMessages, user, channel, socket });

      // Create a system response for all commands (even text results)
      const systemMsgContent = typeof result === 'string' ? result : (result?.type === 'system' ? result.content : null);

      if (systemMsgContent) {
        const systemMsg = {
          id: 'system-' + Date.now(),
          content: systemMsgContent,
          user: {
            id: 'marcus-system-bot',
            pseudo: 'Marcus',
            role: 'SYSTEM',
            avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus',
            isBot: true
          },
          createdAt: new Date().toISOString(),
          isSystem: true,
          ephemeral: true // Local only
        };
        setMessages((prev) => [...prev, systemMsg]);
      } else if (!result) {
        // Unknown command
        const errorMsg = {
          id: 'error-' + Date.now(),
          content: `Unknown command: ${content.split(' ')[0]}. Type /help for a list of commands.`,
          user: {
            id: 'system',
            pseudo: 'System',
            isBot: true
          },
          createdAt: new Date().toISOString(),
          isSystem: true,
          ephemeral: true
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
      return; // Stop here for any slash command
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
    const val = e.target.value;
    setInputValue(val);

    if (val.startsWith('/')) {
      const search = val.slice(1).toLowerCase();
      const filtered = commands.filter(c => c.name.toLowerCase().startsWith(search));
      if (filtered.length > 0) {
        setFilteredCommands(filtered);
        setShowSuggestions(true);
        setSuggestionIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }

    if (!isTyping && socket && user) {
      setIsTyping(true);
      socket.emit('typing', { channelId: channel.id, pseudo: user.pseudo, isTyping: true });
      setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing', { channelId: channel.id, pseudo: user.pseudo, isTyping: false });
      }, 3000);
    }
  };

  const selectSuggestion = (cmd: any) => {
    setInputValue(`/${cmd.name} `);
    setShowSuggestions(false);
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
      <div className="flex flex-1 flex-col items-center justify-center bg-[#313338]">
        <div className="text-center space-y-4">
          <div className="h-24 w-24 rounded-2xl bg-[#2B2D31] flex items-center justify-center mx-auto mb-4">
            <Hash className="h-12 w-12 text-white/10" />
          </div>
          <h2 className="text-xl font-medium text-white/40">Select a channel to start chatting</h2>
        </div>
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
    <div className="flex flex-1 flex-col bg-transparent h-full overflow-hidden relative font-sans">
      {/* Chat Header - Clean & Minimal */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/20 px-6 bg-black/10 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          {channel.type === 'DM' ? (
            <div className="h-8 w-8 rounded-full bg-[#5865F2]/10 flex items-center justify-center text-[#5865F2]">
              <span className="text-sm font-bold">@</span>
            </div>
          ) : (
            <Hash size={20} className="text-white/40" />
          )}
          <div className="flex flex-col">
            <h3 className="font-semibold text-white text-sm tracking-wide">{channelName}</h3>
            {channel.description && <span className="text-xs text-white/40">{channel.description}</span>}
          </div>
        </div>
        {/* Header Actions could go here */}
      </div>

      {/* Messages Area - Spacious & Modern */}
      <div
        className="flex-1 overflow-y-auto px-6 py-4 space-y-6 no-scrollbar relative"
        ref={scrollAreaRef}
        onScroll={handleScroll}
      >
        <div className="mb-12 mt-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#1a1a1a] text-white mb-6 shadow-2xl shadow-black/50">
            {channel.type === 'DM' ? (
              <img
                src={channel.members?.find((m: any) => m.id !== user?.id)?.avatarUrl || 'https://github.com/shadcn.png'}
                alt={channelName}
                className="h-full w-full rounded-3xl object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <Hash size={40} className="text-white/20" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {channel.type === 'DM' ? channelName : `Welcome to #${channelName}`}
          </h1>
          <p className="text-white/40 max-w-md mx-auto text-sm">
            {channel.type === 'DM'
              ? `This is the beginning of your direct message history with ${channelName}.`
              : `This is the start of the #${channelName} channel.`}
          </p>
        </div>

        {messages.map((msg, index) => {
          const isCompact = index > 0 &&
            messages[index - 1].user.id === msg.user.id &&
            msg.createdAt && messages[index - 1].createdAt &&
            (new Date(msg.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime()) < 300000; // 5 mins grouping

          return (
            <ContextMenu key={msg.id}>
              <ContextMenuTrigger>
                <div
                  className={cn(
                    "group flex items-start space-x-4 relative transition-colors duration-200 rounded-lg -mx-4 px-4 py-0.5 hover:bg-white/[0.02]",
                    isCompact ? "mt-0" : "mt-1"
                  )}
                >
                  {!isCompact ? (
                    <div
                      className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#1a1a1a] cursor-pointer hover:ring-2 hover:ring-white/10 transition-all"
                      onClick={() => onViewProfile(msg.user)}
                    >
                      {msg.user?.avatarUrl ? (
                        <img src={msg.user.avatarUrl} alt={msg.user.pseudo} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white/60 bg-gradient-to-br from-white/5 to-white/10">
                          {msg.user?.pseudo?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-10 shrink-0 text-[10px] text-white/20 opacity-0 group-hover:opacity-100 text-right self-center select-none font-mono">
                      {msg.createdAt && !isNaN(new Date(msg.createdAt).getTime()) ? format(new Date(msg.createdAt), 'HH:mm') : ''}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 w-full relative">
                    {!isCompact && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className="font-medium text-white text-sm hover:underline cursor-pointer flex items-center"
                          style={{
                            color: (() => {
                              const member = msg.user?.serverMembers?.[0];
                              if (member?.roles?.length > 0) {
                                return [...member.roles].sort((a, b) => b.position - a.position)[0].color;
                              }
                              return msg.user?.role === 'ADMIN' ? '#ef4444' : msg.user?.role === 'MODERATOR' ? '#f59e0b' : undefined;
                            })()
                          }}
                          onClick={() => onViewProfile(msg.user)}
                        >
                          {msg.user?.pseudo}
                          {msg.user?.isBot && (
                            <span className="ml-2 px-1.5 py-0.5 bg-[#5865F2] text-[10px] font-bold rounded-sm leading-none flex items-center h-4 self-center">
                              BOT
                            </span>
                          )}
                          {(msg.user?.role === 'ADMIN' || msg.user?.serverMembers?.[0]?.roles?.some((r: any) => r.permissions === 'ADMIN')) && (
                            <Shield size={12} className="ml-1 text-[#ef4444]" />
                          )}
                        </span>
                        <span className="text-[10px] text-white/30 font-mono">
                          {msg.createdAt && !isNaN(new Date(msg.createdAt).getTime()) ? format(new Date(msg.createdAt), 'HH:mm') : ''}
                        </span>
                      </div>
                    )}

                    {editingMessageId === msg.id ? (
                      <div className="mt-1 bg-[#1a1a1a] p-2 rounded-lg border border-white/10">
                        <input
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(msg.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/20"
                          autoFocus
                          placeholder="Edit your message..."
                        />
                        <div className="text-[10px] text-white/40 mt-2 flex justify-end space-x-2">
                          <span className="cursor-pointer hover:text-white" onClick={handleCancelEdit}>Cancel</span>
                          <span className="cursor-pointer text-emerald-500 hover:text-emerald-400" onClick={() => handleSaveEdit(msg.id)}>Save</span>
                        </div>
                      </div>
                    ) : (
                      <div className={cn("text-white/90 text-[15px] leading-relaxed break-words markdown-content tracking-normal", isCompact && "leading-relaxed")}>
                        {msg.isForwarded && (
                          <div className="flex items-center text-xs text-white/40 mb-2 pl-2 border-l-2 border-white/10 italic">
                            <CornerUpRight size={12} className="mr-2" />
                            Forwarded message
                          </div>
                        )}

                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{msg.content}</ReactMarkdown>
                        {msg.updatedAt !== msg.createdAt && <span className="text-[10px] text-white/30 ml-1 select-none">(edited)</span>}

                        {msg.isEmbed && msg.embedData && (() => {
                          try {
                            const embed = JSON.parse(msg.embedData);
                            return (
                              <div className="mt-3 rounded-xl bg-[#111] border border-white/5 overflow-hidden max-w-md shadow-lg">
                                <div className="h-1 w-full" style={{ backgroundColor: embed.color || '#5865F2' }} />
                                <div className="p-4">
                                  {embed.title && <h4 className="font-bold text-white mb-2">{embed.title}</h4>}
                                  {embed.description && <div className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed"><ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{embed.description}</ReactMarkdown></div>}
                                  {embed.image?.url && <img src={embed.image.url} alt="Embed" className="mt-3 rounded-lg max-h-60 object-cover w-full" />}
                                  {embed.footer?.text && <div className="text-[10px] text-white/30 mt-3 pt-3 border-t border-white/5">{embed.footer.text}</div>}
                                </div>
                              </div>
                            );
                          } catch (e) {
                            return null;
                          }
                        })()}
                      </div>
                    )}

                    {msg.gifUrl && (
                      <img src={msg.gifUrl} alt="GIF" className="mt-2 max-w-xs rounded-xl shadow-lg border border-white/5" />
                    )}

                    {/* Message Actions - Floating & Minimal */}
                    <div className="absolute right-0 -top-4 bg-[#1E1F22] border border-black/20 rounded-lg shadow-xl p-1 hidden group-hover:flex items-center space-x-0.5 z-20">
                      <div
                        className="p-1.5 hover:bg-white/10 rounded-md cursor-pointer text-white/60 hover:text-white transition-colors"
                        onClick={() => {
                          setMessageToForward(msg);
                          setIsForwardModalOpen(true);
                        }}
                      >
                        <CornerUpRight size={14} />
                      </div>

                      {(user?.id === msg.user.id || user?.role === 'ADMIN' || server?.ownerId === user?.id) && (
                        <>
                          <div
                            className="p-1.5 hover:bg-white/10 rounded-md cursor-pointer text-white/60 hover:text-white transition-colors"
                            onClick={() => handleEditMessage(msg)}
                          >
                            <Pencil size={14} />
                          </div>

                          <div
                            className="p-1.5 hover:bg-red-500/10 rounded-md cursor-pointer text-white/60 hover:text-red-500 transition-colors"
                            onClick={() => handleDeleteMessage(msg.id)}
                          >
                            <Trash2 size={14} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="bg-[#111] border-[#222] text-white/80 w-56">
                {/* 
                <ContextMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => alert('Add Reaction - Coming soon!')}>
                  <Smile className="mr-2 h-4 w-4" /> Add Reaction
                </ContextMenuItem>
                */}
                <ContextMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => handleEditMessage(msg)} disabled={user?.id !== msg.user.id}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Message
                </ContextMenuItem>
                {/*
                <ContextMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => alert('Reply - Coming soon!')}>
                  <Reply className="mr-2 h-4 w-4" /> Reply
                </ContextMenuItem>
                */}
                <ContextMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => navigator.clipboard.writeText(msg.content)}>
                  <Check className="mr-2 h-4 w-4" /> Copy Text
                </ContextMenuItem>
                <ContextMenuItem
                  className="focus:bg-white/10 focus:text-white cursor-pointer"
                  onClick={() => {
                    setMessageToForward(msg);
                    setIsForwardModalOpen(true);
                  }}
                >
                  <CornerUpRight className="mr-2 h-4 w-4" /> Forward Message
                </ContextMenuItem>
                <ContextMenuSeparator className="bg-[#222]" />
                <ContextMenuItem
                  className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
                  onClick={() => handleDeleteMessage(msg.id)}
                  disabled={!(user?.id === msg.user.id || user?.role === 'ADMIN' || server?.ownerId === user?.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Message
                </ContextMenuItem>
                <ContextMenuSeparator className="bg-[#222]" />
                <ContextMenuItem
                  className="focus:bg-white/10 focus:text-white cursor-pointer text-xs text-white/40"
                  onClick={() => {
                    navigator.clipboard.writeText(msg.id);
                    toast.success("Message ID copied");
                  }}
                >
                  <Hash className="mr-2 h-3 w-3" /> Copy ID
                </ContextMenuItem>
                <ContextMenuItem
                  className="focus:bg-white/10 focus:text-white cursor-pointer text-xs text-white/40"
                  onClick={() => {
                    navigator.clipboard.writeText(msg.user.id);
                    toast.success("User ID copied");
                  }}
                >
                  <Shield className="mr-2 h-3 w-3" /> Copy User ID
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
        <div ref={messagesEndRef} />

        {/* New Messages Indicator */}
        {showNewMessages && (
          <div
            className="fixed bottom-24 right-8 bg-emerald-500 text-white px-4 py-2 rounded-full cursor-pointer shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all z-50 flex items-center animate-in fade-in slide-in-from-bottom-4 duration-300"
            onClick={scrollToBottom}
          >
            <span className="font-medium text-sm">New Messages</span>
            <span className="ml-2 text-xs">↓</span>
          </div>
        )}
      </div>

      {/* Input Area - Floating & Clean */}
      <div className="shrink-0 px-6 pb-6 pt-2 bg-transparent relative">
        {/* Command Suggestions */}
        {showSuggestions && (
          <div className="absolute bottom-[calc(100%-8px)] left-6 right-6 bg-[#1e1f22] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-2 border-b border-white/5 bg-black/20">
              <span className="text-[10px] font-bold uppercase text-white/40 tracking-widest pl-2">Available Commands</span>
            </div>
            <div className="max-h-60 overflow-y-auto no-scrollbar">
              {filteredCommands.map((cmd, index) => (
                <div
                  key={cmd.name}
                  className={cn(
                    "px-4 py-3 flex items-center justify-between cursor-pointer transition-colors",
                    index === suggestionIndex ? "bg-[#5865f2] text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                  onClick={() => selectSuggestion(cmd)}
                  onMouseEnter={() => setSuggestionIndex(index)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "h-6 w-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0",
                      index === suggestionIndex ? "bg-white/20" : "bg-white/5"
                    )}>
                      /
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{cmd.name}</span>
                      <span className={cn(
                        "text-[10px] opacity-60",
                        index === suggestionIndex ? "text-white" : "text-white/40"
                      )}>{cmd.description}</span>
                    </div>
                  </div>
                  {index === suggestionIndex && (
                    <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded text-white/60">TAB</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-2 h-4 text-[10px] text-white/30 px-2 font-mono flex justify-between">
          <span>
            {typingUsers.length > 0 && (
              <span className="animate-pulse text-[#5865F2]">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            )}
          </span>
          <span className="opacity-50 bg-[#2B2D31] px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
            /help for commands
          </span>
        </div>
        <div className="relative flex items-center rounded-2xl bg-input-glass backdrop-blur-md p-2 shadow-sm transition-all focus-within:ring-1 focus-within:ring-white/5 border border-white/5">
          <div className="flex items-center pl-2 space-x-2">
            <button
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setIsEmbedModalOpen(true)}
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex-1 min-w-0 px-2">
            <input
              value={inputValue}
              onChange={handleTyping}
              onKeyDown={(e) => {
                if (showSuggestions) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSuggestionIndex((prev) => (prev + 1) % filteredCommands.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSuggestionIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                  } else if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    selectSuggestion(filteredCommands[suggestionIndex]);
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                } else if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              placeholder={`Message #${channelName}`}
              className="w-full bg-transparent text-white text-[15px] outline-none placeholder:text-white/20 text-center"
              autoComplete="off"
            />
          </div>

          <div className="flex items-center pb-1 pr-1 space-x-1">
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                  <Gift size={20} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 border-none bg-[#1a1a1a] shadow-2xl rounded-xl overflow-hidden" side="top" align="center">
                <GifPicker onGifSelect={handleGifSelect} />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                  <Smile size={20} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 border-none bg-transparent shadow-none" side="top" align="end">
                <EmojiPicker
                  theme={Theme.DARK}
                  onEmojiClick={(emojiData: EmojiClickData) => {
                    setInputValue((prev) => prev + emojiData.emoji);
                  }}
                />
              </PopoverContent>
            </Popover>

            <button
              className={cn(
                "p-2 rounded-xl transition-all duration-200",
                inputValue.trim() ? "bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/20 hover:bg-[#4752C4]" : "text-white/20 cursor-not-allowed"
              )}
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
      <EmbedCreatorModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        onSend={handleSendEmbed}
      />

      <ForwardMessageModal
        isOpen={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        onForward={handleForwardMessage}
        currentServerId={server?.id}
      />
    </div>
  );
};
