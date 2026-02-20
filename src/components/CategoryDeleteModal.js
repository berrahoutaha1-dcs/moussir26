import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export default function CategoryDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  category,
  titleKey,
  messageKey,
  warningKey,
  confirmKey,
  cancelKey
}) {
  const { t, direction } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!category) return;

    setIsDeleting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center" 
      style={{ 
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.5)' 
      }}
      onClick={onClose}
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
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg text-black">
              {titleKey ? t(titleKey) : (t('category.delete.title') || 'Supprimer la catégorie')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={isDeleting}
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-black mb-2">
                {messageKey ? t(messageKey) : (t('category.delete.message') || 'Êtes-vous sûr de vouloir supprimer cette catégorie ?')}
              </p>
              <p className="text-gray-600 text-sm mb-2">
                <strong>"{category.name}"</strong>
              </p>
              <p className="text-red-600 text-sm">
                {warningKey ? t(warningKey) : (t('category.delete.warning') || 'Cette action est irréversible.')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isDeleting}
            >
              {cancelKey ? t(cancelKey) : (t('category.add.cancel') || 'Annuler')}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {isDeleting ? '...' : confirmKey ? t(confirmKey) : (t('category.delete.confirm') || 'Supprimer')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




