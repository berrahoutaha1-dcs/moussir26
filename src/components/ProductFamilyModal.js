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

export default function ProductFamilyModal({ isOpen, onClose }) {
  const { t, direction } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');

  const [families, setFamilies] = useState([
    { id: '1', name: 'Cosmétiques Premium', key: 'premium_cosmetics', description: 'Gamme de produits cosmétiques haut de gamme' },
    { id: '2', name: 'Soins Naturels', key: 'natural_care', description: 'Produits de soins à base d\'ingrédients naturels' },
    { id: '3', name: 'Parfums de Luxe', key: 'luxury_perfumes', description: 'Collection de parfums exclusifs' },
    { id: '4', name: 'Maquillage Professionnel', key: 'professional_makeup', description: 'Gamme makeup pour professionnels' },
    { id: '5', name: 'Soins Capillaires', key: 'hair_care', description: 'Produits de soins pour cheveux' },
    { id: '6', name: 'Accessoires Beauté', key: 'beauty_accessories', description: 'Outils et accessoires de beauté' }
  ]);

  const filteredFamilies = families.filter(family =>
    family.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSelectedFamilyData = () => {
    return families.find(fam => fam.id === selectedFamily) || null;
  };

  const handleNewFamily = () => {
    setFormMode('add');
    setFormModalOpen(true);
  };

  const handleModifyFamily = () => {
    if (selectedFamily) {
      setFormMode('edit');
      setFormModalOpen(true);
    }
  };

  const handleDeleteFamily = () => {
    if (selectedFamily) {
      setDeleteModalOpen(true);
    }
  };

  const handleSaveFamily = (familyData) => {
    if (formMode === 'add') {
      const newFamily = {
        id: Date.now().toString(),
        name: familyData.name,
        description: familyData.description,
        key: familyData.name.toLowerCase().replace(/\s+/g, '_')
      };
      setFamilies(prev => [...prev, newFamily]);
      toast.success(t('family.success.added') || 'Famille ajoutée');
    } else if (formMode === 'edit' && selectedFamily) {
      setFamilies(prev => prev.map(fam => 
        fam.id === selectedFamily 
          ? { ...fam, name: familyData.name, description: familyData.description }
          : fam
      ));
      toast.success(t('family.success.updated') || 'Famille modifiée');
    }
  };

  const handleConfirmDelete = () => {
    if (selectedFamily) {
      setFamilies(prev => prev.filter(fam => fam.id !== selectedFamily));
      setSelectedFamily(null);
      toast.success(t('family.success.deleted') || 'Famille supprimée');
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
            <Grid3X3 className="w-6 h-6 text-black" />
            <h2 className="text-lg text-black">{t('family.title') || 'Familles de produits'}</h2>
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
                placeholder={t('family.search') || 'Rechercher...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Family List */}
            <div className="flex-1 overflow-y-auto">
              {filteredFamilies.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {t('family.noResults') || 'Aucun résultat'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFamilies.map((family) => (
                    <div
                      key={family.id}
                      onClick={() => setSelectedFamily(family.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedFamily === family.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="text-black">{family.name}</div>
                      {family.description && (
                        <div className="text-sm text-gray-600 mt-1">{family.description}</div>
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
              onClick={handleNewFamily}
              className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('family.new') || 'Nouveau'}</span>
            </button>

            <button
              onClick={handleModifyFamily}
              disabled={!selectedFamily}
              className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit className="w-4 h-4" />
              <span>{t('family.modify') || 'Modifier'}</span>
            </button>

            <button
              onClick={handleDeleteFamily}
              disabled={!selectedFamily}
              className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('family.delete') || 'Supprimer'}</span>
            </button>

            <div className="flex-1"></div>

            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {t('family.close') || 'Fermer'}
            </button>
          </div>
        </div>

        {/* Form Modal for Add/Edit */}
        <CategoryFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          onSave={handleSaveFamily}
          category={getSelectedFamilyData()}
          mode={formMode}
          titleKey={formMode === 'add' ? 'family.add.title' : 'family.edit.title'}
          nameKey="family.add.name"
          descriptionKey="family.add.description"
          saveKey={formMode === 'add' ? 'family.add.save' : 'family.edit.save'}
          cancelKey="family.add.cancel"
        />

        {/* Delete Confirmation Modal */}
        <CategoryDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          category={getSelectedFamilyData()}
          titleKey="family.delete.title"
          messageKey="family.delete.message"
          warningKey="family.delete.warning"
          confirmKey="family.delete.confirm"
          cancelKey="family.add.cancel"
        />
      </div>
    </div>
  );
}
