import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  ArrowDown, 
  ArrowRight, 
  ArrowUpDown,
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  MessageSquare, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Phone, 
  Settings as SettingsIcon,
  Search,
  User,
  Globe,
  LogOut,
  Network
} from 'lucide-react';
import { Language } from '../../App';

interface VisualDataFlowDiagramProps {
  searchQuery: string;
  language: Language;
}

export function VisualDataFlowDiagram({ searchQuery, language }: VisualDataFlowDiagramProps) {
  const content = {
    zh: {
      title: 'CRM数据流程图',
      mainContainer: '主容器',
      moduleAccess: '模块访问',
      searchUserControl: '搜索和用户控制',
      contentRendering: '模块内容渲染',
      integrationFlow: '集成流程',
      contextualSearch: '上下文搜索规则',
      userInfo: '用户信息',
      languageSwitch: '语言切换',
      bidirectionalData: '双向数据链接'
    },
    en: {
      title: 'CRM Data Flow Diagram',
      mainContainer: 'Main Container',
      moduleAccess: 'Module Access',
      searchUserControl: 'Search & User Control',
      contentRendering: 'Module Content Rendering',
      integrationFlow: 'Integration Flow', 
      contextualSearch: 'Contextual Search Rules',
      userInfo: 'User Info',
      languageSwitch: 'Language Switch',
      bidirectionalData: 'Bi-directional Data Links'
    }
  };

  const t = content[language];

  const sidebarModules = [
    { icon: BarChart3, name: 'Dashboard' },
    { icon: TrendingUp, name: 'Market Insights' },
    { icon: Users, name: 'Customer Insights' },
    { icon: Target, name: 'Opportunities' },
    { icon: MessageSquare, name: 'Interactions' },
    { icon: CheckSquare, name: 'Task Manager' },
    { icon: CalendarIcon, name: 'Calendar' },
    { icon: Phone, name: 'Contacts' },
    { icon: SettingsIcon, name: 'Settings' },
    { icon: LogOut, name: 'Sign Out' }
  ];

  const searchRules = [
    { module: 'Dashboard', rule: 'search by KPI, customer' },
    { module: 'Customer Insights', rule: 'search by name, industry, tag' },
    { module: 'Opportunities', rule: 'search by name, customer, sales owner, status' },
    { module: 'Interactions', rule: 'search by customer, date, type' },
    { module: 'Task Manager', rule: 'search by subject, status, due date' },
    { module: 'Calendar', rule: 'search by title, date, type' },
    { module: 'Contacts', rule: 'search by last name, first name, phone, email, company, role' }
  ];

  const pageRouterModules = [
    {
      name: 'Dashboard',
      submodules: ['KPI Overview', 'Customer List', 'Industry Distribution']
    },
    {
      name: 'Market Insights',
      submodules: ['Market Analysis', 'Competitor Data', 'Trends']
    },
    {
      name: 'Customer Insights',
      submodules: ['Overview', 'Finance', 'Interactions', 'News', 'Documents']
    },
    {
      name: 'Opportunities',
      submodules: ['List', 'Create', 'Status', 'Action Plan']
    },
    {
      name: 'Interactions',
      submodules: ['Visits', 'Events', 'Calls', 'Emails']
    },
    {
      name: 'Task Manager',
      submodules: ['Task List', 'Task Overview', 'Task Details']
    },
    {
      name: 'Calendar',
      submodules: ['Calendar View', 'Event Display', 'Event Details']
    },
    {
      name: 'Contacts',
      submodules: ['Contact List', 'Create Contact', 'Import/Export']
    },
    {
      name: 'Settings',
      submodules: ['User Profile', 'Preferences', 'Security']
    }
  ];

  const integrationModules = ['Contacts', 'Opportunities', 'Interactions', 'Tasks', 'Calendar'];

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-center mb-8">{t.title}</h1>
      
      {/* Main Container - App.tsx */}
      <div className="flex flex-col items-center space-y-6">
        <Card className="w-full max-w-2xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">App.tsx</CardTitle>
            <p className="text-muted-foreground">{t.mainContainer}</p>
            <div className="flex justify-center space-x-2 mt-4">
              <Badge variant="outline">currentPage: PageType</Badge>
              <Badge variant="outline">language: Language</Badge>
              <Badge variant="outline">searchQuery: string</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Arrows from App.tsx */}
        <div className="flex justify-center space-x-8">
          <ArrowDown className="h-8 w-8 text-gray-400" />
          <ArrowDown className="h-8 w-8 text-gray-400" />
          <ArrowDown className="h-8 w-8 text-gray-400" />
        </div>

        {/* Three main sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          
          {/* Sidebar - Blue */}
          <Card className="bg-gradient-to-b from-blue-50 to-blue-100 border-2 border-blue-300">
            <CardHeader className="text-center">
              <CardTitle className="text-blue-800">Sidebar</CardTitle>
              <p className="text-sm text-blue-600">Navigation & Page Control</p>
              <Badge className="bg-blue-200 text-blue-800 mx-auto">{t.moduleAccess}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {sidebarModules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-white/50 rounded">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{module.name}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Navbar - Green */}
          <Card className="bg-gradient-to-b from-green-50 to-green-100 border-2 border-green-300">
            <CardHeader className="text-center">
              <CardTitle className="text-green-800">Navbar</CardTitle>
              <p className="text-sm text-green-600">Search & User Control</p>
              <Badge className="bg-green-200 text-green-800 mx-auto">{t.searchUserControl}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="bg-white/70 p-3 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <Search className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">Search Bar</span>
                </div>
                <div className="text-xs text-green-700">
                  <p className="font-medium mb-1">{t.contextualSearch}:</p>
                  {searchRules.slice(0, 3).map((rule, index) => (
                    <div key={index} className="mb-1">
                      <strong>{rule.module}:</strong> {rule.rule}
                    </div>
                  ))}
                  <div className="text-green-600">... and 4 more modules</div>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-white/70 p-3 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">{t.userInfo}</span>
                </div>
                <div className="text-xs text-green-700">
                  Avatar + Username + Role
                </div>
              </div>

              {/* Language Switch */}
              <div className="bg-white/70 p-3 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">{t.languageSwitch}</span>
                </div>
                <div className="text-xs text-green-700">
                  {language === 'zh' ? '中文/英文切换' : 'Chinese/English Toggle'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Page Router - Violet */}
          <Card className="bg-gradient-to-b from-violet-50 to-violet-100 border-2 border-violet-300">
            <CardHeader className="text-center">
              <CardTitle className="text-violet-800">Page Router</CardTitle>
              <p className="text-sm text-violet-600">Content Rendering</p>
              <Badge className="bg-violet-200 text-violet-800 mx-auto">{t.contentRendering}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {pageRouterModules.slice(0, 6).map((module, index) => (
                <div key={index} className="bg-white/70 p-2 rounded">
                  <div className="font-medium text-sm text-violet-800">{module.name}</div>
                  <div className="text-xs text-violet-600 mt-1">
                    {module.submodules.join(' • ')}
                  </div>
                </div>
              ))}
              <div className="text-center text-violet-600 text-sm">... and 3 more modules</div>
            </CardContent>
          </Card>
        </div>

        {/* Arrows pointing to Page Router */}
        <div className="flex justify-center items-center space-x-4 w-full">
          <div className="flex-1 flex justify-end">
            <ArrowRight className="h-6 w-6 text-blue-400 transform rotate-12" />
          </div>
          <div className="flex justify-center">
            <ArrowDown className="h-6 w-6 text-green-400" />
          </div>
          <div className="flex-1 flex justify-start">
            <ArrowRight className="h-6 w-6 text-violet-400 transform rotate-180 -rotate-12" />
          </div>
        </div>
      </div>

      {/* Integration Flow - Bottom */}
      <Card className="mt-12 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300">
        <CardHeader className="text-center">
          <CardTitle className="text-orange-800">{t.integrationFlow}</CardTitle>
          <p className="text-sm text-orange-600">{t.bidirectionalData}</p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center space-x-4 flex-wrap">
            {integrationModules.map((module, index) => (
              <React.Fragment key={module}>
                <div className="bg-white p-3 rounded-lg border-2 border-orange-200 shadow-sm">
                  <span className="text-sm font-medium text-orange-800">{module}</span>
                </div>
                {index < integrationModules.length - 1 && (
                  <ArrowUpDown className="h-5 w-5 text-orange-500" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center mt-4">
            <Badge className="bg-orange-200 text-orange-800">
              Bi-directional data synchronization
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Complete Search Rules Reference */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300">
        <CardHeader>
          <CardTitle className="text-indigo-800">{t.contextualSearch} - Complete Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchRules.map((rule, index) => (
              <div key={index} className="bg-white/70 p-3 rounded">
                <div className="font-medium text-indigo-800">{rule.module}</div>
                <div className="text-sm text-indigo-600 mt-1">{rule.rule}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}