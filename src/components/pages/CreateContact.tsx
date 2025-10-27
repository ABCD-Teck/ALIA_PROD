import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../../App';

interface CreateContactProps {
  language: Language;
  
}

export function CreateContact({ language }: CreateContactProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    department: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    website: '',
    linkedIn: '',
    notes: '',
    leadSource: '',
    contactType: '',
    industry: ''
  });

  const content = {
    zh: {
      title: '新建联系人',
      personalInfo: '基本信息',
      firstName: '名',
      firstNamePlaceholder: '请输入名',
      lastName: '姓',
      lastNamePlaceholder: '请输入姓',
      email: '邮箱地址',
      emailPlaceholder: '请输入邮箱地址',
      phone: '电话号码',
      phonePlaceholder: '请输入电话号码',
      
      companyInfo: '公司信息',
      company: '公司名称',
      companyPlaceholder: '请输入公司名称',
      jobTitle: '职位',
      jobTitlePlaceholder: '请输入职位',
      department: '部门',
      departmentPlaceholder: '请输入部门',
      industry: '行业',
      industryPlaceholder: '选择行业',
      
      addressInfo: '地址信息',
      address: '地址',
      addressPlaceholder: '请输入详细地址',
      city: '城市',
      cityPlaceholder: '请输入城市',
      state: '省/州',
      statePlaceholder: '请输入省/州',
      zipCode: '邮编',
      zipCodePlaceholder: '请输入邮编',
      country: '国家',
      countryPlaceholder: '选择国家',
      
      additionalInfo: '其他信息',
      website: '网站',
      websitePlaceholder: '请输入网站地址',
      linkedIn: 'LinkedIn',
      linkedInPlaceholder: '请输入LinkedIn地址',
      leadSource: '来源',
      leadSourcePlaceholder: '选择客户来源',
      contactType: '联系人类型',
      contactTypePlaceholder: '选择联系人类型',
      notes: '备注',
      notesPlaceholder: '请输入备注信息',
      
      cancel: '取消',
      save: '保存',
      
      industries: {
        technology: '科技',
        finance: '金融',
        healthcare: '医疗',
        education: '教育',
        manufacturing: '制造业',
        retail: '零售',
        realestate: '房地产',
        consulting: '咨询',
        other: '其他'
      },
      
      countries: {
        china: '中国',
        usa: '美国',
        uk: '英国',
        canada: '加拿大',
        australia: '澳大利亚',
        germany: '德国',
        france: '法国',
        japan: '日本',
        other: '其他'
      },
      
      leadSources: {
        website: '网站',
        referral: '推荐',
        socialmedia: '社交媒体',
        tradeshow: '展会',
        advertisement: '广告',
        coldemail: '邮件开发',
        other: '其他'
      },
      
      contactTypes: {
        prospect: '潜在客户',
        customer: '客户',
        partner: '合作伙伴',
        vendor: '供应商',
        investor: '投资者',
        other: '其他'
      }
    },
    en: {
      title: 'Create New Contact',
      personalInfo: 'Personal Information',
      firstName: 'First Name',
      firstNamePlaceholder: 'Enter first name',
      lastName: 'Last Name',
      lastNamePlaceholder: 'Enter last name',
      email: 'Email Address',
      emailPlaceholder: 'Enter email address',
      phone: 'Phone Number',
      phonePlaceholder: 'Enter phone number',
      
      companyInfo: 'Company Information',
      company: 'Company Name',
      companyPlaceholder: 'Enter company name',
      jobTitle: 'Job Title',
      jobTitlePlaceholder: 'Enter job title',
      department: 'Department',
      departmentPlaceholder: 'Enter department',
      industry: 'Industry',
      industryPlaceholder: 'Select industry',
      
      addressInfo: 'Address Information',
      address: 'Address',
      addressPlaceholder: 'Enter full address',
      city: 'City',
      cityPlaceholder: 'Enter city',
      state: 'State/Province',
      statePlaceholder: 'Enter state/province',
      zipCode: 'Zip Code',
      zipCodePlaceholder: 'Enter zip code',
      country: 'Country',
      countryPlaceholder: 'Select country',
      
      additionalInfo: 'Additional Information',
      website: 'Website',
      websitePlaceholder: 'Enter website URL',
      linkedIn: 'LinkedIn',
      linkedInPlaceholder: 'Enter LinkedIn URL',
      leadSource: 'Lead Source',
      leadSourcePlaceholder: 'Select lead source',
      contactType: 'Contact Type',
      contactTypePlaceholder: 'Select contact type',
      notes: 'Notes',
      notesPlaceholder: 'Enter notes',
      
      cancel: 'Cancel',
      save: 'Save',
      
      industries: {
        technology: 'Technology',
        finance: 'Finance',
        healthcare: 'Healthcare',
        education: 'Education',
        manufacturing: 'Manufacturing',
        retail: 'Retail',
        realestate: 'Real Estate',
        consulting: 'Consulting',
        other: 'Other'
      },
      
      countries: {
        china: 'China',
        usa: 'United States',
        uk: 'United Kingdom',
        canada: 'Canada',
        australia: 'Australia',
        germany: 'Germany',
        france: 'France',
        japan: 'Japan',
        other: 'Other'
      },
      
      leadSources: {
        website: 'Website',
        referral: 'Referral',
        socialmedia: 'Social Media',
        tradeshow: 'Trade Show',
        advertisement: 'Advertisement',
        coldemail: 'Cold Email',
        other: 'Other'
      },
      
      contactTypes: {
        prospect: 'Prospect',
        customer: 'Customer',
        partner: 'Partner',
        vendor: 'Vendor',
        investor: 'Investor',
        other: 'Other'
      }
    }
  };

  const t = content[language];

  const handleSave = () => {
    // TODO: 在这里处理保存逻辑
    console.log('Saving contact:', formData);
    // 保存成功后返回联系人页面
    navigate('/contacts');
  };

  const handleCancel = () => {
    navigate('/contacts');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            {t.cancel}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {t.save}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.personalInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t.firstName} *</Label>
                <Input
                  id="firstName"
                  placeholder={t.firstNamePlaceholder}
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t.lastName} *</Label>
                <Input
                  id="lastName"
                  placeholder={t.lastNamePlaceholder}
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email} *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  placeholder={t.phonePlaceholder}
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.companyInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">{t.company}</Label>
                <Input
                  id="company"
                  placeholder={t.companyPlaceholder}
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">{t.jobTitle}</Label>
                <Input
                  id="jobTitle"
                  placeholder={t.jobTitlePlaceholder}
                  value={formData.jobTitle}
                  onChange={(e) => updateFormData('jobTitle', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">{t.department}</Label>
                <Input
                  id="department"
                  placeholder={t.departmentPlaceholder}
                  value={formData.department}
                  onChange={(e) => updateFormData('department', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">{t.industry}</Label>
                <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.industryPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">{t.industries.technology}</SelectItem>
                    <SelectItem value="Finance">{t.industries.finance}</SelectItem>
                    <SelectItem value="Healthcare">{t.industries.healthcare}</SelectItem>
                    <SelectItem value="Education">{t.industries.education}</SelectItem>
                    <SelectItem value="Manufacturing">{t.industries.manufacturing}</SelectItem>
                    <SelectItem value="Retail">{t.industries.retail}</SelectItem>
                    <SelectItem value="Real Estate">{t.industries.realestate}</SelectItem>
                    <SelectItem value="Consulting">{t.industries.consulting}</SelectItem>
                    <SelectItem value="Other">{t.industries.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.addressInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">{t.address}</Label>
              <Input
                id="address"
                placeholder={t.addressPlaceholder}
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t.city}</Label>
                <Input
                  id="city"
                  placeholder={t.cityPlaceholder}
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">{t.state}</Label>
                <Input
                  id="state"
                  placeholder={t.statePlaceholder}
                  value={formData.state}
                  onChange={(e) => updateFormData('state', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">{t.zipCode}</Label>
                <Input
                  id="zipCode"
                  placeholder={t.zipCodePlaceholder}
                  value={formData.zipCode}
                  onChange={(e) => updateFormData('zipCode', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{t.country}</Label>
                <Select value={formData.country} onValueChange={(value) => updateFormData('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.countryPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="China">{t.countries.china}</SelectItem>
                    <SelectItem value="United States">{t.countries.usa}</SelectItem>
                    <SelectItem value="United Kingdom">{t.countries.uk}</SelectItem>
                    <SelectItem value="Canada">{t.countries.canada}</SelectItem>
                    <SelectItem value="Australia">{t.countries.australia}</SelectItem>
                    <SelectItem value="Germany">{t.countries.germany}</SelectItem>
                    <SelectItem value="France">{t.countries.france}</SelectItem>
                    <SelectItem value="Japan">{t.countries.japan}</SelectItem>
                    <SelectItem value="Other">{t.countries.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.additionalInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">{t.website}</Label>
                <Input
                  id="website"
                  placeholder={t.websitePlaceholder}
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedIn">{t.linkedIn}</Label>
                <Input
                  id="linkedIn"
                  placeholder={t.linkedInPlaceholder}
                  value={formData.linkedIn}
                  onChange={(e) => updateFormData('linkedIn', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leadSource">{t.leadSource}</Label>
                <Select value={formData.leadSource} onValueChange={(value) => updateFormData('leadSource', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.leadSourcePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">{t.leadSources.website}</SelectItem>
                    <SelectItem value="Referral">{t.leadSources.referral}</SelectItem>
                    <SelectItem value="Social Media">{t.leadSources.socialmedia}</SelectItem>
                    <SelectItem value="Trade Show">{t.leadSources.tradeshow}</SelectItem>
                    <SelectItem value="Advertisement">{t.leadSources.advertisement}</SelectItem>
                    <SelectItem value="Cold Email">{t.leadSources.coldemail}</SelectItem>
                    <SelectItem value="Other">{t.leadSources.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactType">{t.contactType}</Label>
                <Select value={formData.contactType} onValueChange={(value) => updateFormData('contactType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.contactTypePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prospect">{t.contactTypes.prospect}</SelectItem>
                    <SelectItem value="Customer">{t.contactTypes.customer}</SelectItem>
                    <SelectItem value="Partner">{t.contactTypes.partner}</SelectItem>
                    <SelectItem value="Vendor">{t.contactTypes.vendor}</SelectItem>
                    <SelectItem value="Investor">{t.contactTypes.investor}</SelectItem>
                    <SelectItem value="Other">{t.contactTypes.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t.notes}</Label>
              <Textarea
                id="notes"
                placeholder={t.notesPlaceholder}
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}