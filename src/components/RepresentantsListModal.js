import React, { useState } from 'react';
import { X, Users, Search, Plus, Edit, Trash2, Mail, Phone, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';

export default function RepresentantsListModal({ 
  isOpen, 
  onClose, 
  onSelectRepresentant 
}) {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRepresentant, setEditingRepresentant] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    numero: '',
    email: ''
  });
  const [errors, setErrors] = useState({});

  // Mock data for représentants
  const [representants, setRepresentants] = useState([
    {
      id: '1',
      nom: 'Benali',
      prenom: 'Ahmed',
      numero: '+213 555 123 456',
      email: 'ahmed.benali@logisoft.dz'
    },
    {
      id: '2',
      nom: 'Larbi',
      prenom: 'Fatima',
      numero: '+213 555 234 567',
      email: 'fatima.larbi@logisoft.dz'
    },
    {
      id: '3',
      nom: 'Khelil',
      prenom: 'Omar',
      numero: '+213 555 345 678',
      email: 'omar.khelil@logisoft.dz'
    },
    {
      id: '4',
      nom: 'Meziane',
      prenom: 'Salima',
      numero: '+213 555 456 789',
      email: 'salima.meziane@logisoft.dz'
    }
  ]);

  if (!isOpen) return null;

  const filteredRepresentants = representants.filter(rep =>
    rep.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.numero.includes(searchTerm) ||
    rep.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = language === 'ar' ? 'الاسم مطلوب' : 'Le nom est requis';
    }
    
    if (!formData.prenom.trim()) {
      newErrors.prenom = language === 'ar' ? 'اللقب مطلوب' : 'Le prénom est requis';
    }
    
    if (!formData.numero.trim()) {
      newErrors.numero = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Le numéro est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveRepresentant = () => {
    if (!validateForm()) return;

    if (editingRepresentant) {
      // Update existing représentant
      setRepresentants(prev => prev.map(rep => 
        rep.id === editingRepresentant.id 
          ? { ...rep, ...formData }
          : rep
      ));
    } else {
      // Add new représentant
      const newRepresentant = {
        id: Date.now().toString(),
        ...formData
      };
      setRepresentants(prev => [...prev, newRepresentant]);
    }

    // Reset form
    setFormData({ nom: '', prenom: '', numero: '', email: '' });
    setShowAddForm(false);
    setEditingRepresentant(null);
    setErrors({});
  };

  const handleEditRepresentant = (representant) => {
    setFormData({
      nom: representant.nom,
      prenom: representant.prenom,
      numero: representant.numero,
      email: representant.email
    });
    setEditingRepresentant(representant);
    setShowAddForm(true);
    setErrors({});
  };

  const handleDeleteRepresentant = (id) => {
    setRepresentants(prev => prev.filter(rep => rep.id !== id));
  };

  const handleCancelForm = () => {
    setFormData({ nom: '', prenom: '', numero: '', email: '' });
    setShowAddForm(false);
    setEditingRepresentant(null);
    setErrors({});
  };

  const handleSelectRepresentant = (representant) => {
    if (onSelectRepresentant) {
      onSelectRepresentant(representant);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        style={{ border: '2px solid #1b1b1b' }}
      >
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {language === 'ar' ? 'قائمة المندوبين' : 'Liste des Représentants'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          {/* Search and Add Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={language === 'ar' ? 'البحث...' : 'Rechercher...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'إضافة مندوب' : 'Ajouter'}
            </Button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                {editingRepresentant 
                  ? (language === 'ar' ? 'تعديل المندوب' : 'Modifier le Représentant')
                  : (language === 'ar' ? 'إضافة مندوب جديد' : 'Nouveau Représentant')
                }
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'الاسم' : 'Nom'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder={language === 'ar' ? 'اسم العائلة' : 'Nom de famille'}
                    className={errors.nom ? 'border-red-500' : ''}
                  />
                  {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
                </div>

                {/* Prénom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'اللقب' : 'Prénom'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    placeholder={language === 'ar' ? 'الاسم الأول' : 'Prénom'}
                    className={errors.prenom ? 'border-red-500' : ''}
                  />
                  {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
                </div>

                {/* Numéro */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline-block mr-1" />
                    {language === 'ar' ? 'رقم الهاتف' : 'Numéro'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="+213 555 123 456"
                    className={errors.numero ? 'border-red-500' : ''}
                  />
                  {errors.numero && <p className="text-red-500 text-xs mt-1">{errors.numero}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline-block mr-1" />
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="representant@logisoft.dz"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelForm}
                >
                  {language === 'ar' ? 'إلغاء' : 'Annuler'}
                </Button>
                <Button
                  onClick={handleSaveRepresentant}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingRepresentant 
                    ? (language === 'ar' ? 'تحديث' : 'Modifier')
                    : (language === 'ar' ? 'حفظ' : 'Enregistrer')
                  }
                </Button>
              </div>
            </div>
          )}

          {/* Représentants List */}
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
              <div className="grid grid-cols-12 gap-4 font-medium text-gray-700">
                <div className="col-span-3">{language === 'ar' ? 'الاسم الكامل' : 'Nom Complet'}</div>
                <div className="col-span-3">{language === 'ar' ? 'رقم الهاتف' : 'Numéro'}</div>
                <div className="col-span-4">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</div>
                <div className="col-span-2 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredRepresentants.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  {language === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat trouvé'}
                </div>
              ) : (
                filteredRepresentants.map((representant) => (
                  <div 
                    key={representant.id} 
                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onSelectRepresentant && handleSelectRepresentant(representant)}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Nom Complet */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {representant.prenom} {representant.nom}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Numéro */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{representant.numero}</span>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{representant.email}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditRepresentant(representant);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRepresentant(representant.id);
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 text-sm text-gray-500 text-center">
            {filteredRepresentants.length} {language === 'ar' ? 'مندوب' : 'représentant(s)'} 
            {searchTerm && (
              <span>
                {' '} - {language === 'ar' ? 'تم العثور على' : 'trouvé(s) pour'} "{searchTerm}"
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        {!onSelectRepresentant && (
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={onClose}
              >
                {language === 'ar' ? 'إغلاق' : 'Fermer'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
