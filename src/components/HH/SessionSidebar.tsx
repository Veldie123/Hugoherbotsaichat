import { useState, useEffect } from "react";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  MessageSquare,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mic,
  Video,
  Loader2,
} from "lucide-react";

interface SessionItem {
  id: string;
  nummer: string;
  naam: string;
  type: "ai-chat" | "ai-audio" | "ai-video";
  score: number;
  date: string;
  time: string;
  duration: string;
}

interface SessionSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  currentSessionId?: string;
  userId?: string;
}

export function SessionSidebar({
  isCollapsed,
  onToggleCollapse,
  onNewChat,
  onSelectSession,
  currentSessionId,
  userId,
}: SessionSidebarProps) {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/user/sessions?userId=${userId || 'anonymous'}`);
        if (response.ok) {
          const data = await response.json();
          setSessions(data.sessions || []);
        }
      } catch (error) {
        console.error("[SessionSidebar] Failed to fetch sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [userId]);

  const filteredSessions = sessions.filter((session) =>
    session.naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.nummer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupSessionsByDate = (sessions: SessionItem[]) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const groups: { label: string; sessions: SessionItem[] }[] = [
      { label: "Vandaag", sessions: [] },
      { label: "Gisteren", sessions: [] },
      { label: "Deze week", sessions: [] },
      { label: "Ouder", sessions: [] },
    ];

    sessions.forEach((session) => {
      if (session.date === today) {
        groups[0].sessions.push(session);
      } else if (session.date === yesterday) {
        groups[1].sessions.push(session);
      } else {
        const sessionDate = new Date(session.date);
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        if (sessionDate >= weekAgo) {
          groups[2].sessions.push(session);
        } else {
          groups[3].sessions.push(session);
        }
      }
    });

    return groups.filter((group) => group.sessions.length > 0);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ai-audio":
        return <Mic className="h-3 w-3" />;
      case "ai-video":
        return <Video className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-slate-50 border-r border-slate-200 flex flex-col items-center py-3 gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="h-8 w-8 text-hh-ink hover:bg-hh-ink/10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-64 h-full bg-slate-50 border-r border-slate-200 flex flex-col">
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={onNewChat}
            size="sm"
            className="bg-hh-ink hover:bg-hh-ink/90 text-white gap-1"
          >
            <Plus className="h-4 w-4" />
            Nieuwe chat
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Zoek sessies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm bg-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-slate-500">
            {searchQuery ? "Geen sessies gevonden" : "Nog geen sessies"}
          </div>
        ) : (
          groupSessionsByDate(filteredSessions).map((group) => (
            <div key={group.label} className="py-2">
              <div className="px-3 py-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
                {group.label}
              </div>
              {group.sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={cn(
                    "w-full px-3 py-2 text-left hover:bg-slate-100 transition-colors",
                    currentSessionId === session.id && "bg-slate-200"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-slate-400">
                      {getTypeIcon(session.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {session.naam}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                          {session.nummer}
                        </span>
                        <span className={getScoreColor(session.score)}>
                          {session.score}%
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {session.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
