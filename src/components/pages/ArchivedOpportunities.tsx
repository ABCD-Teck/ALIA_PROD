import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ArrowLeft, Trash2, RefreshCw } from 'lucide-react';
import { Language } from '../../App';
import * as api from '../../services/api';

interface ArchivedOpportunitiesProps {
  searchQuery: string;
  language: Language;
}

type Priority = 'High' | 'Medium' | 'Low';
type Status = 'Lead' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

interface Opportunity {
  id: number | string;
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
  priority: Priority;
  amount: number;
  currency: string;
  status: Status;
  lastUpdate: {
    date: string;
    note: string;
    noteCn?: string;
  };
  createdDate: string;
}

export function ArchivedOpportunities({
  searchQuery,
  language
}: ArchivedOpportunitiesProps) {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map backend stage values to frontend status values
  const capitalizeStatus = (stage: string): Status => {
    const stageToStatusMap: Record<string, Status> = {
      'prospecting': 'Lead',
      'proposal': 'Proposal',
      'negotiation': 'Negotiation',
      'closed_won': 'Won',
      'closed_lost': 'Lost',
      'qualification': 'Lead',
    };

    const normalizedStage = (stage || 'prospecting').toLowerCase();
    return stageToStatusMap[normalizedStage] || 'Lead';
  };

  // Fetch archived opportunities from API
  const fetchArchivedOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get all opportunities including archived ones
      const response = await api.opportunitiesApi.getAll({
        limit: 1000,
        include_archived: true
      });
      if (response.data && response.data.opportunities) {
        // Filter for archived opportunities (is_deleted = true)
        const transformedOpportunities = response.data.opportunities
          .filter((opp: any) => opp.is_deleted === true) // Only show archived
          .map((opp: any) => {
            const capitalizePriority = (priority: string): Priority => {
              const p = (priority || 'medium').toLowerCase();
              return (p.charAt(0).toUpperCase() + p.slice(1)) as Priority;
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
              priority: capitalizePriority(opp.priority),
              amount: parseFloat(opp.amount) || 0,
              currency: opp.currency_code || opp.currency_symbol || 'USD',
              status: capitalizeStatus(opp.stage),
              lastUpdate: {
                date: opp.updated_at ? new Date(opp.updated_at).toISOString().split('T')[0] : '',
                note: opp.description || '',
                noteCn: opp.description || '',
              },
              createdDate: opp.created_at ? new Date(opp.created_at).toISOString().split('T')[0] : '',
            };
          });
        setOpportunities(transformedOpportunities);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error('Error fetching archived opportunities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch archived opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedOpportunities();
  }, []);

  const content = {
    zh: {
      title: '归档商机',
      backToOpportunities: '返回商机管理',
      customer: '客户',
      opportunityName: '商机名称',
      region: '区域',
      country: '国家',
      priority: '优先级',
      amount: '金额',
      status: '状态',
      lastUpdate: '最新更新',
      actions: '操作',
      restore: '恢复',
      delete: '删除',
      noResults: '未找到归档商机',
      confirmDelete: '确定要永久删除此商机吗？此操作无法撤销。',
      confirmRestore: '确定要恢复此商机吗？',
      deleteSuccess: '商机已永久删除',
      restoreSuccess: '商机已恢复',
      deleteError: '删除失败',
      restoreError: '恢复失败',
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
      }
    },
    en: {
      title: 'Archived Opportunities',
      backToOpportunities: 'Back to Opportunities',
      customer: 'Customer',
      opportunityName: 'Opportunity',
      region: 'Region',
      country: 'Country',
      priority: 'Priority',
      amount: 'Amount',
      status: 'Status',
      lastUpdate: 'Last Update',
      actions: 'Actions',
      restore: 'Restore',
      delete: 'Delete',
      noResults: 'No archived opportunities found',
      confirmDelete: 'Are you sure you want to permanently delete this opportunity? This action cannot be undone.',
      confirmRestore: 'Are you sure you want to restore this opportunity?',
      deleteSuccess: 'Opportunity permanently deleted',
      restoreSuccess: 'Opportunity restored',
      deleteError: 'Failed to delete opportunity',
      restoreError: 'Failed to restore opportunity',
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
      }
    }
  };

  const t = content[language];

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

  const handleRestore = async (opportunityId: number | string) => {
    if (!confirm(t.confirmRestore)) {
      return;
    }

    try {
      const response = await api.opportunitiesApi.restore(opportunityId.toString());
      if (response.data || response.success) {
        alert(t.restoreSuccess);
        // Refresh the list
        await fetchArchivedOpportunities();
      } else {
        alert(t.restoreError);
      }
    } catch (err) {
      console.error('Error restoring opportunity:', err);
      alert(t.restoreError);
    }
  };

  const handleDelete = async (opportunityId: number | string) => {
    if (!confirm(t.confirmDelete)) {
      return;
    }

    try {
      const response = await api.opportunitiesApi.delete(opportunityId.toString());
      if (response.data || response.success) {
        alert(t.deleteSuccess);
        // Refresh the list
        await fetchArchivedOpportunities();
      } else {
        alert(t.deleteError);
      }
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      alert(t.deleteError);
    }
  };

  const filteredOpportunities = searchQuery
    ? opportunities.filter(opp =>
        opp.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opp.customerCn && opp.customerCn.includes(searchQuery)) ||
        opp.opportunityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opp.opportunityNameCn && opp.opportunityNameCn.includes(searchQuery))
      )
    : opportunities;

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/opportunities')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToOpportunities}
          </Button>
          <h2 className="text-2xl font-bold">{t.title}</h2>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : filteredOpportunities.length === 0 ? (
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
                    <TableHead>{t.customer}</TableHead>
                    <TableHead>{t.opportunityName}</TableHead>
                    <TableHead>{t.region}</TableHead>
                    <TableHead>{t.country}</TableHead>
                    <TableHead>{t.priority}</TableHead>
                    <TableHead>{t.amount}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.lastUpdate}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOpportunities.map((opportunity) => (
                    <TableRow key={opportunity.id}>
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
                        <Badge className={getStatusColor(opportunity.status)}>
                          {t.statuses[opportunity.status]}
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
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(opportunity.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            {t.restore}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(opportunity.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {t.delete}
                          </Button>
                        </div>
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
  );
}
