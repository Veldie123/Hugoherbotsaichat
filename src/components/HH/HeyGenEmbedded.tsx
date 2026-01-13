import { useEffect, useRef, useState } from "react";

interface HeyGenEmbeddedProps {
  isActive: boolean;
}

export function HeyGenEmbedded({ isActive }: HeyGenEmbeddedProps) {
  if (!isActive) {
    return null;
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-hh-deep-blue to-hh-indigo flex items-center justify-center">
      {/* Hugo Avatar Placeholder */}
      <div className="text-center text-white px-8">
        {/* Avatar Circle */}
        <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/20 mx-auto mb-6 flex items-center justify-center">
          <div className="text-6xl font-bold text-white/90">HH</div>
        </div>
        
        {/* Status Text */}
        <div className="space-y-3">
          <h3 className="text-[24px] leading-[32px] font-[700]">Hugo luistert...</h3>
          <p className="text-[16px] leading-[24px] text-white/80">
            AI-avatar integratie komt binnenkort
          </p>
          
          {/* Pulse Animation */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-3 h-3 rounded-full bg-hh-success animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-hh-success animate-pulse delay-150"></div>
            <div className="w-3 h-3 rounded-full bg-hh-success animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
}