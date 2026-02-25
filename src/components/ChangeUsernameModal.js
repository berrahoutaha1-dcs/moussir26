import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Pen, Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function ChangeUsernameModal({ isOpen, onClose }) {
  const { direction, t, language } = useLanguage();
  const [formData, setFormData] = useState({
    currentUsername: '',
    newUsername: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentUsername) {
      newErrors.currentUsername = t('username.error.currentRequired');
    }
    if (!formData.newUsername) {
      newErrors.newUsername = t('username.error.newRequired');
    } else if (formData.newUsername.length < 3) {
      newErrors.newUsername = t('username.error.minLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    toast.success(t('username.success'));
    setFormData({ currentUsername: '', newUsername: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md bg-white p-0 border-0 shadow-xl ${direction === 'rtl' ? 'rtl' : ''}`} onClose={onClose}>
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center">
              <Pen className="w-6 h-6 text-lime-600" />
            </div>
            <DialogTitle className="text-xl" style={{ color: '#1b1b1b' }}>
              {t('username.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-600 mt-2">
            {t('username.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>{t('username.currentUsername')}</Label>
            <Input
              value={formData.currentUsername}
              onChange={(e) => handleInputChange('currentUsername', e.target.value)}
              placeholder={t('username.currentUsernamePlaceholder')}
              className={errors.currentUsername ? 'border-red-500' : ''}
            />
            {errors.currentUsername && <p className="text-sm text-red-500">{errors.currentUsername}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t('username.newUsername')}</Label>
            <Input
              value={formData.newUsername}
              onChange={(e) => handleInputChange('newUsername', e.target.value)}
              placeholder={t('username.newUsernamePlaceholder')}
              className={errors.newUsername ? 'border-red-500' : ''}
            />
            {errors.newUsername && <p className="text-sm text-red-500">{errors.newUsername}</p>}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            {t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

