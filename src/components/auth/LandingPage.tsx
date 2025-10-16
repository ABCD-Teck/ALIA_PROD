import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Language } from '../../App';

interface LandingPageProps {
  language: Language;
  onSignUp: () => void;
  onSignIn: () => void;
  onLanguageChange: (language: Language) => void;
}

function Heading1({ language }: { language: Language }) {
  return (
    <div className="text-center" data-name="Heading 1">
      <h1 className="font-['Inter:Bold',_'Noto_Sans_SC:Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-bold leading-[48px] not-italic text-[#101828] text-[48px] tracking-[0.3516px] inline">
        {language === 'zh' ? '欢迎使用 ' : 'Welcome to '}
        <span className="text-[#009699]">A</span>
        <span className="text-black">lia</span>
      </h1>
    </div>
  );
}

function Heading2({ language }: { language: Language }) {
  return (
    <div className="text-center mt-6" data-name="Heading 2">
      <p className="font-['Inter:Medium',_'Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[32px] not-italic text-[#4a5565] text-[24px] tracking-[0.0703px]">
        {language === 'zh' ? '智能CRM管理平台' : 'Intelligent CRM Platform'}
      </p>
    </div>
  );
}

function Container({ language }: { language: Language }) {
  return (
    <div className="flex flex-col items-center" data-name="Container">
      <Heading1 language={language} />
      <Heading2 language={language} />
    </div>
  );
}

function Paragraph({ language }: { language: Language }) {
  return (
    <div className="text-center mt-4" data-name="Paragraph">
      <p className="font-['Inter:Regular',_'Noto_Sans_JP:Regular',_'Noto_Sans_SC:Regular',_sans-serif] font-normal leading-[29.25px] not-italic text-[#4a5565] text-[18px] tracking-[-0.4395px] max-w-[512px] mx-auto">
        {language === 'zh' 
          ? '通过Alia，轻松管理客户关系，洞察市场趋势，提升业务效率。专为现代企业打造的一体化客户管理解决方案。'
          : 'With Alia, easily manage customer relationships, gain market insights, and boost business efficiency. An integrated customer management solution designed for modern enterprises.'
        }
      </p>
    </div>
  );
}

function Container1({ language }: { language: Language }) {
  return (
    <div className="flex flex-col items-center" data-name="Container">
      <Container language={language} />
      <Paragraph language={language} />
    </div>
  );
}

function LoginButton({ language, onClick }: { language: Language; onClick: () => void }) {
  return (
    <div className="bg-[#009699] h-[54px] relative rounded-[8px] shrink-0 w-[98.484px] cursor-pointer" data-name="Button" onClick={onClick}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[54px] items-center justify-center px-[32px] py-[12px] relative w-[98.484px]">
        <p className="font-['Inter:Medium',_'Noto_Sans_JP:Medium',_'Noto_Sans_SC:Medium',_sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[18px] text-nowrap text-white tracking-[-0.4395px] whitespace-pre">
          {language === 'zh' ? '登录' : 'Sign In'}
        </p>
      </div>
    </div>
  );
}

function SignUpButton({ language, onClick }: { language: Language; onClick: () => void }) {
  return (
    <div className="bg-white h-[54px] relative rounded-[8px] shrink-0 w-[134.961px] cursor-pointer" data-name="Button" onClick={onClick}>
      <div aria-hidden="true" className="absolute border border-[#009699] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[54px] items-center justify-center px-[33px] py-[13px] relative w-[134.961px]">
        <p className="font-['Inter:Medium',_'Noto_Sans_JP:Medium',_'Noto_Sans_SC:Medium',_sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[#009699] text-[18px] text-nowrap tracking-[-0.4395px] whitespace-pre">
          {language === 'zh' ? '注册账户' : 'Sign Up'}
        </p>
      </div>
    </div>
  );
}

function Container2({ language, onSignIn, onSignUp }: { language: Language; onSignIn: () => void; onSignUp: () => void }) {
  return (
    <div className="flex gap-[16px] items-center justify-center mt-8" data-name="Container">
      <LoginButton language={language} onClick={onSignIn} />
      <SignUpButton language={language} onClick={onSignUp} />
    </div>
  );
}

function Heading3({ language }: { language: Language }) {
  return (
    <div className="text-center" data-name="Heading 3">
      <h3 className="font-['Inter:Semi_Bold',_'Noto_Sans_SC:Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[32px] not-italic text-[#101828] text-[24px] tracking-[0.0703px]">
        {language === 'zh' ? '为什么选择Alia？' : 'Why Choose Alia?'}
      </h3>
    </div>
  );
}

function FeatureCard({ 
  title, 
  description, 
  position 
}: { 
  title: string; 
  description: string; 
  position: string;
}) {
  return (
    <div className={`${position} bg-white box-border content-stretch flex flex-col items-start pl-[4px] pr-px py-px relative rounded-[14px] shrink-0`} data-name="Card">
      <div aria-hidden="true" className="absolute border-[#009699] border-[1px_1px_1px_4px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[247.25px]" data-name="CardContent">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-full items-start pb-0 pt-[16px] px-[16px] relative w-[247.25px]">
          <div className="h-[24px] relative shrink-0 w-full" data-name="LandingPage">
            <p className="absolute font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_'Noto_Sans_SC:Bold',_sans-serif] font-semibold leading-[24px] left-0 not-italic text-[#101828] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">
              {title}
            </p>
          </div>
          <div className="h-[40px] relative shrink-0 w-full" data-name="LandingPage">
            <p className="absolute font-['Inter:Regular',_'Noto_Sans_JP:Regular',_'Noto_Sans_SC:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[215px]">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container3({ language }: { language: Language }) {
  const features = {
    zh: [
      { title: '客户洞察', description: '深度分析客户数据，获取有价值的商业洞察' },
      { title: '市场分析', description: '实时市场趋势分析，把握商机先机' },
      { title: '高效协作', description: '团队协作工具，提升工作效率' },
      { title: '智能化管理', description: 'AI驱动的智能化客户关系管理' }
    ],
    en: [
      { title: 'Customer Insights', description: 'Deep analysis of customer data for valuable business insights' },
      { title: 'Market Analysis', description: 'Real-time market trend analysis, seize opportunities first' },
      { title: 'Efficient Collaboration', description: 'Team collaboration tools to improve work efficiency' },
      { title: 'Intelligent Management', description: 'AI-driven intelligent customer relationship management' }
    ]
  };

  const currentFeatures = features[language];
  const positions = ['[grid-area:1_/_1]', '[grid-area:1_/_2]', '[grid-area:2_/_1]', '[grid-area:2_/_2]'];

  return (
    <div className="gap-[24px] grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[114px_minmax(0px,_1fr)] h-[232px] max-w-[528px] mx-auto" data-name="Container">
      {currentFeatures.map((feature, index) => (
        <FeatureCard
          key={index}
          title={feature.title}
          description={feature.description}
          position={positions[index]}
        />
      ))}
    </div>
  );
}

function Container4({ language }: { language: Language }) {
  return (
    <div className="flex flex-col items-center gap-[24px] pt-[32px]" data-name="Container">
      <Heading3 language={language} />
      <Container3 language={language} />
    </div>
  );
}

function Container5({ language, onSignIn, onSignUp }: { language: Language; onSignIn: () => void; onSignUp: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-[32px] max-w-[600px] mx-auto px-6" data-name="Container">
      <Container1 language={language} />
      <Container2 language={language} onSignIn={onSignIn} onSignUp={onSignUp} />
      <Container4 language={language} />
    </div>
  );
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  language, 
  onSignUp, 
  onSignIn, 
  onLanguageChange 
}) => {
  return (
    <div className="min-h-screen" style={{ backgroundImage: "linear-gradient(142.961deg, rgb(249, 250, 251) 0%, rgb(243, 244, 246) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      {/* Language Selector */}
      <div className="absolute top-6 right-6 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
              <Globe className="h-4 w-4" />
              {language === 'zh' ? '中文' : 'English'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onLanguageChange('zh')}>
              中文
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLanguageChange('en')}>
              English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content */}
      <div className="content-stretch flex items-center justify-center relative size-full min-h-screen" data-name="Alia Web (Copy)">
        <Container5 language={language} onSignIn={onSignIn} onSignUp={onSignUp} />
      </div>
    </div>
  );
};