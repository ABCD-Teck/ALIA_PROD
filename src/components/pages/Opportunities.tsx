import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  ArrowUpDown
} from 'lucide-react';
import { Language } from '../../App';

interface OpportunitiesProps {
  searchQuery: string;
  language: Language;
}

type Priority = 'High' | 'Medium' | 'Low';
type Status = 'Lead' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

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
  status: Status;
  lastUpdate: {
    date: string;
    note: string;
    noteCn?: string;
  };
  actionPlan: string;
  actionPlanCn?: string;
  createdDate: string;
}

const mockOpportunities: Opportunity[] = [
  {
    id: 1,
    customer: 'Acme Corporation',
    customerCn: '埃克米公司',
    opportunityName: 'Enterprise Software License',
    opportunityNameCn: '企业软件许可',
    description: 'Complete enterprise software solution with 3-year support',
    descriptionCn: '完整的企业软件解决方案，包含3年技术支持',
    region: 'Europe',
    regionCn: '欧洲',
    country: 'Germany',
    countryCn: '德国',
    partner: 'Tech Solutions GmbH',
    partnerCn: '科技解决方案有限公司',
    priority: 'High',
    amount: 125000,
    currency: 'EUR',
    salesOwner: 'Andrew Chen',
    status: 'Negotiation',
    lastUpdate: {
      date: '2025-01-15',
      note: 'Client requested additional security features. Preparing revised proposal.',
      noteCn: '客户要求增加安全功能。正在准备修订提案。'
    },
    actionPlan: 'Schedule security review meeting by Jan 20. Present updated proposal by Jan 25.',
    actionPlanCn: '1月20日前安排安全审查会议。1月25日前提交更新提案。',
    createdDate: '2025-01-01'
  },
  {
    id: 2,
    customer: 'TechStart Solutions',
    customerCn: '科技创业',
    opportunityName: 'Cloud Migration Project',
    opportunityNameCn: '云迁移项目',
    description: 'Migration of legacy systems to cloud infrastructure',
    descriptionCn: '将传统系统迁移到云基础设施',
    region: 'Asia Pacific',
    regionCn: '亚太地区',
    country: 'Singapore',
    countryCn: '新加坡',
    partner: 'Cloud Partners Asia',
    partnerCn: '亚洲云合作伙伴',
    priority: 'Medium',
    amount: 78000,
    currency: 'USD',
    salesOwner: 'Sarah Johnson',
    status: 'Proposal',
    lastUpdate: {
      date: '2025-01-12',
      note: 'Submitted detailed migration plan. Awaiting client feedback.',
      noteCn: '已提交详细迁移计划。等待客户反馈。'
    },
    actionPlan: 'Follow up on proposal by Jan 18. Prepare demo environment.',
    actionPlanCn: '1月18日前跟进提案。准备演示环境。',
    createdDate: '2025-01-01'
  },
  {
    id: 3,
    customer: 'Global Industries',
    customerCn: '环球工业',
    opportunityName: 'Digital Transformation',
    opportunityNameCn: '数字化转型',
    description: 'Complete digital transformation initiative',
    descriptionCn: '完整的数字化转型计划',
    region: 'North America',
    regionCn: '北美',
    country: 'United States',
    countryCn: '美国',
    partner: 'Innovation Partners US',
    partnerCn: '美国创新合作伙伴',
    priority: 'High',
    amount: 200000,
    currency: 'USD',
    salesOwner: 'Michael Smith',
    status: 'Lead',
    lastUpdate: {
      date: '2025-01-10',
      note: 'Initial discovery call completed. Strong interest expressed.',
      noteCn: '完成初步调研通话。客户表现出浓厚兴趣。'
    },
    actionPlan: 'Conduct needs assessment workshop by Jan 22. Prepare solution architecture.',
    actionPlanCn: '1月22日前开展需求评估研讨会。准备解决方案架构。',
    createdDate: '2025-01-05'
  },
  {
    id: 4,
    customer: 'Alibaba Cloud',
    customerCn: '阿里云',
    opportunityName: 'AI Infrastructure Setup',
    opportunityNameCn: 'AI基础设施建设',
    description: 'Complete AI infrastructure for data processing',
    descriptionCn: '完整的AI基础设施用于数据处理',
    region: 'Asia Pacific',
    regionCn: '亚太地区',
    country: 'China',
    countryCn: '中国',
    partner: 'Tech Partners China',
    partnerCn: '中国技术合作伙伴',
    priority: 'High',
    amount: 300000,
    currency: 'CNY',
    salesOwner: '李明',
    salesOwnerCn: '李明',
    status: 'Lead',
    lastUpdate: {
      date: '2025-01-20',
      note: 'Initial meeting completed. Technical requirements gathered.',
      noteCn: '完成初步会议。收集技术需求。'
    },
    actionPlan: 'Prepare technical proposal by Jan 30. Schedule technical review.',
    actionPlanCn: '1月30日前准备技术提案。安排技术评审。',
    createdDate: '2025-01-18'
  }
];

export function Opportunities({ searchQuery, language }: OpportunitiesProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockOpportunities);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Opportunity>('createdDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

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
        opp.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const getStatusColor = (status: Status) => {
    switch (status) {
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
      .filter(opp => opp.status === 'Won')
      .reduce((total, opp) => {
        // Convert to USD for calculation (simplified conversion)
        const usdAmount = opp.currency === 'EUR' ? opp.amount * 1.1 : 
                        opp.currency === 'CNY' ? opp.amount * 0.14 :
                        opp.currency === 'GBP' ? opp.amount * 1.25 : opp.amount;
        return total + usdAmount;
      }, 0);
  };

  const handleCellClick = (id: number, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
  };

  const handleCellSave = () => {
    if (!editingCell) return;
    
    setOpportunities(prev => prev.map(opp => {
      if (opp.id === editingCell.id) {
        if (editingCell.field === 'amount') {
          return { ...opp, [editingCell.field]: parseFloat(editValue) || 0 };
        }
        if (editingCell.field === 'lastUpdateNote') {
          return { 
            ...opp, 
            lastUpdate: { 
              ...opp.lastUpdate, 
              note: editValue,
              noteCn: editValue // For simplicity, using same value for both languages
            } 
          };
        }
        return { ...opp, [editingCell.field]: editValue };
      }
      return opp;
    }));
    
    setEditingCell(null);
    setEditValue('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handlePriorityChange = (id: number, priority: Priority) => {
    setOpportunities(prev => prev.map(opp => 
      opp.id === id ? { ...opp, priority } : opp
    ));
  };

  const handleStatusChange = (id: number, status: Status) => {
    setOpportunities(prev => prev.map(opp => 
      opp.id === id ? { ...opp, status } : opp
    ));
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t.totalOpportunities}：</span>
                <span className="font-medium">{sortedOpportunities.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t.totalValue}：</span>
                <span className="font-medium">
                  ${calculateTotalValue().toLocaleString()}
                </span>
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
              <div className="overflow-x-auto">
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
                      <TableHead>{t.partner}</TableHead>
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
                      <TableHead>{t.salesOwner}</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                        <div className="flex items-center space-x-1">
                          <span>{t.status}</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>{t.lastUpdate}</TableHead>
                      <TableHead>{t.actionPlan}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedOpportunities.map((opportunity) => (
                      <TableRow key={opportunity.id}>
                        <TableCell>
                          {editingCell?.id === opportunity.id && editingCell?.field === 'customer' ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellSave}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave();
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              autoFocus
                              className="h-8"
                            />
                          ) : (
                            <span 
                              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                              onClick={() => handleCellClick(
                                opportunity.id, 
                                'customer', 
                                language === 'zh' && opportunity.customerCn ? opportunity.customerCn : opportunity.customer
                              )}
                            >
                              {language === 'zh' && opportunity.customerCn ? opportunity.customerCn : opportunity.customer}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingCell?.id === opportunity.id && editingCell?.field === 'opportunityName' ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellSave}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave();
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              autoFocus
                              className="h-8"
                            />
                          ) : (
                            <span 
                              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded max-w-[180px] block"
                              onClick={() => handleCellClick(
                                opportunity.id, 
                                'opportunityName', 
                                language === 'zh' && opportunity.opportunityNameCn ? opportunity.opportunityNameCn : opportunity.opportunityName
                              )}
                            >
                              {language === 'zh' && opportunity.opportunityNameCn ? opportunity.opportunityNameCn : opportunity.opportunityName}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingCell?.id === opportunity.id && editingCell?.field === 'region' ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellSave}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave();
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              autoFocus
                              className="h-8"
                            />
                          ) : (
                            <span 
                              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                              onClick={() => handleCellClick(
                                opportunity.id, 
                                'region', 
                                language === 'zh' && opportunity.regionCn ? opportunity.regionCn : opportunity.region
                              )}
                            >
                              {language === 'zh' && opportunity.regionCn ? opportunity.regionCn : opportunity.region}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingCell?.id === opportunity.id && editingCell?.field === 'country' ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellSave}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave();
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              autoFocus
                              className="h-8"
                            />
                          ) : (
                            <span 
                              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                              onClick={() => handleCellClick(
                                opportunity.id, 
                                'country', 
                                language === 'zh' && opportunity.countryCn ? opportunity.countryCn : opportunity.country
                              )}
                            >
                              {language === 'zh' && opportunity.countryCn ? opportunity.countryCn : opportunity.country}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingCell?.id === opportunity.id && editingCell?.field === 'partner' ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellSave}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave();
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              autoFocus
                              className="h-8"
                            />
                          ) : (
                            <span 
                              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded whitespace-nowrap text-sm"
                              onClick={() => handleCellClick(
                                opportunity.id, 
                                'partner', 
                                language === 'zh' && opportunity.partnerCn ? opportunity.partnerCn : opportunity.partner
                              )}
                            >
                              {language === 'zh' && opportunity.partnerCn ? opportunity.partnerCn : opportunity.partner}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={opportunity.priority} 
                            onValueChange={(value: Priority) => handlePriorityChange(opportunity.id, value)}
                          >
                            <SelectTrigger className="h-8 w-auto">
                              <Badge className={getPriorityColor(opportunity.priority)}>
                                {t.priorities[opportunity.priority]}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="High">{t.priorities.High}</SelectItem>
                              <SelectItem value="Medium">{t.priorities.Medium}</SelectItem>
                              <SelectItem value="Low">{t.priorities.Low}</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {editingCell?.id === opportunity.id && editingCell?.field === 'amount' ? (
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellSave}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave();
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              autoFocus
                              className="h-8"
                            />
                          ) : (
                            <span 
                              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded font-medium"
                              onClick={() => handleCellClick(opportunity.id, 'amount', opportunity.amount.toString())}
                            >
                              {formatCurrency(opportunity.amount, opportunity.currency)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingCell?.id === opportunity.id && editingCell?.field === 'salesOwner' ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellSave}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave();
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              autoFocus
                              className="h-8"
                            />
                          ) : (
                            <span 
                              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                              onClick={() => handleCellClick(
                                opportunity.id, 
                                'salesOwner', 
                                language === 'zh' && opportunity.salesOwnerCn ? opportunity.salesOwnerCn : opportunity.salesOwner
                              )}
                            >
                              {language === 'zh' && opportunity.salesOwnerCn ? opportunity.salesOwnerCn : opportunity.salesOwner}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={opportunity.status} 
                            onValueChange={(value: Status) => handleStatusChange(opportunity.id, value)}
                          >
                            <SelectTrigger className="h-8 w-auto">
                              <Badge className={getStatusColor(opportunity.status)}>
                                {t.statuses[opportunity.status]}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Lead">{t.statuses.Lead}</SelectItem>
                              <SelectItem value="Proposal">{t.statuses.Proposal}</SelectItem>
                              <SelectItem value="Negotiation">{t.statuses.Negotiation}</SelectItem>
                              <SelectItem value="Won">{t.statuses.Won}</SelectItem>
                              <SelectItem value="Lost">{t.statuses.Lost}</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="text-sm">
                              {opportunity.lastUpdate.date}
                            </div>
                            {editingCell?.id === opportunity.id && editingCell?.field === 'lastUpdateNote' ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleCellSave}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCellSave();
                                  if (e.key === 'Escape') handleCellCancel();
                                }}
                                autoFocus
                                className="h-8 mt-1"
                              />
                            ) : (
                              <div 
                                className="text-xs text-muted-foreground whitespace-normal break-words cursor-pointer hover:bg-gray-100 px-1 py-1 rounded"
                                onClick={() => handleCellClick(
                                  opportunity.id, 
                                  'lastUpdateNote', 
                                  language === 'zh' && opportunity.lastUpdate.noteCn ? opportunity.lastUpdate.noteCn : opportunity.lastUpdate.note
                                )}
                              >
                                {language === 'zh' && opportunity.lastUpdate.noteCn ? opportunity.lastUpdate.noteCn : opportunity.lastUpdate.note}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {editingCell?.id === opportunity.id && editingCell?.field === 'actionPlan' ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellSave}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave();
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              autoFocus
                              className="h-8"
                            />
                          ) : (
                            <div 
                              className="min-w-[120px] max-w-[450px] cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                              onClick={() => handleCellClick(
                                opportunity.id, 
                                'actionPlan', 
                                language === 'zh' && opportunity.actionPlanCn ? opportunity.actionPlanCn : opportunity.actionPlan
                              )}
                            >
                              <div className="text-sm whitespace-normal break-words">
                                {language === 'zh' && opportunity.actionPlanCn ? opportunity.actionPlanCn : opportunity.actionPlan}
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}