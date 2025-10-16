import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ArrowLeft, Save, Calendar as CalendarIcon } from 'lucide-react';
import { Language, PageType } from '../../App';
// Note: Using basic date formatting for now
// import { format } from 'date-fns';
// import { zhCN, enUS } from 'date-fns/locale';

interface CreateInteractionProps {
  language: Language;
  onNavigateBack: (page: PageType) => void;
}

type InteractionType = '客户拜访' | '营销活动' | '技术交流' | '电话沟通' | '邮件沟通' | '会议';
type VisitMethod = '上门拜访' | '视频会议' | '电话会议' | '在线会议' | '客户来访';
type Status = '已计划' | '进行中' | '已完成' | '已取消';

interface InteractionFormData {
  title: string;
  company: string;
  type: InteractionType;
  date: Date | undefined;
  time: string;
  description: string;
  participants: string;
  visitMethod: VisitMethod;
  location: string;
  status: Status;
  followUpActions: string;
  notes: string;
}

export function CreateInteraction({ language, onNavigateBack }: CreateInteractionProps) {
  const [formData, setFormData] = useState<InteractionFormData>({
    title: '',
    company: '',
    type: '客户拜访',
    date: undefined,
    time: '',
    description: '',
    participants: '',
    visitMethod: '上门拜访',
    location: '',
    status: '已计划',
    followUpActions: '',
    notes: ''
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const content = {
    zh: {
      title: '新建互动',
      backToInteractions: '返回客户互动',
      interactionTitle: '互动标题',
      company: '公司',
      type: '互动类型',
      date: '日期',
      time: '时间',
      description: '描述',
      participants: '参与人员',
      visitMethod: '互动方式',
      location: '地点',
      status: '状态',
      followUpActions: '后续行动',
      notes: '备注',
      save: '保存',
      cancel: '取消',
      selectDate: '选择日期',
      titlePlaceholder: '请输入互动标题',
      companyPlaceholder: '请输入公司名称',
      timePlaceholder: '请输入时间（如：14:30）',
      descriptionPlaceholder: '请输入互动描述',
      participantsPlaceholder: '请输入参与人员',
      locationPlaceholder: '请输入地点',
      followUpActionsPlaceholder: '请输入后续行动计划',
      notesPlaceholder: '请输入备注信息',
      types: {
        '客户拜访': '客户拜访',
        '营销活动': '营销活动',
        '技术交流': '技术交流',
        '电话沟通': '电话沟通',
        '邮件沟通': '邮件沟通',
        '会议': '会议'
      },
      visitMethods: {
        '上门拜访': '上门拜访',
        '视频会议': '视频会议',
        '电话会议': '电话会议',
        '在线会议': '在线会议',
        '客户来访': '客户来访'
      },
      statuses: {
        '已计划': '已计划',
        '进行中': '进行中',
        '已完成': '已完成',
        '已取消': '已取消'
      }
    },
    en: {
      title: 'Create New Interaction',
      backToInteractions: 'Back to Interactions',
      interactionTitle: 'Interaction Title',
      company: 'Company',
      type: 'Interaction Type',
      date: 'Date',
      time: 'Time',
      description: 'Description',
      participants: 'Participants',
      visitMethod: 'Interaction Method',
      location: 'Location',
      status: 'Status',
      followUpActions: 'Follow-up Actions',
      notes: 'Notes',
      save: 'Save',
      cancel: 'Cancel',
      selectDate: 'Select Date',
      titlePlaceholder: 'Enter interaction title',
      companyPlaceholder: 'Enter company name',
      timePlaceholder: 'Enter time (e.g., 14:30)',
      descriptionPlaceholder: 'Enter interaction description',
      participantsPlaceholder: 'Enter participants',
      locationPlaceholder: 'Enter location',
      followUpActionsPlaceholder: 'Enter follow-up action plan',
      notesPlaceholder: 'Enter notes',
      types: {
        '客户拜访': 'Client Visit',
        '营销活动': 'Marketing Event',
        '技术交流': 'Technical Exchange',
        '电话沟通': 'Phone Communication',
        '邮件沟通': 'Email Communication',
        '会议': 'Meeting'
      },
      visitMethods: {
        '上门拜访': 'On-site Visit',
        '视频会议': 'Video Conference',
        '电话会议': 'Phone Conference',
        '在线会议': 'Online Meeting',
        '客户来访': 'Client Visit to Office'
      },
      statuses: {
        '已计划': 'Planned',
        '进行中': 'In Progress',
        '已完成': 'Completed',
        '已取消': 'Cancelled'
      }
    }
  };

  const t = content[language];

  const handleInputChange = (field: keyof InteractionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Saving interaction:', formData);
    // Navigate back to interactions after saving
    onNavigateBack('interactions');
  };

  const handleCancel = () => {
    onNavigateBack('interactions');
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
          {/* Row 1: Title and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t.interactionTitle}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t.titlePlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">{t.company}</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder={t.companyPlaceholder}
              />
            </div>
          </div>

          {/* Row 2: Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">{t.type}</Label>
              <Select value={formData.type} onValueChange={(value: InteractionType) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="客户拜访">{t.types['客户拜访']}</SelectItem>
                  <SelectItem value="营销活动">{t.types['营销活动']}</SelectItem>
                  <SelectItem value="技术交流">{t.types['技术交流']}</SelectItem>
                  <SelectItem value="电话沟通">{t.types['电话沟通']}</SelectItem>
                  <SelectItem value="邮件沟通">{t.types['邮件沟通']}</SelectItem>
                  <SelectItem value="会议">{t.types['会议']}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t.status}</Label>
              <Select value={formData.status} onValueChange={(value: Status) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="已计划">{t.statuses['已计划']}</SelectItem>
                  <SelectItem value="进行中">{t.statuses['进行中']}</SelectItem>
                  <SelectItem value="已完成">{t.statuses['已完成']}</SelectItem>
                  <SelectItem value="已取消">{t.statuses['已取消']}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.date}</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      formData.date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    ) : (
                      <span className="text-muted-foreground">{t.selectDate}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      handleInputChange('date', date);
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">{t.time}</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                placeholder={t.timePlaceholder}
              />
            </div>
          </div>

          {/* Row 4: Description */}
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

          {/* Row 5: Participants and Visit Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="participants">{t.participants}</Label>
              <Input
                id="participants"
                value={formData.participants}
                onChange={(e) => handleInputChange('participants', e.target.value)}
                placeholder={t.participantsPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitMethod">{t.visitMethod}</Label>
              <Select value={formData.visitMethod} onValueChange={(value: VisitMethod) => handleInputChange('visitMethod', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="上门拜访">{t.visitMethods['上门拜访']}</SelectItem>
                  <SelectItem value="视频会议">{t.visitMethods['视频会议']}</SelectItem>
                  <SelectItem value="电话会议">{t.visitMethods['电话会议']}</SelectItem>
                  <SelectItem value="在线会议">{t.visitMethods['在线会议']}</SelectItem>
                  <SelectItem value="客户来访">{t.visitMethods['客户来访']}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 6: Location */}
          <div className="space-y-2">
            <Label htmlFor="location">{t.location}</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder={t.locationPlaceholder}
            />
          </div>

          {/* Row 7: Follow-up Actions */}
          <div className="space-y-2">
            <Label htmlFor="followUpActions">{t.followUpActions}</Label>
            <Textarea
              id="followUpActions"
              value={formData.followUpActions}
              onChange={(e) => handleInputChange('followUpActions', e.target.value)}
              placeholder={t.followUpActionsPlaceholder}
              rows={3}
            />
          </div>

          {/* Row 8: Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t.notes}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t.notesPlaceholder}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}