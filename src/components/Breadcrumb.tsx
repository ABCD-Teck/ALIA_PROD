import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Language } from '../App';

interface BreadcrumbProps {
  language: Language;
}

interface BreadcrumbItem {
  path: string;
  label: { zh: string; en: string };
  isClickable: boolean;
}

const pathLabels: Record<string, { zh: string; en: string; parent?: string }> = {
  '/': { zh: '主页', en: 'Home' },
  '/market-insights': { zh: '市场洞察', en: 'Market Insights', parent: '/' },
  '/customer-insights': { zh: '客户洞察', en: 'Customer Insights', parent: '/' },
  '/opportunities': { zh: '商机管理', en: 'Opportunities', parent: '/' },
  '/opportunities/create': { zh: '新建商机', en: 'Create Opportunity', parent: '/opportunities' },
  '/opportunities/archived': { zh: '归档商机', en: 'Archived Opportunities', parent: '/opportunities' },
  '/interactions': { zh: '客户互动', en: 'Customer Interactions', parent: '/' },
  '/interactions/create': { zh: '新建互动', en: 'Create Interaction', parent: '/interactions' },
  '/interactions/archived': { zh: '归档互动', en: 'Archived Interactions', parent: '/interactions' },
  '/tasks': { zh: '任务管理', en: 'Task Manager', parent: '/' },
  '/tasks/create': { zh: '新建任务', en: 'Create Task', parent: '/tasks' },
  '/tasks/archived': { zh: '归档任务', en: 'Archived Tasks', parent: '/tasks' },
  '/calendar': { zh: '日历', en: 'Calendar', parent: '/' },
  '/calendar/create': { zh: '新建日程', en: 'Create Event', parent: '/calendar' },
  '/contacts': { zh: '联系人', en: 'Contacts', parent: '/' },
  '/contacts/create': { zh: '新建联系人', en: 'Create Contact', parent: '/contacts' },
  '/customers/create': { zh: '新建客户', en: 'Create Customer', parent: '/customer-insights' },
  '/settings': { zh: '设置', en: 'Settings', parent: '/' },
};

const tabLabels: Record<string, { zh: string; en: string }> = {
  'overview': { zh: '概况', en: 'Overview' },
  'financial': { zh: '财务', en: 'Financial' },
  'interaction': { zh: '互动', en: 'Interaction' },
  'news': { zh: '新闻', en: 'News' },
  'documents': { zh: '文档', en: 'Documents' }
};

export function Breadcrumb({ language }: BreadcrumbProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const buildBreadcrumbPath = (): BreadcrumbItem[] => {
    const path = location.pathname;
    const breadcrumbs: BreadcrumbItem[] = [];

    // Handle detail pages with IDs
    let matchedPath = path;
    for (const key in pathLabels) {
      if (path === key) {
        matchedPath = key;
        break;
      }
      // Check if this path is a parent of the current path
      if (path.startsWith(key + '/') && key !== '/') {
        matchedPath = key;
      }
    }

    // Build breadcrumb hierarchy
    let currentPath = matchedPath;
    const pathChain: string[] = [];

    // Build the chain
    while (currentPath && pathLabels[currentPath]) {
      pathChain.unshift(currentPath);
      currentPath = pathLabels[currentPath].parent || '';
    }

    // Convert to breadcrumb items
    pathChain.forEach((p, index) => {
      breadcrumbs.push({
        path: p,
        label: pathLabels[p],
        isClickable: index !== pathChain.length - 1
      });
    });

    // Handle detail pages (with IDs in URL)
    if (path.match(/^\/opportunities\/[^/]+$/) && !path.includes('/create') && !path.includes('/archived')) {
      breadcrumbs.push({
        path: path,
        label: { zh: '商机详情', en: 'Opportunity Details' },
        isClickable: false
      });
    } else if (path.match(/^\/interactions\/[^/]+$/) && !path.includes('/create') && !path.includes('/archived')) {
      breadcrumbs.push({
        path: path,
        label: { zh: '互动详情', en: 'Interaction Details' },
        isClickable: false
      });
    } else if (path.match(/^\/tasks\/\d+$/)) {
      breadcrumbs.push({
        path: path,
        label: { zh: '任务详情', en: 'Task Details' },
        isClickable: false
      });
    } else if (path.match(/^\/contacts\/\d+$/)) {
      breadcrumbs.push({
        path: path,
        label: { zh: '联系人详情', en: 'Contact Details' },
        isClickable: false
      });
    }

    // Handle customer insights with customer ID and/or tab
    if (path.startsWith('/customer-insights')) {
      const { customerId, tab } = params;

      // If not already added, ensure customer insights is in the breadcrumb
      if (breadcrumbs.length === 0 || breadcrumbs[breadcrumbs.length - 1].path !== '/customer-insights') {
        breadcrumbs.push({
          path: '/customer-insights',
          label: pathLabels['/customer-insights'],
          isClickable: false
        });
      }

      // Add tab if present
      if (tab && tabLabels[tab]) {
        breadcrumbs.push({
          path: path,
          label: tabLabels[tab],
          isClickable: false
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbPath = buildBreadcrumbPath();

  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground py-4">
      {breadcrumbPath.map((item, index) => (
        <React.Fragment key={item.path + index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <button
            onClick={() => {
              if (item.isClickable) {
                navigate(item.path);
              }
            }}
            className={`hover:text-foreground transition-colors ${
              !item.isClickable
                ? 'text-foreground cursor-default'
                : 'cursor-pointer'
            }`}
            disabled={!item.isClickable}
          >
            {item.label[language]}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
