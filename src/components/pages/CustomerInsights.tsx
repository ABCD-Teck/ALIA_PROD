import React, { useState } from 'react';
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
import { Building2, Plus, TrendingUp, TrendingDown, Calendar, User, ExternalLink, MessageSquare, Download, Upload, FileText, Eye, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Language, CustomerInsightsTab } from '../../App';

interface CustomerInsightsProps {
  searchQuery: string;
  language: Language;
  currentTab: CustomerInsightsTab;
  onTabChange: (tab: CustomerInsightsTab) => void;
}

const companies = [
  {
    id: 'byd',
    name: 'BYD',
    nameCn: '比亚迪',
    ticker: '002594.SZ',
    type: '上市',
    typeEn: 'Listed',
    sector: '汽车',
    sectorEn: 'Automotive',
    marketCap: '¥9000亿',
    stockPrice: '¥250.00',
    pe: '35.2',
    rating: 'A+',
    description: '比亚迪是中国领先的新能源汽车制造商，业务涵盖汽车、轨道交通、新能源和电子等领域。',
    descriptionEn: 'BYD is a leading Chinese new energy vehicle manufacturer, with business covering automotive, rail transit, new energy, and electronics sectors.',
    financials: {
      revenue: '¥7777亿',
      profit: '402亿',
      roe: '15.5%',
      debtRatio: '55.4%',
      annualData: [
        { year: '2023', revenue: 6023, profit: 300, roe: 15.1, debtRatio: 54.8 },
        { year: '2024', revenue: 7777, profit: 402, roe: 15.5, debtRatio: 55.4 }
      ],
      trendData: {
        revenueAndProfit: [
          { name: '2023.0', revenue: 6023, profit: 300 },
          { name: '2023.5', revenue: 6800, profit: 340 },
          { name: '2024.0', revenue: 7777, profit: 402 }
        ],
        roeAndDebt: [
          { name: '2023.0', roe: 15.1, debtRatio: 54.8 },
          { name: '2023.5', roe: 15.3, debtRatio: 55.0 },
          { name: '2024.0', roe: 15.5, debtRatio: 55.4 }
        ]
      }
    },
    news: [
      {
        id: 1,
        title: '比亚迪董事长出席全球新能源论坛',
        titleEn: 'BYD Chairman Attends Global New Energy Forum',
        date: '2025-06-18',
        content: '比亚迪董事长发表主题演讲。',
        contentEn: 'BYD Chairman delivers keynote speech.'
      },
      {
        id: 2,
        title: '比亚迪海鸥EV全球销量突破100万辆',
        titleEn: 'BYD Seagull EV Global Sales Surpass 1 Million Units',
        date: '2025-06-18',
        content: '2025年6月，比亚迪宣布其主打入门级市场的海鸥(Seagull)电动车自2023年上市以来，累计销量突破100万辆。海鸥以在全球范围内，尤其是中国国内的强势表现，并已进入欧洲、南美等海外市场。2024年11月，海鸥成为中国市场的全品类"销量冠军"，2025年，海鸥在全球多地持续斩获Model Y在某些令人震撼的持续销量表现，比亚迪又为海鸥配备了"天神之眼"智能驾驶系统，持续提升产品竞争力。',
        contentEn: 'In June 2025, BYD announced that its entry-level Seagull electric vehicle has surpassed 1 million units in cumulative sales since its launch in 2023. The Seagull has demonstrated strong performance globally, particularly in China, and has entered overseas markets including Europe and South America. In November 2024, the Seagull became the "sales champion" across all categories in the Chinese market. In 2025, the Seagull continues to achieve impressive sales performance globally in competition with Model Y, with BYD equipping the Seagull with the "Eye of God" intelligent driving system to continuously enhance product competitiveness.'
      },
      {
        id: 3,
        title: '德系车电动转型不佳 特斯拉与比亚迪继续领跑',
        titleEn: 'German Automakers Struggle with EV Transition, Tesla and BYD Continue to Lead',
        date: '2025-06-08',
        content: '德国汽车已处在电动化转型中面临压力，国际消费者协会（ICCT）的最新报告显示，宝马、奔驰、大众等均未所有，而中国车企在欧前内测，反而中国主导全球新能源车竞争体系。特斯拉和比亚迪部分列位居前内测，比亚迪销量配号全球第一。印度疫情汽车竞跨境，而目前已排列排排个非营利机构，具有行业权威性。',
        contentEn: 'German automakers are facing pressure in their electric transition. The latest report from the International Council on Clean Transportation (ICCT) shows that BMW, Mercedes-Benz, Volkswagen and others are lagging behind, while Chinese automakers are leading the global new energy vehicle competition. Tesla and BYD rank among the top performers, with BYD achieving the highest global sales volume. This authoritative non-profit organization report highlights the industry dynamics.'
      }
    ],
    interactions: [
      {
        id: 1,
        type: '客户拜访',
        typeEn: 'Customer Visit',
        date: '2025-06-12',
        description: '拜访财务总监，了解新财报进展',
        descriptionEn: 'Visit CFO to understand new financial report progress'
      },
      {
        id: 2,
        type: '客户拜访',
        typeEn: 'Customer Visit',
        date: '2025-06-09',
        description: '讨论与欧洲车企合作细节',
        descriptionEn: 'Discuss cooperation details with European automakers'
      },
      {
        id: 3,
        type: '客户拜访',
        typeEn: 'Customer Visit',
        date: '2025-09-12',
        description: '讨论欧洲市场合作细节',
        descriptionEn: 'Discuss European market cooperation details'
      }
    ],
    focus: {
      title: '和比亚迪洽谈融资需求',
      titleEn: 'Negotiate financing needs with BYD',
      status: '可以继续推进',
      statusEn: 'Can continue to proceed',
      author: '张三',
      authorEn: 'John Zhang',
      time: '2025-07-09 12:27:45'
    },
    annotations: [
      {
        id: 1,
        title: '和比亚迪洽谈融资需求',
        titleEn: 'Negotiate financing needs with BYD',
        status: '可以继续推进',
        statusEn: 'Can continue to proceed',
        author: '张三',
        authorEn: 'John Zhang',
        time: '2025-07-09 12:27:45'
      }
    ]
  }
];

export function CustomerInsights({ searchQuery, language, currentTab, onTabChange }: CustomerInsightsProps) {
  const [selectedCompany, setSelectedCompany] = useState('byd');
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({ title: '', status: '', author: '' });
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{categoryId: string, fileId: string, fileName: string} | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, Array<{id: string, name: string, size: number, uploadDate: string}>>>({
    'customerInfo': [
      {
        id: '1',
        name: language === 'zh' ? '比亚迪工商注册证明.pdf' : 'BYD Business Registration Certificate.pdf',
        size: 1024000,
        uploadDate: '2024-12-18'
      }
    ],
    'financialOperations': [
      {
        id: '2',
        name: language === 'zh' ? '比亚迪2024年度财务报告.pdf' : 'BYD 2024 Annual Financial Report.pdf',
        size: 2048000,
        uploadDate: '2024-12-15'
      },
      {
        id: '3',
        name: language === 'zh' ? '比亚迪Q3季度报告.xlsx' : 'BYD Q3 Quarterly Report.xlsx',
        size: 512000,
        uploadDate: '2024-12-10'
      }
    ]
  });
  
  const content = {
    zh: {
      title: '客户洞察',
      newCustomer: '新建客户',
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
      marketCap: '市值',
      stockPrice: '股价',
      peRatio: 'PE',
      rating: '评级',
      revenue: '营业收入',
      profit: '净利润',
      roe: 'ROE',
      debtRatio: '负债率',
      listed: '上市',
      automotive: '汽车',
      latestKeyIndicators: '最新年度关键指标 (2024)',
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
      downloadPdfTitle: '下载客户财报PDF',
      pdfFileName: '比亚迪 BYD 2024 年度财报PDF文件',
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
      cancelDelete: '取消'
    },
    en: {
      title: 'Customer Insights',
      newCustomer: 'New Customer',
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
      marketCap: 'Market Cap',
      stockPrice: 'Stock Price',
      peRatio: 'PE',
      rating: 'Rating',
      revenue: 'Revenue',
      profit: 'Net Profit',
      roe: 'ROE',
      debtRatio: 'Debt Ratio',
      listed: 'Listed',
      automotive: 'Automotive',
      latestKeyIndicators: 'Latest Annual Key Indicators (2024)',
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
      downloadPdfTitle: 'Download Customer Financial Report PDF',
      pdfFileName: 'BYD 2024 Annual Financial Report PDF',
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
      cancelDelete: 'Cancel'
    }
  };

  const t = content[language];

  const company = companies.find(c => c.id === selectedCompany) || companies[0];

  // 按日期排序互动记录（最新的在最上面）
  const sortedInteractions = [...company.interactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 过滤搜索结果
  const filteredCompanies = searchQuery
    ? companies.filter(comp => 
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.nameCn.includes(searchQuery) ||
        comp.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.includes(searchQuery) ||
        comp.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : companies;

  const handleAddAnnotation = () => {
    if (newAnnotation.title && newAnnotation.status && newAnnotation.author) {
      const currentDate = new Date().toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US');
      console.log('New annotation:', { ...newAnnotation, time: currentDate });
      setNewAnnotation({ title: '', status: '', author: '' });
      setIsAnnotationDialogOpen(false);
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

  const handleFileUpload = (categoryId: string, files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      uploadDate: new Date().toISOString().split('T')[0]
    }));

    setUploadedFiles(prev => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), ...newFiles]
    }));
  };

  const handleFileRead = (fileName: string) => {
    console.log('Reading file:', fileName);
  };

  const handleFileDownload = (fileName: string) => {
    console.log('Downloading file:', fileName);
  };

  const handleDeleteClick = (categoryId: string, fileId: string, fileName: string) => {
    setFileToDelete({ categoryId, fileId, fileName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!fileToDelete) return;
    
    setUploadedFiles(prev => ({
      ...prev,
      [fileToDelete.categoryId]: prev[fileToDelete.categoryId]?.filter(file => file.id !== fileToDelete.fileId) || []
    }));
    
    console.log('Deleted file:', fileToDelete.fileName);
    setDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed top section */}
      <div className="space-y-4 mb-6 mt-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">{t.selectCustomer}</label>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filteredCompanies.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {language === 'zh' ? comp.nameCn : comp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold">
                  {language === 'zh' ? company.nameCn : company.name}
                </h2>
                <Badge variant="secondary">{language === 'zh' ? company.type : company.typeEn}</Badge>
                <span className="text-muted-foreground">{company.ticker}</span>
                <span className="text-muted-foreground">{language === 'zh' ? company.sector : company.sectorEn}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t.marketCap}：</span>
                  <span className="font-medium">{company.marketCap}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t.stockPrice}：</span>
                  <span className="font-medium">{company.stockPrice}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">PE：</span>
                  <span className="font-medium">{company.pe}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t.rating}：</span>
                  <span className="font-medium">{company.rating}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs container with fixed tabs and scrollable content */}
      <div className="flex-1 flex flex-col">
        <Tabs value={currentTab} onValueChange={(value) => onTabChange(value as CustomerInsightsTab)} className="h-full flex flex-col">
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
                <p className="text-sm leading-relaxed">{language === 'zh' ? company.description : company.descriptionEn}</p>
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
                    <span className="font-medium">{company.financials.revenue}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t.profit}：</span>
                    <span className="font-medium">{company.financials.profit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ROE：</span>
                    <span className="font-medium">{company.financials.roe}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t.debtRatio}：</span>
                    <span className="font-medium">{company.financials.debtRatio}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.latestNews}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {company.news.slice(0, 2).map((item) => (
                    <div key={item.id} className="border-b pb-3 last:border-b-0">
                      <h4 className="font-medium mb-1">{language === 'zh' ? item.title : item.titleEn}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{item.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'zh' 
                          ? (item.content.length > 80 ? item.content.substring(0, 80) + '...' : item.content)
                          : (item.contentEn.length > 80 ? item.contentEn.substring(0, 80) + '...' : item.contentEn)
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.latestInteractions}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedInteractions.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{language === 'zh' ? item.type : item.typeEn}</span>
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{language === 'zh' ? item.description : item.descriptionEn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t.latestAnnotations}</CardTitle>
                <Dialog open={isAnnotationDialogOpen} onOpenChange={setIsAnnotationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="teal">
                      <Plus className="mr-1 h-3 w-3" />
                      {t.addAnnotation}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.addAnnotation}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">{t.annotationTitle}</label>
                        <Input
                          value={newAnnotation.title}
                          onChange={(e) => setNewAnnotation({ ...newAnnotation, title: e.target.value })}
                          placeholder={t.annotationTitle}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t.annotationStatus}</label>
                        <Textarea
                          value={newAnnotation.status}
                          onChange={(e) => setNewAnnotation({ ...newAnnotation, status: e.target.value })}
                          placeholder={t.annotationStatus}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t.annotationAuthor}</label>
                        <Input
                          value={newAnnotation.author}
                          onChange={(e) => setNewAnnotation({ ...newAnnotation, author: e.target.value })}
                          placeholder={t.annotationAuthor}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAnnotationDialogOpen(false)}>
                          {t.cancel}
                        </Button>
                        <Button 
                          onClick={handleAddAnnotation}
                          variant="teal"
                        >
                          {t.save}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {company.annotations.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-2 cursor-pointer hover:opacity-80">
                        {language === 'zh' ? item.title : item.titleEn}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">{language === 'zh' ? item.status : item.statusEn}</p>
                      <div className="text-xs text-muted-foreground">
                        <span>{t.annotator}：{language === 'zh' ? item.author : item.authorEn}</span>
                        <span className="ml-4">{t.time}：{item.time}</span>
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
              <CardContent className="pt-6" style={{ backgroundColor: 'rgba(204, 255, 255, 0.2)' }}>
                <h4 className="font-medium mb-3 text-black">{t.latestKeyIndicators}</h4>
                <div className="text-sm text-black">
                  <span>{t.revenue}：¥7777{language === 'zh' ? '亿' : ' billion'}，</span>
                  <span>{t.profit}：402{language === 'zh' ? '亿' : ' billion'}，</span>
                  <span>ROE：15.5%，</span>
                  <span>{t.debtRatio}：55.4%</span>
                </div>
              </CardContent>
            </Card>

            {/* 财务年度数据 */}
            <Card>
              <CardHeader>
                <CardTitle>{t.financialAnnualData}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">{t.year}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">{t.revenue}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">{t.profit}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ROE</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">{t.debtRatio}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {company.financials.annualData.map((item, index) => (
                        <tr key={item.year} className={index !== company.financials.annualData.length - 1 ? "border-b border-gray-100" : ""}>
                          <td className="py-3 px-4 text-black">{item.year}</td>
                          <td className="py-3 px-4 text-black">{item.revenue}</td>
                          <td className="py-3 px-4 text-black">{item.profit}</td>
                          <td className="py-3 px-4 text-black">{item.roe}%</td>
                          <td className="py-3 px-4 text-black">{item.debtRatio}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* 收入与净利润趋势 */}
            <Card>
              <CardHeader>
                <CardTitle>{t.revenueAndProfitTrend}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={company.financials.trendData.revenueAndProfit}>
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
                      domain={[0, 8000]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
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
              </CardContent>
            </Card>

            {/* ROE与负债率趋势 */}
            <Card>
              <CardHeader>
                <CardTitle>{t.roeAndDebtTrend}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={company.financials.trendData.roeAndDebt}>
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
                      domain={[0, 60]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
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
              </CardContent>
            </Card>

            {/* 下载PDF */}
            <Card>
              <CardHeader>
                <CardTitle>{t.downloadPdfTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{t.pdfFileName}</span>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    {t.download}
                  </Button>
                </div>
              </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="interaction" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.latestInteractions}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedInteractions.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{language === 'zh' ? item.type : item.typeEn}</span>
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{language === 'zh' ? item.description : item.descriptionEn}</p>
                      </div>
                    </div>
                  ))}
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
                <div className="space-y-4">
                  {company.news.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{language === 'zh' ? item.title : item.titleEn}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{item.date}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {language === 'zh' ? item.content : item.contentEn}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline">
                    {t.viewAllNews}
                  </Button>
                </div>
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
                            {uploadedFiles[category.id] && uploadedFiles[category.id].length > 0 ? (
                              <div className="space-y-2">
                                {uploadedFiles[category.id].map((file) => (
                                  <div 
                                    key={file.id}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-background"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <p className="text-sm font-medium">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {t.uploadDate}: {file.uploadDate} • {Math.round(file.size / 1024)} KB
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFileRead(file.name)}
                                        className="text-gray-600 hover:text-gray-800"
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        {t.read}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFileDownload(file.name)}
                                        className="text-gray-600 hover:text-gray-800"
                                      >
                                        <Download className="h-4 w-4 mr-1" />
                                        {t.download}
                                      </Button>
                                      <AlertDialog open={deleteDialogOpen && fileToDelete?.fileId === file.id} onOpenChange={setDeleteDialogOpen}>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteClick(category.id, file.id, file.name)}
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
                                              {t.deleteConfirmDescription.replace('{fileName}', file.name)}
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
    </div>
  );
}