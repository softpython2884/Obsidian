'use client';

import * as React from "react"

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>

export const Tooltip = ({ children }: { children: React.ReactNode, delayDuration?: number }) => {
  return <div className="relative group">{children}</div>
}

export const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => <>{children}</>

export const TooltipContent = ({ children, side, className }: { children: React.ReactNode, side?: string, className?: string }) => {
  return (
    <div className={`absolute left-full ml-2 px-3 py-1.5 bg-black text-white text-xs font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 ${className}`}>
      {children}
      <div className="absolute left-0 top-1/2 -ml-1 -mt-1 border-4 border-transparent border-r-black" />
    </div>
  )
}
