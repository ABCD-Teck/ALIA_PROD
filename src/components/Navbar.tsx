import React from 'react';
import { Search, Globe, ChevronDown, Plus, Bell, Archive } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Breadcrumb } from './Breadcrumb';
import { PageType, Language, CustomerInsightsTab } from '../App';

interface NavbarProps {
  currentPage: PageType;
  language: Language;
  onLanguageChange: (language: Language) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPageChange: (page: PageType) => void;
  customerInsightsTab?: CustomerInsightsTab;
  onNewCustomer?: () => void;
  onNewOpportunity?: () => void;
  onNewInteraction?: () => void;
  onNewTask?: () => void;
  onNewEvent?: () => void;
  onNewContact?: () => void;
  onViewArchivedOpportunities?: () => void;
  onViewArchivedInteractions?: () => void;
  onViewArchivedTasks?: () => void;
}

const searchPlaceholders = {
  zh: {
    dashboard: '搜索客户、商机、任务...',
    'market-insights': '搜索热门资讯...',
    'customer-insights': '按姓名、行业、标签搜索...',
    opportunities: '按姓名、客户、销售代表、状态搜索...',
    'archived-opportunities': '搜索归档商机...',
    'create-opportunity': '搜索客户、产品、方案...',
    interactions: '按客户、日期、类型搜索...',
    'archived-interactions': '搜索归档互动记录...',
    'create-interaction': '搜索公司、客户、产品...',
    'interaction-detail': '搜索详情内容...',
    'task-manager': '按主题、状态、截止日期搜索...',
    'archived-tasks': '搜索归档任务...',
    'create-task': '搜索任务模板、负责人...',
    calendar: '按标题、日期、事件类型搜索...',
    'create-event': '搜索事件模板、参与者...',
    contacts: '按姓名、电话、邮箱、公司搜索...',
    'create-contact': '搜索联系人模板、公司...',
    settings: '搜索设置...',
    'data-flow': '在图表中搜索...',
    'visual-data-flow': '在可视化图表中搜索...'
  },
  en: {
    dashboard: 'Search customers, opportunities, tasks...',
    'market-insights': 'Search market insights...',
    'customer-insights': 'Search by name, industry, tags...',
    opportunities: 'Search by name, client, sales rep, status...',
    'archived-opportunities': 'Search archived opportunities...',
    'create-opportunity': 'Search customers, products, solutions...',
    interactions: 'Search by customer, date, type...',
    'archived-interactions': 'Search archived interactions...',
    'create-interaction': 'Search companies, customers, products...',
    'interaction-detail': 'Search detail content...',
    'task-manager': 'Search by subject, status, due date...',
    'archived-tasks': 'Search archived tasks...',
    'create-task': 'Search task templates, assignees...',
    calendar: 'Search by title, date, event type...',
    'create-event': 'Search event templates, attendees...',
    contacts: 'Search by name, phone, email, company...',
    'create-contact': 'Search contact templates, companies...',
    settings: 'Search settings...',
    'data-flow': 'Search in diagrams...',
    'visual-data-flow': 'Search in visual diagram...'
  }
};

export function Navbar({
  currentPage,
  language,
  onLanguageChange,
  searchQuery,
  onSearchChange,
  onPageChange,
  customerInsightsTab,
  onNewCustomer,
  onNewOpportunity,
  onViewArchivedOpportunities,
  onViewArchivedInteractions,
  onViewArchivedTasks,
  onNewInteraction,
  onNewTask,
  onNewEvent,
  onNewContact
}: NavbarProps) {
  const placeholder = searchPlaceholders[language][currentPage];
  // 模拟通知状态 - 实际项目中应该从props或context获取
  const hasNotifications = true;

  // 渲染页面特定的操作按钮
  const renderPageActions = () => {
    if (currentPage === 'customer-insights') {
      const buttonText = language === 'zh' ? '新建客户' : 'New Customer';
      return (
        <Button variant="teal" onClick={onNewCustomer}>
          <Plus className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      );
    } else if (currentPage === 'opportunities') {
      const newButtonText = language === 'zh' ? '新建商机' : 'New Opportunity';
      const archiveButtonText = language === 'zh' ? '归档' : 'Archive';
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onViewArchivedOpportunities}>
            <Archive className="mr-2 h-4 w-4" />
            {archiveButtonText}
          </Button>
          <Button variant="teal" onClick={onNewOpportunity}>
            <Plus className="mr-2 h-4 w-4" />
            {newButtonText}
          </Button>
        </div>
      );
    } else if (currentPage === 'interactions') {
      const newButtonText = language === 'zh' ? '新建互动' : 'New Interaction';
      const archiveButtonText = language === 'zh' ? '归档' : 'Archive';
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onViewArchivedInteractions}>
            <Archive className="mr-2 h-4 w-4" />
            {archiveButtonText}
          </Button>
          <Button variant="teal" onClick={onNewInteraction}>
            <Plus className="mr-2 h-4 w-4" />
            {newButtonText}
          </Button>
        </div>
      );
    } else if (currentPage === 'task-manager') {
      const newButtonText = language === 'zh' ? '新建任务' : 'New Task';
      const archiveButtonText = language === 'zh' ? '归档' : 'Archive';
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onViewArchivedTasks}>
            <Archive className="mr-2 h-4 w-4" />
            {archiveButtonText}
          </Button>
          <Button variant="teal" onClick={onNewTask}>
            <Plus className="mr-2 h-4 w-4" />
            {newButtonText}
          </Button>
        </div>
      );
    } else if (currentPage === 'calendar') {
      const buttonText = language === 'zh' ? '新建日程' : 'New Event';
      return (
        <Button variant="teal" onClick={onNewEvent}>
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
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

        <div className="flex items-center space-x-3 px-2 py-1.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/api/placeholder/32/32" alt="User Avatar" />
            <AvatarFallback>AN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm">Andrew</span>
            <span className="text-xs text-muted-foreground">
              {language === 'zh' ? '销售' : 'Sales'}
            </span>
          </div>
        </div>
      </div>
      </nav>
      
      <div className="px-6 flex items-center justify-between">
        <Breadcrumb 
          currentPage={currentPage} 
          language={language} 
          onNavigate={onPageChange}
          customerInsightsTab={customerInsightsTab}
        />
        {renderPageActions()}
      </div>
    </div>
  );
}