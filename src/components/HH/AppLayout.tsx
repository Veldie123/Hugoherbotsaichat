import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Shield,
  MessageSquare,
  Plus,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

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
  navigate?: (page: string) => void;
  onOpenFlowDrawer?: () => void;
  isAdmin?: boolean;
  chatHistory?: HistoryItem[];
  analysisHistory?: HistoryItem[];
  onSelectHistoryItem?: (id: string, type: "chat" | "analysis") => void;
  onNewChat?: () => void;
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

const defaultAnalysisHistory: HistoryItem[] = [
  { id: "1", techniqueNumber: "1.1", title: "Demo presentatie voor Acme Corp", score: 56, date: "2026-01-27" },
  { id: "2", techniqueNumber: "2.1.1", title: "Follow-up meeting DataDrive NL", score: 90, date: "2026-01-23" },
  { id: "3", techniqueNumber: "1.1", title: "Discovery call met Digital Solutions", score: 79, date: "2026-01-19" },
];

export function AppLayout({
  children,
  currentPage = "home",
  navigate,
  onOpenFlowDrawer,
  isAdmin,
  chatHistory = defaultChatHistory,
  analysisHistory = defaultAnalysisHistory,
  onSelectHistoryItem,
  onNewChat,
}: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const getScoreColor = (score?: number) => {
    if (!score) return "text-hh-muted";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getHistoryForItem = (historyType: "chat" | "analysis") => {
    return historyType === "chat" ? chatHistory : analysisHistory;
  };

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      navigate?.("talk-to-hugo");
    }
  };

  return (
    <div className="flex h-screen bg-hh-bg">
      <div
        className={`hidden lg:flex ${
          collapsed ? "w-[60px]" : "w-[280px]"
        } bg-white border-r border-hh-border flex-col transition-all duration-300 flex-shrink-0`}
      >
        <div className="h-16 flex items-center justify-between px-3 border-b border-hh-border flex-shrink-0">
          {!collapsed ? (
            <Logo variant="horizontal" className="text-hh-ink text-[14px]" />
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

        {!collapsed && (
          <div className="p-3 flex-shrink-0">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-hh-border text-hh-text hover:bg-hh-ui-50 transition-colors text-[14px]"
            >
              <Plus className="w-4 h-4" />
              <span>Nieuw gesprek</span>
            </button>
          </div>
        )}
        {collapsed && (
          <div className="p-2 flex-shrink-0">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center p-2 rounded-lg border border-hh-border text-hh-text hover:bg-hh-ui-50 transition-colors"
              title="Nieuw gesprek"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-2 pb-2">
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
                      ? "bg-hh-ink text-white"
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
                        {histItem.score !== undefined && (
                          <span className={`text-[12px] font-semibold flex-shrink-0 ${getScoreColor(histItem.score)}`}>
                            {histItem.score}%
                          </span>
                        )}
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
          <div className="p-2 flex-shrink-0 border-t border-hh-border">
            <button
              onClick={() => navigate?.("admin-uploads")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-hh-muted hover:bg-hh-ui-50 hover:text-hh-text transition-colors"
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-[13px]">Admin</span>}
            </button>
          </div>
        )}

        {collapsed && (
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
              <Logo variant="horizontal" className="text-hh-ink text-[16px]" />
            </SheetTitle>
          </SheetHeader>

          <div className="p-3 flex-shrink-0">
            <button
              onClick={() => {
                handleNewChat();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-hh-border text-hh-text hover:bg-hh-ui-50 transition-colors text-[15px]"
            >
              <Plus className="w-5 h-5" />
              <span>Nieuw gesprek</span>
            </button>
          </div>

          <nav className="flex-1 px-3 pb-3 overflow-y-auto">
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
                        ? "bg-hh-ink text-white"
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
                          {histItem.score !== undefined && (
                            <span className={`text-[13px] font-semibold flex-shrink-0 ${getScoreColor(histItem.score)}`}>
                              {histItem.score}%
                            </span>
                          )}
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
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-hh-muted hover:bg-hh-ui-50 transition-colors"
              >
                <Shield className="w-5 h-5" />
                <span className="text-[15px]">Admin View</span>
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

            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Bell className="w-5 h-5" />
            </Button>
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
