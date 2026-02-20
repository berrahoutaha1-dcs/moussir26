import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Lock, Eye, EyeOff, Save, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { direction, t, language } = useLanguage();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
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
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = t('changePassword.error.currentRequired');
    }
    if (!formData.newPassword) {
      newErrors.newPassword = t('changePassword.error.newRequired');
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = t('changePassword.error.minLength');
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('changePassword.error.mismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    toast.success(t('changePassword.success'));
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md ${direction === 'rtl' ? 'rtl' : ''}`} onClose={onClose}>
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="modal-header-icon">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="modal-header-title">
                  {t('settings.changePassword')}
                </DialogTitle>
                <DialogDescription className="modal-header-subtitle mt-1">
                  {t('settings.changePasswordDesc')}
                </DialogDescription>
              </div>
            </div>
            <button onClick={onClose} className="modal-close-button">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>{t('password.currentPassword')}</Label>
            <div className="relative">
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                placeholder={t('password.currentPasswordPlaceholder')}
                className={errors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute top-1/2 transform -translate-y-1/2 right-3 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t('password.newPassword')}</Label>
            <div className="relative">
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder={t('password.newPasswordPlaceholder')}
                className={errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute top-1/2 transform -translate-y-1/2 right-3 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t('password.confirmPassword')}</Label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder={t('password.confirmPasswordPlaceholder')}
                className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute top-1/2 transform -translate-y-1/2 right-3 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={onClose} className="modal-button-secondary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} className="modal-button-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

