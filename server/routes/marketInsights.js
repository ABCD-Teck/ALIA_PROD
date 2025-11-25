const express = require('express');
const router = express.Router();
const miaPool = require('../db-mia');
const { authenticateToken } = require('../middleware/auth');

// Bucket to Category mapping
const bucketToCategory = {
  'Macro & Central Banks': 'macro',
  'Banking & Regulation': 'macro',
  'Markets': 'macro',
  'Economic Indicators': 'macro',
  'M&A / IPO / Financing': 'industry',
  'Fintech & Payments': 'industry',
  'Consumer Finance & Housing': 'industry',
  'Cybersecurity & Digital Risk': 'industry',
  'Tech, AI & Data Policy': 'industry',
  'ESG & Sustainability': 'society',
  'Social Security & Welfare': 'society',
  'Geopolitics & Trade': 'politics',
  'Rural & Agri / Utilities': 'commodities'
};

// Enhanced region mapping with intelligent grouping
// Map inconsistent region names to standardized groups
const regionMapping = {
  // EMEA Group
  'EMEA': ['EMEA', 'Europe', 'EU', 'UK', 'Middle East', 'Middle_East', 'Middle East (EMEA)', 'MENA', 'Africa', 'Germany', 'France', 'London'],

  // APAC Group
  'APAC': ['APAC', 'Asia', 'Asia-Pacific', 'China', 'South Asia', 'Middle East (APAC)', 'APAC/EU'],

  // Americas Group
  'Americas': ['Americas', 'US', 'North America', 'North America (US)', 'South America', 'Latin America', 'Central America', 'Caribbean', 'Americas (APAC)'],

  // Eastern Europe (separate from EMEA for granularity)
  'Eastern Europe': ['Eastern Europe'],

  // Global/Worldwide
  'Global': ['Global', 'World', 'Worldwide', 'Emerging Markets']
};

// Create reverse mapping from database values to frontend groups
const regionReverseMapping = {};
Object.keys(regionMapping).forEach(frontendRegion => {
  regionMapping[frontendRegion].forEach(dbRegion => {
    regionReverseMapping[dbRegion.toLowerCase()] = frontendRegion;
  });
});

// Helper function to map database region to frontend region
const mapDbRegionToFrontend = (dbRegion) => {
  if (!dbRegion) return 'Global';
  return regionReverseMapping[dbRegion.toLowerCase()] || 'Global';
};

// Helper function to get database regions for a frontend region filter
const getFrontendRegionDbValues = (frontendRegion) => {
  return regionMapping[frontendRegion] || [frontendRegion];
};

// Chinese source name mapping
const getChineseSourceName = (englishSource) => {
  const sourceMapping = {
    'Reuters': '路透社',
    'Bloomberg': '彭博社',
    'Financial Times': '金融时报',
    'Wall Street Journal': '华尔街日报',
    'BBC': '英国广播公司',
    'CNN': '美国有线电视新闻网',
    'Associated Press': '美联社',
    'The Guardian': '卫报',
    'New York Times': '纽约时报',
    'Washington Post': '华盛顿邮报',
    'Forbes': '福布斯',
    'Fortune': '财富',
    'The Economist': '经济学人',
    'TechCrunch': '科技资讯',
    'Axios': '美国政治新闻网站',
    'Politico': '政治报',
    'CNBC': '消费者新闻与商业频道',
    'MarketWatch': '市场观察',
    'Yahoo Finance': '雅虎财经',
    'Google News': '谷歌新闻'
  };

  return sourceMapping[englishSource] || null;
};

// GET /api/market-insights/articles
router.get('/articles', authenticateToken, async (req, res) => {
  try {
    const {
      bucket,
      region,
      company,
      search,
      tag_code, // NEW: Support for bucket tag filtering
      custom_tag, // NEW: Support for custom user tag filtering
      limit = 20,
      offset = 0
    } = req.query;

    const userId = req.user.user_id;

    let query = `
      SELECT
        na.news_id,
        na.title,
        na.title_zh,
        na.url,
        na.published_at,
        na.source,
        na.summary_en,
        na.summary_zh,
        na.imp_reason,
        na.top_bucket,
        na.top_bucket_score,
        na.bucket_scores,
        na.primary_region,
        na.regions,
        na.countries,
        na.keywords,
        b.name as bucket_name,
        b.description as bucket_description,
        c.name as company_name,
        c.ticker as company_ticker,
        COALESCE(like_counts.like_count, 0) as likes,
        CASE WHEN user_likes.id IS NOT NULL THEN true ELSE false END as is_liked,
        CASE WHEN user_bookmarks.id IS NOT NULL THEN true ELSE false END as is_bookmarked
      FROM news_article na
      LEFT JOIN bucket b ON na.bucket_id = b.bucket_id
      LEFT JOIN company c ON na.company_id = c.company_id
      LEFT JOIN (
        SELECT article_id, COUNT(*) as like_count
        FROM user_article_reactions
        WHERE reaction_type = 'like'
        GROUP BY article_id
      ) like_counts ON na.news_id::text = like_counts.article_id
      LEFT JOIN user_article_reactions user_likes
        ON na.news_id::text = user_likes.article_id
        AND user_likes.user_id = $1::varchar
        AND user_likes.reaction_type = 'like'
      LEFT JOIN user_article_reactions user_bookmarks
        ON na.news_id::text = user_bookmarks.article_id
        AND user_bookmarks.user_id = $1::varchar
        AND user_bookmarks.reaction_type = 'bookmark'
      WHERE na.has_text = true
    `;

    const queryParams = [userId]; // userId is $1 for reaction JOINs
    let paramCount = 2; // Start from 2 since $1 is userId

    // Filter by bucket
    if (bucket) {
      query += ` AND na.top_bucket = $${paramCount}`;
      queryParams.push(bucket);
      paramCount++;
    }

    // Enhanced region filtering - supports multiple database region values per frontend region
    if (region) {
      const dbRegions = getFrontendRegionDbValues(region);
      // Create a comprehensive WHERE clause that checks primary_region and regions array
      const regionConditions = dbRegions.map((dbRegion) => {
        const currentParam = paramCount;
        queryParams.push(dbRegion);
        paramCount++;
        return `(na.primary_region = $${currentParam} OR $${currentParam} = ANY(na.regions))`;
      }).join(' OR ');

      query += ` AND (${regionConditions})`;
    }

    // Filter by company
    if (company) {
      query += ` AND c.name ILIKE $${paramCount}`;
      queryParams.push(`%${company}%`);
      paramCount++;
    }

    // Filter by tag code using proper bucket_tag relationship
    if (tag_code && tag_code !== 'all' && bucket) {
      query += `
        AND EXISTS (
          SELECT 1
          FROM article_tag at
          JOIN bucket_tag bt ON at.tag_id = bt.tag_id
          JOIN bucket b2 ON bt.bucket_id = b2.bucket_id
          WHERE at.news_id = na.news_id
          AND bt.tag_code = $${paramCount}
          AND b2.name = $${paramCount + 1}
          AND bt.is_active = true
        )`;
      queryParams.push(tag_code, bucket);
      paramCount += 2;
    }

    // Filter by custom user tag
    if (custom_tag && custom_tag !== 'all') {
      query += `
        AND EXISTS (
          SELECT 1
          FROM user_article_tags uat
          WHERE uat.article_id = na.news_id::VARCHAR
          AND uat.user_id = $${paramCount}::VARCHAR
          AND uat.tag_name = $${paramCount + 1}
        )`;
      queryParams.push(userId, custom_tag);
      paramCount += 2;
    }

    // Search in title, English summary, and Chinese summary for better coverage
    if (search) {
      query += ` AND (
        na.title ILIKE $${paramCount} OR
        na.summary_en ILIKE $${paramCount} OR
        na.summary_zh ILIKE $${paramCount}
      )`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY na.published_at DESC`;

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
    const countResult = await miaPool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await miaPool.query(query, queryParams);

    // Transform data to Alia format
    const articles = result.rows.map(article => ({
      id: article.news_id,
      title_en: article.title,
      title_zh: article.title_zh || '', // Chinese title from database
      content_en: article.summary_en || '',
      content_zh: article.summary_zh || '', // Chinese summary from database
      ai_summary_en: article.summary_en || '',
      ai_summary_zh: article.summary_zh || '', // AI-generated Chinese summary from database
      source_en: article.source || 'Unknown',
      source_zh: getChineseSourceName(article.source) || article.source || '未知',
      publishTime: new Date(article.published_at).toLocaleString('sv-SE').replace('T', ' ').substring(0, 19),
      url: article.url,
      category: bucketToCategory[article.top_bucket] || 'industry',
      imp_reason: article.imp_reason,
      bucket: article.top_bucket,
      bucket_score: article.top_bucket_score,
      bucket_scores: article.bucket_scores,
      region: mapDbRegionToFrontend(article.primary_region),
      regions: article.regions,
      countries: article.countries,
      keywords: article.keywords,
      company_name: article.company_name,
      company_ticker: article.company_ticker,
      likes: parseInt(article.likes) || 0,
      isLiked: article.is_liked || false,
      isBookmarked: article.is_bookmarked || false
    }));

    // Debug logging: Check Chinese content availability
    const withChinese = articles.filter(a => a.content_zh && a.content_zh.trim().length > 0).length;
    const withoutChinese = articles.length - withChinese;
    console.log(`[Market Insights] Returning ${articles.length} articles: ${withChinese} with Chinese, ${withoutChinese} without`);

    res.json({
      articles,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching market insights articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles', message: error.message });
  }
});

// GET /api/market-insights/buckets
router.get('/buckets', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT
        b.bucket_id,
        b.name,
        b.description,
        b.keywords,
        COUNT(na.news_id) as article_count
      FROM bucket b
      LEFT JOIN news_article na ON b.bucket_id = na.bucket_id AND na.has_text = true
      WHERE b.active = true
      GROUP BY b.bucket_id, b.name, b.description, b.keywords, b.display_order
      ORDER BY b.display_order
    `;

    const result = await miaPool.query(query);

    const buckets = result.rows.map(bucket => ({
      id: bucket.bucket_id,
      name: bucket.name,
      description: bucket.description,
      keywords: bucket.keywords,
      article_count: parseInt(bucket.article_count),
      category: bucketToCategory[bucket.name] || 'industry'
    }));

    res.json({ buckets });
  } catch (error) {
    console.error('Error fetching buckets:', error);
    res.status(500).json({ error: 'Failed to fetch buckets', message: error.message });
  }
});

// GET /api/market-insights/article/:id
router.get('/article/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        na.*,
        b.name as bucket_name,
        b.description as bucket_description,
        c.name as company_name,
        c.ticker as company_ticker,
        c.region as company_region,
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM news_article na
      LEFT JOIN bucket b ON na.bucket_id = b.bucket_id
      LEFT JOIN company c ON na.company_id = c.company_id
      LEFT JOIN article_tag at ON na.news_id = at.news_id
      LEFT JOIN tag t ON at.tag_id = t.tag_id
      WHERE na.news_id = $1
      GROUP BY na.news_id, b.name, b.description, c.name, c.ticker, c.region
    `;

    const result = await miaPool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const article = result.rows[0];

    res.json({
      id: article.news_id,
      title_en: article.title,
      title_zh: article.title_zh || '', // Chinese title from database
      content_en: article.summary_en || article.text,
      content_zh: article.summary_zh || '', // Chinese summary from database
      ai_summary_en: article.summary_en || '',
      ai_summary_zh: article.summary_zh || '', // AI-generated Chinese summary from database
      text_full: article.text,
      source_en: article.source,
      source_zh: getChineseSourceName(article.source) || article.source,
      publishTime: new Date(article.published_at).toLocaleString('sv-SE').replace('T', ' ').substring(0, 19),
      url: article.url,
      category: bucketToCategory[article.top_bucket] || 'industry',
      imp_reason: article.imp_reason,
      bucket: article.top_bucket,
      bucket_name: article.bucket_name,
      bucket_description: article.bucket_description,
      bucket_scores: article.bucket_scores,
      region: mapDbRegionToFrontend(article.primary_region),
      regions: article.regions,
      countries: article.countries,
      keywords: article.keywords,
      tags: article.tags,
      company_name: article.company_name,
      company_ticker: article.company_ticker,
      company_region: article.company_region
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article', message: error.message });
  }
});

// GET /api/market-insights/companies
router.get('/companies', authenticateToken, async (req, res) => {
  try {
    const { search, limit = 50 } = req.query;

    let query = `
      SELECT
        c.company_id,
        c.name,
        c.ticker,
        c.region,
        COUNT(na.news_id) as article_count
      FROM company c
      LEFT JOIN news_article na ON c.company_id = na.company_id AND na.has_text = true
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 1;

    if (search) {
      query += ` AND c.name ILIKE $${paramCount}`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    query += ` GROUP BY c.company_id, c.name, c.ticker, c.region`;
    query += ` HAVING COUNT(na.news_id) > 0`;
    query += ` ORDER BY COUNT(na.news_id) DESC`;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(limit);

    const result = await miaPool.query(query, queryParams);

    res.json({
      companies: result.rows.map(company => ({
        id: company.company_id,
        name: company.name,
        ticker: company.ticker,
        region: company.region,
        article_count: parseInt(company.article_count)
      }))
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies', message: error.message });
  }
});

// GET /api/market-insights/tags
router.get('/tags', authenticateToken, async (req, res) => {
  try {
    const { type, limit = 100 } = req.query;

    let query = `
      SELECT
        t.tag_id,
        t.name,
        t.type,
        COUNT(at.news_id) as article_count
      FROM tag t
      INNER JOIN article_tag at ON t.tag_id = at.tag_id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 1;

    if (type) {
      query += ` AND t.type = $${paramCount}`;
      queryParams.push(type);
      paramCount++;
    }

    query += ` GROUP BY t.tag_id, t.name, t.type`;
    query += ` ORDER BY COUNT(at.news_id) DESC`;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(limit);

    const result = await miaPool.query(query, queryParams);

    res.json({
      tags: result.rows.map(tag => ({
        id: tag.tag_id,
        name: tag.name,
        type: tag.type,
        article_count: parseInt(tag.article_count)
      }))
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags', message: error.message });
  }
});

// GET /api/market-insights/bucket-tags/:bucketName - Get tags for a specific bucket
router.get('/bucket-tags/:bucketName', authenticateToken, async (req, res) => {
  try {
    const { bucketName } = req.params;
    const { limit = 20 } = req.query;

    const query = `
      SELECT
        bt.tag_code,
        t.name as tag_name,
        t.tag_id,
        bt.sort_order,
        bt.is_active,
        COUNT(at.news_id) as frequency
      FROM bucket_tag bt
      JOIN tag t ON bt.tag_id = t.tag_id
      JOIN bucket b ON bt.bucket_id = b.bucket_id
      LEFT JOIN article_tag at ON t.tag_id = at.tag_id
      LEFT JOIN news_article na ON at.news_id = na.news_id AND na.has_text = true
      WHERE b.name = $1 AND bt.is_active = true
      GROUP BY bt.tag_code, t.name, t.tag_id, bt.sort_order, bt.is_active
      ORDER BY bt.sort_order NULLS LAST, frequency DESC, t.name
      LIMIT $2
    `;

    const result = await miaPool.query(query, [bucketName, limit]);

    // Chinese translations mapping for common tag names
    const getChineseTagName = (englishName) => {
      const tagTranslations = {
        // Interest Rates & Monetary Policy
        'Interest Rates': '利率',
        'Monetary Policy': '货币政策',
        'Inflation': '通胀',
        'Federal Reserve': '美联储',
        'ECB': '欧洲央行',
        'Central Banks': '央行',
        'Quantitative Easing': '量化宽松',

        // Banking & Regulation
        'Basel III': '巴塞尔协议III',
        'Compliance': '合规',
        'Stress Test': '压力测试',
        'Capital Requirements': '资本要求',
        'Risk Management': '风险管理',
        'Banking Regulation': '银行监管',

        // Markets
        'Stock Market': '股市',
        'Bond Market': '债券市场',
        'Volatility': '波动性',
        'Trading': '交易',
        'Market Outlook': '市场前景',
        'Equity Markets': '股票市场',
        'Fixed Income': '固定收益',

        // Fintech & Payments
        'Digital Payments': '数字支付',
        'Blockchain': '区块链',
        'Cryptocurrency': '加密货币',
        'Mobile Banking': '移动银行',
        'Fintech Innovation': '金融科技创新',
        'Payment Systems': '支付系统',

        // Tech & AI
        'Artificial Intelligence': '人工智能',
        'Data Privacy': '数据隐私',
        'Tech Regulation': '科技监管',
        'Machine Learning': '机器学习',
        'GDPR': 'GDPR',
        'Cybersecurity': '网络安全',
        'AI Policy': 'AI政策',

        // ESG & Sustainability
        'ESG': 'ESG',
        'Sustainability': '可持续发展',
        'Climate Change': '气候变化',
        'Green Finance': '绿色金融',
        'Carbon Emissions': '碳排放',

        // Geopolitics & Trade
        'Trade': '贸易',
        'Tariffs': '关税',
        'Sanctions': '制裁',
        'Geopolitics': '地缘政治',
        'Trade War': '贸易战',
        'International Relations': '国际关系',

        // Economy
        'GDP': 'GDP',
        'Employment': '就业',
        'Economic Growth': '经济增长',
        'Recession': '经济衰退',
        'Economic Indicators': '经济指标'
      };

      return tagTranslations[englishName] || englishName;
    };

    const bucketTags = result.rows.map(row => ({
      id: row.tag_code,
      tag_id: row.tag_id,
      code: row.tag_code,
      name: row.tag_name,
      label_en: row.tag_name,
      label_zh: getChineseTagName(row.tag_name),
      frequency: parseInt(row.frequency) || 0,
      sort_order: row.sort_order,
      is_active: row.is_active
    }));

    // Add "All Tags" option at the beginning
    bucketTags.unshift({
      id: 'all',
      tag_id: null,
      code: 'all',
      name: 'All Tags',
      label_en: 'All Tags',
      label_zh: '全部标签',
      frequency: 0,
      sort_order: 0,
      is_active: true
    });

    console.log(`[Bucket Tags] Found ${bucketTags.length - 1} tags for bucket: ${bucketName}`);

    res.json({
      bucket_name: bucketName,
      tags: bucketTags,
      total: bucketTags.length - 1 // Exclude "All Tags" from count
    });
  } catch (error) {
    console.error('Error fetching bucket tags:', error);
    res.status(500).json({ error: 'Failed to fetch bucket tags', message: error.message });
  }
});

// GET /api/market-insights/regions - Get available regions with article counts
router.get('/regions', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT
        na.primary_region,
        COUNT(*) as article_count,
        ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as sample_countries
      FROM news_article na
      LEFT JOIN company c ON na.company_id = c.company_id
      WHERE na.has_text = true AND na.primary_region IS NOT NULL
      GROUP BY na.primary_region
      ORDER BY article_count DESC
    `;

    const result = await miaPool.query(query);

    // Group database regions into frontend categories
    const frontendRegions = {};

    result.rows.forEach(row => {
      const frontendRegion = mapDbRegionToFrontend(row.primary_region);

      if (!frontendRegions[frontendRegion]) {
        frontendRegions[frontendRegion] = {
          id: frontendRegion,
          name: frontendRegion,
          article_count: 0,
          countries: new Set(),
          db_regions: []
        };
      }

      frontendRegions[frontendRegion].article_count += parseInt(row.article_count);
      frontendRegions[frontendRegion].db_regions.push(row.primary_region);

      if (row.sample_countries) {
        row.sample_countries.forEach(country => {
          if (country) frontendRegions[frontendRegion].countries.add(country);
        });
      }
    });

    // Convert to array and format
    const regions = Object.values(frontendRegions).map(region => ({
      id: region.id,
      name: region.name,
      label_en: region.name,
      label_zh: region.name === 'Global' ? '全球' :
                region.name === 'APAC' ? '亚太地区' :
                region.name === 'Americas' ? '美洲' :
                region.name === 'EMEA' ? '欧洲/中东/非洲' :
                region.name === 'Eastern Europe' ? '东欧' : region.name,
      article_count: region.article_count,
      countries: Array.from(region.countries).slice(0, 5), // Top 5 countries as sample
      db_regions: region.db_regions
    })).sort((a, b) => b.article_count - a.article_count);

    // Add "All Regions" option at the beginning
    regions.unshift({
      id: 'all',
      name: 'All Regions',
      label_en: 'All Regions',
      label_zh: '全部地区',
      article_count: regions.reduce((sum, r) => sum + r.article_count, 0),
      countries: [],
      db_regions: []
    });

    res.json({ regions });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Failed to fetch regions', message: error.message });
  }
});

// GET /api/market-insights/countries - Get available countries by region
router.get('/countries', authenticateToken, async (req, res) => {
  try {
    const { region } = req.query;

    let query = `
      SELECT
        UNNEST(na.countries) as country,
        COUNT(*) as article_count
      FROM news_article na
      WHERE na.has_text = true AND na.countries IS NOT NULL
    `;

    const queryParams = [];
    let paramCount = 1;

    if (region && region !== 'all') {
      const dbRegions = getFrontendRegionDbValues(region);
      const regionConditions = dbRegions.map((dbRegion) => {
        const currentParam = paramCount;
        queryParams.push(dbRegion);
        paramCount++;
        return `(na.primary_region = $${currentParam} OR $${currentParam} = ANY(na.regions))`;
      }).join(' OR ');

      query += ` AND (${regionConditions})`;
    }

    query += `
      GROUP BY country
      HAVING COUNT(*) > 0
      ORDER BY article_count DESC
      LIMIT 50
    `;

    const result = await miaPool.query(query, queryParams);

    const countries = result.rows
      .filter(row => row.country && row.country.trim().length > 0)
      .map(row => ({
        id: row.country,
        name: row.country,
        article_count: parseInt(row.article_count)
      }));

    res.json({ countries });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries', message: error.message });
  }
});

// GET /api/market-insights/customer/:customerName - Get news for a specific customer/company
router.get('/customer/:customerName', authenticateToken, async (req, res) => {
  try {
    const { customerName } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const query = `
      SELECT
        na.news_id,
        na.title,
        na.url,
        na.published_at,
        na.source,
        na.summary_en,
        na.summary_zh,
        na.imp_reason,
        na.top_bucket,
        na.primary_region,
        na.regions,
        na.countries,
        b.name as bucket_name,
        c.name as company_name,
        c.ticker as company_ticker,
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM news_article na
      LEFT JOIN bucket b ON na.bucket_id = b.bucket_id
      LEFT JOIN company c ON na.company_id = c.company_id
      LEFT JOIN article_tag at ON na.news_id = at.news_id
      LEFT JOIN tag t ON at.tag_id = t.tag_id
      WHERE na.has_text = true
      AND c.name ILIKE $1
      GROUP BY na.news_id, b.name, c.name, c.ticker
      ORDER BY na.published_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await miaPool.query(query, [`%${customerName}%`, limit, offset]);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT na.news_id)
      FROM news_article na
      LEFT JOIN company c ON na.company_id = c.company_id
      WHERE na.has_text = true
      AND c.name ILIKE $1
    `;
    const countResult = await miaPool.query(countQuery, [`%${customerName}%`]);
    const totalCount = parseInt(countResult.rows[0].count);

    // Transform data
    const articles = result.rows.map(article => ({
      id: article.news_id,
      title_en: article.title,
      title_zh: '',
      content_en: article.summary_en || '',
      content_zh: article.summary_zh || '',
      ai_summary_en: article.summary_en || '',
      ai_summary_zh: article.summary_zh || '',
      source_en: article.source || 'Unknown',
      source_zh: getChineseSourceName(article.source) || article.source || '未知',
      publishTime: new Date(article.published_at).toLocaleString('sv-SE').replace('T', ' ').substring(0, 19),
      url: article.url,
      category: bucketToCategory[article.top_bucket] || 'industry',
      imp_reason: article.imp_reason,
      bucket: article.top_bucket,
      bucket_name: article.bucket_name,
      region: mapDbRegionToFrontend(article.primary_region),
      regions: article.regions,
      countries: article.countries,
      company_name: article.company_name,
      company_ticker: article.company_ticker,
      tags: article.tags || []
    }));

    res.json({
      articles,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset),
      customer_name: customerName
    });
  } catch (error) {
    console.error('Error fetching customer news:', error);
    res.status(500).json({ error: 'Failed to fetch customer news', message: error.message });
  }
});

// PATCH /api/market-insights/article/:id/translation
// Update translation fields for a news article
router.patch('/article/:id/translation', async (req, res) => {
  const { id } = req.params;
  const { title_zh, summary_zh } = req.body;

  try {
    // Build dynamic UPDATE query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title_zh !== undefined) {
      updates.push(`title_zh = $${paramCount++}`);
      values.push(title_zh);
    }

    if (summary_zh !== undefined) {
      updates.push(`summary_zh = $${paramCount++}`);
      values.push(summary_zh);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No translation fields provided' });
    }

    // Add news_id to values array
    values.push(id);

    const query = `
      UPDATE news_article
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE news_id = $${paramCount}
      RETURNING news_id, title, title_zh, summary_zh, updated_at
    `;

    console.log(`[Market Insights] Updating translations for article ${id}`);
    console.log(`[Market Insights] Query: ${query}`);
    console.log(`[Market Insights] Values:`, values);

    const result = await miaPool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    console.log(`[Market Insights] Successfully updated translations for article ${id}`);

    res.json({
      success: true,
      article: result.rows[0]
    });
  } catch (error) {
    console.error('[Market Insights] Error updating article translation:', error);
    res.status(500).json({ error: 'Failed to update translation', message: error.message });
  }
});

// GET /api/market-insights/user-tags
// Get all unique custom tags created by the current user with usage count
router.get('/user-tags', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const query = `
      SELECT
        tag_name,
        COUNT(*) as usage_count,
        MAX(created_at) as last_used
      FROM user_article_tags
      WHERE user_id = $1
      GROUP BY tag_name
      ORDER BY usage_count DESC, tag_name ASC
    `;

    const result = await miaPool.query(query, [userId]);

    const tags = result.rows.map(row => ({
      name: row.tag_name,
      usage_count: parseInt(row.usage_count),
      last_used: row.last_used
    }));

    res.json({ tags });
  } catch (error) {
    console.error('[Market Insights] Error fetching user tags:', error);
    res.status(500).json({ error: 'Failed to fetch user tags', message: error.message });
  }
});

// GET /api/market-insights/article/:articleId/tags
// Get all custom tags for a specific article (for the current user)
router.get('/article/:articleId/tags', authenticateToken, async (req, res) => {
  const { articleId } = req.params;
  const userId = req.user.user_id;

  try {
    const query = `
      SELECT tag_name, created_at
      FROM user_article_tags
      WHERE user_id = $1 AND article_id = $2
      ORDER BY created_at DESC
    `;

    const result = await miaPool.query(query, [userId, articleId]);

    const tags = result.rows.map(row => ({
      name: row.tag_name,
      created_at: row.created_at
    }));

    res.json({ tags });
  } catch (error) {
    console.error('[Market Insights] Error fetching article tags:', error);
    res.status(500).json({ error: 'Failed to fetch article tags', message: error.message });
  }
});

// POST /api/market-insights/article/:articleId/tags
// Add a custom tag to a specific article
router.post('/article/:articleId/tags', authenticateToken, async (req, res) => {
  const { articleId } = req.params;
  const { tagName } = req.body;
  const userId = req.user.user_id;

  if (!tagName || tagName.trim().length === 0) {
    return res.status(400).json({ error: 'Tag name is required' });
  }

  if (tagName.length > 100) {
    return res.status(400).json({ error: 'Tag name is too long (max 100 characters)' });
  }

  try {
    const query = `
      INSERT INTO user_article_tags (user_id, article_id, tag_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, article_id, tag_name) DO NOTHING
      RETURNING id, tag_name, created_at
    `;

    const result = await miaPool.query(query, [userId, articleId, tagName.trim()]);

    if (result.rows.length === 0) {
      // Tag already exists
      return res.json({
        success: true,
        message: 'Tag already exists',
        tag: { name: tagName.trim() }
      });
    }

    res.json({
      success: true,
      tag: {
        name: result.rows[0].tag_name,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('[Market Insights] Error adding article tag:', error);
    res.status(500).json({ error: 'Failed to add article tag', message: error.message });
  }
});

// DELETE /api/market-insights/article/:articleId/tags/:tagName
// Remove a custom tag from a specific article
router.delete('/article/:articleId/tags/:tagName', authenticateToken, async (req, res) => {
  const { articleId, tagName } = req.params;
  const userId = req.user.user_id;

  try {
    const query = `
      DELETE FROM user_article_tags
      WHERE user_id = $1 AND article_id = $2 AND tag_name = $3
      RETURNING id
    `;

    const result = await miaPool.query(query, [userId, articleId, tagName]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json({
      success: true,
      message: 'Tag removed successfully'
    });
  } catch (error) {
    console.error('[Market Insights] Error removing article tag:', error);
    res.status(500).json({ error: 'Failed to remove article tag', message: error.message });
  }
});

// ========================================
// Article Reactions (Like/Bookmark) Routes
// ========================================

// Toggle like on an article
router.post('/articles/:articleId/like', authenticateToken, async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.user_id;

    // Check if user already liked the article
    const checkQuery = `
      SELECT id FROM user_article_reactions
      WHERE user_id = $1 AND article_id = $2 AND reaction_type = 'like'
    `;
    const checkResult = await miaPool.query(checkQuery, [userId, articleId]);

    if (checkResult.rows.length > 0) {
      // Unlike: Remove the like
      await miaPool.query(
        'DELETE FROM user_article_reactions WHERE user_id = $1 AND article_id = $2 AND reaction_type = $3',
        [userId, articleId, 'like']
      );

      // Get updated like count
      const countResult = await miaPool.query(
        'SELECT COUNT(*) as count FROM user_article_reactions WHERE article_id = $1 AND reaction_type = $2',
        [articleId, 'like']
      );

      res.json({
        success: true,
        isLiked: false,
        likes: parseInt(countResult.rows[0].count)
      });
    } else {
      // Like: Add the like
      await miaPool.query(
        'INSERT INTO user_article_reactions (user_id, article_id, reaction_type) VALUES ($1, $2, $3)',
        [userId, articleId, 'like']
      );

      // Get updated like count
      const countResult = await miaPool.query(
        'SELECT COUNT(*) as count FROM user_article_reactions WHERE article_id = $1 AND reaction_type = $2',
        [articleId, 'like']
      );

      res.json({
        success: true,
        isLiked: true,
        likes: parseInt(countResult.rows[0].count)
      });
    }
  } catch (error) {
    console.error('[Market Insights] Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like', message: error.message });
  }
});

// Toggle bookmark on an article
router.post('/articles/:articleId/bookmark', authenticateToken, async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.user_id;

    // Check if user already bookmarked the article
    const checkQuery = `
      SELECT id FROM user_article_reactions
      WHERE user_id = $1 AND article_id = $2 AND reaction_type = 'bookmark'
    `;
    const checkResult = await miaPool.query(checkQuery, [userId, articleId]);

    if (checkResult.rows.length > 0) {
      // Unbookmark: Remove the bookmark
      await miaPool.query(
        'DELETE FROM user_article_reactions WHERE user_id = $1 AND article_id = $2 AND reaction_type = $3',
        [userId, articleId, 'bookmark']
      );

      res.json({
        success: true,
        isBookmarked: false
      });
    } else {
      // Bookmark: Add the bookmark
      await miaPool.query(
        'INSERT INTO user_article_reactions (user_id, article_id, reaction_type) VALUES ($1, $2, $3)',
        [userId, articleId, 'bookmark']
      );

      res.json({
        success: true,
        isBookmarked: true
      });
    }
  } catch (error) {
    console.error('[Market Insights] Error toggling bookmark:', error);
    res.status(500).json({ error: 'Failed to toggle bookmark', message: error.message });
  }
});

// Get user's bookmarked articles
router.get('/bookmarks', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT
        na.news_id as id,
        na.title,
        na.url,
        na.published_at,
        na.source,
        na.summary_en,
        na.summary_zh,
        na.top_bucket as bucket,
        na.top_bucket_score,
        uar.created_at as bookmarked_at,
        (SELECT COUNT(*) FROM user_article_reactions WHERE article_id = na.news_id AND reaction_type = 'like') as likes
      FROM user_article_reactions uar
      JOIN news_article na ON uar.article_id = na.news_id
      WHERE uar.user_id = $1 AND uar.reaction_type = 'bookmark'
      ORDER BY uar.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await miaPool.query(query, [userId, limit, offset]);

    // Get total count
    const countResult = await miaPool.query(
      'SELECT COUNT(*) as total FROM user_article_reactions WHERE user_id = $1 AND reaction_type = $2',
      [userId, 'bookmark']
    );

    res.json({
      articles: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('[Market Insights] Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks', message: error.message });
  }
});

module.exports = router;
