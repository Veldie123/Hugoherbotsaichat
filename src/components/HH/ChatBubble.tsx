import React from "react";

interface ChatBubbleProps {
  speaker: 'seller' | 'customer';
  text: string;
  timestamp?: string;
  label?: string;
  variant?: 'default' | 'faded';
  compact?: boolean;
  children?: React.ReactNode;
}

export function ChatBubble({
  speaker,
  text,
  timestamp,
  label,
  variant = 'default',
  compact = false,
  children,
}: ChatBubbleProps) {
  const isCustomer = speaker === 'customer';
  const defaultLabel = isCustomer ? 'Klant' : 'Jij';
  const displayLabel = label ?? defaultLabel;
  
  const opacityClass = variant === 'faded' ? 'opacity-60' : '';
  const maxWidth = compact ? 'max-w-[70%]' : 'max-w-[75%] sm:max-w-[65%]';
  const padding = compact ? 'px-3 py-2' : 'p-3';
  const textSize = compact ? 'text-[13px] leading-[18px]' : 'text-[14px] leading-[22px]';
  const labelSize = compact ? 'text-[11px]' : 'text-[12px]';

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} ${maxWidth}`}>
        <div className={`flex items-center gap-2 mb-1 px-3`}>
          <span className={`${labelSize} font-medium ${isCustomer ? 'text-hh-muted' : 'text-hh-text'}`}>
            {displayLabel}
          </span>
          {timestamp && (
            <span className={`${labelSize} text-hh-muted`}>
              {timestamp}
            </span>
          )}
        </div>

        <div
          className={`${padding} rounded-2xl ${
            isCustomer
              ? "bg-hh-ink text-white rounded-br-md"
              : "bg-hh-ui-50 text-hh-text rounded-bl-md"
          } ${opacityClass}`}
        >
          <p className={`${textSize} whitespace-pre-wrap`}>
            {text}
          </p>
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
