import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Save, Plus, Edit, ChevronDown, Search } from 'lucide-react';

export default function BatchFormModal({
  isOpen,
  onClose,
  onSave,
  batch,
  mode
}) {
  const { t, direction } = useLanguage();
  const searchInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    numLot: '',
    productId: '',
    designation: '',
    quantity: 0,
    expiryDate: '',
    receptionDate: '',
    alertDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await window.electronAPI.products.getAll();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const generateLotNumber = () => {
    const prefix = 'LOT';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${date}-${random}`;
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.designation.toLowerCase().includes(productSearchTerm.toLowerCase())
    );
  }, [products, productSearchTerm]);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      if (mode === 'edit' && batch) {
        setFormData({
          numLot: batch.numLot || '',
          productId: batch.productId || '',
          designation: batch.designation || '',
          quantity: batch.quantity || 0,
          expiryDate: batch.expiryDate || '',
          receptionDate: batch.receptionDate || '',
          alertDate: batch.alertDate || ''
        });
      } else {
        setFormData({
          numLot: generateLotNumber(),
          productId: '',
          designation: '',
          quantity: 0,
          expiryDate: '',
          receptionDate: new Date().toISOString().split('T')[0], // Default reception to today
          alertDate: ''
        });
      }
    }
  }, [isOpen, mode, batch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isDropdownOpen) {
      setProductSearchTerm('');
    } else {
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isDropdownOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductSelect = (product) => {
    setFormData(prev => ({
      ...prev,
      productId: product.id,
      designation: product.designation,
      quantity: product.stock || 0,
      expiryDate: product.expiry_date || prev.expiryDate || ''
    }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.numLot.trim() || !formData.designation.trim()) return;

    setIsLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving batch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsDropdownOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl ${direction === 'rtl' ? 'rtl' : ''}`}
        style={{
          width: '550px',
          maxWidth: '100%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              {mode === 'add' ? (
                <Plus className="w-5 h-5 text-blue-600" />
              ) : (
                <Edit className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <h2 className="text-lg text-gray-900 font-semibold">
              {mode === 'add' ? (t('batch.add.title') || 'Nouveau Lot') : (t('batch.edit.title') || 'Modifier Lot')}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Row 1: NumLot */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('batch.add.numLot') || 'NumLot'} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.numLot}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed font-mono text-sm"
                    placeholder="Auto-généré"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-xs text-blue-500 font-medium">
                    Auto-généré
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Désignation and Quantité */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative custom-dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('batch.add.designation') || 'Désignation'} *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => !isLoading && setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full px-4 py-3 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 bg-white flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row'
                      } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
                      }`}
                  >
                    <span className={`block truncate ${!formData.designation ? 'text-gray-400' : 'text-gray-900'}`}>
                      {formData.designation || (t('select.product') || 'Sélectionner un produit')}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                      style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}
                    >
                      {/* Search Bar inside dropdown */}
                      <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={productSearchTerm}
                            onChange={(e) => setProductSearchTerm(e.target.value)}
                            placeholder={t('search') || 'Rechercher un produit...'}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div className="max-h-[176px] overflow-y-auto custom-scrollbar">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleProductSelect(p)}
                              className={`w-full px-4 py-2.5 text-sm transition-colors flex items-center ${direction === 'rtl' ? 'text-right flex-row-reverse' : 'text-left'
                                } ${formData.designation === p.designation
                                  ? 'bg-blue-50 text-blue-600 font-medium'
                                  : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              <span className="truncate">{p.designation}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-400 text-center italic">
                            Aucun produit trouvé
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('batch.add.quantity') || 'Quantité'} *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                  placeholder="0"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Row 3: Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('batch.add.expiryDate') || 'Date Péremption'}
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 text-sm"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('batch.add.receptionDate') || 'Date Réception'}
                </label>
                <input
                  type="date"
                  value={formData.receptionDate}
                  onChange={(e) => handleInputChange('receptionDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 text-sm"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('batch.add.alertDate') || 'Date Alerte'}
                </label>
                <input
                  type="date"
                  value={formData.alertDate}
                  onChange={(e) => handleInputChange('alertDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              disabled={isLoading}
            >
              {t('batch.add.cancel') || 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={!formData.numLot || !formData.designation || formData.quantity <= 0 || isLoading}
              className="flex items-center space-x-2 px-8 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-semibold"
            >
              <Save className="w-4 h-4" />
              <span>
                {isLoading
                  ? '...'
                  : t('batch.add.save') || 'Enregistrer'
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



