import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X, Check, UserPlus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function CreateUserModal({ isOpen, onClose, onCreateUser }) {
  const { direction, language } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    function: '',
    type: 'Administrateur'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.username) {
      return;
    }

    onCreateUser(formData);
    
    setFormData({
      username: '',
      fullName: '',
      function: '',
      type: 'Administrateur'
    });
    
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      username: '',
      fullName: '',
      function: '',
      type: 'Administrateur'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md bg-white p-0 border-0 shadow-xl rounded-lg ${direction === 'rtl' ? 'rtl' : ''}`}>
        <DialogHeader className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-sm text-slate-800">
                {language === 'ar' ? 'إنشاء مستخدم جديد' : 'Créer un nouvel utilisateur'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                {language === 'ar' ? 'يرجى إدخال معلومات المستخدم' : 'Veuillez saisir les informations de l\'utilisateur'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-3">
          <div>
            <Label className="text-xs text-slate-700 mb-1 block">
              {language === 'ar' ? 'اسم المستخدم' : 'Nom d\'utilisateur'} *
            </Label>
            <Input
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="h-7 text-xs border border-slate-300 rounded px-2"
              placeholder={language === 'ar' ? 'أدخل اسم المستخدم' : 'Saisir le nom d\'utilisateur'}
            />
          </div>

          <div>
            <Label className="text-xs text-slate-700 mb-1 block">
              {language === 'ar' ? 'الاسم الكامل' : 'Nom/Prénom'}
            </Label>
            <Input
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="h-7 text-xs border border-slate-300 rounded px-2"
              placeholder={language === 'ar' ? 'أدخل الاسم الكامل' : 'Saisir le nom complet'}
            />
          </div>

          <div>
            <Label className="text-xs text-slate-700 mb-1 block">
              {language === 'ar' ? 'الوظيفة' : 'Fonction'}
            </Label>
            <Input
              value={formData.function}
              onChange={(e) => handleInputChange('function', e.target.value)}
              className="h-7 text-xs border border-slate-300 rounded px-2"
              placeholder={language === 'ar' ? 'أدخل الوظيفة' : 'Saisir la fonction'}
            />
          </div>

          <div>
            <Label className="text-xs text-slate-700 mb-1 block">
              {language === 'ar' ? 'النوع' : 'Type'}
            </Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger className="h-7 text-xs border border-slate-300 rounded px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Administrateur">
                  {language === 'ar' ? 'مدير' : 'Administrateur'}
                </SelectItem>
                <SelectItem value="Utilisateur">
                  {language === 'ar' ? 'مستخدم' : 'Utilisateur'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={`flex ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-2 mt-6 pt-4 border-t border-slate-200`}>
            <Button
              onClick={handleCancel}
              className="flex-1 h-8 bg-red-500 hover:bg-red-600 text-white text-xs rounded flex items-center justify-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>{language === 'ar' ? 'إلغاء' : 'Annuler'}</span>
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-8 bg-green-500 hover:bg-green-600 text-white text-xs rounded flex items-center justify-center space-x-1"
            >
              <Check className="w-3 h-3" />
              <span>{language === 'ar' ? 'حفظ' : 'Valider'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}





