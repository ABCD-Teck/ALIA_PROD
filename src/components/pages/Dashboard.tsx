import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, Check, X, Loader2 } from 'lucide-react';
import { Language, PageType } from '../../App';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { customersApi } from '../../services/api';

interface DashboardProps {
  searchQuery: string;
  language: Language;
  onPageChange: (page: PageType) => void;
}

interface Customer {
  customer_id: string;
  company_name: string;
  industry_name: string;
  contact_count: number;
  opportunity_count: number;
  status: string;
}

export function Dashboard({ searchQuery, language, onPageChange }: DashboardProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [customersWithContact, setCustomersWithContact] = useState(0);
  const [totalOpportunities, setTotalOpportunities] = useState(0);

  const content = {
    zh: {
      stats: {
        totalCustomers: '客户总数',
        hasContact: '已有联系',
        futureActivities: '未来活动数',
        visitRecords: '拜访记录数'
      },
      customerList: {
        title: '客户列表',
        columns: {
          id: '',
          company: '公司名称',
          industry: '行业',
          contact: '联系人',
          hasContact: '已有联系',
          isCustomer: '已为客户'
        },
        selectCustomer: '选择客户',
        viewDetails: '查看详情',
        newCustomer: '+ 新建客户'
      },
      industryChart: {
        title: '客户行业分布',
        yAxisLabel: '数量'
      },
      loading: '加载中...',
      error: '加载失败'
    },
    en: {
      stats: {
        totalCustomers: 'Total Customers',
        hasContact: 'Has Contact',
        futureActivities: 'Future Activities',
        visitRecords: 'Visit Records'
      },
      customerList: {
        title: 'Customer List',
        columns: {
          id: '',
          company: 'Company Name',
          industry: 'Industry',
          contact: 'Contact',
          hasContact: 'Has Contact',
          isCustomer: 'Is Customer'
        },
        selectCustomer: 'Select Customer',
        viewDetails: 'View Details',
        newCustomer: '+ New Customer'
      },
      industryChart: {
        title: 'Customer Industry Distribution',
        yAxisLabel: 'Count'
      },
      loading: 'Loading...',
      error: 'Failed to load'
    }
  };

  const t = content[language];

  // Fetch customers from API
  useEffect(() => {
    let isMounted = true;

    const fetchCustomersInternal = async () => {
      if (!isMounted) return;

      setLoading(true);
      setError(null);

      try {
        const response = await customersApi.getAll({
          search: searchQuery || undefined,
          limit: 100,
          offset: 0,
        });

        if (!isMounted) return; // Check again after async call

        if (response.error) {
          setError(response.error);
          setCustomers([]);
          setTotalCustomers(0);
          setCustomersWithContact(0);
          setTotalOpportunities(0);
        } else if (response.data) {
          const customersList = response.data.customers || [];
          setCustomers(customersList);
          setTotalCustomers(response.data.total || customersList.length);

          // Calculate stats
          const withContact = customersList.filter((c: Customer) => c.contact_count && c.contact_count > 0).length;
          setCustomersWithContact(withContact);

          const totalOpps = customersList.reduce((sum: number, c: Customer) => sum + (c.opportunity_count || 0), 0);
          setTotalOpportunities(totalOpps);

          // Set first customer as selected by default
          if (customersList.length > 0 && !selectedClient) {
            setSelectedClient(customersList[0].company_name);
          }
        } else {
          // Handle case where data is undefined
          setCustomers([]);
          setTotalCustomers(0);
          setCustomersWithContact(0);
          setTotalOpportunities(0);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Dashboard fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setCustomers([]);
        setTotalCustomers(0);
        setCustomersWithContact(0);
        setTotalOpportunities(0);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCustomersInternal();

    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  const fetchCustomers = async () => {
    // This function is kept for any manual refresh calls
    setLoading(true);
    setError(null);

    try {
      const response = await customersApi.getAll({
        search: searchQuery || undefined,
        limit: 100,
        offset: 0,
      });

      if (response.error) {
        setError(response.error);
        setCustomers([]);
        setTotalCustomers(0);
        setCustomersWithContact(0);
        setTotalOpportunities(0);
      } else if (response.data) {
        const customersList = response.data.customers || [];
        setCustomers(customersList);
        setTotalCustomers(response.data.total || customersList.length);

        // Calculate stats
        const withContact = customersList.filter((c: Customer) => c.contact_count && c.contact_count > 0).length;
        setCustomersWithContact(withContact);

        const totalOpps = customersList.reduce((sum: number, c: Customer) => sum + (c.opportunity_count || 0), 0);
        setTotalOpportunities(totalOpps);

        // Set first customer as selected by default
        if (customersList.length > 0 && !selectedClient) {
          setSelectedClient(customersList[0].company_name);
        }
      } else {
        // Handle case where data is undefined
        setCustomers([]);
        setTotalCustomers(0);
        setCustomersWithContact(0);
        setTotalOpportunities(0);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setCustomers([]);
      setTotalCustomers(0);
      setCustomersWithContact(0);
      setTotalOpportunities(0);
    } finally {
      setLoading(false);
    }
  };

  // Calculate industry distribution with safe data handling
  const industryDistribution = customers.reduce((acc: any, customer) => {
    const industry = customer?.industry_name || 'Unknown';
    if (!acc[industry]) {
      acc[industry] = { industry, industryEn: industry, count: 0, color: '#00E096' };
    }
    acc[industry].count += 1;
    return acc;
  }, {});

  const industryDistributionData = Object.values(industryDistribution).filter((item: any) => item && item.count > 0);

  const statsData = [
    {
      title: t.stats.totalCustomers,
      value: totalCustomers.toString(),
      color: 'text-[#00E096]'
    },
    {
      title: t.stats.hasContact,
      value: customersWithContact.toString(),
      color: 'text-green-600'
    },
    {
      title: t.stats.futureActivities,
      value: totalOpportunities.toString(),
      color: 'text-orange-600'
    },
    {
      title: t.stats.visitRecords,
      value: '0',
      color: 'text-purple-600'
    }
  ];

  const filteredCustomers = searchQuery
    ? customers.filter(customer =>
        customer.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.industry_name && customer.industry_name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : customers;

  if (loading) {
    return (
      <div className="pt-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#009699]" />
        <span className="ml-3 text-gray-600">{t.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-6 flex items-center justify-center h-64 text-red-600">
        {t.error}: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statsData.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex flex-col items-start space-y-3">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-600">{stat.title}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{t.customerList.title}</CardTitle>
            <Button
              className="bg-[#009699] text-white hover:bg-[#007d7f]"
              onClick={() => onPageChange('create-customer')}
            >
              {t.customerList.newCustomer}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm text-gray-600">{t.customerList.columns.id}</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">{t.customerList.columns.company}</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">{t.customerList.columns.industry}</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">{t.customerList.columns.hasContact}</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">{t.customerList.columns.isCustomer}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr key={customer.customer_id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-900">{index}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{customer.company_name}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {customer.industry_name || '-'}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      <div className="flex justify-center">
                        {customer.contact_count > 0 ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      <div className="flex justify-center">
                        {customer.status === 'active' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Section */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{t.customerList.selectCustomer}</span>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.customer_id} value={customer.company_name}>
                      {customer.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="text-gray-600"
                onClick={() => onPageChange('customer-insights')}
              >
                {t.customerList.viewDetails}
              </Button>
              <Button
                className="bg-teal-custom text-white hover:bg-teal-custom-80"
                onClick={() => onPageChange('create-customer')}
              >
                {t.customerList.newCustomer}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industry Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t.industryChart.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {industryDistributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={industryDistributionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={language === 'zh' ? 'industry' : 'industryEn'}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis
                  label={{
                    value: t.industryChart.yAxisLabel,
                    angle: -90,
                    position: 'insideLeft'
                  }}
                />
                <Tooltip
                  labelFormatter={(value) => value}
                  formatter={(value) => [value, t.industryChart.yAxisLabel]}
                />
                <Bar dataKey="count" fill="#00E096" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
