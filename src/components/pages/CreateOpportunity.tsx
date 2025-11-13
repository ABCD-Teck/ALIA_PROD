import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../../App';
import { opportunitiesApi, customersApi } from '../../services/api';

interface CreateOpportunityProps {
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

// Stage mapping from frontend to backend
const STAGE_MAP: Record<string, string> = {
  'Lead': 'prospect',
  'Proposal': 'proposal',
  'Negotiation': 'negotiation',
  'Won': 'closed_won',
  'Lost': 'closed_lost'
};

export function CreateOpportunity({ language }: CreateOpportunityProps) {
  const navigate = useNavigate();
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await customersApi.getAll({ limit: 1000 });
        if (response.data) {
          setCustomers(response.data.customers);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const content = {
    zh: {
      title: '新建商机',
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
      cancel: '取消',
      saving: '保存中...',
      customerPlaceholder: '请选择客户',
      opportunityNamePlaceholder: '请输入商机名称',
      descriptionPlaceholder: '请输入商机描述',
      regionPlaceholder: '请输入地区',
      countryPlaceholder: '请输入国家',
      partnerPlaceholder: '请输入合作伙伴',
      amountPlaceholder: '请输入金额',
      salesOwnerPlaceholder: '请输入销售负责人',
      notesPlaceholder: '请输入备注',
      successMessage: '商机创建成功！',
      errorMessage: '创建商机失败，请重试',
      requiredFields: '请填写必填字段',
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
      title: 'Create New Opportunity',
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
      cancel: 'Cancel',
      saving: 'Saving...',
      customerPlaceholder: 'Select customer',
      opportunityNamePlaceholder: 'Enter opportunity name',
      descriptionPlaceholder: 'Enter opportunity description',
      regionPlaceholder: 'Enter region',
      countryPlaceholder: 'Enter country',
      partnerPlaceholder: 'Enter partner',
      amountPlaceholder: 'Enter amount',
      salesOwnerPlaceholder: 'Enter sales owner',
      notesPlaceholder: 'Enter notes',
      successMessage: 'Opportunity created successfully!',
      errorMessage: 'Failed to create opportunity, please try again',
      requiredFields: 'Please fill in required fields',
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
    // Validate required fields
    if (!formData.customer_id || !formData.name) {
      setError(t.requiredFields);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Prepare data for API
      const apiData = {
        customer_id: formData.customer_id,
        name: formData.name,
        description: formData.description || undefined,
        value: formData.amount ? parseFloat(formData.amount) : undefined,
        currency_id: formData.currency_id,
        stage: STAGE_MAP[formData.stage] || 'prospect',
        probability: undefined, // Can be added later
        expected_close_date: undefined, // Can be added later
        source: formData.partner || undefined,
        priority: formData.priority || 'medium',
        notes: formData.notes || undefined
      };

      const response = await opportunitiesApi.create(apiData);

      if (response.data) {
        setSuccessMessage(t.successMessage);
        // Wait a moment to show success message, then navigate back
        setTimeout(() => {
          navigate('/opportunities');
        }, 1500);
      } else {
        const errorMsg = response.error || t.errorMessage;
        const detailMsg = (response as any).detail || '';
        setError(errorMsg + (detailMsg ? '\n' + detailMsg : ''));
        console.error('Create opportunity error response:', response);
      }
    } catch (err) {
      console.error('Error creating opportunity:', err);
      setError(t.errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/opportunities');
  };

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
      <div className="flex items-center justify-end">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            {t.cancel}
          </Button>
          <Button variant="teal" onClick={handleSave} disabled={isSaving || isLoading}>
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
            <div className="space-y-2 p-3 bg-teal-50 border-2 border-teal-300 rounded-lg transition-all hover:border-teal-400 hover:shadow-md">
              <Label htmlFor="customer" className="text-teal-900 font-semibold">{t.customer} *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => handleInputChange('customer_id', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-white border-teal-200 hover:border-teal-400 focus:ring-2 focus:ring-teal-400">
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