import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Menu,
  ChevronLeft,
  FileSearch,
  Shield,
  MessageSquare,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { AppFooter } from "./AppFooter";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  navigate?: (page: string) => void;
  onOpenFlowDrawer?: () => void;
  isAdmin?: boolean; // New prop to check if user has admin rights
}

// Primary navigation items (top section) - Simplified to 2 core features
// Navigate to action pages (not overview pages) - sidebar shows history
const mainNavItems = [
  { id: "upload-analysis", label: "Gespreksanalyse", icon: FileSearch },
  { id: "talk-to-hugo", label: "Talk to Hugo AI", icon: MessageSquare },
];

export function AppLayout({ children, currentPage = "home", navigate, onOpenFlowDrawer, isAdmin }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Debug: Log currentPage
  useEffect(() => {
    console.log('AppLayout currentPage:', currentPage);
  }, [currentPage]);

  // Auto-collapse sidebar on sub-pages (detail views)
  useEffect(() => {
    const subPages = [
      "talk-to-hugo",
      "upload-analysis",
      "coaching",
      "video-detail",
      "live-session",
      "session-detail",
      "scenario-builder",
      "technique-detail",
    ];

    if (subPages.includes(currentPage)) {
      setCollapsed(true);
    } else {
      // Expand alleen op desktop
      if (window.innerWidth >= 1024) {
        setCollapsed(false);
      }
    }
  }, [currentPage]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-collapse on mobile
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
      // Direct navigation - no mapping needed anymore
      navigate(pageId);
    }
  };

  // Helper to check if a nav item is active based on currentPage
  const isNavItemActive = (itemId: string) => {
    const pageMap: Record<string, string[]> = {
      "upload-analysis": ["analysis", "analysis-results", "upload-analysis"],
      "talk-to-hugo": ["hugo-overview", "talk-to-hugo", "roleplay", "roleplays"],
    };
    return pageMap[itemId]?.includes(currentPage) || false;
  };

  return (
    <div className="flex h-screen bg-hh-bg">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div
        className={`hidden lg:flex ${
          collapsed ? "w-16" : "w-56"
        } bg-white border-r border-hh-border flex-col transition-all duration-300`}
      >
        {/* Logo */}
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Navigation - Scrollable if needed */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {mainNavItems
            .map((item) => {
              const Icon = item.icon;
              const isActive = isNavItemActive(item.id);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-hh-primary text-white"
                      : "text-hh-text hover:bg-hh-ui-50"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-[14px] leading-[20px] font-light whitespace-nowrap">
                      {item.label === "Talk to Hugo AI" ? (
                        <>Talk to Hugo <sup className="text-[10px]">AI</sup></>
                      ) : item.label}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>

        {/* Admin View Toggle - Sticky to bottom */}
        {isAdmin && (
          <div className="p-2 flex-shrink-0 border-t border-hh-border">
            <Button
              variant="outline"
              className="w-full gap-2 justify-start px-3 py-2.5 h-auto"
              onClick={() => navigate?.("admin-uploads")}
            >
              <Shield className="w-4 h-4" />
              {!collapsed && <span className="text-[14px]">Admin View</span>}
            </Button>
          </div>
        )}

        {/* Collapsed sidebar - Click anywhere to expand */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute inset-0 w-full h-full cursor-pointer hover:bg-hh-ui-50/30 transition-colors"
            aria-label="Expand sidebar"
            style={{ zIndex: -1 }}
          />
        )}
      </div>

      {/* Mobile Sidebar removed - using hamburger menu in topbar instead (like AdminLayout) */}

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-full sm:w-80 p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b border-hh-border flex-shrink-0">
            <SheetTitle className="flex items-center justify-between">
              <Logo variant="horizontal" className="text-hh-ink text-[16px]" />
            </SheetTitle>
          </SheetHeader>
          
          {/* Main Navigation - Scrollable */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {mainNavItems
              .map((item) => {
                const Icon = item.icon;
                const isActive = isNavItemActive(item.id);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-hh-primary text-white"
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
          
          {/* Admin View Toggle - Mobile Sheet */}
          {isAdmin && (
            <div className="p-4 border-t border-hh-border flex-shrink-0">
              <Button
                variant="outline"
                className="w-full gap-3 justify-start h-12"
                onClick={() => {
                  navigate?.("admin-uploads");
                  setMobileMenuOpen(false);
                }}
              >
                <Shield className="w-5 h-5" />
                <span className="text-[16px] font-medium">
                  Admin View
                </span>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="h-16 bg-white border-b border-hh-border flex items-center justify-between px-3 sm:px-6">
          {/* Left: Hamburger menu (Mobile only) + optional Flow drawer for coaching pages */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Hamburger menu - always visible on mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-hh-text hover:text-hh-ink p-1.5 rounded-lg hover:bg-hh-ui-50 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Flow drawer button - only on coaching/live/analysis-results pages */}
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

          {/* Desktop: Search */}
          <div className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-hh-muted" />
              <Input
                placeholder="Zoek sessies, technieken..."
                className="pl-10 bg-hh-ui-50"
              />
            </div>
          </div>

          {/* Right side: Notifications + User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="w-5 h-5 lg:hidden" />
            </Button>
            
            {/* Talk to Hugo AI Button */}
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

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <div className="h-full flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}