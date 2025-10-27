import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { ArrowLeft, Eye, EyeOff, Globe, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Language } from '../../App';
import { authApi } from '../../services/api';

interface SignUpPageProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  language,
  onLanguageChange
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = {
    zh: {
      title: '注册',
      subtitle: '创建您的 Alia 账户',
      name: '姓名',
      namePlaceholder: '请输入您的姓名',
      email: '邮箱',
      emailPlaceholder: '请输入您的邮箱地址',
      company: '公司名称',
      companyPlaceholder: '请输入您的公司名称',
      password: '密码',
      passwordPlaceholder: '请输入密码（至少8位）',
      confirmPassword: '确认密码',
      confirmPasswordPlaceholder: '请再次输入密码',
      agreeToTerms: '我同意',
      termsOfService: '服务条款',
      and: '和',
      privacyPolicy: '隐私政策',
      signUp: '注册',
      haveAccount: '已有账户？',
      signIn: '立即登录',
      back: '返回',
      passwordMismatch: '两次输入的密码不一致',
      signingUp: '注册中...',
      registrationError: '注册失败'
    },
    en: {
      title: 'Sign Up',
      subtitle: 'Create your Alia account',
      name: 'Full Name',
      namePlaceholder: 'Enter your full name',
      email: 'Email',
      emailPlaceholder: 'Enter your email address',
      company: 'Company',
      companyPlaceholder: 'Enter your company name',
      password: 'Password',
      passwordPlaceholder: 'Enter password (at least 8 characters)',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm your password',
      agreeToTerms: 'I agree to the',
      termsOfService: 'Terms of Service',
      and: 'and',
      privacyPolicy: 'Privacy Policy',
      signUp: 'Sign Up',
      haveAccount: 'Already have an account?',
      signIn: 'Sign in',
      back: 'Back',
      passwordMismatch: 'Passwords do not match',
      signingUp: 'Signing up...',
      registrationError: 'Registration failed'
    }
  };

  const content = t[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError(content.passwordMismatch);
      setLoading(false);
      return;
    }
    if (!agreeToTerms) {
      setError(language === 'zh' ? '请同意服务条款和隐私政策' : 'Please agree to the Terms of Service and Privacy Policy');
      setLoading(false);
      return;
    }

    try {
      // Split the name into first_name and last_name
      const nameParts = formData.name.trim().split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';

      const response = await authApi.register({
        email: formData.email,
        password: formData.password,
        first_name,
        last_name,
        role: 'user'
      });

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Navigate to the dashboard
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-white border-b border-gray-200">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {content.back}
        </Button>
        
        <div className="alia-logo text-2xl">
          <span className="text-[#009699]">A</span>
          <span className="text-black">lia</span>
        </div>
        
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
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-semibold text-gray-900 mb-2">
              {content.title}
            </CardTitle>
            <p className="text-gray-600">{content.subtitle}</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    {content.name}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={content.namePlaceholder}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="h-11 bg-white border-gray-300 focus:border-[#009699] focus:ring-[#009699]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {content.email}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={content.emailPlaceholder}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="h-11 bg-white border-gray-300 focus:border-[#009699] focus:ring-[#009699]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                    {content.company}
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder={content.companyPlaceholder}
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    required
                    className="h-11 bg-white border-gray-300 focus:border-[#009699] focus:ring-[#009699]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {content.password}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={content.passwordPlaceholder}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      className="h-11 bg-white border-gray-300 focus:border-[#009699] focus:ring-[#009699] pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    {content.confirmPassword}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={content.confirmPasswordPlaceholder}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      className="h-11 bg-white border-gray-300 focus:border-[#009699] focus:ring-[#009699] pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  className="checkbox-teal mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                  {content.agreeToTerms}{' '}
                  <Button variant="link" className="text-[#009699] hover:text-[#007d80] p-0 h-auto text-sm">
                    {content.termsOfService}
                  </Button>
                  {' '}{content.and}{' '}
                  <Button variant="link" className="text-[#009699] hover:text-[#007d80] p-0 h-auto text-sm">
                    {content.privacyPolicy}
                  </Button>
                </Label>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{content.registrationError}: {error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-[#009699] hover:bg-[#007d80] text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {content.signingUp}
                  </>
                ) : (
                  content.signUp
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                {content.haveAccount}{' '}
                <Button
                  variant="link"
                  onClick={() => navigate('/signin')}
                  className="text-[#009699] hover:text-[#007d80] p-0 h-auto font-medium"
                >
                  {content.signIn}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};