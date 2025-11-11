import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Building2, Plus, TrendingUp, TrendingDown, Calendar, User, ExternalLink, MessageSquare, Download, Upload, FileText, Eye, ChevronDown, ChevronRight, Trash2, Loader2, Edit } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Language, CustomerInsightsTab } from '../../App';
import * as api from '../../services/api';
import { CURRENCIES } from '../../contexts/CurrencyContext';

interface CustomerInsightsProps {
  searchQuery: string;
  language: Language;
}

const companies: Array<any> = [];

const COUNTRY_LABELS: Record<string, { zh: string; en: string }> = {
  cn: { zh: '中国', en: 'China' },
  us: { zh: '美国', en: 'United States' },
  gb: { zh: '英国', en: 'United Kingdom' },
  ca: { zh: '加拿大', en: 'Canada' },
  au: { zh: '澳大利亚', en: 'Australia' },
  de: { zh: '德国', en: 'Germany' },
  fr: { zh: '法国', en: 'France' },
  jp: { zh: '日本', en: 'Japan' },
  kr: { zh: '韩国', en: 'South Korea' },
  sg: { zh: '新加坡', en: 'Singapore' },
  hk: { zh: '香港', en: 'Hong Kong' },
  in: { zh: '印度', en: 'India' },
  other: { zh: '其他', en: 'Other' }
};

export function CustomerInsights({ searchQuery, language }: CustomerInsightsProps) {
  const navigate = useNavigate();
  const { customerId: urlCustomerId, tab: urlTab } = useParams<{ customerId?: string; tab?: string }>();

  // Get current tab from URL, default to 'overview'
  const currentTab = (urlTab as CustomerInsightsTab) || 'overview';

  const [selectedCompany, setSelectedCompany] = useState('');
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({ title: '', status: '', author: '' });
  const [defaultAnnotationAuthor, setDefaultAnnotationAuthor] = useState('');
  const [dbAnnotations, setDbAnnotations] = useState<any[]>([]);
  const [loadingAnnotations, setLoadingAnnotations] = useState(false);
  const [annotationsError, setAnnotationsError] = useState<string | null>(null);
  const [savingAnnotation, setSavingAnnotation] = useState(false);
  const [annotationFormError, setAnnotationFormError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{categoryId: string, fileId: string, fileName: string} | null>(null);

  const [apiInteractions, setApiInteractions] = useState<any[]>([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);

  // Edit customer state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Database customers state
  const [dbCustomers, setDbCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerLoadError, setCustomerLoadError] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // News from database state
  const [dbNews, setDbNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  // Documents from database state
  const [dbDocuments, setDbDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [financialStatements, setFinancialStatements] = useState<any[]>([]);
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [financialLoadError, setFinancialLoadError] = useState<string | null>(null);

  // Interaction detail dialog state
  const [selectedInteraction, setSelectedInteraction] = useState<any | null>(null);
  const [isInteractionDetailOpen, setIsInteractionDetailOpen] = useState(false);

  // Financial statement dialog state
  const [isFinancialDialogOpen, setIsFinancialDialogOpen] = useState(false);
  const [editingFinancial, setEditingFinancial] = useState<any | null>(null);
  const [financialFormData, setFinancialFormData] = useState<any>({
    fiscal_year: '',
    revenue: '',
    net_profit: '',
    roe: '',
    debt_ratio: '',
    currency_id: '',
    notes: ''
  });
  const [savingFinancial, setSavingFinancial] = useState(false);
  const [financialFormError, setFinancialFormError] = useState<string | null>(null);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [deleteFinancialDialogOpen, setDeleteFinancialDialogOpen] = useState(false);
  const [financialToDelete, setFinancialToDelete] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedUser = window.localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const authorName = [parsedUser.first_name, parsedUser.last_name]
          .filter(Boolean)
          .join(' ')
          .trim();

        if (authorName) {
          setDefaultAnnotationAuthor(authorName);
          setNewAnnotation(prev => ({
            ...prev,
            author: prev.author || authorName
          }));
        }
      }
    } catch (error) {
      console.warn('Failed to hydrate annotation author from storage', error);
    }
  }, []);

  const content = {
    zh: {
      title: '客户洞察',
      newCustomer: '新建客户',
      editCustomer: '编辑客户',
      selectCustomer: '选择客户',
      overview: '概况',
      financial: '财务',
      interaction: '互动',
      news: '新闻',
      documents: '文档',
      companyProfile: '公司简介',
      keyFinancials: '关键财务指标',
      latestNews: '最新新闻',
      latestInteractions: '最新互动',
      latestFocus: '最新关注',
      latestAnnotations: '最新批注',
      viewAllInteractions: '查看此客户全部互动记录',
      viewAllNews: '查看全部新闻',
      addAnnotation: '增加批注',
      annotationTitle: '批注标题',
      annotationStatus: '状态描述',
      annotationAuthor: '作者',
      save: '保存',
      cancel: '取消',
      annotationSaving: '保存中...',
      annotationSaveError: '保存批注失败，请稍后重试。',
      annotationLoadError: '加载批注失败',
      annotationSelectCustomer: '请先选择CRM客户再添加批注。',
      annotationTitleRequired: '请输入批注标题。',
      annotationStatusRequired: '请输入状态描述。',
      annotationLimitExceeded: '批注内容最多500个英文单词（或等价字数）。',
      noAnnotations: '暂无批注记录。',
      marketCap: '市值',
      stockPrice: '股价',
      peRatio: 'PE',
      rating: '评级',
      headquarters: '总部',
      addressLabel: '地址',
      revenue: '营业收入',
      profit: '净利润',
      roe: 'ROE',
      debtRatio: '负债率',
      listed: '上市',
      automotive: '汽车',
      latestKeyIndicators: '最新年度关键指标',
      latestFiscalYear: '最新财年',
      financialDataLoading: '财务数据加载中...',
      financialDataError: '财务数据加载失败',
      noFinancialData: '暂无财务数据',
      financialAnnualData: '财务年度数据',
      year: '年份',
      revenueAndProfitTrend: '收入与净利润趋势',
      roeAndDebtTrend: 'ROE与负债率趋势',
      revenueLabel: '营收',
      profitLabel: '净利润',
      roeLabel: 'ROE',
      debtLabel: '负债率',
      incomeStatus: '收入情况',
      financialIndicators: '财务指标',
      documentManagement: '文档管理',
      customerInfo: '客户信息 (如工商管理注册)',
      ownershipStructure: '股权结构 (如股东权益说明, UBO)',
      financialOperations: '财务经营 (如财报信息)',
      kycDocuments: 'KYC文档 (如 Dow Jones)',
      communicationDocs: '交流文档 (与客户交流的相关文档)',
      otherDocuments: '其它文档',
      dragDropText: '拖拽文件到此处',
      browseFiles: '浏览文件',
      fileSizeLimit: '单个文件限制200MB',
      noDocuments: '此类目下暂无文档',
      uploadedDocuments: '上传的「{category}」文档',
      upload: '上传',
      read: '阅读',
      download: '下载',
      delete: '删除',
      uploadDate: '上传时间',
      annotator: '批注者',
      time: '时间',
      deleteConfirmTitle: '确认删除文档',
      deleteConfirmDescription: '您确定要删除文档 "{fileName}" 吗？此操作无法撤销。',
      confirmDelete: '确认删除',
      cancelDelete: '取消',
      interactionDetails: '互动详情',
      interactionType: '互动类型',
      interactionDate: '互动日期',
      interactionSubject: '主题',
      interactionDescription: '详细描述',
      close: '关闭',
      addFinancialStatement: '添加财务信息',
      editFinancialStatement: '编辑财务信息',
      fiscalYear: '财年',
      currency: '货币',
      notesOptional: '备注（可选）',
      fiscalYearRequired: '请输入财年',
      actions: '操作',
      edit: '编辑',
      deleteFinancialTitle: '确认删除财务信息',
      deleteFinancialDescription: '您确定要删除 {year} 年的财务信息吗？此操作无法撤销。',
      deleting: '删除中...',
      saving: '保存中...'
    },
    en: {
      title: 'Customer Insights',
      newCustomer: 'New Customer',
      editCustomer: 'Edit Customer',
      selectCustomer: 'Select Customer',
      overview: 'Overview',
      financial: 'Financial',
      interaction: 'Interaction',
      news: 'News',
      documents: 'Documents',
      companyProfile: 'Company Profile',
      keyFinancials: 'Key Financial Indicators',
      latestNews: 'Latest News',
      latestInteractions: 'Latest Interactions',
      latestFocus: 'Latest Focus',
      latestAnnotations: 'Latest Annotations',
      viewAllInteractions: 'View All Customer Interaction Records',
      viewAllNews: 'View All News',
      addAnnotation: 'Add Annotation',
      annotationTitle: 'Annotation Title',
      annotationStatus: 'Status Description',
      annotationAuthor: 'Author',
      save: 'Save',
      cancel: 'Cancel',
      annotationSaving: 'Saving...',
      annotationSaveError: 'Failed to save annotation. Please try again.',
      annotationLoadError: 'Failed to load annotations',
      annotationSelectCustomer: 'Select a CRM customer before adding annotations.',
      annotationTitleRequired: 'Annotation title is required.',
      annotationStatusRequired: 'Status description is required.',
      annotationLimitExceeded: 'Annotation description must not exceed 500 words.',
      noAnnotations: 'No annotations found.',
      marketCap: 'Market Cap',
      stockPrice: 'Stock Price',
      peRatio: 'PE',
      rating: 'Rating',
      headquarters: 'Headquarters',
      addressLabel: 'Address',
      revenue: 'Revenue',
      profit: 'Net Profit',
      roe: 'ROE',
      debtRatio: 'Debt Ratio',
      listed: 'Listed',
      automotive: 'Automotive',
      latestKeyIndicators: 'Latest Annual Key Indicators',
      latestFiscalYear: 'Latest Fiscal Year',
      financialDataLoading: 'Loading financial data...',
      financialDataError: 'Failed to load financial data',
      noFinancialData: 'No financial data available',
      financialAnnualData: 'Annual Financial Data',
      year: 'Year',
      revenueAndProfitTrend: 'Revenue and Profit Trend',
      roeAndDebtTrend: 'ROE and Debt Ratio Trend',
      revenueLabel: 'Revenue',
      profitLabel: 'Net Profit',
      roeLabel: 'ROE',
      debtLabel: 'Debt Ratio',
      incomeStatus: 'Income Status',
      financialIndicators: 'Financial Indicators',
      documentManagement: 'Document Management',
      customerInfo: 'Customer Information (e.g., Business Registration)',
      ownershipStructure: 'Ownership Structure (e.g., Shareholder Information, UBO)',
      financialOperations: 'Financial Operations (e.g., Financial Reports)',
      kycDocuments: 'KYC Documents (e.g., Dow Jones)',
      communicationDocs: 'Communication Documents (Customer Communication Files)',
      otherDocuments: 'Other Documents',
      dragDropText: 'Drag and drop file here',
      browseFiles: 'Browse files',
      fileSizeLimit: 'Limit 200MB per file',
      noDocuments: 'No documents in this category',
      uploadedDocuments: 'Uploaded "{category}" Documents',
      upload: 'Upload',
      read: 'Read',
      download: 'Download',
      delete: 'Delete',
      uploadDate: 'Upload Date',
      annotator: 'Annotator',
      time: 'Time',
      deleteConfirmTitle: 'Confirm Delete Document',
      deleteConfirmDescription: 'Are you sure you want to delete the document "{fileName}"? This action cannot be undone.',
      confirmDelete: 'Confirm Delete',
      cancelDelete: 'Cancel',
      interactionDetails: 'Interaction Details',
      interactionType: 'Interaction Type',
      interactionDate: 'Interaction Date',
      interactionSubject: 'Subject',
      interactionDescription: 'Description',
      close: 'Close',
      addFinancialStatement: 'Add Financial Statement',
      editFinancialStatement: 'Edit Financial Statement',
      fiscalYear: 'Fiscal Year',
      currency: 'Currency',
      notesOptional: 'Notes (Optional)',
      fiscalYearRequired: 'Please enter fiscal year',
      actions: 'Actions',
      edit: 'Edit',
      deleteFinancialTitle: 'Confirm Delete Financial Statement',
      deleteFinancialDescription: 'Are you sure you want to delete the financial statement for {year}? This action cannot be undone.',
      deleting: 'Deleting...',
      saving: 'Saving...'
    }
  };

  const t = content[language];

  const customerTypeTranslations: Record<string, { zh: string; en: string }> = {
    smb: { zh: '中小企业', en: 'SMB' },
    enterprise: { zh: '大型企业', en: 'Enterprise' },
    startup: { zh: '初创公司', en: 'Startup' },
    strategic: { zh: '战略客户', en: 'Strategic' },
    lead: { zh: '潜在商机', en: 'Lead' }
  };

  const getCustomerTypeLabels = (type: string | null | undefined) => {
    const normalized = typeof type === 'string' ? type.trim().toLowerCase() : '';
    const translation = normalized ? customerTypeTranslations[normalized] : undefined;

    if (translation) {
      return translation;
    }

    if (!normalized) {
      return { zh: '未分类', en: 'Unclassified' };
    }

    return { zh: type as string, en: type as string };
  };

  // Helper function to translate customer type (business size)
  const translateCustomerType = (type: string | null | undefined) => {
    const labels = getCustomerTypeLabels(type);
    return language === 'zh' ? labels.zh : labels.en;
  };

  const formatCountryName = (value: string | null | undefined) => {
    if (typeof value !== 'string') {
      return '';
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    const lower = trimmed.toLowerCase();
    const translation = COUNTRY_LABELS[lower as keyof typeof COUNTRY_LABELS];

    if (translation) {
      return language === 'zh' ? translation.zh : translation.en;
    }

    return trimmed;
  };

  // Helper function to translate customer status
  const translateCustomerStatus = (status: string) => {
    const statuses: Record<string, { zh: string; en: string }> = {
      active: { zh: '活跃', en: 'Active' },
      inactive: { zh: '非活跃', en: 'Inactive' },
      prospect: { zh: '潜在客户', en: 'Prospect' }
    };

    const normalized = status?.toLowerCase() || '';
    const translation = statuses[normalized];

    if (translation) {
      return language === 'zh' ? translation.zh : translation.en;
    }

    return status || (language === 'zh' ? '未知' : 'Unknown');
  };

  const fetchAnnotations = useCallback(async (customerId: number) => {
    setLoadingAnnotations(true);
    setAnnotationsError(null);
    try {
      const response = await api.annotationsApi.getByCustomerId(customerId.toString(), { limit: 100 });
      if (response.data?.annotations) {
        setDbAnnotations(response.data.annotations);
      } else {
        setDbAnnotations([]);
      }
    } catch (error) {
      console.error('Error fetching annotations:', error);
      setAnnotationsError(error instanceof Error ? error.message : 'Unknown error');
      setDbAnnotations([]);
    } finally {
      setLoadingAnnotations(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedCustomerId) {
      setDbAnnotations([]);
      setLoadingAnnotations(false);
      setAnnotationsError(null);
      return;
    }

    fetchAnnotations(selectedCustomerId);
  }, [selectedCustomerId, fetchAnnotations]);

  // Fetch interactions for selected company
  useEffect(() => {
    const fetchCompanyInteractions = async () => {
      if (!selectedCompany) return;

      setLoadingInteractions(true);
      try {
        // For database customers, use selectedCustomerId directly
        if (selectedCustomerId) {
          // Fetch interactions for this customer ID
          const interactionsResponse = await api.interactionsApi.getByCustomerId(selectedCustomerId.toString(), { limit: 100 });
          if (interactionsResponse.data?.interactions) {
            setApiInteractions(interactionsResponse.data.interactions);
          } else {
            setApiInteractions([]);
          }
        } else {
          // For mock companies (like BYD), search by name
          const companyData = companies.find(c => c.id === selectedCompany);
          if (!companyData) {
            setApiInteractions([]);
            return;
          }

          const companyName = companyData.name;

          // Search for customer by name
          const customersResponse = await api.customersApi.getAll({ search: companyName, limit: 1 });
          if (customersResponse.data?.customers && customersResponse.data.customers.length > 0) {
            const customerId = customersResponse.data.customers[0].customer_id;

            // Fetch interactions for this customer
            const interactionsResponse = await api.interactionsApi.getByCustomerId(customerId, { limit: 100 });
            if (interactionsResponse.data?.interactions) {
              setApiInteractions(interactionsResponse.data.interactions);
            } else {
              setApiInteractions([]);
            }
          } else {
            setApiInteractions([]);
          }
        }
      } catch (error) {
        console.error('Error fetching interactions:', error);
        setApiInteractions([]);
      } finally {
        setLoadingInteractions(false);
      }
    };

    fetchCompanyInteractions();
  }, [selectedCompany, selectedCustomerId]);

  // Fetch news for selected company
  useEffect(() => {
    const fetchCompanyNews = async () => {
      if (!selectedCompany) return;

      setLoadingNews(true);
      try {
        // Find company from the combined list (mock + database)
        const allCompaniesList = [
          ...companies,
          ...(Array.isArray(dbCustomers) ? dbCustomers : []).map(cust => ({
            id: `db_${cust.customer_id}`,
            customerId: cust.customer_id,
            name: cust.company_name || 'Unknown',
            nameCn: cust.company_name || '未知公司'
          }))
        ];

        const companyData = allCompaniesList.find(c => c.id === selectedCompany);
        if (!companyData) {
          setDbNews([]);
          return;
        }

        const companyName = companyData.name;

        // Fetch news from market insights API
        const newsResponse = await api.marketInsightsApi.getCustomerNews(companyName, { limit: 50 });
        if (newsResponse.data?.articles) {
          setDbNews(newsResponse.data.articles);
        } else {
          setDbNews([]);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setDbNews([]);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchCompanyNews();
  }, [selectedCompany, dbCustomers]);

  // Fetch documents for selected customer
  useEffect(() => {
    const fetchCustomerDocuments = async () => {
      if (!selectedCustomerId) return;

      setLoadingDocuments(true);
      try {
        const documentsResponse = await api.documentsApi.getByCustomerId(selectedCustomerId.toString());
        if (documentsResponse.data?.documents) {
          setDbDocuments(documentsResponse.data.documents);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        setDbDocuments([]);
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchCustomerDocuments();
  }, [selectedCustomerId]);

  useEffect(() => {
    if (!selectedCustomerId) {
      setFinancialStatements([]);
      setFinancialLoadError(null);
      setLoadingFinancials(false);
      return;
    }

    let isActive = true;

    const fetchFinancialStatements = async () => {
      setLoadingFinancials(true);
      setFinancialLoadError(null);

      try {
        const response = await api.financialStatementsApi.getByCustomerId(selectedCustomerId.toString());

        if (!isActive) {
          return;
        }

        if (response.data?.statements) {
          setFinancialStatements(response.data.statements);
        } else {
          setFinancialStatements([]);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error('Error fetching financial statements:', error);
        setFinancialLoadError(error instanceof Error ? error.message : 'unknown_error');
        setFinancialStatements([]);
      } finally {
        if (isActive) {
          setLoadingFinancials(false);
        }
      }
    };

    fetchFinancialStatements();

    return () => {
      isActive = false;
    };
  }, [selectedCustomerId]);

  // Load currencies from context
  useEffect(() => {
    const currenciesArray = Object.values(CURRENCIES).map((curr, idx) => ({
      currency_id: curr.code,
      code: curr.code,
      symbol: curr.symbol,
      name: curr.name
    }));
    setCurrencies(currenciesArray);
  }, []);

  // Fetch all customers from database
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      setCustomerLoadError(null);

      try {
        const response = await api.customersApi.getAll({ limit: 1000 });

        if (response.data?.customers) {
          setDbCustomers(response.data.customers);
        } else {
          setDbCustomers([]);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomerLoadError(error instanceof Error ? error.message : 'Failed to load customers');
        setDbCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Set selectedCustomerId from URL param when navigating from Dashboard or set default
  useEffect(() => {
    // Priority 1: If URL param is provided, use it
    if (urlCustomerId) {
      setSelectedCustomerId(urlCustomerId);
      setSelectedCompany(`db_${urlCustomerId}`);
      return;
    }

    // Priority 2: Set default customer only if none selected and customers are loaded
    if (dbCustomers.length > 0 && !selectedCustomerId) {
      const firstCustomer = dbCustomers[0];
      setSelectedCustomerId(firstCustomer.customer_id);
      setSelectedCompany(`db_${firstCustomer.customer_id}`);
    }
  }, [urlCustomerId, dbCustomers, selectedCustomerId]);
  // Filter all companies (mock + database) based on search
const allCompaniesForDropdown = [
  ...companies,
  ...(Array.isArray(dbCustomers) ? dbCustomers : []).map((cust) => {
    const rawCustomFields = (cust as any)?.custom_fields;
    const customFields =
      rawCustomFields && !Array.isArray(rawCustomFields) && typeof rawCustomFields === 'object'
        ? rawCustomFields
        : {};

    const financials =
      customFields.financials && typeof customFields.financials === 'object'
        ? customFields.financials
        : {};

    const focusNote =
      customFields.focus && typeof customFields.focus === 'object'
        ? customFields.focus
        : null;

    const fallbackMarketCap =
      cust.market_cap !== null && cust.market_cap !== undefined
        ? `¥${Math.round(Number(cust.market_cap) / 1e8)}亿`
        : 'N/A';

    const typeLabels = getCustomerTypeLabels(cust.customer_type);
    const typeZhFromDb = cust.customer_type ? typeLabels.zh : '';
    const typeEnFromDb = cust.customer_type ? typeLabels.en : '';

    const addressLine =
      cust.address_line1 ||
      customFields.address_line1 ||
      customFields.address ||
      '';

    const city =
      cust.city ||
      customFields.headquarter_city ||
      customFields.city ||
      '';

    const countryRaw =
      cust.country ||
      customFields.headquarter_country ||
      customFields.country ||
      customFields.headquarter_country_code ||
      '';

    const statusValue =
      cust.status ||
      customFields.customer_status ||
      '';

    return {
      id: `db_${cust.customer_id}`,
      customerId: cust.customer_id,
      name: cust.company_name || 'Unknown',
      nameCn: customFields.name_cn || cust.company_name || '未知公司',
      ticker: customFields.ticker || cust.stock_code || 'N/A',
      type: typeZhFromDb || customFields.company_type_cn || '未知',
      typeEn: typeEnFromDb || customFields.company_type_en || 'Unknown',
      sector: customFields.sector_cn || cust.industry_name || '其他',
      sectorEn: customFields.sector_en || cust.industry_name || 'Other',
      marketCap: customFields.market_cap_display || fallbackMarketCap,
      stockPrice: customFields.stock_price_display || 'N/A',
      pe: customFields.pe_ratio_display || 'N/A',
      rating: customFields.rating_display || (cust.rating ? String(cust.rating) : 'N/A'),
      description: customFields.description_cn || cust.description || '暂无描述',
      descriptionEn: customFields.description_en || cust.introduction || 'No description available',
      address: addressLine,
      city,
      country: typeof countryRaw === 'string' ? countryRaw : '',
      status: statusValue,
      customerTypeValue: typeof cust.customer_type === 'string' ? cust.customer_type.toLowerCase() : '',
      financials: {
        revenue: financials.revenue || 'N/A',
        profit: financials.profit || 'N/A',
        roe: financials.roe || 'N/A',
        debtRatio: financials.debtRatio || 'N/A',
        annualData: Array.isArray(financials.annualData) ? financials.annualData : [],
        trendData:
          financials.trendData && typeof financials.trendData === 'object'
            ? financials.trendData
            : { revenueAndProfit: [], roeAndDebt: [] },
      },
      news: [],
      interactions: [],
      focus: focusNote,
      annotations: [],
    };
  }),
];

  // Get current selected company from the combined list (before any early returns)
  const company = selectedCompany
    ? allCompaniesForDropdown.find(c => c.id === selectedCompany)
    : allCompaniesForDropdown[0];

  // Get news from database only (no mock data)
  const allNews = dbNews.map(article => ({
    id: article.id || article.news_id,
    title: article.title_en || article.title || '',
    titleEn: article.title_en || article.title || '',
    date: article.publishTime || (article.published_at ? new Date(article.published_at).toLocaleDateString() : ''),
    content: article.content_zh || article.ai_summary_zh || article.summary_zh || article.content_en || article.ai_summary_en || article.summary_en || '',
    contentEn: article.content_en || article.ai_summary_en || article.summary_en || article.content_zh || article.ai_summary_zh || article.summary_zh || '',
    source: article.source_en || article.source || '',
    importance: article.importance || 0,
    url: article.url || ''
  }));

  const isDatabaseCompany = (company as any)?.customerId !== undefined;
  const formattedCountryName = formatCountryName((company as any)?.country);
  const locationParts = [
    typeof (company as any)?.city === 'string' ? ((company as any).city as string).trim() : '',
    formattedCountryName
  ].filter((part) => part);
  const locationDisplay = locationParts.join(language === 'zh' ? '，' : ', ');
  const companyAddress = typeof (company as any)?.address === 'string' ? ((company as any).address as string).trim() : '';

  // IMPORTANT: All hooks must be called before any early returns (React Rules of Hooks)
  const processedFinancials = useMemo(() => {
    const fallbackFinancials = (company as any)?.financials || {};
    const fallbackSummary = {
      revenue: fallbackFinancials.revenue ?? 'N/A',
      profit: fallbackFinancials.profit ?? 'N/A',
      roe: fallbackFinancials.roe ?? 'N/A',
      debtRatio: fallbackFinancials.debtRatio ?? 'N/A',
      fiscalYear: undefined as number | undefined,
      currencySymbol: undefined as string | undefined
    };
    const fallbackAnnualData = Array.isArray(fallbackFinancials.annualData) ? fallbackFinancials.annualData : [];
    const fallbackRevenueTrend =
      fallbackFinancials.trendData && Array.isArray(fallbackFinancials.trendData.revenueAndProfit)
        ? fallbackFinancials.trendData.revenueAndProfit
        : [];
    const fallbackRoeTrend =
      fallbackFinancials.trendData && Array.isArray(fallbackFinancials.trendData.roeAndDebt)
        ? fallbackFinancials.trendData.roeAndDebt
        : [];

    const computeScale = (values: number[], defaultMax: number) => {
      const maxValue = values.length > 0 ? Math.max(...values) : 0;
      if (maxValue <= 0) {
        return defaultMax;
      }
      return Math.max(Math.ceil(maxValue * 1.2), defaultMax);
    };

    if (!isDatabaseCompany) {
      const revenueValues = fallbackRevenueTrend.flatMap((item: any) => [
        typeof item === 'object' && item ? Number(item.revenue) || 0 : 0,
        typeof item === 'object' && item ? Number(item.profit) || 0 : 0
      ]);
      const roeValues = fallbackRoeTrend.flatMap((item: any) => [
        typeof item === 'object' && item ? Number(item.roe) || 0 : 0,
        typeof item === 'object' && item ? Number(item.debtRatio) || 0 : 0
      ]);

      return {
        summary: fallbackSummary,
        annualData: fallbackAnnualData,
        revenueProfitTrend: fallbackRevenueTrend,
        roeDebtTrend: fallbackRoeTrend,
        revenueScaleMax: computeScale(revenueValues, 10),
        roeScaleMax: computeScale(roeValues, 10),
        revenueUnitLabel: ''
      };
    }

    if (loadingFinancials && financialStatements.length === 0) {
      return {
        summary: {
          revenue: '--',
          profit: '--',
          roe: '--',
          debtRatio: '--',
          fiscalYear: undefined,
          currencySymbol: undefined
        },
        annualData: [],
        revenueProfitTrend: [],
        roeDebtTrend: [],
        revenueScaleMax: 10,
        roeScaleMax: 10,
        revenueUnitLabel: ''
      };
    }

    if (!financialStatements || financialStatements.length === 0) {
      const revenueValues = fallbackRevenueTrend.flatMap((item: any) => [
        typeof item === 'object' && item ? Number(item.revenue) || 0 : 0,
        typeof item === 'object' && item ? Number(item.profit) || 0 : 0
      ]);
      const roeValues = fallbackRoeTrend.flatMap((item: any) => [
        typeof item === 'object' && item ? Number(item.roe) || 0 : 0,
        typeof item === 'object' && item ? Number(item.debtRatio) || 0 : 0
      ]);

      return {
        summary: fallbackSummary,
        annualData: fallbackAnnualData,
        revenueProfitTrend: fallbackRevenueTrend,
        roeDebtTrend: fallbackRoeTrend,
        revenueScaleMax: computeScale(revenueValues, 10),
        roeScaleMax: computeScale(roeValues, 10),
        revenueUnitLabel: ''
      };
    }

    const sortedStatements = [...financialStatements].sort(
      (a, b) => Number(b.fiscal_year || 0) - Number(a.fiscal_year || 0)
    );
    // Latest statement is simply the highest fiscal year
    const latestStatement = sortedStatements[0];
    const currencySymbol =
      (latestStatement && latestStatement.currency_symbol) || (language === 'zh' ? '¥' : '$');
    const revenueDivider = language === 'zh' ? 1e8 : 1e9;
    const revenueUnitSuffix = language === 'zh' ? '亿' : 'B';

    const formatCurrencyDisplay = (value: number | null | undefined) => {
      if (value === null || value === undefined) {
        return 'N/A';
      }

      const formatter = new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
        maximumFractionDigits: language === 'zh' ? 0 : 1,
        minimumFractionDigits: language === 'zh' ? 0 : 1
      });

      return `${currencySymbol}${formatter.format(value / revenueDivider)}${revenueUnitSuffix}`;
    };

    const formatPercentDisplay = (value: number | null | undefined) => {
      if (value === null || value === undefined) {
        return 'N/A';
      }

      return `${(Number(value) * 100).toFixed(1)}%`;
    };

    const annualData = sortedStatements.map((statement) => ({
      financial_statement_id: statement.statement_id,
      year: statement.fiscal_year,
      revenue: formatCurrencyDisplay(statement.revenue),
      profit: formatCurrencyDisplay(statement.net_profit),
      roe: formatPercentDisplay(statement.roe),
      debtRatio: formatPercentDisplay(statement.debt_ratio)
    }));

    const orderedForTrend = [...sortedStatements].reverse();
    const revenueProfitTrend = orderedForTrend.map((statement) => ({
      name: String(statement.fiscal_year),
      revenue:
        statement.revenue !== null && statement.revenue !== undefined
          ? Number(statement.revenue) / revenueDivider
          : 0,
      profit:
        statement.net_profit !== null && statement.net_profit !== undefined
          ? Number(statement.net_profit) / revenueDivider
          : 0
    }));

    const roeDebtTrend = orderedForTrend.map((statement) => ({
      name: String(statement.fiscal_year),
      roe:
        statement.roe !== null && statement.roe !== undefined ? Number(statement.roe) * 100 : 0,
      debtRatio:
        statement.debt_ratio !== null && statement.debt_ratio !== undefined
          ? Number(statement.debt_ratio) * 100
          : 0
    }));

    const revenueValues = revenueProfitTrend.flatMap((item) => [item.revenue, item.profit]);
    const roeValues = roeDebtTrend.flatMap((item) => [item.roe, item.debtRatio]);

    return {
      summary: {
        revenue: formatCurrencyDisplay(latestStatement.revenue),
        profit: formatCurrencyDisplay(latestStatement.net_profit),
        roe: formatPercentDisplay(latestStatement.roe),
        debtRatio: formatPercentDisplay(latestStatement.debt_ratio),
        fiscalYear: latestStatement.fiscal_year,
        currencySymbol
      },
      annualData,
      revenueProfitTrend,
      roeDebtTrend,
      revenueScaleMax: computeScale(revenueValues, 10),
      roeScaleMax: computeScale(roeValues, 10),
      revenueUnitLabel: `${currencySymbol}${revenueUnitSuffix}`
    };
  }, [company, financialStatements, isDatabaseCompany, language, loadingFinancials]);

  const hasFinancialData = processedFinancials.annualData.length > 0;
  const annotationsList = isDatabaseCompany
    ? dbAnnotations.map((item) => {
        const statusText = item.status || item.content || '';
        const dbAuthorName = typeof item.author_name === 'string' ? item.author_name.trim() : '';
        const contentAuthor = typeof item.content === 'string' ? item.content.trim() : '';
        const authorChoice = dbAuthorName || contentAuthor;
        const authorZh = authorChoice || '系统';
        const authorEn = authorChoice || 'System';
        const formattedTime = item.created_at
          ? new Date(item.created_at).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')
          : '';

        return {
          id: item.annotation_id || item.id,
          title: item.title,
          titleEn: item.title,
          status: statusText,
          statusEn: statusText,
          author: authorZh,
          authorEn: authorEn,
          time: formattedTime
        };
      })
    : (company?.annotations || []);

  // 按日期排序互动记录（最新的在最上面）
  const sortedInteractions = [...(company?.interactions || []), ...apiInteractions].sort((a, b) => {
    const dateA = new Date(a.interaction_date || a.date).getTime();
    const dateB = new Date(b.interaction_date || b.date).getTime();
    return dateB - dateA;
  });

  // Helper function to get interaction display fields (handles both mock and API data)
  const getInteractionDisplay = (item: any) => {
    return {
      id: item.interaction_id || item.id,
      type: language === 'zh' 
        ? (item.interaction_type || item.type) 
        : (item.interaction_type || item.typeEn || item.type),
      date: item.interaction_date 
        ? new Date(item.interaction_date).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')
        : item.date,
      description: language === 'zh'
        ? (item.subject || item.description)
        : (item.subject || item.descriptionEn || item.description)
    };
  };

  const filteredCompanies = searchQuery
    ? allCompaniesForDropdown.filter(comp =>
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.nameCn.includes(searchQuery) ||
        comp.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (comp.description && comp.description.includes(searchQuery)) ||
        (comp.descriptionEn && comp.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allCompaniesForDropdown;

  // Early return checks (must be AFTER all hooks)
  if (loadingCustomers) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">
          {language === 'zh' ? '客户数据加载中...' : 'Loading customer data...'}
        </div>
      </div>
    );
  }

  if (!loadingCustomers && allCompaniesForDropdown.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">
          {language === 'zh' ? '暂无可用客户，请先创建新客户。' : 'No customers available. Please create a customer first.'}
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">
          {language === 'zh' ? '未找到客户信息' : 'Customer not found'}
        </p>
      </div>
    );
  }

  // Combine mock companies with database customers for dropdown

  const handleAddAnnotation = async () => {
    if (!selectedCustomerId) {
      setAnnotationFormError(t.annotationSelectCustomer);
      return;
    }

    if (!newAnnotation.title.trim()) {
      setAnnotationFormError(t.annotationTitleRequired);
      return;
    }

    if (!newAnnotation.status.trim()) {
      setAnnotationFormError(t.annotationStatusRequired);
      return;
    }

    const statusText = newAnnotation.status.trim();
    const wordCount = statusText.split(/\s+/).filter(Boolean).length;
    if (wordCount > 500) {
      setAnnotationFormError(t.annotationLimitExceeded);
      return;
    }

    const authorText = newAnnotation.author.trim();

    setSavingAnnotation(true);
    setAnnotationFormError(null);

    try {
      const response = await api.annotationsApi.create({
        customer_id: selectedCustomerId.toString(),
        title: newAnnotation.title.trim(),
        status: statusText,
        content: authorText.length > 0 ? authorText : undefined,
      });

      if (!response.data?.annotation) {
        setAnnotationFormError(response.error || t.annotationSaveError);
        return;
      }

      await fetchAnnotations(selectedCustomerId);
      setNewAnnotation({
        title: '',
        status: '',
        author: defaultAnnotationAuthor,
      });
      setIsAnnotationDialogOpen(false);
    } catch (error) {
      console.error('Error creating annotation:', error);
      setAnnotationFormError(t.annotationSaveError);
    } finally {
      setSavingAnnotation(false);
    }
  };

  const handleAnnotationDialogChange = (open: boolean) => {
    setIsAnnotationDialogOpen(open);
    if (!open) {
      setAnnotationFormError(null);
      setNewAnnotation({
        title: '',
        status: '',
        author: defaultAnnotationAuthor,
      });
    } else {
      setAnnotationFormError(null);
      setNewAnnotation(prev => ({
        ...prev,
        author: prev.author || defaultAnnotationAuthor,
      }));
    }
  };

  // Financial statement handlers
  const handleAddFinancialStatement = () => {
    setEditingFinancial(null);
    setFinancialFormData({
      fiscal_year: '',
      revenue: '',
      net_profit: '',
      roe: '',
      debt_ratio: '',
      currency_id: '',
      notes: ''
    });
    setFinancialFormError(null);
    setIsFinancialDialogOpen(true);
  };

  const handleEditFinancialStatement = (statement: any) => {
    setEditingFinancial(statement);
    setFinancialFormData({
      fiscal_year: statement.fiscal_year || '',
      revenue: statement.revenue || '',
      net_profit: statement.net_profit || '',
      // Convert decimal to percentage for display in form (0.15 -> 15)
      roe: statement.roe ? (Number(statement.roe) * 100).toString() : '',
      debt_ratio: statement.debt_ratio ? (Number(statement.debt_ratio) * 100).toString() : '',
      currency_id: statement.currency_id || '',
      notes: statement.notes || ''
    });
    setFinancialFormError(null);
    setIsFinancialDialogOpen(true);
  };

  const handleSaveFinancialStatement = async () => {
    if (!selectedCustomerId) {
      setFinancialFormError(language === 'zh' ? '请先选择客户' : 'Please select a customer');
      return;
    }

    if (!financialFormData.fiscal_year.trim()) {
      setFinancialFormError(t.fiscalYearRequired);
      return;
    }

    setSavingFinancial(true);
    setFinancialFormError(null);

    try {
      const data = {
        customer_id: selectedCustomerId.toString(),
        fiscal_year: financialFormData.fiscal_year.trim(),
        revenue: financialFormData.revenue ? parseFloat(financialFormData.revenue) : undefined,
        net_profit: financialFormData.net_profit ? parseFloat(financialFormData.net_profit) : undefined,
        // Convert percentage to decimal for storage (15 -> 0.15)
        roe: financialFormData.roe ? parseFloat(financialFormData.roe) / 100 : undefined,
        debt_ratio: financialFormData.debt_ratio ? parseFloat(financialFormData.debt_ratio) / 100 : undefined,
        currency_id: financialFormData.currency_id || undefined,
        notes: financialFormData.notes.trim() || undefined,
      };

      if (editingFinancial) {
        // Update existing
        const { customer_id, ...updateData } = data;
        await api.financialStatementsApi.update(editingFinancial.statement_id, updateData);
      } else {
        // Create new
        await api.financialStatementsApi.create(data);
      }

      // Refresh financial statements
      const response = await api.financialStatementsApi.getByCustomerId(selectedCustomerId.toString());
      if (response.data?.statements) {
        setFinancialStatements(response.data.statements);
      }

      setIsFinancialDialogOpen(false);
      setEditingFinancial(null);
    } catch (error: any) {
      console.error('Error saving financial statement:', error);
      setFinancialFormError(error.message || (language === 'zh' ? '保存失败，请稍后重试' : 'Failed to save, please try again'));
    } finally {
      setSavingFinancial(false);
    }
  };

  const handleDeleteFinancialStatement = async () => {
    if (!financialToDelete) return;

    try {
      await api.financialStatementsApi.delete(financialToDelete.statement_id);

      // Refresh financial statements
      if (selectedCustomerId) {
        const response = await api.financialStatementsApi.getByCustomerId(selectedCustomerId.toString());
        if (response.data?.statements) {
          setFinancialStatements(response.data.statements);
        }
      }

      setDeleteFinancialDialogOpen(false);
      setFinancialToDelete(null);
    } catch (error) {
      console.error('Error deleting financial statement:', error);
    }
  };

  const handleFinancialDialogChange = (open: boolean) => {
    setIsFinancialDialogOpen(open);
    if (!open) {
      setEditingFinancial(null);
      setFinancialFormError(null);
      setFinancialFormData({
        fiscal_year: '',
        revenue: '',
        net_profit: '',
        roe: '',
        debt_ratio: '',
        currency_id: '',
        notes: ''
      });
    }
  };

  const documentCategories = [
    { id: 'customerInfo', label: t.customerInfo },
    { id: 'ownershipStructure', label: t.ownershipStructure },
    { id: 'financialOperations', label: t.financialOperations },
    { id: 'kycDocuments', label: t.kycDocuments },
    { id: 'communicationDocs', label: t.communicationDocs },
    { id: 'otherDocuments', label: t.otherDocuments }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleFileUpload = async (categoryId: string, files: FileList | null) => {
    if (!files || !selectedCustomerId) return;

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const response = await api.documentsApi.upload(
          file,
          selectedCustomerId.toString(),
          categoryId,
          `Uploaded to ${categoryId}`
        );

        if (response.error) {
          throw new Error(response.error);
        }

        return response.data?.document;
      });

      const uploadedDocs = await Promise.all(uploadPromises);

      // Refresh the documents list
      const documentsResponse = await api.documentsApi.getByCustomerId(selectedCustomerId.toString());
      if (documentsResponse.data?.documents) {
        setDbDocuments(documentsResponse.data.documents);
      }

      alert(language === 'zh' ? '文件上传成功！' : 'Files uploaded successfully!');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert(language === 'zh' ? '文件上传失败' : 'Failed to upload files');
    }
  };

  const handleFileRead = (documentId: string) => {
    // For now, just download the file to read it
    // In the future, could implement a viewer modal
    handleFileDownload(documentId);
  };

  const handleFileDownload = async (documentId: string) => {
    try {
      const response = await api.documentsApi.download(documentId);
      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert(language === 'zh' ? '文件下载失败' : 'Failed to download file');
    }
  };

  const handleDeleteClick = (categoryId: string, fileId: string, fileName: string) => {
    setFileToDelete({ categoryId, fileId, fileName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      const response = await api.documentsApi.delete(fileToDelete.fileId);
      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh documents list
      if (selectedCustomerId) {
        const documentsResponse = await api.documentsApi.getByCustomerId(selectedCustomerId.toString());
        if (documentsResponse.data?.documents) {
          setDbDocuments(documentsResponse.data.documents);
        }
      }

      alert(language === 'zh' ? '文件删除成功' : 'File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert(language === 'zh' ? '文件删除失败' : 'Failed to delete file');
    } finally {
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed top section */}
      <div className="space-y-4 mb-6 mt-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">{t.selectCustomer}</label>
          <Select value={selectedCompany} onValueChange={(value) => {
            setSelectedCompany(value);
            // If it's a database customer, update selectedCustomerId
            const selected = allCompaniesForDropdown.find(c => c.id === value);
            if (selected && 'customerId' in selected) {
              navigate(`/customer-insights/${selected.customerId}`);
            } else {
              setSelectedCustomerId(null);
              setDbAnnotations([]);
              setAnnotationsError(null);
              setLoadingAnnotations(false);
            }
          }}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {loadingCustomers ? (
                <div className="p-2 text-center text-sm text-gray-500">
                  {language === 'zh' ? '加载中...' : 'Loading...'}
                </div>
              ) : customerLoadError ? (
                <div className="p-2 text-center text-sm text-red-500">
                  {language === 'zh' ? '加载失败: ' : 'Error: '}{customerLoadError}
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="p-2 text-center text-sm text-gray-500">
                  {language === 'zh' ? '未找到客户' : 'No customers found'}
                </div>
              ) : (
                filteredCompanies.map((comp) => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {language === 'zh' ? (comp.nameCn || comp.name) : (comp.name || comp.nameCn)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold">
                    {language === 'zh' ? (company.nameCn || company.name || '未知公司') : (company.name || company.nameCn || 'Unknown Company')}
                  </h2>
                  <Badge variant="secondary">{language === 'zh' ? (company.type || '未知') : (company.typeEn || company.type || 'Unknown')}</Badge>
                  {/* Only show ticker if company is listed */}
                  {isDatabaseCompany && dbCustomers.find(c => c.customer_id === selectedCustomerId)?.listing_status === 'listed' && company.ticker && company.ticker !== 'N/A' && (
                    <span className="text-muted-foreground">{company.ticker}</span>
                  )}
                  <span className="text-muted-foreground">{language === 'zh' ? (company.sector || '其他') : (company.sectorEn || company.sector || 'Other')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                      if (selectedCustomerId) {
                        // Find the current customer data
                        const currentCustomer = dbCustomers.find(c => c.customer_id === selectedCustomerId);
                        if (currentCustomer) {
                          const normalizedCustomerType =
                            typeof currentCustomer.customer_type === 'string'
                              ? currentCustomer.customer_type.toLowerCase()
                              : '';
                          const normalizedStatus =
                            typeof currentCustomer.status === 'string'
                              ? currentCustomer.status.toLowerCase()
                              : 'active';
                          setEditFormData({
                            company_name: currentCustomer.company_name || '',
                            industry_code: currentCustomer.industry_code || '',
                            website: currentCustomer.website || '',
                            description: currentCustomer.description || '',
                            phone: currentCustomer.phone || '',
                            email: currentCustomer.email || '',
                            customer_type: normalizedCustomerType,
                            status: normalizedStatus,
                            address_line1: currentCustomer.address_line1 || '',
                            city: currentCustomer.city || '',
                            country: currentCustomer.country || ''
                          });
                          setIsEditDialogOpen(true);
                        }
                      }
                    }}
                    disabled={!selectedCustomerId}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {t.editCustomer}
                  </Button>
                </div>
              </div>

              {isDatabaseCompany && (locationDisplay || companyAddress) && (
                <div className="text-sm text-muted-foreground space-y-1">
                  {locationDisplay && (
                    <div>
                      <span>{t.headquarters}：</span>
                      <span className="font-medium text-foreground">{locationDisplay}</span>
                    </div>
                  )}
                  {companyAddress && (
                    <div>
                      <span>{t.addressLabel}：</span>
                      <span className="font-medium text-foreground">{companyAddress}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {company.marketCap && company.marketCap !== 'N/A' && (
                  <div>
                    <span className="text-muted-foreground">{t.marketCap}：</span>
                    <span className="font-medium">{company.marketCap}</span>
                  </div>
                )}
                {company.stockPrice && company.stockPrice !== 'N/A' && (
                  <div>
                    <span className="text-muted-foreground">{t.stockPrice}：</span>
                    <span className="font-medium">{company.stockPrice}</span>
                  </div>
                )}
                {company.pe && company.pe !== 'N/A' && (
                  <div>
                    <span className="text-muted-foreground">PE：</span>
                    <span className="font-medium">{company.pe}</span>
                  </div>
                )}
                {company.rating && company.rating !== 'N/A' && (
                  <div>
                    <span className="text-muted-foreground">{t.rating}：</span>
                    <span className="font-medium">{company.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs container with fixed tabs and scrollable content */}
      <div className="flex-1 flex flex-col">
        <Tabs value={currentTab} onValueChange={(value) => {
          const newTab = value as CustomerInsightsTab;
          if (selectedCustomerId) {
            navigate(`/customer-insights/${selectedCustomerId}/${newTab}`);
          }
        }} className="h-full flex flex-col">
          {/* Fixed tabs */}
          <TabsList className="grid w-full grid-cols-5 flex-shrink-0">
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="financial">{t.financial}</TabsTrigger>
            <TabsTrigger value="interaction">{t.interaction}</TabsTrigger>
            <TabsTrigger value="news">{t.news}</TabsTrigger>
            <TabsTrigger value="documents">{t.documents}</TabsTrigger>
          </TabsList>

          {/* Scrollable content */}
          <div className="flex-1 overflow-auto mt-6">

            <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.companyProfile}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {language === 'zh' 
                    ? (company.description || company.descriptionEn || '暂无描述') 
                    : (company.descriptionEn || company.description || 'No description available')
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.keyFinancials}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t.revenue}：</span>
                    <span className="font-medium">{processedFinancials.summary.revenue}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t.profit}：</span>
                    <span className="font-medium">{processedFinancials.summary.profit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ROE：</span>
                    <span className="font-medium">{processedFinancials.summary.roe}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t.debtRatio}：</span>
                    <span className="font-medium">{processedFinancials.summary.debtRatio}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.latestNews}</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingNews ? (
                  <div className="text-center py-4 text-muted-foreground">
                    {language === 'zh' ? '加载中...' : 'Loading...'}
                  </div>
                ) : allNews.length > 0 ? (
                  <div className="space-y-4">
                    {allNews.slice(0, 3).map((item) => (
                      <div key={item.id} className="border-b pb-3 last:border-b-0">
                        <h4 className="font-medium mb-1">{language === 'zh' ? item.title : item.titleEn}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {item.date}
                          {item.source && ` • ${item.source}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'zh'
                            ? (item.content.length > 80 ? item.content.substring(0, 80) + '...' : item.content)
                            : (item.contentEn.length > 80 ? item.contentEn.substring(0, 80) + '...' : item.contentEn)
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    {language === 'zh' ? '暂无新闻' : 'No news available'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.latestInteractions}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedInteractions.slice(0, 3).map((item) => {
                    const display = getInteractionDisplay(item);
                    return (
                    <div key={display.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{display.type}</span>
                          <span className="text-xs text-muted-foreground">{display.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{display.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedInteraction(item);
                          setIsInteractionDetailOpen(true);
                        }}
                        className="text-[#009699] hover:text-[#007a7d]"
                      >
                        {language === 'zh' ? '查看' : 'View'}
                      </Button>
                    </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t.latestAnnotations}</CardTitle>
                <Dialog open={isAnnotationDialogOpen} onOpenChange={handleAnnotationDialogChange}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="teal"
                      disabled={!isDatabaseCompany}
                      title={!isDatabaseCompany ? t.annotationSelectCustomer : undefined}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      {t.addAnnotation}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.addAnnotation}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {annotationFormError && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                          {annotationFormError}
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium">{t.annotationTitle}</label>
                        <Input
                          value={newAnnotation.title}
                          onChange={(e) => {
                            setAnnotationFormError(null);
                            setNewAnnotation({ ...newAnnotation, title: e.target.value });
                          }}
                          placeholder={t.annotationTitle}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t.annotationStatus}</label>
                        <Textarea
                          value={newAnnotation.status}
                          onChange={(e) => {
                            setAnnotationFormError(null);
                            setNewAnnotation({ ...newAnnotation, status: e.target.value });
                          }}
                          placeholder={t.annotationStatus}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t.annotationAuthor}</label>
                        <Input
                          value={newAnnotation.author}
                          onChange={(e) => {
                            setAnnotationFormError(null);
                            setNewAnnotation({ ...newAnnotation, author: e.target.value });
                          }}
                          placeholder={t.annotationAuthor}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handleAnnotationDialogChange(false)}
                          disabled={savingAnnotation}
                        >
                          {t.cancel}
                        </Button>
                        <Button
                          onClick={handleAddAnnotation}
                          variant="teal"
                          disabled={savingAnnotation}
                        >
                          {savingAnnotation ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t.annotationSaving}
                            </>
                          ) : (
                            t.save
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isDatabaseCompany && loadingAnnotations && (
                    <div className="text-sm text-muted-foreground">
                      {language === 'zh' ? '加载中...' : 'Loading...'}
                    </div>
                  )}
                  {!loadingAnnotations && annotationsError && (
                    <div className="text-sm text-red-500">
                      {t.annotationLoadError}
                      {annotationsError ? `${language === 'zh' ? '：' : ': '}${annotationsError}` : ''}
                    </div>
                  )}
                  {!loadingAnnotations && !annotationsError && annotationsList.length === 0 && (
                    <div className="text-sm text-muted-foreground">{t.noAnnotations}</div>
                  )}
                  {!loadingAnnotations && annotationsList.length > 0 && annotationsList.map((item) => (
                    <div key={item.id || item.title} className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-2 cursor-pointer hover:opacity-80">
                        {language === 'zh' ? item.title : item.titleEn}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {language === 'zh' ? item.status : item.statusEn}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        <span>{t.annotator}：{language === 'zh' ? item.author : item.authorEn}</span>
                        <span className="ml-4">{t.time}：{item.time || '--'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
            {/* 最新年度关键指标 */}
            <Card>
              <CardHeader>
                <CardTitle>{t.latestKeyIndicators}</CardTitle>
                {processedFinancials.summary.fiscalYear && (
                  <p className="text-sm text-muted-foreground">
                    {t.latestFiscalYear}：{processedFinancials.summary.fiscalYear}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {loadingFinancials ? (
                  <div className="text-sm text-muted-foreground">{t.financialDataLoading}</div>
                ) : financialLoadError ? (
                  <div className="text-sm text-red-500">
                    {t.financialDataError}
                    {financialLoadError !== 'unknown_error'
                      ? `${language === 'zh' ? '：' : ': '}${financialLoadError}`
                      : ''}
                  </div>
                ) : !hasFinancialData ? (
                  <div className="text-sm text-muted-foreground">{t.noFinancialData}</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t.revenue}：</span>
                      <span className="font-medium text-foreground">{processedFinancials.summary.revenue}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t.profit}：</span>
                      <span className="font-medium text-foreground">{processedFinancials.summary.profit}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ROE：</span>
                      <span className="font-medium text-foreground">{processedFinancials.summary.roe}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t.debtRatio}：</span>
                      <span className="font-medium text-foreground">{processedFinancials.summary.debtRatio}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 财务年度数据 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t.financialAnnualData}</CardTitle>
                {selectedCustomerId && (
                  <Button onClick={handleAddFinancialStatement} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {t.addFinancialStatement}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {loadingFinancials ? (
                  <div className="text-sm text-muted-foreground">{t.financialDataLoading}</div>
                ) : financialLoadError ? (
                  <div className="text-sm text-red-500">
                    {t.financialDataError}
                    {financialLoadError !== 'unknown_error'
                      ? `${language === 'zh' ? '：' : ': '}${financialLoadError}`
                      : ''}
                  </div>
                ) : !hasFinancialData ? (
                  <div className="text-sm text-muted-foreground">{t.noFinancialData}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">{t.year}</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">{t.revenue}</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">{t.profit}</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">ROE</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">{t.debtRatio}</th>
                          {selectedCustomerId && (
                            <th className="text-left py-3 px-4 font-medium text-gray-600">{t.actions}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {processedFinancials.annualData.map((item: any, index: number) => {
                          const rowDivider =
                            index !== processedFinancials.annualData.length - 1 ? 'border-b border-gray-100' : '';
                          // Find the first item with actual financial data (not N/A)
                          const firstDataIndex = processedFinancials.annualData.findIndex(
                            (d: any) => d.revenue !== 'N/A' && d.revenue !== '—'
                          );
                          const isLatestWithData = index === firstDataIndex;

                          return (
                            <tr key={item.year ?? index} className={rowDivider}>
                              <td className="py-3 px-4 text-black">{item.year ?? '—'}</td>
                              <td className="py-3 px-4 text-black">{item.revenue ?? '—'}</td>
                              <td className="py-3 px-4 text-black">{item.profit ?? '—'}</td>
                              <td className="py-3 px-4 text-black">{item.roe ?? '—'}</td>
                              <td className="py-3 px-4 text-black">{item.debtRatio ?? '—'}</td>
                              {selectedCustomerId && (
                                <td className="py-3 px-4">
                                  {item.financial_statement_id && (
                                    <div className="flex gap-2">
                                      {/* Only show Edit button for most recent statement with data */}
                                      {isLatestWithData && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            // Find the original statement from financialStatements
                                            const originalStatement = financialStatements.find(
                                              s => s.statement_id === item.financial_statement_id
                                            );
                                            if (originalStatement) {
                                              handleEditFinancialStatement(originalStatement);
                                            }
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          // Find the original statement from financialStatements
                                          const originalStatement = financialStatements.find(
                                            s => s.statement_id === item.financial_statement_id
                                          );
                                          if (originalStatement) {
                                            setFinancialToDelete(originalStatement);
                                            setDeleteFinancialDialogOpen(true);
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 收入与净利润趋势 */}
            <Card>
              <CardHeader>
                <CardTitle>{t.revenueAndProfitTrend}</CardTitle>
                {processedFinancials.revenueUnitLabel && (
                  <p className="text-xs text-muted-foreground">
                    {language === 'zh'
                      ? `单位：${processedFinancials.revenueUnitLabel}`
                      : `Unit: ${processedFinancials.revenueUnitLabel}`}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {loadingFinancials ? (
                  <div className="text-sm text-muted-foreground">{t.financialDataLoading}</div>
                ) : financialLoadError ? (
                  <div className="text-sm text-red-500">
                    {t.financialDataError}
                    {financialLoadError !== 'unknown_error'
                      ? `${language === 'zh' ? '：' : ': '}${financialLoadError}`
                      : ''}
                  </div>
                ) : processedFinancials.revenueProfitTrend.length === 0 ? (
                  <div className="text-sm text-muted-foreground">{t.noFinancialData}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={processedFinancials.revenueProfitTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                        domain={[0, processedFinancials.revenueScaleMax]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name={t.profitLabel}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name={t.revenueLabel}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* ROE与负债率趋势 */}
            <Card>
              <CardHeader>
                <CardTitle>{t.roeAndDebtTrend}</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingFinancials ? (
                  <div className="text-sm text-muted-foreground">{t.financialDataLoading}</div>
                ) : financialLoadError ? (
                  <div className="text-sm text-red-500">
                    {t.financialDataError}
                    {financialLoadError !== 'unknown_error'
                      ? `${language === 'zh' ? '：' : ': '}${financialLoadError}`
                      : ''}
                  </div>
                ) : processedFinancials.roeDebtTrend.length === 0 ? (
                  <div className="text-sm text-muted-foreground">{t.noFinancialData}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={processedFinancials.roeDebtTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                        domain={[0, processedFinancials.roeScaleMax]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
                      <Line
                        type="monotone"
                        dataKey="roe"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name={t.roeLabel}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="debtRatio"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name={t.debtLabel}
                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="interaction" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t.latestInteractions}</CardTitle>
                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => navigate('/interactions/create')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {language === 'zh' ? '添加互动' : 'Add Interaction'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedInteractions.map((item) => {
                    const display = getInteractionDisplay(item);
                    return (
                    <div key={display.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{display.type}</span>
                          <span className="text-xs text-muted-foreground">{display.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{display.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedInteraction(item);
                          setIsInteractionDetailOpen(true);
                        }}
                        className="text-[#009699] hover:text-[#007a7d]"
                      >
                        {language === 'zh' ? '查看详情' : 'View Detail'}
                      </Button>
                    </div>
                    );
                  })}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline">
                    {t.viewAllInteractions}
                  </Button>
                </div>
              </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.latestNews}</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingNews ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === 'zh' ? '加载新闻中...' : 'Loading news...'}
                  </div>
                ) : allNews.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {allNews.map((item) => (
                        <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <h4 className="font-medium mb-2">{language === 'zh' ? item.title : item.titleEn}</h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            {item.date}
                            {item.source && ` • ${item.source}`}
                            {item.importance && ` • ${language === 'zh' ? '重要性' : 'Importance'}: ${item.importance}/5`}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {language === 'zh' ? item.content : item.contentEn}
                          </p>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center mt-2 text-sm text-[#009699] hover:text-[#007a7d]"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {language === 'zh' ? '查看原文' : 'Read more'}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 text-center">
                      <Button variant="outline" onClick={() => {
                        if (selectedCustomerId) {
                          navigate(`/customer-insights/${selectedCustomerId}/news`);
                        }
                      }}>
                        {t.viewAllNews}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === 'zh' ? '暂无相关新闻' : 'No news available'}
                  </div>
                )}
              </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{t.documentManagement}</h2>
              
              {documentCategories.map((category) => (
                <Card key={category.id} className="border border-gray-200">
                  <Collapsible
                    open={expandedCategories[category.id]}
                    onOpenChange={() => toggleCategory(category.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {expandedCategories[category.id] ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base">{category.label}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* File Upload Area */}
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {t.uploadedDocuments.replace('{category}', category.label)}
                            </p>
                            
                            <div
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                              style={{ backgroundColor: 'rgba(248, 250, 252, 0.8)' }}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = true;
                                input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.png';
                                input.onchange = (e) => {
                                  const target = e.target as HTMLInputElement;
                                  handleFileUpload(category.id, target.files);
                                };
                                input.click();
                              }}
                            >
                              <div className="flex flex-col items-center space-y-2">
                                <Upload className="h-8 w-8 text-gray-400" />
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-600">{t.dragDropText}</p>
                                  <p className="text-xs text-gray-500">{t.fileSizeLimit}</p>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="mt-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {t.browseFiles}
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Uploaded Files List */}
                          <div className="space-y-2">
                            {loadingDocuments ? (
                              <div className="text-center py-4 text-muted-foreground">
                                {language === 'zh' ? '加载中...' : 'Loading...'}
                              </div>
                            ) : dbDocuments.filter(doc => doc.category === category.id).length > 0 ? (
                              <div className="space-y-2">
                                {dbDocuments.filter(doc => doc.category === category.id).map((doc) => (
                                  <div
                                    key={doc.document_id}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-background"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <p className="text-sm font-medium">{doc.file_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {t.uploadDate}: {new Date(doc.uploaded_at).toLocaleDateString()} • {Math.round(doc.file_size / 1024)} KB
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFileRead(doc.document_id)}
                                        className="text-gray-600 hover:text-gray-800"
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        {t.read}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFileDownload(doc.document_id)}
                                        className="text-gray-600 hover:text-gray-800"
                                      >
                                        <Download className="h-4 w-4 mr-1" />
                                        {t.download}
                                      </Button>
                                      <AlertDialog open={deleteDialogOpen && fileToDelete?.fileId === doc.document_id} onOpenChange={setDeleteDialogOpen}>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteClick(category.id, doc.document_id, doc.file_name)}
                                            className="text-gray-600 hover:text-gray-800"
                                          >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            {t.delete}
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>{t.deleteConfirmTitle}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              {t.deleteConfirmDescription.replace('{fileName}', doc.file_name)}
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                                              {t.cancelDelete}
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={handleConfirmDelete}
                                            >
                                              {t.confirmDelete}
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div
                                className="p-4 rounded-lg text-center text-sm text-muted-foreground"
                                style={{ backgroundColor: 'rgba(204, 255, 255, 0.2)' }}
                              >
                                {t.noDocuments}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
            </TabsContent>

          </div>
        </Tabs>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditFormError(null);
          setEditFormData({});
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.editCustomer}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editFormError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {editFormError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{language === 'zh' ? '公司名称' : 'Company Name'} *</label>
                <Input
                  value={editFormData.company_name || ''}
                  onChange={(e) => {
                    setEditFormError(null);
                    setEditFormData({ ...editFormData, company_name: e.target.value });
                  }}
                  placeholder={language === 'zh' ? '请输入公司名称' : 'Enter company name'}
                />
              </div>

              <div>
                <label className="text-sm font-medium">{language === 'zh' ? '行业' : 'Industry'}</label>
                <Select
                  value={editFormData.industry_code || ''}
                  onValueChange={(value) => {
                    setEditFormError(null);
                    setEditFormData({ ...editFormData, industry_code: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'zh' ? '选择行业' : 'Select Industry'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECH">{language === 'zh' ? '科技' : 'Technology'}</SelectItem>
                    <SelectItem value="FINSERV">{language === 'zh' ? '金融' : 'Finance'}</SelectItem>
                    <SelectItem value="HEALTHCARE">{language === 'zh' ? '医疗保健' : 'Healthcare'}</SelectItem>
                    <SelectItem value="EDUCATION">{language === 'zh' ? '教育' : 'Education'}</SelectItem>
                    <SelectItem value="MANUF">{language === 'zh' ? '制造业' : 'Manufacturing'}</SelectItem>
                    <SelectItem value="RETAIL">{language === 'zh' ? '零售' : 'Retail'}</SelectItem>
                    <SelectItem value="REALESTATE">{language === 'zh' ? '房地产' : 'Real Estate'}</SelectItem>
                    <SelectItem value="CONSULTING">{language === 'zh' ? '咨询' : 'Consulting'}</SelectItem>
                    <SelectItem value="ENERGY">{language === 'zh' ? '能源' : 'Energy'}</SelectItem>
                    <SelectItem value="AUTOMOTIVE">{language === 'zh' ? '汽车' : 'Automotive'}</SelectItem>
                    <SelectItem value="TELECOM">{language === 'zh' ? '电信' : 'Telecommunications'}</SelectItem>
                    <SelectItem value="MEDIA">{language === 'zh' ? '媒体' : 'Media'}</SelectItem>
                    <SelectItem value="TRANSPORT">{language === 'zh' ? '运输' : 'Transportation'}</SelectItem>
                    <SelectItem value="AGRICULTURE">{language === 'zh' ? '农业' : 'Agriculture'}</SelectItem>
                    <SelectItem value="CONSTRUCTION">{language === 'zh' ? '建筑' : 'Construction'}</SelectItem>
                    <SelectItem value="OTHER">{language === 'zh' ? '其他' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">{language === 'zh' ? '网站' : 'Website'}</label>
                <Input
                  value={editFormData.website || ''}
                  onChange={(e) => {
                    setEditFormError(null);
                    setEditFormData({ ...editFormData, website: e.target.value });
                  }}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium">{language === 'zh' ? '电话' : 'Phone'}</label>
                <Input
                  value={editFormData.phone || ''}
                  onChange={(e) => {
                    setEditFormError(null);
                    setEditFormData({ ...editFormData, phone: e.target.value });
                  }}
                  placeholder={language === 'zh' ? '电话号码' : 'Phone number'}
                />
              </div>

              <div>
                <label className="text-sm font-medium">{language === 'zh' ? '邮箱' : 'Email'}</label>
                <Input
                  value={editFormData.email || ''}
                  onChange={(e) => {
                    setEditFormError(null);
                    setEditFormData({ ...editFormData, email: e.target.value });
                  }}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium">{language === 'zh' ? '客户类型' : 'Customer Type'}</label>
                <Select
                  value={editFormData.customer_type || ''}
                  onValueChange={(value) => {
                    setEditFormError(null);
                    setEditFormData({ ...editFormData, customer_type: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'zh' ? '选择客户类型' : 'Select Customer Type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smb">{language === 'zh' ? '中小企业' : 'SMB'}</SelectItem>
                    <SelectItem value="enterprise">{language === 'zh' ? '大型企业' : 'Enterprise'}</SelectItem>
                    <SelectItem value="startup">{language === 'zh' ? '初创公司' : 'Startup'}</SelectItem>
                    <SelectItem value="strategic">{language === 'zh' ? '战略客户' : 'Strategic'}</SelectItem>
                    <SelectItem value="lead">{language === 'zh' ? '潜在商机' : 'Lead'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">{language === 'zh' ? '客户状态' : 'Customer Status'}</label>
                <Select
                  value={editFormData.status || 'active'}
                  onValueChange={(value) => {
                    setEditFormError(null);
                    setEditFormData({ ...editFormData, status: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{language === 'zh' ? '活跃' : 'Active'}</SelectItem>
                    <SelectItem value="inactive">{language === 'zh' ? '非活跃' : 'Inactive'}</SelectItem>
                    <SelectItem value="prospect">{language === 'zh' ? '潜在客户' : 'Prospect'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">{language === 'zh' ? '描述' : 'Description'}</label>
                <Textarea
                  value={editFormData.description || ''}
                  onChange={(e) => {
                    setEditFormError(null);
                    setEditFormData({ ...editFormData, description: e.target.value });
                  }}
                  placeholder={language === 'zh' ? '公司描述' : 'Company description'}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">{language === 'zh' ? '地址' : 'Address'}</label>
                <Input
                  value={editFormData.address_line1 || ''}
                  onChange={(e) => {
                    setEditFormError(null);
                    setEditFormData({ ...editFormData, address_line1: e.target.value });
                  }}
                  placeholder={language === 'zh' ? '街道地址' : 'Street address'}
                />
              </div>

              <div>
                <label className="text-sm font-medium">{language === 'zh' ? '城市' : 'City'}</label>
                <Input
                  value={editFormData.city || ''}
                  onChange={(e) => {
                    setEditFormError(null);
                    setEditFormData({ ...editFormData, city: e.target.value });
                  }}
                  placeholder={language === 'zh' ? '城市' : 'City'}
                />
              </div>

              <div>
                <label className="text-sm font-medium">{language === 'zh' ? '国家' : 'Country'}</label>
                <Input
                  value={editFormData.country || ''}
                  onChange={(e) => {
                    setEditFormError(null);
                    setEditFormData({ ...editFormData, country: e.target.value });
                  }}
                  placeholder={language === 'zh' ? '国家' : 'Country'}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={savingEdit}
              >
                {t.cancel}
              </Button>
              <Button
                className="bg-[#009699] text-white hover:bg-[#007d7f]"
                onClick={async () => {
                  if (!editFormData.company_name?.trim()) {
                    setEditFormError(language === 'zh' ? '公司名称为必填项' : 'Company name is required');
                    return;
                  }

                  if (!selectedCustomerId) {
                    setEditFormError(language === 'zh' ? '未选择客户' : 'No customer selected');
                    return;
                  }

                  setSavingEdit(true);
                  setEditFormError(null);

                  try {
                    const payload = {
                      ...editFormData,
                      customer_type: editFormData.customer_type
                        ? editFormData.customer_type.toLowerCase()
                        : undefined,
                      status: editFormData.status
                        ? editFormData.status.toLowerCase()
                        : undefined
                    };

                    const response = await api.customersApi.update(selectedCustomerId.toString(), payload);

                    if (response.error) {
                      setEditFormError(response.error);
                      return;
                    }

                    // Refresh customers list
                    const customersResponse = await api.customersApi.getAll({ limit: 1000 });
                    if (customersResponse.data?.customers) {
                      setDbCustomers(customersResponse.data.customers);
                    }

                    setIsEditDialogOpen(false);
                    alert(language === 'zh' ? '客户信息更新成功！' : 'Customer updated successfully!');
                  } catch (error) {
                    console.error('Error updating customer:', error);
                    setEditFormError(error instanceof Error ? error.message : 'Failed to update customer');
                  } finally {
                    setSavingEdit(false);
                  }
                }}
                disabled={savingEdit}
              >
                {savingEdit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'zh' ? '保存中...' : 'Saving...'}
                  </>
                ) : (
                  t.save
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interaction Detail Dialog */}
      <Dialog open={isInteractionDetailOpen} onOpenChange={setIsInteractionDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.interactionDetails}</DialogTitle>
          </DialogHeader>
          {selectedInteraction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">{t.interactionType}</label>
                  <p className="mt-1 text-sm">
                    {language === 'zh'
                      ? (selectedInteraction.interaction_type || selectedInteraction.type)
                      : (selectedInteraction.interaction_type || selectedInteraction.typeEn || selectedInteraction.type)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">{t.interactionDate}</label>
                  <p className="mt-1 text-sm">
                    {selectedInteraction.interaction_date
                      ? new Date(selectedInteraction.interaction_date).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')
                      : selectedInteraction.date}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">{t.interactionSubject}</label>
                <p className="mt-1 text-sm">
                  {selectedInteraction.subject}
                </p>
              </div>

              {selectedInteraction.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">{t.interactionDescription}</label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedInteraction.description}</p>
                </div>
              )}

              {selectedInteraction.private_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {language === 'zh' ? '私人备注' : 'Private Notes'}
                  </label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedInteraction.private_notes}</p>
                </div>
              )}

              {selectedInteraction.outcome && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {language === 'zh' ? '结果' : 'Outcome'}
                  </label>
                  <p className="mt-1 text-sm">{selectedInteraction.outcome}</p>
                </div>
              )}

              {selectedInteraction.follow_up_date && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">
                    {language === 'zh' ? '需要跟进' : 'Follow-up Required'}
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {language === 'zh' ? '跟进日期: ' : 'Follow-up Date: '}
                    {new Date(selectedInteraction.follow_up_date).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => setIsInteractionDetailOpen(false)}>
              {t.close}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Financial Statement Dialog */}
      <Dialog open={isFinancialDialogOpen} onOpenChange={handleFinancialDialogChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFinancial ? t.editFinancialStatement : t.addFinancialStatement}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {financialFormError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {financialFormError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t.fiscalYear} *</label>
                <Input
                  value={financialFormData.fiscal_year}
                  onChange={(e) => setFinancialFormData({ ...financialFormData, fiscal_year: e.target.value })}
                  placeholder={language === 'zh' ? '例如: 2024' : 'e.g., 2024'}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t.currency}</label>
                <Select
                  value={financialFormData.currency_id}
                  onValueChange={(value) => setFinancialFormData({ ...financialFormData, currency_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'zh' ? '选择货币' : 'Select currency'} />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency: any) => (
                      <SelectItem key={currency.currency_id} value={currency.currency_id}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t.revenue}</label>
                <Input
                  type="number"
                  step="0.01"
                  value={financialFormData.revenue}
                  onChange={(e) => setFinancialFormData({ ...financialFormData, revenue: e.target.value })}
                  placeholder={language === 'zh' ? '营业收入' : 'Revenue'}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t.profit}</label>
                <Input
                  type="number"
                  step="0.01"
                  value={financialFormData.net_profit}
                  onChange={(e) => setFinancialFormData({ ...financialFormData, net_profit: e.target.value })}
                  placeholder={language === 'zh' ? '净利润' : 'Net Profit'}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">ROE (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={financialFormData.roe}
                  onChange={(e) => setFinancialFormData({ ...financialFormData, roe: e.target.value })}
                  placeholder="ROE"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t.debtRatio} (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={financialFormData.debt_ratio}
                  onChange={(e) => setFinancialFormData({ ...financialFormData, debt_ratio: e.target.value })}
                  placeholder={language === 'zh' ? '负债率' : 'Debt Ratio'}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t.notesOptional}</label>
              <Textarea
                value={financialFormData.notes}
                onChange={(e) => setFinancialFormData({ ...financialFormData, notes: e.target.value })}
                rows={3}
                placeholder={language === 'zh' ? '添加备注...' : 'Add notes...'}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsFinancialDialogOpen(false)}
              disabled={savingFinancial}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleSaveFinancialStatement}
              disabled={savingFinancial}
            >
              {savingFinancial ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.saving}
                </>
              ) : (
                t.save
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Financial Statement Confirmation Dialog */}
      <AlertDialog open={deleteFinancialDialogOpen} onOpenChange={setDeleteFinancialDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteFinancialTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {financialToDelete && t.deleteFinancialDescription.replace('{year}', financialToDelete.fiscal_year)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancelDelete}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFinancialStatement} className="bg-red-600 hover:bg-red-700">
              {t.confirmDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
