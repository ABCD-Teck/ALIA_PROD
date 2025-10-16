import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { Language, PageType } from '../../App';

interface CreateOpportunityProps {
  language: Language;
  onNavigateBack: (page: PageType) => void;
}

type Priority = 'High' | 'Medium' | 'Low';
type Status = 'Lead' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

interface OpportunityFormData {
  customer: string;
  opportunityName: string;
  description: string;
  region: string;
  country: string;
  partner: string;
  priority: Priority;
  amount: string;
  currency: string;
  salesOwner: string;
  status: Status;
  actionPlan: string;
}

export function CreateOpportunity({ language, onNavigateBack }: CreateOpportunityProps) {
  const [formData, setFormData] = useState<OpportunityFormData>({
    customer: '',
    opportunityName: '',
    description: '',
    region: '',
    country: '',
    partner: '',
    priority: 'Medium',
    amount: '',
    currency: 'USD',
    salesOwner: '',
    status: 'Lead',
    actionPlan: ''
  });

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
      status: '状态',
      actionPlan: '行动计划',
      save: '保存',
      cancel: '取消',
      customerPlaceholder: '请输入客户名称',
      opportunityNamePlaceholder: '请输入商机名称',
      descriptionPlaceholder: '请输入商机描述',
      regionPlaceholder: '请输入地区',
      countryPlaceholder: '请输入国家',
      partnerPlaceholder: '请输入合作伙伴',
      amountPlaceholder: '请输入金额',
      salesOwnerPlaceholder: '请输入销售负责人',
      actionPlanPlaceholder: '请输入行动计划',
      priorities: {
        High: '高',
        Medium: '中',
        Low: '低'
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
        GBP: '英镑'
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
      status: 'Status',
      actionPlan: 'Action Plan',
      save: 'Save',
      cancel: 'Cancel',
      customerPlaceholder: 'Enter customer name',
      opportunityNamePlaceholder: 'Enter opportunity name',
      descriptionPlaceholder: 'Enter opportunity description',
      regionPlaceholder: 'Enter region',
      countryPlaceholder: 'Enter country',
      partnerPlaceholder: 'Enter partner',
      amountPlaceholder: 'Enter amount',
      salesOwnerPlaceholder: 'Enter sales owner',
      actionPlanPlaceholder: 'Enter action plan',
      priorities: {
        High: 'High',
        Medium: 'Medium',
        Low: 'Low'
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
        GBP: 'GBP'
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

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Saving opportunity:', formData);
    // Navigate back to opportunities after saving
    onNavigateBack('opportunities');
  };

  const handleCancel = () => {
    onNavigateBack('opportunities');
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
          {/* Row 1: Customer and Opportunity Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">{t.customer}</Label>
              <Input
                id="customer"
                value={formData.customer}
                onChange={(e) => handleInputChange('customer', e.target.value)}
                placeholder={t.customerPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opportunityName">{t.opportunityName}</Label>
              <Input
                id="opportunityName"
                value={formData.opportunityName}
                onChange={(e) => handleInputChange('opportunityName', e.target.value)}
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
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">{t.currencies.USD}</SelectItem>
                  <SelectItem value="EUR">{t.currencies.EUR}</SelectItem>
                  <SelectItem value="CNY">{t.currencies.CNY}</SelectItem>
                  <SelectItem value="GBP">{t.currencies.GBP}</SelectItem>
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
              <Select value={formData.status} onValueChange={(value: Status) => handleInputChange('status', value)}>
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

          {/* Row 7: Action Plan */}
          <div className="space-y-2">
            <Label htmlFor="actionPlan">{t.actionPlan}</Label>
            <Textarea
              id="actionPlan"
              value={formData.actionPlan}
              onChange={(e) => handleInputChange('actionPlan', e.target.value)}
              placeholder={t.actionPlanPlaceholder}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}