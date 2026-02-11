import { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Shield,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  UserCircle,
  CheckCheck,
  ExternalLink,
  Eye,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { useNotifications } from "../../contexts/NotificationContext";

interface HistoryItem {
  id: string;
  techniqueNumber: string;
  title: string;
  score?: number;
  date: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  navigate?: (page: string, data?: Record<string, any>) => void;
  onOpenFlowDrawer?: () => void;
  isAdmin?: boolean;
  chatHistory?: HistoryItem[];
  analysisHistory?: HistoryItem[];
  onSelectHistoryItem?: (id: string, type: "chat" | "analysis") => void;
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "Zojuist";
  if (diff < 3600) return `${Math.floor(diff / 60)} min geleden`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} uur geleden`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} dagen geleden`;
  return new Date(dateStr).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

const mainNavItems = [
  { id: "talk-to-hugo", label: "Hugo AI", icon: MessageSquare, historyType: "chat" as const, overviewPage: "hugo-overview" },
  { id: "upload-analysis", label: "Gespreksanalyse", icon: FileSearch, historyType: "analysis" as const, overviewPage: "analysis" },
];

const defaultChatHistory: HistoryItem[] = [
  { id: "1", techniqueNumber: "1.2", title: "Gentleman's agreement", score: 55, date: "2026-02-02" },
  { id: "2", techniqueNumber: "1.4", title: "Instapvraag", score: 72, date: "2026-02-01" },
  { id: "3", techniqueNumber: "2.1.1", title: "Koopstijl herkennen", score: 88, date: "2026-01-30" },
];

export function AppLayout({
  children,
  currentPage = "home",
  navigate,
  onOpenFlowDrawer,
  isAdmin,
  chatHistory = defaultChatHistory,
  analysisHistory: analysisHistoryProp,
  onSelectHistoryItem,
}: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [fetchedAnalysisHistory, setFetchedAnalysisHistory] = useState<HistoryItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllRead, removeNotification } = useNotifications();

  const analysisHistory = analysisHistoryProp || fetchedAnalysisHistory;

  useEffect(() => {
    if (analysisHistoryProp) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/v2/analysis/list');
        if (!res.ok) return;
        const data = await res.json();
        const items: HistoryItem[] = (data.analyses || []).slice(0, 5).map((a: any) => ({
          id: a.id,
          techniqueNumber: "",
          title: a.title || 'Untitled',
          score: a.overallScore ?? undefined,
          date: a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : '',
        }));
        setFetchedAnalysisHistory(items);
      } catch { }
    };
    fetchHistory();
  }, [analysisHistoryProp]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleNavigate = (pageId: string) => {
    if (navigate) {
      navigate(pageId);
    }
  };

  const isNavItemActive = (itemId: string) => {
    const pageMap: Record<string, string[]> = {
      "upload-analysis": ["analysis", "analysis-results", "upload-analysis"],
      "talk-to-hugo": ["hugo-overview", "talk-to-hugo", "roleplay", "roleplays"],
    };
    return pageMap[itemId]?.includes(currentPage) || false;
  };

  const getHistoryForItem = (historyType: "chat" | "analysis") => {
    return historyType === "chat" ? chatHistory : analysisHistory;
  };

  return (
    <div className="flex h-screen bg-hh-bg">
      <div
        className={`hidden lg:flex ${
          collapsed ? "w-[60px]" : "w-[200px]"
        } bg-white border-r border-hh-border flex-col transition-all duration-300 flex-shrink-0`}
      >
        <div className="h-16 flex items-center justify-between px-3 border-b border-hh-border flex-shrink-0">
          {!collapsed ? (
            <div className="flex flex-col items-start gap-0">
              <span className="text-[18px] leading-[22px] tracking-widest uppercase font-bold text-hh-ink">HUGO</span>
              <span className="text-[18px] leading-[22px] tracking-widest uppercase font-bold text-hh-ink">HERBOTS</span>
            </div>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              className="w-full flex justify-center hover:opacity-70 transition-opacity"
              aria-label="Expand sidebar"
            >
              <Logo variant="icon" className="w-8 h-8" />
            </button>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="w-8 h-8 rounded-lg hover:bg-hh-ui-50 flex items-center justify-center text-hh-muted transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-2 pt-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavItemActive(item.id);
            const history = getHistoryForItem(item.historyType);

            return (
              <div key={item.id} className="mb-1">
                <button
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#4F7396] text-white font-semibold"
                      : "text-hh-text hover:bg-hh-ui-50"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-[14px] leading-[20px] font-medium whitespace-nowrap">
                      {item.label === "Hugo AI" ? (
                        <>Hugo <sup className="text-[10px]">AI</sup></>
                      ) : item.label}
                    </span>
                  )}
                </button>

                {!collapsed && isActive && (
                  <div className="mt-1 ml-2 pl-4 border-l-2 border-hh-border space-y-0.5">
                    {history.slice(0, 5).map((histItem) => (
                      <button
                        key={histItem.id}
                        onClick={() => {
                          if (onSelectHistoryItem) {
                            onSelectHistoryItem(histItem.id, item.historyType);
                          } else {
                            sessionStorage.setItem("openSessionId", histItem.id);
                            navigate?.(item.overviewPage);
                          }
                        }}
                        className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left hover:bg-hh-ui-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-hh-text truncate group-hover:text-hh-ink">
                            {histItem.title}
                          </p>
                          <p className="text-[11px] text-hh-muted">{histItem.date}</p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => navigate?.(item.overviewPage)}
                      className="w-full flex items-center gap-1 px-2 py-1.5 text-[12px] text-hh-primary hover:text-hh-primary/80 transition-colors"
                    >
                      <span>Bekijk alle{history.length > 0 ? ` (${history.length})` : ""}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {isAdmin && (
          <div className="p-3 border-t border-hh-border flex-shrink-0">
            <button
              onClick={() => navigate?.("admin-uploads")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-hh-border text-hh-muted hover:bg-hh-ui-50 hover:text-hh-text transition-colors text-[14px]"
            >
              <Eye className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Admin View</span>}
            </button>
          </div>
        )}

        {collapsed && !isAdmin && (
          <div className="p-2 flex-shrink-0 border-t border-hh-border">
            <button
              onClick={() => setCollapsed(false)}
              className="w-full flex items-center justify-center p-2 rounded-lg text-hh-muted hover:bg-hh-ui-50 transition-colors"
              title="Sidebar uitklappen"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-full sm:w-80 p-0 flex flex-col">
          <SheetHeader className="px-4 py-4 border-b border-hh-border flex-shrink-0">
            <SheetTitle className="flex items-center justify-between">
              <div className="flex flex-col items-start gap-0">
                <span className="text-[18px] leading-[22px] tracking-widest uppercase font-bold text-hh-ink">HUGO</span>
                <span className="text-[18px] leading-[22px] tracking-widest uppercase font-bold text-hh-ink">HERBOTS</span>
              </div>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 px-3 pb-3 pt-3 overflow-y-auto">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavItemActive(item.id);
              const history = getHistoryForItem(item.historyType);

              return (
                <div key={item.id} className="mb-1">
                  <button
                    onClick={() => {
                      handleNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#4F7396] text-white font-semibold"
                        : "text-hh-text hover:bg-hh-ui-50"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[15px] leading-[22px] font-medium">
                      {item.label}
                    </span>
                  </button>

                  {isActive && (
                    <div className="mt-1 ml-3 pl-4 border-l-2 border-hh-border space-y-0.5">
                      {history.slice(0, 5).map((histItem) => (
                        <button
                          key={histItem.id}
                          onClick={() => {
                            if (onSelectHistoryItem) {
                              onSelectHistoryItem(histItem.id, item.historyType);
                            } else {
                              sessionStorage.setItem("openSessionId", histItem.id);
                              navigate?.(item.overviewPage);
                            }
                            setMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-left hover:bg-hh-ui-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] text-hh-text truncate">{histItem.title}</p>
                            <p className="text-[12px] text-hh-muted">{histItem.date}</p>
                          </div>
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          navigate?.(item.overviewPage);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-1 px-3 py-2 text-[13px] text-hh-primary hover:text-hh-primary/80 transition-colors"
                      >
                        <span>Bekijk alle{history.length > 0 ? ` (${history.length})` : ""}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {isAdmin && (
            <div className="p-3 border-t border-hh-border flex-shrink-0">
              <button
                onClick={() => {
                  navigate?.("admin-uploads");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-hh-border text-hh-muted hover:bg-hh-ui-50 hover:text-hh-text transition-colors text-[14px]"
              >
                <Eye className="w-4 h-4" />
                <span>Admin View</span>
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-white border-b border-hh-border flex items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-hh-text hover:text-hh-ink p-1.5 rounded-lg hover:bg-hh-ui-50 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {(currentPage === "coaching" || currentPage === "live" || currentPage === "analysis-results") && onOpenFlowDrawer && (
              <button
                onClick={onOpenFlowDrawer}
                className="text-hh-muted hover:text-hh-text p-1.5 rounded-lg hover:bg-hh-ui-50 transition-colors border border-hh-border"
                aria-label="Open Epic Sales Flow"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-hh-muted" />
              <Input
                placeholder="Zoek sessies, technieken..."
                className="pl-10 bg-hh-ui-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" className="hidden sm:flex lg:hidden">
              <Search className="w-5 h-5" />
            </Button>

            <Button
              onClick={() => navigate?.("talk-to-hugo")}
              className="gap-2 bg-[#0F172A] hover:bg-[#1e293b] text-white h-10 px-3 sm:px-4"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-[14px]">
                Talk to Hugo <sup className="text-[10px]">AI</sup>
              </span>
            </Button>

            <div className="relative" ref={notifRef}>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 relative"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-red-500' : 'text-hh-ink'}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold leading-none shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-hh-border z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-hh-border">
                    <span className="text-[15px] font-semibold text-hh-ink">Notificaties</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllRead()}
                        className="flex items-center gap-1 text-[12px] text-hh-primary hover:text-hh-primary/80 transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Alles gelezen
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-[14px] text-hh-muted">
                        Geen notificaties
                      </div>
                    ) : (
                      notifications.slice(0, 20).map((notif) => (
                        <div
                          key={notif.id}
                          className={`relative w-full text-left px-4 py-3 border-b border-hh-border/50 hover:bg-hh-ui-50 transition-colors group ${
                            !notif.read ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notif.id);
                            }}
                            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title="Verwijder notificatie"
                          >
                            <X className="w-3.5 h-3.5 text-hh-muted" />
                          </button>
                          <button
                            onClick={() => {
                              markAsRead(notif.id);
                              if (notif.type === "analysis_complete" && notif.conversationId && navigate) {
                                navigate("analysis-results", { conversationId: notif.conversationId });
                                setNotifOpen(false);
                              }
                            }}
                            className="w-full text-left"
                          >
                            <div className="flex items-start gap-3">
                              {!notif.read && (
                                <span className="mt-1.5 w-2 h-2 rounded-full bg-hh-primary flex-shrink-0" />
                              )}
                              <div className={`flex-1 min-w-0 ${notif.read ? "ml-5" : ""}`}>
                                <p className="text-[13px] font-medium text-hh-ink truncate pr-5">
                                  {notif.title}
                                </p>
                                <p className="text-[12px] text-hh-muted mt-0.5">
                                  {notif.message}
                                </p>
                                <div className="flex items-center justify-between mt-1.5">
                                  <span className="text-[11px] text-hh-muted">
                                    {formatTimeAgo(notif.createdAt)}
                                  </span>
                                  {notif.type === "analysis_complete" && notif.conversationId && (
                                    <span className="flex items-center gap-1 text-[11px] text-hh-primary font-medium">
                                      Bekijk resultaten
                                      <ExternalLink className="w-3 h-3" />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <UserMenu navigate={navigate} onLogout={() => navigate?.("landing")} />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="h-full flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
