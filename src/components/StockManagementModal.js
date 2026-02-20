import React, { useState, useEffect } from 'react';
import { X, Filter, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { Button } from './ui/button';

export default function StockManagementModal({ isOpen, onClose }) {
  const { t, direction } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [products, setProducts] = useState([]);

  const sampleProducts = [
    {
      id: '1',
      code: '6132524600013',
      ref: '6132524600013',
      designation: 'Crème hydratante visage',
      price: '250.00',
      lastPurchasePrice: '240.00',
      margin: '0.04',
      category: 'Produits naturels &',
      family: 'Soins visage et corps',
      stock: '334.00'
    },
    {
      id: '2',
      code: '013000306145',
      ref: '',
      designation: 'Luvim',
      price: '900.00',
      lastPurchasePrice: '600.00',
      margin: '0.00',
      category: '',
      family: '',
      stock: '198.00'
    },
    {
      id: '3',
      code: '0000000122445',
      ref: '0000001122445',
      designation: 'test',
      price: '200.00',
      lastPurchasePrice: '150.00',
      margin: '0.33',
      category: 'Accessoires & outils',
      family: 'Beauty accessoires',
      stock: '500.00'
    },
    {
      id: '4',
      code: '0000000000000',
      ref: '',
      designation: 'PRES TUBE',
      price: '35.00',
      lastPurchasePrice: '25.00',
      margin: '0.40',
      category: 'Accessoires & outils',
      family: 'Soins visage et corps',
      stock: '0.00'
    },
    {
      id: '5',
      code: '0000000000036',
      ref: '',
      designation: 'PRES TUBE',
      price: '35.00',
      lastPurchasePrice: '25.00',
      margin: '0.40',
      category: 'Accessoires & outils',
      family: 'Soins visage et corps',
      stock: '699.96'
    },
    {
      id: '6',
      code: '0000000000012',
      ref: '2354852',
      designation: 'maskas test 01',
      price: '1,500.00',
      lastPurchasePrice: '1,000.00',
      margin: '0.50',
      category: '',
      family: '',
      stock: '0.00'
    },
    {
      id: '7',
      code: '4953405405',
      ref: '',
      designation: 'maskas test 02',
      price: '5,000.00',
      lastPurchasePrice: '4,500.00',
      margin: '0.11',
      category: '',
      family: '',
      stock: '0.00'
    },
    {
      id: '8',
      code: '2416015512',
      ref: '',
      designation: 'maskas test 03',
      price: '8,400.00',
      lastPurchasePrice: '8,000.00',
      margin: '0.05',
      category: '',
      family: '',
      stock: '0.00'
    },
    {
      id: '9',
      code: '1451456153',
      ref: '',
      designation: 'maskas test 04 sans internet',
      price: '2,900.00',
      lastPurchasePrice: '2,100.00',
      margin: '0.38',
      category: '',
      family: '',
      stock: '0.00'
    },
    {
      id: '10',
      code: '1564105140541',
      ref: '',
      designation: 'maskas test 05 sans internet',
      price: '1,256,165.00',
      lastPurchasePrice: '15,152.00',
      margin: '81.90',
      category: '',
      family: '',
      stock: '0.00'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setProducts(sampleProducts);
      setSelectedCategory('all');
      setSelectedFamily('all');
    }
  }, [isOpen]);

  const totalSaleValue = products.reduce((sum, product) => {
    return sum + (parseFloat(product.price.replace(/,/g, '')) * parseFloat(product.stock.replace(/,/g, '') || '0'));
  }, 0);

  const totalPurchaseValue = products.reduce((sum, product) => {
    return sum + (parseFloat(product.lastPurchasePrice.replace(/,/g, '')) * parseFloat(product.stock.replace(/,/g, '') || '0'));
  }, 0);

  const filteredProducts = products.filter(product => {
    const categoryMatch = !selectedCategory || selectedCategory === 'all' || product.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const familyMatch = !selectedFamily || selectedFamily === 'all' || product.family.toLowerCase().includes(selectedFamily.toLowerCase());
    return categoryMatch && familyMatch;
  });

  const handleFilterSearch = () => {
    toast.info('Filtre appliqué avec succès');
  };

  const handleRecalculateStockWithSalePrice = () => {
    toast.info('Recalcul du stock avec prix de vente en cours...');
  };

  const handleRecalculateAllStock = () => {
    toast.info('Recalcul de tout le stock en cours...');
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
        className={`bg-white rounded-lg shadow-2xl ${direction === 'rtl' ? 'rtl' : ''}`}
        style={{ 
          width: '43cm',
          height: '22cm',
          maxWidth: '95vw',
          maxHeight: '90vh',
          fontSize: '18px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-gray-900">Gestion de Stock</h2>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Section and Totals */}
        <div className="flex justify-between items-start p-4 bg-white border-b border-gray-200">
          {/* Left Side - Filters */}
          <div className="flex flex-col space-y-3" style={{ width: '200px' }}>
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm">Catégories</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les catégories</option>
                <option value="produits-naturels">Produits naturels &</option>
                <option value="accessoires">Accessoires & outils</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-gray-700 text-sm">Famille</label>
              <select 
                value={selectedFamily} 
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les familles</option>
                <option value="soins-visage">Soins visage et corps</option>
                <option value="beauty-accessoires">Beauty accessoires</option>
              </select>
            </div>

            <Button 
              onClick={handleFilterSearch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Rechercher le filtre
            </Button>
          </div>

          {/* Right Side - Totals and Buttons */}
          <div className="flex flex-col items-end space-y-3">
            {/* Totals */}
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="bg-teal-600 text-white px-6 py-2 rounded font-medium">
                  {totalSaleValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
                </div>
                <div className="text-gray-700 mt-1 text-sm">Valeur avec prix de vente</div>
              </div>
              <div className="text-center">
                <div className="bg-red-500 text-white px-6 py-2 rounded font-medium">
                  {totalPurchaseValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
                </div>
                <div className="text-gray-700 mt-1 text-sm">Valeur avec prix d'achat</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                onClick={handleRecalculateStockWithSalePrice}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
              >
                Recalculer le stock de détail
              </Button>
              <Button 
                onClick={handleRecalculateAllStock}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
              >
                Recalculer tous les stock
              </Button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 flex flex-col min-h-0" style={{ height: 'calc(22cm - 140px)' }}>
          {/* Fixed Table Header */}
          <div className="bg-white border-b border-gray-200 overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '1200px' }}>
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '150px' }}>
                    Code
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '130px' }}>
                    Réf
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '280px' }}>
                    Désignation
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '130px' }}>
                    Prix
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '150px' }}>
                    Dernier prix d'achat
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '100px' }}>
                    Marge
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '200px' }}>
                    Catégorie
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '200px' }}>
                    Famille
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '130px' }}>
                    Stock
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Scrollable Table Body */}
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '1200px' }}>
              <colgroup>
                <col style={{ width: '150px' }} />
                <col style={{ width: '130px' }} />
                <col style={{ width: '280px' }} />
                <col style={{ width: '130px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '200px' }} />
                <col style={{ width: '200px' }} />
                <col style={{ width: '130px' }} />
              </colgroup>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr 
                    key={product.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                  >
                    <td className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'} truncate`}>
                      <div className="truncate" title={product.code}>
                        {product.code}
                      </div>
                    </td>
                    <td className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'} truncate`}>
                      <div className="truncate" title={product.ref}>
                        {product.ref}
                      </div>
                    </td>
                    <td className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'} truncate`}>
                      <div className="truncate" title={product.designation}>
                        {product.designation}
                      </div>
                    </td>
                    <td className={`border border-gray-300 px-2 py-2 text-right truncate`}>
                      <div className="truncate" title={product.price}>
                        {product.price}
                      </div>
                    </td>
                    <td className={`border border-gray-300 px-2 py-2 text-right truncate`}>
                      <div className="truncate" title={product.lastPurchasePrice}>
                        {product.lastPurchasePrice}
                      </div>
                    </td>
                    <td className={`border border-gray-300 px-2 py-2 text-right truncate`}>
                      <div className="truncate" title={product.margin}>
                        {product.margin}
                      </div>
                    </td>
                    <td className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'} truncate`}>
                      <div className="truncate" title={product.category}>
                        {product.category}
                      </div>
                    </td>
                    <td className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'} truncate`}>
                      <div className="truncate" title={product.family}>
                        {product.family}
                      </div>
                    </td>
                    <td className={`border border-gray-300 px-2 py-2 text-right truncate`}>
                      <div className="truncate" title={product.stock}>
                        {product.stock}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={9} className="border border-gray-300 px-2 py-6 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <Search className="w-6 h-6 text-gray-400" />
                        <p>Aucun produit trouvé</p>
                        <p style={{fontSize: '14px'}}>Essayez de modifier vos critères de filtre</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
