'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

const TIPS = [
    "DID YOU KNOW? You can use Ctrl + K to quickly find a channel or DM!",
    "DID YOU KNOW? You can add emojis to your channel names to make them look cool!",
    "DID YOU KNOW? Right-click a server icon to quickly mark it as read.",
    "DID YOU KNOW? You can change your status in the bottom left corner.",
    "DID YOU KNOW? Click the compass icon to explore public communities!",
    "DID YOU KNOW? Obsidian is faster than light (almost).",
    "TIPS: Try hitting 'Enter' to send messages quickly.",
    "DID YOU KNOW? You can create your own server for free!",
];

export const DiscordLoading = () => {
    const [tip, setTip] = useState('');

    useEffect(() => {
        setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    }, []);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[#1E1F22] overflow-hidden select-none">
            <div className="relative mb-12 flex flex-col items-center">
                {/* Subtle Container */}
                <div className="relative flex items-center justify-center">
                    {/* Very Subtle Glow */}
                    <div className="absolute h-24 w-24 rounded-full bg-white/[0.02] animate-pulse duration-[3000ms]" />

                    {/* Logo Container - Discord Gray Style */}
                    <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#2B2D31] shadow-xl border border-white/5">
                        <MessageSquare className="h-10 w-10 text-[#313338] fill-[#313338] opacity-20" />

                        {/* Inner pulsing indicator */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <MessageSquare className="h-10 w-10 text-emerald-500/40 animate-pulse duration-[2000ms]" />
                        </div>
                    </div>
                </div>

                {/* Text Area */}
                <div className="mt-8 flex flex-col items-center gap-2">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#B5BAC1] opacity-50">
                        Connecting
                    </h2>
                    <div className="flex gap-1.5 h-1 items-center">
                        <div className="h-1 w-1 rounded-full bg-white/20 animate-bounce [animation-delay:-0.3s]" />
                        <div className="h-1 w-1 rounded-full bg-white/20 animate-bounce [animation-delay:-0.15s]" />
                        <div className="h-1 w-1 rounded-full bg-white/20 animate-bounce" />
                    </div>
                </div>
            </div>

            {/* Tip Section */}
            <div className="max-w-xs px-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#B5BAC1] opacity-40">
                    Did you know
                </div>
                <p className="text-[13px] font-medium leading-relaxed text-[#DBDEE1] opacity-40">
                    {tip || "Loading amazing features just for you..."}
                </p>
            </div>

            {/* Bottom Progress Bar (Visual Only) */}
            <div className="fixed bottom-0 left-0 h-[2px] w-full bg-white/[0.02]">
                <div className="h-full bg-emerald-500/20 animate-[loading_3s_ease-in-out_infinite]" />
            </div>

            <style jsx>{`
        @keyframes loading {
          0% { width: 0%; left: 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { width: 30%; left: 100%; opacity: 0; }
        }
      `}</style>
        </div>
    );
};
