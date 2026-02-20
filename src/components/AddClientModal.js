import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  Camera,
  Upload,
  Plus,
  Check,
  AlertCircle,
  UserCheck,
  Hash,
  Briefcase,
  CreditCard,
  Save,
  ChevronDown,
  Search,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

export default function AddClientModal({ isOpen, onClose, initialData = null }) {
  const { language, direction } = useLanguage();
  const isEditMode = !!initialData;
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRepresentantDropdown, setShowRepresentantDropdown] = useState(false);
  const [representantSearch, setRepresentantSearch] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    reference: '',
    nom: '',
    prenom: '',
    activite: '',
    representant: '',
    adresse: '',
    telephone01: '',
    telephone02: '',
    email: '',
    rc: '',
    nif: '',
    nis: '',
    ai: '',
    soldPaye: 0,
    dette: 0,
    photo: null
  });

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          reference: initialData.id ? `CLT-${initialData.id}` : '',
          nom: initialData.nom || '',
          prenom: initialData.prenom || '',
          activite: initialData.activite || '',
          representant: initialData.representantId || '', // Handle mapping if needed
          adresse: initialData.adresse || '',
          telephone01: initialData.numero || initialData.telephone01 || '',
          telephone02: initialData.telephone02 || '',
          email: initialData.email || '',
          rc: initialData.rc || '',
          nif: initialData.nif || '',
          nis: initialData.nis || '',
          ai: initialData.ai || '',
          soldPaye: initialData.soldPaye || 0,
          dette: initialData.dette || (initialData.solde < 0 ? Math.abs(initialData.solde) : 0),
          photo: null
        });
        setPhotoPreview(null); // Or use photo from data if available
      } else {
        setFormData({
          reference: '',
          nom: '',
          prenom: '',
          activite: '',
          representant: '',
          adresse: '',
          telephone01: '',
          telephone02: '',
          email: '',
          rc: '',
          nif: '',
          nis: '',
          ai: '',
          soldPaye: 0,
          dette: 0,
          photo: null
        });
        setPhotoPreview(null);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const [errors, setErrors] = useState({});

  // Mock representatives data
  const mockRepresentatives = [
    {
      id: '1',
      nom: 'Kaci',
      prenom: 'Mohamed',
      email: 'mohamed.kaci@logisoft.dz',
      telephone: '+213 555 123 456',
      zone: 'Alger Centre'
    },
    {
      id: '2',
      nom: 'Meziane',
      prenom: 'Salim',
      email: 'salim.meziane@logisoft.dz',
      telephone: '+213 555 789 012',
      zone: 'Oran'
    },
    {
      id: '3',
      nom: 'Boumediene',
      prenom: 'Rachid',
      email: 'rachid.boumediene@logisoft.dz',
      telephone: '+213 555 345 678',
      zone: 'Constantine'
    }
  ];

  if (!isOpen) return null;

  const generateReference = () => {
    const now = new Date();
    const year = now.getFullYear().toString().substr(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `CLT${year}${month}${random}`;
  };

  const handleInputChange = (field, value) => {
    // Handle numeric fields for balance
    if (field === 'soldPaye' || field === 'dette') {
      const numericValue = parseFloat(value) || 0;
      setFormData(prev => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(language === 'ar' ? 'يجب أن يكون الملف صورة' : 'Le fichier doit être une image');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(language === 'ar' ? 'حجم الصورة كبير جداً (الحد الأقصى 5MB)' : 'Image trop volumineuse (max 5MB)');
        return;
      }

      setFormData(prev => ({ ...prev, photo: file }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result);
      };
      reader.readAsDataURL(file);

      toast.success(language === 'ar' ? 'تم تحميل الصورة بنجاح' : 'Photo téléchargée avec succès');
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = language === 'ar' ? 'الاسم مطلوب' : 'Nom requis';
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = language === 'ar' ? 'اللقب مطلوب' : 'Prénom requis';
    }

    if (!formData.telephone01.trim()) {
      newErrors.telephone01 = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Téléphone requis';
    } else if (!/^(\+213|0)[0-9]{9}$/.test(formData.telephone01.replace(/\s/g, ''))) {
      newErrors.telephone01 = language === 'ar' ? 'رقم هاتف غير صالح' : 'Numéro de téléphone invalide';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'ar' ? 'بريد إلكتروني غير صالح' : 'Email invalide';
    }

    if (!formData.representant) {
      newErrors.representant = language === 'ar' ? 'المندوب مطلوب' : 'Représentant requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error(language === 'ar' ? 'يرجى تصحيح الأخطاء' : 'Veuillez corriger les erreurs');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!formData.reference) {
        setFormData(prev => ({ ...prev, reference: generateReference() }));
      }

      toast.success(language === 'ar' ? 'تم إضافة العميل بنجاح' : 'Client ajouté avec succès');

      setFormData({
        reference: '',
        nom: '',
        prenom: '',
        activite: '',
        representant: '',
        adresse: '',
        telephone01: '',
        telephone02: '',
        email: '',
        rc: '',
        nif: '',
        nis: '',
        ai: '',
        soldPaye: 0,
        dette: 0,
        photo: null
      });
      setPhotoPreview(null);
      setErrors({});

      onClose();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إضافة العميل' : 'Erreur lors de l\'ajout du client');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRepresentatives = mockRepresentatives.filter(rep =>
    `${rep.prenom} ${rep.nom}`.toLowerCase().includes(representantSearch.toLowerCase()) ||
    rep.zone.toLowerCase().includes(representantSearch.toLowerCase())
  );

  const selectedRepresentative = mockRepresentatives.find(rep => rep.id === formData.representant);

  const totalBalance = (formData.dette || 0) - (formData.soldPaye || 0);

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-[150] p-4">
      <div className="modal-container max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="modal-header-icon">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="modal-header-title">
                {isEditMode
                  ? (language === 'ar' ? 'تعديل بيانات العميل' : 'Modifier le Client')
                  : (language === 'ar' ? 'إضافة عميل جديد' : 'Ajouter un Client')
                }
              </h2>
            </div>
            <button
              onClick={onClose}
              className="modal-close-button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 modal-body-scroll"
          onWheel={(e) => {
            if (e.currentTarget) {
              e.currentTarget.scrollTop += e.deltaY;
            }
          }}
        >
          <div className="space-y-6">

            {/* Informations de Base */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                {language === 'ar' ? 'المعلومات الأساسية' : 'Informations de Base'}
              </h3>

              {/* Photo Upload Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-white">
                    {photoPreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={photoPreview}
                          alt="Client preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <Camera className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      className="mb-2"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'صورة' : 'Photo'}
                    </Button>
                    <p className="text-xs text-gray-500">
                      JPG, PNG (max 5MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline-block mr-1" />
                    {language === 'ar' ? 'المرجع' : 'Référence'}
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => handleInputChange('reference', e.target.value)}
                      placeholder={language === 'ar' ? 'تلقائي' : 'Auto-généré'}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      onClick={() => handleInputChange('reference', generateReference())}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 bg-blue-100 text-blue-600 hover:bg-blue-200"
                      size="sm"
                    >
                      <Hash className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'الاسم' : 'Nom'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    placeholder={language === 'ar' ? 'اسم العائلة' : 'Nom de famille'}
                    className={errors.nom ? 'border-red-500' : ''}
                  />
                  {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
                </div>

                {/* Prenom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'اللقب' : 'Prénom'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                    placeholder={language === 'ar' ? 'الاسم الأول' : 'Prénom'}
                    className={errors.prenom ? 'border-red-500' : ''}
                  />
                  {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
                </div>

                {/* Activité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline-block mr-1" />
                    {language === 'ar' ? 'النشاط' : 'Activité'}
                    <span className="text-gray-400 text-xs ml-1">
                      ({language === 'ar' ? 'اختياري' : 'optionnel'})
                    </span>
                  </label>
                  <Input
                    type="text"
                    value={formData.activite}
                    onChange={(e) => handleInputChange('activite', e.target.value)}
                    placeholder={language === 'ar' ? 'نوع النشاط التجاري' : 'Type d\'activité commerciale'}
                  />
                </div>

                {/* Représentant */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserCheck className="w-4 h-4 inline-block mr-1" />
                    {language === 'ar' ? 'المندوب' : 'Représentant'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div
                      className={`w-full px-3 py-2 border rounded-md bg-white cursor-pointer flex items-center justify-between ${errors.representant ? 'border-red-500' : 'border-gray-300'
                        }`}
                      onClick={() => setShowRepresentantDropdown(!showRepresentantDropdown)}
                    >
                      <span className={selectedRepresentative ? 'text-gray-900' : 'text-gray-500'}>
                        {selectedRepresentative
                          ? `${selectedRepresentative.prenom} ${selectedRepresentative.nom}`
                          : (language === 'ar' ? 'اختر مندوباً' : 'Sélectionner un représentant')
                        }
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>

                    {showRepresentantDropdown && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-64 overflow-y-auto">
                        {/* Search */}
                        <div className="p-3 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              type="text"
                              value={representantSearch}
                              onChange={(e) => setRepresentantSearch(e.target.value)}
                              placeholder={language === 'ar' ? 'البحث عن مندوب...' : 'Rechercher un représentant...'}
                              className="pl-10 h-8"
                            />
                          </div>
                        </div>

                        {/* Representatives List */}
                        <div className="max-h-48 overflow-y-auto">
                          {filteredRepresentatives.map((rep) => (
                            <div
                              key={rep.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                handleInputChange('representant', rep.id);
                                setShowRepresentantDropdown(false);
                                setRepresentantSearch('');
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {rep.prenom} {rep.nom}
                                  </div>
                                  <div className="text-sm text-gray-500">{rep.zone}</div>
                                </div>
                                <div className="text-xs text-gray-400">
                                  {rep.telephone}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.representant && <p className="text-red-500 text-xs mt-1">{errors.representant}</p>}
                </div>

                {/* Address */}
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline-block mr-1" />
                    {language === 'ar' ? 'العنوان' : 'Adresse'}
                  </label>
                  <Input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => handleInputChange('adresse', e.target.value)}
                    placeholder={language === 'ar' ? 'العنوان الكامل' : 'Adresse complète'}
                  />
                </div>
              </div>
            </div>

            {/* Informations de Contact */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                {language === 'ar' ? 'معلومات الاتصال' : 'Informations de Contact'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Telephone 01 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline-block mr-1" />
                    {language === 'ar' ? 'الهاتف 01' : 'Téléphone 01'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.telephone01}
                    onChange={(e) => handleInputChange('telephone01', e.target.value)}
                    placeholder="+213 555 123 456"
                    className={errors.telephone01 ? 'border-red-500' : ''}
                  />
                  {errors.telephone01 && <p className="text-red-500 text-xs mt-1">{errors.telephone01}</p>}
                </div>

                {/* Telephone 02 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline-block mr-1" />
                    {language === 'ar' ? 'الهاتف 02' : 'Téléphone 02'}
                    <span className="text-gray-400 text-xs ml-1">
                      ({language === 'ar' ? 'اختياري' : 'optionnel'})
                    </span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.telephone02}
                    onChange={(e) => handleInputChange('telephone02', e.target.value)}
                    placeholder="+213 555 789 012"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline-block mr-1" />
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="client@exemple.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Informations Légales */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {language === 'ar' ? 'المعلومات القانونية' : 'Informations Légales'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RC */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline-block mr-1" />
                    RC
                  </label>
                  <Input
                    type="text"
                    value={formData.rc}
                    onChange={(e) => handleInputChange('rc', e.target.value)}
                    placeholder="16/00-123456B23"
                  />
                </div>

                {/* NIF */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CreditCard className="w-4 h-4 inline-block mr-1" />
                    NIF
                  </label>
                  <Input
                    type="text"
                    value={formData.nif}
                    onChange={(e) => handleInputChange('nif', e.target.value)}
                    placeholder="000016001234567"
                  />
                </div>

                {/* NIS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline-block mr-1" />
                    NIS
                  </label>
                  <Input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => handleInputChange('nis', e.target.value)}
                    placeholder="000016001234567"
                  />
                </div>

                {/* AI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline-block mr-1" />
                    AI
                  </label>
                  <Input
                    type="text"
                    value={formData.ai}
                    onChange={(e) => handleInputChange('ai', e.target.value)}
                    placeholder="16001234567"
                  />
                </div>
              </div>
            </div>

            {/* Situation Initiale */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {language === 'ar' ? 'الوضعية الأولية' : 'Situation Initiale'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sold Payé */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'رصيد مدفوع' : 'Sold Payé'}
                  </label>
                  <Input
                    type="number"
                    value={formData.soldPaye}
                    onChange={(e) => handleInputChange('soldPaye', e.target.value)}
                    placeholder="0.00"
                    className="font-bold text-green-600"
                  />
                </div>

                {/* Dette */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'دين' : 'Dette'}
                  </label>
                  <Input
                    type="number"
                    value={formData.dette}
                    onChange={(e) => handleInputChange('dette', e.target.value)}
                    placeholder="0.00"
                    className="font-bold text-red-600"
                  />
                </div>

                {/* Total */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'المجموع' : 'Total'}
                  </label>
                  <div className={`px-3 py-2 border rounded-md font-black text-lg ${totalBalance >= 0 ? 'text-red-700 bg-red-50 border-red-200' : 'text-green-700 bg-green-50 border-green-200'}`}>
                    {totalBalance.toLocaleString('fr-DZ')} DA
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">
                    {totalBalance >= 0
                      ? (language === 'ar' ? 'صافي الدين' : 'Dette Nette')
                      : (language === 'ar' ? 'رصيد لصالح العميل' : 'Crédit Client')}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="modal-button-secondary"
          >
            {language === 'ar' ? 'إلغاء' : 'Annuler'}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="modal-button-primary flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {language === 'ar' ? 'حفظ...' : 'Enregistrement...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode
                  ? (language === 'ar' ? 'حفظ التعديلات' : 'Enregistrer les modifications')
                  : (language === 'ar' ? 'حفظ' : 'Enregistrer')
                }
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
