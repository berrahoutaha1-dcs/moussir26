import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Search, Plus, Edit, Trash2, Package, Upload, RotateCcw, Download } from 'lucide-react';
import { toast } from 'sonner';
import NewProductModal from './NewProductModal';
import ImportModal from './ImportModal';

export default function ProductListModal({ isOpen, onClose }) {
  const { t, direction } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Sample data based on the Figma design
  const sampleProducts = [
    {
      id: '1',
      codeBar: '6194404803013',
      ean: '',
      designation: 'Crème hydratante visage',
      private: '250.00 DA',
      upa: '240.00 DA',
      category: 'Produits naturels &',
      family: 'Soins visage et corps',
      sukh: '534.00',
      supplier: 'Minal'
    },
    {
      id: '2',
      codeBar: '613000300145',
      ean: '',
      designation: 'Luvim',
      private: '900.00 DA',
      upa: '600.00 DA',
      category: '',
      family: '',
      sukh: '198.00',
      supplier: 'Minal'
    },
    {
      id: '3',
      codeBar: '0000000000012',
      ean: '22x44x303',
      designation: 'maskas test 01',
      private: '1,500.00 DA',
      upa: '1,000.00 DA',
      category: '',
      family: '',
      sukh: '0.00',
      supplier: ''
    },
    {
      id: '4',
      codeBar: '6053405515',
      ean: '',
      designation: 'maskas test 02',
      private: '5,000.00 DA',
      upa: '4,500.00 DA',
      category: '',
      family: '',
      sukh: '0.00',
      supplier: ''
    },
    {
      id: '5',
      codeBar: '2418015012',
      ean: '',
      designation: 'maskas test 03',
      private: '8,400.00 DA',
      upa: '8,000.00 DA',
      category: '',
      family: '',
      sukh: '0.00',
      supplier: ''
    },
    {
      id: '6',
      codeBar: '1451351',
      ean: '',
      designation: 'maskas test 04 sans internet',
      private: '2,900.00 DA',
      upa: '2,100.00 DA',
      category: '',
      family: '',
      sukh: '0.00',
      supplier: ''
    },
    {
      id: '7',
      codeBar: '1564105140541',
      ean: '',
      designation: 'maskas test 05 sans internet',
      private: '1,256,105.00 DA',
      upa: '15,152.00 DA',
      category: '',
      family: '',
      sukh: '0.00',
      supplier: ''
    },
    {
      id: '8',
      codeBar: '0000000000046',
      ean: '',
      designation: 'PRES TUBE',
      private: '35.00 DA',
      upa: '25.00 DA',
      category: 'Accessoires & outils',
      family: 'Soins visage et corps',
      sukh: '699.96',
      supplier: 'Minal'
    },
    {
      id: '9',
      codeBar: '0000000000006',
      ean: '',
      designation: 'PRES TUBE',
      private: '35.00 DA',
      upa: '25.00 DA',
      category: 'Accessoires & outils',
      family: 'Soins visage et corps',
      sukh: '699.96',
      supplier: 'Minal'
    },
    {
      id: '10',
      codeBar: '0000001522445',
      ean: '0000001522442',
      designation: 'sd',
      private: '200.00 DA',
      upa: '150.00 DA',
      category: 'Accessoires & outils',
      family: 'Beauty accessoires',
      sukh: '500.00',
      supplier: 'Minal'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setProducts(sampleProducts);
      setSearchTerm('');
      setSelectedProducts([]);
    }
  }, [isOpen]);

  const filteredProducts = products.filter(product =>
    product.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codeBar.includes(searchTerm) ||
    product.ean.includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.family.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleAction = (action) => {
    switch (action) {
      case 'close':
        onClose();
        break;
      case 'print':
        toast.info('Fonction d\'impression en cours de développement');
        break;
      case 'delete':
        if (selectedProducts.length > 0) {
          toast.success(`${selectedProducts.length} produit(s) supprimé(s)`);
          setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
          setSelectedProducts([]);
        } else {
          toast.warning('Veuillez sélectionner des produits à supprimer');
        }
        break;
      case 'modify':
        if (selectedProducts.length === 1) {
          toast.info('Ouverture du formulaire de modification');
        } else if (selectedProducts.length > 1) {
          toast.warning('Veuillez sélectionner un seul produit à modifier');
        } else {
          toast.warning('Veuillez sélectionner un produit à modifier');
        }
        break;
      case 'new':
        setIsNewProductModalOpen(true);
        break;
      case 'import':
        toast.info('Ouverture de l\'assistant d\'importation...');
        setIsImportModalOpen(true);
        break;
      case 'resetStock':
        if (selectedProducts.length > 0) {
          toast.success(`Stock remis à 0 pour ${selectedProducts.length} produit(s)`);
          setSelectedProducts([]);
        } else {
          toast.warning('Veuillez sélectionner des produits pour remettre le stock à 0');
        }
        break;
      case 'export':
        toast.info('Préparation de l\'exportation Excel...');
        break;
      default:
        break;
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
        className={`bg-white rounded-lg shadow-2xl ${direction === 'rtl' ? 'rtl' : ''}`}
        style={{
          width: '95vw',
          height: '90vh',
          maxWidth: '1400px',
          maxHeight: '900px',
          fontSize: '18px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className={`flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-gray-900 font-semibold">{t('productList.title') || 'Liste des produits'}</h2>

          {/* Action Buttons */}
          <div className={`flex items-center space-x-2 ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <button
              onClick={() => handleAction('close')}
              className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors text-sm"
            >
              {t('productList.close') || 'Fermer'}
            </button>
            <button
              onClick={() => handleAction('import')}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center space-x-1 text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>{t('productList.import') || 'Import'}</span>
            </button>
            <button
              onClick={() => handleAction('export')}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors flex items-center space-x-1 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => handleAction('delete')}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors flex items-center space-x-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedProducts.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('productList.delete') || 'Supprimer'}</span>
            </button>
            <button
              onClick={() => handleAction('modify')}
              className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors flex items-center space-x-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedProducts.length !== 1}
            >
              <Edit className="w-4 h-4" />
              <span>{t('productList.modify') || 'Modifier'}</span>
            </button>
            <button
              onClick={() => handleAction('new')}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded transition-colors flex items-center space-x-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('productList.new') || 'Nouveau'}</span>
            </button>
            <button
              onClick={() => handleAction('resetStock')}
              className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors flex items-center space-x-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedProducts.length === 0}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('productList.resetStock') || 'Remettre stock à 0'}</span>
            </button>
          </div>
        </div>

        {/* Fixed Search Bar */}
        <div className={`px-6 py-4 bg-white border-b border-gray-200 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center space-x-2 ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <label className="text-gray-700 text-sm">{t('productList.search') || 'Rechercher:'}</label>
            <div className="relative">
              <Search className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 ${direction === 'rtl' ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`border border-gray-300 rounded px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${direction === 'rtl' ? 'text-right pr-3 pl-10' : 'text-left pl-10 pr-3'
                  }`}
                placeholder="(FS)"
                style={{ width: '200px' }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Fixed Table Header */}
          <div className="bg-white border-b border-gray-200 overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '1200px' }}>
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="border border-gray-300 px-2 py-2 text-center" style={{ width: '60px' }}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '150px' }}>
                    {t('productList.codeBar') || 'Code-barre'}
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '120px' }}>
                    {t('productList.ean') || 'référence'}
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '200px' }}>
                    {t('productList.designation') || 'Désignation'}
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '120px' }}>
                    {t('productList.private') || 'Prix un'}
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '120px' }}>
                    {t('productList.upa') || 'UPA'}
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '150px' }}>
                    {t('productList.category') || 'Catégorie'}
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '150px' }}>
                    {t('productList.family') || 'Famille'}
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '100px' }}>
                    {t('productList.sukh') || 'stock R'}
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '120px' }}>
                    {t('productList.supplier') || 'Fournisseur'}
                  </th>
                  <th className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ width: '80px' }}>
                    {t('productList.photo') || 'Photo'}
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Scrollable Table Body */}
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '1200px' }}>
              <colgroup>
                <col style={{ width: '60px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '200px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '80px' }} />
              </colgroup>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductSelect(product.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'} truncate`}>
                      <div className="truncate" title={product.codeBar}>
                        {product.codeBar}
                      </div>
                    </td>
                    <td className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'} truncate`}>
                      <div className="truncate" title={product.ean}>
                        {product.ean}
                      </div>
                    </td>
                    <td className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'} truncate`}>
                      <div className="truncate" title={product.designation}>
                        {product.designation}
                      </div>
                    </td>
                    <td className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'} truncate`}>
                      <div className="truncate" title={product.private}>
                        {product.private}
                      </div>
                    </td>
                    <td className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'} truncate`}>
                      <div className="truncate" title={product.upa}>
                        {product.upa}
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
                    <td className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'} truncate`}>
                      <div className="truncate" title={product.sukh}>
                        {product.sukh}
                      </div>
                    </td>
                    <td className={`border border-gray-300 px-2 py-2 ${direction === 'rtl' ? 'text-right' : 'text-left'} truncate`}>
                      <div className="truncate" title={product.supplier}>
                        {product.supplier}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      <div className="w-8 h-8 bg-gray-200 rounded border flex items-center justify-center mx-auto">
                        <span className="text-gray-500 text-xs">📷</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={11} className="border border-gray-300 px-2 py-6 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <Search className="w-6 h-6 text-gray-400" />
                        <p>Aucun produit trouvé</p>
                        <p style={{ fontSize: '14px' }}>Essayez de modifier vos critères de recherche</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className={`px-6 py-3 bg-gray-50 border-t border-gray-200 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">
              {filteredProducts.length} produit(s) affiché(s) • {selectedProducts.length} sélectionné(s)
            </p>
            <div className="text-gray-500" style={{ fontSize: '14px' }}>
              Utilisez la molette ou les barres de défilement pour naviguer
            </div>
          </div>
        </div>
      </div>

      {/* New Product Modal */}
      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
