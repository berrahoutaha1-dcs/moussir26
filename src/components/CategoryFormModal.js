import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Save, Plus, Edit } from 'lucide-react';

export default function CategoryFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  category, 
  mode,
  titleKey,
  nameKey,
  descriptionKey,
  saveKey,
  cancelKey
}) {
  const { t, direction } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && category) {
        setName(category.name);
        setDescription(category.description || '');
      } else {
        setName('');
        setDescription('');
      }
    }
  }, [isOpen, mode, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onSave({ name: name.trim(), description: description.trim() || undefined });
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center" 
      style={{ 
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.5)' 
      }}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl ${direction === 'rtl' ? 'rtl' : ''}`}
        style={{ 
          width: '400px',
          maxWidth: '90vw'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {mode === 'add' ? (
              <Plus className="w-5 h-5 text-blue-500" />
            ) : (
              <Edit className="w-5 h-5 text-blue-500" />
            )}
            <h2 className="text-lg text-black">
              {titleKey ? t(titleKey) : mode === 'add' ? (t('category.add.title') || 'Nouvelle catégorie') : (t('category.edit.title') || 'Modifier catégorie')}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Category Name */}
            <div>
              <label className="block text-sm text-black mb-1">
                {nameKey ? t(nameKey) : (t('category.add.name') || 'Nom de la catégorie')} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={nameKey ? t(nameKey) : (t('category.add.name') || 'Nom de la catégorie')}
                required
                disabled={isLoading}
              />
            </div>

            {/* Category Description */}
            <div>
              <label className="block text-sm text-black mb-1">
                {descriptionKey ? t(descriptionKey) : (t('category.add.description') || 'Description')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={descriptionKey ? t(descriptionKey) : (t('category.add.description') || 'Description')}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {cancelKey ? t(cancelKey) : (t('category.add.cancel') || 'Annuler')}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>
                {isLoading 
                  ? '...' 
                  : saveKey 
                    ? t(saveKey)
                    : mode === 'add' 
                      ? (t('category.add.save') || 'Enregistrer') 
                      : (t('category.edit.save') || 'Enregistrer')
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




