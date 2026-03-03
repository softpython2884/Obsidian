'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[#1E1F22] overflow-hidden">
            <div className="relative mb-12 flex flex-col items-center">
                {/* Pulsing Container */}
                <div className="relative flex items-center justify-center">
                    {/* Outer Glows */}
                    <div className="absolute h-24 w-24 animate-ping rounded-full bg-emerald-500/10 duration-[2000ms]" />
                    <div className="absolute h-32 w-32 animate-pulse rounded-full bg-emerald-500/5 duration-[3000ms]" />

                    {/* Main Logo Container */}
                    <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-[28px] bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-bounce duration-[2000ms]">
                        <MessageSquare className="h-10 w-10 text-white" />
                    </div>
                </div>

                {/* Text Area */}
                <div className="mt-8 flex flex-col items-center gap-2">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-white opacity-90">
                        Connecting
                    </h2>
                    <div className="flex gap-1.5 h-1.5 items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.3s]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.15s]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" />
                    </div>
                </div>
            </div>

            {/* Tip Section */}
            <div className="max-w-md px-8 text-center">
                <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#B5BAC1]">
                    Did you know
                </div>
                <p className="text-sm font-medium leading-relaxed text-[#DBDEE1] opacity-60">
                    {tip || "Loading amazing features just for you..."}
                </p>
            </div>

            {/* Bottom Progress Bar (Visual Only) */}
            <div className="fixed bottom-0 left-0 h-1 w-full bg-[#2B2D31]">
                <div className="h-full bg-emerald-500/50 animate-[loading_4s_ease-in-out_infinite]" />
            </div>

            <style jsx>{`
        @keyframes loading {
          0% { width: 0%; left: 0; }
          50% { width: 60%; left: 20%; }
          100% { width: 0%; left: 100%; }
        }
      `}</style>
        </div>
    );
};
