import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { AlertCircle, ArrowRight, Clock } from "lucide-react";
import { cn } from "../ui/utils";

interface ConfigConflict {
  id: string;
  severity: "high" | "medium" | "low";
  type: string;
  title: string;
  timestamp: Date;
}

interface ConfigReviewNotificationProps {
  navigate?: (page: string) => void;
  conflicts?: ConfigConflict[];
}

export function ConfigReviewNotification({
  navigate,
  conflicts = [],
}: ConfigReviewNotificationProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Mock data for demo
  const MOCK_CONFLICTS: ConfigConflict[] = [
    {
      id: "1",
      severity: "high",
      type: "Missing Definition",
      title: "Technique 2.1 has no detector configuration",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "2",
      severity: "medium",
      type: "Wrong Pattern",
      title: "Pattern mismatch for technique 3.2 (Oplossing)",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      id: "3",
      severity: "high",
      type: "Unknown Value",
      title: "Invalid phase transition detected",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  const allConflicts = conflicts.length > 0 ? conflicts : MOCK_CONFLICTS;

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      // TODO: Fetch new conflicts from backend
      console.log("Polling for new config conflicts...");
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Update unread count based on conflicts
  useEffect(() => {
    const openConflicts = allConflicts.filter(
      (c) => c.severity === "high" || c.severity === "medium"
    );
    setUnreadCount(openConflicts.length);
  }, [allConflicts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "low":
        return "text-slate-600 bg-slate-50 border-slate-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m geleden`;
    if (hours < 24) return `${hours}u geleden`;
    return `${days}d geleden`;
  };

  // Show latest 5 conflicts
  const latestConflicts = allConflicts.slice(0, 5);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 p-0 hover:bg-hh-ui-50"
        >
          <AlertCircle className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-red-600"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-hh-ink">
            Config Review
          </span>
          {unreadCount > 0 && (
            <Badge
              variant="outline"
              className="text-[11px] bg-red-50 text-red-600 border-red-200"
            >
              {unreadCount} onopgelost
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {latestConflicts.length === 0 ? (
          <div className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-[14px] font-medium text-hh-ink mb-1">
              Geen conflicten
            </p>
            <p className="text-[13px] text-hh-muted">
              Alle configuraties zijn up-to-date
            </p>
          </div>
        ) : (
          <>
            <div className="max-h-[400px] overflow-y-auto">
              {latestConflicts.map((conflict) => (
                <DropdownMenuItem
                  key={conflict.id}
                  className="flex flex-col items-start gap-2 p-3 cursor-pointer hover:bg-hh-ui-50"
                  onClick={() => {
                    setIsOpen(false);
                    navigate?.("admin-config-review");
                  }}
                >
                  <div className="flex items-start justify-between w-full gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] uppercase font-semibold",
                          getSeverityColor(conflict.severity)
                        )}
                      >
                        {conflict.severity}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-slate-50 border-slate-200"
                      >
                        {conflict.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-hh-muted shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(conflict.timestamp)}
                    </div>
                  </div>
                  <p className="text-[13px] text-hh-text line-clamp-2 w-full">
                    {conflict.title}
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center justify-center gap-2 p-3 font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                navigate?.("admin-config-review");
              }}
            >
              Bekijk alle conflicten
              <ArrowRight className="w-4 h-4" />
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}