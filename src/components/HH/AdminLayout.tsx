import {
  LayoutDashboard,
  Video,
  Radio,
  Users,
  Target,
  Library,
  BarChart3,
  Settings,
  ChevronLeft,
  Search,
  Plus,
  Bell,
  User,
  LogOut,
  Eye,
  MessageSquare,
  ArrowLeftRight,
  HelpCircle,
  FileText,
  Upload,
  Menu,
  UserPlus,
  AlertCircle,
  Zap,
} from "lucide-react";
import { Logo } from "./Logo";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  navigate?: (page: string) => void;
}

export function AdminLayout({ children, currentPage, navigate }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  // Auto-collapse sidebar on sub-pages (diepere navigatie)
  useEffect(() => {
    // Lijst van "diepere" pagina's waar de sidebar automatisch inklapt
    const subPages = [
      "admin-chat-expert", // Chat Expert Mode - sidebar inklapt voor ruimte
      "admin-sessions-detail",
      "admin-video-detail",
      "admin-user-detail",
      "admin-technique-detail",
      "admin-transcript-detail",
      "admin-webinar-detail",
      "admin-upload-detail",
      // admin-config-review is NIET in de lijst - we willen daar niet auto-collapse
    ];

    // Klap in als we op een subpagina zijn
    if (subPages.includes(currentPage)) {
      setCollapsed(true);
    } else {
      // Klap uit als we terug naar hoofdpagina gaan - maar alleen voor desktop
      // Op mobile blijft het altijd collapsed
      if (window.innerWidth >= 1024) {
        setCollapsed(false);
      }
    }
  }, [currentPage]);

  // Primary navigation items - Simplified to 2 core features
  const mainNavItems = [
    { id: "admin-uploads", label: "Gespreksanalyse", icon: Upload },
    { id: "admin-sessions", label: "Talk to Hugo AI", icon: MessageSquare },
  ];

  // Secondary navigation items removed - keeping empty for structure
  const adminManagementItems: { id: string; label: string; icon: any }[] = [];

  const handleNavigate = (page: string) => {
    setMobileMenuOpen(false);
    navigate?.(page);
  };

  // Helper to check if a nav item should be marked as active
  // This handles sub-pages being highlighted under their parent menu item
  const isNavItemActive = (itemId: string): boolean => {
    if (currentPage === itemId) return true;
    
    // Map sub-pages to their parent menu items
    const subPageMapping: Record<string, string> = {
      "admin-chat-expert": "admin-sessions",
      "admin-sessions-detail": "admin-sessions",
      "admin-upload-detail": "admin-uploads",
      "admin-transcript-detail": "admin-uploads",
    };
    
    return subPageMapping[currentPage] === itemId;
  };

  const markAsRead = (id: string) => {
    // Simulate marking a notification as read
    const newCount = unreadCount > 0 ? unreadCount - 1 : 0;
    setUnreadCount(newCount);
  };

  const markAllAsRead = () => {
    // Simulate marking all notifications as read
    setUnreadCount(0);
  };

  const notifications = [
    {
      id: "rag-review",
      title: "RAG techniek review vraagt jouw aandacht",
      message: "Er zijn nieuwe technieksuggesties die je moet reviewen",
      time: "nu",
      type: "rag",
      severity: "medium",
      read: false,
    },
    {
      id: "config-1",
      title: "Technique 2.1 has no detector configuration",
      message: "Missing detector entry for technique 2.1",
      time: "2u geleden",
      type: "config",
      severity: "high",
      read: false,
    },
    {
      id: "config-2",
      title: "Pattern mismatch for technique 3.2",
      message: "Current patterns are too broad and trigger false positives",
      time: "5u geleden",
      type: "config",
      severity: "medium",
      read: false,
    },
    {
      id: "config-3",
      title: "Invalid phase transition detected",
      message: "AI attempted to transition to phase 5 which doesn't exist",
      time: "1d geleden",
      type: "config",
      severity: "high",
      read: false,
    },
    {
      id: "1",
      title: "Nieuwe upload: Discovery Technieken",
      message: "Jan de Vries heeft een nieuwe transcript geüpload",
      time: "5 min geleden",
      type: "video",
      read: false,
    },
    {
      id: "2",
      title: "Live sessie gestart",
      message: '"SPIN Questioning Workshop" is nu live',
      time: "12 min geleden",
      type: "video",
      read: false,
    },
    {
      id: "3",
      title: "Nieuwe gebruiker geregistreerd",
      message: "Sarah van Dijk - Acme Inc",
      time: "1 uur geleden",
      type: "user",
      read: false,
    },
    {
      id: "4",
      title: "Video processing voltooid",
      message: '"Objection Handling Masterclass" is nu beschikbaar',
      time: "3 uur geleden",
      type: "video",
      read: true,
    },
  ];

  return (
    <div className="min-h-screen bg-hh-bg flex">
      {/* Mobile Menu Sheet - Full screen */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-full p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b border-hh-border flex-shrink-0">
            <SheetTitle className="flex items-center gap-2">
              <Logo variant="horizontal" className="text-hh-ink text-[16px]" />
              <Badge className="bg-purple-600 text-white border-0 text-[10px] px-2 py-0.5">
                ADMIN
              </Badge>
            </SheetTitle>
          </SheetHeader>

          {/* Mobile Navigation - Split top/bottom */}
          <div className="flex-1 flex flex-col justify-between overflow-y-auto">
            {/* Top section */}
            <nav className="p-4 space-y-1">
              {/* Primary items */}
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isNavItemActive(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : "text-hh-text hover:bg-hh-ui-50"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[16px] leading-[24px] font-normal">
                      {item.label === "Talk to Hugo AI" ? (
                        <>Talk to Hugo <sup className="text-[11px]">AI</sup></>
                      ) : item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="border-t border-hh-border">
              <nav className="p-4 space-y-1">
                {/* Secondary items */}
                {adminManagementItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isNavItemActive(item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-purple-600 text-white"
                          : "text-hh-text hover:bg-hh-ui-50"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-[16px] leading-[24px] font-medium">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* User View switch - Bottom */}
              <div className="p-4 border-t border-hh-border">
                <Button
                  variant="outline"
                  className="w-full gap-2 justify-start h-12"
                  onClick={() => handleNavigate("analysis")}
                >
                  <Eye className="w-5 h-5" />
                  <span className="text-[16px] font-normal">User View</span>
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar - FIXED position, always visible */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 ${
          collapsed ? "w-16" : "w-56"
        } bg-white border-r border-hh-border transition-all duration-300 h-screen z-30`}
      >
        {/* Logo - Fixed top - Klikbaar voor collapse/expand */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-16 flex items-center justify-start px-3 border-b border-hh-border flex-shrink-0 hover:bg-hh-ui-50 transition-colors cursor-pointer"
        >
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <Logo variant="horizontal" className="text-hh-ink text-[14px]" />
              <Badge className="bg-purple-600 text-white border-0 text-[10px] px-2 py-0.5">
                ADMIN
              </Badge>
            </div>
          ) : (
            <Logo variant="icon" className="w-8 h-8 text-hh-ink" />
          )}
        </button>

        {/* Primary Navigation - Scrollable if needed */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavItemActive(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-purple-600/10 border-l-2 border-purple-600 text-purple-600"
                    : "text-hh-text hover:bg-hh-ui-100"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-[14px] leading-[20px]">
                    {item.label === "Talk to Hugo AI" ? (
                      <>Talk to Hugo <sup className="text-[10px]">AI</sup></>
                    ) : item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Management Section - Fixed at bottom (no scroll) */}
        <nav className="p-3 space-y-2 border-t border-hh-border flex-shrink-0">
          {adminManagementItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavItemActive(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-purple-600/10 border-l-2 border-purple-600 text-purple-600"
                    : "text-hh-text hover:bg-hh-ui-100"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-[14px] leading-[20px]">
                    {item.label === "Talk to Hugo AI" ? (
                      <>Talk to Hugo <sup className="text-[10px]">AI</sup></>
                    ) : item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: Switch to User View - Always visible */}
        <div className="p-3 border-t border-hh-border flex-shrink-0">
          <Button
            variant="outline"
            className="w-full gap-2 justify-start"
            onClick={() => navigate?.("analysis")}
          >
            <Eye className="w-4 h-4" />
            {!collapsed && <span className="text-[14px]">User View</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content - Offset by sidebar width */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-56"
        }`}
      >
        {/* Admin Topbar - STICKY */}
        <header className="sticky top-0 z-40 h-16 bg-white border-b border-hh-border flex items-center justify-between px-3 sm:px-6 flex-shrink-0">
          {/* Left: Hamburger (mobile) + Search */}
          <div className="flex items-center gap-3 flex-1">
            {/* Hamburger menu - mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Search */}
            <div className="flex-1 max-w-md hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
                <Input
                  placeholder="Zoek video's, users, sessies..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions + User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <DropdownMenu
              open={notificationsOpen}
              onOpenChange={setNotificationsOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3 border-b border-hh-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-semibold text-hh-text">
                      Notificaties
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[12px]"
                      onClick={markAllAsRead}
                    >
                      Alles gelezen
                    </Button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif: any) => (
                    <div
                      key={notif.id}
                      className={`p-3 border-b border-hh-border last:border-0 hover:bg-hh-ui-50 cursor-pointer ${
                        !notif.read ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.type === "config") {
                          navigate?.("admin-config-review");
                          setNotificationsOpen(false);
                        } else if (notif.type === "rag") {
                          navigate?.("admin-rag-review");
                          setNotificationsOpen(false);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            !notif.read ? "bg-blue-600" : "bg-transparent"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[13px] text-hh-text font-medium">
                              {notif.title}
                            </p>
                            {notif.severity === "high" && (
                              <Badge className="bg-red-600 text-white border-0 text-[9px] px-1.5 py-0">
                                HIGH
                              </Badge>
                            )}
                            {notif.severity === "medium" && (
                              <Badge className="bg-orange-600 text-white border-0 text-[9px] px-1.5 py-0">
                                MED
                              </Badge>
                            )}
                          </div>
                          <p className="text-[12px] text-hh-muted line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[11px] text-hh-muted mt-1">
                            {notif.time}
                          </p>
                        </div>
                        {notif.type === "video" && (
                          <Video className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                        {notif.type === "user" && (
                          <UserPlus className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                        {notif.type === "config" && (
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        )}
                        {notif.type === "rag" && (
                          <Zap className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-hh-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-[12px]"
                    onClick={() => navigate?.("admin-notifications")}
                  >
                    Alle notificaties
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-purple-600 text-white text-[12px]">
                      HH
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <p className="text-[13px] leading-[18px] text-hh-text">Hugo Herbots</p>
                    <p className="text-[11px] leading-[14px] text-hh-muted">Super Admin</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate?.("analysis")}>
                  <Eye className="w-4 h-4 mr-2" />
                  Switch to User View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate("admin-settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => navigate?.("landing")}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Uitloggen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}