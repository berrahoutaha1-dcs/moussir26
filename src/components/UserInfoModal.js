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
    artImp: '',
    nis: ''
  });
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleValidate = () => {
    toast.success(t('userInfo.success'));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-2xl bg-white p-0 border-0 shadow-xl ${direction === 'rtl' ? 'rtl' : ''}`} onClose={onClose}>
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl text-blue-600">
              {t('userInfo.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-600 mt-2">
            {t('userInfo.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="text-center">
              <div 
                onClick={handlePhotoClick}
                className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt={t('userInfo.photoPreview')} 
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <>
                    <Image className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">{t('userInfo.companyLogo')}</span>
                    <span className="text-xs text-slate-400">{t('userInfo.clickToChoose')}</span>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('userInfo.companyName')}</Label>
              <Input
                value={formData.societe}
                onChange={(e) => handleInputChange('societe', e.target.value)}
                placeholder={t('userInfo.companyNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('userInfo.activity')}</Label>
              <Input
                value={formData.activite}
                onChange={(e) => handleInputChange('activite', e.target.value)}
                placeholder={t('userInfo.activityPlaceholder')}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>{t('userInfo.address')}</Label>
              <Input
                value={formData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                placeholder={t('userInfo.addressPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('userInfo.phone')}</Label>
              <Input
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                placeholder="+213 555 123 456"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('userInfo.fax')}</Label>
              <Input
                value={formData.fax}
                onChange={(e) => handleInputChange('fax', e.target.value)}
                placeholder="+213 555 123 456"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('userInfo.nif')}</Label>
              <Input
                value={formData.nif}
                onChange={(e) => handleInputChange('nif', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('userInfo.nis')}</Label>
              <Input
                value={formData.nis}
                onChange={(e) => handleInputChange('nis', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleValidate}>
            <Save className="w-4 h-4 mr-2" />
            {t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

