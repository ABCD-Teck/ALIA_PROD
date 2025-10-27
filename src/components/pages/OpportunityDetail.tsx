import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Save, Loader2, Archive } from 'lucide-react';
import { Language } from '../../App';
import { opportunitiesApi, customersApi } from '../../services/api';

interface OpportunityDetailProps {
  language: Language;
}

type Priority = 'High' | 'Medium' | 'Low';
type Status = 'Lead' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

interface OpportunityFormData {
  customer_id: string;
  name: string;
  description: string;
  region: string;
  country: string;
  partner: string;
  priority: string;
  amount: string;
  currency_id: string;
  salesOwner: string;
  stage: string;
  notes: string;
}

interface Customer {
  customer_id: string;
  company_name: string;
}

// Currency mapping - these are the actual UUIDs from the database
const CURRENCY_MAP: Record<string, string> = {
  'USD': '76d02e9c-f71a-4d8e-9d11-c9e2e7e81ec8',
  'EUR': '5dd2f770-f1c2-42a0-b3d5-7b2d568fc9d6',
  'CNY': 'c778b6df-e498-4e44-b727-dbad3e4ee5a3',
  'GBP': '2899173e-8f1a-41d9-bb93-793118d264e5',
  'JPY': '4b341475-de3c-4f8b-a8a2-54e119b681a0',
  'HKD': '26e34e56-c0bb-46a4-9581-e4cd007b613b',
  'SGD': 'a75f7caa-a0eb-4fc2-abcd-36844a9fbb28'
};

// Reverse currency mapping
const CURRENCY_ID_TO_CODE: Record<string, string> = Object.entries(CURRENCY_MAP).reduce((acc, [code, id]) => {
  acc[id] = code;
  return acc;
}, {} as Record<string, string>);

// Stage mapping from frontend to backend
const STAGE_MAP: Record<string, string> = {
  'Lead': 'prospect',
  'Proposal': 'proposal',
  'Negotiation': 'negotiation',
  'Won': 'closed_won',
  'Lost': 'closed_lost'
};

// Reverse stage mapping
const STAGE_TO_STATUS: Record<string, Status> = {
  'prospect': 'Lead',
  'proposal': 'Proposal',
  'negotiation': 'Negotiation',
  'closed_won': 'Won',
  'closed_lost': 'Lost',
  'qualification': 'Lead'
};

// Priority mapping from frontend to backend (handles both Chinese and English)
const PRIORITY_MAP: Record<string, string> = {
  '高': 'high',
  '中': 'medium',
  '低': 'low',
  'high': 'high',
  'medium': 'medium',
  'low': 'low'
};

export function OpportunityDetail({ language }: OpportunityDetailProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const opportunityId = id || '';

  const [formData, setFormData] = useState<OpportunityFormData>({
    customer_id: '',
    name: '',
    description: '',
    region: '',
    country: '',
    partner: '',
    priority: 'medium',
    amount: '',
    currency_id: CURRENCY_MAP['USD'],
    salesOwner: '',
    stage: 'Lead',
    notes: ''
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch opportunity and customers on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch customers
        const customersResponse = await customersApi.getAll({ limit: 1000 });
        if (customersResponse.data) {
          setCustomers(customersResponse.data.customers);
        }

        // Fetch opportunity details
        const oppResponse = await opportunitiesApi.getById(opportunityId);
        if (oppResponse.data) {
          const opp = oppResponse.data;
          setFormData({
            customer_id: opp.customer_id || '',
            name: opp.name || '',
            description: opp.description || '',
            region: opp.region_name || '',
            country: opp.country_code || '',
            partner: opp.source || '',
            priority: opp.priority ? opp.priority.toLowerCase() : 'medium',
            amount: opp.amount ? opp.amount.toString() : '',
            currency_id: opp.currency_id || CURRENCY_MAP['USD'],
            salesOwner: '',
            stage: STAGE_TO_STATUS[opp.stage?.toLowerCase()] || 'Lead',
            notes: opp.notes || ''
          });
        } else {
          setError('Failed to load opportunity details');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [opportunityId]);

  const content = {
    zh: {
      title: '商机详情',
      backToOpportunities: '返回商机管理',
      customer: '客户',
      opportunityName: '商机名称',
      description: '描述',
      region: '地区',
      country: '国家',
      partner: '合作伙伴',
      priority: '优先级',
      amount: '金额',
      currency: '币种',
      salesOwner: '销售负责人',
      status: '阶段',
      notes: '备注',
      save: '保存',
      archive: '归档',
      cancel: '取消',
      saving: '保存中...',
      archiving: '归档中...',
      loading: '加载中...',
      customerPlaceholder: '请选择客户',
      opportunityNamePlaceholder: '请输入商机名称',
      descriptionPlaceholder: '请输入商机描述',
      regionPlaceholder: '请输入地区',
      countryPlaceholder: '请输入国家',
      partnerPlaceholder: '请输入合作伙伴',
      amountPlaceholder: '请输入金额',
      salesOwnerPlaceholder: '请输入销售负责人',
      notesPlaceholder: '请输入备注',
      successMessage: '商机更新成功！',
      archiveSuccess: '商机已归档！',
      errorMessage: '更新商机失败，请重试',
      archiveError: '归档商机失败，请重试',
      requiredFields: '请填写必填字段',
      confirmArchive: '确定要归档此商机吗？归档后可以在归档列表中恢复。',
      priorities: {
        high: '高',
        medium: '中',
        low: '低'
      },
      statuses: {
        Lead: '潜在客户',
        Proposal: '方案阶段',
        Negotiation: '谈判阶段',
        Won: '已成交',
        Lost: '已失败'
      },
      currencies: {
        USD: '美元',
        EUR: '欧元',
        CNY: '人民币',
        GBP: '英镑',
        JPY: '日元',
        HKD: '港币',
        SGD: '新元'
      }
    },
    en: {
      title: 'Opportunity Details',
      backToOpportunities: 'Back to Opportunities',
      customer: 'Customer',
      opportunityName: 'Opportunity Name',
      description: 'Description',
      region: 'Region',
      country: 'Country',
      partner: 'Partner',
      priority: 'Priority',
      amount: 'Amount',
      currency: 'Currency',
      salesOwner: 'Sales Owner',
      status: 'Stage',
      notes: 'Notes',
      save: 'Save',
      archive: 'Archive',
      cancel: 'Cancel',
      saving: 'Saving...',
      archiving: 'Archiving...',
      loading: 'Loading...',
      customerPlaceholder: 'Select customer',
      opportunityNamePlaceholder: 'Enter opportunity name',
      descriptionPlaceholder: 'Enter opportunity description',
      regionPlaceholder: 'Enter region',
      countryPlaceholder: 'Enter country',
      partnerPlaceholder: 'Enter partner',
      amountPlaceholder: 'Enter amount',
      salesOwnerPlaceholder: 'Enter sales owner',
      notesPlaceholder: 'Enter notes',
      successMessage: 'Opportunity updated successfully!',
      archiveSuccess: 'Opportunity archived successfully!',
      errorMessage: 'Failed to update opportunity, please try again',
      archiveError: 'Failed to archive opportunity, please try again',
      requiredFields: 'Please fill in required fields',
      confirmArchive: 'Are you sure you want to archive this opportunity? You can restore it from the archive later.',
      priorities: {
        high: 'High',
        medium: 'Medium',
        low: 'Low'
      },
      statuses: {
        Lead: 'Lead',
        Proposal: 'Proposal',
        Negotiation: 'Negotiation',
        Won: 'Won',
        Lost: 'Lost'
      },
      currencies: {
        USD: 'USD',
        EUR: 'EUR',
        CNY: 'CNY',
        GBP: 'GBP',
        JPY: 'JPY',
        HKD: 'HKD',
        SGD: 'SGD'
      }
    }
  };

  const t = content[language];

  const handleInputChange = (field: keyof OpportunityFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Enhanced validation for required fields
    if (!formData.customer_id || !formData.name) {
      setError(t.requiredFields);
      return;
    }

    // Additional validation for data integrity
    if (formData.name.trim().length === 0) {
      setError(language === 'zh' ? '商机名称不能为空' : 'Opportunity name cannot be empty');
      return;
    }

    // Validate amount if provided
    if (formData.amount && (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) < 0)) {
      setError(language === 'zh' ? '金额必须是有效的正数' : 'Amount must be a valid positive number');
      return;
    }

    // Validate stage is in allowed values
    const allowedStages = ['Lead', 'Proposal', 'Negotiation', 'Won', 'Lost'];
    if (formData.stage && !allowedStages.includes(formData.stage)) {
      setError(language === 'zh' ? '无效的阶段值' : 'Invalid stage value');
      return;
    }

    // Validate priority is in allowed values (both English and Chinese)
    const allowedPriorities = ['高', '中', '低', 'high', 'medium', 'low'];
    if (formData.priority && !allowedPriorities.includes(formData.priority)) {
      setError(language === 'zh' ? '无效的优先级值' : 'Invalid priority value');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Prepare data for API with sanitization
      const updateData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        currency_id: formData.currency_id || undefined,
        stage: STAGE_MAP[formData.stage] || 'prospect',
        priority: PRIORITY_MAP[formData.priority] || 'medium',
        source: formData.partner?.trim() || undefined,
        country_code: formData.country?.trim() || undefined
      };

      // Remove undefined values to avoid sending null/undefined to API
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      const response = await opportunitiesApi.update(opportunityId, updateData);

      if (response.data) {
        setSuccessMessage(t.successMessage);
        // Wait a moment to show success message, then navigate back
        setTimeout(() => {
          navigate('/opportunities');
        }, 1500);
      } else {
        // More specific error handling
        let errorMsg = t.errorMessage;
        if (response.error) {
          if (typeof response.error === 'string') {
            errorMsg = response.error;
          } else if (response.error.message) {
            errorMsg = response.error.message;
          }
        }
        setError(errorMsg);
        console.error('Update opportunity error response:', response);
        console.error('Update data sent:', updateData);
      }
    } catch (err: any) {
      console.error('Error updating opportunity:', err);
      // More specific error messages based on error type
      let errorMsg = t.errorMessage;
      if (err.message) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMsg = language === 'zh' ? '网络连接错误，请检查网络后重试' : 'Network error, please check your connection and retry';
        } else if (err.message.includes('404')) {
          errorMsg = language === 'zh' ? '商机不存在或已被删除' : 'Opportunity not found or has been deleted';
        } else if (err.message.includes('500')) {
          errorMsg = language === 'zh' ? '服务器内部错误，请稍后重试' : 'Server error, please try again later';
        }
      }
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm(t.confirmArchive)) {
      return;
    }

    setIsArchiving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await opportunitiesApi.archive(opportunityId);

      if (response.data || response.success) {
        setSuccessMessage(t.archiveSuccess);
        // Wait a moment to show success message, then navigate back
        setTimeout(() => {
          navigate('/opportunities');
        }, 1500);
      } else {
        const errorMsg = response.error || t.archiveError;
        setError(errorMsg);
        console.error('Archive opportunity error response:', response);
      }
    } catch (err) {
      console.error('Error archiving opportunity:', err);
      setError(t.archiveError);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleCancel = () => {
    navigate('/opportunities');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2">{t.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Error/Success Messages */}
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
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleCancel} disabled={isSaving || isArchiving}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.backToOpportunities}
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleArchive}
            disabled={isSaving || isArchiving}
          >
            {isArchiving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t.archiving}
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                {t.archive}
              </>
            )}
          </Button>
          <Button variant="teal" onClick={handleSave} disabled={isSaving || isArchiving}>
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
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: Customer and Opportunity Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">{t.customer} *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => handleInputChange('customer_id', value)}
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.customerPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.customer_id} value={customer.customer_id}>
                      {customer.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="opportunityName">{t.opportunityName} *</Label>
              <Input
                id="opportunityName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t.opportunityNamePlaceholder}
              />
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

          {/* Row 3: Region and Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">{t.region}</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                placeholder={t.regionPlaceholder}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{t.country}</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder={t.countryPlaceholder}
              />
            </div>
          </div>

          {/* Row 4: Partner and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partner">{t.partner}</Label>
              <Input
                id="partner"
                value={formData.partner}
                onChange={(e) => handleInputChange('partner', e.target.value)}
                placeholder={t.partnerPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">{t.priority}</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t.priorities.high}</SelectItem>
                  <SelectItem value="medium">{t.priorities.medium}</SelectItem>
                  <SelectItem value="low">{t.priorities.low}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 5: Amount and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t.amount}</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder={t.amountPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t.currency}</Label>
              <Select
                value={formData.currency_id}
                onValueChange={(value) => handleInputChange('currency_id', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CURRENCY_MAP['USD']}>{t.currencies.USD}</SelectItem>
                  <SelectItem value={CURRENCY_MAP['EUR']}>{t.currencies.EUR}</SelectItem>
                  <SelectItem value={CURRENCY_MAP['CNY']}>{t.currencies.CNY}</SelectItem>
                  <SelectItem value={CURRENCY_MAP['GBP']}>{t.currencies.GBP}</SelectItem>
                  <SelectItem value={CURRENCY_MAP['JPY']}>{t.currencies.JPY}</SelectItem>
                  <SelectItem value={CURRENCY_MAP['HKD']}>{t.currencies.HKD}</SelectItem>
                  <SelectItem value={CURRENCY_MAP['SGD']}>{t.currencies.SGD}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 6: Sales Owner and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salesOwner">{t.salesOwner}</Label>
              <Input
                id="salesOwner"
                value={formData.salesOwner}
                onChange={(e) => handleInputChange('salesOwner', e.target.value)}
                placeholder={t.salesOwnerPlaceholder}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t.status}</Label>
              <Select value={formData.stage} onValueChange={(value) => handleInputChange('stage', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead">{t.statuses.Lead}</SelectItem>
                  <SelectItem value="Proposal">{t.statuses.Proposal}</SelectItem>
                  <SelectItem value="Negotiation">{t.statuses.Negotiation}</SelectItem>
                  <SelectItem value="Won">{t.statuses.Won}</SelectItem>
                  <SelectItem value="Lost">{t.statuses.Lost}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 7: Notes */}
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
