import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Clock,
  Building,
  X,
  ExternalLink,
  Loader2,
  Languages,
  Heart,
  Share2,
  Bookmark
} from 'lucide-react';
import { Language } from '../../App';
import { marketInsightsApi, translationApi } from '../../services/api';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  language: Language;
}

export function ArticleModal({ isOpen, onClose, articleId, language }: ArticleModalProps) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string>('');
  const [showTranslation, setShowTranslation] = useState(false);

  // Load article data when modal opens
  useEffect(() => {
    if (isOpen && articleId) {
      loadArticleDetails();
    }
  }, [isOpen, articleId]);

  const loadArticleDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await marketInsightsApi.getArticle(articleId);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setArticle(response.data);
        setShowTranslation(false);
        setTranslatedContent('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!article || !article.text_full) return;

    setTranslating(true);
    try {
      const targetLang = language === 'zh' ? 'zh' : 'en';
      const sourceLang = language === 'zh' ? 'en' : 'zh';

      const response = await translationApi.translate(
        article.text_full,
        targetLang,
        sourceLang
      );

      if (response.data && response.data.translatedText) {
        setTranslatedContent(response.data.translatedText);
        setShowTranslation(true);
      } else {
        console.error('Translation failed:', response.error);
        // Fallback: show original text
        setTranslatedContent(article.text_full);
        setShowTranslation(true);
      }
    } catch (err) {
      console.error('Translation error:', err);
      // Fallback: show original text
      setTranslatedContent(article.text_full);
      setShowTranslation(true);
    } finally {
      setTranslating(false);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  const content = {
    zh: {
      loading: '加载中...',
      error: '加载失败',
      translate: '翻译全文',
      translating: '翻译中...',
      showOriginal: '显示原文',
      source: '信息源',
      publishTime: '发布时间',
      readOriginal: '阅读原文',
      close: '关闭',
      importance: '重要性',
      like: '点赞',
      share: '分享',
      bookmark: '收藏'
    },
    en: {
      loading: 'Loading...',
      error: 'Failed to load',
      translate: 'Translate Full Text',
      translating: 'Translating...',
      showOriginal: 'Show Original',
      source: 'Source',
      publishTime: 'Published',
      readOriginal: 'Read Original',
      close: 'Close',
      importance: 'Importance',
      like: 'Like',
      share: 'Share',
      bookmark: 'Bookmark'
    }
  };

  const t = content[language];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold pr-8">
            {loading ? t.loading : (
              language === 'zh' && article?.title_zh && article?.title_zh.trim() && article?.title_zh !== article?.title_en
                ? article?.title_zh
                : article?.title_en
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-teal-custom" />
              <span className="ml-3 text-gray-600">{t.loading}</span>
            </div>
          )}

          {error && (
            <div className="p-6 text-red-600 text-center">
              <p className="font-semibold">{t.error}</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {article && !loading && (
            <div className="space-y-6 pb-4">
            {/* Article Title - Translated */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {language === 'zh' && article.title_zh && article.title_zh.trim() && article.title_zh !== article.title_en
                  ? article.title_zh
                  : article.title_en}
              </h1>

              {/* Article Meta Information */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  <span>{t.source}: {
                    language === 'zh' && article.source_zh && article.source_zh.trim() && article.source_zh !== article.source_en
                      ? article.source_zh
                      : article.source_en
                  }</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{t.publishTime}: {formatTime(article.publishTime)}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                {article.importance && (
                  <Badge
                    variant={article.importance >= 4 ? "destructive" : article.importance >= 3 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {t.importance} {article.importance}
                  </Badge>
                )}
                {article.bucket && (
                  <Badge variant="outline" className="text-xs">
                    {article.bucket}
                  </Badge>
                )}
                {article.region && (
                  <Badge variant="secondary" className="text-xs">
                    {article.region}
                  </Badge>
                )}
              </div>
            </div>

            {/* Translation Controls */}
            <div className="flex items-center gap-3 py-2 border-t border-b border-gray-200">
              {!showTranslation ? (
                <Button
                  onClick={handleTranslate}
                  disabled={translating}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {translating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.translating}
                    </>
                  ) : (
                    <>
                      <Languages className="h-4 w-4" />
                      {t.translate}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => setShowTranslation(false)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {t.showOriginal}
                </Button>
              )}
            </div>

            {/* Article Content */}
            <div className="prose max-w-none">
              {showTranslation ? (
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {translatedContent}
                </div>
              ) : (
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {article.text_full || article.content_en || 'No content available'}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                {/* Like Button */}
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <Heart className="h-4 w-4" />
                  <span>{t.like}</span>
                </button>

                {/* Share Button */}
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span>{t.share}</span>
                </button>

                {/* Bookmark Button */}
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                  <Bookmark className="h-4 w-4" />
                  <span>{t.bookmark}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Read Original Link */}
                {article.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(article.url, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t.readOriginal}
                  </Button>
                )}

                {/* Close Button */}
                <Button
                  onClick={onClose}
                  variant="default"
                  size="sm"
                  className="bg-teal-custom hover:bg-teal-custom-80"
                >
                  {t.close}
                </Button>
              </div>
            </div>
          </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}