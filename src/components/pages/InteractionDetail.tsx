import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { Language, PageType } from '../../App';

interface InteractionDetailProps {
  searchQuery: string;
  language: Language;
  onNavigateBack: (page: PageType) => void;
  interactionId?: string;
}

export function InteractionDetail({ 
  searchQuery, 
  language, 
  onNavigateBack,
  interactionId 
}: InteractionDetailProps) {
  const content = {
    zh: {
      title: '互动详情',
      backButton: '返回',
      company: '公司：',
      visitDate: '拜访时间：',
      visitTarget: '拜访对象：',
      participants: '参与业务员：',
      visitPurpose: '拜访目的：',
      discussionContent: '交谈内容：',
      existingProblems: '存在问题：',
      nextSteps: '下一步计划：',
      otherInfo: '其它信息：',
      attachments: '附件：'
    },
    en: {
      title: 'Interaction Details',
      backButton: 'Back',
      company: 'Company:',
      visitDate: 'Visit Date:',
      visitTarget: 'Visit Target:',
      participants: 'Participants:',
      visitPurpose: 'Visit Purpose:',
      discussionContent: 'Discussion Content:',
      existingProblems: 'Existing Problems:',
      nextSteps: 'Next Steps:',
      otherInfo: 'Other Information:',
      attachments: 'Attachments:'
    }
  };

  const t = content[language];

  // 模拟详情数据 - 实际项目中应该根据interactionId从API获取
  const detailData = {
    zh: {
      title: '拜访BYD欧洲分公司',
      company: 'BYD',
      visitDate: '2025-09-12',
      visitTarget: '欧洲分公司总经理',
      participants: '赵六钱七',
      visitPurpose: '推进欧洲市场合作',
      discussionContent: '讨论欧洲市场合作细节',
      existingProblems: '政策壁垒需突破',
      nextSteps: '与法务团队沟通政策细节',
      otherInfo: '',
      attachments: ''
    },
    en: {
      title: 'Visit BYD Europe Branch',
      company: 'BYD',
      visitDate: '2025-09-12',
      visitTarget: 'Europe Branch General Manager',
      participants: 'Zhao Liu Qian Qi',
      visitPurpose: 'Promote Europe Market Cooperation',
      discussionContent: 'Discuss Europe market cooperation details',
      existingProblems: 'Policy barriers need breakthrough',
      nextSteps: 'Communicate policy details with legal team',
      otherInfo: '',
      attachments: ''
    }
  };

  const data = detailData[language];

  return (
    <div className="pt-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigateBack('interactions')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.backButton}</span>
        </Button>
      </div>

      {/* Main Content */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-xl font-medium text-gray-900">
            {data.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-3 font-medium text-gray-700">{t.company}</span>
                <span className="col-span-9 text-gray-900">{data.company}</span>
              </div>
              
              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-3 font-medium text-gray-700">{t.visitDate}</span>
                <span className="col-span-9 text-gray-900">{data.visitDate}</span>
              </div>
              
              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-3 font-medium text-gray-700">{t.visitTarget}</span>
                <span className="col-span-9 text-gray-900">{data.visitTarget}</span>
              </div>
              
              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-3 font-medium text-gray-700">{t.participants}</span>
                <span className="col-span-9 text-gray-900">{data.participants}</span>
              </div>
              
              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-3 font-medium text-gray-700">{t.visitPurpose}</span>
                <span className="col-span-9 text-gray-900">{data.visitPurpose}</span>
              </div>
              
              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-3 font-medium text-gray-700">{t.discussionContent}</span>
                <span className="col-span-9 text-gray-900">{data.discussionContent}</span>
              </div>
              
              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-3 font-medium text-gray-700">{t.existingProblems}</span>
                <span className="col-span-9 text-gray-900">{data.existingProblems}</span>
              </div>
              
              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-3 font-medium text-gray-700">{t.nextSteps}</span>
                <span className="col-span-9 text-gray-900">{data.nextSteps}</span>
              </div>
              
              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-3 font-medium text-gray-700">{t.otherInfo}</span>
                <span className="col-span-9 text-gray-900">{data.otherInfo || ''}</span>
              </div>
              
              <div className="grid grid-cols-12 gap-4">
                <span className="col-span-3 font-medium text-gray-700">{t.attachments}</span>
                <span className="col-span-9 text-gray-900">{data.attachments || ''}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}