import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Trash2, ArrowUpDown, X, Loader2 } from 'lucide-react';
import { Language, PageType } from '../../App';
import { tasksApi } from '../../services/api';

interface TaskManagerProps {
  searchQuery: string;
  language: Language;
  onNavigate?: (page: PageType) => void;
  onViewTask?: (taskId: number) => void;
}

interface Task {
  id: number;
  subject: {
    zh: string;
    en: string;
  } | string;
  description?: string;
  priority: string;
  status: string;
  contactName: string;
  companyName: string;
  dueDate: {
    zh: string;
    en: string;
  } | string;
  completed: boolean;
  archived?: boolean;
}

type SortField = 'subject' | 'priority' | 'status' | 'dueDate' | 'contactName' | 'companyName';
type SortOrder = 'asc' | 'desc';

export function TaskManager({ searchQuery, language, onNavigate, onViewTask }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Fetch active tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksApi.getAll();

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        // Transform API response to match our Task interface
        const transformedTasks = response.data.tasks.map((task: any) => ({
          id: task.task_id,
          subject: task.subject,
          description: task.description || '',
          priority: task.priority || 'MEDIUM',
          status: task.status || 'NEW',
          contactName: task.contact_name || '',
          companyName: task.company_name || '',
          dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : '',
          completed: task.status === 'COMPLETED',
          archived: false
        }));
        setTasks(transformedTasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };


  const content = {
    zh: {
      yourTasks: '您的任务',
      tasksCount: '个任务',
      subject: '主题',
      priority: '优先级',
      status: '状态',
      contactName: '联系人',
      companyName: '公司',
      dueDate: '截止日期',
      actions: '操作',
      showResults: '显示',
      resultsOf: '条结果，共',
      newTask: '新建任务',
      deleteTask: '删除任务',
      archiveTask: '归档',
      loading: '加载中...',
      error: '错误',

      priorities: {
        'HIGH': '高',
        'MEDIUM': '中',
        'LOW': '低'
      },
      statuses: {
        'NEW': '新建',
        'IN_PROGRESS': '进行中',
        'COMPLETED': '已完成',
        'CANCELLED': '已取消'
      }
    },
    en: {
      yourTasks: 'Your Tasks',
      tasksCount: 'tasks',
      subject: 'Subject',
      priority: 'Priority',
      status: 'Status',
      contactName: 'Contact',
      companyName: 'Company',
      dueDate: 'Due date',
      actions: 'Actions',
      showResults: 'Shows',
      resultsOf: 'results of',
      newTask: 'New Task',
      deleteTask: 'Delete Task',
      archiveTask: 'Archive',
      loading: 'Loading...',
      error: 'Error',

      priorities: {
        'HIGH': 'High',
        'MEDIUM': 'Medium',
        'LOW': 'Low'
      },
      statuses: {
        'NEW': 'New',
        'IN_PROGRESS': 'In Progress',
        'COMPLETED': 'Completed',
        'CANCELLED': 'Cancelled'
      }
    }
  };

  const t = content[language];

  const filteredAndSortedTasks = (() => {
    // First filter by search query
    let filtered = searchQuery
      ? tasks.filter(task => {
          const subject = typeof task.subject === 'object' ? task.subject[language] : task.subject;
          const dueDate = typeof task.dueDate === 'object' ? task.dueDate[language] : task.dueDate;
          return subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 task.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 task.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 task.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 task.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 dueDate.toLowerCase().includes(searchQuery.toLowerCase());
        })
      : [...tasks];

    // Then sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'subject':
          aValue = typeof a.subject === 'object' ? a.subject[language] : a.subject;
          bValue = typeof b.subject === 'object' ? b.subject[language] : b.subject;
          break;
        case 'priority':
          // Custom priority order: HIGH > MEDIUM > LOW
          const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          // Custom status order: NEW > IN_PROGRESS > COMPLETED > CANCELLED
          const statusOrder = { 'NEW': 4, 'IN_PROGRESS': 3, 'COMPLETED': 2, 'CANCELLED': 1 };
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
          break;
        case 'contactName':
          aValue = a.contactName;
          bValue = b.contactName;
          break;
        case 'companyName':
          aValue = a.companyName;
          bValue = b.companyName;
          break;
        case 'dueDate':
          // Convert dates to comparable format
          const aDate = typeof a.dueDate === 'object' ? a.dueDate[language] : a.dueDate;
          const bDate = typeof b.dueDate === 'object' ? b.dueDate[language] : b.dueDate;
          aValue = new Date(aDate.replace(/年|月|日/g, '').replace(/,/g, '')).getTime() || 0;
          bValue = new Date(bDate.replace(/年|月|日/g, '').replace(/,/g, '')).getTime() || 0;
          break;
        default:
          aValue = '';
          bValue = '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = (aValue as number) - (bValue as number);
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });

    return filtered;
  })();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleRowDoubleClick = (taskId: number) => {
    if (onViewTask) {
      onViewTask(taskId);
    }
  };

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

  return (
    <div className="pt-6 space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Main Card - Active Tasks */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-gray-900 flex items-center">
              {t.yourTasks}
              <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md">
                {filteredAndSortedTasks.length} {t.tasksCount}
              </span>
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">{t.loading}</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.subject}</TableHead>
                  <TableHead>{t.priority}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.dueDate}</TableHead>
                  <TableHead>{t.contactName}</TableHead>
                  <TableHead>{t.companyName}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="cursor-pointer hover:bg-gray-50 h-16"
                    onDoubleClick={() => handleRowDoubleClick(task.id)}
                  >
                    <TableCell>
                      <div className="max-w-[300px]">
                        <div className="font-medium truncate">
                          {typeof task.subject === 'object' ? task.subject[language] : task.subject}
                        </div>
                        {task.description && (
                          <div className="text-xs text-muted-foreground truncate mt-1">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(task.priority)}>
                        {t.priorities[task.priority as keyof typeof t.priorities] || task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(task.status)}>
                        {t.statuses[task.status as keyof typeof t.statuses] || task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {typeof task.dueDate === 'object' ? task.dueDate[language] : task.dueDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate">
                        {task.contactName || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {task.companyName || '-'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  );
}