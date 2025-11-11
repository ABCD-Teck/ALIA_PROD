import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Globe, ChevronDown, Plus, Bell, Archive, User, Settings } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Breadcrumb } from './Breadcrumb';
import { Language } from '../App';
import { UserProfileEditDialog } from './UserProfileEditDialog';
import { customersApi } from '../services/api';

interface NavbarProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const searchPlaceholders = {
  zh: {
    '/': '搜索客户、商机、任务...',
    '/market-insights': '搜索热门资讯...',
    '/customer-insights': '按姓名、行业、标签搜索...',
    '/opportunities': '按姓名、客户、销售代表、状态搜索...',
    '/opportunities/archived': '搜索归档商机...',
    '/opportunities/create': '搜索客户、产品、方案...',
    '/interactions': '按客户、日期、类型搜索...',
    '/interactions/archived': '搜索归档互动记录...',
    '/interactions/create': '搜索公司、客户、产品...',
    '/tasks': '按主题、状态、截止日期搜索...',
    '/tasks/archived': '搜索归档任务...',
    '/tasks/create': '搜索任务模板、负责人...',
    '/calendar': '按标题、日期、事件类型搜索...',
    '/calendar/create': '搜索事件模板、参与者...',
    '/contacts': '按姓名、电话、邮箱、公司搜索...',
    '/contacts/create': '搜索联系人模板、公司...',
    '/settings': '搜索设置...',
  },
  en: {
    '/': 'Search customers, opportunities, tasks...',
    '/market-insights': 'Search market insights...',
    '/customer-insights': 'Search by name, industry, tags...',
    '/opportunities': 'Search by name, client, sales rep, status...',
    '/opportunities/archived': 'Search archived opportunities...',
    '/opportunities/create': 'Search customers, products, solutions...',
    '/interactions': 'Search by customer, date, type...',
    '/interactions/archived': 'Search archived interactions...',
    '/interactions/create': 'Search companies, customers, products...',
    '/tasks': 'Search by subject, status, due date...',
    '/tasks/archived': 'Search archived tasks...',
    '/tasks/create': 'Search task templates, assignees...',
    '/calendar': 'Search by title, date, event type...',
    '/calendar/create': 'Search event templates, attendees...',
    '/contacts': 'Search by name, phone, email, company...',
    '/contacts/create': 'Search contact templates, companies...',
    '/settings': 'Search settings...',
  }
};

interface UserData {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export function Navbar({
  language,
  onLanguageChange,
  searchQuery,
  onSearchChange
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Autocomplete states for interactions page
  const [customerSuggestions, setCustomerSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load user data from localStorage
  useEffect(() => {
    loadUserData();
  }, []);

  // Fetch customer suggestions for interactions page
  useEffect(() => {
    if (location.pathname === '/interactions') {
      fetchCustomerSuggestions();
    } else {
      setCustomerSuggestions([]);
      setShowSuggestions(false);
    }
  }, [location.pathname]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUserData = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user: UserData = JSON.parse(userStr);
        setUserData(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  };

  const fetchCustomerSuggestions = async () => {
    try {
      const response = await customersApi.getAll({ limit: 1000 });
      if (response.data?.customers) {
        const uniqueNames = [...new Set(response.data.customers.map((c: any) => c.company_name))].filter(Boolean);
        setCustomerSuggestions(uniqueNames as string[]);
      }
    } catch (error) {
      console.error('Error fetching customer suggestions:', error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData) return 'U';
    const firstInitial = userData.first_name?.charAt(0)?.toUpperCase() || '';
    const lastInitial = userData.last_name?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}` || 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!userData) return 'User';
    return `${userData.first_name} ${userData.last_name}`.trim() || userData.email;
  };

  // Get user role display
  const getUserRole = () => {
    if (!userData || !userData.role) return language === 'zh' ? '用户' : 'User';

    const roleMap: Record<string, { zh: string; en: string }> = {
      admin: { zh: '管理员', en: 'Admin' },
      user: { zh: '用户', en: 'User' },
      sales: { zh: '销售', en: 'Sales' },
      manager: { zh: '经理', en: 'Manager' },
    };

    return roleMap[userData.role]?.[language] || userData.role;
  };

  // Filter suggestions based on search query
  const getFilteredSuggestions = () => {
    if (!searchQuery || location.pathname !== '/interactions') {
      return [];
    }
    return customerSuggestions.filter(name =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10); // Limit to 10 suggestions
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  // Handle keyboard navigation in suggestions
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    const filteredSuggestions = getFilteredSuggestions();

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && activeSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(filteredSuggestions[activeSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    if (location.pathname === '/interactions' && value.length > 0) {
      setShowSuggestions(true);
      setActiveSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  };

  // Get the most specific matching placeholder
  const getPlaceholder = () => {
    const path = location.pathname;
    const placeholders = searchPlaceholders[language];

    // Try exact match first
    if (placeholders[path]) {
      return placeholders[path];
    }

    // Try partial matches for detail pages
    for (const key in placeholders) {
      if (path.startsWith(key) && key !== '/') {
        return placeholders[key];
      }
    }

    // Default to dashboard placeholder
    return placeholders['/'];
  };

  const placeholder = getPlaceholder();
  const hasNotifications = true;

  // 渲染页面特定的操作按钮
  const renderPageActions = () => {
    const path = location.pathname;

    if (path.startsWith('/customer-insights')) {
      const buttonText = language === 'zh' ? '新建客户' : 'New Customer';
      return (
        <Button variant="teal" onClick={() => navigate('/customers/create')}>
          <Plus className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      );
    } else if (path === '/opportunities') {
      const newButtonText = language === 'zh' ? '新建商机' : 'New Opportunity';
      const archiveButtonText = language === 'zh' ? '归档' : 'Archive';
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/opportunities/archived')}>
            <Archive className="mr-2 h-4 w-4" />
            {archiveButtonText}
          </Button>
          <Button variant="teal" onClick={() => navigate('/opportunities/create')}>
            <Plus className="mr-2 h-4 w-4" />
            {newButtonText}
          </Button>
        </div>
      );
    } else if (path === '/interactions') {
      const newButtonText = language === 'zh' ? '新建互动' : 'New Interaction';
      const archiveButtonText = language === 'zh' ? '归档' : 'Archive';
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/interactions/archived')}>
            <Archive className="mr-2 h-4 w-4" />
            {archiveButtonText}
          </Button>
          <Button variant="teal" onClick={() => navigate('/interactions/create')}>
            <Plus className="mr-2 h-4 w-4" />
            {newButtonText}
          </Button>
        </div>
      );
    } else if (path === '/tasks') {
      const newButtonText = language === 'zh' ? '新建任务' : 'New Task';
      const archiveButtonText = language === 'zh' ? '归档' : 'Archive';
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/tasks/archived')}>
            <Archive className="mr-2 h-4 w-4" />
            {archiveButtonText}
          </Button>
          <Button variant="teal" onClick={() => navigate('/tasks/create')}>
            <Plus className="mr-2 h-4 w-4" />
            {newButtonText}
          </Button>
        </div>
      );
    } else if (path === '/calendar') {
      const buttonText = language === 'zh' ? '新建日程' : 'New Event';
      return (
        <Button variant="teal" onClick={() => navigate('/calendar/create')}>
          <Plus className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="bg-background border-b border-border">
      <nav className="h-16 px-6 flex items-center justify-between">
      <div className="flex-1 max-w-md">
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => {
              if (location.pathname === '/interactions' && searchQuery.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="pl-10"
          />

          {/* Autocomplete dropdown for interactions page */}
          {showSuggestions && location.pathname === '/interactions' && getFilteredSuggestions().length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {getFilteredSuggestions().map((suggestion, index) => (
                <div
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-4 py-2 cursor-pointer hover:bg-teal-50 transition-colors ${
                    index === activeSuggestionIndex ? 'bg-teal-100' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <Search className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="px-2 relative">
          <div className="relative">
            <Bell className="h-5 w-5" />
            {/* Notification dot - 只在有通知时显示 */}
            {hasNotifications && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#009699] rounded-full border-2 border-background shadow-sm animate-pulse"></div>
            )}
          </div>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Globe className="h-5 w-5" />
              <span>{language === 'zh' ? '中文' : 'English'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            {language === 'zh' ? (
              <>
                <DropdownMenuItem onClick={() => onLanguageChange('zh')} className="justify-center">
                  中文
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLanguageChange('en')} className="justify-center">
                  英文
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => onLanguageChange('zh')} className="justify-center">
                  Chinese
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLanguageChange('en')} className="justify-center">
                  English
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-3 px-2 py-1.5 h-auto hover:bg-accent"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{getUserDisplayName()}</span>
                <span className="text-xs text-muted-foreground">
                  {getUserRole()}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => setIsProfileDialogOpen(true)}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              {language === 'zh' ? '编辑个人信息' : 'Edit Profile'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/settings')}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              {language === 'zh' ? '设置' : 'Settings'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </nav>
      
      <div className="px-6 flex items-center justify-between">
        <Breadcrumb
          language={language}
        />
        {renderPageActions()}
      </div>

      <UserProfileEditDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        language={language}
        onProfileUpdate={loadUserData}
      />
    </div>
  );
}