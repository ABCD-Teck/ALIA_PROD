# MIA Insights to Alia Market Insights - Data Mapping

## Overview
This document maps the data from `mia_insights` database to Alia's Market Insights module.

## Database Comparison

### MIA Insights Database Structure:
- **news_article** (631 articles) - Main news articles with AI-generated summaries
- **bucket** (13 buckets) - Topic categorization (e.g., "Macro & Central Banks", "Banking & Regulation", "Markets")
- **tag** (2,985 tags) - Keyword tags for articles
- **company** (133 companies) - Companies mentioned in articles
- **news_source** (20 sources) - News sources (Reuters, Bloomberg, etc.)
- **article_tag** (4,788 relations) - Many-to-many relationship between articles and tags

### Alia Market Insights Module Structure:
- Displays news articles with Chinese and English titles
- Has a hierarchical tag system (Level 1-3)
- Categories: macro, industry, politics, society, conflict, commodities
- Displays source, publish time, likes, bookmarks
- Has search and filter functionality

## Data Mapping

### From MIA to Alia:

| MIA Field | Alia Field | Transformation |
|-----------|------------|----------------|
| news_article.title | title_en | Direct mapping |
| news_article.summary_zh | title_zh | Use as Chinese title (truncate if needed) |
| news_article.summary_en | content_en | Direct mapping |
| news_article.summary_zh | content_zh | Direct mapping |
| news_article.source | source_en | Extract domain name |
| news_article.published_at | publishTime | Format as 'YYYY-MM-DD HH:mm:ss' |
| news_article.importance | importance | Direct mapping (1-5 scale) |
| news_article.top_bucket | category | Map buckets to categories |
| bucket.name | categoryLabel | For display |

### Bucket to Category Mapping:

| MIA Bucket | Alia Category | Notes |
|------------|---------------|-------|
| Macro & Central Banks | macro | Direct fit |
| Banking & Regulation | macro | Maps to regulation subcategory |
| Markets | macro | Maps to stock market |
| M&A / IPO / Financing | industry | Maps to finance industry |
| Fintech & Payments | industry | Maps to finance/technology |
| Consumer Finance & Housing | industry | Maps to finance |
| ESG & Sustainability | society | Maps to environment |
| Cybersecurity & Digital Risk | industry | Maps to technology |
| Social Security & Welfare | society | Direct fit |
| Geopolitics & Trade | politics | Maps to international relations |
| Economic Indicators | macro | Maps to growth/indicators |
| Rural & Agri / Utilities | commodities | Maps to agriculture |
| Tech, AI & Data Policy | industry | Maps to technology |

### Region Mapping:

| MIA Region | Alia Level3 Tag |
|------------|-----------------|
| EMEA | europe |
| APAC | asia |
| Americas | usa |
| Global | global |
| Eastern Europe | europe |

## API Endpoints to Create

1. **GET /api/market-insights/articles**
   - Query parameters: bucket, region, importance, limit, offset, search
   - Returns: Paginated list of articles with all mapped fields

2. **GET /api/market-insights/buckets**
   - Returns: List of all buckets with article counts

3. **GET /api/market-insights/tags**
   - Returns: All tags used in articles

4. **GET /api/market-insights/article/:id**
   - Returns: Single article with full details including related companies

5. **GET /api/market-insights/companies**
   - Returns: Companies mentioned in articles

## Additional Features

- **Real-time updates**: Articles are continuously ingested into MIA
- **AI-generated summaries**: Both English and Chinese summaries available
- **Importance scoring**: 1-5 scale based on market impact
- **Multi-language**: Native support for English and Chinese
- **Company tracking**: Can filter articles by company mentions
- **Bucket categorization**: 13 predefined topic buckets with confidence scores

## Implementation Notes

1. Articles should be sorted by published_at DESC by default
2. Only show articles with has_text = true
3. Use summary_en/summary_zh for content (better than raw text)
4. Map bucket_scores to show confidence levels
5. Include company information when available
6. Translate source domains to readable names
