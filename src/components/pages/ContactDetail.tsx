import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Calendar, 
  Tag,
  Activity,
  DollarSign,
  TrendingUp,
  Clock,
  MessageSquare,
  Edit,
  Share,
  MoreHorizontal
} from 'lucide-react';
import { Language } from '../../App';

interface ContactDetailProps {
  searchQuery: string;
  language: Language;
  onNavigateBack: (page: any) => void;
  contactId?: number;
}

export function ContactDetail({ searchQuery, language, onNavigateBack, contactId }: ContactDetailProps) {
  const content = {
    zh: {
      title: '联系人详情',
      basicInfo: '基本信息',
      contactInfo: '关键指标',
      companyInfo: '公司信息',
      recentActivity: '近期活动',
      opportunities: '相关商机',
      interactions: '互动记录',
      edit: '编辑',
      share: '分享',
      more: '更多',
      name: '姓名',
      email: '邮箱',
      phone: '电话',
      company: '公司',
      position: '职位',
      department: '部门',
      address: '地址',
      joinDate: '加入日期',
      lastContact: '最后联系',
      status: '状态',
      tags: '标签',
      revenue: '相关收入',
      deals: '商机数',
      meetings: '会议次数',
      emails: '邮件数',
      calls: '通话次数',
      notes: '备注',
      active: '活跃',
      inactive: '不活跃',
      potentialClient: '潜在客户',
      existingClient: '现有客户',
      partner: '合作伙伴',
      noData: '暂无数据',
      contactHistory: '联系历史',
      viewAll: '查看全部',
      addNote: '添加备注',
      scheduleCall: '安排通话',
      sendEmail: '发送邮件',
      createOpportunity: '创建商机'
    },
    en: {
      title: 'Contact Details',
      basicInfo: 'Basic Information',
      contactInfo: 'Key Metrics',
      companyInfo: 'Company Information',
      recentActivity: 'Recent Activity',
      opportunities: 'Related Opportunities',
      interactions: 'Interaction History',
      edit: 'Edit',
      share: 'Share',
      more: 'More',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      position: 'Position',
      department: 'Department',
      address: 'Address',
      joinDate: 'Join Date',
      lastContact: 'Last Contact',
      status: 'Status',
      tags: 'Tags',
      revenue: 'Related Revenue',
      deals: 'Deals',
      meetings: 'Meetings',
      emails: 'Emails',
      calls: 'Calls',
      notes: 'Notes',
      active: 'Active',
      inactive: 'Inactive',
      potentialClient: 'Potential Client',
      existingClient: 'Existing Client',
      partner: 'Partner',
      noData: 'No data available',
      contactHistory: 'Contact History',
      viewAll: 'View All',
      addNote: 'Add Note',
      scheduleCall: 'Schedule Call',
      sendEmail: 'Send Email',
      createOpportunity: 'Create Opportunity'
    }
  };

  const t = content[language];

  // Mock contact data based on contactId
  const contact = {
    id: contactId || 1,
    name: 'Natukunda Cathy',
    email: 'cathy@gmail.com',
    phone: '+256708210793',
    company: 'Acme Corporation',
    position: 'Sales Manager',
    department: 'Sales & Marketing',
    address: 'Kampala, Uganda',
    joinDate: '2024-01-15',
    lastContact: '2024-02-28',
    status: 'active',
    tags: ['潜在客户', 'VIP', '重要'],
    avatar: '',
    revenue: '$125,000',
    deals: 12,
    meetings: 8,
    emails: 24,
    calls: 15,
    notes: 'High-value client with strong potential for expansion.'
  };

  const recentActivities = [
    {
      id: 1,
      type: 'email',
      title: language === 'zh' ? '发送了产品介绍邮件' : 'Sent product introduction email',
      date: '2024-02-28 14:30',
      status: 'completed'
    },
    {
      id: 2,
      type: 'call',
      title: language === 'zh' ? '电话会议 - 需求分析' : 'Phone call - Requirements analysis',
      date: '2024-02-27 10:00',
      status: 'completed'
    },
    {
      id: 3,
      type: 'meeting',
      title: language === 'zh' ? '面对面会议安排' : 'In-person meeting scheduled',
      date: '2024-03-05 09:00',
      status: 'scheduled'
    }
  ];

  const opportunities = [
    {
      id: 1,
      title: language === 'zh' ? 'CRM系统升级项目' : 'CRM System Upgrade Project',
      value: '$45,000',
      stage: language === 'zh' ? '谈判阶段' : 'Negotiation',
      probability: '75%',
      closeDate: '2024-03-15'
    },
    {
      id: 2,
      title: language === 'zh' ? '数据分析平台' : 'Data Analytics Platform',
      value: '$80,000',
      stage: language === 'zh' ? '提案阶段' : 'Proposal',
      probability: '60%',
      closeDate: '2024-04-20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">{t.title}</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            {t.edit}
          </Button>
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" />
            {t.share}
          </Button>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{t.basicInfo}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback className="bg-[#009699] text-white text-lg">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h2 className="text-xl font-medium">{contact.name}</h2>
                  <p className="text-gray-600">{contact.position}</p>
                  <p className="text-gray-500">{contact.company}</p>
                </div>
                <div className="ml-auto">
                  <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
                    {contact.status === 'active' ? t.active : t.inactive}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t.email}</p>
                      <p>{contact.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t.phone}</p>
                      <p>{contact.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t.department}</p>
                      <p>{contact.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t.address}</p>
                      <p>{contact.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{t.tags}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-[#009699] border-[#009699]">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>{t.recentActivity}</span>
                </div>
                <Button variant="link" className="text-[#009699]">
                  {t.viewAll}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex-shrink-0">
                      {activity.type === 'email' && <Mail className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'call' && <Phone className="h-4 w-4 text-green-500" />}
                      {activity.type === 'meeting' && <Calendar className="h-4 w-4 text-purple-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                    <Badge variant={activity.status === 'completed' ? 'default' : 'outline'}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>{t.opportunities}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <div key={opportunity.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{opportunity.title}</h4>
                      <span className="text-lg font-medium text-[#009699]">{opportunity.value}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{opportunity.stage}</span>
                      <span>{opportunity.probability}</span>
                      <span>{opportunity.closeDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Statistics & Quick Actions */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>{t.contactInfo}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{contact.deals}</p>
                  <p className="text-sm text-gray-600">{t.deals}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{contact.meetings}</p>
                  <p className="text-sm text-gray-600">{t.meetings}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{contact.emails}</p>
                  <p className="text-sm text-gray-600">{t.emails}</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{contact.calls}</p>
                  <p className="text-sm text-gray-600">{t.calls}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{t.revenue}</span>
                  <span className="font-medium text-[#009699]">{contact.revenue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{t.joinDate}</span>
                  <span className="text-sm">{contact.joinDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{t.lastContact}</span>
                  <span className="text-sm">{contact.lastContact}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-[#009699] hover:bg-[#007a7d]">
                <MessageSquare className="mr-2 h-4 w-4" />
                {t.sendEmail}
              </Button>
              <Button variant="outline" className="w-full">
                <Phone className="mr-2 h-4 w-4" />
                {t.scheduleCall}
              </Button>
              <Button variant="outline" className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                {t.createOpportunity}
              </Button>
              <Button variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                {t.addNote}
              </Button>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>{t.notes}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{contact.notes}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}