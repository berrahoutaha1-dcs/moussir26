import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import CategoryFormModal from './CategoryFormModal';
import CategoryDeleteModal from './CategoryDeleteModal';
import { toast } from 'sonner';
import { X, Search, Plus, Edit, Trash2, Layers, Loader2 } from 'lucide-react';

export default function ProductFamilyModal({ isOpen, onClose }) {
  const { t, direction } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [families, setFamilies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── Fetch from DB ──────────────────────────────────────
  const fetchFamilies = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.productFamilies.getAll();
      if (result.success) {
        setFamilies(result.data);
      } else {
        toast.error(result.error || 'Erreur lors du chargement des familles');
      }
    } catch (err) {
      console.error('fetchFamilies error:', err);
      toast.error('Erreur de connexion à la base de données');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFamilies();
      setSearchTerm('');
      setSelectedFamily(null);
    }
  }, [isOpen, fetchFamilies]);

  // ── Helpers ────────────────────────────────────────────
  const filteredFamilies = families.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSelectedFamilyData = () =>
    families.find(f => f.id === selectedFamily) || null;

  // ── Actions ────────────────────────────────────────────
  const handleSaveFamily = async (familyData) => {
    try {
      if (formMode === 'add') {
        const result = await window.electronAPI.productFamilies.create(familyData);
        if (result.success) {
          toast.success('Famille ajoutée avec succès');
          await fetchFamilies();
          setSelectedFamily(result.data.id);
        } else {
          toast.error(result.error || 'Erreur lors de l\'ajout');
        }
      } else if (formMode === 'edit' && selectedFamily) {
        const result = await window.electronAPI.productFamilies.update(selectedFamily, familyData);
        if (result.success) {
          toast.success('Famille modifiée avec succès');
          await fetchFamilies();
        } else {
          toast.error(result.error || 'Erreur lors de la modification');
        }
      }
    } catch (err) {
      console.error('handleSaveFamily error:', err);
      toast.error('Erreur inattendue');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedFamily) return;
    try {
      const result = await window.electronAPI.productFamilies.delete(selectedFamily);
      if (result.success) {
        toast.success('Famille supprimée avec succès');
        setSelectedFamily(null);
        await fetchFamilies();
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
            <Layers className="w-6 h-6 text-black" />
            <h2 className="text-lg font-semibold text-black">{t('family.title') || 'Familles de produits'}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="flex p-4" style={{ height: 'calc(15cm - 80px)' }}>
          {/* Left Panel */}
          <div className="flex-1 flex flex-col mr-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
              <input
                type="text"
                placeholder={t('family.search') || 'Rechercher une famille...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-blue-500 text-white placeholder-white placeholder-opacity-80 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Family List */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Chargement...</span>
                </div>
              ) : (
                <div className="overflow-y-auto h-full" style={{ scrollbarWidth: 'thin' }}>
                  {filteredFamilies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8 space-y-2">
                      <Layers className="w-8 h-8 opacity-30" />
                      <p className="text-sm">
                        {searchTerm ? 'Aucun résultat' : 'Aucune famille — cliquez sur Nouveau'}
                      </p>
                    </div>
                  ) : (
                    filteredFamilies.map((family) => (
                      <button
                        key={family.id}
                        onClick={() => setSelectedFamily(selectedFamily === family.id ? null : family.id)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors
                          ${selectedFamily === family.id
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'hover:bg-gray-50 text-gray-800'}`}
                      >
                        <span>{family.name}</span>
                        {family.description && (
                          <span className="block text-xs text-gray-400 font-normal mt-0.5">{family.description}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-2">{filteredFamilies.length} famille(s) affichée(s)</p>
          </div>

          {/* Right Panel */}
          <div className="w-36 flex flex-col justify-between">
            <div className="space-y-3">
              <button
                onClick={() => { setFormMode('add'); setFormModalOpen(true); }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" /><span>{t('family.new') || 'Nouveau'}</span>
              </button>

              <button
                onClick={() => { if (selectedFamily) { setFormMode('edit'); setFormModalOpen(true); } }}
                disabled={!selectedFamily}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium
                  ${selectedFamily ? 'bg-blue-200 hover:bg-blue-300 text-blue-700' : 'bg-blue-100 text-blue-300 cursor-not-allowed'}`}
              >
                <Edit className="w-4 h-4" /><span>{t('family.modify') || 'Modifier'}</span>
              </button>

              <button
                onClick={() => { if (selectedFamily) setDeleteModalOpen(true); }}
                disabled={!selectedFamily}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium
                  ${selectedFamily ? 'bg-red-100 hover:bg-red-200 text-red-600' : 'bg-blue-100 text-blue-300 cursor-not-allowed'}`}
              >
                <Trash2 className="w-4 h-4" /><span>{t('family.delete') || 'Supprimer'}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <X className="w-4 h-4" /><span>{t('family.close') || 'Fermer'}</span>
            </button>
          </div>
        </div>

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

        <CategoryDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          category={getSelectedFamilyData()}
          titleKey="family.delete.title"
          messageKey="family.delete.message"
          confirmKey="family.delete.confirm"
          cancelKey="family.add.cancel"
        />
      </div>
    </div>
  );
}
