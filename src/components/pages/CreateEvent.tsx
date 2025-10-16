import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Save } from 'lucide-react';
import { Language, PageType } from '../../App';

interface CreateEventProps {
  language: Language;
  onNavigateBack: (page: PageType) => void;
}

type EventType = 'meeting' | 'call' | 'task' | 'reminder';
type Priority = 'High' | 'Medium' | 'Low';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  attendees: string;
  eventType: EventType;
  priority: Priority;
  reminder: string;
  notes: string;
}

export function CreateEvent({ language, onNavigateBack }: CreateEventProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    attendees: '',
    eventType: 'meeting',
    priority: 'Medium',
    reminder: '15',
    notes: ''
  });

  const content = {
    zh: {
      title: '新建日程',
      backToCalendar: '返回日历',
      eventTitle: '日程标题',
      description: '描述',
      date: '日期',
      startTime: '开始时间',
      endTime: '结束时间',
      location: '地点',
      attendees: '参与者',
      eventType: '日程类型',
      priority: '优先级',
      reminder: '提醒时间',
      notes: '备注',
      save: '保存',
      cancel: '取消',
      titlePlaceholder: '请输入日程标题',
      descriptionPlaceholder: '请输入日程描述',
      datePlaceholder: '请选择日期',
      startTimePlaceholder: '请选择开始时间',
      endTimePlaceholder: '请选择结束时间',
      locationPlaceholder: '请输入地点',
      attendeesPlaceholder: '请输入参与者（用逗号分隔）',
      notesPlaceholder: '请输入备注',
      eventTypes: {
        meeting: '会议',
        call: '电话',
        task: '任务',
        reminder: '提醒'
      },
      priorities: {
        High: '高',
        Medium: '中',
        Low: '低'
      },
      reminderOptions: {
        '0': '无提醒',
        '5': '5分钟前',
        '15': '15分钟前',
        '30': '30分钟前',
        '60': '1小时前',
        '1440': '1天前'
      }
    },
    en: {
      title: 'Create New Event',
      backToCalendar: 'Back to Calendar',
      eventTitle: 'Event Title',
      description: 'Description',
      date: 'Date',
      startTime: 'Start Time',
      endTime: 'End Time',
      location: 'Location',
      attendees: 'Attendees',
      eventType: 'Event Type',
      priority: 'Priority',
      reminder: 'Reminder',
      notes: 'Notes',
      save: 'Save',
      cancel: 'Cancel',
      titlePlaceholder: 'Enter event title',
      descriptionPlaceholder: 'Enter event description',
      datePlaceholder: 'Select date',
      startTimePlaceholder: 'Select start time',
      endTimePlaceholder: 'Select end time',
      locationPlaceholder: 'Enter location',
      attendeesPlaceholder: 'Enter attendees (comma-separated)',
      notesPlaceholder: 'Enter notes',
      eventTypes: {
        meeting: 'Meeting',
        call: 'Call',
        task: 'Task',
        reminder: 'Reminder'
      },
      priorities: {
        High: 'High',
        Medium: 'Medium',
        Low: 'Low'
      },
      reminderOptions: {
        '0': 'No reminder',
        '5': '5 minutes before',
        '15': '15 minutes before',
        '30': '30 minutes before',
        '60': '1 hour before',
        '1440': '1 day before'
      }
    }
  };

  const t = content[language];

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Saving event:', formData);
    // Navigate back to calendar after saving
    onNavigateBack('calendar');
  };

  const handleCancel = () => {
    onNavigateBack('calendar');
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            {t.cancel}
          </Button>
          <Button variant="teal" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {t.save}
          </Button>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: Event Title and Event Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t.eventTitle}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t.titlePlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventType">{t.eventType}</Label>
              <Select value={formData.eventType} onValueChange={(value: EventType) => handleInputChange('eventType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">{t.eventTypes.meeting}</SelectItem>
                  <SelectItem value="call">{t.eventTypes.call}</SelectItem>
                  <SelectItem value="task">{t.eventTypes.task}</SelectItem>
                  <SelectItem value="reminder">{t.eventTypes.reminder}</SelectItem>
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

          {/* Row 3: Date and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">{t.date}</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">{t.priority}</Label>
              <Select value={formData.priority} onValueChange={(value: Priority) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">{t.priorities.High}</SelectItem>
                  <SelectItem value="Medium">{t.priorities.Medium}</SelectItem>
                  <SelectItem value="Low">{t.priorities.Low}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Start Time and End Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">{t.startTime}</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">{t.endTime}</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
              />
            </div>
          </div>

          {/* Row 5: Location and Reminder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">{t.location}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={t.locationPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder">{t.reminder}</Label>
              <Select value={formData.reminder} onValueChange={(value) => handleInputChange('reminder', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t.reminderOptions['0']}</SelectItem>
                  <SelectItem value="5">{t.reminderOptions['5']}</SelectItem>
                  <SelectItem value="15">{t.reminderOptions['15']}</SelectItem>
                  <SelectItem value="30">{t.reminderOptions['30']}</SelectItem>
                  <SelectItem value="60">{t.reminderOptions['60']}</SelectItem>
                  <SelectItem value="1440">{t.reminderOptions['1440']}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 6: Attendees */}
          <div className="space-y-2">
            <Label htmlFor="attendees">{t.attendees}</Label>
            <Input
              id="attendees"
              value={formData.attendees}
              onChange={(e) => handleInputChange('attendees', e.target.value)}
              placeholder={t.attendeesPlaceholder}
            />
          </div>

          {/* Row 7: Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t.notes}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t.notesPlaceholder}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}