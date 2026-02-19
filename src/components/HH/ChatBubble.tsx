import React from "react";
import { RotateCcw } from "lucide-react";

interface ChatBubbleProps {
  speaker: 'seller' | 'customer';
  text: string;
  timestamp?: string;
  label?: string;
  variant?: 'default' | 'faded';
  compact?: boolean;
  adminColors?: boolean;
  onReplay?: () => void;
  isReplayMessage?: boolean;
  children?: React.ReactNode;
}

export function ChatBubble({
  speaker,
  text,
  timestamp,
  label,
  variant = 'default',
  compact = false,
  adminColors = false,
  onReplay,
  isReplayMessage = false,
  children,
}: ChatBubbleProps) {
  const isCustomer = speaker === 'customer';
  const defaultLabel = isCustomer ? 'Klant' : 'Jij';
  const displayLabel = label ?? defaultLabel;
  
  const opacityClass = variant === 'faded' ? 'opacity-60' : '';
  const maxWidthValue = '75%';
  const padding = compact ? 'px-3 py-2' : 'p-3';
  const textSize = compact ? 'text-[13px] leading-[18px]' : 'text-[14px] leading-[22px]';
  const labelSize = compact ? 'text-[11px]' : 'text-[12px]';

  const replayBorder = isReplayMessage ? 'ring-2 ring-emerald-400/40' : '';

  const isSeller = speaker === 'seller';

  return (
    <div className={`flex ${isSeller ? 'justify-end' : 'justify-start'} group/bubble`}>
      <div className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'}`} style={{ maxWidth: maxWidthValue }}>
        <div className={`flex items-center gap-2 mb-1 px-3`}>
          <span className={`${labelSize} font-medium ${isSeller ? 'text-hh-text' : 'text-hh-muted'}`}>
            {isReplayMessage && isSeller ? 'Jij (replay)' : displayLabel}
          </span>
          {timestamp && (
            <span className={`${labelSize} text-hh-muted`}>
              {timestamp}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isSeller && onReplay && (
            <button
              onClick={(e) => { e.stopPropagation(); onReplay(); }}
              className="opacity-0 group-hover/bubble:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-hh-ui-100 text-hh-muted hover:text-hh-primary flex-shrink-0"
              title="Opnieuw spelen vanaf hier"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <div
            className={`${padding} rounded-2xl ${
              isSeller
                ? adminColors ? "bg-purple-600 text-white rounded-br-md" : "bg-hh-ink text-white rounded-br-md"
                : adminColors ? "bg-purple-50 text-hh-text rounded-bl-md" : "bg-hh-ui-50 text-hh-text rounded-bl-md"
            } ${opacityClass} ${replayBorder}`}
          >
            <p className={`${textSize} whitespace-pre-wrap`}>
              {text}
            </p>
          </div>
        </div>

        {children && (
          <div className="mt-1.5">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
