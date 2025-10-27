import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { ArrowLeft, Loader2, Calendar, User, MapPin, Clock, Edit, Check, X } from 'lucide-react';
import { Language } from '../../App';
import * as api from '../../services/api';

interface InteractionDetailProps {
  searchQuery: string;
  language: Language;
}

export function InteractionDetail({
  searchQuery,
  language
}: InteractionDetailProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const interactionId = id;
  const [interaction, setInteraction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editedDate, setEditedDate] = useState<string>('');
  const [editedTime, setEditedTime] = useState<string>('');
  const [isSavingTime, setIsSavingTime] = useState(false);

  // Fetch interaction details from API
  useEffect(() => {
    const fetchInteraction = async () => {
      if (!interactionId) {
        setError('No interaction ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.interactionsApi.getById(interactionId);
        console.log('GetById response:', response); // Debug logging
        if (response.data) {
          setInteraction(response.data);
          setError(null);
        } else {
          const errorMsg = response.error || 'Unknown error';
          const detailMsg = (response as any).detail || (response as any).message || '';
          const fullError = errorMsg + (detailMsg ? ': ' + detailMsg : '');
          console.error('Get interaction error response:', response);
          setError(fullError);
        }
      } catch (err) {
        console.error('Error fetching interaction:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch interaction');
      } finally {
        setLoading(false);
      }
    };

    fetchInteraction();
  }, [interactionId]);

  const content = {
    zh: {
      title: '互动详情',
      backButton: '返回',
      viewInCalendar: '在日历中查看',
      company: '公司：',
      visitDate: '拜访时间：',
      visitTarget: '拜访对象：',
      participants: '参与业务员：',
      visitPurpose: '拜访目的：',
      discussionContent: '交谈内容：',
      existingProblems: '存在问题：',
      nextSteps: '下一步计划：',
      otherInfo: '其它信息：',
      attachments: '附件：'
    },
    en: {
      title: 'Interaction Details',
      backButton: 'Back',
      viewInCalendar: 'View in Calendar',
      company: 'Company:',
      visitDate: 'Visit Date:',
      visitTarget: 'Visit Target:',
      participants: 'Participants:',
      visitPurpose: 'Visit Purpose:',
      discussionContent: 'Discussion Content:',
      existingProblems: 'Existing Problems:',
      nextSteps: 'Next Steps:',
      otherInfo: 'Other Information:',
      attachments: 'Attachments:'
    }
  };

  const t = content[language];

  // Initialize edit fields when interaction is loaded
  useEffect(() => {
    if (interaction) {
      const interactionDate = new Date(interaction.interaction_date);
      setEditedDate(interactionDate.toISOString().split('T')[0]);
      const hours = interactionDate.getHours().toString().padStart(2, '0');
      const minutes = interactionDate.getMinutes().toString().padStart(2, '0');
      setEditedTime(`${hours}:${minutes}`);
    }
  }, [interaction]);

  const handleEditTime = () => {
    setIsEditingTime(true);
  };

  const handleCancelEditTime = () => {
    setIsEditingTime(false);
    // Reset to original values
    if (interaction) {
      const interactionDate = new Date(interaction.interaction_date);
      setEditedDate(interactionDate.toISOString().split('T')[0]);
      const hours = interactionDate.getHours().toString().padStart(2, '0');
      const minutes = interactionDate.getMinutes().toString().padStart(2, '0');
      setEditedTime(`${hours}:${minutes}`);
    }
  };

  const handleSaveTime = async () => {
    try {
      setIsSavingTime(true);

      // Combine date and time
      const [hours, minutes] = editedTime.split(':');
      const newDateTime = new Date(editedDate);
      newDateTime.setHours(parseInt(hours), parseInt(minutes));

      // Update via API
      const response = await api.interactionsApi.update(interactionId!, {
        interaction_date: newDateTime.toISOString()
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Update local state
      setInteraction({
        ...interaction,
        interaction_date: newDateTime.toISOString()
      });

      setIsEditingTime(false);
      alert(language === 'zh' ? '时间更新成功！' : 'Time updated successfully!');
    } catch (err) {
      console.error('Error updating time:', err);
      alert(language === 'zh'
        ? `更新失败: ${err instanceof Error ? err.message : '未知错误'}`
        : `Update failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setIsSavingTime(false);
    }
  };

  // Map interaction type to display text
  const getTypeText = (type: string) => {
    const typeMap: Record<string, { zh: string; en: string }> = {
      'visit': { zh: '客户拜访', en: 'Client Visit' },
      'marketing': { zh: '营销活动', en: 'Marketing Event' },
      'technical': { zh: '技术交流', en: 'Technical Exchange' },
      'phone': { zh: '电话沟通', en: 'Phone Communication' },
      'email': { zh: '邮件沟通', en: 'Email Communication' },
      'meeting': { zh: '会议', en: 'Meeting' }
    };
    return language === 'zh'
      ? (typeMap[type]?.zh || type)
      : (typeMap[type]?.en || type);
  };

  // Map outcome to display text
  const getOutcomeText = (outcome: string) => {
    const outcomeMap: Record<string, { zh: string; en: string }> = {
      'successful': { zh: '成功', en: 'Successful' },
      'pending': { zh: '待定', en: 'Pending' },
      'cancelled': { zh: '已取消', en: 'Cancelled' },
      'failed': { zh: '失败', en: 'Failed' }
    };
    return language === 'zh'
      ? (outcomeMap[outcome]?.zh || outcome)
      : (outcomeMap[outcome]?.en || outcome);
  };

  // Map medium to display text
  const getMediumText = (medium: string) => {
    const mediumMap: Record<string, { zh: string; en: string }> = {
      'in-person': { zh: '现场会面', en: 'In-Person' },
      'video': { zh: '视频会议', en: 'Video Conference' },
      'phone': { zh: '电话', en: 'Phone' },
      'email': { zh: '邮件', en: 'Email' },
      'online': { zh: '在线', en: 'Online' }
    };
    return language === 'zh'
      ? (mediumMap[medium]?.zh || medium)
      : (mediumMap[medium]?.en || medium);
  };

  if (loading) {
    return (
      <div className="pt-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#009699]" />
        <span className="ml-3 text-gray-600">
          {language === 'zh' ? '加载互动详情中...' : 'Loading interaction details...'}
        </span>
      </div>
    );
  }

  if (error || !interaction) {
    return (
      <div className="pt-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/interactions')}
          className="flex items-center space-x-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.backButton}</span>
        </Button>
        <div className="text-center py-8 text-red-600">
          {language === 'zh' ? '加载失败: ' : 'Failed to load: '}
          {error || (language === 'zh' ? '未找到互动记录' : 'Interaction not found')}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 space-y-6">
      {/* Header with Back Button and Calendar Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/interactions')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.backButton}</span>
        </Button>

        {interaction.interaction_date && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/calendar')}
            className="flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>{t.viewInCalendar}</span>
          </Button>
        )}
      </div>

      {/* Main Content */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-medium text-gray-900">
                {interaction.subject}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{getTypeText(interaction.interaction_type)}</Badge>
                <Badge variant={interaction.outcome === 'successful' ? 'default' : 'secondary'}>
                  {getOutcomeText(interaction.outcome)}
                </Badge>
                {interaction.importance > 3 && (
                  <Badge variant="destructive">
                    {language === 'zh' ? '高重要性' : 'High Priority'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-3 font-medium text-gray-700">{t.company}</span>
                <span className="col-span-9 text-gray-900">{interaction.company_name || 'N/A'}</span>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-3 font-medium text-gray-700">{t.visitDate}</span>
                <span className="col-span-9 text-gray-900">
                  {isEditingTime ? (
                    <div className="flex items-center gap-3">
                      <Input
                        type="date"
                        value={editedDate}
                        onChange={(e) => setEditedDate(e.target.value)}
                        className="w-48"
                      />
                      <Input
                        type="time"
                        value={editedTime}
                        onChange={(e) => setEditedTime(e.target.value)}
                        className="w-32"
                      />
                      <Button
                        size="sm"
                        variant="default"
                        onClick={handleSaveTime}
                        disabled={isSavingTime}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSavingTime ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEditTime}
                        disabled={isSavingTime}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>
                        {new Date(interaction.interaction_date).toLocaleString(
                          language === 'zh' ? 'zh-CN' : 'en-US',
                          { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                        )}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditTime}
                        className="h-8 px-2"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </span>
              </div>

              {interaction.contact_name && (
                <div className="grid grid-cols-12 gap-4">
                  <span className="col-span-3 font-medium text-gray-700">{t.visitTarget}</span>
                  <span className="col-span-9 text-gray-900">{interaction.contact_name}</span>
                </div>
              )}

              {interaction.medium && (
                <div className="grid grid-cols-12 gap-4">
                  <span className="col-span-3 font-medium text-gray-700">
                    {language === 'zh' ? '互动方式' : 'Medium'}
                  </span>
                  <span className="col-span-9 text-gray-900">{getMediumText(interaction.medium)}</span>
                </div>
              )}

              {interaction.location && (
                <div className="grid grid-cols-12 gap-4">
                  <span className="col-span-3 font-medium text-gray-700">
                    {language === 'zh' ? '地点' : 'Location'}
                  </span>
                  <span className="col-span-9 text-gray-900">{interaction.location}</span>
                </div>
              )}

              {interaction.duration_minutes && (
                <div className="grid grid-cols-12 gap-4">
                  <span className="col-span-3 font-medium text-gray-700">
                    {language === 'zh' ? '时长' : 'Duration'}
                  </span>
                  <span className="col-span-9 text-gray-900">
                    {interaction.duration_minutes} {language === 'zh' ? '分钟' : 'minutes'}
                  </span>
                </div>
              )}

              {interaction.description && (
                <div className="grid grid-cols-12 gap-4">
                  <span className="col-span-3 font-medium text-gray-700">{t.discussionContent}</span>
                  <span className="col-span-9 text-gray-900 whitespace-pre-wrap">
                    {interaction.description}
                  </span>
                </div>
              )}

              {interaction.private_notes && (
                <div className="grid grid-cols-12 gap-4">
                  <span className="col-span-3 font-medium text-gray-700">
                    {language === 'zh' ? '备注' : 'Notes'}
                  </span>
                  <span className="col-span-9 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                    {interaction.private_notes}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-3 font-medium text-gray-700">
                  {language === 'zh' ? '情绪' : 'Sentiment'}
                </span>
                <span className="col-span-9">
                  <Badge variant="outline" className="capitalize">
                    {interaction.sentiment || 'neutral'}
                  </Badge>
                </span>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-3 font-medium text-gray-700">
                  {language === 'zh' ? '方向' : 'Direction'}
                </span>
                <span className="col-span-9">
                  <Badge variant="outline">
                    {interaction.direction === 'outbound'
                      ? (language === 'zh' ? '外呼' : 'Outbound')
                      : (language === 'zh' ? '来电' : 'Inbound')}
                  </Badge>
                </span>
              </div>

              {/* Timestamps */}
              {interaction.created_at && (
                <div className="grid grid-cols-12 gap-4 text-sm text-gray-500 pt-4 border-t">
                  <span className="col-span-3">
                    {language === 'zh' ? '创建时间' : 'Created'}
                  </span>
                  <span className="col-span-9">
                    {new Date(interaction.created_at).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}