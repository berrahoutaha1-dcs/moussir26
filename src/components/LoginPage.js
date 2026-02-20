import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader } from './ui/card';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginPage({ onLogin }) {
  const { t, direction } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8 w-full">
          <div className="flex items-center justify-center w-full max-w-md">
            <div className="h-32 w-auto flex items-center justify-center">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-md">
                <Building2 className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <Card className="border border-white/10 shadow-2xl bg-white/85 backdrop-blur-md">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#1b1b1b' }}>
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl mb-2" style={{ color: '#1b1b1b' }}>{t('login.title')}</h1>
            <p className="text-slate-600">{t('login.subtitle')}</p>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700">{t('login.username')}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t('login.username')}
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="h-12 border-slate-200 focus:border-slate-400 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">{t('login.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('login.password')}
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className={`h-12 ${direction === 'rtl' ? 'pl-12' : 'pr-12'} border-slate-200 focus:border-slate-400 transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${direction === 'rtl' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-white hover:opacity-90 transition-all duration-200 transform hover:scale-[1.02]"
                style={{ backgroundColor: '#1b1b1b' }}
              >
                {t('login.submit')}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  className="text-slate-600 hover:text-slate-800 transition-colors"
                >
                  {t('login.forgotPassword')}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-white/70 text-sm backdrop-blur-sm bg-black/10 rounded-lg px-4 py-2 inline-block">
            {t('login.copyright')}
          </p>
        </div>
      </div>
    </div>
  );
}

