import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Languages, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function LanguageModal({ isOpen, onClose }) {
  const { language, setLanguage, t, direction } = useLanguage();

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇬🇧'
    },
    {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷'
    },
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      flag: '🇸🇦'
    }
  ];

  const handleLanguageSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    let message = '';
    if (selectedLanguage === 'en') {
      message = 'Language changed to English';
    } else if (selectedLanguage === 'fr') {
      message = 'Langue changée vers le français';
    } else {
      message = 'تم تغيير اللغة إلى العربية';
    }
    toast.success(message);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-sm bg-white p-0 border-0 shadow-xl ${direction === 'rtl' ? 'rtl' : ''}`} onClose={onClose}>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Languages className="w-5 h-5 text-blue-600" />
            </div>
            {t('language.title') || (language === 'ar' ? 'اختيار اللغة' : language === 'fr' ? 'Choisir la langue' : 'Choose Language')}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 mt-2">
            {t('language.subtitle') || (language === 'ar' ? 'حدد لغتك المفضلة' : language === 'fr' ? 'Sélectionnez votre langue préférée' : 'Select your preferred language')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 hover:bg-slate-50 ${
                  language === lang.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-2xl">{lang.flag}</span>
                    <div className={`text-left ${direction === 'rtl' ? 'text-right' : ''}`}>
                      <p className="font-medium" style={{ color: '#1b1b1b' }}>
                        {lang.nativeName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {lang.name}
                      </p>
                    </div>
                  </div>
                  {language === lang.code && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className={`flex gap-3 pt-6 mt-6 border-t border-slate-200 ${direction === 'rtl' ? 'justify-start' : 'justify-end'}`}>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="px-6"
            >
              {t('language.cancel') || (language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

