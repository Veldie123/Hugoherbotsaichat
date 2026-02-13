import { useState, useEffect } from "react";
import { UserProvider } from "./contexts/UserContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Toaster } from "./components/ui/sonner";
import { Landing } from "./components/HH/Landing";
import { Pricing } from "./components/HH/Pricing";
import { About } from "./components/HH/About";
import { Login } from "./components/HH/Login";
import { Signup } from "./components/HH/Signup";
import { Onboarding } from "./components/HH/Onboarding";
import { AuthCallback } from "./components/HH/AuthCallback";
import { TalkToHugoAI } from "./components/HH/TalkToHugoAI";
import { Analysis } from "./components/HH/Analysis";
import { AnalysisResults } from "./components/HH/AnalysisResults";
import { UploadAnalysis } from "./components/HH/UploadAnalysis";
import { AdminSessions } from "./components/HH/AdminSessions";
import { AdminChatExpertMode } from "./components/HH/AdminChatExpertMode";
import { AdminUploadManagement } from "./components/HH/AdminUploadManagement";
import { AdminConfigReview } from "./components/HH/AdminConfigReview";
import { AdminNotifications } from "./components/HH/AdminNotifications";
import { AdminRAGReview } from "./components/HH/AdminRAGReview";
import { HugoAIOverview } from "./components/HH/HugoAIOverview";
import { SSOValidate } from "./components/HH/SSOValidate";
import { auth } from "./utils/supabase/client";

type Page = "landing" | "pricing" | "about" | "login" | "signup" | "authcallback" | "sso-validate" | "onboarding" | "talk-to-hugo" | "hugo-overview" | "roleplay" | "roleplays" | "analysis" | "analysis-results" | "upload-analysis" | "admin-uploads" | "admin-sessions" | "admin-chat-expert" | "admin-config-review" | "admin-notifications" | "admin-rag-review";

const DEV_PREVIEW_PAGES: Record<string, Page> = {
  'admin-chat-expert': 'admin-chat-expert',
  'admin-sessions': 'admin-sessions',
  'admin-uploads': 'admin-uploads',
  'admin-config-review': 'admin-config-review',
  'admin-notifications': 'admin-notifications',
  'admin-rag-review': 'admin-rag-review',
  'talk-to-hugo': 'talk-to-hugo',
  'hugo-overview': 'hugo-overview',
  'analysis': 'analysis',
  'analysis-results': 'analysis-results',
  'upload-analysis': 'upload-analysis',
  'landing': 'landing',
  'login': 'login',
  'signup': 'signup',
  'pricing': 'pricing',
  'about': 'about',
  'onboarding': 'onboarding',
};

function getDevPreviewPage(): Page | null {
  const path = window.location.pathname;
  if (path.startsWith('/_dev/')) {
    const devPage = path.replace('/_dev/', '');
    return DEV_PREVIEW_PAGES[devPage] || null;
  }
  if (path.startsWith('/sso/validate')) {
    return 'sso-validate';
  }
  return null;
}

export default function App() {
  const devPreviewPage = getDevPreviewPage();
  const [currentPage, setCurrentPage] = useState<Page | null>(devPreviewPage);
  const [isCheckingAuth, setIsCheckingAuth] = useState(!devPreviewPage);
  const [isAdmin, setIsAdmin] = useState(devPreviewPage?.startsWith('admin-') || false);

  console.log('📍 App.tsx rendered, currentPage:', currentPage);

  useEffect(() => {
    if (devPreviewPage) {
      console.log('🔧 Dev preview mode:', devPreviewPage);
      return;
    }
    
    const checkAuthAndRoute = async () => {
      console.log('🔐 Checking initial auth state...');
      
      try {
        const { session } = await auth.getSession();
        
        if (session?.user) {
          const adminCheck = session.user.email?.toLowerCase().endsWith('@hugoherbots.com') || false;
          setIsAdmin(adminCheck);
          
          if (adminCheck) {
            console.log('✅ Admin user logged in, route to admin-uploads');
            setCurrentPage("admin-uploads");
          } else {
            console.log('✅ Regular user logged in, route to hugo-overview');
            setCurrentPage("hugo-overview");
          }
        } else {
          console.log('❌ No session, route to landing');
          setCurrentPage("landing");
        }
      } catch (error) {
        console.error('❌ Error checking auth:', error);
        setCurrentPage("landing");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthAndRoute();
  }, []);

  const [navigationData, setNavigationData] = useState<Record<string, any> | undefined>(() => {
    if (devPreviewPage === 'analysis-results') {
      const params = new URLSearchParams(window.location.search);
      const cid = params.get('id');
      if (cid) return { conversationId: cid };
      return { autoLoadFirst: true };
    }
    return undefined;
  });

  const navigate = (page: Page | string, data?: Record<string, any>) => {
    console.log('🧭 Navigate called with:', page, data);
    
    if (page === "talk-to-hugo" || page.startsWith("talk-to-hugo")) {
      setCurrentPage("talk-to-hugo");
      setNavigationData(data);
      return;
    }
    
    setCurrentPage(page as Page);
    setNavigationData(data);
    window.scrollTo(0, 0);
  };

  return (
    <UserProvider>
    <NotificationProvider>
      {isCheckingAuth && (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-hh-ocean-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-hh-slate-600">HugoHerbots.ai laden...</p>
          </div>
        </div>
      )}

      {!isCheckingAuth && (
        <>
          {currentPage === "login" && (
            <Login
              onSignupClick={() => navigate("signup")}
              navigate={navigate}
            />
          )}

          {currentPage === "signup" && (
            <Signup
              onLoginClick={() => navigate("login")}
              onSignupSuccess={() => navigate("onboarding")}
              navigate={navigate}
            />
          )}

          {currentPage === "authcallback" && (
            <AuthCallback navigate={navigate} />
          )}

          {currentPage === "sso-validate" && (
            <SSOValidate navigate={navigate} />
          )}

          {currentPage === "landing" && <Landing navigate={navigate} />}
          {currentPage === "about" && <About navigate={navigate} />}
          {currentPage === "pricing" && <Pricing navigate={navigate} />}
          {currentPage === "onboarding" && <Onboarding navigate={navigate} />}

          {/* User View - Talk to Hugo AI */}
          {currentPage === "hugo-overview" && <HugoAIOverview navigate={navigate} isAdmin={isAdmin} />}
          {currentPage === "roleplay" && <HugoAIOverview navigate={navigate} isAdmin={isAdmin} />}
          {currentPage === "roleplays" && <HugoAIOverview navigate={navigate} isAdmin={isAdmin} />}
          {currentPage === "talk-to-hugo" && <TalkToHugoAI navigate={navigate} isAdmin={isAdmin} />}

          {/* User View - Gespreksanalyse */}
          {currentPage === "analysis" && <Analysis navigate={navigate} isAdmin={isAdmin} />}
          {currentPage === "analysis-results" && <AnalysisResults navigate={navigate} isAdmin={isAdmin} navigationData={navigationData} />}
          {currentPage === "upload-analysis" && <UploadAnalysis navigate={navigate} isAdmin={isAdmin} />}

          {/* Admin View - Gespreksanalyse */}
          {currentPage === "admin-uploads" && <AdminUploadManagement navigate={navigate} />}

          {/* Admin View - Talk to Hugo AI Sessions */}
          {currentPage === "admin-sessions" && <AdminSessions navigate={navigate} />}
          {currentPage === "admin-chat-expert" && (
            <AdminChatExpertMode 
              sessionId="demo-session-1" 
              sessionTitle="V2 Roleplay - Explore" 
              navigate={navigate} 
            />
          )}

          {/* Admin View - Config Review */}
          {currentPage === "admin-config-review" && <AdminConfigReview navigate={navigate} />}

          {/* Admin View - Notifications */}
          {currentPage === "admin-notifications" && <AdminNotifications navigate={navigate} />}

          {/* Admin View - RAG Review */}
          {currentPage === "admin-rag-review" && <AdminRAGReview navigate={navigate} currentPage={currentPage} />}
        </>
      )}
      <Toaster position="top-right" richColors />
    </NotificationProvider>
    </UserProvider>
  );
}
