import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trash2, ArrowUpDown, X } from 'lucide-react';
import { Language } from '../../App';

interface TaskManagerProps {
  searchQuery: string;
  language: Language;
}

interface Task {
  id: number;
  subject: {
    zh: string;
    en: string;
  } | string;
  priority: string;
  status: string;
  contactName: string;
  dueDate: {
    zh: string;
    en: string;
  } | string;
  completed: boolean;
}

const initialTasks: Task[] = [
  {
    id: 1,
    subject: {
      zh: '跟进贸易展览会的潜在客户',
      en: 'Follow up on leads from trade show'
    },
    priority: 'High',
    status: 'Incomplete',
    contactName: 'Natukunda Cathy',
    dueDate: {
      zh: '2025年4月24日',
      en: 'Apr 24, 2025'
    },
    completed: false
  },
  {
    id: 2,
    subject: {
      zh: '完成客户A的交易',
      en: 'Close deals from client A'
    },
    priority: 'Medium',
    status: 'Complete',
    contactName: 'Luswata Andrew',
    dueDate: {
      zh: '2025年1月24日',
      en: 'Jan 24, 2025'
    },
    completed: true
  },
  {
    id: 3,
    subject: {
      zh: '注册参加即将举行的网络研讨会',
      en: 'Register for upcoming webinar'
    },
    priority: 'Low',
    status: 'Complete',
    contactName: 'Alur John',
    dueDate: {
      zh: '2025年3月24日',
      en: 'Mar 24, 2025'
    },
    completed: true
  },
  {
    id: 4,
    subject: {
      zh: '获取客户B的交易',
      en: 'Get deals from client B'
    },
    priority: 'High',
    status: 'Complete',
    contactName: 'Ema Wambi',
    dueDate: {
      zh: '2025年4月26日',
      en: 'Apr 26, 2025'
    },
    completed: false
  },
  {
    id: 5,
    subject: {
      zh: '准备客户演示材料',
      en: 'Prepare client presentation materials'
    },
    priority: 'Medium',
    status: 'Incomplete',
    contactName: '张三',
    dueDate: {
      zh: '2025年5月15日',
      en: 'May 15, 2025'
    },
    completed: false
  },
  {
    id: 6,
    subject: {
      zh: '安排产品培训会议',
      en: 'Schedule product training meeting'
    },
    priority: 'High',
    status: 'Complete',
    contactName: '李四',
    dueDate: {
      zh: '2025年3月12日',
      en: 'Mar 12, 2025'
    },
    completed: true
  }
];

type SortField = 'subject' | 'priority' | 'status' | 'contactName' | 'dueDate';
type SortOrder = 'asc' | 'desc';

export function TaskManager({ searchQuery, language }: TaskManagerProps) {
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]); // 默认不选中任何任务
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const content = {
    zh: {
      yourTasks: '您的任务',
      tasksCount: '个任务',
      subject: '主题',
      priority: '优先级',
      status: '状态',
      contactName: '联系人',
      dueDate: '截止日期',
      showResults: '显示',
      resultsOf: '条结果，共',
      newTask: '新建任务',
      deleteTask: '删除任务',

      priorities: {
        'High': '高',
        'Medium': '中',
        'Low': '低'
      },
      statuses: {
        'Complete': '完成',
        'Incomplete': '未完成'
      }
    },
    en: {
      yourTasks: 'Your Tasks',
      tasksCount: 'tasks',
      subject: 'Subject',
      priority: 'Priority',
      status: 'Status',
      contactName: 'Contact',
      dueDate: 'Due date',
      showResults: 'Shows',
      resultsOf: 'results of',
      newTask: 'New Task',
      deleteTask: 'Delete Task',

      priorities: {
        'High': 'High',
        'Medium': 'Medium',
        'Low': 'Low'
      },
      statuses: {
        'Complete': 'Complete',
        'Incomplete': 'Incomplete'
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
          // Custom priority order: High > Medium > Low
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          // Custom status order: Incomplete > Complete
          const statusOrder = { 'Incomplete': 2, 'Complete': 1 };
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
          break;
        case 'contactName':
          aValue = a.contactName;
          bValue = b.contactName;
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

  const toggleTaskSelection = (taskId: number) => {
    setSelectedTasks(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleAllTasks = () => {
    if (selectedTasks.length === filteredAndSortedTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredAndSortedTasks.map(task => task.id));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleCellClick = (id: number, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
  };

  const handleCellSave = () => {
    if (!editingCell) return;
    
    setTasks(prev => prev.map(task => {
      if (task.id === editingCell.id) {
        if (editingCell.field === 'subject') {
          return { 
            ...task, 
            subject: typeof task.subject === 'object' 
              ? { ...task.subject, [language]: editValue }
              : editValue
          };
        }
        if (editingCell.field === 'dueDate') {
          return { 
            ...task, 
            dueDate: typeof task.dueDate === 'object' 
              ? { ...task.dueDate, [language]: editValue }
              : editValue
          };
        }
        return { ...task, [editingCell.field]: editValue };
      }
      return task;
    }));
    
    setEditingCell(null);
    setEditValue('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handlePriorityChange = (id: number, priority: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, priority } : task
    ));
  };

  const handleStatusChange = (id: number, status: string) => {
    const completed = status === 'Complete';
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, status, completed } : task
    ));
  };

  const handleDeleteSelected = () => {
    setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
    setSelectedTasks([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Incomplete':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="pt-6 space-y-6">
      {/* Main Card */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-gray-900 flex items-center">
              {t.yourTasks}
              <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md">
                {filteredAndSortedTasks.length} {t.tasksCount}
              </span>
            </CardTitle>
            {selectedTasks.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>{t.deleteTask}</span>
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
            <div className="col-span-1 flex items-center">
              <Checkbox
                checked={selectedTasks.length === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0}
                onCheckedChange={toggleAllTasks}
                className="h-4 w-4 checkbox-teal"
              />
            </div>
            <div className="col-span-3">
              <button 
                onClick={() => handleSort('subject')}
                className="flex items-center space-x-1 hover:text-gray-900 transition-colors w-full justify-start"
              >
                <span>{t.subject}</span>
                <ArrowUpDown className={`h-3 w-3 transition-transform ${
                  sortField === 'subject' 
                    ? (sortOrder === 'desc' ? 'rotate-180 text-gray-900' : 'text-gray-900')
                    : 'text-gray-400'
                }`} />
              </button>
            </div>
            <div className="col-span-2">
              <button 
                onClick={() => handleSort('priority')}
                className="flex items-center space-x-1 hover:text-gray-900 transition-colors w-full justify-start"
              >
                <span>{t.priority}</span>
                <ArrowUpDown className={`h-3 w-3 transition-transform ${
                  sortField === 'priority' 
                    ? (sortOrder === 'desc' ? 'rotate-180 text-gray-900' : 'text-gray-900')
                    : 'text-gray-400'
                }`} />
              </button>
            </div>
            <div className="col-span-2">
              <button 
                onClick={() => handleSort('status')}
                className="flex items-center space-x-1 hover:text-gray-900 transition-colors w-full justify-start"
              >
                <span>{t.status}</span>
                <ArrowUpDown className={`h-3 w-3 transition-transform ${
                  sortField === 'status' 
                    ? (sortOrder === 'desc' ? 'rotate-180 text-gray-900' : 'text-gray-900')
                    : 'text-gray-400'
                }`} />
              </button>
            </div>
            <div className="col-span-2">
              <button 
                onClick={() => handleSort('contactName')}
                className="flex items-center space-x-1 hover:text-gray-900 transition-colors w-full justify-start"
              >
                <span>{t.contactName}</span>
                <ArrowUpDown className={`h-3 w-3 transition-transform ${
                  sortField === 'contactName' 
                    ? (sortOrder === 'desc' ? 'rotate-180 text-gray-900' : 'text-gray-900')
                    : 'text-gray-400'
                }`} />
              </button>
            </div>
            <div className="col-span-2">
              <button 
                onClick={() => handleSort('dueDate')}
                className="flex items-center space-x-1 hover:text-gray-900 transition-colors w-full justify-start"
              >
                <span className="whitespace-nowrap">{t.dueDate}</span>
                <ArrowUpDown className={`h-3 w-3 transition-transform ${
                  sortField === 'dueDate' 
                    ? (sortOrder === 'desc' ? 'rotate-180 text-gray-900' : 'text-gray-900')
                    : 'text-gray-400'
                }`} />
              </button>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredAndSortedTasks.map((task) => (
              <div 
                key={task.id} 
                className="grid grid-cols-12 gap-2 px-6 py-4 hover:bg-gray-50 items-center"
              >
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => toggleTaskSelection(task.id)}
                    className="h-4 w-4 checkbox-teal"
                  />
                </div>
                <div className="col-span-3">
                  {editingCell?.id === task.id && editingCell?.field === 'subject' ? (
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
                      className="text-gray-900 text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleCellClick(
                        task.id, 
                        'subject', 
                        typeof task.subject === 'object' ? task.subject[language] : task.subject
                      )}
                    >
                      {typeof task.subject === 'object' ? task.subject[language] : task.subject}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <Select 
                    value={task.priority} 
                    onValueChange={(value) => handlePriorityChange(task.id, value)}
                  >
                    <SelectTrigger className="h-8 w-auto">
                      <Badge className={getPriorityColor(task.priority)}>
                        {t.priorities[task.priority as keyof typeof t.priorities] || task.priority}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">{t.priorities.High}</SelectItem>
                      <SelectItem value="Medium">{t.priorities.Medium}</SelectItem>
                      <SelectItem value="Low">{t.priorities.Low}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Select 
                    value={task.status} 
                    onValueChange={(value) => handleStatusChange(task.id, value)}
                  >
                    <SelectTrigger className="h-8 w-auto">
                      <Badge className={getStatusColor(task.status)}>
                        {t.statuses[task.status as keyof typeof t.statuses] || task.status}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Complete">{t.statuses.Complete}</SelectItem>
                      <SelectItem value="Incomplete">{t.statuses.Incomplete}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  {editingCell?.id === task.id && editingCell?.field === 'contactName' ? (
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
                      className="text-gray-600 text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleCellClick(task.id, 'contactName', task.contactName)}
                    >
                      {task.contactName}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  {editingCell?.id === task.id && editingCell?.field === 'dueDate' ? (
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
                      className="text-gray-600 text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded whitespace-nowrap"
                      onClick={() => handleCellClick(
                        task.id, 
                        'dueDate', 
                        typeof task.dueDate === 'object' ? task.dueDate[language] : task.dueDate
                      )}
                    >
                      {typeof task.dueDate === 'object' ? task.dueDate[language] : task.dueDate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {language === 'zh' 
                  ? `显示 ${filteredAndSortedTasks.length} 条结果，共 ${tasks.length} 条` 
                  : `Shows ${filteredAndSortedTasks.length} results of ${tasks.length}`
                }
              </span>
              <div className="flex items-center space-x-2">
                <button className="px-2 py-1 text-gray-400 hover:text-gray-600">‹</button>
                <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">1</button>
                <button className="px-2 py-1 text-gray-400 hover:text-gray-600">2</button>
                <button className="px-2 py-1 text-gray-400 hover:text-gray-600">3</button>
                <button className="px-2 py-1 text-gray-400 hover:text-gray-600">4</button>
                <button className="px-2 py-1 text-gray-400 hover:text-gray-600">›</button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}