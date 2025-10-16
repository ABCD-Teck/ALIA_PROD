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
      importance,
      company,
      search,
      limit = 20,
      offset = 0
    } = req.query;

    let query = `
      SELECT
        na.news_id,
        na.title,
        na.url,
        na.published_at,
        na.source,
        na.summary_en,
        na.summary_zh,
        na.importance,
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
        c.ticker as company_ticker
      FROM news_article na
      LEFT JOIN bucket b ON na.bucket_id = b.bucket_id
      LEFT JOIN company c ON na.company_id = c.company_id
      WHERE na.has_text = true
    `;

    const queryParams = [];
    let paramCount = 1;

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
      const regionConditions = dbRegions.map(() =>
        `(na.primary_region = $${paramCount} OR $${paramCount} = ANY(na.regions))`
      ).join(' OR ');

      query += ` AND (${regionConditions})`;

      // Add all database region values as parameters
      dbRegions.forEach(dbRegion => {
        queryParams.push(dbRegion);
        paramCount++;
      });
    }

    // Filter by importance
    if (importance) {
      query += ` AND na.importance >= $${paramCount}`;
      queryParams.push(parseInt(importance));
      paramCount++;
    }

    // Filter by company
    if (company) {
      query += ` AND c.name ILIKE $${paramCount}`;
      queryParams.push(`%${company}%`);
      paramCount++;
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
      title_zh: '', // Chinese title not yet implemented - frontend will auto-translate
      content_en: article.summary_en || '',
      content_zh: article.summary_zh || '', // Chinese summary from database
      ai_summary_en: article.summary_en || '',
      ai_summary_zh: article.summary_zh || '', // AI-generated Chinese summary from database
      source_en: article.source || 'Unknown',
      source_zh: getChineseSourceName(article.source) || article.source || '未知',
      publishTime: new Date(article.published_at).toLocaleString('sv-SE').replace('T', ' ').substring(0, 19),
      url: article.url,
      category: bucketToCategory[article.top_bucket] || 'industry',
      importance: article.importance || 3,
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
      likes: 0,
      isLiked: false,
      isBookmarked: false
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
        COUNT(na.news_id) as article_count,
        AVG(na.importance) as avg_importance
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
      avg_importance: parseFloat(bucket.avg_importance) || 0,
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
      title_zh: '', // Chinese title not yet implemented - frontend will auto-translate
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
      importance: article.importance,
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
      const regionConditions = dbRegions.map(() =>
        `(na.primary_region = $${paramCount} OR $${paramCount} = ANY(na.regions))`
      ).join(' OR ');

      query += ` AND (${regionConditions})`;

      dbRegions.forEach(dbRegion => {
        queryParams.push(dbRegion);
        paramCount++;
      });
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

module.exports = router;
