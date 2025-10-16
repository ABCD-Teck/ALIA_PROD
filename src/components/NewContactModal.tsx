import React, { useState } from 'react';
// Removed Dialog imports - using custom modal implementation
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { X } from 'lucide-react';
import { Language } from '../App';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export function NewContactModal({ isOpen, onClose, language }: NewContactModalProps) {
  const [formData, setFormData] = useState({
    contactOwner: '',
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    leadSource: '',
    location: '',
    leadScore: '',
    businessType: '',
    status: '',
    description: ''
  });

  const content = {
    zh: {
      title: '创建新联系人',
      description: '填写联系人信息以创建新的联系人记录',
      fields: {
        contactOwner: '客户负责人',
        firstName: '名字',
        lastName: '姓氏',
        title: '职位',
        email: '邮箱',
        phone: '电话',
        leadSource: '线索来源',
        location: '位置',
        leadScore: '线索评分',
        businessType: '业务类型',
        status: '状态',
        description: '描述'
      },
      options: {
        title: ['CEO', 'CTO', '总经理', '副总经理', '部门经理', '项目经理', '销售经理', '采购经理'],
        leadSource: ['网站', '推荐', '展会', '电话营销', '社交媒体', '合作伙伴', '其他'],
        leadScore: ['热门', '温和', '冷淡', '待定'],
        businessType: ['制造业', '科技', '金融', '教育', '医疗', '零售', '房地产', '其他'],
        status: ['新建', '联系中', '已报价', '谈判中', '已成交', '已失败']
      },
      buttons: {
        cancel: '取消',
        save: '保存'
      }
    },
    en: {
      title: 'Create New Contact',
      description: 'Fill in the contact information to create a new contact record',
      fields: {
        contactOwner: 'Contact Owner',
        firstName: 'First Name',
        lastName: 'Last Name',
        title: 'Title',
        email: 'Email',
        phone: 'Phone',
        leadSource: 'Lead Source',
        location: 'Location',
        leadScore: 'Lead Score',
        businessType: 'Business Type',
        status: 'Status',
        description: 'Description'
      },
      options: {
        title: ['CEO', 'CTO', 'General Manager', 'Vice President', 'Department Manager', 'Project Manager', 'Sales Manager', 'Purchase Manager'],
        leadSource: ['Website', 'Referral', 'Trade Show', 'Cold Call', 'Social Media', 'Partner', 'Other'],
        leadScore: ['Hot', 'Warm', 'Cold', 'Pending'],
        businessType: ['Manufacturing', 'Technology', 'Finance', 'Education', 'Healthcare', 'Retail', 'Real Estate', 'Other'],
        status: ['New', 'Contacted', 'Quoted', 'Negotiating', 'Won', 'Lost']
      },
      buttons: {
        cancel: 'Cancel',
        save: 'Save'
      }
    }
  };

  const t = content[language];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Saving contact:', formData);
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      contactOwner: '',
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: '',
      leadSource: '',
      location: '',
      leadScore: '',
      businessType: '',
      status: '',
      description: ''
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop - only covers main content area */}
      <div 
        className="absolute bg-black/50"
        style={{
          left: '256px',  // sidebar width
          right: '0',
          top: '64px',   // navbar height
          bottom: '0'
        }}
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div 
        className="absolute bg-white rounded-lg shadow-xl overflow-y-auto"
        style={{
          left: '280px',  // 256px sidebar + 24px margin
          right: '48px',  // 48px right margin 
          top: '88px',    // 64px navbar + 24px margin
          bottom: '24px', // 24px bottom margin
        }}
      >
        <div className="flex flex-row items-center justify-between pb-6 border-b border-gray-200 p-6">
          <div>
            <h2 className="text-2xl text-gray-900">{t.title}</h2>
            <p className="sr-only">{t.description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-8 py-6 px-6">
          {/* First Row */}
          <div className="grid grid-cols-5 gap-6">
            <div className="space-y-3">
              <Label htmlFor="contactOwner" className="text-sm text-gray-700">{t.fields.contactOwner}</Label>
              <Input
                id="contactOwner"
                value={formData.contactOwner}
                onChange={(e) => handleInputChange('contactOwner', e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 border-0 rounded-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="firstName" className="text-sm text-gray-700">{t.fields.firstName}</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 border-0 rounded-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="lastName" className="text-sm text-gray-700">{t.fields.lastName}</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 border-0 rounded-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm text-gray-700">{t.fields.title}</Label>
              <Select value={formData.title} onValueChange={(value) => handleInputChange('title', value)}>
                <SelectTrigger className="w-full h-12 px-4 bg-gray-50 border-0 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {t.options.title.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm text-gray-700">{t.fields.email}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 border-0 rounded-lg"
              />
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-5 gap-6">
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-sm text-gray-700">{t.fields.phone}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 border-0 rounded-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="leadSource" className="text-sm text-gray-700">{t.fields.leadSource}</Label>
              <Select value={formData.leadSource} onValueChange={(value) => handleInputChange('leadSource', value)}>
                <SelectTrigger className="w-full h-12 px-4 bg-gray-50 border-0 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {t.options.leadSource.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="location" className="text-sm text-gray-700">{t.fields.location}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 border-0 rounded-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="leadScore" className="text-sm text-gray-700">{t.fields.leadScore}</Label>
              <Select value={formData.leadScore} onValueChange={(value) => handleInputChange('leadScore', value)}>
                <SelectTrigger className="w-full h-12 px-4 bg-gray-50 border-0 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {t.options.leadScore.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="businessType" className="text-sm text-gray-700">{t.fields.businessType}</Label>
              <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                <SelectTrigger className="w-full h-12 px-4 bg-gray-50 border-0 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {t.options.businessType.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="status" className="text-sm text-gray-700">{t.fields.status}</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="w-full h-12 px-4 bg-gray-50 border-0 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {t.options.status.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-3">
              <Label htmlFor="description" className="text-sm text-gray-700">{t.fields.description}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full min-h-[120px] px-4 py-3 bg-gray-50 border-0 rounded-lg resize-none"
                placeholder={language === 'zh' ? '请输入描述信息...' : 'Enter description...'}
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 px-6 pb-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-8 h-11 text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            {t.buttons.cancel}
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#009699] text-white hover:bg-[#007d7f] px-8 h-11"
          >
            {t.buttons.save}
          </Button>
        </div>

      </div>
    </div>
  );
}