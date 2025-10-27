import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ArrowLeft, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { Language } from '../../App';
import * as api from '../../services/api';

interface ArchivedTasksProps {
  searchQuery: string;
  language: Language;
}

interface Task {
  task_id: string;
  subject: string;
  description?: string;
  priority: string;
  status: string;
  due_date?: string;
  contact_name?: string;
  company_name?: string;
  updated_at: string;
}

export function ArchivedTasks({
  searchQuery,
  language
}: ArchivedTasksProps) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch archived tasks from API
  const fetchArchivedTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.tasksApi.getArchived({
        limit: 1000
      });

      if (response.data && response.data.tasks) {
        setTasks(response.data.tasks);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      console.error('Error fetching archived tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch archived tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedTasks();
  }, []);

  // Refetch when search query changes
  useEffect(() => {
    if (!loading) {
      fetchArchivedTasks();
    }
  }, [searchQuery]);

  const content = {
    zh: {
      title: '归档任务',
      backToTasks: '返回任务管理',
      subject: '主题',
      priority: '优先级',
      status: '状态',
      dueDate: '截止日期',
      contact: '联系人',
      company: '公司',
      actions: '操作',
      restore: '恢复',
      delete: '删除',
      noResults: '未找到归档任务',
      confirmDelete: '确定要永久删除此任务吗？此操作无法撤销。',
      confirmRestore: '确定要恢复此任务吗？',
      deleteSuccess: '任务已永久删除',
      restoreSuccess: '任务已恢复',
      deleteError: '删除失败',
      restoreError: '恢复失败',
      loading: '加载中...',
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
      }
    },
    en: {
      title: 'Archived Tasks',
      backToTasks: 'Back to Tasks',
      subject: 'Subject',
      priority: 'Priority',
      status: 'Status',
      dueDate: 'Due Date',
      contact: 'Contact',
      company: 'Company',
      actions: 'Actions',
      restore: 'Restore',
      delete: 'Delete',
      noResults: 'No archived tasks found',
      confirmDelete: 'Are you sure you want to permanently delete this task? This action cannot be undone.',
      confirmRestore: 'Are you sure you want to restore this task?',
      deleteSuccess: 'Task permanently deleted',
      restoreSuccess: 'Task restored',
      deleteError: 'Failed to delete task',
      restoreError: 'Failed to restore task',
      loading: 'Loading...',
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
      }
    }
  };

  const t = content[language];

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'NEW':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityText = (priority: string) => {
    const key = priority?.toUpperCase() as keyof typeof t.priorities;
    return t.priorities[key] || priority;
  };

  const getStatusText = (status: string) => {
    const key = status?.toUpperCase().replace(/ /g, '_') as keyof typeof t.statuses;
    return t.statuses[key] || status;
  };

  const handleRestore = async (taskId: string) => {
    if (!confirm(t.confirmRestore)) {
      return;
    }

    try {
      const response = await api.tasksApi.restore(taskId);
      if (response.data || !response.error) {
        alert(t.restoreSuccess);
        // Refresh the list
        await fetchArchivedTasks();
      } else {
        alert(t.restoreError + ': ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error restoring task:', err);
      alert(t.restoreError);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm(t.confirmDelete)) {
      return;
    }

    try {
      const response = await api.tasksApi.delete(taskId);
      if (response.data || !response.error) {
        alert(t.deleteSuccess);
        // Refresh the list
        await fetchArchivedTasks();
      } else {
        alert(t.deleteError + ': ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      alert(t.deleteError);
    }
  };

  const filteredTasks = searchQuery
    ? tasks.filter(task =>
        task.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/tasks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToTasks}
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
      ) : filteredTasks.length === 0 ? (
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
                    <TableHead>{t.priority}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.dueDate}</TableHead>
                    <TableHead>{t.contact}</TableHead>
                    <TableHead>{t.company}</TableHead>
                    <TableHead>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.task_id}>
                      <TableCell>
                        <div className="max-w-[250px]">
                          <div className="font-medium truncate">{task.subject}</div>
                          {task.description && (
                            <div className="text-xs text-muted-foreground truncate mt-1">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {getPriorityText(task.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(task.due_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[120px] truncate">
                          {task.contact_name || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate">
                          {task.company_name || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(task.task_id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            {t.restore}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(task.task_id)}
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
