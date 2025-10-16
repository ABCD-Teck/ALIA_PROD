const express = require('express');
const router = express.Router();
const axios = require('axios');
const OpenAI = require('openai');

// Translation service using OpenAI as primary, MyMemory as fallback
// OpenAI provides higher quality translations

// Initialize OpenAI client
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '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';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Basic translation cache for common terms
const basicTranslationCache = {
  // News and financial terms
  'Market Insights': '市场洞察',
  'Economic Trends': '经济趋势',
  'Breaking News': '突发新闻',
  'Financial Markets': '金融市场',
  'Technology': '科技',
  'Politics': '政治',
  'Business': '商业',
  'Investment': '投资',
  'Trade': '贸易',
  'Economy': '经济',
  'Stock Market': '股市',
  'Cryptocurrency': '加密货币',
  'Banking': '银行业',
  'Central Bank': '央行',
  'Inflation': '通胀',
  'GDP': '国内生产总值',
  'Interest Rates': '利率',
  'Federal Reserve': '美联储',
  'European Central Bank': '欧洲央行',
  'Bank of England': '英格兰银行',
  'China': '中国',
  'United States': '美国',
  'Europe': '欧洲',
  'Asia': '亚洲',
  'Global': '全球',
  'Analysis': '分析',
  'Report': '报告',
  'Update': '更新',
  'Alert': '警报',
  // Time expressions
  'Today': '今天',
  'Yesterday': '昨天',
  'This week': '本周',
  'Last week': '上周',
  'This month': '本月',
  'Last month': '上月',
  // Common phrases
  'Read more': '阅读更多',
  'Continue reading': '继续阅读',
  'Source': '来源',
  'Published': '发布',
  'Updated': '更新于'
};

// Smart translation helper using cache first
const getTranslationFromCache = (text) => {
  const normalizedText = text.trim();

  // Direct match
  if (basicTranslationCache[normalizedText]) {
    return basicTranslationCache[normalizedText];
  }

  // Try partial matches for longer text
  for (const [en, zh] of Object.entries(basicTranslationCache)) {
    if (normalizedText.includes(en)) {
      return normalizedText.replace(en, zh);
    }
  }

  return null;
};

// POST /api/translate
router.post('/', async (req, res) => {
  try {
    const { text, targetLanguage = 'zh', sourceLanguage = 'en' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required for translation' });
    }

    // Clean and limit text for free API
    const cleanText = text.trim();

    // Try cache first for common terms
    const cachedTranslation = getTranslationFromCache(cleanText);
    if (cachedTranslation) {
      return res.json({
        success: true,
        translatedText: cachedTranslation,
        originalText: text,
        sourceLanguage,
        targetLanguage,
        service: 'Cache',
        quality: 'high'
      });
    }

    // Try OpenAI translation first (primary service)
    try {
      const targetLangName = targetLanguage === 'zh' ? 'Simplified Chinese' :
                            targetLanguage === 'en' ? 'English' : targetLanguage;

      console.log(`[Translation] Source: ${sourceLanguage}, Target: ${targetLanguage} (${targetLangName})`);
      console.log(`[Translation] Text preview: "${cleanText.substring(0, 100)}..."`);

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text to ${targetLangName}. Only provide the translation, no explanations or additional text.`
          },
          {
            role: "user",
            content: cleanText
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      if (completion.choices && completion.choices[0] && completion.choices[0].message) {
        const translatedText = completion.choices[0].message.content.trim();

        console.log(`[Translation] OpenAI result preview: "${translatedText.substring(0, 100)}..."`);

        if (translatedText && translatedText.length > 0) {
          return res.json({
            success: true,
            translatedText: translatedText,
            originalText: text,
            sourceLanguage,
            targetLanguage,
            service: 'OpenAI',
            quality: 'high'
          });
        }
      }
    } catch (openaiError) {
      console.log('OpenAI translation failed, trying fallback:', openaiError.message);

      // Try MyMemory as fallback
      if (cleanText.length <= 500) {
        try {
          // Use MyMemory Translation API (free tier, no API key required)
          const response = await axios.get('https://api.mymemory.translated.net/get', {
            params: {
              q: cleanText,
              langpair: `${sourceLanguage}|${targetLanguage}`
            },
            timeout: 5000 // 5 second timeout
          });

          if (response.data && response.data.responseData && response.data.responseData.translatedText) {
            const translatedText = response.data.responseData.translatedText;

            // Basic quality check - if translation is identical to original, it might not have worked
            const isTranslationValid = translatedText !== cleanText && translatedText.length > 0;

            if (isTranslationValid) {
              return res.json({
                success: true,
                translatedText: translatedText,
                originalText: text,
                sourceLanguage,
                targetLanguage,
                service: 'MyMemory',
                quality: 'good'
              });
            }
          }
        } catch (apiError) {
          console.log('MyMemory API also failed, falling back to original:', apiError.message);
        }
      }
    }

    // Fallback: return original text
    res.json({
      success: false,
      translatedText: text, // Return original text as fallback
      originalText: text,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      error: 'Translation service temporarily unavailable',
      service: 'Fallback',
      quality: 'fallback'
    });

  } catch (error) {
    console.error('Translation error:', error);

    // Enhanced fallback: return original text with proper success flag
    res.json({
      success: false,
      translatedText: req.body.text, // Return original text as fallback
      originalText: req.body.text,
      sourceLanguage: req.body.sourceLanguage || 'en',
      targetLanguage: req.body.targetLanguage || 'zh',
      error: error.message,
      service: 'Fallback',
      quality: 'fallback'
    });
  }
});

// GET /api/translate/test - Test endpoint
router.get('/test', async (req, res) => {
  try {
    const testText = 'Hello, this is a test message.';
    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: testText,
        langpair: 'en|zh'
      }
    });

    res.json({
      testText,
      response: response.data,
      status: 'Translation service is working'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Translation service test failed',
      message: error.message
    });
  }
});

module.exports = router;