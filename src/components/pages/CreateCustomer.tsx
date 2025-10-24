import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Save, Upload, X, Loader2 } from 'lucide-react';
import { Language, PageType } from '../../App';
import { customersApi } from '../../services/api';

interface CustomerFormState {
  companyName: string;
  listingStatus: string;
  customerType: string;
  status: string;
  industry: string;
  founded: string;
  companySize: string;
  headquarterCountry: string;
  headquarterCity: string;
  introduction: string;
  documents: File[];
}

const INDUSTRY_CODE_MAP: Record<string, string | null> = {
  Technology: 'TECH',
  Finance: 'FINSERV',
  Healthcare: 'HEALTHCARE',
  Education: 'EDUCATION',
  Manufacturing: 'MANUF',
  Retail: 'RETAIL',
  'Real Estate': 'REALESTATE',
  Consulting: 'CONSULTING',
  Energy: 'ENERGY',
  Automotive: 'AUTOMOTIVE',
  Telecommunications: 'TELECOM',
  Media: 'MEDIA',
  Transportation: 'TRANSPORT',
  Agriculture: 'AGRICULTURE',
  Construction: 'CONSTRUCTION',
  Other: 'OTHER'
};

const COUNTRY_NAME_MAP: Record<string, string> = {
  CN: 'China',
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  JP: 'Japan',
  KR: 'South Korea',
  SG: 'Singapore',
  HK: 'Hong Kong',
  IN: 'India',
  Other: 'Other'
};

const REGION_MAP: Record<string, string> = {
  CN: 'APAC',
  US: 'NA',
  GB: 'EMEA',
  CA: 'NA',
  AU: 'APAC',
  DE: 'EMEA',
  FR: 'EMEA',
  JP: 'APAC',
  KR: 'APAC',
  SG: 'APAC',
  HK: 'APAC',
  IN: 'APAC',
  Other: 'GLOBAL'
};

const COMPANY_SIZE_MAP: Record<string, string> = {
  Startup: '1-10',
  Small: '11-50',
  Medium: '51-200',
  Large: '201-1000',
  Enterprise: '1000+'
};

const LISTING_STATUS_MAP: Record<string, string> = {
  Listed: 'listed',
  Private: 'private'
};

const createInitialFormState = (): CustomerFormState => ({
  companyName: '',
  listingStatus: '',
  customerType: '',
  status: 'active',
  industry: '',
  founded: '',
  companySize: '',
  headquarterCountry: '',
  headquarterCity: '',
  introduction: '',
  documents: []
});

interface CreateCustomerProps {
  language: Language;
  onNavigateBack: (page: PageType) => void;
}

export function CreateCustomer({ language, onNavigateBack }: CreateCustomerProps) {
  const [formData, setFormData] = useState<CustomerFormState>(createInitialFormState());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const redirectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const content = {
    zh: {
      title: '新建客户',
      basicInfo: '基本信息',
      companyName: '公司名称',
      companyNamePlaceholder: '请输入公司名称',
      listingStatus: '上市状态',
      listingStatusPlaceholder: '选择上市状态',
      customerType: '客户类型',
      customerTypePlaceholder: '选择客户类型',
      customerStatus: '客户状态',
      customerStatusPlaceholder: '选择客户状态',
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
      saving: '保存中...',
      successMessage: '客户创建成功！',
      errorMessage: '创建客户失败，请稍后重试。',
      requiredCompanyName: '请填写公司名称。',
      invalidFoundedYear: '成立年份必须是数字。',
      
      listingStatuses: {
        listed: '上市公司',
        private: '私人公司'
      },

      customerTypes: {
        smb: '中小企业',
        enterprise: '大型企业',
        startup: '初创公司',
        strategic: '战略客户',
        lead: '潜在商机'
      },

      customerStatuses: {
        active: '活跃',
        inactive: '非活跃',
        prospect: '潜在客户',
        dormant: '沉睡客户'
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
      customerType: 'Customer Type',
      customerTypePlaceholder: 'Select customer type',
      customerStatus: 'Customer Status',
      customerStatusPlaceholder: 'Select customer status',
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
      saving: 'Saving...',
      successMessage: 'Customer created successfully!',
      errorMessage: 'Failed to create customer. Please try again.',
      requiredCompanyName: 'Company name is required.',
      invalidFoundedYear: 'Founded year must be a valid number.',
      
      listingStatuses: {
        listed: 'Listed',
        private: 'Private'
      },

      customerTypes: {
        smb: 'SMB',
        enterprise: 'Enterprise',
        startup: 'Startup',
        strategic: 'Strategic',
        lead: 'Lead'
      },

      customerStatuses: {
        active: 'Active',
        inactive: 'Inactive',
        prospect: 'Prospect',
        dormant: 'Dormant'
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

  const handleSave = async () => {
    if (!formData.companyName.trim()) {
      setError(t.requiredCompanyName);
      return;
    }

    if (formData.founded && Number.isNaN(Number(formData.founded))) {
      setError(t.invalidFoundedYear);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    // Send industry_name for custom industries, or use the mapped code for predefined ones
    const industryCode = INDUSTRY_CODE_MAP[formData.industry] || null;
    const industryName = formData.industry || null;
    const employeeCountRange = COMPANY_SIZE_MAP[formData.companySize] || null;
    const country = COUNTRY_NAME_MAP[formData.headquarterCountry] || null;
    const region = REGION_MAP[formData.headquarterCountry] || null;
    const listingStatus =
      LISTING_STATUS_MAP[formData.listingStatus] ||
      (formData.listingStatus ? formData.listingStatus.toLowerCase() : null);
    const foundedYear = formData.founded ? Number(formData.founded) : undefined;

    const customFields = {
      founded_year: foundedYear,
      company_size_label: formData.companySize || undefined,
      headquarter_city: formData.headquarterCity || undefined,
      headquarter_country_code: formData.headquarterCountry || undefined,
      uploaded_documents: formData.documents.length > 0
        ? formData.documents.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type
          }))
        : undefined
    };

    const cleanedCustomFields = Object.fromEntries(
      Object.entries(customFields).filter(([, value]) => {
        if (value === undefined || value === null) return false;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim() !== '';
        return true;
      })
    );

    const payload: Record<string, unknown> = {
      company_name: formData.companyName.trim(),
      industry_code: industryCode || undefined,
      industry_name: industryName || undefined,
      listing_status: listingStatus || undefined,
      description: formData.introduction || undefined,
      introduction: formData.introduction || undefined,
      city: formData.headquarterCity || undefined,
      country: country || undefined,
      region: region || undefined,
      employee_count_range: employeeCountRange || undefined,
      customer_type: formData.customerType ? formData.customerType.toLowerCase() : 'prospect',
      status: formData.status || 'active'
    };

    if (Object.keys(cleanedCustomFields).length > 0) {
      payload.customFields = cleanedCustomFields;
    }

    try {
      const response = await customersApi.create(payload);

      if (!response.data) {
        setError(response.error || t.errorMessage);
        return;
      }

      setSuccessMessage(t.successMessage);
      setFormData(createInitialFormState());
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      redirectTimeoutRef.current = window.setTimeout(() => {
        onNavigateBack('customer-insights');
      }, 1500);
    } catch (err) {
      console.error('Error creating customer:', err);
      setError(t.errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setSuccessMessage(null);
    setFormData(createInitialFormState());
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    onNavigateBack('customer-insights');
  };

  const updateFormData = (field: keyof Omit<CustomerFormState, 'documents'>, value: string) => {
    setError(null);
    setSuccessMessage(null);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setError(null);
      setSuccessMessage(null);
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)]
      }));
    }
    event.target.value = '';
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
      <div className="flex items-center justify-end">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            {t.cancel}
          </Button>
          <Button
            variant="teal"
            onClick={handleSave}
            disabled={isSaving || !formData.companyName.trim()}
          >
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
                <Label htmlFor="customerType">{t.customerType}</Label>
                <Select value={formData.customerType} onValueChange={(value) => updateFormData('customerType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.customerTypePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smb">{t.customerTypes.smb}</SelectItem>
                    <SelectItem value="enterprise">{t.customerTypes.enterprise}</SelectItem>
                    <SelectItem value="startup">{t.customerTypes.startup}</SelectItem>
                    <SelectItem value="strategic">{t.customerTypes.strategic}</SelectItem>
                    <SelectItem value="lead">{t.customerTypes.lead}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerStatus">{t.customerStatus}</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.customerStatusPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t.customerStatuses.active}</SelectItem>
                    <SelectItem value="inactive">{t.customerStatuses.inactive}</SelectItem>
                    <SelectItem value="prospect">{t.customerStatuses.prospect}</SelectItem>
                    <SelectItem value="dormant">{t.customerStatuses.dormant}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">{t.industry}</Label>
                <Input
                  id="industry"
                  list="industry-suggestions"
                  placeholder={t.industryPlaceholder}
                  value={formData.industry}
                  onChange={(e) => updateFormData('industry', e.target.value)}
                />
                <datalist id="industry-suggestions">
                  <option value="Technology">{t.industries.technology}</option>
                  <option value="Finance">{t.industries.finance}</option>
                  <option value="Healthcare">{t.industries.healthcare}</option>
                  <option value="Education">{t.industries.education}</option>
                  <option value="Manufacturing">{t.industries.manufacturing}</option>
                  <option value="Retail">{t.industries.retail}</option>
                  <option value="Real Estate">{t.industries.realestate}</option>
                  <option value="Consulting">{t.industries.consulting}</option>
                  <option value="Energy">{t.industries.energy}</option>
                  <option value="Automotive">{t.industries.automotive}</option>
                  <option value="Telecommunications">{t.industries.telecommunications}</option>
                  <option value="Media">{t.industries.media}</option>
                  <option value="Transportation">{t.industries.transportation}</option>
                  <option value="Agriculture">{t.industries.agriculture}</option>
                  <option value="Construction">{t.industries.construction}</option>
                  <option value="Other">{t.industries.other}</option>
                </datalist>
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
