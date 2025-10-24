import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { User, Bell, Shield, Globe, Palette, Save, DollarSign } from 'lucide-react';
import { Language } from '../../App';
import { useCurrency, CURRENCIES } from '../../contexts/CurrencyContext';

interface SettingsProps {
  searchQuery: string;
  language: Language;
}

export function Settings({ searchQuery, language }: SettingsProps) {
  const { selectedCurrency, setSelectedCurrency, refreshRates, lastUpdated } = useCurrency();

  const [settings, setSettings] = useState({
    firstName: 'Andrew',
    lastName: 'Chen',
    email: 'andrew.chen@company.com',
    phone: '+1 555 0123',
    role: 'Sales Manager',
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
      profile: '个人资料',
      notifications: '通知',
      privacy: '隐私',
      appearance: '外观',
      currency: '货币设置',
      firstName: '名',
      lastName: '姓',
      email: '邮箱',
      phone: '电话',
      role: '职位',
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
      profile: 'Profile',
      notifications: 'Notifications',
      privacy: 'Privacy',
      appearance: 'Appearance',
      currency: 'Currency Settings',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      role: 'Role',
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

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const sections = [
    {
      id: 'profile',
      title: t.profile,
      icon: User,
      searchable: [t.profile, t.firstName, t.lastName, t.email, t.phone, t.role]
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
                {section.id === 'profile' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t.firstName}</Label>
                      <Input
                        id="firstName"
                        value={settings.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t.lastName}</Label>
                      <Input
                        id="lastName"
                        value={settings.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.email}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t.phone}</Label>
                      <Input
                        id="phone"
                        value={settings.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="role">{t.role}</Label>
                      <Input
                        id="role"
                        value={settings.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                      />
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
        <Button>
          <Save className="mr-2 h-4 w-4" />
          {t.save}
        </Button>
      </div>
    </div>
  );
}