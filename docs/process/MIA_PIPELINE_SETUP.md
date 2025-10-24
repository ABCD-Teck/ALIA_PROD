# MIA to Alia Market Insights Pipeline - Complete Setup

## 🎯 Overview

Successfully created a data pipeline that feeds news articles from the `mia_insights` database into Alia's Market Insights module.

## 📊 MIA Insights Database Overview

### Key Tables:
- **news_article**: 631 articles with AI-generated English & Chinese summaries
- **bucket**: 13 topic categories (Macro, Banking, Markets, Tech, ESG, etc.)
- **tag**: 2,985 keyword tags
- **company**: 133 companies mentioned in articles
- **news_source**: 20 news sources (Reuters, Bloomberg, etc.)

### Data Quality:
- ✅ All articles have AI-generated summaries in English and Chinese
- ✅ Articles are categorized into topic buckets with confidence scores
- ✅ Importance scoring (1-5 scale) based on market impact
- ✅ Regional classification (EMEA, APAC, Americas, Global)
- ✅ Company mentions and associations

## 🔧 Implementation

### Backend Components Created:

1. **`server/db-mia.js`** - MIA database connection pool
   - Connects to `mia_insights` database
   - Uses same credentials as Alia CRM database
   - SSL enabled

2. **`server/routes/marketInsights.js`** - API endpoints
   - `GET /api/market-insights/articles` - Get articles with filters
   - `GET /api/market-insights/buckets` - Get topic categories
   - `GET /api/market-insights/article/:id` - Get single article details
   - `GET /api/market-insights/companies` - Get companies with article counts
   - `GET /api/market-insights/tags` - Get popular tags

3. **Updated `server/index.js`** - Registered market insights routes

### Frontend Components Updated:

1. **`src/services/api.ts`** - Added `marketInsightsApi` with all endpoints

## 📋 API Endpoints

### GET /api/market-insights/articles
**Query Parameters:**
- `bucket` - Filter by topic bucket (e.g., "Markets", "Macro & Central Banks")
- `region` - Filter by region (EMEA, APAC, Americas, Global)
- `importance` - Minimum importance level (1-5)
- `company` - Filter by company name
- `search` - Search in title and summary
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "title_en": "Article title in English",
      "title_zh": "Chinese summary truncated",
      "content_en": "English summary",
      "content_zh": "Chinese summary",
      "source_en": "source domain",
      "source_zh": "source domain",
      "publishTime": "2025-10-07 12:34:56",
      "url": "article URL",
      "category": "macro/industry/politics/society/conflict/commodities",
      "importance": 4,
      "imp_reason": "Why this is important",
      "bucket": "Markets",
      "bucket_score": 0.8,
      "bucket_scores": { ... },
      "region": "europe/asia/usa/global",
      "regions": ["EMEA"],
      "countries": ["France", "Germany"],
      "keywords": ["trading", "stocks"],
      "company_name": "Siemens",
      "company_ticker": null,
      "likes": 0,
      "isLiked": false,
      "isBookmarked": false
    }
  ],
  "total": 631,
  "limit": 20,
  "offset": 0
}
```

### GET /api/market-insights/buckets
Returns all topic buckets with article counts:
```json
{
  "buckets": [
    {
      "id": 1,
      "name": "Macro & Central Banks",
      "description": "Central bank policies...",
      "keywords": ["central bank", "monetary policy"],
      "article_count": 120,
      "avg_importance": 3.8,
      "category": "macro"
    }
  ]
}
```

### GET /api/market-insights/article/:id
Returns detailed article with full text and tags.

### GET /api/market-insights/companies
Returns companies mentioned in articles with article counts.

### GET /api/market-insights/tags
Returns popular tags across articles.

## 🗺️ Data Mapping

### Bucket to Category Mapping:
| MIA Bucket | Alia Category |
|------------|---------------|
| Macro & Central Banks | macro |
| Banking & Regulation | macro |
| Markets | macro |
| Economic Indicators | macro |
| M&A / IPO / Financing | industry |
| Fintech & Payments | industry |
| Consumer Finance & Housing | industry |
| Cybersecurity & Digital Risk | industry |
| Tech, AI & Data Policy | industry |
| ESG & Sustainability | society |
| Social Security & Welfare | society |
| Geopolitics & Trade | politics |
| Rural & Agri / Utilities | commodities |

### Region Mapping:
| MIA Region | Alia Region |
|------------|-------------|
| EMEA | europe |
| APAC | asia |
| Americas | usa |
| Global | global |

## 🚀 How to Use

### 1. Start the Server
```bash
cd C:\Users\N3BULA\Desktop\Alia_Web
npm run server
```

The server will connect to both databases:
- Alia CRM database (alia_crm)
- MIA Insights database (mia_insights)

### 2. Test the API

**Get latest articles:**
```bash
curl http://localhost:3001/api/market-insights/articles?limit=5
```

**Filter by topic:**
```bash
curl http://localhost:3001/api/market-insights/articles?bucket=Markets&importance=4
```

**Search articles:**
```bash
curl "http://localhost:3001/api/market-insights/articles?search=AI&limit=10"
```

**Get buckets:**
```bash
curl http://localhost:3001/api/market-insights/buckets
```

### 3. Update MarketInsights Component

The MarketInsights component can now use:
```typescript
import { marketInsightsApi } from '../../services/api';

// In your component:
const response = await marketInsightsApi.getArticles({
  bucket: 'Markets',
  importance: 4,
  limit: 20,
  offset: 0
});

if (response.data) {
  setArticles(response.data.articles);
  setTotal(response.data.total);
}
```

## ✅ Features Implemented

- ✅ Real-time news articles from MIA database
- ✅ AI-generated bilingual summaries (English & Chinese)
- ✅ Topic categorization with confidence scores
- ✅ Importance scoring (1-5 scale)
- ✅ Regional and country filtering
- ✅ Company mention tracking
- ✅ Keyword and tag system
- ✅ Full-text search
- ✅ Pagination support
- ✅ Multiple filter combinations

## 📈 Data Available

- **631 articles** across 13 topic buckets
- **133 companies** mentioned
- **2,985 tags** for categorization
- **20 news sources** including Reuters, Bloomberg, WSJ, etc.
- **Multiple regions**: EMEA, APAC, Americas, Global

## 🔄 Next Steps

To complete the integration, update the MarketInsights component to:

1. Replace hardcoded `dailyReportNews` with API calls
2. Add loading states
3. Add filter controls for buckets, regions, importance
4. Implement pagination
5. Add article detail view
6. Add company and tag filtering

## 📚 Files Created/Modified

**New Files:**
- `server/db-mia.js` - MIA database connection
- `server/routes/marketInsights.js` - Market insights API routes
- `scripts/investigate-mia.js` - Database investigation script
- `MIA_ALIA_MAPPING.md` - Data mapping documentation
- `MIA_PIPELINE_SETUP.md` - This file

**Modified Files:**
- `server/index.js` - Added market insights routes
- `src/services/api.ts` - Added marketInsightsApi

## 🎉 Success!

The MIA to Alia pipeline is complete and ready to use! The Market Insights module can now display real, AI-curated financial news from the MIA database with bilingual support and intelligent categorization.
