import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Save, Upload, X } from 'lucide-react';
import { Language, PageType } from '../../App';

interface CreateCustomerProps {
  language: Language;
  onNavigateBack: (page: PageType) => void;
}

export function CreateCustomer({ language, onNavigateBack }: CreateCustomerProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    listingStatus: '',
    industry: '',
    founded: '',
    companySize: '',
    headquarterCountry: '',
    headquarterCity: '',
    introduction: '',
    documents: [] as File[]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const content = {
    zh: {
      title: '新建客户',
      basicInfo: '基本信息',
      companyName: '公司名称',
      companyNamePlaceholder: '请输入公司名称',
      listingStatus: '上市状态',
      listingStatusPlaceholder: '选择上市状态',
      industry: '行业',
      industryPlaceholder: '选择行业',
      founded: '成立年份',
      foundedPlaceholder: '请输入成立年份',
      companySize: '公司规模',
      companySizePlaceholder: '选择公司规模',
      
      locationInfo: '总部信息',
      headquarterCountry: '总部国家',
      headquarterCountryPlaceholder: '选择总部国家',
      headquarterCity: '总部城市',
      headquarterCityPlaceholder: '请输入总部城市',
      
      companyDetails: '公司详情',
      introduction: '公司介绍',
      introductionPlaceholder: '请输入公司介绍或描述',
      documents: '相关文档',
      documentsPlaceholder: '上传相关文档',
      uploadDocuments: '上传文档',
      noDocuments: '暂无文档',
      
      cancel: '取消',
      save: '保存',
      
      listingStatuses: {
        listed: '上市公司',
        private: '私人公司'
      },
      
      industries: {
        technology: '科技',
        finance: '金融',
        healthcare: '医疗健康',
        education: '教育',
        manufacturing: '制造业',
        retail: '零售',
        realestate: '房地产',
        consulting: '咨询服务',
        energy: '能源',
        automotive: '汽车',
        telecommunications: '电信',
        media: '传媒',
        transportation: '交通运输',
        agriculture: '农业',
        construction: '建筑',
        other: '其他'
      },
      
      companySizes: {
        startup: '初创公司 (1-10人)',
        small: '小型公司 (11-50人)',
        medium: '中型公司 (51-200人)',
        large: '大型公司 (201-1000人)',
        enterprise: '企业集团 (1000+人)'
      },
      
      countries: {
        cn: '中国',
        us: '美国',
        gb: '英国',
        ca: '加拿大',
        au: '澳大利亚',
        de: '德国',
        fr: '法国',
        jp: '日本',
        kr: '韩国',
        sg: '新加坡',
        hk: '香港',
        in: '印度',
        other: '其他'
      }
    },
    en: {
      title: 'Create New Customer',
      basicInfo: 'Basic Information',
      companyName: 'Company Name',
      companyNamePlaceholder: 'Enter company name',
      listingStatus: 'Listing Status',
      listingStatusPlaceholder: 'Select listing status',
      industry: 'Industry Sector',
      industryPlaceholder: 'Select industry',
      founded: 'Founded Year',
      foundedPlaceholder: 'Enter founded year',
      companySize: 'Company Size',
      companySizePlaceholder: 'Select company size',
      
      locationInfo: 'Headquarters Information',
      headquarterCountry: 'Headquarters Country',
      headquarterCountryPlaceholder: 'Select headquarters country',
      headquarterCity: 'Headquarters City',
      headquarterCityPlaceholder: 'Enter headquarters city',
      
      companyDetails: 'Company Details',
      introduction: 'Company Introduction',
      introductionPlaceholder: 'Enter company introduction or description',
      documents: 'Documents',
      documentsPlaceholder: 'Upload related documents',
      uploadDocuments: 'Upload Documents',
      noDocuments: 'No documents',
      
      cancel: 'Cancel',
      save: 'Save',
      
      listingStatuses: {
        listed: 'Listed',
        private: 'Private'
      },
      
      industries: {
        technology: 'Technology',
        finance: 'Finance',
        healthcare: 'Healthcare',
        education: 'Education',
        manufacturing: 'Manufacturing',
        retail: 'Retail',
        realestate: 'Real Estate',
        consulting: 'Consulting',
        energy: 'Energy',
        automotive: 'Automotive',
        telecommunications: 'Telecommunications',
        media: 'Media',
        transportation: 'Transportation',
        agriculture: 'Agriculture',
        construction: 'Construction',
        other: 'Other'
      },
      
      companySizes: {
        startup: 'Startup (1-10 employees)',
        small: 'Small (11-50 employees)',
        medium: 'Medium (51-200 employees)',
        large: 'Large (201-1000 employees)',
        enterprise: 'Enterprise (1000+ employees)'
      },
      
      countries: {
        cn: 'China',
        us: 'United States',
        gb: 'United Kingdom',
        ca: 'Canada',
        au: 'Australia',
        de: 'Germany',
        fr: 'France',
        jp: 'Japan',
        kr: 'South Korea',
        sg: 'Singapore',
        hk: 'Hong Kong',
        in: 'India',
        other: 'Other'
      }
    }
  };

  const t = content[language];

  const handleSave = () => {
    // TODO: 在这里处理保存逻辑
    console.log('Saving customer:', formData);
    // 保存成功后返回客户页面
    onNavigateBack('contacts');
  };

  const handleCancel = () => {
    onNavigateBack('contacts');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)]
      }));
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.basicInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">{t.companyName} *</Label>
              <Input
                id="companyName"
                placeholder={t.companyNamePlaceholder}
                value={formData.companyName}
                onChange={(e) => updateFormData('companyName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="listingStatus">{t.listingStatus}</Label>
                <Select value={formData.listingStatus} onValueChange={(value) => updateFormData('listingStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.listingStatusPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Listed">{t.listingStatuses.listed}</SelectItem>
                    <SelectItem value="Private">{t.listingStatuses.private}</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="Energy">{t.industries.energy}</SelectItem>
                    <SelectItem value="Automotive">{t.industries.automotive}</SelectItem>
                    <SelectItem value="Telecommunications">{t.industries.telecommunications}</SelectItem>
                    <SelectItem value="Media">{t.industries.media}</SelectItem>
                    <SelectItem value="Transportation">{t.industries.transportation}</SelectItem>
                    <SelectItem value="Agriculture">{t.industries.agriculture}</SelectItem>
                    <SelectItem value="Construction">{t.industries.construction}</SelectItem>
                    <SelectItem value="Other">{t.industries.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="founded">{t.founded}</Label>
                <Input
                  id="founded"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  placeholder={t.foundedPlaceholder}
                  value={formData.founded}
                  onChange={(e) => updateFormData('founded', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySize">{t.companySize}</Label>
                <Select value={formData.companySize} onValueChange={(value) => updateFormData('companySize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.companySizePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Startup">{t.companySizes.startup}</SelectItem>
                    <SelectItem value="Small">{t.companySizes.small}</SelectItem>
                    <SelectItem value="Medium">{t.companySizes.medium}</SelectItem>
                    <SelectItem value="Large">{t.companySizes.large}</SelectItem>
                    <SelectItem value="Enterprise">{t.companySizes.enterprise}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Headquarters Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.locationInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="headquarterCountry">{t.headquarterCountry}</Label>
                <Select value={formData.headquarterCountry} onValueChange={(value) => updateFormData('headquarterCountry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.headquarterCountryPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CN">{t.countries.cn}</SelectItem>
                    <SelectItem value="US">{t.countries.us}</SelectItem>
                    <SelectItem value="GB">{t.countries.gb}</SelectItem>
                    <SelectItem value="CA">{t.countries.ca}</SelectItem>
                    <SelectItem value="AU">{t.countries.au}</SelectItem>
                    <SelectItem value="DE">{t.countries.de}</SelectItem>
                    <SelectItem value="FR">{t.countries.fr}</SelectItem>
                    <SelectItem value="JP">{t.countries.jp}</SelectItem>
                    <SelectItem value="KR">{t.countries.kr}</SelectItem>
                    <SelectItem value="SG">{t.countries.sg}</SelectItem>
                    <SelectItem value="HK">{t.countries.hk}</SelectItem>
                    <SelectItem value="IN">{t.countries.in}</SelectItem>
                    <SelectItem value="Other">{t.countries.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="headquarterCity">{t.headquarterCity}</Label>
                <Input
                  id="headquarterCity"
                  placeholder={t.headquarterCityPlaceholder}
                  value={formData.headquarterCity}
                  onChange={(e) => updateFormData('headquarterCity', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle>{t.companyDetails}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="introduction">{t.introduction}</Label>
              <Textarea
                id="introduction"
                placeholder={t.introductionPlaceholder}
                value={formData.introduction}
                onChange={(e) => updateFormData('introduction', e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.documents}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={triggerFileUpload}
                    className="mb-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t.uploadDocuments}
                  </Button>
                  <p className="text-sm text-gray-500">{t.documentsPlaceholder}</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                />
                {formData.documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {formData.documents.length === 0 && (
                  <p className="text-center text-sm text-gray-400 mt-2">{t.noDocuments}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}