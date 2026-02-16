import React from "react";

interface ChatBubbleProps {
  speaker: 'seller' | 'customer';
  text: string;
  timestamp?: string;
  label?: string;
  variant?: 'default' | 'faded';
  children?: React.ReactNode;
}

export function ChatBubble({
  speaker,
  text,
  timestamp,
  label,
  variant = 'default',
  children,
}: ChatBubbleProps) {
  const isCustomer = speaker === 'customer';
  const defaultLabel = isCustomer ? 'Klant' : 'Jij';
  const displayLabel = label ?? defaultLabel;
  
  const opacityClass = variant === 'faded' ? 'opacity-60' : '';

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div className="flex items-center gap-2 mb-1 px-3">
          <span className={`text-[12px] font-medium ${isCustomer ? 'text-hh-muted' : 'text-hh-text'}`}>
            {displayLabel}
          </span>
          {timestamp && (
            <span className="text-[12px] text-hh-muted">
              {timestamp}
            </span>
          )}
        </div>

        <div
          className={`p-3 rounded-2xl ${
            isCustomer
              ? "bg-hh-ink text-white rounded-br-md"
              : "bg-hh-ui-50 text-hh-text rounded-bl-md"
          } ${opacityClass}`}
        >
          <p className="text-[14px] leading-[22px] whitespace-pre-wrap">
            {text}
          </p>
        </div>

        {children && (
          <div className="mt-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
