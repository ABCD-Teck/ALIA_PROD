import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './button';
import { Language } from '../../App';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  language?: Language;
  showFirstLast?: boolean;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  language = 'zh',
  showFirstLast = true,
  showPageNumbers = true,
  maxPageButtons = 5
}: PaginationControlsProps) {
  const text = {
    zh: {
      showing: '显示',
      to: '至',
      of: '共',
      items: '项',
      page: '第',
      pageOf: '页，共',
      pages: '页'
    },
    en: {
      showing: 'Showing',
      to: 'to',
      of: 'of',
      items: 'items',
      page: 'Page',
      pageOf: 'of',
      pages: 'pages'
    }
  };

  const t = text[language];

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxPageButtons) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if at start or end
      if (currentPage <= 2) {
        endPage = Math.min(maxPageButtons - 1, totalPages - 1);
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - maxPageButtons + 2);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = showPageNumbers ? getPageNumbers() : [];

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-2 py-4 border-t border-border">
      {/* Items info */}
      <div className="text-sm text-muted-foreground">
        {t.showing} <span className="font-medium">{startItem}</span> {t.to}{' '}
        <span className="font-medium">{endItem}</span> {t.of}{' '}
        <span className="font-medium">{totalItems}</span> {t.items}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* First page */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
            title={language === 'zh' ? '第一页' : 'First page'}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
          title={language === 'zh' ? '上一页' : 'Previous page'}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        {showPageNumbers && (
          <div className="flex items-center space-x-1">
            {pageNumbers.map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                    ...
                  </span>
                );
              }

              return (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={`h-8 w-8 p-0 ${
                    page === currentPage
                      ? 'bg-[#009699] text-white hover:bg-[#007d7f]'
                      : ''
                  }`}
                >
                  {page}
                </Button>
              );
            })}
          </div>
        )}

        {/* Next page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
          title={language === 'zh' ? '下一页' : 'Next page'}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
            title={language === 'zh' ? '最后一页' : 'Last page'}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Page info */}
      <div className="text-sm text-muted-foreground">
        {t.page} <span className="font-medium">{currentPage}</span> {t.pageOf}{' '}
        <span className="font-medium">{totalPages}</span> {t.pages}
      </div>
    </div>
  );
}
