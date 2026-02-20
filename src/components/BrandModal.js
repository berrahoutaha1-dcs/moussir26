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
  Award
} from 'lucide-react';

export default function BrandModal({ isOpen, onClose }) {
  const { t, direction } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');

  const [brands, setBrands] = useState([
    { id: '1', name: 'L\'Oréal', key: 'loreal', description: 'Leader mondial des cosmétiques' },
    { id: '2', name: 'Chanel', key: 'chanel', description: 'Maison de haute couture et parfumerie' },
    { id: '3', name: 'Dior', key: 'dior', description: 'Luxe français, mode et beauté' },
    { id: '4', name: 'Estée Lauder', key: 'estee_lauder', description: 'Cosmétiques et parfums premium' },
    { id: '5', name: 'MAC Cosmetics', key: 'mac', description: 'Maquillage professionnel' },
    { id: '6', name: 'Yves Saint Laurent', key: 'ysl', description: 'Beauté et parfumerie de luxe' },
    { id: '7', name: 'Lancôme', key: 'lancome', description: 'Beauté française premium' },
    { id: '8', name: 'Maybelline', key: 'maybelline', description: 'Maquillage accessible et tendance' }
  ]);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSelectedBrandData = () => {
    return brands.find(brand => brand.id === selectedBrand) || null;
  };

  const handleNewBrand = () => {
    setFormMode('add');
    setFormModalOpen(true);
  };

  const handleModifyBrand = () => {
    if (selectedBrand) {
      setFormMode('edit');
      setFormModalOpen(true);
    }
  };

  const handleDeleteBrand = () => {
    if (selectedBrand) {
      setDeleteModalOpen(true);
    }
  };

  const handleSaveBrand = (brandData) => {
    if (formMode === 'add') {
      const newBrand = {
        id: Date.now().toString(),
        name: brandData.name,
        description: brandData.description,
        key: brandData.name.toLowerCase().replace(/\s+/g, '_')
      };
      setBrands(prev => [...prev, newBrand]);
      toast.success(t('brand.success.added') || 'Marque ajoutée');
    } else if (formMode === 'edit' && selectedBrand) {
      setBrands(prev => prev.map(brand => 
        brand.id === selectedBrand 
          ? { ...brand, name: brandData.name, description: brandData.description }
          : brand
      ));
      toast.success(t('brand.success.updated') || 'Marque modifiée');
    }
  };

  const handleConfirmDelete = () => {
    if (selectedBrand) {
      setBrands(prev => prev.filter(brand => brand.id !== selectedBrand));
      setSelectedBrand(null);
      toast.success(t('brand.success.deleted') || 'Marque supprimée');
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
            <Award className="w-6 h-6 text-black" />
            <h2 className="text-lg text-black">{t('brand.title') || 'Marques'}</h2>
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
          {/* Left Panel - Search and List */}
          <div className="flex-1 flex flex-col mr-4">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('brand.search') || 'Rechercher...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Brand List */}
            <div className="flex-1 overflow-y-auto">
              {filteredBrands.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {t('brand.noResults') || 'Aucun résultat'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredBrands.map((brand) => (
                    <div
                      key={brand.id}
                      onClick={() => setSelectedBrand(brand.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedBrand === brand.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="text-black">{brand.name}</div>
                      {brand.description && (
                        <div className="text-sm text-gray-600 mt-1">{brand.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Action Buttons */}
          <div className="w-48 flex flex-col space-y-3">
            <button
              onClick={handleNewBrand}
              className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('brand.new') || 'Nouveau'}</span>
            </button>

            <button
              onClick={handleModifyBrand}
              disabled={!selectedBrand}
              className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit className="w-4 h-4" />
              <span>{t('brand.modify') || 'Modifier'}</span>
            </button>

            <button
              onClick={handleDeleteBrand}
              disabled={!selectedBrand}
              className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('brand.delete') || 'Supprimer'}</span>
            </button>

            <div className="flex-1"></div>

            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {t('brand.close') || 'Fermer'}
            </button>
          </div>
        </div>

        {/* Form Modal for Add/Edit */}
        <CategoryFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          onSave={handleSaveBrand}
          category={getSelectedBrandData()}
          mode={formMode}
          titleKey={formMode === 'add' ? 'brand.add.title' : 'brand.edit.title'}
          nameKey="brand.add.name"
          descriptionKey="brand.add.description"
          saveKey={formMode === 'add' ? 'brand.add.save' : 'brand.edit.save'}
          cancelKey="brand.add.cancel"
        />

        {/* Delete Confirmation Modal */}
        <CategoryDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          category={getSelectedBrandData()}
          titleKey="brand.delete.title"
          messageKey="brand.delete.message"
          warningKey="brand.delete.warning"
          confirmKey="brand.delete.confirm"
          cancelKey="brand.add.cancel"
        />
      </div>
    </div>
  );
}
