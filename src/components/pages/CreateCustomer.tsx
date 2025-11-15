import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Save, Upload, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../../App';
import { customersApi } from '../../services/api';

interface CustomerFormState {
  companyName: string;
  listingStatus: string;
  customerType: string;
  status: string;
  industry: string;
  founded: string;
  companySize: string;
  headquarterCountry: string;
  headquarterCity: string;
  introduction: string;
  documents: File[];
}

const INDUSTRY_CODE_MAP: Record<string, string | null> = {
  Technology: 'TECH',
  Finance: 'FINSERV',
  Healthcare: 'HEALTHCARE',
  Education: 'EDUCATION',
  Manufacturing: 'MANUF',
  Retail: 'RETAIL',
  'Real Estate': 'REALESTATE',
  Consulting: 'CONSULTING',
  Energy: 'ENERGY',
  Automotive: 'AUTOMOTIVE',
  Telecommunications: 'TELECOM',
  Media: 'MEDIA',
  Transportation: 'TRANSPORT',
  Agriculture: 'AGRICULTURE',
  Construction: 'CONSTRUCTION',
  Other: 'OTHER'
};

const COUNTRY_NAME_MAP: Record<string, string> = {
  // Asia Pacific
  CN: 'China',
  JP: 'Japan',
  KR: 'South Korea',
  IN: 'India',
  SG: 'Singapore',
  HK: 'Hong Kong',
  TW: 'Taiwan',
  MY: 'Malaysia',
  TH: 'Thailand',
  ID: 'Indonesia',
  PH: 'Philippines',
  VN: 'Vietnam',
  BD: 'Bangladesh',
  PK: 'Pakistan',
  AU: 'Australia',
  NZ: 'New Zealand',
  LK: 'Sri Lanka',
  MM: 'Myanmar',
  KH: 'Cambodia',
  LA: 'Laos',
  BN: 'Brunei',
  MO: 'Macau',
  MN: 'Mongolia',
  NP: 'Nepal',
  BT: 'Bhutan',
  MV: 'Maldives',
  FJ: 'Fiji',
  PG: 'Papua New Guinea',

  // North America
  US: 'United States',
  CA: 'Canada',
  MX: 'Mexico',

  // Europe
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  BE: 'Belgium',
  CH: 'Switzerland',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  PL: 'Poland',
  AT: 'Austria',
  IE: 'Ireland',
  PT: 'Portugal',
  GR: 'Greece',
  CZ: 'Czech Republic',
  RO: 'Romania',
  HU: 'Hungary',
  BG: 'Bulgaria',
  SK: 'Slovakia',
  HR: 'Croatia',
  SI: 'Slovenia',
  LT: 'Lithuania',
  LV: 'Latvia',
  EE: 'Estonia',
  LU: 'Luxembourg',
  MT: 'Malta',
  CY: 'Cyprus',
  IS: 'Iceland',
  RS: 'Serbia',
  UA: 'Ukraine',
  BY: 'Belarus',
  BA: 'Bosnia and Herzegovina',
  AL: 'Albania',
  MK: 'North Macedonia',
  MD: 'Moldova',
  ME: 'Montenegro',
  XK: 'Kosovo',

  // Middle East
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  IL: 'Israel',
  TR: 'Turkey',
  IR: 'Iran',
  IQ: 'Iraq',
  QA: 'Qatar',
  KW: 'Kuwait',
  OM: 'Oman',
  BH: 'Bahrain',
  JO: 'Jordan',
  LB: 'Lebanon',
  YE: 'Yemen',
  SY: 'Syria',
  PS: 'Palestine',

  // Africa
  ZA: 'South Africa',
  EG: 'Egypt',
  NG: 'Nigeria',
  KE: 'Kenya',
  MA: 'Morocco',
  GH: 'Ghana',
  ET: 'Ethiopia',
  TN: 'Tunisia',
  TZ: 'Tanzania',
  UG: 'Uganda',
  DZ: 'Algeria',
  SD: 'Sudan',
  AO: 'Angola',
  MZ: 'Mozambique',
  ZW: 'Zimbabwe',
  SN: 'Senegal',
  CI: 'Ivory Coast',
  CM: 'Cameroon',
  BW: 'Botswana',
  NA: 'Namibia',
  RW: 'Rwanda',
  ZM: 'Zambia',
  MU: 'Mauritius',
  MW: 'Malawi',
  BJ: 'Benin',
  BF: 'Burkina Faso',
  ML: 'Mali',
  NE: 'Niger',
  TD: 'Chad',
  LY: 'Libya',

  // Latin America
  BR: 'Brazil',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Peru',
  VE: 'Venezuela',
  EC: 'Ecuador',
  GT: 'Guatemala',
  CU: 'Cuba',
  BO: 'Bolivia',
  DO: 'Dominican Republic',
  HN: 'Honduras',
  PY: 'Paraguay',
  SV: 'El Salvador',
  NI: 'Nicaragua',
  CR: 'Costa Rica',
  PA: 'Panama',
  UY: 'Uruguay',
  JM: 'Jamaica',
  TT: 'Trinidad and Tobago',
  GY: 'Guyana',
  SR: 'Suriname',
  BZ: 'Belize',
  BS: 'Bahamas',
  BB: 'Barbados',

  // Russia and Central Asia
  RU: 'Russia',
  KZ: 'Kazakhstan',
  UZ: 'Uzbekistan',
  TM: 'Turkmenistan',
  KG: 'Kyrgyzstan',
  TJ: 'Tajikistan',
  GE: 'Georgia',
  AM: 'Armenia',
  AZ: 'Azerbaijan',

  Other: 'Other'
};

const REGION_MAP: Record<string, string> = {
  // Asia Pacific
  CN: 'APAC',
  JP: 'APAC',
  KR: 'APAC',
  IN: 'APAC',
  SG: 'APAC',
  HK: 'APAC',
  TW: 'APAC',
  MY: 'APAC',
  TH: 'APAC',
  ID: 'APAC',
  PH: 'APAC',
  VN: 'APAC',
  BD: 'APAC',
  PK: 'APAC',
  AU: 'APAC',
  NZ: 'APAC',
  LK: 'APAC',
  MM: 'APAC',
  KH: 'APAC',
  LA: 'APAC',
  BN: 'APAC',
  MO: 'APAC',
  MN: 'APAC',
  NP: 'APAC',
  BT: 'APAC',
  MV: 'APAC',
  FJ: 'APAC',
  PG: 'APAC',

  // North America
  US: 'NA',
  CA: 'NA',
  MX: 'NA',

  // Europe
  GB: 'EMEA',
  DE: 'EMEA',
  FR: 'EMEA',
  IT: 'EMEA',
  ES: 'EMEA',
  NL: 'EMEA',
  BE: 'EMEA',
  CH: 'EMEA',
  SE: 'EMEA',
  NO: 'EMEA',
  DK: 'EMEA',
  FI: 'EMEA',
  PL: 'EMEA',
  AT: 'EMEA',
  IE: 'EMEA',
  PT: 'EMEA',
  GR: 'EMEA',
  CZ: 'EMEA',
  RO: 'EMEA',
  HU: 'EMEA',
  BG: 'EMEA',
  SK: 'EMEA',
  HR: 'EMEA',
  SI: 'EMEA',
  LT: 'EMEA',
  LV: 'EMEA',
  EE: 'EMEA',
  LU: 'EMEA',
  MT: 'EMEA',
  CY: 'EMEA',
  IS: 'EMEA',
  RS: 'EMEA',
  UA: 'EMEA',
  BY: 'EMEA',
  BA: 'EMEA',
  AL: 'EMEA',
  MK: 'EMEA',
  MD: 'EMEA',
  ME: 'EMEA',
  XK: 'EMEA',

  // Middle East
  AE: 'EMEA',
  SA: 'EMEA',
  IL: 'EMEA',
  TR: 'EMEA',
  IR: 'EMEA',
  IQ: 'EMEA',
  QA: 'EMEA',
  KW: 'EMEA',
  OM: 'EMEA',
  BH: 'EMEA',
  JO: 'EMEA',
  LB: 'EMEA',
  YE: 'EMEA',
  SY: 'EMEA',
  PS: 'EMEA',

  // Africa
  ZA: 'EMEA',
  EG: 'EMEA',
  NG: 'EMEA',
  KE: 'EMEA',
  MA: 'EMEA',
  GH: 'EMEA',
  ET: 'EMEA',
  TN: 'EMEA',
  TZ: 'EMEA',
  UG: 'EMEA',
  DZ: 'EMEA',
  SD: 'EMEA',
  AO: 'EMEA',
  MZ: 'EMEA',
  ZW: 'EMEA',
  SN: 'EMEA',
  CI: 'EMEA',
  CM: 'EMEA',
  BW: 'EMEA',
  NA: 'EMEA',
  RW: 'EMEA',
  ZM: 'EMEA',
  MU: 'EMEA',
  MW: 'EMEA',
  BJ: 'EMEA',
  BF: 'EMEA',
  ML: 'EMEA',
  NE: 'EMEA',
  TD: 'EMEA',
  LY: 'EMEA',

  // Latin America
  BR: 'LATAM',
  AR: 'LATAM',
  CL: 'LATAM',
  CO: 'LATAM',
  PE: 'LATAM',
  VE: 'LATAM',
  EC: 'LATAM',
  GT: 'LATAM',
  CU: 'LATAM',
  BO: 'LATAM',
  DO: 'LATAM',
  HN: 'LATAM',
  PY: 'LATAM',
  SV: 'LATAM',
  NI: 'LATAM',
  CR: 'LATAM',
  PA: 'LATAM',
  UY: 'LATAM',
  JM: 'LATAM',
  TT: 'LATAM',
  GY: 'LATAM',
  SR: 'LATAM',
  BZ: 'LATAM',
  BS: 'LATAM',
  BB: 'LATAM',

  // Russia and Central Asia
  RU: 'EMEA',
  KZ: 'EMEA',
  UZ: 'EMEA',
  TM: 'EMEA',
  KG: 'EMEA',
  TJ: 'EMEA',
  GE: 'EMEA',
  AM: 'EMEA',
  AZ: 'EMEA',

  Other: 'GLOBAL'
};

const COMPANY_SIZE_MAP: Record<string, string> = {
  Startup: '1-10',
  Small: '11-50',
  Medium: '51-200',
  Large: '201-1000',
  Enterprise: '1000+'
};

const LISTING_STATUS_MAP: Record<string, string> = {
  Listed: 'listed',
  Private: 'private'
};

const createInitialFormState = (): CustomerFormState => ({
  companyName: '',
  listingStatus: '',
  customerType: '',
  status: 'active',
  industry: '',
  founded: '',
  companySize: '',
  headquarterCountry: '',
  headquarterCity: '',
  introduction: '',
  documents: []
});

interface CreateCustomerProps {
  language: Language;
  
}

export function CreateCustomer({ language }: CreateCustomerProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CustomerFormState>(createInitialFormState());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const redirectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const content = {
    zh: {
      title: '新建客户',
      basicInfo: '基本信息',
      companyName: '公司名称',
      companyNamePlaceholder: '请输入公司名称',
      listingStatus: '上市状态',
      listingStatusPlaceholder: '选择上市状态',
      customerType: '客户类型',
      customerTypePlaceholder: '选择客户类型',
      customerStatus: '客户状态',
      customerStatusPlaceholder: '选择客户状态',
      industry: '行业',
      industryPlaceholder: '选择行业',
      founded: '成立年份',
      foundedPlaceholder: '请输入成立年份',
      companySize: '公司规模',
      companySizePlaceholder: '选择公司规模',
      
      locationInfo: '总部信息',
      headquarterCountry: '总部国家',
      headquarterCountryPlaceholder: '选择总部国家',
      headquarterCity: '总部城市',
      headquarterCityPlaceholder: '请输入总部城市',
      
      companyDetails: '公司详情',
      introduction: '公司介绍',
      introductionPlaceholder: '请输入公司介绍或描述',
      documents: '相关文档',
      documentsPlaceholder: '上传相关文档',
      uploadDocuments: '上传文档',
      noDocuments: '暂无文档',
      
      cancel: '取消',
      save: '保存',
      saving: '保存中...',
      successMessage: '客户创建成功！',
      errorMessage: '创建客户失败，请稍后重试。',
      requiredCompanyName: '请填写公司名称。',
      invalidFoundedYear: '成立年份必须是数字。',
      
      listingStatuses: {
        listed: '上市公司',
        private: '私人公司'
      },

      customerTypes: {
        smb: '中小企业',
        enterprise: '大型企业',
        startup: '初创公司',
        strategic: '战略客户',
        lead: '潜在商机'
      },

      customerStatuses: {
        active: '活跃',
        inactive: '非活跃',
        prospect: '潜在客户',
        dormant: '沉睡客户'
      },

      industries: {
        technology: '科技',
        finance: '金融',
        healthcare: '医疗健康',
        education: '教育',
        manufacturing: '制造业',
        retail: '零售',
        realestate: '房地产',
        consulting: '咨询服务',
        energy: '能源',
        automotive: '汽车',
        telecommunications: '电信',
        media: '传媒',
        transportation: '交通运输',
        agriculture: '农业',
        construction: '建筑',
        other: '其他'
      },
      
      companySizes: {
        startup: '初创公司 (1-10人)',
        small: '小型公司 (11-50人)',
        medium: '中型公司 (51-200人)',
        large: '大型公司 (201-1000人)',
        enterprise: '企业集团 (1000+人)'
      },
      
      countries: {
        // 亚太地区
        cn: '中国',
        jp: '日本',
        kr: '韩国',
        in: '印度',
        sg: '新加坡',
        hk: '香港',
        tw: '台湾',
        my: '马来西亚',
        th: '泰国',
        id: '印度尼西亚',
        ph: '菲律宾',
        vn: '越南',
        bd: '孟加拉国',
        pk: '巴基斯坦',
        au: '澳大利亚',
        nz: '新西兰',
        lk: '斯里兰卡',
        mm: '缅甸',
        kh: '柬埔寨',
        la: '老挝',
        bn: '文莱',
        mo: '澳门',
        mn: '蒙古',
        np: '尼泊尔',
        bt: '不丹',
        mv: '马尔代夫',
        fj: '斐济',
        pg: '巴布亚新几内亚',

        // 北美
        us: '美国',
        ca: '加拿大',
        mx: '墨西哥',

        // 欧洲
        gb: '英国',
        de: '德国',
        fr: '法国',
        it: '意大利',
        es: '西班牙',
        nl: '荷兰',
        be: '比利时',
        ch: '瑞士',
        se: '瑞典',
        no: '挪威',
        dk: '丹麦',
        fi: '芬兰',
        pl: '波兰',
        at: '奥地利',
        ie: '爱尔兰',
        pt: '葡萄牙',
        gr: '希腊',
        cz: '捷克',
        ro: '罗马尼亚',
        hu: '匈牙利',
        bg: '保加利亚',
        sk: '斯洛伐克',
        hr: '克罗地亚',
        si: '斯洛文尼亚',
        lt: '立陶宛',
        lv: '拉脱维亚',
        ee: '爱沙尼亚',
        lu: '卢森堡',
        mt: '马耳他',
        cy: '塞浦路斯',
        is: '冰岛',
        rs: '塞尔维亚',
        ua: '乌克兰',
        by: '白俄罗斯',
        ba: '波黑',
        al: '阿尔巴尼亚',
        mk: '北马其顿',
        md: '摩尔多瓦',
        me: '黑山',
        xk: '科索沃',

        // 中东
        ae: '阿联酋',
        sa: '沙特阿拉伯',
        il: '以色列',
        tr: '土耳其',
        ir: '伊朗',
        iq: '伊拉克',
        qa: '卡塔尔',
        kw: '科威特',
        om: '阿曼',
        bh: '巴林',
        jo: '约旦',
        lb: '黎巴嫩',
        ye: '也门',
        sy: '叙利亚',
        ps: '巴勒斯坦',

        // 非洲
        za: '南非',
        eg: '埃及',
        ng: '尼日利亚',
        ke: '肯尼亚',
        ma: '摩洛哥',
        gh: '加纳',
        et: '埃塞俄比亚',
        tn: '突尼斯',
        tz: '坦桑尼亚',
        ug: '乌干达',
        dz: '阿尔及利亚',
        sd: '苏丹',
        ao: '安哥拉',
        mz: '莫桑比克',
        zw: '津巴布韦',
        sn: '塞内加尔',
        ci: '科特迪瓦',
        cm: '喀麦隆',
        bw: '博茨瓦纳',
        na: '纳米比亚',
        rw: '卢旺达',
        zm: '赞比亚',
        mu: '毛里求斯',
        mw: '马拉维',
        bj: '贝宁',
        bf: '布基纳法索',
        ml: '马里',
        ne: '尼日尔',
        td: '乍得',
        ly: '利比亚',

        // 拉丁美洲
        br: '巴西',
        ar: '阿根廷',
        cl: '智利',
        co: '哥伦比亚',
        pe: '秘鲁',
        ve: '委内瑞拉',
        ec: '厄瓜多尔',
        gt: '危地马拉',
        cu: '古巴',
        bo: '玻利维亚',
        do: '多米尼加',
        hn: '洪都拉斯',
        py: '巴拉圭',
        sv: '萨尔瓦多',
        ni: '尼加拉瓜',
        cr: '哥斯达黎加',
        pa: '巴拿马',
        uy: '乌拉圭',
        jm: '牙买加',
        tt: '特立尼达和多巴哥',
        gy: '圭亚那',
        sr: '苏里南',
        bz: '伯利兹',
        bs: '巴哈马',
        bb: '巴巴多斯',

        // 俄罗斯和中亚
        ru: '俄罗斯',
        kz: '哈萨克斯坦',
        uz: '乌兹别克斯坦',
        tm: '土库曼斯坦',
        kg: '吉尔吉斯斯坦',
        tj: '塔吉克斯坦',
        ge: '格鲁吉亚',
        am: '亚美尼亚',
        az: '阿塞拜疆',

        other: '其他'
      }
    },
    en: {
      title: 'Create New Customer',
      basicInfo: 'Basic Information',
      companyName: 'Company Name',
      companyNamePlaceholder: 'Enter company name',
      listingStatus: 'Listing Status',
      listingStatusPlaceholder: 'Select listing status',
      customerType: 'Customer Type',
      customerTypePlaceholder: 'Select customer type',
      customerStatus: 'Customer Status',
      customerStatusPlaceholder: 'Select customer status',
      industry: 'Industry Sector',
      industryPlaceholder: 'Select industry',
      founded: 'Founded Year',
      foundedPlaceholder: 'Enter founded year',
      companySize: 'Company Size',
      companySizePlaceholder: 'Select company size',
      
      locationInfo: 'Headquarters Information',
      headquarterCountry: 'Headquarters Country',
      headquarterCountryPlaceholder: 'Select headquarters country',
      headquarterCity: 'Headquarters City',
      headquarterCityPlaceholder: 'Enter headquarters city',
      
      companyDetails: 'Company Details',
      introduction: 'Company Introduction',
      introductionPlaceholder: 'Enter company introduction or description',
      documents: 'Documents',
      documentsPlaceholder: 'Upload related documents',
      uploadDocuments: 'Upload Documents',
      noDocuments: 'No documents',
      
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      successMessage: 'Customer created successfully!',
      errorMessage: 'Failed to create customer. Please try again.',
      requiredCompanyName: 'Company name is required.',
      invalidFoundedYear: 'Founded year must be a valid number.',
      
      listingStatuses: {
        listed: 'Listed',
        private: 'Private'
      },

      customerTypes: {
        smb: 'SMB',
        enterprise: 'Enterprise',
        startup: 'Startup',
        strategic: 'Strategic',
        lead: 'Lead'
      },

      customerStatuses: {
        active: 'Active',
        inactive: 'Inactive',
        prospect: 'Prospect',
        dormant: 'Dormant'
      },

      industries: {
        technology: 'Technology',
        finance: 'Finance',
        healthcare: 'Healthcare',
        education: 'Education',
        manufacturing: 'Manufacturing',
        retail: 'Retail',
        realestate: 'Real Estate',
        consulting: 'Consulting',
        energy: 'Energy',
        automotive: 'Automotive',
        telecommunications: 'Telecommunications',
        media: 'Media',
        transportation: 'Transportation',
        agriculture: 'Agriculture',
        construction: 'Construction',
        other: 'Other'
      },
      
      companySizes: {
        startup: 'Startup (1-10 employees)',
        small: 'Small (11-50 employees)',
        medium: 'Medium (51-200 employees)',
        large: 'Large (201-1000 employees)',
        enterprise: 'Enterprise (1000+ employees)'
      },
      
      countries: {
        // Asia Pacific
        cn: 'China',
        jp: 'Japan',
        kr: 'South Korea',
        in: 'India',
        sg: 'Singapore',
        hk: 'Hong Kong',
        tw: 'Taiwan',
        my: 'Malaysia',
        th: 'Thailand',
        id: 'Indonesia',
        ph: 'Philippines',
        vn: 'Vietnam',
        bd: 'Bangladesh',
        pk: 'Pakistan',
        au: 'Australia',
        nz: 'New Zealand',
        lk: 'Sri Lanka',
        mm: 'Myanmar',
        kh: 'Cambodia',
        la: 'Laos',
        bn: 'Brunei',
        mo: 'Macau',
        mn: 'Mongolia',
        np: 'Nepal',
        bt: 'Bhutan',
        mv: 'Maldives',
        fj: 'Fiji',
        pg: 'Papua New Guinea',

        // North America
        us: 'United States',
        ca: 'Canada',
        mx: 'Mexico',

        // Europe
        gb: 'United Kingdom',
        de: 'Germany',
        fr: 'France',
        it: 'Italy',
        es: 'Spain',
        nl: 'Netherlands',
        be: 'Belgium',
        ch: 'Switzerland',
        se: 'Sweden',
        no: 'Norway',
        dk: 'Denmark',
        fi: 'Finland',
        pl: 'Poland',
        at: 'Austria',
        ie: 'Ireland',
        pt: 'Portugal',
        gr: 'Greece',
        cz: 'Czech Republic',
        ro: 'Romania',
        hu: 'Hungary',
        bg: 'Bulgaria',
        sk: 'Slovakia',
        hr: 'Croatia',
        si: 'Slovenia',
        lt: 'Lithuania',
        lv: 'Latvia',
        ee: 'Estonia',
        lu: 'Luxembourg',
        mt: 'Malta',
        cy: 'Cyprus',
        is: 'Iceland',
        rs: 'Serbia',
        ua: 'Ukraine',
        by: 'Belarus',
        ba: 'Bosnia and Herzegovina',
        al: 'Albania',
        mk: 'North Macedonia',
        md: 'Moldova',
        me: 'Montenegro',
        xk: 'Kosovo',

        // Middle East
        ae: 'United Arab Emirates',
        sa: 'Saudi Arabia',
        il: 'Israel',
        tr: 'Turkey',
        ir: 'Iran',
        iq: 'Iraq',
        qa: 'Qatar',
        kw: 'Kuwait',
        om: 'Oman',
        bh: 'Bahrain',
        jo: 'Jordan',
        lb: 'Lebanon',
        ye: 'Yemen',
        sy: 'Syria',
        ps: 'Palestine',

        // Africa
        za: 'South Africa',
        eg: 'Egypt',
        ng: 'Nigeria',
        ke: 'Kenya',
        ma: 'Morocco',
        gh: 'Ghana',
        et: 'Ethiopia',
        tn: 'Tunisia',
        tz: 'Tanzania',
        ug: 'Uganda',
        dz: 'Algeria',
        sd: 'Sudan',
        ao: 'Angola',
        mz: 'Mozambique',
        zw: 'Zimbabwe',
        sn: 'Senegal',
        ci: 'Ivory Coast',
        cm: 'Cameroon',
        bw: 'Botswana',
        na: 'Namibia',
        rw: 'Rwanda',
        zm: 'Zambia',
        mu: 'Mauritius',
        mw: 'Malawi',
        bj: 'Benin',
        bf: 'Burkina Faso',
        ml: 'Mali',
        ne: 'Niger',
        td: 'Chad',
        ly: 'Libya',

        // Latin America
        br: 'Brazil',
        ar: 'Argentina',
        cl: 'Chile',
        co: 'Colombia',
        pe: 'Peru',
        ve: 'Venezuela',
        ec: 'Ecuador',
        gt: 'Guatemala',
        cu: 'Cuba',
        bo: 'Bolivia',
        do: 'Dominican Republic',
        hn: 'Honduras',
        py: 'Paraguay',
        sv: 'El Salvador',
        ni: 'Nicaragua',
        cr: 'Costa Rica',
        pa: 'Panama',
        uy: 'Uruguay',
        jm: 'Jamaica',
        tt: 'Trinidad and Tobago',
        gy: 'Guyana',
        sr: 'Suriname',
        bz: 'Belize',
        bs: 'Bahamas',
        bb: 'Barbados',

        // Russia and Central Asia
        ru: 'Russia',
        kz: 'Kazakhstan',
        uz: 'Uzbekistan',
        tm: 'Turkmenistan',
        kg: 'Kyrgyzstan',
        tj: 'Tajikistan',
        ge: 'Georgia',
        am: 'Armenia',
        az: 'Azerbaijan',

        other: 'Other'
      }
    }
  };

  const t = content[language];

  const handleSave = async () => {
    if (!formData.companyName.trim()) {
      setError(t.requiredCompanyName);
      return;
    }

    if (formData.founded && Number.isNaN(Number(formData.founded))) {
      setError(t.invalidFoundedYear);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    // Send industry_name for custom industries, or use the mapped code for predefined ones
    const industryCode = INDUSTRY_CODE_MAP[formData.industry] || null;
    const industryName = formData.industry || null;
    const employeeCountRange = COMPANY_SIZE_MAP[formData.companySize] || null;
    const country = COUNTRY_NAME_MAP[formData.headquarterCountry] || null;
    const region = REGION_MAP[formData.headquarterCountry] || null;
    const listingStatus =
      LISTING_STATUS_MAP[formData.listingStatus] ||
      (formData.listingStatus ? formData.listingStatus.toLowerCase() : null);
    const foundedYear = formData.founded ? Number(formData.founded) : undefined;

    const customFields = {
      founded_year: foundedYear,
      company_size_label: formData.companySize || undefined,
      headquarter_city: formData.headquarterCity || undefined,
      headquarter_country_code: formData.headquarterCountry || undefined,
      uploaded_documents: formData.documents.length > 0
        ? formData.documents.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type
          }))
        : undefined
    };

    const cleanedCustomFields = Object.fromEntries(
      Object.entries(customFields).filter(([, value]) => {
        if (value === undefined || value === null) return false;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim() !== '';
        return true;
      })
    );

    const payload: Record<string, unknown> = {
      company_name: formData.companyName.trim(),
      industry_code: industryCode || undefined,
      industry_name: industryName || undefined,
      listing_status: listingStatus || undefined,
      description: formData.introduction || undefined,
      introduction: formData.introduction || undefined,
      city: formData.headquarterCity || undefined,
      country: country || undefined,
      region: region || undefined,
      employee_count_range: employeeCountRange || undefined,
      customer_type: formData.customerType ? formData.customerType.toLowerCase() : 'prospect',
      status: formData.status || 'active'
    };

    if (Object.keys(cleanedCustomFields).length > 0) {
      payload.customFields = cleanedCustomFields;
    }

    try {
      const response = await customersApi.create(payload);

      if (!response.data) {
        setError(response.error || t.errorMessage);
        return;
      }

      setSuccessMessage(t.successMessage);
      setFormData(createInitialFormState());
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate('/customer-insights');
      }, 1500);
    } catch (err) {
      console.error('Error creating customer:', err);
      setError(t.errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setSuccessMessage(null);
    setFormData(createInitialFormState());
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    navigate('/customer-insights');
  };

  const updateFormData = (field: keyof Omit<CustomerFormState, 'documents'>, value: string) => {
    setError(null);
    setSuccessMessage(null);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setError(null);
      setSuccessMessage(null);
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)]
      }));
    }
    event.target.value = '';
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 mt-6">
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
          <Button
            variant="teal"
            onClick={handleSave}
            disabled={isSaving || !formData.companyName.trim()}
          >
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
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.basicInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">{t.companyName} *</Label>
              <Input
                id="companyName"
                placeholder={t.companyNamePlaceholder}
                value={formData.companyName}
                onChange={(e) => updateFormData('companyName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="listingStatus">{t.listingStatus}</Label>
                <Select value={formData.listingStatus} onValueChange={(value) => updateFormData('listingStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.listingStatusPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Listed">{t.listingStatuses.listed}</SelectItem>
                    <SelectItem value="Private">{t.listingStatuses.private}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerType">{t.customerType}</Label>
                <Select value={formData.customerType} onValueChange={(value) => updateFormData('customerType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.customerTypePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smb">{t.customerTypes.smb}</SelectItem>
                    <SelectItem value="enterprise">{t.customerTypes.enterprise}</SelectItem>
                    <SelectItem value="startup">{t.customerTypes.startup}</SelectItem>
                    <SelectItem value="strategic">{t.customerTypes.strategic}</SelectItem>
                    <SelectItem value="lead">{t.customerTypes.lead}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerStatus">{t.customerStatus}</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.customerStatusPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t.customerStatuses.active}</SelectItem>
                    <SelectItem value="inactive">{t.customerStatuses.inactive}</SelectItem>
                    <SelectItem value="prospect">{t.customerStatuses.prospect}</SelectItem>
                    <SelectItem value="dormant">{t.customerStatuses.dormant}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">{t.industry}</Label>
                <Input
                  id="industry"
                  list="industry-suggestions"
                  placeholder={t.industryPlaceholder}
                  value={formData.industry}
                  onChange={(e) => updateFormData('industry', e.target.value)}
                />
                <datalist id="industry-suggestions">
                  <option value="Technology">{t.industries.technology}</option>
                  <option value="Finance">{t.industries.finance}</option>
                  <option value="Healthcare">{t.industries.healthcare}</option>
                  <option value="Education">{t.industries.education}</option>
                  <option value="Manufacturing">{t.industries.manufacturing}</option>
                  <option value="Retail">{t.industries.retail}</option>
                  <option value="Real Estate">{t.industries.realestate}</option>
                  <option value="Consulting">{t.industries.consulting}</option>
                  <option value="Energy">{t.industries.energy}</option>
                  <option value="Automotive">{t.industries.automotive}</option>
                  <option value="Telecommunications">{t.industries.telecommunications}</option>
                  <option value="Media">{t.industries.media}</option>
                  <option value="Transportation">{t.industries.transportation}</option>
                  <option value="Agriculture">{t.industries.agriculture}</option>
                  <option value="Construction">{t.industries.construction}</option>
                  <option value="Other">{t.industries.other}</option>
                </datalist>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="founded">{t.founded}</Label>
                <Input
                  id="founded"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  placeholder={t.foundedPlaceholder}
                  value={formData.founded}
                  onChange={(e) => updateFormData('founded', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySize">{t.companySize}</Label>
                <Select value={formData.companySize} onValueChange={(value) => updateFormData('companySize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.companySizePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Startup">{t.companySizes.startup}</SelectItem>
                    <SelectItem value="Small">{t.companySizes.small}</SelectItem>
                    <SelectItem value="Medium">{t.companySizes.medium}</SelectItem>
                    <SelectItem value="Large">{t.companySizes.large}</SelectItem>
                    <SelectItem value="Enterprise">{t.companySizes.enterprise}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Headquarters Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.locationInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="headquarterCountry">{t.headquarterCountry}</Label>
                <Select value={formData.headquarterCountry} onValueChange={(value) => updateFormData('headquarterCountry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.headquarterCountryPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COUNTRY_NAME_MAP)
                      .filter(([code]) => code !== 'Other')
                      .sort((a, b) => a[1].localeCompare(b[1]))
                      .map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          {t.countries[code.toLowerCase() as keyof typeof t.countries]}
                        </SelectItem>
                      ))
                    }
                    <SelectItem value="Other">{t.countries.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="headquarterCity">{t.headquarterCity}</Label>
                <Input
                  id="headquarterCity"
                  placeholder={t.headquarterCityPlaceholder}
                  value={formData.headquarterCity}
                  onChange={(e) => updateFormData('headquarterCity', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle>{t.companyDetails}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="introduction">{t.introduction}</Label>
              <Textarea
                id="introduction"
                placeholder={t.introductionPlaceholder}
                value={formData.introduction}
                onChange={(e) => updateFormData('introduction', e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.documents}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={triggerFileUpload}
                    className="mb-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t.uploadDocuments}
                  </Button>
                  <p className="text-sm text-gray-500">{t.documentsPlaceholder}</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                />
                {formData.documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {formData.documents.length === 0 && (
                  <p className="text-center text-sm text-gray-400 mt-2">{t.noDocuments}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
