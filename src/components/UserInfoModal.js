import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Image, Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function UserInfoModal({ isOpen, onClose }) {
  const { direction, t, language } = useLanguage();
  const [formData, setFormData] = useState({
    societe: '',
    activite: '',
    adresse: '',
    telephone: '',
    fax: '',
    nif: '',
    nis: '',
    ai: '',
    bank: '',
    account_number: '',
    photo_path: ''
  });

  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef(null);

  // Fetch company info on mount
  React.useEffect(() => {
    if (isOpen) {
      const fetchInfo = async () => {
        try {
          const result = await window.electronAPI.companyInfo.get();
          if (result.success && result.data) {
            setFormData({
              societe: result.data.societe || '',
              activite: result.data.activite || '',
              adresse: result.data.adresse || '',
              telephone: result.data.telephone || '',
              fax: result.data.fax || '',
              nif: result.data.nif || '',
              nis: result.data.nis || '',
              ai: result.data.ai || '',
              bank: result.data.bank || '',
              account_number: result.data.account_number || '',
              photo_path: result.data.photo_path || ''
            });

            if (result.data.photo_path) {
              const path = result.data.photo_path;
              // If it starts with data: it's base64, otherwise it's a file path
              if (path.startsWith('data:')) {
                setPhotoPreview(path);
              } else {
                setPhotoPreview(`app-img://${path}`);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching company info:', error);
        }
      };
      fetchInfo();
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Image too large. Max 2MB allowed.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPhotoPreview(base64String);
        setFormData(prev => ({ ...prev, photo_path: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleValidate = async () => {
    try {
      const result = await window.electronAPI.companyInfo.update(formData);
      if (result.success) {
        toast.success(t('userInfo.success'));
        onClose();
      } else {
        toast.error('Error saving: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving company info:', error);
      toast.error('Network error saving info');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-lg bg-white p-0 border-0 shadow-2xl ${direction === 'rtl' ? 'rtl' : ''}`} onClose={onClose}>
        <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
          <DialogTitle className="text-lg font-bold text-slate-800">
            {t('userInfo.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 overflow-y-auto max-h-[80vh]">
          <div className="flex justify-center mb-5">
            <div
              onClick={handlePhotoClick}
              className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-50/30 transition-all overflow-hidden bg-slate-50/50 group"
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={t('userInfo.photoPreview')}
                  className="w-full h-full object-contain"
                />
              ) : (
                <>
                  <Image className="w-6 h-6 text-slate-400 mb-1 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[11px] font-medium text-slate-500">{t('userInfo.companyLogo')}</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">{t('userInfo.companyName')}</Label>
              <Input
                className="h-9 text-sm"
                value={formData.societe}
                onChange={(e) => handleInputChange('societe', e.target.value)}
                placeholder={t('userInfo.companyNamePlaceholder')}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">{t('userInfo.activity')}</Label>
              <Input
                className="h-9 text-sm"
                value={formData.activite}
                onChange={(e) => handleInputChange('activite', e.target.value)}
                placeholder={t('userInfo.activityPlaceholder')}
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">{t('userInfo.address')}</Label>
              <Input
                className="h-9 text-sm"
                value={formData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                placeholder={t('userInfo.addressPlaceholder')}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">{t('userInfo.phone')}</Label>
              <Input
                className="h-9 text-sm"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                placeholder="+213..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">{t('userInfo.fax')}</Label>
              <Input
                className="h-9 text-sm"
                value={formData.fax}
                onChange={(e) => handleInputChange('fax', e.target.value)}
                placeholder="+213..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">{t('userInfo.nif')}</Label>
              <Input
                className="h-9 text-sm"
                value={formData.nif}
                onChange={(e) => handleInputChange('nif', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">{t('userInfo.nis')}</Label>
              <Input
                className="h-9 text-sm"
                value={formData.nis}
                onChange={(e) => handleInputChange('nis', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">{t('userInfo.ai')}</Label>
              <Input
                className="h-9 text-sm"
                value={formData.ai}
                onChange={(e) => handleInputChange('ai', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">{t('userInfo.bank')}</Label>
              <Input
                className="h-9 text-sm"
                value={formData.bank}
                onChange={(e) => handleInputChange('bank', e.target.value)}
                placeholder={t('userInfo.bankPlaceholder')}
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">{t('userInfo.accountNumber')}</Label>
              <Input
                className="h-9 text-sm"
                value={formData.account_number}
                onChange={(e) => handleInputChange('account_number', e.target.value)}
                placeholder={t('userInfo.accountNumberPlaceholder')}
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50/50 flex items-center justify-end gap-3">
          <Button variant="ghost" className="h-9 px-4 text-slate-500 hover:text-slate-700" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={handleValidate}>
            <Save className="w-4 h-4 mr-2" />
            {t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

