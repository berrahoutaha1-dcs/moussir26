import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar, Clock, User, Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function PlanificationModal({ isOpen, onClose, onSubmit }) {
  const { direction, t, language } = useLanguage();
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    serviceDescription: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: ''
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
    
    if (!formData.clientName.trim()) {
      newErrors.clientName = language === 'ar' ? 'اسم العميل مطلوب' : 'Le nom du client est requis';
    }
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = language === 'ar' ? 'التاريخ مطلوب' : 'La date est requise';
    }
    if (!formData.scheduledTime) {
      newErrors.scheduledTime = language === 'ar' ? 'الوقت مطلوب' : 'L\'heure est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      onSubmit(formData);
    }
    toast.success(language === 'ar' ? 'تم إنشاء التخطيط بنجاح' : 'Planning créé avec succès');
    setFormData({
      clientName: '',
      clientPhone: '',
      serviceDescription: '',
      scheduledDate: '',
      scheduledTime: '',
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-2xl bg-white p-0 border-0 shadow-xl ${direction === 'rtl' ? 'rtl' : ''}`} onClose={onClose}>
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl" style={{ color: '#1b1b1b' }}>
              {direction === 'rtl' ? 'إضافة تخطيط جديد' : 'Nouveau planning'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-600 mt-2">
            {direction === 'rtl' ? 'إنشاء تخطيط جديد لعميل' : 'Créer un nouveau planning pour un client'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {direction === 'rtl' ? 'اسم العميل' : 'Nom du client'} *
              </Label>
              <Input
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder={direction === 'rtl' ? 'أدخل اسم العميل' : 'Entrez le nom du client'}
                className={errors.clientName ? 'border-red-500' : ''}
              />
              {errors.clientName && <p className="text-sm text-red-500">{errors.clientName}</p>}
            </div>

            <div className="space-y-2">
              <Label>
                {direction === 'rtl' ? 'هاتف العميل' : 'Téléphone du client'}
              </Label>
              <Input
                value={formData.clientPhone}
                onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                placeholder="+213 555 123 456"
              />
            </div>

            <div className="space-y-2">
              <Label>
                {direction === 'rtl' ? 'التاريخ' : 'Date'} *
              </Label>
              <Input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                className={errors.scheduledDate ? 'border-red-500' : ''}
              />
              {errors.scheduledDate && <p className="text-sm text-red-500">{errors.scheduledDate}</p>}
            </div>

            <div className="space-y-2">
              <Label>
                {direction === 'rtl' ? 'الوقت' : 'Heure'} *
              </Label>
              <Input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                className={errors.scheduledTime ? 'border-red-500' : ''}
              />
              {errors.scheduledTime && <p className="text-sm text-red-500">{errors.scheduledTime}</p>}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>
                {direction === 'rtl' ? 'وصف الخدمة' : 'Description du service'}
              </Label>
              <Textarea
                value={formData.serviceDescription}
                onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                placeholder={direction === 'rtl' ? 'أدخل وصف الخدمة' : 'Entrez la description du service'}
                rows={3}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>
                {direction === 'rtl' ? 'ملاحظات' : 'Notes'}
              </Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder={direction === 'rtl' ? 'ملاحظات إضافية' : 'Notes supplémentaires'}
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {direction === 'rtl' ? 'إلغاء' : 'Annuler'}
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            {direction === 'rtl' ? 'حفظ' : 'Enregistrer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

