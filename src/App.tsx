import { useState, useEffect } from "react";
import { UserProvider } from "./contexts/UserContext";
import { Landing } from "./components/HH/Landing";
import { Pricing } from "./components/HH/Pricing";
import { About } from "./components/HH/About";
import { Login } from "./components/HH/Login";
import { Signup } from "./components/HH/Signup";
import { AppPreview } from "./components/HH/AppPreview";
import { Onboarding } from "./components/HH/Onboarding";
import { Dashboard } from "./components/HH/Dashboard";
import { Coaching } from "./components/HH/Coaching";
import { RolePlay } from "./components/HH/RolePlay";
import { RolePlayOverview } from "./components/HH/RolePlayOverview";
import { Library } from "./components/HH/Library";
import { ScenarioBuilder } from "./components/HH/ScenarioBuilder";
import { MySessions } from "./components/HH/MySessions";
import { VideoLibrary } from "./components/HH/VideoLibrary";
import { LiveCoaching } from "./components/HH/LiveCoaching";
import { TeamSessions } from "./components/HH/TeamSessions";
import { Analytics } from "./components/HH/Analytics";
import { Settings } from "./components/HH/Settings";
import { AuthCallback } from "./components/HH/AuthCallback";
import { RolePlayChat } from "./components/HH/RolePlayChat";
import { TalkToHugoAI } from "./components/HH/TalkToHugoAI";
import { OverviewProgress } from "./components/HH/OverviewProgress";
import { Analysis } from "./components/HH/Analysis";
import { AnalysisResults } from "./components/HH/AnalysisResults";
import { AdminDashboard } from "./components/HH/AdminDashboard";
import { AdminVideoManagement } from "./components/HH/AdminVideoManagement";
import { AdminLiveSessions } from "./components/HH/AdminLiveSessions";
import { AdminUserManagement } from "./components/HH/AdminUserManagement";
import { AdminTechniqueManagement } from "./components/HH/AdminTechniqueManagement";
import { AdminContentLibrary } from "./components/HH/AdminContentLibrary";
import { AdminSessions } from "./components/HH/AdminSessions";
import { AdminAnalytics } from "./components/HH/AdminAnalytics";
import { AdminSettings } from "./components/HH/AdminSettings";
import { Help } from "./components/HH/Help";
import { Resources } from "./components/HH/Resources";
import { AdminNotifications } from "./components/HH/AdminNotifications";
import { AdminChatExpertMode } from "./components/HH/AdminChatExpertMode";
import { AdminUploadManagement } from "./components/HH/AdminUploadManagement";
import { DigitalCoaching } from "./components/HH/DigitalCoaching";
import { ConversationAnalysis } from "./components/HH/ConversationAnalysis";
import { AdminHelpCenter } from "./components/HH/AdminHelpCenter";
import { AdminResourceLibrary } from "./components/HH/AdminResourceLibrary";
import { AdminConfigReview } from "./components/HH/AdminConfigReview";
import { TechniqueLibrary } from "./components/HH/TechniqueLibrary";
import { auth } from "./utils/supabase/client";

type Page = "landing" | "pricing" | "about" | "login" | "signup" | "authcallback" | "preview" | "onboarding" | "dashboard" | "coaching" | "talk-to-hugo" | "roleplay" | "roleplays" | "roleplaychat" | "roleplays-chat" | "overviewprogress" | "library" | "sessions" | "builder" | "videos" | "live" | "team" | "analytics" | "settings" | "analysis" | "analysis-results" | "help" | "resources" | "techniques" | "admin-dashboard" | "admin-videos" | "admin-live" | "admin-uploads" | "admin-users" | "admin-techniques" | "admin-sessions" | "admin-chat-expert" | "admin-content" | "admin-analytics" | "admin-settings" | "admin-help" | "admin-resources" | "admin-notifications" | "admin-config-review";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page | null>(null); // Start with null = loading
  const [settingsSection, setSettingsSection] = useState<"profile" | "notifications" | "subscription" | "team" | "danger">("profile");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Track if user is admin

  console.log('📍 App.tsx rendered, currentPage:', currentPage);

  // Check auth state on mount - determine initial route
  useEffect(() => {
    const checkAuthAndRoute = async () => {
      console.log('🔐 Checking initial auth state...');
      
      try {
        const { session } = await auth.getSession();
        
        if (session?.user) {
          // Check if user is admin
          const adminCheck = session.user.email?.toLowerCase().endsWith('@hugoherbots.com') || false;
          setIsAdmin(adminCheck); // Store admin status in state
          
          if (adminCheck) {
            console.log('✅ Admin user logged in, route to admin-dashboard');
            setCurrentPage("admin-dashboard");
          } else {
            console.log('✅ Regular user logged in, route to dashboard');
            setCurrentPage("dashboard");
          }
        } else {
          console.log('❌ No session, route to landing');
          setCurrentPage("landing");
        }
      } catch (error) {
        console.error('❌ Error checking auth:', error);
        // Default to landing on error
        setCurrentPage("landing");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthAndRoute();
  }, []);

  // Navigation context - doorgeven aan alle pages
  const navigate = (page: Page | string) => {
    console.log('🧭 Navigate called with:', page);
    
    // Navigate to talk-to-hugo
    if (page === "talk-to-hugo" || page.startsWith("talk-to-hugo")) {
      setCurrentPage("talk-to-hugo");
      return;
    }
    
    // Handle coaching with query parameter
    if (page.startsWith("coaching?")) {
      // Extract and set query parameter in URL
      const queryPart = page.split("?")[1];
      window.history.pushState({}, "", `?${queryPart}`);
      setCurrentPage("coaching");
      return;
    }
    
    // Check for settings with section parameter
    if (page.startsWith("settings:")) {
      const section = page.split(":")[1] as "profile" | "notifications" | "subscription" | "team" | "danger";
      setSettingsSection(section);
      setCurrentPage("settings");
    } else {
      setCurrentPage(page as Page);
      setSettingsSection("profile"); // Reset to default
    }
    // Scroll to top on every navigation
    window.scrollTo(0, 0);
  };

  return (
    <UserProvider>
      {/* Show loading while checking auth */}
      {isCheckingAuth && (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-hh-ocean-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-hh-slate-600">HugoHerbots.ai laden...</p>
          </div>
        </div>
      )}

      {/* Render pages only after auth check */}
      {!isCheckingAuth && (
        <>
          {/* Login page */}
          {currentPage === "login" && (
            <Login
              onSignupClick={() => navigate("signup")}
              navigate={navigate}
            />
          )}

          {/* Signup page */}
          {currentPage === "signup" && (
            <Signup
              onLoginClick={() => navigate("login")}
              onSignupSuccess={() => navigate("onboarding")}
              navigate={navigate}
            />
          )}

          {/* AuthCallback page */}
          {currentPage === "authcallback" && (
            <AuthCallback navigate={navigate} />
          )}

          {/* Landing page - met navigate prop */}
          {currentPage === "landing" && <Landing navigate={navigate} />}

          {/* About page */}
          {currentPage === "about" && <About navigate={navigate} />}

          {/* Pricing page */}
          {currentPage === "pricing" && <Pricing navigate={navigate} />}

          {/* Onboarding page */}
          {currentPage === "onboarding" && <Onboarding navigate={navigate} />}

          {/* App Preview - Interactive demo */}
          {currentPage === "preview" && <AppPreview navigate={navigate} />}

          {/* App pages - gebruik AppLayout's interne navigatie */}
          {currentPage === "dashboard" && <Dashboard hasData={true} navigate={navigate} isAdmin={true} />}
          {currentPage === "roleplay" && <RolePlay navigate={navigate} isAdmin={true} />}
          {currentPage === "roleplays" && <RolePlay navigate={navigate} isAdmin={true} />}
          {currentPage === "roleplaychat" && <RolePlayChat navigate={navigate} isAdmin={true} />}
          {currentPage === "roleplays-chat" && <RolePlayChat navigate={navigate} isAdmin={true} />}
          {currentPage === "overviewprogress" && <OverviewProgress navigate={navigate} isAdmin={true} />}
          {currentPage === "library" && <Library navigate={navigate} isAdmin={true} />}
          {currentPage === "sessions" && <MySessions navigate={navigate} isAdmin={true} />}
          {currentPage === "builder" && <ScenarioBuilder navigate={navigate} isAdmin={true} />}
          {currentPage === "videos" && <VideoLibrary navigate={navigate} isAdmin={true} />}
          {currentPage === "live" && <LiveCoaching navigate={navigate} isAdmin={true} />}
          {currentPage === "team" && <TeamSessions navigate={navigate} isAdmin={true} />}
          {currentPage === "analytics" && <Analytics navigate={navigate} isAdmin={true} />}
          {currentPage === "settings" && <Settings navigate={navigate} initialSection={settingsSection} isAdmin={true} />}
          {currentPage === "help" && <Help navigate={navigate} isAdmin={true} />}
          {currentPage === "resources" && <Resources navigate={navigate} isAdmin={true} />}
          {currentPage === "techniques" && <TechniqueLibrary navigate={navigate} isAdmin={true} />}
          {currentPage === "admin-dashboard" && <AdminDashboard navigate={navigate} />}
          {currentPage === "admin-videos" && <AdminVideoManagement navigate={navigate} />}
          {currentPage === "admin-live" && <AdminLiveSessions navigate={navigate} />}
          {currentPage === "admin-uploads" && <AdminUploadManagement navigate={navigate} />}
          {currentPage === "admin-users" && <AdminUserManagement navigate={navigate} />}
          {currentPage === "admin-techniques" && <AdminTechniqueManagement navigate={navigate} />}
          {currentPage === "admin-sessions" && <AdminSessions navigate={navigate} />}
          {currentPage === "admin-chat-expert" && (
            <AdminChatExpertMode 
              sessionId="demo-session-1" 
              sessionTitle="V2 Roleplay - Explore" 
              navigate={navigate} 
            />
          )}
          {currentPage === "admin-content" && <AdminContentLibrary navigate={navigate} />}
          {currentPage === "admin-analytics" && <AdminAnalytics navigate={navigate} />}
          {currentPage === "admin-settings" && <AdminSettings navigate={navigate} />}
          {currentPage === "admin-help" && <AdminHelpCenter navigate={navigate} />}
          {currentPage === "admin-resources" && <AdminResourceLibrary navigate={navigate} />}
          {currentPage === "admin-notifications" && <AdminNotifications navigate={navigate} />}
          {currentPage === "admin-config-review" && <AdminConfigReview navigate={navigate} />}
          {currentPage === "coaching" && <DigitalCoaching navigate={navigate} isAdmin={true} />}
          {currentPage === "talk-to-hugo" && <TalkToHugoAI navigate={navigate} isAdmin={true} />}
          {currentPage === "analysis" && <Analysis navigate={navigate} isAdmin={true} />}
          {currentPage === "analysis-results" && <AnalysisResults navigate={navigate} isAdmin={true} />}
        </>
      )}
    </UserProvider>
  );
}