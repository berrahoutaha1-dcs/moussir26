import React, { useState, useEffect, useMemo } from 'react';
import { X, Filter, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { Button } from './ui/button';

export default function StockManagementModal({ isOpen, onClose }) {
  const { t, direction } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [families, setFamilies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const pResult = await window.electronAPI.products.getAll();
      if (pResult.success) {
        setProducts(pResult.data);
      } else {
        toast.error(pResult.error || 'Erreur lors du chargement des produits');
      }

      const cResult = await window.electronAPI.categories.getAll();
      if (cResult.success) {
        setCategories(cResult.data);
      }

      const fResult = await window.electronAPI.productFamilies.getAll();
      if (fResult.success) {
        setFamilies(fResult.data);
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      toast.error('Erreur de connexion à la base de données');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setSelectedCategory('all');
      setSelectedFamily('all');
      setSearchTerm('');
    }
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const categoryMatch = !selectedCategory || selectedCategory === 'all' ||
        (product.categoryId && String(product.categoryId) === String(selectedCategory)) ||
        (product.categoryName && product.categoryName.toLowerCase().includes(selectedCategory.toLowerCase()));

      const familyMatch = !selectedFamily || selectedFamily === 'all' ||
        (product.familyId && String(product.familyId) === String(selectedFamily)) ||
        (product.familyName && product.familyName.toLowerCase().includes(selectedFamily.toLowerCase()));

      const textMatch = !searchTerm ||
        (product.designation && product.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.codeBar && product.codeBar.includes(searchTerm));

      return categoryMatch && familyMatch && textMatch;
    });
  }, [products, selectedCategory, selectedFamily, searchTerm]);

  const totalSaleValue = useMemo(() => {
    return filteredProducts.reduce((sum, product) => {
      return sum + (parseFloat(product.retailPrice || 0) * parseFloat(product.stock || 0));
    }, 0);
  }, [filteredProducts]);

  const totalPurchaseValue = useMemo(() => {
    return filteredProducts.reduce((sum, product) => {
      return sum + (parseFloat(product.purchasePrice || 0) * parseFloat(product.stock || 0));
    }, 0);
  }, [filteredProducts]);


  const handleRecalculateStockWithSalePrice = async () => {
    try {
      const result = await window.electronAPI.products.recalculateStock();
      if (result.success) {
        toast.success(result.message || 'Le stock de détail a été recalculé');
        fetchData();
      } else {
        toast.error(result.error || 'Erreur lors du recalcul');
      }
    } catch (error) {
      console.error('Recalculate stock error:', error);
      toast.error(`Erreur: ${error.message || 'Problème de connexion au serveur'}`);
    }
  };

  const handleRecalculateAllStock = async () => {
    try {
      const result = await window.electronAPI.products.recalculateAllStock();
      if (result.success) {
        toast.success(result.message || 'Tous les stocks ont été recalculés');
        fetchData();
      } else {
        toast.error(result.error || 'Erreur lors du recalcul');
      }
    } catch (error) {
      console.error('Recalculate all stock error:', error);
      toast.error(`Erreur: ${error.message || 'Problème de connexion au serveur'}`);
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
        className={`bg-white rounded-lg shadow-2xl flex flex-col ${direction === 'rtl' ? 'rtl' : ''}`}
        style={{
          width: '98vw',
          height: '95vh',
          maxWidth: '1800px',
          maxHeight: '1000px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-gray-900 font-bold text-lg">Gestion de Stock</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filter Section and Totals */}
        <div className="flex flex-wrap items-start p-6 bg-white border-b border-gray-200 gap-6">
          {/* Left Side - Filters */}
          <div className="flex flex-col space-y-4 min-w-[300px]">
            <div className="space-y-1.5">
              <label className="block text-gray-700 text-sm font-medium">Catégories</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-gray-700 text-sm font-medium">Famille</label>
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="all">Toutes les familles</option>
                {families.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-gray-700 text-sm font-medium">Recherche texte</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Désignation, code..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

          </div>

          {/* Right Side - Totals and Buttons */}
          <div className="flex-1 flex flex-col items-end space-y-6">
            {/* Totals */}
            <div className="flex flex-wrap justify-end gap-x-6 gap-y-4">
              <div className="flex flex-col items-center">
                <div className="bg-teal-500 text-white px-8 py-3 rounded shadow-sm font-bold text-xl min-w-[250px] text-center">
                  {totalSaleValue.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA
                </div>
                <div className="text-gray-600 mt-2 text-sm font-medium">Valeur avec prix de vente</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-red-500 text-white px-8 py-3 rounded shadow-sm font-bold text-xl min-w-[250px] text-center">
                  {totalPurchaseValue.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA
                </div>
                <div className="text-gray-600 mt-2 text-sm font-medium">Valeur avec prix d'achat</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                onClick={handleRecalculateStockWithSalePrice}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold rounded-md transition-all"
              >
                Recalculer le stock de détail
              </Button>
              <Button
                onClick={handleRecalculateAllStock}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold rounded-md transition-all"
              >
                Recalculer tous les stock
              </Button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full border-collapse" style={{ minWidth: '1500px' }}>
            <thead className="sticky top-0 z-20 bg-blue-600 text-white text-[12px] uppercase tracking-wider font-bold">
              <tr>
                <th className="border border-gray-300 px-3 py-3 text-left" style={{ width: '150px' }}>Code</th>
                <th className="border border-gray-300 px-3 py-3 text-left" style={{ width: '130px' }}>Réf</th>
                <th className="border border-gray-300 px-3 py-3 text-left" style={{ width: '300px' }}>Désignation</th>
                <th className="border border-gray-300 px-3 py-3 text-right" style={{ width: '130px' }}>Prix</th>
                <th className="border border-gray-300 px-3 py-3 text-right" style={{ width: '180px' }}>Dernier prix d'achat</th>
                <th className="border border-gray-300 px-3 py-3 text-right" style={{ width: '100px' }}>Marge</th>
                <th className="border border-gray-300 px-3 py-3 text-left" style={{ width: '200px' }}>Catégorie</th>
                <th className="border border-gray-300 px-3 py-3 text-left" style={{ width: '200px' }}>Famille</th>
                <th className="border border-gray-300 px-3 py-3 text-right" style={{ width: '130px' }}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => {
                const marginPercent = product.purchasePrice > 0
                  ? (((product.retailPrice - product.purchasePrice) / product.purchasePrice) * 100).toFixed(0)
                  : '0';

                return (
                  <tr
                    key={product.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors text-[13px]`}
                  >
                    <td className="border border-gray-300 px-3 py-2.5 truncate font-mono text-gray-600" title={product.codeBar || ''}>
                      {product.codeBar || '-'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2.5 truncate text-gray-600" title={product.ean || ''}>
                      {product.ean || '-'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2.5 font-medium text-gray-900" title={product.designation}>
                      {product.designation}
                    </td>
                    <td className="border border-gray-300 px-3 py-2.5 text-right font-semibold text-gray-700">
                      {parseFloat(product.retailPrice || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border border-gray-300 px-3 py-2.5 text-right font-semibold text-gray-600">
                      {parseFloat(product.purchasePrice || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border border-gray-300 px-3 py-2.5 text-right font-mono text-gray-600 font-bold">
                      {marginPercent}%
                    </td>
                    <td className="border border-gray-300 px-3 py-2.5 text-gray-600">
                      {product.categoryName || '-'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2.5 text-gray-600">
                      {product.familyName || '-'}
                    </td>
                    <td className={`border border-gray-300 px-3 py-2.5 text-right font-bold ${parseFloat(product.stock || 0) <= 0 ? 'text-red-500' : 'text-blue-600'}`}>
                      {parseFloat(product.stock || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={9} className="border border-gray-300 px-3 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-3">
                      <Search className="w-10 h-10 text-gray-300" />
                      <p className="text-lg font-medium">Aucun produit trouvé</p>
                      <p className="text-sm">Essayez de modifier vos critères de filtre</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600 font-medium">
            <p>Affichage de {filteredProducts.length} produit(s)</p>
            <p>Devise utilisée: DA (Dinar Algérien)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
