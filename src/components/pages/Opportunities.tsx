import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  ArrowUpDown,
  Save,
  AlertCircle
} from 'lucide-react';
import { Language } from '../../App';
import * as api from '../../services/api';
import { PaginationControls } from '../ui/PaginationControls';

interface OpportunitiesProps {
  searchQuery: string;
  language: Language;
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  triggerSave?: boolean;
  onSaveComplete?: () => void;
}

type Priority = 'High' | 'Medium' | 'Low';
type Stage = 'Lead' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

interface Opportunity {
  id: number;
  customer: string;
  customerCn?: string;
  opportunityName: string;
  opportunityNameCn?: string;
  description: string;
  descriptionCn?: string;
  region: string;
  regionCn?: string;
  country: string;
  countryCn?: string;
  partner: string;
  partnerCn?: string;
  priority: Priority;
  amount: number;
  currency: string;
  salesOwner: string;
  salesOwnerCn?: string;
  stage: Stage;
  lastUpdate: {
    date: string;
    note: string;
    noteCn?: string;
  };
  actionPlan: string;
  actionPlanCn?: string;
  createdDate: string;
}

export function Opportunities({
  searchQuery,
  language,
  onUnsavedChangesChange,
  onLoadingChange,
  triggerSave,
  onSaveComplete
}: OpportunitiesProps) {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Opportunity>('createdDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Fetch opportunities from API
  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.opportunitiesApi.getAll({ limit: 100 });
      if (response.data && response.data.opportunities) {
        // Transform database opportunities to match the Opportunity interface
        const transformedOpportunities = response.data.opportunities.map((opp: any) => {
          // Capitalize first letter for priority and status
          const capitalizePriority = (priority: string): Priority => {
            const p = (priority || 'medium').toLowerCase();
            return (p.charAt(0).toUpperCase() + p.slice(1)) as Priority;
          };

          const capitalizeStage = (stage: string): Stage => {
            // Map backend stage values to frontend stage values
            const stageToStageMap: Record<string, Stage> = {
              'prospecting': 'Lead',
              'proposal': 'Proposal',
              'negotiation': 'Negotiation',
              'closed_won': 'Won',
              'closed_lost': 'Lost',
              'qualification': 'Lead', // Map qualification to Lead for display
            };

            const normalizedStage = (stage || 'prospecting').toLowerCase();
            return stageToStageMap[normalizedStage] || 'Lead';
          };

          return {
            id: opp.opportunity_id || opp.id,
            customer: opp.company_name || '',
            customerCn: opp.company_name || '',
            opportunityName: opp.name || '',
            opportunityNameCn: opp.name || '',
            description: opp.description || '',
            descriptionCn: opp.description || '',
            region: opp.region_name || '',
            regionCn: opp.region_name || '',
            country: opp.country_code || '',
            countryCn: opp.country_code || '',
            partner: '',
            partnerCn: '',
            priority: capitalizePriority(opp.priority),
            amount: parseFloat(opp.amount) || 0,
            currency: opp.currency_code || opp.currency_symbol || 'USD',
            salesOwner: '',
            salesOwnerCn: '',
            stage: capitalizeStage(opp.stage),
            lastUpdate: {
              date: opp.updated_at ? new Date(opp.updated_at).toISOString().split('T')[0] : '',
              note: opp.description || '',
              noteCn: opp.description || '',
            },
            actionPlan: opp.description || '',
            actionPlanCn: opp.description || '',
            createdDate: opp.created_at ? new Date(opp.created_at).toISOString().split('T')[0] : '',
          };
        });
        setOpportunities(transformedOpportunities);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  // Notify parent component of loading state
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  const content = {
    zh: {
      selectOpportunity: '选择商机',
      allOpportunities: '全部商机',
      customer: '客户',
      opportunityName: '商机名称',
      description: '描述',
      region: '区域',
      country: '国家',
      partner: '合作伙伴',
      priority: '优先级',
      amount: '金额',
      currency: '币种',
      salesOwner: '销售负责人',
      status: '状态',
      lastUpdate: '最新更新',
      actionPlan: '行动计划',
      noResults: '未找到商机',
      totalOpportunities: '商机数',
      totalValue: '商机价值',
      wonDeals: '成交数',
      wonRevenue: '成交金额',
      wonRate: '成交率',
      makeChange: '执行更改',
      confirmChanges: '确认更改',
      unsavedChanges: '未保存的更改',
      unsavedWarning: '您有未保存的更改。请在离开前执行更改。',
      changesSaved: '更改已成功保存',
      savingChanges: '正在保存更改...',
      noChanges: '您没有未保存的更改',
      priorities: {
        High: '高',
        Medium: '中',
        Low: '低'
      },
      statuses: {
        Lead: '线索',
        Proposal: '提案',
        Negotiation: '谈判',
        Won: '成交',
        Lost: '丢单'
      },
      currencies: {
        USD: '美元',
        EUR: '欧元',
        CNY: '人民币',
        GBP: '英镑'
      }
    },
    en: {
      selectOpportunity: 'Select Opportunity',
      allOpportunities: 'All Opportunities',
      customer: 'Customer',
      opportunityName: 'Opportunity',
      description: 'Description',
      region: 'Region',
      country: 'Country',
      partner: 'Partner',
      priority: 'Priority',
      amount: 'Amount',
      currency: 'Currency',
      salesOwner: 'Sales Owner',
      status: 'Status',
      lastUpdate: 'Last Update',
      actionPlan: 'Action Plan',
      noResults: 'No opportunities found',
      totalOpportunities: 'Opportunities',
      totalValue: 'Pipeline Value',
      wonDeals: 'Won Deals',
      wonRevenue: 'Won Revenue',
      wonRate: 'Won Rate',
      makeChange: 'Make Change',
      confirmChanges: 'Confirm Changes',
      unsavedChanges: 'Unsaved Changes',
      unsavedWarning: 'You have unsaved changes. Please make changes before leaving.',
      changesSaved: 'Changes saved successfully',
      savingChanges: 'Saving changes...',
      noChanges: 'You have no unsaved changes',
      priorities: {
        High: 'High',
        Medium: 'Medium',
        Low: 'Low'
      },
      statuses: {
        Lead: 'Lead',
        Proposal: 'Proposal',
        Negotiation: 'Negotiation',
        Won: 'Won',
        Lost: 'Lost'
      },
      currencies: {
        USD: 'USD',
        EUR: 'EUR',
        CNY: 'CNY',
        GBP: 'GBP'
      }
    }
  };

  const t = content[language];

  const filteredOpportunities = searchQuery
    ? opportunities.filter(opp => 
        opp.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opp.customerCn && opp.customerCn.includes(searchQuery)) ||
        opp.opportunityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opp.opportunityNameCn && opp.opportunityNameCn.includes(searchQuery)) ||
        opp.salesOwner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opp.salesOwnerCn && opp.salesOwnerCn.includes(searchQuery)) ||
        opp.stage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opp.regionCn && opp.regionCn.includes(searchQuery)) ||
        opp.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opp.countryCn && opp.countryCn.includes(searchQuery))
      )
    : opportunities;

  const displayOpportunities = selectedOpportunity === 'all' 
    ? filteredOpportunities 
    : filteredOpportunities.filter(opp => opp.id.toString() === selectedOpportunity);

  const sortedOpportunities = [...displayOpportunities].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedOpportunities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOpportunities = sortedOpportunities.slice(startIndex, endIndex);

  // Reset to page 1 when search query or selection changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedOpportunity]);

  const handleSort = (field: keyof Opportunity) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage: Stage) => {
    switch (stage) {
      case 'Lead':
        return 'bg-blue-100 text-blue-800';
      case 'Proposal':
        return 'bg-purple-100 text-purple-800';
      case 'Negotiation':
        return 'bg-orange-100 text-orange-800';
      case 'Won':
        return 'bg-green-100 text-green-800';
      case 'Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotalValue = () => {
    return sortedOpportunities.reduce((total, opp) => {
      // Convert to USD for calculation (simplified conversion)
      const usdAmount = opp.currency === 'EUR' ? opp.amount * 1.1 : 
                      opp.currency === 'CNY' ? opp.amount * 0.14 :
                      opp.currency === 'GBP' ? opp.amount * 1.25 : opp.amount;
      return total + usdAmount;
    }, 0);
  };

  const calculateWonRevenue = () => {
    return sortedOpportunities
      .filter(opp => opp.stage === 'Won')
      .reduce((total, opp) => {
        // Convert to USD for calculation (simplified conversion)
        const usdAmount = opp.currency === 'EUR' ? opp.amount * 1.1 : 
                        opp.currency === 'CNY' ? opp.amount * 0.14 :
                        opp.currency === 'GBP' ? opp.amount * 1.25 : opp.amount;
        return total + usdAmount;
      }, 0);
  };

  // Handle double-click on row to view opportunity details
  const handleRowDoubleClick = (opportunityId: number | string) => {
    navigate(`/opportunities/${opportunityId.toString()}`);
  };


  return (
    <div className="h-full flex flex-col">
      {/* Fixed top section - similar to CustomerInsights */}
      <div className="space-y-4 mb-6 mt-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">{t.selectOpportunity}</label>
          <Select value={selectedOpportunity} onValueChange={setSelectedOpportunity}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allOpportunities}</SelectItem>
              {opportunities.map((opp) => (
                <SelectItem key={opp.id} value={opp.id.toString()}>
                  {language === 'zh' && opp.opportunityNameCn ? opp.opportunityNameCn : opp.opportunityName} - {language === 'zh' && opp.customerCn ? opp.customerCn : opp.customer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t.totalOpportunities}：</span>
                <span className="font-medium">{sortedOpportunities.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t.wonDeals}：</span>
                <span className="font-medium">
                  {sortedOpportunities.filter(o => o.status === 'Won').length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{t.wonRevenue}：</span>
                <span className="font-medium">
                  ${calculateWonRevenue().toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{t.wonRate}：</span>
                <span className="font-medium">
                  {Math.round((sortedOpportunities.filter(o => o.status === 'Won').length / sortedOpportunities.length) * 100) || 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Opportunities Table */}
      <div className="flex-1 overflow-auto">
        {sortedOpportunities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">{t.noResults}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('customer')}>
                        <div className="flex items-center space-x-1">
                          <span>{t.customer}</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('opportunityName')}>
                        <div className="flex items-center space-x-1">
                          <span>{t.opportunityName}</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>{t.region}</TableHead>
                      <TableHead>{t.country}</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('priority')}>
                        <div className="flex items-center space-x-1">
                          <span>{t.priority}</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                        <div className="flex items-center space-x-1">
                          <span>{t.amount}</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                        <div className="flex items-center space-x-1">
                          <span>{t.status}</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>{t.lastUpdate}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOpportunities.map((opportunity) => (
                      <TableRow
                        key={opportunity.id}
                        className="cursor-pointer hover:bg-green-50 transition-colors"
                        onDoubleClick={() => handleRowDoubleClick(opportunity.id)}
                      >
                        <TableCell>
                          {language === 'zh' && opportunity.customerCn ? opportunity.customerCn : opportunity.customer}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[180px] truncate">
                            {language === 'zh' && opportunity.opportunityNameCn ? opportunity.opportunityNameCn : opportunity.opportunityName}
                          </div>
                        </TableCell>
                        <TableCell>
                          {language === 'zh' && opportunity.regionCn ? opportunity.regionCn : opportunity.region}
                        </TableCell>
                        <TableCell>
                          {language === 'zh' && opportunity.countryCn ? opportunity.countryCn : opportunity.country}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(opportunity.priority)}>
                            {t.priorities[opportunity.priority]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(opportunity.amount, opportunity.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStageColor(opportunity.stage)}>
                            {t.statuses[opportunity.stage]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="text-sm">
                              {opportunity.lastUpdate.date}
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-normal break-words">
                              {language === 'zh' && opportunity.lastUpdate.noteCn ? opportunity.lastUpdate.noteCn : opportunity.lastUpdate.note}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {sortedOpportunities.length > 0 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={sortedOpportunities.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                  language={language}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}