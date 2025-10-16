import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Heart,
  Share2,
  Bookmark,
  Clock,
  Building,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { Language } from '../../App';
import { marketInsightsApi, translationApi } from '../../services/api';
import { ArticleModal } from './ArticleModal';

interface MarketInsightsProps {
  searchQuery: string;
  language: Language;
}

// 日报数据
// 四级标签系统 - Now dynamically loaded from API
const defaultTagHierarchy = {
  // 第一级：主要类别 - Will be replaced with dynamic buckets
  level1: [
    { id: 'all', label_zh: '全部', label_en: 'All' },
    { id: 'Macro & Central Banks', label_zh: '宏观经济与央行', label_en: 'Macro & Central Banks' },
    { id: 'Banking & Regulation', label_zh: '银行与监管', label_en: 'Banking & Regulation' },
    { id: 'Markets', label_zh: '市场', label_en: 'Markets' },
    { id: 'Economic Indicators', label_zh: '经济指标', label_en: 'Economic Indicators' },
    { id: 'M&A / IPO / Financing', label_zh: '并购/IPO/融资', label_en: 'M&A / IPO / Financing' },
    { id: 'Fintech & Payments', label_zh: '金融科技与支付', label_en: 'Fintech & Payments' },
    { id: 'Consumer Finance & Housing', label_zh: '消费金融与房产', label_en: 'Consumer Finance & Housing' },
    { id: 'Cybersecurity & Digital Risk', label_zh: '网络安全与数字风险', label_en: 'Cybersecurity & Digital Risk' },
    { id: 'Tech, AI & Data Policy', label_zh: '科技、AI与数据政策', label_en: 'Tech, AI & Data Policy' },
    { id: 'ESG & Sustainability', label_zh: 'ESG与可持续发展', label_en: 'ESG & Sustainability' },
    { id: 'Social Security & Welfare', label_zh: '社会保障与福利', label_en: 'Social Security & Welfare' },
    { id: 'Geopolitics & Trade', label_zh: '地缘政治与贸易', label_en: 'Geopolitics & Trade' },
    { id: 'Rural & Agri / Utilities', label_zh: '农村农业/公用事业', label_en: 'Rural & Agri / Utilities' }
  ],

  // 第二级：子类别
  level2: {
    macro: [
      { id: 'all', label_zh: '全部', label_en: 'All' },
      { id: 'employment', label_zh: '就业', label_en: 'Employment' },
      { id: 'inflation', label_zh: '通货膨胀', label_en: 'Inflation' },
      { id: 'investment', label_zh: '投资', label_en: 'Investment' },
      { id: 'consumption', label_zh: '消费', label_en: 'Consumption' },
      { id: 'export', label_zh: '出口', label_en: 'Export' },
      { id: 'regulation', label_zh: '监管', label_en: 'Regulation' },
      { id: 'stock', label_zh: '股市', label_en: 'Stock Market' },
      { id: 'growth', label_zh: '增长', label_en: 'Growth' },
      { id: 'other_macro', label_zh: '其它', label_en: 'Others' }
    ],
    industry: [
      { id: 'all', label_zh: '全部', label_en: 'All' },
      { id: 'technology', label_zh: '科技', label_en: 'Technology' },
      { id: 'finance', label_zh: '金融', label_en: 'Finance' },
      { id: 'energy', label_zh: '能源', label_en: 'Energy' },
      { id: 'healthcare', label_zh: '医疗', label_en: 'Healthcare' },
      { id: 'manufacturing', label_zh: '制造业', label_en: 'Manufacturing' },
      { id: 'retail', label_zh: '零售', label_en: 'Retail' },
      { id: 'other_industry', label_zh: '其它', label_en: 'Others' }
    ],
    politics: [
      { id: 'all', label_zh: '全部', label_en: 'All' },
      { id: 'domestic', label_zh: '国内政治', label_en: 'Domestic Politics' },
      { id: 'international', label_zh: '国际关系', label_en: 'International Relations' },
      { id: 'policy', label_zh: '政策', label_en: 'Policy' },
      { id: 'election', label_zh: '选举', label_en: 'Election' },
      { id: 'other_politics', label_zh: '其它', label_en: 'Others' }
    ],
    society: [
      { id: 'all', label_zh: '全部', label_en: 'All' },
      { id: 'education', label_zh: '教育', label_en: 'Education' },
      { id: 'culture', label_zh: '文化', label_en: 'Culture' },
      { id: 'environment', label_zh: '环境', label_en: 'Environment' },
      { id: 'social_issues', label_zh: '社会问题', label_en: 'Social Issues' },
      { id: 'other_society', label_zh: '其它', label_en: 'Others' }
    ],
    conflict: [
      { id: 'all', label_zh: '全部', label_en: 'All' },
      { id: 'military', label_zh: '军事', label_en: 'Military' },
      { id: 'regional', label_zh: '地区冲突', label_en: 'Regional Conflict' },
      { id: 'sanctions', label_zh: '制裁', label_en: 'Sanctions' },
      { id: 'diplomatic', label_zh: '外交', label_en: 'Diplomatic' },
      { id: 'other_conflict', label_zh: '其它', label_en: 'Others' }
    ],
    commodities: [
      { id: 'all', label_zh: '全部', label_en: 'All' },
      { id: 'oil', label_zh: '石油', label_en: 'Oil' },
      { id: 'gold', label_zh: '黄金', label_en: 'Gold' },
      { id: 'agriculture', label_zh: '农产品', label_en: 'Agriculture' },
      { id: 'metals', label_zh: '金属', label_en: 'Metals' },
      { id: 'other_commodities', label_zh: '其它', label_en: 'Others' }
    ]
  },

  // 第三级：地区/范围 - Updated to match database schema
  level3: [
    { id: 'all', label_zh: '全部地区', label_en: 'All Regions' },
    { id: 'Global', label_zh: '全球', label_en: 'Global' },
    { id: 'APAC', label_zh: '亚太地区', label_en: 'APAC' },
    { id: 'EMEA', label_zh: '欧洲/中东/非洲', label_en: 'EMEA' },
    { id: 'Americas', label_zh: '美洲', label_en: 'Americas' },
    { id: 'Eastern Europe', label_zh: '东欧', label_en: 'Eastern Europe' }
  ]
};

// Time frame options
const timeFrameOptions = [
  { id: 'all', label_zh: '全部时间', label_en: 'All Time' },
  { id: '1d', label_zh: '今天', label_en: 'Today' },
  { id: '3d', label_zh: '3天内', label_en: 'Last 3 Days' },
  { id: '7d', label_zh: '一周内', label_en: 'Last Week' },
  { id: '30d', label_zh: '一月内', label_en: 'Last Month' },
  { id: '90d', label_zh: '三月内', label_en: 'Last 3 Months' }
];

const dailyReportNews = [
  {
    id: '1',
    category: 'macro',
    title_zh: '英格兰银行行长：贸易分裂将拖累全球经济',
    title_en: 'Bank of England Governor: Trade Fragmentation Will Drag Down Global Economy',
    content_zh: '英格兰银行行长安德鲁·贝利（ANDREW BAILEY）在布鲁塞尔的一个智库会议上警告称，全球贸易的紧张关系可能将对世界经济增长产生负面影响。他指出，贸易分裂对全球增长是有害的。英格兰银行本月早些时候将英国今年的经济增长预测下调至0.7%，原因包括美国对英国商品可能征收的关税以及特朗普当选更具攻击性的贸易政策带来的不确定性。特别是对本国商业制造业的贸易政策来说的不确定性。',
    content_en: 'Bank of England Governor Andrew Bailey warned at a think tank meeting in Brussels that global trade tensions could have a negative impact on world economic growth. He pointed out that trade fragmentation is harmful to global growth. The Bank of England downgraded its economic growth forecast for the UK this year to 0.7% earlier this month, citing uncertainty from potential US tariffs on UK goods and Trump\'s more aggressive trade policies.',
    source_zh: '华尔街日报',
    source_en: 'Wall Street Journal',
    publishTime: '2025-02-19 10:41:00',
    likes: 10,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '2',
    category: 'macro',
    title_zh: '澳大利亚储备银行自2020年以来首次降息，加入全球宽松潮流',
    title_en: 'Reserve Bank of Australia Cuts Interest Rates for First Time Since 2020, Joins Global Easing Trend',
    content_zh: '澳大利亚储备银行（RBA）于2025年2月18日宣布将官方现金利率下调25个基点至4.10%，这是自2020年以来的首次降息。标志着其加入全球央行的宽松阵营。RBA行长米歇尔·布洛克（MICHELE BULLOCK）表示，尽管通胀有所缓解，但美国经济的可能性，以及整体经济的整体影响可能仍然。他指出经济复苏已经显示出缓慢的迹象，通胀压力的目标下降、劳动力市场整体上减少了的紧张状况，RBA对整体经济显著影响的预测下降约912亿元（约7元），尽管林业资源可控，全球经济中通胀预期虽然有一定程度的改善。',
    content_en: 'The Reserve Bank of Australia (RBA) announced on February 18, 2025, a 25 basis point cut to the official cash rate to 4.10%, the first rate cut since 2020, marking its entry into the global central bank easing camp. RBA Governor Michele Bullock indicated that while inflation has eased, economic recovery has shown slow signs with controlled inflation expectations and reduced labor market tensions.',
    source_zh: '华尔街日报',
    source_en: 'Wall Street Journal',
    publishTime: '2025-02-19 05:59:00',
    likes: 10,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '3',
    category: 'macro',
    title_zh: '新西兰储备银行进一步降息，警告全球贸易风险',
    title_en: 'Reserve Bank of New Zealand Cuts Rates Further, Warns of Global Trade Risks',
    content_zh: '新西兰储备银行（RBNZ）于周三将官方现金利率（OCR）下调50个基点至3.75%，继续推进减息的努力，并警告国际贸易威胁局势、全球增长放缓及地缘政治冲突等风险出现恶化趋势。自去年8月以来，RBNZ已累计降息125个基点，经济增长持续低迷、住房市场逐步回暖，但通胀水平料保持上升。但通胀威胁面临着地缘政治的不确定性可能的持续高企，RBNZ认为有可能进一步降息的空间，但委员会经过充分考量，认为有利于中期内维持价格稳定的可能性较好。',
    content_en: 'The Reserve Bank of New Zealand (RBNZ) cut the official cash rate (OCR) by 50 basis points to 3.75% on Wednesday, continuing its easing efforts while warning of deteriorating risks including international trade threats, global growth slowdown, and geopolitical conflicts. Since August last year, RBNZ has cut rates by a cumulative 125 basis points, with economic growth remaining subdued and housing market gradually recovering, but inflation levels expected to remain elevated.',
    source_zh: '华尔街日报',
    source_en: 'Wall Street Journal',
    publishTime: '2025-02-19 01:29:00',
    likes: 10,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '4',
    category: 'industry',
    title_zh: '韩国动员数十亿支持芯片产业应对美国压力',
    title_en: 'South Korea Mobilizes Billions to Support Chip Industry Against US Pressure',
    content_zh: '三星电子资本支出JAIHYUK SONG在昨外半导体体（SEMICON）上表示，全球半导体产业面临来自美国的贸易压力。特别是对于芯片对美芯片出口将减少25%关税，韩国对此高度重视，决定推出360亿韩元（约240亿欧元）的紧急支持计划。该计划在有利的小型和中型企业的产品转移到制造。韩国半导体协会表示，该政策基本上是为了防范40亿美元，运营汽车产业。政府还计划在14个国家（包括有利的国际）设立专门外事，以减少对美国和中国的依赖。与此同时，三星USK HYNIX等企业对美国的投资都将不允许，因为特别政府对有美的计划显示不满。',
    content_en: 'Samsung Electronics capital expenditure JAIHYUK SONG stated at the semiconductor conference (SEMICON) that the global semiconductor industry faces trade pressure from the United States. Particularly regarding chip export restrictions to the US with 25% tariffs, South Korea attaches great importance and decided to launch a 36 billion won (about 24 billion euros) emergency support plan. The plan focuses on facilitating small and medium enterprises\' product transitions to manufacturing.',
    source_zh: '亚洲半导体',
    source_en: 'Asia Semiconductor',
    publishTime: '2025-02-19 18:34:30',
    likes: 10,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '8',
    category: 'industry',
    title_zh: '阿里巴巴1100亿美元的AI乐观情绪面临盈利考验',
    title_en: 'Alibaba\'s $110 Billion AI Optimism Faces Profitability Test',
    content_zh: '阿里巴巴集团控股有限公司将在周四的财报发布中面临关键考验，因为投资的DEEPSEEK的排名册上表明1100亿美元。自1月以来，阿里巴巴在人工智能领域，创始人马云与高层的关照，以及与宇宙公司合作的情况下，提升几乎上涨了60%。尽管面临监管的担忧，投资者对财报反应的第一时间，投资者对AI将帮助收入60%，分析师预测，阿里巴巴在12月的销最额期比65.5%，净利润继续保持16.6%。特别关注它业务，行计具新业务收入大增长9.7%。投资者大增整制到阿里巴巴的同时AI需求大优先，并应对求来自百度、腾讯、华为等等对手的压力。',
    content_en: 'Alibaba Group Holding will face a key test in Thursday\'s earnings report, as investment in DEEPSEEK shows $110 billion. Since January, Alibaba has risen nearly 60% in the AI field with support from founder Jack Ma and senior management, and cooperation with universe companies. Despite regulatory concerns, investors expect AI to help revenue grow 60%, with analysts predicting Alibaba\'s December sales growth of 65.5% and continued net profit growth of 16.6%.',
    source_zh: '彭博社',
    source_en: 'Bloomberg',
    publishTime: '2025-02-19 15:00:00',
    likes: 10,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '9',
    category: 'industry',
    title_zh: 'DEEPSEEK 被指与字节跳动共享用户数据',
    title_en: 'DEEPSEEK Accused of Sharing User Data with ByteDance',
    content_zh: '韩国报告中的人工上智能初创公司DEEPSEEK与TIKTOK母公司字节跳动共享用户数据。韩国数据保护监管机构确认DEEPSEEK与字节跳动有密亲系，并且数据保护问员，将在周末保护应用人员下降。DEEPSEEK在1月因新慢的商议生成式AI助引起市场震荡，导致英伟达市值大跌1.2万亿美元。英伟达个人信息保护委员会表示，尚未确认DEEPSEEK员工可司网络访问应用。韩国个人信息保护委员会表示，除了确认此DEEPSEEK员工字节跳动融更监督基础及其程度，批判有原办办，中国国家情报法允许中国政府收政府个人数据，美台呼吁台湾被出版政府关部分个人台湾个安全美国数据之前的2个新获时候。',
    content_en: 'Korean reports indicate that AI startup DEEPSEEK has shared user data with TikTok\'s parent company ByteDance. South Korean data protection regulators confirmed that DEEPSEEK has close ties with ByteDance, raising data protection concerns. DEEPSEEK caused market turmoil in January with its new AI assistant, leading to NVIDIA\'s market value dropping by $1.2 trillion. The Personal Information Protection Commission stated they have not yet confirmed DEEPSEEK staff\'s network access to applications.',
    source_zh: '亚洲IT工会',
    source_en: 'Asian IT Union',
    publishTime: '2025-02-19 11:40:23',
    likes: 10,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '5',
    category: 'commodities',
    title_zh: '国际油价连续三日上涨，布伦特原油突破85美元',
    title_en: 'Oil Prices Rise for Third Consecutive Day, Brent Crude Breaks $85',
    content_zh: '国际油价延续涨势，布伦特原油期货价格突破每桶85美元，创下近三个月来新高。分析师认为，地缘政治紧张局势和OPEC+减产措施是推动油价上涨的主要因素。',
    content_en: 'International oil prices continued their upward trend, with Brent crude futures breaking $85 per barrel, reaching a three-month high. Analysts believe geopolitical tensions and OPEC+ production cuts are the main factors driving oil price increases.',
    source_zh: '能源情报',
    source_en: 'Energy Intelligence',
    publishTime: '2025-02-19 14:20:00',
    likes: 15,
    isLiked: false,
    isBookmarked: true
  },
  {
    id: '6',
    category: 'politics',
    title_zh: '人工智能成为国家间的战场',
    title_en: 'Artificial Intelligence Becomes Battlefield Between Nations',
    content_zh: 'ELON MUSK发布GROK3 AI助手，标志着美国在AI领域的领导地位。与此同时，中国的DEEPSEEK在韩国市场的渗透引发了地缘政治紧张的关注。法国微软高管CHRISTOPHE AULNETTE指出，AI正成为各技术大竞争的焦点。美国国会议员JD VANCE认为美国在AI领导地位方面不可忽视，而欧盟委员会主席URSULA VON DER LEYEN则呼吁欧洲发展中立的AI技术。计划向南欧2000亿元新行资投。AI的竞争不仅是技术之争，更是国际间的政治竞争格局的重塑。',
    content_en: 'ELON MUSK released GROK3 AI assistant, marking US leadership in the AI field. Meanwhile, China\'s DEEPSEEK penetration in the Korean market has raised geopolitical tensions. French Microsoft executive CHRISTOPHE AULNETTE pointed out that AI is becoming a focal point of major technology competition. US Congressman JD VANCE believes US leadership in AI cannot be ignored, while EU Commission President URSULA VON DER LEYEN calls for Europe to develop neutral AI technology.',
    source_zh: '法国商业时报',
    source_en: 'French Business Times',
    publishTime: '2025-02-19 17:21:37',
    likes: 10,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '10',
    category: 'politics',
    title_zh: '拉夫罗夫称会谈 "非常有用" - 泽连斯基推进沙特之行',
    title_en: 'Lavrov Calls Talks "Very Useful" - Zelensky Advances Saudi Trip',
    content_zh: '俄罗斯外交部长拉夫罗夫近五年，美国新任国��卿马���·卢比奥（MARCO RUBIO）访问沙特，与俄罗斯外长拉夫罗夫（SERGEJ LAWROW）会谈。乌克兰联邦总统保护人办理健康布·哈罗夫计划与马克苏未来对乌克兰内的重要色，呼吁不应在乌克兰与后伺进行和谈的问题上妥协。乌克兰总统统总泽连斯基（VOLODYMYR ZELENSKYY）推荐了原定3月10日的沙特之行，批评俄罗斯参与的信息不负责沙。与此同时，土耳其总统埃尔���安（RECEP TAYYIP ERDOGAN）重申对乌克兰的支持，并表示愿意在土耳其更技术求来的相关谈判。',
    content_en: 'Russian Foreign Minister Lavrov, nearly five years later, US Secretary of State Marco Rubio visited Saudi Arabia and met with Russian Foreign Minister Sergej Lawrow. Ukrainian President Volodymyr Zelensky advanced his planned March 10 trip to Saudi Arabia, criticizing Russian participation as irresponsible. Meanwhile, Turkish President Recep Tayyip Erdogan reaffirmed support for Ukraine and expressed willingness to facilitate related negotiations in Turkey.',
    source_zh: '俄国世界报',
    source_en: 'Russian World News',
    publishTime: '2025-02-19 16:20:00',
    likes: 10,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '11',
    category: 'politics',
    title_zh: '普京呼吁俄美沙三方讨论全球能源市场',
    title_en: 'Putin Calls for Russia-US-Saudi Trilateral Discussion on Global Energy Market',
    content_zh: '俄罗斯总统表示，全球能源市场需要俄罗斯、美国和沙特阿拉伯之间的三方讨论。此言论是在半导体制裁时段发表的，旨在结果与克兰试验排针对俄罗斯会议发表的，旨在结合马克斯战略讨论全球能源市场。马克苏拉峰论现场沙特重要。上次重京与美国总裁特别周静和沙特国王保保帝的言话发生在近五年前，当时OPEC及其盟友在应对因间前冠病毒病情改变的石油需求下降面临生产削减的挑战。普京计划在未来几个月内召集韩国王储与土耳，感谢他们对美俄沙对话进度适应反对意见。',
    content_en: 'Russian President stated that the global energy market needs trilateral discussions between Russia, the United States, and Saudi Arabia. This statement was made during semiconductor sanctions period, aiming to combine strategic discussions on global energy markets. The last meeting between Putin, US President, and Saudi King occurred nearly five years ago, when OPEC and its allies faced production cut challenges amid declining oil demand due to the coronavirus pandemic.',
    source_zh: '多维社',
    source_en: 'Duowei News',
    publishTime: '2025-02-19 15:31:50',
    likes: 10,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '7',
    category: 'society',
    title_zh: '人工智能技术在医疗领域应用快速发展，监管框架待完善',
    title_en: 'AI Technology Applications in Healthcare Developing Rapidly, Regulatory Framework Needs Improvement',
    content_zh: '最新研究显示，人工智能在医疗诊断、药物研发等领域的应用正在快速发展。专家呼吁建立更完善的监管框架，确保AI技术安全有效地服务于公众健康。',
    content_en: 'Latest research shows that artificial intelligence applications in medical diagnosis and drug development are developing rapidly. Experts call for establishing a more comprehensive regulatory framework to ensure AI technology serves public health safely and effectively.',
    source_zh: '科技日报',
    source_en: 'Science Daily',
    publishTime: '2025-02-19 17:45:00',
    likes: 22,
    isLiked: true,
    isBookmarked: true
  },
  {
    id: '12',
    category: 'commodities',
    title_zh: '国际油价连续三日上涨，布伦特原油突破85美元',
    title_en: 'Oil Prices Rise for Third Consecutive Day, Brent Crude Breaks $85',
    content_zh: '国际油价延续涨势，布伦特原油期货价格突破每桶85美元，创下近三个月来新高。分析师认为，地缘政治紧张局势和OPEC+减产措施是推动油价上涨的主要因素。',
    content_en: 'International oil prices continued their upward trend, with Brent crude futures breaking $85 per barrel, reaching a three-month high. Analysts believe geopolitical tensions and OPEC+ production cuts are the main factors driving oil price increases.',
    source_zh: '能源情报',
    source_en: 'Energy Intelligence',
    publishTime: '2025-02-19 14:20:00',
    likes: 15,
    isLiked: false,
    isBookmarked: true
  }
];

// Mapping from Level 1 categories to MIA bucket names
const categoryToBucketMap: Record<string, string> = {
  'macro': 'Macro & Central Banks',
  'industry': 'Tech, AI & Data Policy',
  'politics': 'Geopolitics & Trade',
  'society': 'ESG & Sustainability',
  'conflict': 'Geopolitics & Trade',
  'commodities': 'Rural & Agri / Utilities'
};

// Mapping from Level 3 regions to MIA region names - Updated for database compatibility
const regionToMIAMap: Record<string, string> = {
  'Global': 'Global',
  'APAC': 'APAC',
  'Americas': 'Americas',
  'EMEA': 'EMEA',
  'Eastern Europe': 'Eastern Europe'
};

export function MarketInsights({ searchQuery, language }: MarketInsightsProps) {
  // Dynamic data from API
  const [tagHierarchy, setTagHierarchy] = useState(defaultTagHierarchy);
  const [buckets, setBuckets] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [popularTags, setPopularTags] = useState<any[]>([]);
  const [bucketTags, setBucketTags] = useState<any[]>([]); // Top 5 tags for selected bucket

  // Filter states (1: Bucket, 2: Tags, 3: Region, 4: TimeFrame)
  const [selectedLevel1, setSelectedLevel1] = useState('all'); // Bucket
  const [selectedLevel2, setSelectedLevel2] = useState('all'); // Tag
  const [selectedLevel3, setSelectedLevel3] = useState('all'); // Region
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('30d'); // TimeFrame (moved to 4th position)
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // API state
  const [newsData, setNewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  // Article Modal state
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Auto-translation cache for Chinese interface
  const [translationCache, setTranslationCache] = useState<Record<string, { title?: string; content?: string; source?: string }>>({});
  const [translatingItems, setTranslatingItems] = useState<Set<string>>(new Set());

  // Dropdown 开关状态
  const [dropdownOpen, setDropdownOpen] = useState<{
    level1: boolean;
    level2: boolean;
    level3: boolean;
    timeFrame: boolean;
  }>({
    level1: false,
    level2: false,
    level3: false,
    timeFrame: false
  });

  // Load initial data from API
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load bucket-specific tags when bucket changes
  useEffect(() => {
    if (selectedLevel1 !== 'all') {
      loadBucketTags(selectedLevel1);
    } else {
      setBucketTags([]);
    }
  }, [selectedLevel1, selectedTimeFrame]);

  // Load tags for a specific bucket within the time frame
  const loadBucketTags = async (bucketName: string) => {
    try {
      // Get time frame filter for API call
      const timeFrameFilter = getTimeFrameFilter();

      // First get articles for this bucket to see which tags are used
      const response = await marketInsightsApi.getArticles({
        bucket: bucketName,
        limit: 1000 // Get more articles to analyze tags
      });

      if (response.data && response.data.articles.length > 0) {
        // Extract and count tags from articles
        const tagCounts: Record<string, number> = {};

        response.data.articles.forEach((article: any) => {
          if (article.keywords && Array.isArray(article.keywords)) {
            article.keywords.forEach((keyword: string) => {
              tagCounts[keyword] = (tagCounts[keyword] || 0) + 1;
            });
          }
        });

        // Convert to array and sort by frequency, take top 5
        const sortedTags = Object.entries(tagCounts)
          .map(([tag, count]) => ({ name: tag, frequency: count }))
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 5);

        // Format for dropdown
        const formattedTags = [
          { id: 'all', label_zh: '全部标签', label_en: 'All Tags', frequency: 0 },
          ...sortedTags.map(tag => ({
            id: tag.name,
            label_zh: tag.name,
            label_en: tag.name,
            frequency: tag.frequency
          }))
        ];

        setBucketTags(formattedTags);
      } else {
        setBucketTags([
          { id: 'all', label_zh: '全部标签', label_en: 'All Tags', frequency: 0 }
        ]);
      }
    } catch (err) {
      console.error('Failed to load bucket tags:', err);
      setBucketTags([
        { id: 'all', label_zh: '全部标签', label_en: 'All Tags', frequency: 0 }
      ]);
    }
  };

  // Load buckets, regions, and tags from API
  const loadInitialData = async () => {
    try {
      // Load buckets
      const bucketsResponse = await marketInsightsApi.getBuckets();
      if (bucketsResponse.data) {
        setBuckets(bucketsResponse.data.buckets);

        // Update Level 1 categories with real bucket data
        const dynamicLevel1 = [
          { id: 'all', label_zh: '全部', label_en: 'All' },
          ...bucketsResponse.data.buckets.map((bucket: any) => ({
            id: bucket.name,
            label_zh: bucket.name === 'Macro & Central Banks' ? '宏观经济与央行' :
                      bucket.name === 'Banking & Regulation' ? '银行与监管' :
                      bucket.name === 'Markets' ? '市场' :
                      bucket.name === 'Economic Indicators' ? '经济指标' :
                      bucket.name === 'M&A / IPO / Financing' ? '并购/IPO/融资' :
                      bucket.name === 'Fintech & Payments' ? '金融科技与支付' :
                      bucket.name === 'Consumer Finance & Housing' ? '消费金融与房产' :
                      bucket.name === 'Cybersecurity & Digital Risk' ? '网络安全与数字风险' :
                      bucket.name === 'Tech, AI & Data Policy' ? '科技、AI与数据政策' :
                      bucket.name === 'ESG & Sustainability' ? 'ESG与可持续发展' :
                      bucket.name === 'Social Security & Welfare' ? '社会保障与福利' :
                      bucket.name === 'Geopolitics & Trade' ? '地缘政治与贸易' :
                      bucket.name === 'Rural & Agri / Utilities' ? '农村农业/公用事业' :
                      bucket.name, // fallback to English name
            label_en: bucket.name,
            article_count: bucket.article_count,
            avg_importance: bucket.avg_importance
          }))
        ];

        setTagHierarchy(prev => ({
          ...prev,
          level1: dynamicLevel1
        }));
      }

      // Load dynamic regions from API
      const regionsResponse = await marketInsightsApi.getRegions();
      if (regionsResponse.data) {
        setRegions(regionsResponse.data.regions);
        setTagHierarchy(prev => ({
          ...prev,
          level3: regionsResponse.data.regions
        }));
      } else {
        // Fallback to default static regions if API fails
        console.warn('Failed to load dynamic regions, using fallback');
        setRegions(defaultTagHierarchy.level3);
      }

      // Load popular tags
      const tagsResponse = await marketInsightsApi.getTags({ limit: 50 });
      if (tagsResponse.data) {
        setPopularTags(tagsResponse.data.tags);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      // Use fallback data on error
      setRegions(defaultTagHierarchy.level3);
    }
  };

  // Get time frame filter for API
  const getTimeFrameFilter = () => {
    if (selectedTimeFrame === 'all') return undefined;

    const days = {
      '1d': 1,
      '3d': 3,
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[selectedTimeFrame] || 30;

    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Fetch articles from API
  const loadArticles = async (isLoadMore = false) => {
    setLoading(true);
    setError(null);

    try {
      const currentOffset = isLoadMore ? offset : 0;

      // Get bucket name for the selected category
      const bucketName = selectedLevel1 === 'all' ? undefined : selectedLevel1;

      // Get region name for the selected level3
      const regionName = selectedLevel3 === 'all' ? undefined :
                         regionToMIAMap[selectedLevel3] || selectedLevel3;

      // Combine searchQuery with custom tags and selected tag
      let searchTerms = searchQuery || '';
      if (selectedLevel2 !== 'all') {
        searchTerms = searchTerms ? `${searchTerms} ${selectedLevel2}` : selectedLevel2;
      }
      if (customTags.length > 0) {
        searchTerms = searchTerms ? `${searchTerms} ${customTags.join(' ')}` : customTags.join(' ');
      }
      searchTerms = searchTerms.trim() || undefined;

      // Get time frame filter
      const timeFrameFilter = getTimeFrameFilter();

      const response = await marketInsightsApi.getArticles({
        bucket: bucketName,
        region: regionName,
        search: searchTerms,
        importance: 1, // Minimum importance to ensure quality
        limit: limit,
        offset: currentOffset
      });

      if (response.data) {
        let articles = response.data.articles;

        // Client-side filtering by time frame if needed
        if (timeFrameFilter) {
          articles = articles.filter((article: any) => {
            const articleDate = new Date(article.publishTime);
            const filterDate = new Date(timeFrameFilter);
            return articleDate >= filterDate;
          });
        }

        // Sort by importance (descending) then by publish time (descending)
        articles.sort((a: any, b: any) => {
          // First sort by importance (higher importance first)
          if (b.importance !== a.importance) {
            return b.importance - a.importance;
          }
          // Then sort by publish time (newer first)
          return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
        });

        // Update state first to show content immediately
        if (isLoadMore) {
          setNewsData(prev => [...prev, ...articles]);
          setOffset(currentOffset + articles.length);
        } else {
          setNewsData(articles);
          setOffset(articles.length);
        }
        setTotal(response.data.total);
        setHasMore(currentOffset + articles.length < response.data.total);

        // Proactive translation for Chinese interface (non-blocking)
        if (language === 'zh') {
          // Start translations in background - this will update translationCache
          // which will trigger re-renders as translations complete
          console.log('[Load] Starting proactive translation...');
          proactiveTranslate(articles).catch(err => {
            console.error('[Load] Proactive translation error:', err);
          });
        }
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  // Load articles when filters change
  useEffect(() => {
    setOffset(0);
    loadArticles(false);
  }, [selectedLevel1, selectedLevel2, selectedLevel3, selectedTimeFrame, searchQuery, customTags.join(',')]);

  // Auto-translate content for Chinese interface
  const autoTranslate = async (articleId: string, text: string, type: 'title' | 'content' | 'source') => {
    if (!text || text.trim().length === 0 || translatingItems.has(`${articleId}-${type}`)) return text;

    // Check cache first
    const cached = translationCache[articleId]?.[type];
    if (cached) return cached;

    try {
      setTranslatingItems(prev => new Set([...prev, `${articleId}-${type}`]));

      console.log(`[AutoTranslate] Translating ${type} for article ${articleId} from EN to ZH`);
      const response = await translationApi.translate(text, 'zh', 'en');

      if (response.data?.translatedText) {
        const translated = response.data.translatedText;

        // Update cache
        setTranslationCache(prev => ({
          ...prev,
          [articleId]: {
            ...prev[articleId],
            [type]: translated
          }
        }));

        return translated;
      }
    } catch (error) {
      console.error(`Auto-translation failed for ${type}:`, error);
    } finally {
      setTranslatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${articleId}-${type}`);
        return newSet;
      });
    }

    return text; // Return original if translation fails
  };

  // Proactive translation helper - translates immediately when content is loaded
  const proactiveTranslate = async (articles: any[]) => {
    if (language !== 'zh') {
      console.log('[Proactive] Skipping - language is not Chinese');
      return articles;
    }

    console.log(`[Proactive] Starting translation for ${articles.length} articles`);

    const translationPromises = articles.map(async (article) => {
      const translations: any = {};
      let needsTranslation = false;

      // Translate title if missing
      if (!article.title_zh || article.title_zh.trim() === '') {
        console.log(`[Proactive] Article ${article.id} needs title translation`);
        needsTranslation = true;
        translations.title = await autoTranslate(article.id, article.title_en, 'title');
      }

      // Translate content if missing
      if (!article.content_zh || article.content_zh.trim() === '') {
        console.log(`[Proactive] Article ${article.id} needs content translation (content_zh length: ${article.content_zh?.length})`);
        needsTranslation = true;
        translations.content = await autoTranslate(article.id, article.content_en, 'content');
      }

      // Translate source if missing
      if (!article.source_zh || article.source_zh === article.source_en) {
        console.log(`[Proactive] Article ${article.id} needs source translation`);
        needsTranslation = true;
        translations.source = await autoTranslate(article.id, article.source_en, 'source');
      }

      if (!needsTranslation) {
        console.log(`[Proactive] Article ${article.id} already has Chinese content`);
      }

      return { ...article, ...translations };
    });

    return Promise.all(translationPromises);
  };

  // Auto-translate missing Chinese content when language changes to Chinese
  useEffect(() => {
    if (language === 'zh' && newsData.length > 0) {
      newsData.forEach(async (article) => {
        // Auto-translate title if missing
        if (!article.title_zh || article.title_zh === article.title_en) {
          await autoTranslate(article.id, article.title_en, 'title');
        }

        // Auto-translate content if missing
        if (!article.content_zh || article.content_zh === article.content_en) {
          await autoTranslate(article.id, article.content_en, 'content');
        }

        // Auto-translate source if missing
        if (!article.source_zh || article.source_zh === article.source_en) {
          await autoTranslate(article.id, article.source_en, 'source');
        }
      });
    }
  }, [language, newsData]);

  // Filter news (now used as fallback or for local filtering)
  const filteredNews = newsData;

  // 添加自定义标签
  const addCustomTag = () => {
    if (newTagInput.trim() && !customTags.includes(newTagInput.trim())) {
      setCustomTags([...customTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  // 删除自定义标签
  const removeCustomTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter(tag => tag !== tagToRemove));
  };

  // 切换dropdown状态
  const toggleDropdown = (level: 'level1' | 'level2' | 'level3' | 'timeFrame') => {
    setDropdownOpen(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  // 关闭所有dropdown
  const closeAllDropdowns = () => {
    setDropdownOpen({
      level1: false,
      level2: false,
      level3: false,
      timeFrame: false
    });
  };

  // 当选择第一级时重置第二级
  const handleLevel1Change = (value: string) => {
    setSelectedLevel1(value);
    setSelectedLevel2('all'); // Reset tag selection
    closeAllDropdowns();
  };

  // 点击外部关闭dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.relative')) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const content = {
    zh: {
      title: '市场洞察',
      source: '信息源',
      publishTime: '发布时间',
      readMore: '阅读全文',
      like: '点赞',
      share: '分享',
      bookmark: '收藏'
    },
    en: {
      title: 'Market Insights',
      source: 'Source',
      publishTime: 'Published',
      readMore: 'Read More',
      like: 'Like',
      share: 'Share',
      bookmark: 'Bookmark'
    }
  };

  const t = content[language];

  // 处理新闻互动
  const handleNewsAction = (newsId: string, action: 'like' | 'bookmark') => {
    setNewsData(prev => prev.map(news => {
      if (news.id === newsId) {
        if (action === 'like') {
          return {
            ...news,
            isLiked: !news.isLiked,
            likes: news.isLiked ? news.likes - 1 : news.likes + 1
          };
        } else if (action === 'bookmark') {
          return {
            ...news,
            isBookmarked: !news.isBookmarked
          };
        }
      }
      return news;
    }));
  };



  // 格式化时间
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (language === 'zh') {
      return `${year}/${month}/${day} ${hours}:${minutes}`;
    } else {
      return `${year}/${month}/${day} ${hours}:${minutes}`;
    }
  };

  return (
    <div className="space-y-6 pt-8">
      {/* 四级标签导航系统 - 所有元素在同一行对齐 */}
      <div className="space-y-4">
        {/* 第一行：所有标签元素水平对齐 */}
        <div className="flex items-center justify-between w-full">

          {/* ���定义标签 - 在同一行 */}
          {/* Section gauche avec les dropdowns - alignés à gauche */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* 第一级：主要类别 */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('level1')}
                className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-24"
              >
                <span className="text-teal-custom font-medium">
                  {tagHierarchy.level1.find(item => item.id === selectedLevel1)?.[language === 'zh' ? 'label_zh' : 'label_en']}
                </span>
                {dropdownOpen.level1 ? <ChevronUp className="h-4 w-4 text-teal-custom" /> : <ChevronDown className="h-4 w-4 text-teal-custom" />}
              </button>
              
              {dropdownOpen.level1 && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40">
                  <div className="py-2">
                    {tagHierarchy.level1.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleLevel1Change(item.id)}
                        className="w-full text-left px-4 py-2 text-teal-custom hover:bg-teal-custom-light transition-colors"
                      >
                        {language === 'zh' ? item.label_zh : item.label_en}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 第二级：热门标签 */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('level2')}
                className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-28"
                disabled={selectedLevel1 === 'all'}
              >
                <span className={`font-medium ${selectedLevel1 === 'all' ? 'text-gray-400' : 'text-teal-custom-80'}`}>
                  {selectedLevel1 === 'all'
                    ? (language === 'zh' ? '选择分类后可用' : 'Select category first')
                    : (bucketTags.find(item => item.id === selectedLevel2)?.[language === 'zh' ? 'label_zh' : 'label_en'] || (language === 'zh' ? '全部标签' : 'All Tags'))
                  }
                </span>
                {selectedLevel1 !== 'all' && (dropdownOpen.level2 ? <ChevronUp className="h-4 w-4 text-teal-custom-80" /> : <ChevronDown className="h-4 w-4 text-teal-custom-80" />)}
              </button>

              {dropdownOpen.level2 && selectedLevel1 !== 'all' && bucketTags.length > 0 && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40">
                  <div className="py-2">
                    {bucketTags.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedLevel2(item.id);
                          closeAllDropdowns();
                        }}
                        className="w-full text-left px-4 py-2 text-teal-custom-80 hover:bg-teal-custom-light transition-colors flex justify-between"
                      >
                        <span>{language === 'zh' ? item.label_zh : item.label_en}</span>
                        {item.frequency > 0 && (
                          <span className="text-xs text-gray-500">({item.frequency})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 第三级：地区/范围 */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('level3')}
                className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-20"
              >
                <span className="text-teal-custom-60 font-medium">
                  {tagHierarchy.level3.find(item => item.id === selectedLevel3)?.[language === 'zh' ? 'label_zh' : 'label_en']}
                </span>
                {dropdownOpen.level3 ? <ChevronUp className="h-4 w-4 text-teal-custom-60" /> : <ChevronDown className="h-4 w-4 text-teal-custom-60" />}
              </button>
              
              {dropdownOpen.level3 && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40">
                  <div className="py-2">
                    {tagHierarchy.level3.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedLevel3(item.id);
                          closeAllDropdowns();
                        }}
                        className="w-full text-left px-4 py-2 text-teal-custom-60 hover:bg-teal-custom-light transition-colors flex justify-between items-center"
                      >
                        <span>{language === 'zh' ? item.label_zh : item.label_en}</span>
                        {(item as any).article_count > 0 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2">
                            {(item as any).article_count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 第四级：时间范围下拉选项 */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('timeFrame')}
                className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-24"
              >
                <span className="text-blue-600 font-medium">
                  {timeFrameOptions.find(item => item.id === selectedTimeFrame)?.[language === 'zh' ? 'label_zh' : 'label_en']}
                </span>
                {dropdownOpen.timeFrame ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />}
              </button>

              {dropdownOpen.timeFrame && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40">
                  <div className="py-2">
                    {timeFrameOptions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedTimeFrame(item.id);
                          closeAllDropdowns();
                        }}
                        className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        {language === 'zh' ? item.label_zh : item.label_en}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section droite avec tags personnalisés et input - alignée à droite */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* 自定义标签 */}
            {customTags.map((tag, index) => (
              <div key={index} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                <span>{tag}</span>
                <button
                  onClick={() => removeCustomTag(tag)}
                  className="text-gray-400 hover:text-gray-600 ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* 添加新标签输入框和按钮 - 紧邻排列 */}
            <div className="flex items-center">
              <Input
                type="text"
                placeholder={language === 'zh' ? '添加自定义标签...' : 'Add custom tag...'}
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                className="w-48 h-10 text-sm text-gray-500 bg-gray-50 border-gray-200 rounded-r-none border-r-0"
              />
              <Button
                onClick={addCustomTag}
                size="sm"
                className="h-10 bg-gray-600 hover:bg-gray-700 text-white px-4 rounded-l-none"
                disabled={!newTagInput.trim()}
              >
                <Plus className="h-3 w-3 mr-1" />
                {language === 'zh' ? '添加' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-800">
            <X className="h-5 w-5" />
            <div>
              <p className="font-semibold">{language === 'zh' ? '加载失败' : 'Failed to load'}</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadArticles(false)}
              className="ml-auto"
            >
              {language === 'zh' ? '重试' : 'Retry'}
            </Button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && newsData.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-custom" />
          <span className="ml-3 text-gray-600">
            {language === 'zh' ? '加载中...' : 'Loading...'}
          </span>
        </div>
      )}

      {/* 新闻列表 */}
      {!loading || newsData.length > 0 ? (
        <div className="space-y-4">
        {filteredNews.map((news) => {
          // Smart fallback with auto-translation: use Chinese if available, auto-translate if not, otherwise use English
          const getTitle = () => {
            if (language === 'zh') {
              // First check if we have native Chinese content
              if (news.title_zh && news.title_zh.trim() && news.title_zh !== news.title_en) {
                return news.title_zh;
              }
              // Then check translation cache
              const cached = translationCache[news.id]?.title;
              if (cached && cached.trim()) {
                return cached;
              }
              // Show translation indicator if in progress
              if (translatingItems.has(`${news.id}-title`)) {
                return `${news.title_en} [翻译中...]`;
              }
            }
            return news.title_en;
          };

          const getContent = () => {
            if (language === 'zh') {
              // Debug logging
              console.log(`[Content ${news.id}] content_zh length:`, news.content_zh?.length, 'cached:', !!translationCache[news.id]?.content, 'translating:', translatingItems.has(`${news.id}-content`));

              // First check if we have native Chinese content
              if (news.content_zh && news.content_zh.trim() && news.content_zh !== news.content_en) {
                console.log(`[Content ${news.id}] Using native Chinese`);
                return news.content_zh;
              }
              // Then check translation cache
              const cached = translationCache[news.id]?.content;
              if (cached && cached.trim()) {
                console.log(`[Content ${news.id}] Using cached translation`);
                return cached;
              }
              // Show translation indicator if in progress
              if (translatingItems.has(`${news.id}-content`)) {
                console.log(`[Content ${news.id}] Translation in progress`);
                return `${news.content_en} [翻译中...]`;
              }
              console.log(`[Content ${news.id}] Falling back to English`);
            }
            return news.content_en;
          };

          const getSource = () => {
            if (language === 'zh') {
              // First check if we have native Chinese source
              if (news.source_zh && news.source_zh.trim() && news.source_zh !== news.source_en) {
                return news.source_zh;
              }
              // Then check translation cache
              const cached = translationCache[news.id]?.source;
              if (cached && cached.trim()) {
                return cached;
              }
              // Show translation indicator if in progress
              if (translatingItems.has(`${news.id}-source`)) {
                return `${news.source_en} [翻译中...]`;
              }
            }
            return news.source_en;
          };

          return (
            <Card key={news.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* 标题 */}
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 leading-relaxed flex-1 pr-4">
                    {getTitle()}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(news.publishTime)}</span>
                  </div>
                </div>

                {/* 分类标签 */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {tagHierarchy.level1.find(cat => cat.id === news.category)?.[language === 'zh' ? 'label_zh' : 'label_en']}
                  </Badge>
                  {/* Importance Badge */}
                  {news.importance && (
                    <Badge
                      variant={news.importance >= 4 ? "destructive" : news.importance >= 3 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {language === 'zh' ? `重要性 ${news.importance}` : `Importance ${news.importance}`}
                    </Badge>
                  )}
                  {/* Bucket Badge */}
                  {news.bucket && (
                    <Badge variant="outline" className="text-xs">
                      {news.bucket}
                    </Badge>
                  )}
                </div>

                {/* 内容 */}
                <p className="text-gray-700 leading-relaxed line-clamp-3">
                  {getContent()}
                </p>

                {/* 元信息和操作 */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      <span>{t.source}: {getSource()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* 点赞按钮 */}
                    <button
                      onClick={() => handleNewsAction(news.id, 'like')}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors text-gray-500 hover:bg-gray-50"
                    >
                      <Heart className={`h-3 w-3 transition-colors ${news.isLiked ? 'fill-current text-red-600' : 'text-gray-500'}`} />
                      <span className={news.isLiked ? 'text-red-600' : 'text-gray-500'}>{news.likes}</span>
                    </button>

                    {/* 分享按钮 */}
                    <button className="flex items-center gap-1 px-3 py-1 rounded-full text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Share2 className="h-3 w-3" />
                    </button>

                    {/* 收藏按钮 */}
                    <button
                      onClick={() => handleNewsAction(news.id, 'bookmark')}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors text-gray-500 hover:bg-gray-50"
                    >
                      <Bookmark className={`h-3 w-3 transition-colors ${news.isBookmarked ? 'fill-current text-[#009699]' : 'text-gray-500'}`} />
                    </button>

                    {/* 阅读更多 */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setSelectedArticleId(news.id);
                        setIsArticleModalOpen(true);
                      }}
                    >
                      {t.readMore}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      ) : null}

      {/* 加载更多按钮 */}
      {filteredNews.length > 0 && hasMore && !loading && (
        <div className="text-center pt-6">
          <Button
            variant="outline"
            className="px-8"
            onClick={() => loadArticles(true)}
          >
            {language === 'zh' ? '加载更多新闻' : 'Load More News'}
            <span className="ml-2 text-sm text-gray-500">
              ({offset} / {total})
            </span>
          </Button>
        </div>
      )}

      {/* Loading more indicator */}
      {loading && newsData.length > 0 && (
        <div className="text-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-teal-custom inline-block" />
          <span className="ml-2 text-gray-600">
            {language === 'zh' ? '加载更多...' : 'Loading more...'}
          </span>
        </div>
      )}

      {/* 无结果状态 */}
      {filteredNews.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg">
              {language === 'zh' ? '未找到相关新闻' : 'No news found'}
            </p>
            <p className="text-sm">
              {language === 'zh' ? '尝试调整分类筛选' : 'Try adjusting your category filter'}
            </p>
          </div>
        </div>
      )}

      {/* Article Modal */}
      <ArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        articleId={selectedArticleId}
        language={language}
      />
    </div>
  );
}