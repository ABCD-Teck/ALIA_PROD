import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ArrowLeft, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { Language } from '../../App';
import * as api from '../../services/api';

interface ArchivedInteractionsProps {
  searchQuery: string;
  language: Language;
}

interface Interaction {
  interaction_id: string;
  subject: string;
  interaction_type: string;
  interaction_date: string;
  company_name: string;
  contact_name: string;
  location?: string;
  description?: string;
  medium?: string;
  outcome?: string;
  updated_at: string;
}

export function ArchivedInteractions({
  searchQuery,
  language
}: ArchivedInteractionsProps) {
  const navigate = useNavigate();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch archived interactions from API
  const fetchArchivedInteractions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.interactionsApi.getArchived({
        limit: 1000,
        search: searchQuery || undefined
      });

      if (response.data && response.data.interactions) {
        setInteractions(response.data.interactions);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error('Error fetching archived interactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch archived interactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedInteractions();
  }, []);

  // Refetch when search query changes
  useEffect(() => {
    if (!loading) {
      fetchArchivedInteractions();
    }
  }, [searchQuery]);

  const content = {
    zh: {
      title: '归档互动',
      backToInteractions: '返回客户互动',
      subject: '主题',
      type: '类型',
      date: '日期',
      company: '公司',
      contact: '联系人',
      location: '地点',
      outcome: '结果',
      actions: '操作',
      restore: '恢复',
      delete: '删除',
      noResults: '未找到归档互动记录',
      confirmDelete: '确定要永久删除此互动记录吗？此操作无法撤销。',
      confirmRestore: '确定要恢复此互动记录吗？',
      deleteSuccess: '互动记录已永久删除',
      restoreSuccess: '互动记录已恢复',
      deleteError: '删除失败',
      restoreError: '恢复失败',
      loading: '加载中...',
      types: {
        visit: '客户拜访',
        marketing: '营销活动',
        technical: '技术交流',
        phone: '电话沟通',
        email: '邮件沟通',
        meeting: '会议',
        call: '电话',
        event: '活动',
        'Customer Visit': '客户拜访'
      },
      outcomes: {
        positive: '积极',
        negative: '消极',
        neutral: '中立',
        pending: '待定',
        successful: '成功',
        'in-progress': '进行中',
        very_positive: '非常积极',
        POSITIVE: '积极'
      }
    },
    en: {
      title: 'Archived Interactions',
      backToInteractions: 'Back to Interactions',
      subject: 'Subject',
      type: 'Type',
      date: 'Date',
      company: 'Company',
      contact: 'Contact',
      location: 'Location',
      outcome: 'Outcome',
      actions: 'Actions',
      restore: 'Restore',
      delete: 'Delete',
      noResults: 'No archived interactions found',
      confirmDelete: 'Are you sure you want to permanently delete this interaction? This action cannot be undone.',
      confirmRestore: 'Are you sure you want to restore this interaction?',
      deleteSuccess: 'Interaction permanently deleted',
      restoreSuccess: 'Interaction restored',
      deleteError: 'Failed to delete interaction',
      restoreError: 'Failed to restore interaction',
      loading: 'Loading...',
      types: {
        visit: 'Client Visit',
        marketing: 'Marketing Event',
        technical: 'Technical Exchange',
        phone: 'Phone Communication',
        email: 'Email Communication',
        meeting: 'Meeting',
        call: 'Call',
        event: 'Event',
        'Customer Visit': 'Customer Visit'
      },
      outcomes: {
        positive: 'Positive',
        negative: 'Negative',
        neutral: 'Neutral',
        pending: 'Pending',
        successful: 'Successful',
        'in-progress': 'In Progress',
        very_positive: 'Very Positive',
        POSITIVE: 'Positive'
      }
    }
  };

  const t = content[language];

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'visit':
      case 'customer visit':
      case '客户拜访':
        return 'bg-blue-100 text-blue-800';
      case 'marketing':
      case '营销活动':
        return 'bg-green-100 text-green-800';
      case 'technical':
      case '技术交流':
        return 'bg-purple-100 text-purple-800';
      case 'phone':
      case 'call':
      case '电话沟通':
        return 'bg-orange-100 text-orange-800';
      case 'email':
      case '邮件沟通':
        return 'bg-yellow-100 text-yellow-800';
      case 'meeting':
      case '会议':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome.toLowerCase()) {
      case 'positive':
      case 'successful':
      case 'very_positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeText = (type: string) => {
    const typeKey = type as keyof typeof t.types;
    return t.types[typeKey] || type;
  };

  const getOutcomeText = (outcome: string) => {
    const outcomeKey = outcome as keyof typeof t.outcomes;
    return t.outcomes[outcomeKey] || outcome;
  };

  const handleRestore = async (interactionId: string) => {
    if (!confirm(t.confirmRestore)) {
      return;
    }

    try {
      const response = await api.interactionsApi.unarchive(interactionId);
      if (response.data || !response.error) {
        alert(t.restoreSuccess);
        // Refresh the list
        await fetchArchivedInteractions();
      } else {
        alert(t.restoreError + ': ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error restoring interaction:', err);
      alert(t.restoreError);
    }
  };

  const handleDelete = async (interactionId: string) => {
    if (!confirm(t.confirmDelete)) {
      return;
    }

    try {
      const response = await api.interactionsApi.delete(interactionId);
      if (response.data || !response.error) {
        alert(t.deleteSuccess);
        // Refresh the list
        await fetchArchivedInteractions();
      } else {
        alert(t.deleteError + ': ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error deleting interaction:', err);
      alert(t.deleteError);
    }
  };

  const filteredInteractions = searchQuery
    ? interactions.filter(interaction =>
        interaction.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interaction.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interaction.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : interactions;

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/interactions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToInteractions}
          </Button>
          <h2 className="text-2xl font-bold">{t.title}</h2>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#009699] mr-3" />
              <p className="text-muted-foreground">{t.loading}</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-600 mb-2">
              {language === 'zh' ? '加载失败' : 'Failed to load'}
            </p>
            <p className="text-sm text-gray-600">{error}</p>
          </CardContent>
        </Card>
      ) : filteredInteractions.length === 0 ? (
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
                    <TableHead>{t.subject}</TableHead>
                    <TableHead>{t.type}</TableHead>
                    <TableHead>{t.date}</TableHead>
                    <TableHead>{t.company}</TableHead>
                    <TableHead>{t.contact}</TableHead>
                    <TableHead>{t.location}</TableHead>
                    <TableHead>{t.outcome}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInteractions.map((interaction) => (
                    <TableRow key={interaction.interaction_id}>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="font-medium truncate">{interaction.subject}</div>
                          {interaction.description && (
                            <div className="text-xs text-muted-foreground truncate mt-1">
                              {interaction.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(interaction.interaction_type)}>
                          {getTypeText(interaction.interaction_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(interaction.interaction_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate">
                          {interaction.company_name || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[120px] truncate">
                          {interaction.contact_name || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[120px] truncate">
                          {interaction.location || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {interaction.outcome ? (
                          <Badge className={getOutcomeColor(interaction.outcome)}>
                            {getOutcomeText(interaction.outcome)}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(interaction.interaction_id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            {t.restore}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(interaction.interaction_id)}
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
