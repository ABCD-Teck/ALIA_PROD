import React, { useState, useEffect } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { NewContactModal } from './components/NewContactModal';
import { LandingPage } from './components/auth/LandingPage';
import { SignInPage } from './components/auth/SignInPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { authApi, clearTokens, getAccessToken } from './services/api';
import { AppRoutes } from './router';
import { Toaster } from './components/ui/sonner';



export type Language = 'zh' | 'en';

export type PageType =
  | 'dashboard'
  | 'market-insights'
  | 'customer-insights'
  | 'opportunities'
  | 'archived-opportunities'
  | 'create-opportunity'
  | 'opportunity-detail'
  | 'interactions'
  | 'archived-interactions'
  | 'create-interaction'
  | 'interaction-detail'
  | 'task-manager'
  | 'archived-tasks'
  | 'task-detail'
  | 'create-task'
  | 'calendar'
  | 'create-event'
  | 'contacts'
  | 'create-contact'
  | 'create-customer'
  | 'contact-detail'
  | 'settings';

export type CustomerInsightsTab = 'overview' | 'financial' | 'interaction' | 'news' | 'documents';

export type AuthPage = 'landing' | 'signin' | 'signup';

// Component that uses router hooks (must be inside BrowserRouter)
function AuthenticatedApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState<Language>('zh');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);

  const handleSignOut = () => {
    authApi.logout();
    localStorage.removeItem('user');
    setSearchQuery('');
    window.location.href = '/'; // Force reload to landing page
  };

  return (
    <div className="h-screen flex bg-background">
      <Sidebar
        language={language}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSignOut={handleSignOut}
      />
      <div className="flex-1 flex flex-col">
        <Navbar
          language={language}
          onLanguageChange={setLanguage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="flex-1 overflow-auto px-6 pb-6">
          <AppRoutes searchQuery={searchQuery} language={language} />
        </main>
      </div>

      <NewContactModal
        isOpen={isNewContactModalOpen}
        onClose={() => setIsNewContactModalOpen(false)}
        language={language}
      />
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentAuthPage, setCurrentAuthPage] = useState<AuthPage>('landing');
  const [language, setLanguage] = useState<Language>('zh');

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const response = await authApi.me();
          if (response.data && !response.error) {
            setIsAuthenticated(true);
          } else {
            clearTokens();
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          clearTokens();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    };

    checkAuth();
  }, []);

  // Authentication handlers
  const handleSignIn = () => {
    setIsAuthenticated(true);
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
  };

  const handleBackToLanding = () => {
    setCurrentAuthPage('landing');
  };

  const handleSignInRedirect = () => {
    setCurrentAuthPage('signin');
  };

  const handleSignUpRedirect = () => {
    setCurrentAuthPage('signup');
  };

  // Show loading screen while checking authentication
  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="alia-logo text-4xl mb-4">
            <span className="text-[#009699]">A</span>
            <span className="text-black">lia</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009699] mx-auto"></div>
        </div>
      </div>
    );
  }

  // Render authentication pages if not authenticated
  if (!isAuthenticated) {
    switch (currentAuthPage) {
      case 'landing':
        return (
          <LandingPage
            language={language}
            onSignUp={handleSignUpRedirect}
            onSignIn={handleSignInRedirect}
            onLanguageChange={setLanguage}
          />
        );
      case 'signin':
        return (
          <SignInPage
            language={language}
            onSignIn={handleSignIn}
            onBackToLanding={handleBackToLanding}
            onSignUp={handleSignUpRedirect}
            onLanguageChange={setLanguage}
          />
        );
      case 'signup':
        return (
          <SignUpPage
            language={language}
            onSignUp={handleSignUp}
            onBackToLanding={handleBackToLanding}
            onSignIn={handleSignInRedirect}
            onLanguageChange={setLanguage}
          />
        );
      default:
        return (
          <LandingPage
            language={language}
            onSignUp={handleSignUpRedirect}
            onSignIn={handleSignInRedirect}
            onLanguageChange={setLanguage}
          />
        );
    }
  }

  // Render main application if authenticated
  return (
    <BrowserRouter>
      <AuthenticatedApp />
      <Toaster />
    </BrowserRouter>
  );
}