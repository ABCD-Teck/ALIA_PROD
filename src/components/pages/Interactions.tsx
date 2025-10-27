import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Calendar, Loader2, Edit, Archive, Save, X } from 'lucide-react';
import { Language } from '../../App';
import * as api from '../../services/api';

interface InteractionsProps {
  searchQuery: string;
  language: Language;
}

export function Interactions({ searchQuery, language }: InteractionsProps) {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [pastInteractions, setPastInteractions] = useState<any[]>([]);
  const [futureInteractions, setFutureInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingInteraction, setEditingInteraction] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  // Fetch interactions from API
  const fetchInteractions = async () => {
    setLoading(true);
    try {
      // Fetch both past and future interactions in parallel
      const [pastResponse, futureResponse] = await Promise.all([
        api.interactionsApi.getPast({ limit: 100 }),
        api.interactionsApi.getFuture({ limit: 100 })
      ]);

      if (pastResponse.data?.interactions) {
        setPastInteractions(pastResponse.data.interactions);
      } else if (pastResponse.error) {
        setError(pastResponse.error);
      }

      if (futureResponse.data?.interactions) {
        setFutureInteractions(futureResponse.data.interactions);
      } else if (futureResponse.error && !pastResponse.error) {
        setError(futureResponse.error);
      }
    } catch (err) {
      console.error('Error fetching interactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch interactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractions();
  }, []);

  const content = {
    zh: {
      pastActivities: '历史拜访与活动',
      futureActivities: '未来拜访与活动',
      noFutureActivities: '在当前筛选条件下，暂无未来活动。',
      viewDetails: '查看详情',
      edit: '编辑',
      delete: '删除',
      archive: '归档',
      editInteraction: '编辑互动记录',
      save: '保存',
      cancel: '取消',
      saving: '保存中...',
      deleting: '删除中...',
      archiving: '归档中...',
      confirmDelete: '确认删除此互动记录？',
      confirmArchive: '确认归档此互动记录？归档后可以在归档列表中查看和恢复。',
      subject: '主题',
      description: '描述',
      date: '日期',
      type: '类型',
      location: '地点',
      deleteSuccess: '删除成功',
      updateSuccess: '更新成功',
      deleteError: '删除失败',
      updateError: '更新失败'
    },
    en: {
      pastActivities: 'Past Visits & Activities',
      futureActivities: 'Future Visits & Activities',
      noFutureActivities: 'No future activities under current filter conditions.',
      viewDetails: 'View Details',
      edit: 'Edit',
      delete: 'Delete',
      archive: 'Archive',
      editInteraction: 'Edit Interaction',
      save: 'Save',
      cancel: 'Cancel',
      saving: 'Saving...',
      deleting: 'Deleting...',
      archiving: 'Archiving...',
      confirmDelete: 'Confirm delete this interaction?',
      confirmArchive: 'Confirm archive this interaction? You can view and restore it from the archive list.',
      subject: 'Subject',
      description: 'Description',
      date: 'Date',
      type: 'Type',
      location: 'Location',
      deleteSuccess: 'Deleted successfully',
      updateSuccess: 'Updated successfully',
      deleteError: 'Failed to delete',
      updateError: 'Failed to update'
    }
  };

  const t = content[language];

  // Handler functions for edit/delete
  const handleEdit = (interaction: any) => {
    setEditingInteraction({...interaction});
    setIsEditDialogOpen(true);
  };

  const handleArchive = async (interactionId: string) => {
    if (!window.confirm(t.confirmArchive)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await api.interactionsApi.archive(interactionId);
      if (response.data) {
        // Remove from local state
        setPastInteractions(prev => prev.filter(int => int.interaction_id !== interactionId));
        setFutureInteractions(prev => prev.filter(int => int.interaction_id !== interactionId));
        alert(language === 'zh' ? '归档成功' : 'Archived successfully');
      } else {
        const errorMsg = response.error || 'Unknown error';
        const detailMsg = (response as any).detail || '';
        alert((language === 'zh' ? '归档失败' : 'Failed to archive') + ': ' + errorMsg + (detailMsg ? '\n' + detailMsg : ''));
        console.error('Archive error response:', response);
      }
    } catch (err) {
      console.error('Error archiving interaction:', err);
      alert(language === 'zh' ? '归档失败' : 'Failed to archive');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = (interactionId: string) => {
    navigate(`/interactions/${interactionId}`);
  };

  const handleSaveEdit = async () => {
    if (!editingInteraction) return;

    setIsSaving(true);
    try {
      const response = await api.interactionsApi.update(editingInteraction.interaction_id, {
        subject: editingInteraction.subject,
        description: editingInteraction.description,
        interaction_date: editingInteraction.interaction_date,
        interaction_type: editingInteraction.interaction_type,
        location: editingInteraction.location
      });

      if (response.data) {
        // Update local state - check if it's in past or future
        const updatedInteraction = response.data;
        const interactionDate = new Date(updatedInteraction.interaction_date);
        const now = new Date();

        if (interactionDate < now) {
          setPastInteractions(prev => prev.map(int =>
            int.interaction_id === editingInteraction.interaction_id ? updatedInteraction : int
          ));
        } else {
          setFutureInteractions(prev => prev.map(int =>
            int.interaction_id === editingInteraction.interaction_id ? updatedInteraction : int
          ));
        }

        setIsEditDialogOpen(false);
        setEditingInteraction(null);
        alert(t.updateSuccess);
      } else {
        const errorMsg = response.error || 'Unknown error';
        const detailMsg = (response as any).detail || '';
        alert(t.updateError + ': ' + errorMsg + (detailMsg ? '\n' + detailMsg : ''));
        console.error('Update error response:', response);
      }
    } catch (err) {
      console.error('Error updating interaction:', err);
      alert(t.updateError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingInteraction(null);
  };

  // Map API interaction types to display text
  const getInteractionTypeText = (type: string) => {
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

  // Map interaction to activity format
  const mapToActivity = (int: any) => ({
    id: int.interaction_id,
    date: new Date(int.interaction_date).toISOString().split('T')[0],
    title: int.subject,
    titleEn: int.subject,
    type: getInteractionTypeText(int.interaction_type),
    typeEn: getInteractionTypeText(int.interaction_type),
    description: int.description || '',
    descriptionEn: int.description || '',
    details: `${language === 'zh' ? '公司' : 'Company'}: ${int.company_name || 'N/A'}`,
    detailsEn: `Company: ${int.company_name || 'N/A'}`,
    method: int.location ? `${language === 'zh' ? '地点' : 'Location'}: ${int.location}` : '',
    methodEn: int.location ? `Location: ${int.location}` : ''
  });

  // Use API data for past activities
  const allPastActivities = [
    ...pastInteractions.map(mapToActivity)
  ];

  // Map future interactions
  const allFutureActivities = futureInteractions.map(mapToActivity);

  const filteredPastActivities = searchQuery
    ? allPastActivities.filter(activity =>
        (language === 'zh' ? activity.title : activity.titleEn).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (language === 'zh' ? activity.type : activity.typeEn).toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.date.includes(searchQuery)
      )
    : allPastActivities;

  const filteredFutureActivities = searchQuery
    ? allFutureActivities.filter(activity =>
        (language === 'zh' ? activity.title : activity.titleEn).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (language === 'zh' ? activity.type : activity.typeEn).toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.date.includes(searchQuery)
      )
    : allFutureActivities;

  const getActivityColor = (type: string) => {
    switch (type) {
      case '客户拜访':
      case 'Client Visit':
        return 'bg-blue-50 border-blue-200';
      case '营销活动':
      case 'Marketing Event':
        return 'bg-green-50 border-green-200';
      case '技术交流':
      case 'Technical Exchange':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '客户拜访':
      case 'Client Visit':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case '营销活动':
      case 'Marketing Event':
        return 'bg-green-100 text-green-800 border border-green-200';
      case '技术交流':
      case 'Technical Exchange':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="pt-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#009699]" />
        <span className="ml-3 text-gray-600">
          {language === 'zh' ? '加载互动记录中...' : 'Loading interactions...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-6 flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">
            {language === 'zh' ? '加载失败' : 'Failed to load'}
          </p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 space-y-6">

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Past Activities */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-5 w-5" />
            <h2 className="text-lg font-medium">{t.pastActivities} ({filteredPastActivities.length})</h2>
          </div>

          {filteredPastActivities.length === 0 ? (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">
                  {language === 'zh' ? '暂无历史互动记录' : 'No past interactions found'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPastActivities.map((activity) => (
              <Card key={activity.id} className={`${getActivityColor(language === 'zh' ? activity.type : activity.typeEn)} border-l-4`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Date and Title */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{activity.date}</span>
                          <span className="text-gray-400">|</span>
                          <span className="font-medium text-gray-900">
                            {language === 'zh' ? activity.title : activity.titleEn}
                          </span>
                          <span className="text-gray-400">|</span>
                          <Badge className={getTypeColor(language === 'zh' ? activity.type : activity.typeEn)}>
                            {language === 'zh' ? activity.type : activity.typeEn}
                          </Badge>
                        </div>
                        
                        {/* Description */}
                        <p className="text-sm text-gray-700 mb-2">
                          {language === 'zh' ? activity.description : activity.descriptionEn}
                        </p>
                        
                        {/* Details */}
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{language === 'zh' ? activity.details : activity.detailsEn}</p>
                          <p>{language === 'zh' ? activity.method : activity.methodEn}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-start gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                        onClick={() => handleViewDetails(activity.id.toString())}
                      >
                        {t.viewDetails}
                      </Button>
                      {/* Only show edit/archive for API interactions (not mock data) */}
                      {typeof activity.id === 'string' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            onClick={() => handleEdit(pastInteractions.find(int => int.interaction_id === activity.id))}
                            disabled={isDeleting}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            {t.edit}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            onClick={() => handleArchive(activity.id)}
                            disabled={isDeleting}
                          >
                            <Archive className="h-3 w-3 mr-1" />
                            {isDeleting ? t.archiving : t.archive}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>

        {/* Future Activities */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-5 w-5" />
            <h2 className="text-lg font-medium">{t.futureActivities} ({filteredFutureActivities.length})</h2>
          </div>

          {filteredFutureActivities.length === 0 ? (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">{t.noFutureActivities}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredFutureActivities.map((activity) => (
              <Card key={activity.id} className={`${getActivityColor(language === 'zh' ? activity.type : activity.typeEn)} border-l-4`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Date and Title */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{activity.date}</span>
                          <span className="text-gray-400">|</span>
                          <span className="font-medium text-gray-900">
                            {language === 'zh' ? activity.title : activity.titleEn}
                          </span>
                          <span className="text-gray-400">|</span>
                          <Badge className={getTypeColor(language === 'zh' ? activity.type : activity.typeEn)}>
                            {language === 'zh' ? activity.type : activity.typeEn}
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-700 mb-2">
                          {language === 'zh' ? activity.description : activity.descriptionEn}
                        </p>

                        {/* Details */}
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{language === 'zh' ? activity.details : activity.detailsEn}</p>
                          <p>{language === 'zh' ? activity.method : activity.methodEn}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-start gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                        onClick={() => handleViewDetails(activity.id.toString())}
                      >
                        {t.viewDetails}
                      </Button>
                      {/* Only show edit/archive for API interactions */}
                      {typeof activity.id === 'string' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            onClick={() => handleEdit(futureInteractions.find(int => int.interaction_id === activity.id))}
                            disabled={isDeleting}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            {t.edit}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            onClick={() => handleArchive(activity.id)}
                            disabled={isDeleting}
                          >
                            <Archive className="h-3 w-3 mr-1" />
                            {isDeleting ? t.archiving : t.archive}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.editInteraction}</DialogTitle>
          </DialogHeader>
          {editingInteraction && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-subject">{t.subject}</Label>
                <Input
                  id="edit-subject"
                  value={editingInteraction.subject || ''}
                  onChange={(e) => setEditingInteraction({
                    ...editingInteraction,
                    subject: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">{t.description}</Label>
                <Textarea
                  id="edit-description"
                  value={editingInteraction.description || ''}
                  onChange={(e) => setEditingInteraction({
                    ...editingInteraction,
                    description: e.target.value
                  })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">{t.date}</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingInteraction.interaction_date?.split('T')[0] || ''}
                    onChange={(e) => setEditingInteraction({
                      ...editingInteraction,
                      interaction_date: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">{t.type}</Label>
                  <Input
                    id="edit-type"
                    value={editingInteraction.interaction_type || ''}
                    onChange={(e) => setEditingInteraction({
                      ...editingInteraction,
                      interaction_type: e.target.value
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">{t.location}</Label>
                <Input
                  id="edit-location"
                  value={editingInteraction.location || ''}
                  onChange={(e) => setEditingInteraction({
                    ...editingInteraction,
                    location: e.target.value
                  })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              {t.cancel}
            </Button>
            <Button
              variant="default"
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t.save}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}