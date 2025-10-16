import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/pages/Dashboard';
import { MarketInsights } from './components/pages/MarketInsights';
import { CustomerInsights } from './components/pages/CustomerInsights';
import { Opportunities } from './components/pages/Opportunities';
import { Interactions } from './components/pages/Interactions';
import { InteractionDetail } from './components/pages/InteractionDetail';
import { TaskManager } from './components/pages/TaskManager';
import { Calendar } from './components/pages/Calendar';
import { Contacts } from './components/pages/Contacts';
import { Settings } from './components/pages/Settings';
import { CreateOpportunity } from './components/pages/CreateOpportunity';
import { CreateInteraction } from './components/pages/CreateInteraction';
import { CreateTask } from './components/pages/CreateTask';
import { CreateContact } from './components/pages/CreateContact';
import { CreateCustomer } from './components/pages/CreateCustomer';
import { CreateEvent } from './components/pages/CreateEvent';
import { ContactDetail } from './components/pages/ContactDetail';
import { NewContactModal } from './components/NewContactModal';
import { LandingPage } from './components/auth/LandingPage';
import { SignInPage } from './components/auth/SignInPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { authApi, clearTokens, getAccessToken } from './services/api';



export type Language = 'zh' | 'en';

export type PageType = 
  | 'dashboard' 
  | 'market-insights' 
  | 'customer-insights' 
  | 'opportunities' 
  | 'create-opportunity'
  | 'interactions' 
  | 'create-interaction'
  | 'interaction-detail'
  | 'task-manager'
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentAuthPage, setCurrentAuthPage] = useState<AuthPage>('landing');
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [language, setLanguage] = useState<Language>('zh');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [customerInsightsTab, setCustomerInsightsTab] = useState<CustomerInsightsTab>('documents');
  const [selectedInteractionId, setSelectedInteractionId] = useState<string | undefined>();
  const [selectedContactId, setSelectedContactId] = useState<number | undefined>();
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);

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
    setCurrentPage('dashboard');
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleSignOut = () => {
    authApi.logout(); // This clears tokens
    localStorage.removeItem('user'); // Clear user data
    setIsAuthenticated(false);
    setCurrentAuthPage('landing');
    setCurrentPage('dashboard');
    setSearchQuery('');
    setCustomerInsightsTab('overview');
    setSelectedInteractionId(undefined);
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

  // 当切换到非客户洞察页面时，重置标签页状态
  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
    if (page !== 'customer-insights') {
      setCustomerInsightsTab('overview');
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard searchQuery={searchQuery} language={language} onPageChange={handlePageChange} />;
      case 'market-insights':
        return <MarketInsights searchQuery={searchQuery} language={language} />;
      case 'customer-insights':
        return <CustomerInsights 
          searchQuery={searchQuery} 
          language={language} 
          currentTab={customerInsightsTab}
          onTabChange={setCustomerInsightsTab}
        />;
      case 'opportunities':
        return <Opportunities searchQuery={searchQuery} language={language} />;
      case 'create-opportunity':
        return <CreateOpportunity language={language} onNavigateBack={setCurrentPage} />;
      case 'interactions':
        return <Interactions 
          searchQuery={searchQuery} 
          language={language} 
          onViewDetails={(id) => {
            setSelectedInteractionId(id);
            setCurrentPage('interaction-detail');
          }}
        />;
      case 'create-interaction':
        return <CreateInteraction language={language} onNavigateBack={setCurrentPage} />;
      case 'interaction-detail':
        return <InteractionDetail 
          searchQuery={searchQuery} 
          language={language} 
          onNavigateBack={setCurrentPage}
          interactionId={selectedInteractionId}
        />;
      case 'task-manager':
        return <TaskManager searchQuery={searchQuery} language={language} />;
      case 'create-task':
        return <CreateTask language={language} onNavigateBack={setCurrentPage} />;
      case 'calendar':
        return <Calendar searchQuery={searchQuery} language={language} />;
      case 'create-event':
        return <CreateEvent language={language} onNavigateBack={setCurrentPage} />;
      case 'contacts':
        return <Contacts 
          searchQuery={searchQuery} 
          language={language} 
          onNewContact={() => setCurrentPage('create-contact')}
          onViewContact={(contactId) => {
            setSelectedContactId(contactId);
            setCurrentPage('contact-detail');
          }}
        />;
      case 'create-contact':
        return <CreateContact language={language} onNavigateBack={setCurrentPage} />;
      case 'create-customer':
        return <CreateCustomer language={language} onNavigateBack={setCurrentPage} />;
      case 'contact-detail':
        return <ContactDetail 
          searchQuery={searchQuery} 
          language={language} 
          onNavigateBack={setCurrentPage}
          contactId={selectedContactId}
        />;
      case 'settings':
        return <Settings searchQuery={searchQuery} language={language} />;
      default:
        return <Dashboard searchQuery={searchQuery} language={language} />;
    }
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
    <div className="h-screen flex bg-background">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
        language={language}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSignOut={handleSignOut}
      />
      <div className="flex-1 flex flex-col">
        <Navbar 
          currentPage={currentPage}
          language={language}
          onLanguageChange={setLanguage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onPageChange={handlePageChange}
          customerInsightsTab={customerInsightsTab}
          onNewCustomer={() => setCurrentPage('create-customer')}
          onNewOpportunity={() => setCurrentPage('create-opportunity')}
          onNewInteraction={() => setCurrentPage('create-interaction')}
          onNewTask={() => setCurrentPage('create-task')}
          onNewEvent={() => setCurrentPage('create-event')}
          onNewContact={() => setCurrentPage('create-contact')}
        />
        <main className="flex-1 overflow-auto px-6 pb-6">
          {renderCurrentPage()}
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