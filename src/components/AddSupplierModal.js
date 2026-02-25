import React, { useState, useEffect } from 'react';
import { X, Building2, Phone, FileText, DollarSign, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import apiService from '../services/api';

export default function AddSupplierModal({ isOpen, onClose, supplier = null }) {
  const isEdit = !!supplier;
  const { language, direction } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nomEntreprise: '',
    codeSupplier: '',
    telephone: '',
    email: '',
    adresse: '',
    categorieActivite: '',
    nif: '',
    nis: '',
    rc: '',
    ai: '',
    solde: '',
    typeSolde: 'positif'
  });

  const [errors, setErrors] = useState({});
  const [supplierCategories, setSupplierCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  const loadCategories = async () => {
    try {
      const result = await window.electronAPI.supplierCategories.getAll();
      if (result.success) {
        setSupplierCategories(result.data);
      }
    } catch (error) {
      console.error('Error loading supplier categories:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (isEdit) {
        setFormData({
          nomEntreprise: supplier.nomEntreprise || '',
          codeSupplier: supplier.codeSupplier || '',
          telephone: supplier.telephone || '',
          email: supplier.email || '',
          adresse: supplier.adresse || '',
          categorieActivite: supplier.categorieActivite || '',
          nif: supplier.nif || '',
          nis: supplier.nis || '',
          rc: supplier.rc || '',
          ai: supplier.ai || '',
          solde: supplier.solde?.toString() || '',
          typeSolde: supplier.typeSolde || 'positif'
        });
      } else {
        setFormData({
          nomEntreprise: '',
          codeSupplier: generateCode(),
          telephone: '',
          email: '',
          adresse: '',
          categorieActivite: '',
          nif: '',
          nis: '',
          rc: '',
          ai: '',
          solde: '',
          typeSolde: 'positif'
        });
      }
    }
  }, [isOpen, supplier, isEdit]);

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    setIsCategoryLoading(true);
    try {
      const result = await window.electronAPI.supplierCategories.create(name);
      if (result.success) {
        setNewCategoryName('');
        setIsAddingCategory(false);
        await loadCategories();
        handleInputChange('categorieActivite', name);
        toast.success(language === 'ar' ? 'تمت إضافة الفئة' : 'Catégorie ajoutée');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error.message);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  if (!isOpen) return null;

  const generateCode = () => {
    const now = new Date();
    const year = now.getFullYear().toString().substr(-2);
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `FORN${year}${random}`;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nomEntreprise.trim()) {
      newErrors.nomEntreprise = language === 'ar' ? 'اسم الشركة مطلوب' : 'Nom de l\'entreprise requis';
    }
    if (!formData.codeSupplier.trim()) {
      newErrors.codeSupplier = language === 'ar' ? 'كود المورد مطلوب' : 'Code fournisseur requis';
    }
    if (!formData.telephone.trim()) {
      newErrors.telephone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Téléphone requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(language === 'ar' ? 'يرجى تصحيح الأخطاء' : 'Veuillez corriger les erreurs');
      return;
    }

    setIsLoading(true);

    try {
      // Convert solde to number
      const supplierData = {
        ...formData,
        solde: formData.solde ? parseFloat(formData.solde) : 0
      };

      const result = isEdit
        ? await apiService.updateSupplier(supplier.id, supplierData)
        : await apiService.createSupplier(supplierData);

      if (result.success) {
        toast.success(isEdit
          ? (language === 'ar' ? 'تم تحديث المورد بنجاح' : 'Fournisseur mis à jour avec succès')
          : (language === 'ar' ? 'تم إضافة المورد بنجاح' : 'Fournisseur ajouté avec succès')
        );
        onClose();
        if (!isEdit) {
          setFormData({
            nomEntreprise: '',
            codeSupplier: '',
            telephone: '',
            email: '',
            adresse: '',
            categorieActivite: '',
            nif: '',
            nis: '',
            rc: '',
            ai: '',
            solde: '',
            typeSolde: 'positif'
          });
        }
        setErrors({});

        // Trigger a refresh event if parent component needs to reload data
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('supplierUpdated'));
        }
      } else {
        toast.error(result.error || (language === 'ar' ? 'حدث خطأ أثناء الإضافة' : 'Erreur lors de l\'ajout'));
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء الإضافة' : 'Erreur lors de l\'ajout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg w-full max-w-4xl max-h-[85vh] flex flex-col shadow-xl"
        style={{ border: '2px solid #1b1b1b' }}
      >
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEdit
                    ? (language === 'ar' ? 'تعديل مورد' : 'Modifier un Fournisseur')
                    : (language === 'ar' ? 'إضافة مورد' : 'Ajouter un Fournisseur')}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEdit
                    ? (language === 'ar' ? 'تعديل بيانات المورد' : 'Modifier les informations du fournisseur')
                    : (language === 'ar' ? 'تسجيل مورد جديد' : 'Enregistrer un nouveau fournisseur')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="border border-gray-200 rounded-lg p-5 bg-white">
              <h4 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                {language === 'ar' ? 'معلومات الشركة' : 'Informations de l\'entreprise'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'اسم الشركة' : 'Nom de l\'entreprise'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.nomEntreprise}
                    onChange={(e) => handleInputChange('nomEntreprise', e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: شركة ألفا' : 'Ex: Société ALPHA'}
                    className={errors.nomEntreprise ? 'border-red-500' : ''}
                  />
                  {errors.nomEntreprise && <p className="text-red-500 text-xs mt-1">{errors.nomEntreprise}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'كود المورد' : 'Code fournisseur'} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={formData.codeSupplier || generateCode()}
                      onChange={(e) => handleInputChange('codeSupplier', e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: FORN001' : 'Ex: FORN001'}
                      className={errors.codeSupplier ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleInputChange('codeSupplier', generateCode())}
                      className="text-xs"
                    >
                      {language === 'ar' ? 'توليد' : 'Générer'}
                    </Button>
                  </div>
                  {errors.codeSupplier && <p className="text-red-500 text-xs mt-1">{errors.codeSupplier}</p>}
                </div>

                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'فئة النشاط' : 'Catégorie d\'activité'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(!isAddingCategory)}
                      className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      {language === 'ar' ? 'إضافة فئة' : 'Ajouter une catégorie'}
                    </button>
                  </div>

                  {isAddingCategory ? (
                    <div className="flex gap-2 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <Input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder={language === 'ar' ? 'اسم الفئة الجديدة' : 'Nom de la nouvelle catégorie'}
                        className="text-sm h-9"
                        autoFocus
                      />
                      <Button
                        type="button"
                        onClick={handleAddCategory}
                        size="sm"
                        disabled={isCategoryLoading}
                        className="bg-green-600 hover:bg-green-700 h-9"
                      >
                        {isCategoryLoading ? '...' : (language === 'ar' ? 'إضافة' : 'Ajouter')}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsAddingCategory(false)}
                        size="sm"
                        className="h-9"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Annuler'}
                      </Button>
                    </div>
                  ) : null}

                  <select
                    value={formData.categorieActivite}
                    onChange={(e) => handleInputChange('categorieActivite', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">{language === 'ar' ? 'اختر فئة' : 'Sélectionner une catégorie'}</option>
                    {/* Default categories */}
                    <option value="Alimentaire">Alimentaire</option>
                    <option value="Textile">Textile</option>
                    <option value="Électronique">Électronique</option>
                    <option value="Construction">Construction</option>
                    <option value="Service">Service</option>
                    {/* Database categories */}
                    {supplierCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    <option value="Autre">{language === 'ar' ? 'أخرى' : 'Autre'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Coordonnées */}
            <div className="border border-gray-200 rounded-lg p-5 bg-white">
              <h4 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                {language === 'ar' ? 'معلومات الاتصال' : 'Coordonnées'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الهاتف' : 'Téléphone'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: 0555 123 456' : 'Ex: 0555 123 456'}
                    className={errors.telephone ? 'border-red-500' : ''}
                  />
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: contact@entreprise.dz' : 'Ex: contact@entreprise.dz'}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'العنوان' : 'Adresse'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => handleInputChange('adresse', e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: المنطقة الصناعية، طريق البليدة' : 'Ex: Zone Industrielle, Route de Blida'}
                  />
                </div>
              </div>
            </div>

            {/* Informations fiscales */}
            <div className="border border-gray-200 rounded-lg p-5 bg-white">
              <h4 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                {language === 'ar' ? 'المعلومات الضريبية' : 'Informations fiscales'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIF ({language === 'ar' ? 'الرقم الضريبي' : 'Numéro d\'Identification Fiscale'})
                  </label>
                  <Input
                    type="text"
                    value={formData.nif}
                    onChange={(e) => handleInputChange('nif', e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: 000000000000000' : 'Ex: 000000000000000'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIS ({language === 'ar' ? 'الرقم الإحصائي' : 'Numéro d\'Identification Statistique'})
                  </label>
                  <Input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => handleInputChange('nis', e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: 000000000000000' : 'Ex: 000000000000000'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RC ({language === 'ar' ? 'سجل التجاري' : 'Registre de Commerce'})
                  </label>
                  <Input
                    type="text"
                    value={formData.rc}
                    onChange={(e) => handleInputChange('rc', e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: 00/00-0000000-B00' : 'Ex: 00/00-0000000-B00'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI ({language === 'ar' ? 'مادة الضريبة' : 'Article d\'Imposition'})
                  </label>
                  <Input
                    type="text"
                    value={formData.ai}
                    onChange={(e) => handleInputChange('ai', e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: 00000000000000' : 'Ex: 00000000000000'}
                  />
                </div>
              </div>
            </div>

            {/* Solde */}
            <div className="border border-gray-200 rounded-lg p-5 bg-white">
              <h4 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                {language === 'ar' ? 'الرصيد الأولي' : 'Solde initial'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'مبلغ الرصيد (د.ج)' : 'Montant du solde (DZD)'}
                  </label>
                  <Input
                    type="number"
                    value={formData.solde}
                    onChange={(e) => handleInputChange('solde', e.target.value)}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'نوع الرصيد' : 'Type de solde'}
                  </label>
                  <select
                    value={formData.typeSolde}
                    onChange={(e) => handleInputChange('typeSolde', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="positif">{language === 'ar' ? 'دائن (+)' : 'Crédit (+)'}</option>
                    <option value="negatif">{language === 'ar' ? 'مدين (-)' : 'Débit (-)'}</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700">
                  <span className="font-medium">{language === 'ar' ? 'دائن (+)' : 'Crédit (+)'}</span> : {language === 'ar' ? 'المورد مدين لنا' : 'Le fournisseur nous doit de l\'argent'}<br />
                  <span className="font-medium">{language === 'ar' ? 'مدين (-)' : 'Débit (-)'}</span> : {language === 'ar' ? 'نحن مدينون للمورد' : 'Nous devons de l\'argent au fournisseur'}
                </p>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {language === 'ar' ? 'إلغاء' : 'Annuler'}
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {language === 'ar' ? 'حفظ...' : 'Enregistrement...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'حفظ' : 'Enregistrer'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
