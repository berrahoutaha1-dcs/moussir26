import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Wrench, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Star,
  DollarSign,
  Tag,
  AlertCircle,
  CheckCircle,
  X,
  Settings
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function Services() {
  const { language, direction, t } = useLanguage();
  
  const [services, setServices] = useState([
    {
      id: '1',
      name: t('services.example1.name') || 'Installation logiciel',
      description: t('services.example1.desc') || 'Installation et configuration de logiciels',
      price: 2500,
      category: t('services.example1.category') || 'Installation',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: t('services.example2.name') || 'Maintenance préventive',
      description: t('services.example2.desc') || 'Maintenance préventive système',
      price: 5000,
      category: t('services.example2.category') || 'Maintenance',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: t('services.example3.name') || 'Formation utilisateur',
      description: t('services.example3.desc') || 'Formation complète pour nouveaux utilisateurs',
      price: 15000,
      category: t('services.example3.category') || 'Formation',
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Support technique',
      description: 'Support technique à distance',
      price: 1500,
      category: 'Support',
      createdAt: new Date().toISOString()
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });
  const [errors, setErrors] = useState({});
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);

  const [categories, setCategories] = useState([
    'Installation',
    'Maintenance', 
    'Formation',
    'Support',
    'Réparation',
    'Consultation',
    'Configuration',
    'Optimisation'
  ]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('services.error.required') || (language === 'ar' ? 'هذا الحقل مطلوب' : 'Ce champ est requis');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('services.error.required') || (language === 'ar' ? 'هذا الحقل مطلوب' : 'Ce champ est requis');
    }

    if (!formData.category.trim()) {
      newErrors.category = t('services.error.required') || (language === 'ar' ? 'هذا الحقل مطلوب' : 'Ce champ est requis');
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price < 100 || price > 100000) {
      newErrors.price = t('services.error.invalidPrice') || (language === 'ar' ? 'السعر يجب أن يكون بين 100 و 100000' : 'Le prix doit être entre 100 et 100000');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const serviceData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      createdAt: new Date().toISOString()
    };

    if (editingService) {
      // Update existing service
      setServices(services.map(service => 
        service.id === editingService.id 
          ? { ...serviceData, id: editingService.id }
          : service
      ));
      toast.success(t('services.success.updated') || (language === 'ar' ? 'تم تحديث الخدمة بنجاح' : 'Service mis à jour avec succès'));
    } else {
      // Add new service
      const newService = {
        ...serviceData,
        id: Date.now().toString()
      };
      setServices([...services, newService]);
      toast.success(t('services.success.added') || (language === 'ar' ? 'تم إضافة الخدمة بنجاح' : 'Service ajouté avec succès'));
    }

    handleCloseModal();
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      category: service.category
    });
    setIsModalOpen(true);
  };

  const handleDelete = (serviceId) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Êtes-vous sûr de vouloir supprimer ce service ?')) {
      setServices(services.filter(service => service.id !== serviceId));
      toast.success(t('services.success.deleted') || (language === 'ar' ? 'تم حذف الخدمة بنجاح' : 'Service supprimé avec succès'));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: ''
    });
    setErrors({});
  };

  const handleAddCategory = () => {
    if (categoryFormData.name.trim()) {
      if (editingCategoryIndex !== null) {
        // Edit existing category
        const updatedCategories = [...categories];
        updatedCategories[editingCategoryIndex] = categoryFormData.name.trim();
        setCategories(updatedCategories);
        toast.success(language === 'ar' ? 'تم تعديل الفئة بنجاح' : 'Catégorie modifiée avec succès');
      } else {
        // Add new category
        if (!categories.includes(categoryFormData.name.trim())) {
          setCategories([...categories, categoryFormData.name.trim()]);
          toast.success(language === 'ar' ? 'تم إضافة الفئة بنجاح' : 'Catégorie ajoutée avec succès');
        } else {
          toast.error(language === 'ar' ? 'هذه الفئة موجودة بالفعل' : 'Cette catégorie existe déjà');
          return;
        }
      }
      handleCloseCategoryModal();
    }
  };

  const handleEditCategory = (index) => {
    setEditingCategoryIndex(index);
    setCategoryFormData({ name: categories[index], description: '' });
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (index) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الفئة؟' : 'Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      const categoryToDelete = categories[index];
      const updatedCategories = categories.filter((_, i) => i !== index);
      setCategories(updatedCategories);
      
      // Reset form category if it was the deleted one
      if (formData.category === categoryToDelete) {
        setFormData(prev => ({ ...prev, category: '' }));
      }
      
      toast.success(language === 'ar' ? 'تم حذف الفئة بنجاح' : 'Catégorie supprimée avec succès');
    }
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategoryIndex(null);
    setCategoryFormData({ name: '', description: '' });
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className={`p-8 min-h-screen bg-slate-50 ${direction === 'rtl' ? 'rtl' : ''}`}>
      {/* Header */}
      <div className="mb-8">
        <div className={`flex items-center gap-4 mb-4 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
          >
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <div className={direction === 'rtl' ? 'text-right' : ''}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1b1b1b' }}>
              {t('services.title') || t('sidebar.services')}
            </h1>
            <p className="text-gray-600 text-lg">
              {t('services.subtitle') || (language === 'ar' ? 'إدارة الخدمات والعروض' : 'Gérez vos services et offres')}
            </p>
          </div>
        </div>

        {/* Search and Add Button */}
        <div className={`flex gap-4 items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('services.searchServices') || t('services.search') || (language === 'ar' ? 'ابحث عن الخدمات...' : 'Rechercher des services...')}
              className={`h-12 ${direction === 'rtl' ? 'pr-10 text-right' : 'pl-10'} border-2 border-gray-300 focus:border-purple-500`}
            />
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('services.addService') || t('services.add') || (language === 'ar' ? 'إضافة خدمة' : 'Ajouter un service')}
          </Button>
        </div>

        {/* Price Range Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className={`text-blue-700 text-sm font-medium ${direction === 'rtl' ? 'text-right' : ''}`}>
            <DollarSign className="w-4 h-4 inline mr-1" />
            {t('services.priceRange') || (language === 'ar' ? 'نطاق السعر: 100 - 100000 د.ج' : 'Plage de prix: 100 - 100000 DZD')}
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t('services.noServices') || (language === 'ar' ? 'لا توجد خدمات' : 'Aucun service trouvé')}</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {/* Service Header */}
              <div className={`flex items-start justify-between mb-4 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${direction === 'rtl' ? 'text-right' : ''}`}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{service.name}</h3>
                  <div className={`flex items-center gap-2 mb-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <Tag className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-600 font-medium">{service.category}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(service)}
                    className="h-8 w-8 p-0 border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(service.id)}
                    className="h-8 w-8 p-0 border-red-300 hover:border-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>

              {/* Service Description */}
              <p className={`text-gray-600 text-sm mb-4 ${direction === 'rtl' ? 'text-right' : ''}`}>
                {service.description}
              </p>

              {/* Service Details */}
              <div className="space-y-3">
                <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-sm text-gray-500 ${direction === 'rtl' ? 'text-right' : ''}`}>
                    {t('services.price') || (language === 'ar' ? 'السعر' : 'Prix')}:
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(service.price)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: '#f3f3f3' }}
          >
            {/* Modal Header */}
            <div className="bg-white shadow-sm border-b-2 border-gray-200 p-6 rounded-t-xl">
              <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
                  >
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: '#1b1b1b' }}>
                    {editingService ? (t('services.editService') || (language === 'ar' ? 'تعديل الخدمة' : 'Modifier le service')) : (t('services.addService') || t('services.add') || (language === 'ar' ? 'إضافة خدمة' : 'Ajouter un service'))}
                  </h2>
                </div>
                <Button
                  onClick={handleCloseModal}
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 border-gray-300 hover:border-red-400 hover:bg-red-50"
                >
                  <X className="w-5 h-5 text-gray-600 hover:text-red-600" />
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Service Name */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium text-gray-700 ${direction === 'rtl' ? 'text-right' : ''}`}>
                  {t('services.name') || (language === 'ar' ? 'اسم الخدمة' : 'Nom du service')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={language === 'ar' ? 'أدخل اسم الخدمة' : 'Entrez le nom du service'}
                  className={`h-12 border-2 border-gray-300 focus:border-purple-500 ${direction === 'rtl' ? 'text-right' : ''} ${errors.name ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium text-gray-700 ${direction === 'rtl' ? 'text-right' : ''}`}>
                  {t('services.description') || (language === 'ar' ? 'الوصف' : 'Description')} <span className="text-red-500">*</span>
                </Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={language === 'ar' ? 'أدخل وصف الخدمة' : 'Entrez la description du service'}
                  rows={3}
                  className={`w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none ${direction === 'rtl' ? 'text-right' : ''} ${errors.description ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium text-gray-700 ${direction === 'rtl' ? 'text-right' : ''}`}>
                  {t('services.category') || (language === 'ar' ? 'الفئة' : 'Catégorie')} <span className="text-red-500">*</span>
                </Label>
                <div className={`flex gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`flex-1 h-12 border-2 border-gray-300 rounded-lg px-4 bg-white focus:border-purple-500 focus:outline-none transition-colors ${direction === 'rtl' ? 'text-right' : ''} ${errors.category ? 'border-red-500 bg-red-50' : ''}`}
                  >
                    <option value="">{language === 'ar' ? 'اختر فئة' : 'Sélectionner une catégorie'}</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    variant="outline"
                    className="h-12 w-12 p-0 border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300"
                    title={language === 'ar' ? 'إدارة الفئات' : 'Gérer les catégories'}
                  >
                    <Settings className="w-5 h-5 text-purple-600" />
                  </Button>
                </div>
                {errors.category && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium text-gray-700 ${direction === 'rtl' ? 'text-right' : ''}`}>
                  {t('services.price') || (language === 'ar' ? 'السعر' : 'Prix')} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="100"
                    min="100"
                    max="100000"
                    className={`h-12 ${direction === 'rtl' ? 'pr-10 text-right' : 'pl-10'} border-2 border-gray-300 focus:border-purple-500 ${errors.price ? 'border-red-500 bg-red-50' : ''}`}
                  />
                </div>
                {errors.price && (
                  <p className="text-red-600 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.price}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className={`flex gap-3 pt-4 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {editingService ? (t('common.save') || (language === 'ar' ? 'حفظ' : 'Enregistrer')) : (t('common.add') || (language === 'ar' ? 'إضافة' : 'Ajouter'))}
                </Button>
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  variant="outline"
                  className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-xl transition-all duration-300"
                >
                  <X className="w-5 h-5 mr-2" />
                  {t('common.cancel') || (language === 'ar' ? 'إلغاء' : 'Annuler')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: '#f3f3f3' }}
          >
            {/* Modal Header */}
            <div className="bg-white shadow-sm border-b-2 border-gray-200 p-6 rounded-t-xl">
              <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
                  >
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: '#1b1b1b' }}>
                    {language === 'ar' ? 'إدارة الفئات' : 'Gérer les catégories'}
                  </h2>
                </div>
                <Button
                  onClick={handleCloseCategoryModal}
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 border-gray-300 hover:border-red-400 hover:bg-red-50"
                >
                  <X className="w-5 h-5 text-gray-600 hover:text-red-600" />
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Add/Edit Category Form */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                <h3 className={`text-lg font-semibold mb-4 ${direction === 'rtl' ? 'text-right' : ''}`} style={{ color: '#1b1b1b' }}>
                  {editingCategoryIndex !== null 
                    ? (language === 'ar' ? 'تعديل الفئة' : 'Modifier la catégorie')
                    : (language === 'ar' ? 'إضافة فئة جديدة' : 'Ajouter une nouvelle catégorie')
                  }
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className={`text-sm font-medium text-gray-700 ${direction === 'rtl' ? 'text-right' : ''}`}>
                      {language === 'ar' ? 'اسم الفئة' : 'Nom de la catégorie'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={language === 'ar' ? 'أدخل اسم الفئة' : 'Entrez le nom de la catégorie'}
                      className={`h-10 border-2 border-gray-300 focus:border-purple-500 ${direction === 'rtl' ? 'text-right' : ''}`}
                    />
                  </div>
                  <div className={`flex gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <Button
                      onClick={handleAddCategory}
                      disabled={!categoryFormData.name.trim()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition-all duration-300"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {editingCategoryIndex !== null 
                        ? (language === 'ar' ? 'تحديث' : 'Modifier')
                        : (language === 'ar' ? 'إضافة' : 'Ajouter')
                      }
                    </Button>
                    {editingCategoryIndex !== null && (
                      <Button
                        onClick={handleCloseCategoryModal}
                        variant="outline"
                        className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all duration-300"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {language === 'ar' ? 'إلغاء' : 'Annuler'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Categories List */}
              <div className="bg-white rounded-lg border-2 border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className={`text-lg font-semibold ${direction === 'rtl' ? 'text-right' : ''}`} style={{ color: '#1b1b1b' }}>
                    {language === 'ar' ? 'الفئات الحالية' : 'Catégories existantes'} ({categories.length})
                  </h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {categories.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Tag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>{language === 'ar' ? 'لا توجد فئات' : 'Aucune catégorie'}</p>
                    </div>
                  ) : (
                    categories.map((category, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 border-b border-gray-100 hover:bg-purple-50 transition-colors ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <Tag className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-gray-700">{category}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => handleEditCategory(index)}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                          >
                            <Edit className="w-3 h-3 text-blue-600" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteCategory(index)}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-red-300 hover:border-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t-2 border-gray-200 p-4 rounded-b-xl">
              <Button
                onClick={handleCloseCategoryModal}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2 rounded-lg shadow-lg transition-all duration-300"
              >
                {language === 'ar' ? 'إغلاق' : 'Fermer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
