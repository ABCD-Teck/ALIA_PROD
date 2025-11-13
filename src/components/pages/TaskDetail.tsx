import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Save, Loader2, Archive } from 'lucide-react';
import { Language } from '../../App';
import { tasksApi, customersApi, contactsApi } from '../../services/api';

interface TaskDetailProps {
  language: Language;
}

interface TaskFormData {
  subject: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
  customer_id: string;
  contact_id: string;
  assigned_to: string;
}

interface Customer {
  customer_id: string;
  company_name: string;
}

interface Contact {
  contact_id: string;
  first_name: string;
  last_name: string;
}

export function TaskDetail({ language }: TaskDetailProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const taskId = id;

  const [formData, setFormData] = useState<TaskFormData>({
    subject: '',
    description: '',
    due_date: '',
    priority: 'MEDIUM',
    status: 'NEW',
    customer_id: '',
    contact_id: '',
    assigned_to: ''
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Safety check
  if (!taskId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600">Error: Task ID is missing</div>
      </div>
    );
  }

  const content = {
    zh: {
      title: '任务详情',
      backToTasks: '返回任务管理',
      subject: '主题',
      description: '描述',
      dueDate: '截止日期',
      priority: '优先级',
      status: '状态',
      customer: '客户',
      contact: '联系人',
      assignedTo: '负责人',
      save: '保存',
      archive: '归档',
      cancel: '取消',
      loading: '加载中...',
      saving: '保存中...',
      archiving: '归档中...',
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
      selectCustomer: '选择客户',
      selectContact: '选择联系人',
      confirmArchive: '确定要归档此任务吗？您可以稍后从归档中恢复它。',
      archiveSuccess: '任务已归档成功！',
      saveSuccess: '任务已保存成功！',
      errorMessage: '保存任务失败，请重试',
      archiveError: '归档任务失败，请重试',
      requiredFields: '请填写必填字段',
      subjectPlaceholder: '输入任务主题',
      descriptionPlaceholder: '输入任务描述'
    },
    en: {
      title: 'Task Details',
      backToTasks: 'Back to Tasks',
      subject: 'Subject',
      description: 'Description',
      dueDate: 'Due Date',
      priority: 'Priority',
      status: 'Status',
      customer: 'Customer',
      contact: 'Contact',
      assignedTo: 'Assigned To',
      save: 'Save',
      archive: 'Archive',
      cancel: 'Cancel',
      loading: 'Loading...',
      saving: 'Saving...',
      archiving: 'Archiving...',
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
      selectCustomer: 'Select Customer',
      selectContact: 'Select Contact',
      confirmArchive: 'Are you sure you want to archive this task? You can restore it from the archive later.',
      archiveSuccess: 'Task archived successfully!',
      saveSuccess: 'Task saved successfully!',
      errorMessage: 'Failed to save task, please try again',
      archiveError: 'Failed to archive task, please try again',
      requiredFields: 'Please fill in required fields',
      subjectPlaceholder: 'Enter task subject',
      descriptionPlaceholder: 'Enter task description'
    }
  };

  const t = content[language];

  // Fetch task details and customers on mount
  useEffect(() => {
    fetchTaskDetails();
    fetchCustomers();
    fetchContacts();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await tasksApi.getById(taskId.toString());

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        const task = response.data;
        // Build assignee display name from user details if available
        let assignedToDisplay = task.assigned_to || '';
        if (task.assigned_user_first_name || task.assigned_user_last_name) {
          assignedToDisplay = `${task.assigned_user_first_name || ''} ${task.assigned_user_last_name || ''}`.trim();
        }

        setFormData({
          subject: task.subject || '',
          description: task.description || '',
          due_date: task.due_date ? task.due_date.split('T')[0] : '',
          priority: task.priority || 'MEDIUM',
          status: task.status || 'NEW',
          customer_id: task.customer_id?.toString() || '',
          contact_id: task.contact_id?.toString() || '',
          assigned_to: assignedToDisplay
        });
      }
    } catch (err) {
      console.error('Error fetching task:', err);
      setError('Failed to load task details: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customersApi.getAll({ limit: 1000 });
      if (response.data && response.data.customers) {
        setCustomers(response.data.customers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await contactsApi.getAll({ limit: 1000 });
      if (response.data && response.data.contacts) {
        setContacts(response.data.contacts);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.subject || formData.subject.trim().length === 0) {
      setError(t.requiredFields);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updateData = {
        subject: formData.subject.trim(),
        description: formData.description?.trim() || undefined,
        due_date: formData.due_date || undefined,
        priority: formData.priority,
        status: formData.status,
        customer_id: formData.customer_id || undefined,
        contact_id: formData.contact_id || undefined,
        assigned_to: formData.assigned_to?.trim() || undefined
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      const response = await tasksApi.update(taskId.toString(), updateData);

      if (response.data) {
        setSuccessMessage(t.saveSuccess);
        // Wait a moment to show success message, then navigate back
        setTimeout(() => {
          navigate('/tasks');
        }, 1500);
      } else {
        let errorMsg = t.errorMessage;
        if (response.error) {
          if (typeof response.error === 'string') {
            errorMsg = response.error;
          }
        }
        setError(errorMsg);
        console.error('Update task error response:', response);
      }
    } catch (err: any) {
      console.error('Error updating task:', err);
      let errorMsg = t.errorMessage;
      if (err.message) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMsg = language === 'zh' ? '网络连接错误，请检查网络后重试' : 'Network error, please check your connection and retry';
        } else if (err.message.includes('404')) {
          errorMsg = language === 'zh' ? '任务不存在或已被删除' : 'Task not found or has been deleted';
        } else if (err.message.includes('500')) {
          errorMsg = language === 'zh' ? '服务器内部错误，请稍后重试' : 'Server error, please try again later';
        }
      }
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm(t.confirmArchive)) {
      return;
    }

    setIsArchiving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await tasksApi.archive(taskId.toString());

      if (response.data || response.success) {
        setSuccessMessage(t.archiveSuccess);
        // Wait a moment to show success message, then navigate back
        setTimeout(() => {
          navigate('/tasks');
        }, 1500);
      } else {
        const errorMsg = response.error || t.archiveError;
        setError(errorMsg);
        console.error('Archive task error response:', response);
      }
    } catch (err) {
      console.error('Error archiving task:', err);
      setError(t.archiveError);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleCancel = () => {
    navigate('/tasks');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2">{t.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleCancel} disabled={isSaving || isArchiving}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.backToTasks}
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleArchive}
            disabled={isSaving || isArchiving}
          >
            {isArchiving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t.archiving}
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                {t.archive}
              </>
            )}
          </Button>
          <Button variant="teal" onClick={handleSave} disabled={isSaving || isArchiving}>
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
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder={t.subjectPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">{t.priority}</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">{t.priorities.HIGH}</SelectItem>
                  <SelectItem value="MEDIUM">{t.priorities.MEDIUM}</SelectItem>
                  <SelectItem value="LOW">{t.priorities.LOW}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t.descriptionPlaceholder}
              rows={3}
            />
          </div>

          {/* Row 3: Status and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">{t.status}</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
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
              <Label htmlFor="due_date">{t.dueDate}</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
              />
            </div>
          </div>

          {/* Row 4: Customer and Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">{t.customer}</Label>
              <Select value={formData.customer_id} onValueChange={(value) => handleInputChange('customer_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectCustomer} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.customer_id} value={customer.customer_id}>
                      {customer.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">{t.contact}</Label>
              <Select value={formData.contact_id} onValueChange={(value) => handleInputChange('contact_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectContact} />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.contact_id} value={contact.contact_id}>
                      {contact.first_name} {contact.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 5: Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">{t.assignedTo}</Label>
            <Input
              id="assignedTo"
              value={formData.assigned_to}
              onChange={(e) => handleInputChange('assigned_to', e.target.value)}
              placeholder={t.assignedTo}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
