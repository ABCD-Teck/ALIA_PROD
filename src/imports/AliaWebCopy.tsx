function Heading1() {
  return (
    <div className="absolute h-[48px] left-0 top-0 w-[528.5px]" data-name="Heading 1">
      <p className="absolute font-['Inter:Bold',_'Noto_Sans_SC:Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-bold leading-[48px] left-0 not-italic text-[#101828] text-[48px] text-nowrap top-[0.5px] tracking-[0.3516px] whitespace-pre">欢迎使用</p>
    </div>
  );
}

function Text() {
  return (
    <div className="absolute content-stretch flex h-[29.5px] items-start left-0 top-[0.5px] w-[17.445px]" data-name="Text">
      <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[31.2px] not-italic relative shrink-0 text-[#009699] text-[24px] text-nowrap tracking-[-0.48px] whitespace-pre">A</p>
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute content-stretch flex h-[29.5px] items-start left-[17.45px] top-[0.5px] w-[25.516px]" data-name="Text">
      <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[31.2px] not-italic relative shrink-0 text-[24px] text-black text-nowrap tracking-[-0.48px] whitespace-pre">lia</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute h-[31.195px] left-0 top-[56px] w-[42.961px]" data-name="Text">
      <Text />
      <Text1 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute h-[32px] left-0 top-[95.19px] w-[528.5px]" data-name="Heading 2">
      <p className="absolute font-['Inter:Medium',_'Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[32px] left-0 not-italic text-[#4a5565] text-[24px] text-nowrap top-0 tracking-[0.0703px] whitespace-pre">智能CRM管理平台</p>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[127.195px] relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Text2 />
      <Heading2 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[58.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_'Noto_Sans_JP:Regular',_'Noto_Sans_SC:Regular',_sans-serif] font-normal leading-[29.25px] left-0 not-italic text-[#4a5565] text-[18px] top-[0.5px] tracking-[-0.4395px] w-[512px]">通过Alia，轻松管理客户关系，洞察市场趋势，提升业务效率。专为现代企业打造的一体化客户管理解决方案。</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[201.695px] items-start relative shrink-0 w-full" data-name="Container">
      <Container />
      <Paragraph />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#009699] h-[54px] relative rounded-[8px] shrink-0 w-[98.484px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[54px] items-center justify-center px-[32px] py-[12px] relative w-[98.484px]">
        <p className="font-['Inter:Medium',_'Noto_Sans_JP:Medium',_'Noto_Sans_SC:Medium',_sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[18px] text-nowrap text-white tracking-[-0.4395px] whitespace-pre">登录</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white h-[54px] relative rounded-[8px] shrink-0 w-[134.961px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#009699] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[54px] items-center justify-center px-[33px] py-[13px] relative w-[134.961px]">
        <p className="font-['Inter:Medium',_'Noto_Sans_JP:Medium',_'Noto_Sans_SC:Medium',_sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[#009699] text-[18px] text-nowrap tracking-[-0.4395px] whitespace-pre">注册账户</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex gap-[16px] h-[54px] items-start relative shrink-0 w-full" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Semi_Bold',_'Noto_Sans_SC:Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[32px] left-0 not-italic text-[#101828] text-[24px] text-nowrap top-0 tracking-[0.0703px] whitespace-pre">为什么选择Alia？</p>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="LandingPage">
      <p className="absolute font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_'Noto_Sans_SC:Bold',_sans-serif] font-semibold leading-[24px] left-0 not-italic text-[#101828] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">客户洞察</p>
    </div>
  );
}

function LandingPage1() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="LandingPage">
      <p className="absolute font-['Inter:Regular',_'Noto_Sans_JP:Regular',_'Noto_Sans_SC:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[215px]">深度分析客户数据，获取有价值的商业洞察</p>
    </div>
  );
}

function CardContent() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[247.25px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-full items-start pb-0 pt-[16px] px-[16px] relative w-[247.25px]">
        <LandingPage />
        <LandingPage1 />
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="[grid-area:1_/_1] bg-white box-border content-stretch flex flex-col items-start pl-[4px] pr-px py-px relative rounded-[14px] shrink-0" data-name="Card">
      <div aria-hidden="true" className="absolute border-[#009699] border-[1px_1px_1px_4px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <CardContent />
    </div>
  );
}

function LandingPage2() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="LandingPage">
      <p className="absolute font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_'Noto_Sans_SC:Bold',_sans-serif] font-semibold leading-[24px] left-0 not-italic text-[#101828] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">市场分析</p>
    </div>
  );
}

function LandingPage3() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="LandingPage">
      <p className="absolute font-['Inter:Regular',_'Noto_Sans_JP:Regular',_'Noto_Sans_SC:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">实时市场趋势分析，把握商机先机</p>
    </div>
  );
}

function CardContent1() {
  return (
    <div className="h-[92px] relative shrink-0 w-[247.25px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[92px] items-start pb-0 pt-[16px] px-[16px] relative w-[247.25px]">
        <LandingPage2 />
        <LandingPage3 />
      </div>
    </div>
  );
}

function Card1() {
  return (
    <div className="[grid-area:1_/_2] bg-white box-border content-stretch flex flex-col items-start pl-[4px] pr-px py-px relative rounded-[14px] shrink-0" data-name="Card">
      <div aria-hidden="true" className="absolute border-[#009699] border-[1px_1px_1px_4px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <CardContent1 />
    </div>
  );
}

function LandingPage4() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="LandingPage">
      <p className="absolute font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_'Noto_Sans_SC:Bold',_sans-serif] font-semibold leading-[24px] left-0 not-italic text-[#101828] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">高效协作</p>
    </div>
  );
}

function LandingPage5() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="LandingPage">
      <p className="absolute font-['Inter:Regular',_'Noto_Sans_JP:Regular',_'Noto_Sans_SC:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">团队协作工具，提升工作效率</p>
    </div>
  );
}

function CardContent2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[247.25px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-full items-start pb-0 pt-[16px] px-[16px] relative w-[247.25px]">
        <LandingPage4 />
        <LandingPage5 />
      </div>
    </div>
  );
}

function Card2() {
  return (
    <div className="[grid-area:2_/_1] bg-white box-border content-stretch flex flex-col items-start pl-[4px] pr-px py-px relative rounded-[14px] shrink-0" data-name="Card">
      <div aria-hidden="true" className="absolute border-[#009699] border-[1px_1px_1px_4px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <CardContent2 />
    </div>
  );
}

function LandingPage6() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="LandingPage">
      <p className="absolute font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[24px] left-0 not-italic text-[#101828] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">智能化管理</p>
    </div>
  );
}

function LandingPage7() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="LandingPage">
      <p className="absolute font-['Inter:Regular',_'Noto_Sans_JP:Regular',_'Noto_Sans_SC:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">AI驱动的智能化客户关系管理</p>
    </div>
  );
}

function CardContent3() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[247.25px]" data-name="CardContent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-full items-start pb-0 pt-[16px] px-[16px] relative w-[247.25px]">
        <LandingPage6 />
        <LandingPage7 />
      </div>
    </div>
  );
}

function Card3() {
  return (
    <div className="[grid-area:2_/_2] bg-white box-border content-stretch flex flex-col items-start pl-[4px] pr-px py-px relative rounded-[14px] shrink-0" data-name="Card">
      <div aria-hidden="true" className="absolute border-[#009699] border-[1px_1px_1px_4px] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <CardContent3 />
    </div>
  );
}

function Container3() {
  return (
    <div className="gap-[24px] grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[114px_minmax(0px,_1fr)] h-[232px] relative shrink-0 w-full" data-name="Container">
      <Card />
      <Card1 />
      <Card2 />
      <Card3 />
    </div>
  );
}

function Container4() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[24px] h-[320px] items-start pb-0 pt-[32px] px-0 relative shrink-0 w-full" data-name="Container">
      <Heading3 />
      <Container3 />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[32px] h-[639.695px] items-start left-0 top-0 w-[528.5px]" data-name="Container">
      <Container1 />
      <Container2 />
      <Container4 />
    </div>
  );
}

function Text3() {
  return (
    <div className="absolute content-stretch flex h-[29.5px] items-start left-[202.52px] top-[0.5px] w-[17.445px]" data-name="Text">
      <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[31.2px] not-italic relative shrink-0 text-[#009699] text-[24px] text-center text-nowrap tracking-[-0.48px] whitespace-pre">A</p>
    </div>
  );
}

function Text4() {
  return (
    <div className="absolute content-stretch flex h-[29.5px] items-start left-[219.96px] top-[0.5px] w-[25.516px]" data-name="Text">
      <p className="font-['Inter:Bold',_sans-serif] font-bold leading-[31.2px] not-italic relative shrink-0 text-[24px] text-black text-center text-nowrap tracking-[-0.48px] whitespace-pre">lia</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[31.195px] relative shrink-0 w-full" data-name="Container">
      <Text3 />
      <Text4 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[24px] left-[223.51px] not-italic text-[#4a5565] text-[16px] text-center text-nowrap top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%] whitespace-pre">智能CRM管理平台</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[63.195px] items-start relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <Paragraph1 />
    </div>
  );
}

function Container8() {
  return <div className="bg-gradient-to-b from-[#009699] h-[16px] rounded-[1.67772e+07px] shrink-0 to-[#00b3a6] w-full" data-name="Container" />;
}

function Container9() {
  return (
    <div className="bg-gray-200 h-[16px] relative rounded-[1.67772e+07px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col h-[16px] items-start pl-0 pr-[112px] py-0 relative w-full">
          <Container8 />
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-gray-200 h-[12px] relative rounded-[4px] shrink-0 w-[149.328px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[12px] w-[149.328px]" />
    </div>
  );
}

function Container11() {
  return (
    <div className="bg-gray-200 h-[12px] relative rounded-[4px] shrink-0 w-[112px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[12px] w-[112px]" />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex h-[12px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container10 />
      <Container11 />
    </div>
  );
}

function Container13() {
  return (
    <div className="bg-gray-200 h-[12px] relative rounded-[4px] shrink-0 w-[224px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[12px] w-[224px]" />
    </div>
  );
}

function Container14() {
  return (
    <div className="bg-gray-200 h-[12px] relative rounded-[4px] shrink-0 w-[89.594px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[12px] w-[89.594px]" />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex h-[12px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Container14 />
    </div>
  );
}

function Container16() {
  return (
    <div className="bg-gray-200 h-[12px] relative rounded-[4px] shrink-0 w-[179.195px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[12px] w-[179.195px]" />
    </div>
  );
}

function Container17() {
  return (
    <div className="bg-gray-200 h-[12px] relative rounded-[4px] shrink-0 w-[149.328px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[12px] w-[149.328px]" />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex h-[12px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container16 />
      <Container17 />
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] h-[60px] items-start relative shrink-0 w-full" data-name="Container">
      <Container12 />
      <Container15 />
      <Container18 />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[92px] items-start relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Container19 />
    </div>
  );
}

function Container21() {
  return <div className="[grid-area:1_/_1] rounded-[10px] shrink-0" data-name="Container" />;
}

function Container22() {
  return <div className="[grid-area:1_/_2] rounded-[10px] shrink-0" data-name="Container" />;
}

function Container23() {
  return <div className="[grid-area:2_/_1] rounded-[10px] shrink-0" data-name="Container" />;
}

function Container24() {
  return <div className="[grid-area:2_/_2] rounded-[10px] shrink-0" data-name="Container" />;
}

function Container25() {
  return (
    <div className="gap-[16px] grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[repeat(2,_minmax(0px,_1fr))] h-[144px] relative shrink-0 w-full" data-name="Container">
      <Container21 />
      <Container22 />
      <Container23 />
      <Container24 />
    </div>
  );
}

function LandingPage8() {
  return (
    <div className="h-[347.195px] relative shrink-0 w-[448px]" data-name="LandingPage">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[24px] h-[347.195px] items-start relative w-[448px]">
        <Container7 />
        <Container20 />
        <Container25 />
      </div>
    </div>
  );
}

function Card4() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[403.195px] items-start left-[584.75px] pb-0 pl-[32px] pr-0 pt-[32px] rounded-[14px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] top-[118.25px] w-[512px]" data-name="Card">
      <LandingPage8 />
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[639.695px] relative shrink-0 w-[1105px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[639.695px] relative w-[1105px]">
        <Container5 />
        <Card4 />
      </div>
    </div>
  );
}

export default function AliaWebCopy() {
  return (
    <div className="content-stretch flex items-center justify-center relative size-full" data-name="Alia Web (Copy)" style={{ backgroundImage: "linear-gradient(142.961deg, rgb(249, 250, 251) 0%, rgb(243, 244, 246) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Container26 />
    </div>
  );
}