import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, X, Check, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function CreateWorkerModal({ isOpen, onClose, onSave }) {
  const { direction, t, language } = useLanguage();
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

  const handlePhotoUpload = () => {
    console.log('Upload photo functionality');
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
                {t('worker.title')}
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
                className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center cursor-pointer hover:border-slate-400 transition-colors bg-slate-50"
                onClick={handlePhotoUpload}
              >
                {formData.photo ? (
                  <img 
                    src={formData.photo} 
                    alt={t('worker.photoAlt')} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Upload className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <Label className="text-xs text-slate-600 mt-1 text-center">
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

