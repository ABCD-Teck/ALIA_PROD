import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  MessageSquare,
  CheckSquare,
  Calendar as CalendarIcon,
  Phone,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Language } from '../App';

interface SidebarProps {
  language: Language;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSignOut?: () => void;
}

const menuItems = {
  zh: [
    { path: '/', icon: BarChart3, label: '主页' },
    { path: '/market-insights', icon: TrendingUp, label: '市场洞察' },
    { path: '/customer-insights', icon: Users, label: '客户洞察' },
    { path: '/opportunities', icon: Target, label: '商机管理' },
    { path: '/interactions', icon: MessageSquare, label: '客户互动' },
    { path: '/tasks', icon: CheckSquare, label: '任务管理' },
    { path: '/calendar', icon: CalendarIcon, label: '日程安排' },
    { path: '/contacts', icon: Phone, label: '联系人' },
    { path: '/settings', icon: SettingsIcon, label: '设置' },
  ],
  en: [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/market-insights', icon: TrendingUp, label: 'Market Insights' },
    { path: '/customer-insights', icon: Users, label: 'Customer Insights' },
    { path: '/opportunities', icon: Target, label: 'Opportunities' },
    { path: '/interactions', icon: MessageSquare, label: 'Customer Interactions' },
    { path: '/tasks', icon: CheckSquare, label: 'Task Manager' },
    { path: '/calendar', icon: CalendarIcon, label: 'Calendar' },
    { path: '/contacts', icon: Phone, label: 'Contacts' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ]
};

export function Sidebar({ language, collapsed, onToggleCollapse, onSignOut }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = menuItems[language];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 relative`}>
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 z-10 bg-white border border-gray-200 rounded-full p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-50"
        style={{ color: '#636060' }}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Header */}
      <div className={`${collapsed ? 'p-3 flex justify-center' : 'py-6 px-6 flex justify-start'}`}>
        {!collapsed ? (
          <h1 className="alia-logo" style={{ marginLeft: '12px' }}>
            <span style={{ color: '#009699' }}>A</span>
            <span style={{ color: '#000000' }}>lia</span>
          </h1>
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#009699' }}>
            <span className="text-white font-bold text-sm">A</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-6'} space-y-1`}>
        {items.map((item) => {
          const Icon = item.icon;
          const itemIsActive = isActive(item.path);

          return (
            <div key={item.path} className="relative group">
              <Button
                variant="ghost"
                className={`w-full ${collapsed ? 'justify-center px-0' : 'justify-start'} h-10 transition-all duration-200 ${
                  itemIsActive
                    ? 'hover:opacity-80'
                    : 'hover:bg-gray-100'
                }`}
                style={itemIsActive ? {
                  backgroundColor: 'rgba(204, 255, 255, 0.6)',
                  color: '#636060',
                  borderRadius: '10px'
                } : { color: '#636060' }}
                onClick={() => navigate(item.path)}
              >
                <Icon className={`h-4 w-4 ${!collapsed ? 'mr-3' : ''}`} />
                {!collapsed && <span className="sidebar-menu-text">{item.label}</span>}
              </Button>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 whitespace-nowrap pointer-events-none">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className={`${collapsed ? 'p-2' : 'px-6 py-4'}`}>
        {!collapsed && <Separator className="mb-4" />}
        <div className="relative group">
          <Button 
            variant="ghost" 
            className={`w-full ${collapsed ? 'justify-center px-0' : 'justify-start'} h-10 transition-all duration-200 hover:bg-gray-100`}
            style={{ color: '#636060' }}
            onClick={onSignOut}
          >
            <LogOut className={`h-4 w-4 ${!collapsed ? 'mr-3' : ''}`} />
            {!collapsed && <span className="sidebar-menu-text">{language === 'zh' ? '退出登录' : 'Sign Out'}</span>}
          </Button>
          
          {/* Tooltip for collapsed state */}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 whitespace-nowrap pointer-events-none">
{language === 'zh' ? '退出登录' : 'Sign Out'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}