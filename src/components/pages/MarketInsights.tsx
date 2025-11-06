import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Heart,
  Share2,
  Bookmark,
  Clock,
  Building,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { Language } from '../../App';
import { marketInsightsApi, translationApi } from '../../services/api';
import { ArticleModal } from './ArticleModal';
import { PaginationControls } from '../ui/PaginationControls';

interface MarketInsightsProps {
  searchQuery: string;
  language: Language;
}

// 日报数据
// 四级标签系统 - Now dynamically loaded from API
const defaultTagHierarchy = {
  // 第一级：主要类别 - Will be replaced with dynamic buckets
  level1: [
    { id: 'all', label_zh: '全部', label_en: 'All' },
    { id: 'Macro & Central Banks', label_zh: '宏观经济与央行', label_en: 'Macro & Central Banks' },
    { id: 'Banking & Regulation', label_zh: '银行与监管', label_en: 'Banking & Regulation' },
    { id: 'Markets', label_zh: '市场', label_en: 'Markets' },
    { id: 'Economic Indicators', label_zh: '经济指标', label_en: 'Economic Indicators' },
    { id: 'M&A / IPO / Financing', label_zh: '并购/IPO/融资', label_en: 'M&A / IPO / Financing' },
    { id: 'Fintech & Payments', label_zh: '金融科技与支付', label_en: 'Fintech & Payments' },
    { id: 'Consumer Finance & Housing', label_zh: '消费金融与房产', label_en: 'Consumer Finance & Housing' },
    { id: 'Cybersecurity & Digital Risk', label_zh: '网络安全与数字风险', label_en: 'Cybersecurity & Digital Risk' },
    { id: 'Tech, AI & Data Policy', label_zh: '科技、AI与数据政策', label_en: 'Tech, AI & Data Policy' },
    { id: 'ESG & Sustainability', label_zh: 'ESG与可持续发展', label_en: 'ESG & Sustainability' },
    { id: 'Social Security & Welfare', label_zh: '社会保障与福利', label_en: 'Social Security & Welfare' },
    { id: 'Geopolitics & Trade', label_zh: '地缘政治与贸易', label_en: 'Geopolitics & Trade' },
    { id: 'Rural & Agri / Utilities', label_zh: '农村农业/公用事业', label_en: 'Rural & Agri / Utilities' }
  ],

  // 第二级：子类别
  level2: {
    macro: [
      { id: 'all', label_zh: '全部', label_en: 'All' },
      { id: 'employment', label_zh: '就业', label_en: 'Employment' },
      { id: 'inflation', label_zh: '通货膨胀', label_en: 'Inflation' },
      { id: 'investment', label_zh: '投资', label_en: 'Investment' },
      { id: 'consumption', label_zh: '消费', label_en: 'Consumption' },
      { id: 'export', label_zh: '出口', label_en: 'Export' },
      { id: 'regulation', label_zh: '监管', label_en: 'Regulation' },
      { id: 'stock', label_zh: '股市', label_en: 'Stock Market' },
      { id: 'growth', label_zh: '增长', label_en: 'Growth' },
      { id: 'other_macro', label_zh: '其它', label_en: 'Others' }
    ],
    industry: [
      { id: 'all', label_zh: '全部', label_en: 'All' },
      { id: 'technology', label_zh: '科技', label_en: 'Technology' },
      { id: 'finance', label_zh: '金融', label_en: 'Finance' },
      { id: 'energy', label_zh: '能源', label_en: 'Energy' },
      { id: 'healthcare', label_zh: '医疗', label_en: 'Healthcare' },
      { id: 'manufacturing', label_zh: '制造业', label_en: 'Manufacturing' },
      { id: 'retail', label_zh: '零售', label_en: 'Retail' },
      { id: 'other_industry', label_zh: '其它', label_en: 'Others' }
    ],
    politics: [
      { id: 'all', label_zh: '全部', label_en: 'All' },
      { id: 'domestic', label_zh: '国内政治', label_en: 'Domestic Politics' },
      { id: 'international', label_zh: '国际关系', label_en: 'International Relations' },
      { id: 'policy', label_zh: '政策', label_en: 'Policy' },
      { id: 'election', label_zh: '选举', label_en: 'Election' },
      { id: 'other_politics', label_zh: '其它', label_en: 'Others' }
    ],
    society: [
      { id: 'all', label_zh: '全部', label_en: 'All' },
      { id: 'education', label_zh: '教育', label_en: 'Education' },
      { id: 'culture', label_zh: '文化', label_en: 'Culture' },
      { id: 'environment', label_zh: '环境', label_en: 'Environment' },
      { id: 'social_issues', label_zh: '社会问题', label_en: 'Social Issues' },
      { id: 'other_society', label_zh: '其它', label_en: 'Others' }
    ],
    conflict: [
      { id: 'all', label_zh: '全部', label_en: 'All' },
      { id: 'military', label_zh: '军事', label_en: 'Military' },
      { id: 'regional', label_zh: '地区冲突', label_en: 'Regional Conflict' },
      { id: 'sanctions', label_zh: '制裁', label_en: 'Sanctions' },
      { id: 'diplomatic', label_zh: '外交', label_en: 'Diplomatic' },
      { id: 'other_conflict', label_zh: '其它', label_en: 'Others' }
    ],
    commodities: [
      { id: 'all', label_zh: '全部', label_en: 'All' },
      { id: 'oil', label_zh: '石油', label_en: 'Oil' },
      { id: 'gold', label_zh: '黄金', label_en: 'Gold' },
      { id: 'agriculture', label_zh: '农产品', label_en: 'Agriculture' },
      { id: 'metals', label_zh: '金属', label_en: 'Metals' },
      { id: 'other_commodities', label_zh: '其它', label_en: 'Others' }
    ]
  },

  // 第三级：地区/范围 - Updated to match database schema
  level3: [
    { id: 'all', label_zh: '全部地区', label_en: 'All Regions' },
    { id: 'Global', label_zh: '全球', label_en: 'Global' },
    { id: 'APAC', label_zh: '亚太地区', label_en: 'APAC' },
    { id: 'EMEA', label_zh: '欧洲/中东/非洲', label_en: 'EMEA' },
    { id: 'Americas', label_zh: '美洲', label_en: 'Americas' },
    { id: 'Eastern Europe', label_zh: '东欧', label_en: 'Eastern Europe' }
  ]
};

// Time frame options
const timeFrameOptions = [
  { id: 'all', label_zh: '全部时间', label_en: 'All Time' },
  { id: '1d', label_zh: '今天', label_en: 'Today' },
  { id: '3d', label_zh: '3天内', label_en: 'Last 3 Days' },
  { id: '7d', label_zh: '一周内', label_en: 'Last Week' },
  { id: '30d', label_zh: '一月内', label_en: 'Last Month' },
  { id: '90d', label_zh: '三月内', label_en: 'Last 3 Months' }
];

// Mapping from Level 1 categories to MIA bucket names
const categoryToBucketMap: Record<string, string> = {
  'macro': 'Macro & Central Banks',
  'industry': 'Tech, AI & Data Policy',
  'politics': 'Geopolitics & Trade',
  'society': 'ESG & Sustainability',
  'conflict': 'Geopolitics & Trade',
  'commodities': 'Rural & Agri / Utilities'
};

// Mapping from Level 3 regions to MIA region names - Updated for database compatibility
const regionToMIAMap: Record<string, string> = {
  'Global': 'Global',
  'APAC': 'APAC',
  'Americas': 'Americas',
  'EMEA': 'EMEA',
  'Eastern Europe': 'Eastern Europe'
};

export function MarketInsights({ searchQuery, language }: MarketInsightsProps) {
  // Dynamic data from API
  const [tagHierarchy, setTagHierarchy] = useState(defaultTagHierarchy);
  const [buckets, setBuckets] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [popularTags, setPopularTags] = useState<any[]>([]);
  const [bucketTags, setBucketTags] = useState<any[]>([]); // Top 5 tags for selected bucket

  // Filter states (1: Bucket, 2: Tags, 3: Region, 4: TimeFrame)
  const [selectedLevel1, setSelectedLevel1] = useState('all'); // Bucket
  const [selectedLevel2, setSelectedLevel2] = useState('all'); // Tag
  const [selectedLevel3, setSelectedLevel3] = useState('all'); // Region
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('30d'); // TimeFrame (moved to 4th position)

  // Per-article tags state
  const [articleTags, setArticleTags] = useState<Record<string, string[]>>({});
  const [articleTagInputs, setArticleTagInputs] = useState<Record<string, string>>({});
  const [tagInputVisible, setTagInputVisible] = useState<Record<string, boolean>>({});

  // API state
  const [newsData, setNewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  // Article Modal state
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Auto-translation cache for Chinese interface
  const [translationCache, setTranslationCache] = useState<Record<string, { title?: string; content?: string; source?: string }>>({});
  const [translatingItems, setTranslatingItems] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Dropdown 开关状态
  const [dropdownOpen, setDropdownOpen] = useState<{
    level1: boolean;
    level2: boolean;
    level3: boolean;
    timeFrame: boolean;
  }>({
    level1: false,
    level2: false,
    level3: false,
    timeFrame: false
  });

  // Load initial data from API
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load bucket-specific tags when bucket changes
  useEffect(() => {
    console.log('Bucket selection changed:', selectedLevel1);
    if (selectedLevel1 !== 'all') {
      console.log('Loading tags for bucket:', selectedLevel1);
      loadBucketTags(selectedLevel1);
    } else {
      console.log('Clearing bucket tags - no bucket selected');
      setBucketTags([]);
    }
  }, [selectedLevel1, selectedTimeFrame]);

  // Load tags for a specific bucket using the new bucket_tag API
  const loadBucketTags = async (bucketName: string) => {
    try {
      console.log('Loading bucket tags from API for bucket:', bucketName);

      // Use the new bucket_tag API endpoint
      const response = await marketInsightsApi.getBucketTags(bucketName, { limit: 20 });

      if (response.data && response.data.tags) {
        console.log(`Loaded ${response.data.tags.length} tags for bucket: ${bucketName}`, response.data.tags);
        setBucketTags(response.data.tags);
      } else {
        console.warn('No bucket tags data received from API');
        setBucketTags([
          { id: 'all', label_zh: '全部标签', label_en: 'All Tags', frequency: 0 }
        ]);
      }
    } catch (err) {
      console.error('Failed to load bucket tags from API:', err);

      // Fallback to mock tags based on the selected bucket
      const mockTagsByBucket: Record<string, any[]> = {
        'Macro & Central Banks': [
          { id: 'all', label_zh: '全部标签', label_en: 'All Tags', frequency: 0 },
          { id: 'interest_rates', label_zh: '利率', label_en: 'Interest Rates', frequency: 45 },
          { id: 'monetary_policy', label_zh: '货币政策', label_en: 'Monetary Policy', frequency: 38 },
          { id: 'inflation', label_zh: '通胀', label_en: 'Inflation', frequency: 32 },
          { id: 'federal_reserve', label_zh: '美联储', label_en: 'Federal Reserve', frequency: 28 },
          { id: 'ecb', label_zh: '欧洲央行', label_en: 'ECB', frequency: 24 }
        ],
        'Banking & Regulation': [
          { id: 'all', label_zh: '全部标签', label_en: 'All Tags', frequency: 0 },
          { id: 'basel_iii', label_zh: '巴塞尔协议III', label_en: 'Basel III', frequency: 22 },
          { id: 'compliance', label_zh: '合规', label_en: 'Compliance', frequency: 19 },
          { id: 'stress_test', label_zh: '压力测试', label_en: 'Stress Test', frequency: 16 },
          { id: 'capital_requirements', label_zh: '资本要求', label_en: 'Capital Requirements', frequency: 14 },
          { id: 'risk_management', label_zh: '风险管理', label_en: 'Risk Management', frequency: 12 }
        ],
        'Markets': [
          { id: 'all', label_zh: '全部标签', label_en: 'All Tags', frequency: 0 },
          { id: 'stock_market', label_zh: '股市', label_en: 'Stock Market', frequency: 35 },
          { id: 'bond_market', label_zh: '债券市场', label_en: 'Bond Market', frequency: 29 },
          { id: 'volatility', label_zh: '波动性', label_en: 'Volatility', frequency: 26 },
          { id: 'trading', label_zh: '交易', label_en: 'Trading', frequency: 23 },
          { id: 'market_outlook', label_zh: '市场前景', label_en: 'Market Outlook', frequency: 20 }
        ],
        'Fintech & Payments': [
          { id: 'all', label_zh: '全部标签', label_en: 'All Tags', frequency: 0 },
          { id: 'digital_payments', label_zh: '数字支付', label_en: 'Digital Payments', frequency: 31 },
          { id: 'blockchain', label_zh: '区块链', label_en: 'Blockchain', frequency: 27 },
          { id: 'cryptocurrency', label_zh: '加密货币', label_en: 'Cryptocurrency', frequency: 25 },
          { id: 'mobile_banking', label_zh: '移动银行', label_en: 'Mobile Banking', frequency: 22 },
          { id: 'fintech_innovation', label_zh: '金融科技创新', label_en: 'Fintech Innovation', frequency: 18 }
        ],
        'Tech, AI & Data Policy': [
          { id: 'all', label_zh: '全部标签', label_en: 'All Tags', frequency: 0 },
          { id: 'artificial_intelligence', label_zh: '人工智能', label_en: 'Artificial Intelligence', frequency: 42 },
          { id: 'data_privacy', label_zh: '数据隐私', label_en: 'Data Privacy', frequency: 36 },
          { id: 'tech_regulation', label_zh: '科技监管', label_en: 'Tech Regulation', frequency: 33 },
          { id: 'machine_learning', label_zh: '机器学习', label_en: 'Machine Learning', frequency: 29 },
          { id: 'gdpr', label_zh: 'GDPR', label_en: 'GDPR', frequency: 25 }
        ]
      };

      const fallbackTags = mockTagsByBucket[bucketName] || [
        { id: 'all', label_zh: '全部标签', label_en: 'All Tags', frequency: 0 },
        { id: 'general_topic', label_zh: '一般话题', label_en: 'General Topic', frequency: 15 },
        { id: 'policy_update', label_zh: '政策更新', label_en: 'Policy Update', frequency: 12 },
        { id: 'market_analysis', label_zh: '市场分析', label_en: 'Market Analysis', frequency: 10 }
      ];

      console.log(`Using fallback tags for bucket: ${bucketName}`, fallbackTags);
      setBucketTags(fallbackTags);
    }
  };

  // Load buckets, regions, and tags from API
  const loadInitialData = async () => {
    try {
      // Load buckets
      const bucketsResponse = await marketInsightsApi.getBuckets();
      if (bucketsResponse.data) {
        setBuckets(bucketsResponse.data.buckets);

        // Update Level 1 categories with real bucket data
        const dynamicLevel1 = [
          { id: 'all', label_zh: '全部', label_en: 'All' },
          ...bucketsResponse.data.buckets.map((bucket: any) => ({
            id: bucket.name,
            label_zh: bucket.name === 'Macro & Central Banks' ? '宏观经济与央行' :
                      bucket.name === 'Banking & Regulation' ? '银行与监管' :
                      bucket.name === 'Markets' ? '市场' :
                      bucket.name === 'Economic Indicators' ? '经济指标' :
                      bucket.name === 'M&A / IPO / Financing' ? '并购/IPO/融资' :
                      bucket.name === 'Fintech & Payments' ? '金融科技与支付' :
                      bucket.name === 'Consumer Finance & Housing' ? '消费金融与房产' :
                      bucket.name === 'Cybersecurity & Digital Risk' ? '网络安全与数字风险' :
                      bucket.name === 'Tech, AI & Data Policy' ? '科技、AI与数据政策' :
                      bucket.name === 'ESG & Sustainability' ? 'ESG与可持续发展' :
                      bucket.name === 'Social Security & Welfare' ? '社会保障与福利' :
                      bucket.name === 'Geopolitics & Trade' ? '地缘政治与贸易' :
                      bucket.name === 'Rural & Agri / Utilities' ? '农村农业/公用事业' :
                      bucket.name, // fallback to English name
            label_en: bucket.name,
            article_count: bucket.article_count,
            avg_importance: bucket.avg_importance
          }))
        ];

        setTagHierarchy(prev => ({
          ...prev,
          level1: dynamicLevel1
        }));
      }

      // Load dynamic regions from API
      const regionsResponse = await marketInsightsApi.getRegions();
      if (regionsResponse.data) {
        setRegions(regionsResponse.data.regions);
        setTagHierarchy(prev => ({
          ...prev,
          level3: regionsResponse.data.regions
        }));
      } else {
        // Fallback to default static regions if API fails
        console.warn('Failed to load dynamic regions, using fallback');
        setRegions(defaultTagHierarchy.level3);
      }

      // Load popular tags
      const tagsResponse = await marketInsightsApi.getTags({ limit: 50 });
      if (tagsResponse.data) {
        setPopularTags(tagsResponse.data.tags);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      // Use fallback data on error
      setRegions(defaultTagHierarchy.level3);
    }
  };

  // Get time frame filter for API
  const getTimeFrameFilter = () => {
    if (selectedTimeFrame === 'all') return undefined;

    const days = {
      '1d': 1,
      '3d': 3,
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[selectedTimeFrame] || 30;

    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Fetch articles from API
  const loadArticles = async (isLoadMore = false) => {
    setLoading(true);
    setError(null);

    try {
      const currentOffset = isLoadMore ? offset : 0;

      // Get bucket name for the selected category
      const bucketName = selectedLevel1 === 'all' ? undefined : selectedLevel1;

      // Get region name for the selected level3
      const regionName = selectedLevel3 === 'all' ? undefined :
                         regionToMIAMap[selectedLevel3] || selectedLevel3;

      // Get tag code for the selected level2 (bucket tag)
      const tagCode = selectedLevel2 === 'all' ? undefined : selectedLevel2;

      // Use searchQuery for search
      let searchTerms = searchQuery?.trim() || undefined;

      // Get time frame filter
      const timeFrameFilter = getTimeFrameFilter();

      const response = await marketInsightsApi.getArticles({
        bucket: bucketName,
        region: regionName,
        search: searchTerms,
        tag_code: tagCode, // NEW: Use tag_code instead of adding to search
        importance: 1, // Minimum importance to ensure quality
        limit: limit,
        offset: currentOffset
      });

      if (response.data) {
        let articles = response.data.articles;

        // Client-side filtering by time frame if needed
        if (timeFrameFilter) {
          articles = articles.filter((article: any) => {
            const articleDate = new Date(article.publishTime);
            const filterDate = new Date(timeFrameFilter);
            return articleDate >= filterDate;
          });
        }

        // Sort by importance (descending) then by publish time (descending)
        articles.sort((a: any, b: any) => {
          // First sort by importance (higher importance first)
          if (b.importance !== a.importance) {
            return b.importance - a.importance;
          }
          // Then sort by publish time (newer first)
          return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
        });

        // Update state first to show content immediately
        if (isLoadMore) {
          setNewsData(prev => [...prev, ...articles]);
          setOffset(currentOffset + articles.length);
        } else {
          setNewsData(articles);
          setOffset(articles.length);
        }
        setTotal(response.data.total);
        setHasMore(currentOffset + articles.length < response.data.total);

        // Proactive translation for Chinese interface (non-blocking)
        if (language === 'zh') {
          // Start translations in background - this will update translationCache
          // which will trigger re-renders as translations complete
          console.log('[Load] Starting proactive translation...');
          proactiveTranslate(articles).catch(err => {
            console.error('[Load] Proactive translation error:', err);
          });
        }
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  // Load articles when filters change
  useEffect(() => {
    setOffset(0);
    loadArticles(false);
  }, [selectedLevel1, selectedLevel2, selectedLevel3, selectedTimeFrame, searchQuery]);

  // Auto-translate content for Chinese interface
  const autoTranslate = async (articleId: string, text: string, type: 'title' | 'content' | 'source') => {
    if (!text || text.trim().length === 0 || translatingItems.has(`${articleId}-${type}`)) return text;

    // Check cache first
    const cached = translationCache[articleId]?.[type];
    if (cached) return cached;

    try {
      setTranslatingItems(prev => new Set([...prev, `${articleId}-${type}`]));

      console.log(`[AutoTranslate] Translating ${type} for article ${articleId} from EN to ZH`);
      const response = await translationApi.translate(text, 'zh', 'en');

      if (response.data?.translatedText) {
        const translated = response.data.translatedText;

        // Update cache
        setTranslationCache(prev => ({
          ...prev,
          [articleId]: {
            ...prev[articleId],
            [type]: translated
          }
        }));

        // Save translation to database (async, non-blocking)
        if (type === 'title' || type === 'content') {
          const dbField = type === 'title' ? 'title_zh' : 'summary_zh';

          marketInsightsApi.updateTranslation(articleId, {
            [dbField]: translated
          }).then(result => {
            if (result.data?.success) {
              console.log(`[AutoTranslate] Saved ${type} translation to database for article ${articleId}`);
            } else {
              console.warn(`[AutoTranslate] Failed to save ${type} translation to database:`, result.error);
            }
          }).catch(error => {
            console.error(`[AutoTranslate] Error saving ${type} translation to database:`, error);
          });
        }

        return translated;
      }
    } catch (error) {
      console.error(`Auto-translation failed for ${type}:`, error);
    } finally {
      setTranslatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${articleId}-${type}`);
        return newSet;
      });
    }

    return text; // Return original if translation fails
  };

  // Proactive translation helper - translates immediately when content is loaded
  const proactiveTranslate = async (articles: any[]) => {
    if (language !== 'zh') {
      console.log('[Proactive] Skipping - language is not Chinese');
      return articles;
    }

    console.log(`[Proactive] Starting translation for ${articles.length} articles`);

    const translationPromises = articles.map(async (article) => {
      const translations: any = {};
      let needsTranslation = false;

      // Translate title if missing
      if (!article.title_zh || article.title_zh.trim() === '') {
        console.log(`[Proactive] Article ${article.id} needs title translation`);
        needsTranslation = true;
        translations.title = await autoTranslate(article.id, article.title_en, 'title');
      }

      // Translate content if missing
      if (!article.content_zh || article.content_zh.trim() === '') {
        console.log(`[Proactive] Article ${article.id} needs content translation (content_zh length: ${article.content_zh?.length})`);
        needsTranslation = true;
        translations.content = await autoTranslate(article.id, article.content_en, 'content');
      }

      // Translate source if missing
      if (!article.source_zh || article.source_zh === article.source_en) {
        console.log(`[Proactive] Article ${article.id} needs source translation`);
        needsTranslation = true;
        translations.source = await autoTranslate(article.id, article.source_en, 'source');
      }

      if (!needsTranslation) {
        console.log(`[Proactive] Article ${article.id} already has Chinese content`);
      }

      return { ...article, ...translations };
    });

    return Promise.all(translationPromises);
  };

  // Auto-translate missing Chinese content when language changes to Chinese
  useEffect(() => {
    if (language === 'zh' && newsData.length > 0) {
      newsData.forEach(async (article) => {
        // Auto-translate title if missing
        if (!article.title_zh || article.title_zh === article.title_en) {
          await autoTranslate(article.id, article.title_en, 'title');
        }

        // Auto-translate content if missing
        if (!article.content_zh || article.content_zh === article.content_en) {
          await autoTranslate(article.id, article.content_en, 'content');
        }

        // Auto-translate source if missing
        if (!article.source_zh || article.source_zh === article.source_en) {
          await autoTranslate(article.id, article.source_en, 'source');
        }
      });
    }
  }, [language, newsData]);

  // Filter news (now used as fallback or for local filtering)
  const filteredNews = newsData;

  // Calculate pagination
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedNews = filteredNews.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLevel1, selectedLevel2, selectedLevel3, selectedTimeFrame, searchQuery]);

  // Load tags for all displayed articles
  useEffect(() => {
    const loadAllArticleTags = async () => {
      for (const article of newsData) {
        if (!articleTags[article.id]) {
          try {
            const response = await marketInsightsApi.getArticleTags(article.id);
            if (response.data) {
              setArticleTags(prev => ({
                ...prev,
                [article.id]: response.data.tags.map(t => t.name)
              }));
            }
          } catch (error) {
            console.error(`Failed to load tags for article ${article.id}:`, error);
          }
        }
      }
    };

    if (newsData.length > 0) {
      loadAllArticleTags();
    }
  }, [newsData]);

  // Add tag to article
  const addArticleTag = async (articleId: string) => {
    const tagName = articleTagInputs[articleId]?.trim();
    if (!tagName) return;

    try {
      const response = await marketInsightsApi.addArticleTag(articleId, tagName);
      if (response.data?.success) {
        setArticleTags(prev => ({
          ...prev,
          [articleId]: [...(prev[articleId] || []), tagName]
        }));
        setArticleTagInputs(prev => ({
          ...prev,
          [articleId]: ''
        }));
      }
    } catch (error) {
      console.error(`Failed to add tag to article ${articleId}:`, error);
    }
  };

  // Remove tag from article
  const removeArticleTag = async (articleId: string, tagName: string) => {
    try {
      const response = await marketInsightsApi.removeArticleTag(articleId, tagName);
      if (response.data?.success) {
        setArticleTags(prev => ({
          ...prev,
          [articleId]: (prev[articleId] || []).filter(t => t !== tagName)
        }));
      }
    } catch (error) {
      console.error(`Failed to remove tag from article ${articleId}:`, error);
    }
  };

  // Toggle tag input visibility for an article
  const toggleTagInput = (articleId: string) => {
    setTagInputVisible(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  // 切换dropdown状态
  const toggleDropdown = (level: 'level1' | 'level2' | 'level3' | 'timeFrame') => {
    setDropdownOpen(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  // 关闭所有dropdown
  const closeAllDropdowns = () => {
    setDropdownOpen({
      level1: false,
      level2: false,
      level3: false,
      timeFrame: false
    });
  };

  // 当选择第一级时重置第二级
  const handleLevel1Change = (value: string) => {
    setSelectedLevel1(value);
    setSelectedLevel2('all'); // Reset tag selection
    closeAllDropdowns();
  };

  // 点击外部关闭dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.relative')) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const content = {
    zh: {
      title: '市场洞察',
      source: '信息源',
      publishTime: '发布时间',
      readMore: '阅读全文',
      like: '点赞',
      share: '分享',
      bookmark: '收藏'
    },
    en: {
      title: 'Market Insights',
      source: 'Source',
      publishTime: 'Published',
      readMore: 'Read More',
      like: 'Like',
      share: 'Share',
      bookmark: 'Bookmark'
    }
  };

  const t = content[language];

  // 处理新闻互动
  const handleNewsAction = (newsId: string, action: 'like' | 'bookmark') => {
    setNewsData(prev => prev.map(news => {
      if (news.id === newsId) {
        if (action === 'like') {
          return {
            ...news,
            isLiked: !news.isLiked,
            likes: news.isLiked ? news.likes - 1 : news.likes + 1
          };
        } else if (action === 'bookmark') {
          return {
            ...news,
            isBookmarked: !news.isBookmarked
          };
        }
      }
      return news;
    }));
  };



  // 格式化时间
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (language === 'zh') {
      return `${year}/${month}/${day} ${hours}:${minutes}`;
    } else {
      return `${year}/${month}/${day} ${hours}:${minutes}`;
    }
  };

  return (
    <div className="space-y-6 pt-8">
      {/* 四级标签导航系统 - 所有元素在同一行对齐 */}
      <div className="space-y-4">
        {/* 第一行：所有标签元素水平对齐 */}
        <div className="flex items-center justify-between w-full">

          {/* ���定义标签 - 在同一行 */}
          {/* Section gauche avec les dropdowns - alignés à gauche */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* 第一级：主要类别 */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('level1')}
                className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-24"
              >
                <span className="text-teal-custom font-medium">
                  {tagHierarchy.level1.find(item => item.id === selectedLevel1)?.[language === 'zh' ? 'label_zh' : 'label_en']}
                </span>
                {dropdownOpen.level1 ? <ChevronUp className="h-4 w-4 text-teal-custom" /> : <ChevronDown className="h-4 w-4 text-teal-custom" />}
              </button>
              
              {dropdownOpen.level1 && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40">
                  <div className="py-2">
                    {tagHierarchy.level1.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleLevel1Change(item.id)}
                        className="w-full text-left px-4 py-2 text-teal-custom hover:bg-teal-custom-light transition-colors"
                      >
                        {language === 'zh' ? item.label_zh : item.label_en}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 第二级：热门标签 */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('level2')}
                className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-28"
                disabled={selectedLevel1 === 'all'}
              >
                <span className={`font-medium ${selectedLevel1 === 'all' ? 'text-gray-400' : 'text-teal-custom-80'}`}>
                  {selectedLevel1 === 'all'
                    ? (language === 'zh' ? '选择分类后可用' : 'Select category first')
                    : (bucketTags.find(item => item.id === selectedLevel2)?.[language === 'zh' ? 'label_zh' : 'label_en'] || (language === 'zh' ? '全部标签' : 'All Tags'))
                  }
                </span>
                {selectedLevel1 !== 'all' && (dropdownOpen.level2 ? <ChevronUp className="h-4 w-4 text-teal-custom-80" /> : <ChevronDown className="h-4 w-4 text-teal-custom-80" />)}
              </button>

              {dropdownOpen.level2 && selectedLevel1 !== 'all' && bucketTags.length > 0 && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40">
                  <div className="py-2">
                    {bucketTags.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedLevel2(item.id);
                          closeAllDropdowns();
                        }}
                        className="w-full text-left px-4 py-2 text-teal-custom-80 hover:bg-teal-custom-light transition-colors flex justify-between"
                      >
                        <span>{language === 'zh' ? item.label_zh : item.label_en}</span>
                        {item.frequency > 0 && (
                          <span className="text-xs text-gray-500">({item.frequency})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 第三级：地区/范围 */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('level3')}
                className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-20"
              >
                <span className="text-teal-custom-60 font-medium">
                  {tagHierarchy.level3.find(item => item.id === selectedLevel3)?.[language === 'zh' ? 'label_zh' : 'label_en']}
                </span>
                {dropdownOpen.level3 ? <ChevronUp className="h-4 w-4 text-teal-custom-60" /> : <ChevronDown className="h-4 w-4 text-teal-custom-60" />}
              </button>
              
              {dropdownOpen.level3 && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40">
                  <div className="py-2">
                    {tagHierarchy.level3.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedLevel3(item.id);
                          closeAllDropdowns();
                        }}
                        className="w-full text-left px-4 py-2 text-teal-custom-60 hover:bg-teal-custom-light transition-colors flex justify-between items-center"
                      >
                        <span>{language === 'zh' ? item.label_zh : item.label_en}</span>
                        {(item as any).article_count > 0 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2">
                            {(item as any).article_count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 第四级：时间范围下拉选项 */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('timeFrame')}
                className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-24"
              >
                <span className="text-blue-600 font-medium">
                  {timeFrameOptions.find(item => item.id === selectedTimeFrame)?.[language === 'zh' ? 'label_zh' : 'label_en']}
                </span>
                {dropdownOpen.timeFrame ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />}
              </button>

              {dropdownOpen.timeFrame && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40">
                  <div className="py-2">
                    {timeFrameOptions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedTimeFrame(item.id);
                          closeAllDropdowns();
                        }}
                        className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        {language === 'zh' ? item.label_zh : item.label_en}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-800">
            <X className="h-5 w-5" />
            <div>
              <p className="font-semibold">{language === 'zh' ? '加载失败' : 'Failed to load'}</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadArticles(false)}
              className="ml-auto"
            >
              {language === 'zh' ? '重试' : 'Retry'}
            </Button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && newsData.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-custom" />
          <span className="ml-3 text-gray-600">
            {language === 'zh' ? '加载中...' : 'Loading...'}
          </span>
        </div>
      )}

      {/* 新闻列表 */}
      {!loading || newsData.length > 0 ? (
        <div className="space-y-4">
        {paginatedNews.map((news) => {
          // Smart fallback with auto-translation: use Chinese if available, auto-translate if not, otherwise use English
          const getTitle = () => {
            if (language === 'zh') {
              // First check if we have native Chinese content
              if (news.title_zh && news.title_zh.trim() && news.title_zh !== news.title_en) {
                return news.title_zh;
              }
              // Then check translation cache
              const cached = translationCache[news.id]?.title;
              if (cached && cached.trim()) {
                return cached;
              }
              // Show translation indicator if in progress
              if (translatingItems.has(`${news.id}-title`)) {
                return `${news.title_en} [翻译中...]`;
              }
            }
            return news.title_en;
          };

          const getContent = () => {
            if (language === 'zh') {
              // Debug logging
              console.log(`[Content ${news.id}] content_zh length:`, news.content_zh?.length, 'cached:', !!translationCache[news.id]?.content, 'translating:', translatingItems.has(`${news.id}-content`));

              // First check if we have native Chinese content
              if (news.content_zh && news.content_zh.trim() && news.content_zh !== news.content_en) {
                console.log(`[Content ${news.id}] Using native Chinese`);
                return news.content_zh;
              }
              // Then check translation cache
              const cached = translationCache[news.id]?.content;
              if (cached && cached.trim()) {
                console.log(`[Content ${news.id}] Using cached translation`);
                return cached;
              }
              // Show translation indicator if in progress
              if (translatingItems.has(`${news.id}-content`)) {
                console.log(`[Content ${news.id}] Translation in progress`);
                return `${news.content_en} [翻译中...]`;
              }
              console.log(`[Content ${news.id}] Falling back to English`);
            }
            return news.content_en;
          };

          const getSource = () => {
            if (language === 'zh') {
              // First check if we have native Chinese source
              if (news.source_zh && news.source_zh.trim() && news.source_zh !== news.source_en) {
                return news.source_zh;
              }
              // Then check translation cache
              const cached = translationCache[news.id]?.source;
              if (cached && cached.trim()) {
                return cached;
              }
              // Show translation indicator if in progress
              if (translatingItems.has(`${news.id}-source`)) {
                return `${news.source_en} [翻译中...]`;
              }
            }
            return news.source_en;
          };

          return (
            <Card key={news.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* 标题 */}
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 leading-relaxed flex-1 pr-4">
                    {getTitle()}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(news.publishTime)}</span>
                  </div>
                </div>

                {/* 分类标签 */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {tagHierarchy.level1.find(cat => cat.id === news.category)?.[language === 'zh' ? 'label_zh' : 'label_en']}
                  </Badge>
                  {/* Importance Badge */}
                  {news.importance && (
                    <Badge
                      variant={news.importance >= 4 ? "destructive" : news.importance >= 3 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {language === 'zh' ? `重要性 ${news.importance}` : `Importance ${news.importance}`}
                    </Badge>
                  )}
                  {/* Bucket Badge */}
                  {news.bucket && (
                    <Badge variant="outline" className="text-xs">
                      {news.bucket}
                    </Badge>
                  )}
                </div>

                {/* 内容 */}
                <p className="text-gray-700 leading-relaxed line-clamp-3">
                  {getContent()}
                </p>

                {/* Custom Tags Section */}
                <div className="space-y-2">
                  {/* Display existing tags */}
                  {articleTags[news.id] && articleTags[news.id].length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {articleTags[news.id].map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full text-xs text-blue-700 border border-blue-200"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => removeArticleTag(news.id, tag)}
                            className="text-blue-400 hover:text-blue-600"
                            title={language === 'zh' ? '删除标签' : 'Remove tag'}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add tag button / input */}
                  <div className="flex items-center gap-2">
                    {!tagInputVisible[news.id] ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTagInput(news.id);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        <span>{language === 'zh' ? '添加标签' : 'Add Tag'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          type="text"
                          placeholder={language === 'zh' ? '输入标签...' : 'Enter tag...'}
                          value={articleTagInputs[news.id] || ''}
                          onChange={(e) => setArticleTagInputs(prev => ({
                            ...prev,
                            [news.id]: e.target.value
                          }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addArticleTag(news.id);
                            }
                          }}
                          className="w-40 h-8 text-xs"
                          autoFocus
                        />
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            addArticleTag(news.id);
                          }}
                          size="sm"
                          className="h-8 px-3 text-xs"
                          disabled={!articleTagInputs[news.id]?.trim()}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTagInput(news.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 元信息和操作 */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      <span>{t.source}: {getSource()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* 点赞按钮 */}
                    <button
                      onClick={() => handleNewsAction(news.id, 'like')}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors text-gray-500 hover:bg-gray-50"
                    >
                      <Heart className={`h-3 w-3 transition-colors ${news.isLiked ? 'fill-current text-red-600' : 'text-gray-500'}`} />
                      <span className={news.isLiked ? 'text-red-600' : 'text-gray-500'}>{news.likes}</span>
                    </button>

                    {/* 分享按钮 */}
                    <button className="flex items-center gap-1 px-3 py-1 rounded-full text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Share2 className="h-3 w-3" />
                    </button>

                    {/* 收藏按钮 */}
                    <button
                      onClick={() => handleNewsAction(news.id, 'bookmark')}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors text-gray-500 hover:bg-gray-50"
                    >
                      <Bookmark className={`h-3 w-3 transition-colors ${news.isBookmarked ? 'fill-current text-[#009699]' : 'text-gray-500'}`} />
                    </button>

                    {/* 阅读更多 */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setSelectedArticleId(news.id);
                        setIsArticleModalOpen(true);
                      }}
                    >
                      {t.readMore}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      ) : null}

      {/* Pagination Controls */}
      {!loading && filteredNews.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredNews.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          language={language}
        />
      )}

      {/* 加载更多按钮 */}
      {filteredNews.length > 0 && hasMore && !loading && (
        <div className="text-center pt-6">
          <Button
            variant="outline"
            className="px-8"
            onClick={() => loadArticles(true)}
          >
            {language === 'zh' ? '加载更多新闻' : 'Load More News'}
            <span className="ml-2 text-sm text-gray-500">
              ({offset} / {total})
            </span>
          </Button>
        </div>
      )}

      {/* Loading more indicator */}
      {loading && newsData.length > 0 && (
        <div className="text-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-teal-custom inline-block" />
          <span className="ml-2 text-gray-600">
            {language === 'zh' ? '加载更多...' : 'Loading more...'}
          </span>
        </div>
      )}

      {/* 无结果状态 */}
      {filteredNews.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg">
              {language === 'zh' ? '未找到相关新闻' : 'No news found'}
            </p>
            <p className="text-sm">
              {language === 'zh' ? '尝试调整分类筛选' : 'Try adjusting your category filter'}
            </p>
          </div>
        </div>
      )}

      {/* Article Modal */}
      <ArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        articleId={selectedArticleId}
        language={language}
      />
    </div>
  );
}