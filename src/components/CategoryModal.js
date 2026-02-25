import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import CategoryFormModal from './CategoryFormModal';
import CategoryDeleteModal from './CategoryDeleteModal';
import { toast } from 'sonner';
import {
  X,
  Search,
  Plus,
  Edit,
  Trash2,
  Grid3X3,
  Loader2
} from 'lucide-react';

export default function CategoryModal({ isOpen, onClose }) {
  const { t, direction } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── Fetch from DB ──────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.categories.getAll();
      if (result.success) {
        setCategories(result.data);
      } else {
        toast.error(result.error || 'Erreur lors du chargement des catégories');
      }
    } catch (err) {
      console.error('fetchCategories error:', err);
      toast.error('Erreur de connexion à la base de données');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setSearchTerm('');
      setSelectedCategory(null);
    }
  }, [isOpen, fetchCategories]);

  // ── Helpers ────────────────────────────────────────────
  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSelectedCategoryData = () =>
    categories.find(c => c.id === selectedCategory) || null;

  // ── Actions ────────────────────────────────────────────
  const handleNewCategory = () => {
    setFormMode('add');
    setFormModalOpen(true);
  };

  const handleModifyCategory = () => {
    if (selectedCategory) {
      setFormMode('edit');
      setFormModalOpen(true);
    }
  };

  const handleDeleteCategory = () => {
    if (selectedCategory) setDeleteModalOpen(true);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (formMode === 'add') {
        const result = await window.electronAPI.categories.create(categoryData);
        if (result.success) {
          toast.success('Catégorie ajoutée avec succès');
          await fetchCategories();
          setSelectedCategory(result.data.id);
        } else {
          toast.error(result.error || 'Erreur lors de l\'ajout');
        }
      } else if (formMode === 'edit' && selectedCategory) {
        const result = await window.electronAPI.categories.update(selectedCategory, categoryData);
        if (result.success) {
          toast.success('Catégorie modifiée avec succès');
          await fetchCategories();
        } else {
          toast.error(result.error || 'Erreur lors de la modification');
        }
      }
    } catch (err) {
      console.error('handleSaveCategory error:', err);
      toast.error('Erreur inattendue');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;
    try {
      const result = await window.electronAPI.categories.delete(selectedCategory);
      if (result.success) {
        toast.success('Catégorie supprimée avec succès');
        setSelectedCategory(null);
        await fetchCategories();
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('handleConfirmDelete error:', err);
      toast.error('Erreur inattendue');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl ${direction === 'rtl' ? 'rtl' : ''}`}
        style={{ width: '20cm', height: '15cm', maxWidth: '90vw', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Grid3X3 className="w-5 h-5 text-black" />
            <h2 className="text-lg font-semibold text-black">
              {t('category.title') || 'Catégories'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="flex p-4" style={{ height: 'calc(15cm - 80px)' }}>
          {/* Left Panel */}
          <div className="flex-1 pr-4 flex flex-col">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
              <input
                type="text"
                placeholder={t('category.search') || 'Rechercher une catégorie...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-blue-500 text-white placeholder-white placeholder-opacity-80 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Categories List */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Chargement...</span>
                </div>
              ) : (
                <div
                  className="overflow-y-auto h-full"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}
                >
                  {filteredCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8 space-y-2">
                      <Grid3X3 className="w-8 h-8 opacity-30" />
                      <p className="text-sm">
                        {searchTerm ? 'Aucun résultat' : 'Aucune catégorie — cliquez sur Nouveau'}
                      </p>
                    </div>
                  ) : (
                    filteredCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(
                          selectedCategory === category.id ? null : category.id
                        )}
                        className={`
                          w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors
                          ${selectedCategory === category.id
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'hover:bg-gray-50 text-gray-800'}
                        `}
                      >
                        <span>{category.name}</span>
                        {category.description && (
                          <span className="block text-xs text-gray-400 font-normal mt-0.5">
                            {category.description}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Count info */}
            <p className="text-xs text-gray-400 mt-2">
              {filteredCategories.length} catégorie(s) affichée(s)
            </p>
          </div>

          {/* Right Panel - Action Buttons */}
          <div className="w-36 pl-4 flex flex-col justify-between">
            <div className="space-y-3">
              <button
                onClick={handleNewCategory}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>{t('category.new') || 'Nouveau'}</span>
              </button>

              <button
                onClick={handleModifyCategory}
                disabled={!selectedCategory}
                className={`
                  w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium
                  ${selectedCategory
                    ? 'bg-blue-200 hover:bg-blue-300 text-blue-700 cursor-pointer'
                    : 'bg-blue-100 text-blue-300 cursor-not-allowed'}
                `}
              >
                <Edit className="w-4 h-4" />
                <span>{t('category.modify') || 'Modifier'}</span>
              </button>

              <button
                onClick={handleDeleteCategory}
                disabled={!selectedCategory}
                className={`
                  w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium
                  ${selectedCategory
                    ? 'bg-red-100 hover:bg-red-200 text-red-600 cursor-pointer'
                    : 'bg-blue-100 text-blue-300 cursor-not-allowed'}
                `}
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('category.delete') || 'Supprimer'}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <X className="w-4 h-4" />
              <span>{t('category.close') || 'Fermer'}</span>
            </button>
          </div>
        </div>

        {/* Form Modal for Add/Edit */}
        <CategoryFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          onSave={handleSaveCategory}
          category={getSelectedCategoryData()}
          mode={formMode}
        />

        {/* Delete Confirmation Modal */}
        <CategoryDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          category={getSelectedCategoryData()}
        />
      </div>
    </div>
  );
}
