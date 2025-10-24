import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { Language, PageType } from '../../App';
import { tasksApi } from '../../services/api';

interface CreateTaskProps {
  language: Language;
  onNavigateBack: (page: PageType) => void;
}

export function CreateTask({ language, onNavigateBack }: CreateTaskProps) {
  const [formData, setFormData] = useState({
    subject: '',
    priority: '',
    status: 'NEW',
    contactName: '',
    dueDate: undefined as Date | undefined,
    description: '',
    assignedTo: '',
    category: '',
    estimatedHours: '',
    tags: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const content = {
    zh: {
      title: '新建任务',
      subject: '任务主题',
      subjectPlaceholder: '请输入任务主题',
      priority: '优先级',
      status: '状态',
      contactName: '关联联系人',
      contactPlaceholder: '选择或输入联系人姓名',
      dueDate: '截止日期',
      dueDatePlaceholder: '选择截止日期',
      description: '任务描述',
      descriptionPlaceholder: '请详细描述任务内容和要求',
      assignedTo: '分配给',
      assignedToPlaceholder: '选择负责人',
      category: '任务分类',
      categoryPlaceholder: '选择任务分类',
      estimatedHours: '预计工时',
      estimatedHoursPlaceholder: '预计完成小时数',
      tags: '标签',
      tagsPlaceholder: '输入标签，用逗号分隔',
      cancel: '取消',
      save: '保存',
      saving: '保存中...',
      success: '任务创建成功！',
      errorTitle: '错误',
      requiredFields: '请填写所有必填字段',

      priorities: {
        HIGH: '高',
        MEDIUM: '中',
        LOW: '低'
      },
      statuses: {
        NEW: '新建',
        IN_PROGRESS: '进行中',
        COMPLETED: '已完成',
        CANCELLED: '已取消'
      },
      categories: {
        sales: '销售',
        marketing: '市场',
        support: '支持',
        development: '开发',
        admin: '行政',
        other: '其他'
      }
    },
    en: {
      title: 'Create New Task',
      subject: 'Task Subject',
      subjectPlaceholder: 'Enter task subject',
      priority: 'Priority',
      status: 'Status',
      contactName: 'Related Contact',
      contactPlaceholder: 'Select or enter contact name',
      dueDate: 'Due Date',
      dueDatePlaceholder: 'Select due date',
      description: 'Task Description',
      descriptionPlaceholder: 'Describe the task details and requirements',
      assignedTo: 'Assigned To',
      assignedToPlaceholder: 'Select assignee',
      category: 'Category',
      categoryPlaceholder: 'Select category',
      estimatedHours: 'Estimated Hours',
      estimatedHoursPlaceholder: 'Estimated hours to complete',
      tags: 'Tags',
      tagsPlaceholder: 'Enter tags, separated by commas',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      success: 'Task created successfully!',
      errorTitle: 'Error',
      requiredFields: 'Please fill in all required fields',

      priorities: {
        HIGH: 'High',
        MEDIUM: 'Medium',
        LOW: 'Low'
      },
      statuses: {
        NEW: 'New',
        IN_PROGRESS: 'In Progress',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled'
      },
      categories: {
        sales: 'Sales',
        marketing: 'Marketing',
        support: 'Support',
        development: 'Development',
        admin: 'Admin',
        other: 'Other'
      }
    }
  };

  const t = content[language];

  const handleSave = async () => {
    // Validate required fields
    if (!formData.subject || !formData.priority || !formData.dueDate) {
      setError(t.requiredFields);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format the data for the API
      const taskData = {
        subject: formData.subject,
        description: formData.description || undefined,
        due_date: formData.dueDate ? format(formData.dueDate, 'yyyy-MM-dd') : undefined,
        priority: formData.priority,
        status: formData.status,
        // Note: contact_id and assigned_to would need proper IDs from the database
        // For now, we're not setting them since we don't have contact/user selection
      };

      const response = await tasksApi.create(taskData);

      if (response.error) {
        setError(response.error);
        return;
      }

      // Show success (optional - could add a toast notification)
      console.log('Task created successfully:', response.data);

      // Navigate back to task manager
      onNavigateBack('task-manager');
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onNavigateBack('task-manager');
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>{t.errorTitle}:</strong> {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-end">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            {t.cancel}
          </Button>
          <Button variant="teal" onClick={handleSave} disabled={loading}>
            {loading ? (
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
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: Subject and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">{t.subject} *</Label>
              <Input
                id="subject"
                placeholder={t.subjectPlaceholder}
                value={formData.subject}
                onChange={(e) => updateFormData('subject', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">{t.priority} *</Label>
              <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t.priority} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">{t.priorities.HIGH}</SelectItem>
                  <SelectItem value="MEDIUM">{t.priorities.MEDIUM}</SelectItem>
                  <SelectItem value="LOW">{t.priorities.LOW}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Status and Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">{t.status}</Label>
              <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">{t.statuses.NEW}</SelectItem>
                  <SelectItem value="IN_PROGRESS">{t.statuses.IN_PROGRESS}</SelectItem>
                  <SelectItem value="COMPLETED">{t.statuses.COMPLETED}</SelectItem>
                  <SelectItem value="CANCELLED">{t.statuses.CANCELLED}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">{t.contactName}</Label>
              <Input
                id="contactName"
                placeholder={t.contactPlaceholder}
                value={formData.contactName}
                onChange={(e) => updateFormData('contactName', e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: Due Date and Assigned To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.dueDate} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      format(formData.dueDate, "PPP", {
                        locale: language === 'zh' ? zhCN : enUS,
                      })
                    ) : (
                      <span>{t.dueDatePlaceholder}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => updateFormData('dueDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">{t.assignedTo}</Label>
              <Input
                id="assignedTo"
                placeholder={t.assignedToPlaceholder}
                value={formData.assignedTo}
                onChange={(e) => updateFormData('assignedTo', e.target.value)}
              />
            </div>
          </div>

          {/* Row 4: Category and Estimated Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{t.category}</Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t.categoryPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sales">{t.categories.sales}</SelectItem>
                  <SelectItem value="Marketing">{t.categories.marketing}</SelectItem>
                  <SelectItem value="Support">{t.categories.support}</SelectItem>
                  <SelectItem value="Development">{t.categories.development}</SelectItem>
                  <SelectItem value="Admin">{t.categories.admin}</SelectItem>
                  <SelectItem value="Other">{t.categories.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">{t.estimatedHours}</Label>
              <Input
                id="estimatedHours"
                type="number"
                placeholder={t.estimatedHoursPlaceholder}
                value={formData.estimatedHours}
                onChange={(e) => updateFormData('estimatedHours', e.target.value)}
              />
            </div>
          </div>

          {/* Row 5: Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">{t.tags}</Label>
            <Input
              id="tags"
              placeholder={t.tagsPlaceholder}
              value={formData.tags}
              onChange={(e) => updateFormData('tags', e.target.value)}
            />
          </div>

          {/* Row 6: Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              placeholder={t.descriptionPlaceholder}
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}