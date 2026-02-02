import { useState } from "react";
import { MessageSquare, FileAudio, ChevronRight, X } from "lucide-react";
import { Button } from "../ui/button";

interface HistoryItem {
  id: string;
  techniqueNumber: string;
  title: string;
  score?: number;
  date: string;
}

interface HistorySidebarProps {
  type: "chat" | "analysis";
  items: HistoryItem[];
  onSelectItem: (id: string) => void;
  onOpenFullView: () => void;
}

export function HistorySidebar({ type, items, onSelectItem, onOpenFullView }: HistorySidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score?: number) => {
    if (!score) return "text-hh-muted";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const recentItems = items.slice(0, 5);

  return (
    <div 
      className={`
        hidden lg:flex flex-col h-full border-r border-hh-border bg-white transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-80' : 'w-16'}
      `}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {!isExpanded ? (
        <div className="flex flex-col items-center py-4 gap-2">
          <div className="w-10 h-10 rounded-lg bg-hh-ui-50 flex items-center justify-center mb-2">
            {type === "chat" ? (
              <MessageSquare className="w-5 h-5 text-hh-primary" />
            ) : (
              <FileAudio className="w-5 h-5 text-hh-primary" />
            )}
          </div>
          {recentItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className="w-10 h-10 rounded-lg bg-hh-ui-50 hover:bg-hh-primary/10 flex items-center justify-center text-xs font-medium text-hh-ink transition-colors"
              title={item.title}
            >
              {item.techniqueNumber}
            </button>
          ))}
          <button
            onClick={onOpenFullView}
            className="w-10 h-10 rounded-lg hover:bg-hh-ui-100 flex items-center justify-center text-hh-muted mt-2"
            title="Bekijk alles"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-hh-border flex items-center justify-between">
            <h3 className="font-semibold text-hh-ink">
              {type === "chat" ? "Recente sessies" : "Recente analyses"}
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onOpenFullView}
              className="text-hh-primary hover:text-hh-primary/80 text-sm"
            >
              Alles bekijken
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {recentItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className="w-full p-3 text-left hover:bg-hh-ui-50 border-b border-hh-border/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center min-w-[40px] h-7 px-2 rounded-md bg-hh-primary/10 text-hh-primary text-sm font-medium">
                    {item.techniqueNumber}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-hh-ink truncate">{item.title}</p>
                    <p className="text-xs text-hh-muted">{item.date}</p>
                  </div>
                  {item.score !== undefined && (
                    <span className={`text-sm font-medium ${getScoreColor(item.score)}`}>
                      {item.score}%
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-hh-border">
            <Button 
              onClick={onOpenFullView}
              variant="outline"
              className="w-full text-sm"
            >
              Bekijk volledige historiek
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
