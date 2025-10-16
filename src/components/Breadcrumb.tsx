import React from 'react';
import { ChevronRight } from 'lucide-react';
import { PageType, Language, CustomerInsightsTab } from '../App';

interface BreadcrumbProps {
  currentPage: PageType;
  language: Language;
  onNavigate: (page: PageType) => void;
  customerInsightsTab?: CustomerInsightsTab;
}

interface BreadcrumbItem {
  key: PageType | CustomerInsightsTab;
  label: { zh: string; en: string };
  parent?: PageType;
  isSubPage?: boolean;
}

const pageHierarchy: Record<PageType, BreadcrumbItem> = {
  'dashboard': {
    key: 'dashboard',
    label: { zh: '主页', en: 'Home' }
  },
  'market-insights': {
    key: 'market-insights',
    label: { zh: '市场洞察', en: 'Market Insights' },
    parent: 'dashboard'
  },
  'customer-insights': {
    key: 'customer-insights',
    label: { zh: '客户洞察', en: 'Customer Insights' },
    parent: 'dashboard'
  },
  'opportunities': {
    key: 'opportunities',
    label: { zh: '商机管理', en: 'Opportunities' },
    parent: 'dashboard'
  },
  'create-opportunity': {
    key: 'create-opportunity',
    label: { zh: '新建商机', en: 'Create Opportunity' },
    parent: 'opportunities'
  },
  'interactions': {
    key: 'interactions',
    label: { zh: '客户互动', en: 'Customer Interactions' },
    parent: 'dashboard'
  },
  'create-interaction': {
    key: 'create-interaction',
    label: { zh: '新建互动', en: 'Create Interaction' },
    parent: 'interactions'
  },
  'interaction-detail': {
    key: 'interaction-detail',
    label: { zh: '互动详情', en: 'Interaction Details' },
    parent: 'interactions'
  },
  'task-manager': {
    key: 'task-manager',
    label: { zh: '任务管理', en: 'Task Manager' },
    parent: 'dashboard'
  },
  'create-task': {
    key: 'create-task',
    label: { zh: '新建任务', en: 'Create Task' },
    parent: 'task-manager'
  },
  'calendar': {
    key: 'calendar',
    label: { zh: '日历', en: 'Calendar' },
    parent: 'dashboard'
  },
  'create-event': {
    key: 'create-event',
    label: { zh: '新建日程', en: 'Create Event' },
    parent: 'calendar'
  },
  'contacts': {
    key: 'contacts',
    label: { zh: '联系人', en: 'Contacts' },
    parent: 'dashboard'
  },
  'create-contact': {
    key: 'create-contact',
    label: { zh: '新建联系人', en: 'Create Contact' },
    parent: 'contacts'
  },
  'contact-detail': {
    key: 'contact-detail',
    label: { zh: '联系人详情', en: 'Contact Details' },
    parent: 'contacts'
  },
  'settings': {
    key: 'settings',
    label: { zh: '设置', en: 'Settings' },
    parent: 'dashboard'
  },
  'data-flow': {
    key: 'data-flow',
    label: { zh: '数据流图', en: 'Data Flow' },
    parent: 'dashboard'
  },
  'visual-data-flow': {
    key: 'visual-data-flow',
    label: { zh: '可视化数据流图', en: 'Visual Data Flow' },
    parent: 'dashboard'
  }
};

// 客户洞察标签页的映射
const customerInsightsTabLabels: Record<CustomerInsightsTab, { zh: string; en: string }> = {
  'overview': { zh: '概况', en: 'Overview' },
  'financial': { zh: '财务', en: 'Financial' },
  'interaction': { zh: '互动', en: 'Interaction' },
  'news': { zh: '新闻', en: 'News' },
  'documents': { zh: '文档', en: 'Documents' }
};

export function Breadcrumb({ currentPage, language, onNavigate, customerInsightsTab }: BreadcrumbProps) {
  const buildBreadcrumbPath = (page: PageType): BreadcrumbItem[] => {
    const path: BreadcrumbItem[] = [];
    let currentItem = pageHierarchy[page];
    
    while (currentItem) {
      path.unshift(currentItem);
      if (currentItem.parent) {
        currentItem = pageHierarchy[currentItem.parent];
      } else {
        break;
      }
    }
    
    // 如果是客户洞察页面且有标签页信息，添加子页面
    if (page === 'customer-insights' && customerInsightsTab) {
      path.push({
        key: customerInsightsTab,
        label: customerInsightsTabLabels[customerInsightsTab],
        isSubPage: true
      });
    }
    
    return path;
  };

  const breadcrumbPath = buildBreadcrumbPath(currentPage);

  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground py-4">
      {breadcrumbPath.map((item, index) => (
        <React.Fragment key={item.key}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <button
            onClick={() => {
              if (!item.isSubPage) {
                onNavigate(item.key as PageType);
              }
            }}
            className={`hover:text-foreground transition-colors ${
              index === breadcrumbPath.length - 1 
                ? 'text-foreground cursor-default' 
                : item.isSubPage 
                  ? 'text-foreground cursor-default'
                  : 'cursor-pointer'
            }`}
            disabled={index === breadcrumbPath.length - 1 || item.isSubPage}
          >
            {item.label[language]}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}