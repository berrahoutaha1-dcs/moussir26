import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Wrench,
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Tag,
  AlertCircle,
  CheckCircle,
  X,
  Settings,
  ArrowUpDown,
  List,
  LayoutGrid,
  MoreVertical,
  Activity,
  Layers,
  ChevronRight,
  Download
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function Services() {
  const { language, direction, t } = useLanguage();

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: ''
  });
  const [errors, setErrors] = useState({});
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const sResult = await window.electronAPI.services.getAll();
      if (sResult.success) {
        setServices(sResult.data);
      }

      const cResult = await window.electronAPI.serviceCategories.getAll();
      if (cResult.success) {
        setCategories(cResult.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error(language === 'ar' ? 'خطأ في تحميل البيانات' : 'Erreur de chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats computation
  const stats = useMemo(() => {
    const total = services.length;
    const catCount = categories.length;

    return { total, catCount };
  }, [services, categories]);

  // Filtering and Sorting
  const processedServices = useMemo(() => {
    let filtered = services.filter(service => {
      const matchSearch =
        (service.name && service.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (service.categoryName && service.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = true; // Category filter was removed

      return matchSearch && matchCategory;
    });

    return filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
  }, [services, searchTerm, sortBy, sortOrder]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('services.error.required') || (language === 'ar' ? 'هذا الحقل مطلوب' : 'Ce champ est requis');
    }

    if (!formData.category.trim()) {
      newErrors.category = t('services.error.required') || (language === 'ar' ? 'هذا الحقل مطلوب' : 'Ce champ est requis');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const serviceData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category_id: parseInt(formData.category),
      price: parseFloat(formData.price) || 0
    };

    try {
      if (editingService) {
        const result = await window.electronAPI.services.update(editingService.id, serviceData);
        if (result.success) {
          toast.success(language === 'ar' ? 'تم تحديث الخدمة بنجاح' : 'Service mis à jour avec succès');
          fetchData();
          handleCloseModal();
        } else {
          toast.error(result.error || 'Update failed');
        }
      } else {
        const result = await window.electronAPI.services.create(serviceData);
        if (result.success) {
          toast.success(language === 'ar' ? 'تم إضافة الخدمة بنجاح' : 'Service ajouté avec succès');
          fetchData();
          handleCloseModal();
        } else {
          toast.error(result.error || 'Creation failed');
        }
      }
    } catch (error) {
      console.error('Service save error:', error);
      toast.error('Connection error');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category_id ? service.category_id.toString() : '',
      price: service.price ? service.price.toString() : (service.tarif ? service.tarif.toString() : '0')
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Êtes-vous sûr de vouloir supprimer ce service ?')) {
      try {
        const result = await window.electronAPI.services.delete(serviceId);
        if (result.success) {
          toast.success(language === 'ar' ? 'تم حذف الخدمة بنجاح' : 'Service supprimé avec succès');
          fetchData();
        } else {
          toast.error(result.error || 'Delete failed');
        }
      } catch (error) {
        console.error('Service delete error:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      price: ''
    });
    setErrors({});
  };

  const handleAddCategory = async () => {
    if (categoryFormData.name.trim()) {
      try {
        if (editingCategoryIndex !== null) {
          const catId = categories[editingCategoryIndex].id;
          const result = await window.electronAPI.serviceCategories.update(catId, {
            name: categoryFormData.name.trim(),
            description: categoryFormData.description.trim()
          });
          if (result.success) {
            toast.success(language === 'ar' ? 'تم تعديل الفئة بنجاح' : 'Catégorie modifiée avec succès');
            fetchData();
            handleCloseCategoryModal();
          }
        } else {
          const result = await window.electronAPI.serviceCategories.create({
            name: categoryFormData.name.trim(),
            description: categoryFormData.description.trim()
          });
          if (result.success) {
            toast.success(language === 'ar' ? 'تم إضافة الفئة بنجاح' : 'Catégorie ajoutée avec succès');
            fetchData();
            handleCloseCategoryModal();
          } else {
            toast.error(result.error);
          }
        }
      } catch (error) {
        console.error('Category error:', error);
      }
    }
  };

  const handleEditCategory = (index) => {
    setEditingCategoryIndex(index);
    setCategoryFormData({
      name: categories[index].name,
      description: categories[index].description || ''
    });
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (index) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الفئة؟' : 'Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        const catId = categories[index].id;
        const result = await window.electronAPI.serviceCategories.delete(catId);
        if (result.success) {
          toast.success(language === 'ar' ? 'تم حذف الفئة بنجاح' : 'Catégorie supprimée avec succès');
          fetchData();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Category delete error:', error);
      }
    }
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategoryIndex(null);
    setCategoryFormData({ name: '', description: '' });
  };

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className={`p-8 min-h-screen bg-[#f8fafc] ${direction === 'rtl' ? 'rtl' : ''}`}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className={`flex items-center gap-4 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <div className={direction === 'rtl' ? 'text-right' : ''}>
            <h1 className="text-2xl font-bold text-slate-800">{t('services.title') || 'Services Management'}</h1>
            <p className="text-slate-500 font-medium">{t('services.subtitle') || 'Manage professional services'}</p>
          </div>
        </div>

        <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('services.addService')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('stats.totalServices') || 'Total Services'}</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('stats.categories') || 'Categories'}</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.catCount}</h3>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className={`flex flex-1 items-center gap-3 w-full ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute ${direction === 'rtl' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5`} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('services.searchPlaceholder')}
              className={`w-full h-12 ${direction === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 outline-none border font-medium`}
            />
          </div>

          {/* Removed category filtration dropdown as requested */}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsCategoryModalOpen(true)}
            className="h-12 border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all flex items-center gap-2 px-5 font-bold text-sm"
          >
            <Settings className="w-4 h-4" />
            {t('services.manageCategories')}
          </Button>
          <Button
            variant="outline"
            className="h-12 border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-sm transition-all hidden md:flex items-center gap-2 px-5 font-bold text-sm"
          >
            <Download className="w-4 h-4" />
            {t('common.export')}
          </Button>
        </div>
      </div>

      {/* Main Content View */}
      {processedServices.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">{t('services.noServicesFound') || 'No services found'}</h3>
          <p className="text-slate-400 mb-6">{t('services.noServicesDesc') || 'Start by adding your first service to the catalog'}</p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl px-10 h-12 shadow-lg shadow-indigo-100 transition-all transform hover:scale-105"
          >
            {t('services.createNow')}
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className={`px-6 py-4 text-sm font-semibold text-slate-600 cursor-pointer hover:text-indigo-600 transition-colors ${direction === 'rtl' ? 'text-right' : ''}`} onClick={() => toggleSort('name')}>
                  <div className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    {t('services.name') || 'Service Name'}
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className={`px-6 py-4 text-sm font-semibold text-slate-600 hidden md:table-cell ${direction === 'rtl' ? 'text-right' : ''}`}>
                  {t('services.description') || 'Description'}
                </th>
                <th className={`px-6 py-4 text-sm font-semibold text-slate-600 cursor-pointer hover:text-indigo-600 transition-colors ${direction === 'rtl' ? 'text-right' : ''}`} onClick={() => toggleSort('categoryName')}>
                  <div className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    {t('services.category') || 'Category'}
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className={`px-6 py-4 text-sm font-semibold text-slate-600 cursor-pointer hover:text-indigo-600 transition-colors ${direction === 'rtl' ? 'text-right' : ''}`} onClick={() => toggleSort('price')}>
                  <div className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    {t('services.price') || 'Tarif (DZD)'}
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">
                  {t('common.actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedServices.map((service) => (
                <tr key={service.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className={`px-6 py-4 ${direction === 'rtl' ? 'text-right' : ''}`}>
                    <div className="font-bold text-slate-800">{service.name}</div>
                  </td>
                  <td className={`px-6 py-4 text-slate-500 text-sm hidden md:table-cell max-w-xs truncate ${direction === 'rtl' ? 'text-right' : ''}`}>
                    {service.description || '---'}
                  </td>
                  <td className={`px-6 py-4 ${direction === 'rtl' ? 'text-right' : ''}`}>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                      {service.categoryName || 'General'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-black text-slate-700 ${direction === 'rtl' ? 'text-right' : ''}`}>
                    {parseFloat(service.price || service.tarif || 0).toLocaleString()} DZD
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {processedServices.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-lg p-1 flex gap-1 border border-slate-200">
                  <button onClick={() => handleEdit(service)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(service.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">{service.categoryName}</span>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">{service.name}</h3>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">{service.description}</p>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                <div className="text-lg font-black text-indigo-600">
                  {parseFloat(service.price || service.tarif || 0).toLocaleString()} <span className="text-[10px] uppercase ml-1">DZD</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 ml-auto">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}

      {/* Service Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={handleCloseModal} />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingService ? (t('services.editService') || 'Edit Service') : (t('services.newService') || 'New Service')}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('services.name') || 'Service Name'}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Engine Diagnostic"
                    className={`h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ${errors.name ? 'border-rose-400 ring-4 ring-rose-500/10' : ''}`}
                  />
                  {errors.name && <span className="text-rose-500 text-xs font-semibold">{errors.name}</span>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('services.category') || 'Category'}</Label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:border-indigo-500 outline-none appearance-none"
                    >
                      <option value="">{t('common.select') || 'Select...'}</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <Settings
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 cursor-pointer"
                      onClick={() => setIsCategoryModalOpen(true)}
                    />
                  </div>
                  {errors.category && <span className="text-rose-500 text-xs font-semibold">{errors.category}</span>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('services.price') || 'Pricing (DZD)'}</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="h-12 rounded-xl border-slate-200 pl-12 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-black"
                    />
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('services.description') || 'Description'}</Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 p-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600"
                >
                  {t('common.cancel') || 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {editingService ? (t('common.update') || 'Update') : (t('common.save') || 'Save')}
                </Button>
              </div>
            </form >
          </div >
        </div >
      )}

      {/* Categories Modal - Premium Version */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseCategoryModal} />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative animate-in slide-in-from-bottom-8 duration-300 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-800">{t('services.manageCategories') || 'Manage Categories'}</h2>
              </div>
              <button onClick={handleCloseCategoryModal} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-8">
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 mb-8">
                <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-4">
                  {editingCategoryIndex !== null ? 'Edit Category' : 'New Category'}
                </h4>
                <div className="flex flex-col md:flex-row gap-3">
                  <Input
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    placeholder="Category name..."
                    className="h-12 rounded-xl flex-[2] border-indigo-100 focus:border-indigo-500"
                  />
                  <Button
                    onClick={handleAddCategory}
                    className="bg-indigo-600 h-12 px-8 rounded-xl"
                  >
                    {editingCategoryIndex !== null ? 'Update' : 'Add'}
                  </Button>
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((cat, idx) => (
                      <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-700">{cat.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleEditCategory(idx)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteCategory(idx)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button onClick={handleCloseCategoryModal} className="rounded-xl border-slate-300 px-10">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
