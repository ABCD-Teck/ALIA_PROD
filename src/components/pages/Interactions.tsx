import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

import { Calendar } from 'lucide-react';
import { Language } from '../../App';

interface InteractionsProps {
  searchQuery: string;
  language: Language;
  onViewDetails?: (id: string) => void;
}

// 历史拜访与活动数据
const pastActivities = [
  {
    id: 1,
    date: '2025-09-12',
    title: '拜访BYD欧洲分公司',
    titleEn: 'Visit BYD Europe Branch',
    type: '客户拜访',
    typeEn: 'Client Visit',
    description: '讨论欧洲市场合作细节',
    descriptionEn: 'Discuss Europe market cooperation details',
    details: '公司：BYD 参与业务员：欧大伦托',
    detailsEn: 'Company: BYD Participants: Oulun Trust',
    method: '拜访方式：上门拜访',
    methodEn: 'Visit method: On-site visit'
  },
  {
    id: 2,
    date: '2025-09-10',
    title: 'BYD欧洲新能源推介会',
    titleEn: 'BYD Europe New Energy Promotion Meeting',
    type: '营销活动',
    typeEn: 'Marketing Event',
    description: '推介BYD新能源产品，拓展欧洲市场',
    descriptionEn: 'Promote BYD new energy products, expand European market',
    details: '公司：BYD 参与业务员：欧大伦托',
    detailsEn: 'Company: BYD Participants: Oulun Trust',
    method: '拜访方式：',
    methodEn: 'Visit method:'
  },
  {
    id: 3,
    date: '2025-09-08',
    title: '亚马逊云服务技术交流会',
    titleEn: 'Amazon Cloud Service Technical Exchange',
    type: '技术交流',
    typeEn: 'Technical Exchange',
    description: '深入讨论云计算解决方案',
    descriptionEn: 'In-depth discussion of cloud computing solutions',
    details: '公司：Amazon 参与业务员：李明',
    detailsEn: 'Company: Amazon Participants: Li Ming',
    method: '拜访方式：视频会议',
    methodEn: 'Visit method: Video conference'
  }
];

export function Interactions({ searchQuery, language, onViewDetails }: InteractionsProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const content = {
    zh: {
      pastActivities: '历史拜访与活动',
      futureActivities: '未来拜访与活动',
      noFutureActivities: '在当前筛选条件下，暂无未来活动。',
      viewDetails: '查看详情'
    },
    en: {
      pastActivities: 'Past Visits & Activities',
      futureActivities: 'Future Visits & Activities',
      noFutureActivities: 'No future activities under current filter conditions.',
      viewDetails: 'View Details'
    }
  };

  const t = content[language];

  const filteredActivities = searchQuery
    ? pastActivities.filter(activity => 
        (language === 'zh' ? activity.title : activity.titleEn).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (language === 'zh' ? activity.type : activity.typeEn).toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.date.includes(searchQuery)
      )
    : pastActivities;

  const getActivityColor = (type: string) => {
    switch (type) {
      case '客户拜访':
      case 'Client Visit':
        return 'bg-blue-50 border-blue-200';
      case '营销活动':
      case 'Marketing Event':
        return 'bg-green-50 border-green-200';
      case '技术交流':
      case 'Technical Exchange':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '客户拜访':
      case 'Client Visit':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case '营销活动':
      case 'Marketing Event':
        return 'bg-green-100 text-green-800 border border-green-200';
      case '技术交流':
      case 'Technical Exchange':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="pt-6 space-y-6">

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Past Activities */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-5 w-5" />
            <h2 className="text-lg font-medium">{t.pastActivities}</h2>
          </div>
          
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <Card key={activity.id} className={`${getActivityColor(language === 'zh' ? activity.type : activity.typeEn)} border-l-4`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Date and Title */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{activity.date}</span>
                          <span className="text-gray-400">|</span>
                          <span className="font-medium text-gray-900">
                            {language === 'zh' ? activity.title : activity.titleEn}
                          </span>
                          <span className="text-gray-400">|</span>
                          <Badge className={getTypeColor(language === 'zh' ? activity.type : activity.typeEn)}>
                            {language === 'zh' ? activity.type : activity.typeEn}
                          </Badge>
                        </div>
                        
                        {/* Description */}
                        <p className="text-sm text-gray-700 mb-2">
                          {language === 'zh' ? activity.description : activity.descriptionEn}
                        </p>
                        
                        {/* Details */}
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{language === 'zh' ? activity.details : activity.detailsEn}</p>
                          <p>{language === 'zh' ? activity.method : activity.methodEn}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* View Details Button */}
                    <div className="flex justify-start">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                        onClick={() => onViewDetails?.(activity.id.toString())}
                      >
                        {t.viewDetails}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Future Activities */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-5 w-5" />
            <h2 className="text-lg font-medium">{t.futureActivities}</h2>
          </div>
          
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">{t.noFutureActivities}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}