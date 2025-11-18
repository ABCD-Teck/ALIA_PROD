import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Bell, Shield, Palette, Save, DollarSign, TrendingUp } from 'lucide-react';
import { Language } from '../../App';
import { useCurrency, CURRENCIES } from '../../contexts/CurrencyContext';
import { useUnitPreference } from '../../contexts/UnitPreferenceContext';
import { toast } from 'sonner';

interface SettingsProps {
  searchQuery: string;
  language: Language;
}

export function Settings({ searchQuery, language }: SettingsProps) {
  const { selectedCurrency, setSelectedCurrency, refreshRates, lastUpdated } = useCurrency();
  const { financialUnit, setFinancialUnit } = useUnitPreference();

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    privacy: {
      profileVisible: true,
      activityTracking: true,
      dataSharing: false
    },
    appearance: {
      theme: 'light',
      language: 'zh',
      timezone: 'Asia/Shanghai'
    }
  });

  const content = {
    zh: {
      title: '设置',
      financialDisplay: '财务显示',
      financialUnit: '财务单位',
      notifications: '通知',
      privacy: '隐私',
      appearance: '外观',
      currency: '货币设置',
      emailNotifications: '邮件通知',
      pushNotifications: '推送通知',
      smsNotifications: '短信通知',
      marketingEmails: '营销邮件',
      profileVisible: '公开显示个人资料',
      activityTracking: '活动跟踪',
      dataSharing: '数据共享',
      theme: '主题',
      language: '语言',
      timezone: '时区',
      preferredCurrency: '首选货币',
      refreshRates: '刷新汇率',
      lastUpdated: '最后更新',
      save: '保存',
      hundredMillion: '亿',
      million: '百万',
      financialUnitDescription: '选择财务数据的显示单位',
      themes: {
        light: '浅色',
        dark: '深色',
        auto: '自动'
      },
      languages: {
        zh: '中文',
        en: 'English'
      }
    },
    en: {
      title: 'Settings',
      financialDisplay: 'Financial Display',
      financialUnit: 'Financial Unit',
      notifications: 'Notifications',
      privacy: 'Privacy',
      appearance: 'Appearance',
      currency: 'Currency Settings',
      emailNotifications: 'Email notifications',
      pushNotifications: 'Push notifications',
      smsNotifications: 'SMS notifications',
      marketingEmails: 'Marketing emails',
      profileVisible: 'Profile publicly visible',
      activityTracking: 'Activity tracking',
      dataSharing: 'Data sharing',
      theme: 'Theme',
      language: 'Language',
      timezone: 'Timezone',
      preferredCurrency: 'Preferred Currency',
      refreshRates: 'Refresh Rates',
      lastUpdated: 'Last Updated',
      save: 'Save',
      hundredMillion: 'Hundred Million',
      million: 'Million',
      financialUnitDescription: 'Choose the display unit for financial data',
      themes: {
        light: 'Light',
        dark: 'Dark',
        auto: 'Auto'
      },
      languages: {
        zh: '中文',
        en: 'English'
      }
    }
  };

  const t = content[language];


  const handleNotificationChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handlePrivacyChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value
      }
    }));
  };

  const handleAppearanceChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // Show success toast
    toast.success(
      language === 'zh' ? '设置已保存' : 'Settings saved successfully',
      {
        description: language === 'zh'
          ? '您的设置已成功保存'
          : 'Your settings have been saved successfully'
      }
    );
  };

  const sections = [
    {
      id: 'financialDisplay',
      title: t.financialDisplay,
      icon: TrendingUp,
      searchable: [t.financialDisplay, t.financialUnit]
    },
    {
      id: 'notifications',
      title: t.notifications,
      icon: Bell,
      searchable: [t.notifications, t.emailNotifications, t.pushNotifications, t.smsNotifications, t.marketingEmails]
    },
    {
      id: 'privacy',
      title: t.privacy,
      icon: Shield,
      searchable: [t.privacy, t.profileVisible, t.activityTracking, t.dataSharing]
    },
    {
      id: 'appearance',
      title: t.appearance,
      icon: Palette,
      searchable: [t.appearance, t.theme, t.language, t.timezone]
    },
    {
      id: 'currency',
      title: t.currency,
      icon: DollarSign,
      searchable: [t.currency, t.preferredCurrency, t.refreshRates]
    }
  ];

  const visibleSections = searchQuery
    ? sections.filter(section =>
        section.searchable.some(term =>
          term.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : sections;

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {visibleSections.map((section, index) => {
          const Icon = section.icon;
          
          return (
            <Card key={section.id} className={index === 0 ? "mt-6" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.id === 'financialDisplay' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t.financialUnit}</Label>
                      <Select
                        value={financialUnit}
                        onValueChange={(value: 'hundred-million' | 'million') => setFinancialUnit(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hundred-million">
                            {t.hundredMillion} (100,000,000)
                          </SelectItem>
                          <SelectItem value="million">
                            {t.million} (1,000,000)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {t.financialUnitDescription}
                      </p>
                    </div>
                  </div>
                )}

                {section.id === 'notifications' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>{t.emailNotifications}</Label>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <Label>{t.pushNotifications}</Label>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <Label>{t.smsNotifications}</Label>
                      <Switch
                        checked={settings.notifications.sms}
                        onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <Label>{t.marketingEmails}</Label>
                      <Switch
                        checked={settings.notifications.marketing}
                        onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                      />
                    </div>
                  </div>
                )}

                {section.id === 'privacy' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>{t.profileVisible}</Label>
                      <Switch
                        checked={settings.privacy.profileVisible}
                        onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <Label>{t.activityTracking}</Label>
                      <Switch
                        checked={settings.privacy.activityTracking}
                        onCheckedChange={(checked) => handlePrivacyChange('activityTracking', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <Label>{t.dataSharing}</Label>
                      <Switch
                        checked={settings.privacy.dataSharing}
                        onCheckedChange={(checked) => handlePrivacyChange('dataSharing', checked)}
                      />
                    </div>
                  </div>
                )}

                {section.id === 'appearance' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t.theme}</Label>
                      <Select
                        value={settings.appearance.theme}
                        onValueChange={(value) => handleAppearanceChange('theme', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">{t.themes.light}</SelectItem>
                          <SelectItem value="dark">{t.themes.dark}</SelectItem>
                          <SelectItem value="auto">{t.themes.auto}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.language}</Label>
                      <Select
                        value={settings.appearance.language}
                        onValueChange={(value) => handleAppearanceChange('language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zh">{t.languages.zh}</SelectItem>
                          <SelectItem value="en">{t.languages.en}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.timezone}</Label>
                      <Select
                        value={settings.appearance.timezone}
                        onValueChange={(value) => handleAppearanceChange('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Shanghai">Asia/Shanghai</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                          <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {section.id === 'currency' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t.preferredCurrency}</Label>
                      <Select
                        value={selectedCurrency}
                        onValueChange={setSelectedCurrency}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CURRENCIES).map(([code, currency]) => (
                            <SelectItem key={code} value={code}>
                              {currency.symbol} {currency.name} ({code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {language === 'zh'
                          ? '选择您的首选货币。所有金额将自动转换为此货币。'
                          : 'Select your preferred currency. All amounts will be automatically converted to this currency.'}
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>{t.refreshRates}</Label>
                          {lastUpdated && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {t.lastUpdated}: {lastUpdated.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refreshRates}
                        >
                          {language === 'zh' ? '刷新' : 'Refresh'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {language === 'zh'
                          ? '汇率每24小时自动更新一次。'
                          : 'Exchange rates are automatically updated every 24 hours.'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {t.save}
        </Button>
      </div>
    </div>
  );
}