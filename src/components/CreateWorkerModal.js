import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, X, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function CreateWorkerModal({ isOpen, onClose, onSave, worker }) {
  const { direction, t, language } = useLanguage();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    nomPrenom: '',
    dateNaissance: '',
    cin: '',
    adresse: '',
    fonction: '',
    dateEmbauche: '',
    salaire: 0,
    photo: ''
  });

  useEffect(() => {
    if (worker && isOpen) {
      setFormData({
        nomPrenom: worker.nomPrenom || '',
        dateNaissance: worker.dateNaissance || '',
        cin: worker.cin || '',
        adresse: worker.adresse || '',
        fonction: worker.fonction || '',
        dateEmbauche: worker.dateEmbauche || '',
        salaire: worker.salaire || 0,
        photo: worker.photo || ''
      });
    } else if (!worker && isOpen) {
      setFormData({
        nomPrenom: '',
        dateNaissance: '',
        cin: '',
        adresse: '',
        fonction: '',
        dateEmbauche: '',
        salaire: 0,
        photo: ''
      });
    }
  }, [worker, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.nomPrenom || !formData.cin) {
      toast.error(t('worker.error.nameRequired'));
      return;
    }

    onSave(formData);

    setFormData({
      nomPrenom: '',
      dateNaissance: '',
      cin: '',
      adresse: '',
      fonction: '',
      dateEmbauche: '',
      salaire: 0,
      photo: ''
    });

    onClose();
  };

  const handleCancel = () => {
    setFormData({
      nomPrenom: '',
      dateNaissance: '',
      cin: '',
      adresse: '',
      fonction: '',
      dateEmbauche: '',
      salaire: 0,
      photo: ''
    });
    onClose();
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Image too large. Max 2MB allowed.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md bg-white p-0 border-0 shadow-xl rounded-lg ${direction === 'rtl' ? 'rtl' : ''}`}>
        <DialogHeader className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white text-xs">📁</span>
            </div>
            <div>
              <DialogTitle className="text-sm text-slate-800">
                {worker ? t('worker.editTitle') : t('worker.title')}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                {t('worker.subtitle')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4">
          <div className={`flex ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-4`}>
            <div className="flex-1 space-y-3">
              <div>
                <Label className="text-xs text-slate-700 mb-1 block">
                  {t('worker.fullName')}
                </Label>
                <Input
                  value={formData.nomPrenom}
                  onChange={(e) => handleInputChange('nomPrenom', e.target.value)}
                  className="h-7 text-xs border border-slate-300 rounded px-2"
                  placeholder={t('worker.fullNamePlaceholder')}
                />
              </div>

              <div className={`flex ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-2`}>
                <div className="flex-1">
                  <Label className="text-xs text-slate-700 mb-1 block">
                    {t('worker.birthDate')}
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.dateNaissance}
                      onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                      className={`h-7 text-xs border border-slate-300 rounded px-2 ${direction === 'rtl' ? 'pl-8' : 'pr-8'}`}
                    />
                    <Calendar className={`absolute ${direction === 'rtl' ? 'left-2' : 'right-2'} top-1 w-3 h-3 text-slate-400`} />
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-slate-700 mb-1 block">
                    {t('worker.idNumber')}
                  </Label>
                  <Input
                    value={formData.cin}
                    onChange={(e) => handleInputChange('cin', e.target.value)}
                    className="h-7 text-xs border border-slate-300 rounded px-2"
                    placeholder={t('worker.idNumberPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-700 mb-1 block">
                  {t('worker.address')}
                </Label>
                <Input
                  value={formData.adresse}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
                  className="h-7 text-xs border border-slate-300 rounded px-2"
                  placeholder={t('worker.addressPlaceholder')}
                />
              </div>

              <div>
                <Label className="text-xs text-slate-700 mb-1 block">
                  {t('worker.position')}
                </Label>
                <Input
                  value={formData.fonction}
                  onChange={(e) => handleInputChange('fonction', e.target.value)}
                  className="h-7 text-xs border border-slate-300 rounded px-2"
                  placeholder={t('worker.positionPlaceholder')}
                />
              </div>

              <div className={`flex ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-2`}>
                <div className="flex-1">
                  <Label className="text-xs text-slate-700 mb-1 block">
                    {t('worker.hireDate')}
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.dateEmbauche}
                      onChange={(e) => handleInputChange('dateEmbauche', e.target.value)}
                      className={`h-7 text-xs border border-slate-300 rounded px-2 ${direction === 'rtl' ? 'pl-8' : 'pr-8'}`}
                    />
                    <Calendar className={`absolute ${direction === 'rtl' ? 'left-2' : 'right-2'} top-1 w-3 h-3 text-slate-400`} />
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-slate-700 mb-1 block">
                    {t('worker.salary')}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={formData.salaire}
                      onChange={(e) => handleInputChange('salaire', parseFloat(e.target.value) || 0)}
                      className={`h-7 text-xs border border-slate-300 rounded px-2 ${direction === 'rtl' ? 'pl-8' : 'pr-8'}`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                    <span className={`absolute ${direction === 'rtl' ? 'left-2' : 'right-2'} top-1 text-xs text-slate-500`}>DZD</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-20 flex flex-col items-center">
              <div
                className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all bg-slate-50 overflow-hidden group"
                onClick={handlePhotoClick}
              >
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt={t('worker.photoAlt')}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Label className="text-[10px] font-medium text-slate-500 mt-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={handlePhotoClick}>
                {t('worker.photo')}
              </Label>
            </div>
          </div>

          <div className={`flex ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-2 mt-6 pt-4 border-t border-slate-200`}>
            <Button
              onClick={handleCancel}
              className="flex-1 h-8 bg-red-500 hover:bg-red-600 text-white text-xs rounded flex items-center justify-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>{t('common.cancel')}</span>
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-8 bg-green-500 hover:bg-green-600 text-white text-xs rounded flex items-center justify-center space-x-1"
            >
              <Check className="w-3 h-3" />
              <span>{t('common.save')}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

