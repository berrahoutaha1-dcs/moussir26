import React, { useState } from 'react';
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
  Grid3X3
} from 'lucide-react';

export default function CategoryModal({ isOpen, onClose }) {
  const { t, direction } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');

  const [categories, setCategories] = useState([
    { id: '1', name: t('category.accessories') || 'Accessoires & outils', description: 'Outils et accessoires professionnels', key: 'accessories' },
    { id: '2', name: t('category.makeup') || 'Maquillage', description: 'Produits de maquillage', key: 'makeup' },
    { id: '3', name: t('category.nails') || 'Onglerie', description: 'Produits pour onglerie', key: 'nails' },
    { id: '4', name: t('category.perfume') || 'Parfumerie', description: 'Parfums et eaux de toilette', key: 'perfume' },
    { id: '5', name: t('category.natural') || 'Produits naturels &', description: 'Produits naturels et bio', key: 'natural' },
    { id: '6', name: t('category.haircare') || 'Soins capillaires', description: 'Soins capillaires', key: 'haircare' },
    { id: '7', name: t('category.skincare') || 'Soins de la peau', description: 'Soins de la peau', key: 'skincare' },
    { id: '8', name: t('category.bodycare') || 'Soins du corps', description: 'Soins du corps', key: 'bodycare' }
  ]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSelectedCategoryData = () => {
    return categories.find(cat => cat.id === selectedCategory) || null;
  };

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
    if (selectedCategory) {
      setDeleteModalOpen(true);
    }
  };

  const handleSaveCategory = (categoryData) => {
    if (formMode === 'add') {
      const newCategory = {
        id: Date.now().toString(),
        name: categoryData.name,
        description: categoryData.description,
        key: categoryData.name.toLowerCase().replace(/\s+/g, '_')
      };
      setCategories(prev => [...prev, newCategory]);
      toast.success(t('category.success.added') || 'Catégorie ajoutée');
    } else if (formMode === 'edit' && selectedCategory) {
      setCategories(prev => prev.map(cat => 
        cat.id === selectedCategory 
          ? { ...cat, name: categoryData.name, description: categoryData.description }
          : cat
      ));
      toast.success(t('category.success.updated') || 'Catégorie modifiée');
    }
  };

  const handleConfirmDelete = () => {
    if (selectedCategory) {
      setCategories(prev => prev.filter(cat => cat.id !== selectedCategory));
      setSelectedCategory(null);
      toast.success(t('category.success.deleted') || 'Catégorie supprimée');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center" 
      style={{ 
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)' 
      }}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl ${direction === 'rtl' ? 'rtl' : ''}`}
        style={{ 
          width: '20cm', 
          height: '15cm',
          maxWidth: '90vw',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Grid3X3 className="w-5 h-5 text-black" />
            <h2 className="text-lg text-black">
              {t('category.title') || 'Catégories'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="flex p-4" style={{ height: 'calc(15cm - 80px)' }}>
          {/* Left Panel - Search and Categories List */}
          <div className="flex-1 pr-4">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
              <input
                type="text"
                placeholder={t('category.search') || 'Rechercher...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-blue-500 text-white placeholder-white placeholder-opacity-80 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Categories List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="overflow-y-auto" 
                style={{ 
                  height: '280px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#9CA3AF #F3F4F6'
                }}
              >
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {t('category.noResults') || 'Aucun résultat'}
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`
                        w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors
                        ${selectedCategory === category.id 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-gray-50 text-black'
                        }
                      `}
                    >
                      {category.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Action Buttons */}
          <div className="w-36 pl-4 flex flex-col justify-between">
            <div className="space-y-3">
              {/* New Button */}
              <button
                onClick={handleNewCategory}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{t('category.new') || 'Nouveau'}</span>
              </button>

              {/* Modify Button */}
              <button
                onClick={handleModifyCategory}
                disabled={!selectedCategory}
                className={`
                  w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm
                  ${selectedCategory 
                    ? 'bg-blue-200 hover:bg-blue-300 text-blue-700' 
                    : 'bg-blue-200 text-blue-400 cursor-not-allowed'
                  }
                `}
              >
                <Edit className="w-4 h-4" />
                <span>{t('category.modify') || 'Modifier'}</span>
              </button>

              {/* Delete Button */}
              <button
                onClick={handleDeleteCategory}
                disabled={!selectedCategory}
                className={`
                  w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm
                  ${selectedCategory 
                    ? 'bg-blue-200 hover:bg-blue-300 text-blue-700' 
                    : 'bg-blue-200 text-blue-400 cursor-not-allowed'
                  }
                `}
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('category.delete') || 'Supprimer'}</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
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
