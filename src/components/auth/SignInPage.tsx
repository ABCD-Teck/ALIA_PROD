import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { ArrowLeft, Eye, EyeOff, Globe, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Language } from '../../App';
import { authApi } from '../../services/api';

interface SignInPageProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onSignIn: () => void;
  onBackToLanding: () => void;
  onSignUp: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  language,
  onLanguageChange,
  onSignIn,
  onBackToLanding,
  onSignUp
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = {
    zh: {
      title: '登录',
      subtitle: '欢迎回到 Alia',
      email: '邮箱',
      emailPlaceholder: '请输入您的邮箱地址',
      password: '密码',
      passwordPlaceholder: '请输入您的密码',
      rememberMe: '记住我',
      forgotPassword: '忘记密码？',
      signIn: '登录',
      noAccount: '还没有账户？',
      signUp: '立即注册',
      back: '返回',
      signingIn: '登录中...',
      loginError: '登录失败'
    },
    en: {
      title: 'Sign In',
      subtitle: 'Welcome back to Alia',
      email: 'Email',
      emailPlaceholder: 'Enter your email address',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      signIn: 'Sign In',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
      back: 'Back',
      signingIn: 'Signing in...',
      loginError: 'Login failed'
    }
  };

  const content = t[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(email, password);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Call onSignIn to update authentication state
        onSignIn();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-white border-b border-gray-200">
        <Button
          variant="ghost"
          onClick={onBackToLanding}
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
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {content.email}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={content.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="checkbox-teal"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                    {content.rememberMe}
                  </Label>
                </div>
                <Button variant="link" className="text-sm text-[#009699] hover:text-[#007d80] p-0 h-auto">
                  {content.forgotPassword}
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{content.loginError}: {error}</p>
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
                    {content.signingIn}
                  </>
                ) : (
                  content.signIn
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                {content.noAccount}{' '}
                <Button
                  variant="link"
                  onClick={onSignUp}
                  className="text-[#009699] hover:text-[#007d80] p-0 h-auto font-medium"
                >
                  {content.signUp}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};