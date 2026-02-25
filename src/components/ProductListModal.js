import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Search, Plus, Edit, Trash2, Package, Upload, RotateCcw, Download } from 'lucide-react';
import { toast } from 'sonner';
import NewProductModal from './NewProductModal';
import ImportProductModal from './ImportProductModal';
import * as XLSX from 'xlsx';

export default function ProductListModal({ isOpen, onClose }) {
  const { t, direction } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.products.getAll();
      if (result.success) {
        setProducts(result.data);
      } else {
        toast.error(result.error || 'Erreur lors du chargement des produits');
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error('Erreur de connexion à la base de données');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      setSearchTerm('');
      setSelectedProducts([]);
    }
  }, [isOpen]);

  const filteredProducts = products.filter(product =>
    (product.designation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.codeBar || '').includes(searchTerm) ||
    (product.ean || '').includes(searchTerm) ||
    (product.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.familyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase())
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
          if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedProducts.length} produit(s) ?`)) {
            Promise.all(selectedProducts.map(id => window.electronAPI.products.delete(id)))
              .then(results => {
                const totalDeleted = results.filter(r => r.success).length;
                toast.success(`${totalDeleted} produit(s) supprimé(s)`);
                fetchProducts();
                setSelectedProducts([]);
              })
              .catch(err => {
                console.error('Delete error:', err);
                toast.error('Erreur lors de la suppression');
              });
          }
        } else {
          toast.warning('Veuillez sélectionner des produits à supprimer');
        }
        break;
      case 'modify':
        if (selectedProducts.length === 1) {
          const product = filteredProducts.find(p => p.id === selectedProducts[0]);
          setProductToEdit(product);
          setIsEditMode(true);
          setIsNewProductModalOpen(true);
        } else if (selectedProducts.length > 1) {
          toast.warning('Veuillez sélectionner un seul produit à modifier');
        } else {
          toast.warning('Veuillez sélectionner un produit à modifier');
        }
        break;
      case 'new':
        setProductToEdit(null);
        setIsEditMode(false);
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
        try {
          const dataToExport = selectedProducts.length > 0
            ? products.filter(p => selectedProducts.includes(p.id))
            : products;

          if (dataToExport.length === 0) {
            toast.warning('Aucun produit à exporter');
            break;
          }

          const worksheet = XLSX.utils.json_to_sheet(dataToExport.map(p => ({
            'CODE BARRE': p.codeBar,
            'RÉFÉRENCE': p.ean,
            'DÉSIGNATION': p.designation,
            'CATÉGORIE': p.categoryName || '-',
            'FAMILLE': p.familyName || '-',
            'MARQUE': p.brandName || '-',
            'FOURNISSEUR': p.supplierName || '-',
            'CATÉGORIE DE STOCK': p.stockCategory === 'stock' ? 'Stock (Multi-dépôt)' : p.stockCategory === 'store_item' ? 'Article de Magasin (Simple)' : p.stockCategory || '-',
            'GESTION DES STOCKS': p.stockCategory === 'stock' ? (p.stockManagement && p.stockManagement.toLowerCase() !== 'unit' ? p.stockManagement : 'Dépôt Principal') : (p.stockManagement && p.stockManagement.toLowerCase() === 'unit' ? 'Unit' : p.stockManagement === 'weight' ? 'Poids' : p.stockManagement || '-'),
            'ETAGÈRE / RAYON': p.shelf || '-',
            'COULEUR': p.color || '-',
            'TAILLE/FORMAT': p.size || '-',
            'QUANTITÉ TOTAL GLOBAL': p.stock,
            'STOCK ALERT': p.alertQuantity,
            'PRIX D\'ACHAT': p.purchasePrice,
            'TVA/TAX %': p.taxPercent,
            'GROS': p.wholesalePrice,
            'SEMI-GROS': p.semiWholesalePrice,
            'DETAIL': p.retailPrice,
          })));

          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Produits');

          const now = new Date().toISOString().split('T')[0];
          XLSX.writeFile(workbook, `Liste_Produits_${now}.xlsx`);

          toast.success('Exportation réussie');
        } catch (error) {
          console.error('Export error:', error);
          toast.error('Erreur lors de l\'exportation');
        }
        break;
      case 'refresh':
        fetchProducts();
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
          width: '98vw',
          height: '95vh',
          maxWidth: '1800px',
          maxHeight: '1000px',
          fontSize: '14px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className={`flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-gray-900 font-bold text-lg">{t('productList.title') || 'Liste des produits'}</h2>

          {/* Action Buttons */}
          <div className={`flex items-center space-x-2 ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <button
              onClick={() => handleAction('refresh')}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors flex items-center space-x-1 text-sm"
              title="Actualiser"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Actualiser</span>
            </button>
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
          </div>
        </div>

        {/* Fixed Search Bar */}
        <div className={`px-6 py-4 bg-white border-b border-gray-200 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center space-x-2 ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <label className="text-gray-700 text-sm font-medium">{t('productList.search') || 'Rechercher:'}</label>
            <div className="relative">
              <Search className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 ${direction === 'rtl' ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`border border-gray-300 rounded px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${direction === 'rtl' ? 'text-right pr-3 pl-10' : 'text-left pl-10 pr-3'
                  }`}
                placeholder="Rechercher par désignation, code-barre..."
                style={{ width: '300px' }}
              />
            </div>
            {isLoading && <span className="text-sm text-blue-500 animate-pulse">Chargement...</span>}
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="flex-1 overflow-auto border-b border-gray-200">
          <table className="w-full border-collapse" style={{ minWidth: '2200px' }}>
            <thead className="sticky top-0 z-10 bg-blue-600 text-white text-[12px] uppercase tracking-wider">
              <tr>
                <th className="border border-gray-300 px-2 py-3 text-center" style={{ width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                <th className="border border-gray-300 px-2 py-3 text-left" style={{ width: '150px' }}>Code barre</th>
                <th className="border border-gray-300 px-2 py-3 text-left" style={{ width: '120px' }}>Référence</th>
                <th className="border border-gray-300 px-2 py-3 text-left" style={{ width: '250px' }}>Désignation</th>
                <th className="border border-gray-300 px-2 py-3 text-left" style={{ width: '150px' }}>Catégorie</th>
                <th className="border border-gray-300 px-2 py-3 text-left" style={{ width: '150px' }}>Famille</th>
                <th className="border border-gray-300 px-2 py-3 text-left" style={{ width: '150px' }}>Marque</th>
                <th className="border border-gray-300 px-2 py-3 text-left" style={{ width: '150px' }}>Fournisseur</th>
                <th className="border border-gray-300 px-2 py-3 text-left" style={{ width: '150px' }}>Catégorie de stock</th>
                <th className="border border-gray-300 px-2 py-3 text-left" style={{ width: '150px' }}>gestion des stocks</th>
                <th className="border border-gray-300 px-2 py-3 text-left" style={{ width: '120px' }}>Etagère / rayon</th>
                <th className="border border-gray-300 px-2 py-3 text-left" style={{ width: '100px' }}>Couleur</th>
                <th className="border border-gray-300 px-2 py-3 text-left" style={{ width: '100px' }}>Taille/format</th>
                <th className="border border-gray-300 px-2 py-3 text-right" style={{ width: '130px' }}>Quantité total global</th>
                <th className="border border-gray-300 px-2 py-3 text-right" style={{ width: '120px' }}>Stock alert</th>
                <th className="border border-gray-300 px-2 py-3 text-right" style={{ width: '120px' }}>Prix d'Achat</th>
                <th className="border border-gray-300 px-2 py-3 text-right" style={{ width: '100px' }}>TVA/TAX %</th>
                <th className="border border-gray-300 px-2 py-3 text-right" style={{ width: '120px' }}>GROS</th>
                <th className="border border-gray-300 px-2 py-3 text-right" style={{ width: '120px' }}>SEMI-GROS</th>
                <th className="border border-gray-300 px-2 py-3 text-right" style={{ width: '120px' }}>DETAIL</th>
              </tr>
            </thead>
            <colgroup>
              <col style={{ width: '50px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '250px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '130px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '120px' }} />
            </colgroup>
            <tbody>
              {filteredProducts.slice(0, 15).map((product, index) => (
                <tr
                  key={product.id}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors text-[13px]`}
                >
                  <td className="border border-gray-300 px-2 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductSelect(product.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-3 truncate">{product.codeBar}</td>
                  <td className="border border-gray-300 px-2 py-3 truncate">{product.ean}</td>
                  <td className="border border-gray-300 px-2 py-3 font-medium">{product.designation}</td>
                  <td className="border border-gray-300 px-2 py-3">{product.categoryName || '-'}</td>
                  <td className="border border-gray-300 px-2 py-3">{product.familyName || '-'}</td>
                  <td className="border border-gray-300 px-2 py-3">{product.brandName || '-'}</td>
                  <td className="border border-gray-300 px-2 py-3">{product.supplierName || '-'}</td>
                  <td className="border border-gray-300 px-2 py-3">
                    {product.stockCategory === 'stock'
                      ? 'Stock (Multi-dépôt)'
                      : product.stockCategory === 'store_item'
                        ? 'Article de Magasin (Simple)'
                        : product.stockCategory || '-'}
                  </td>
                  <td className="border border-gray-300 px-2 py-3 font-semibold text-blue-700">
                    {product.stockCategory === 'stock'
                      ? (product.stockManagement && product.stockManagement.toLowerCase() !== 'unit' ? product.stockManagement : 'Dépôt Principal')
                      : (product.stockManagement && product.stockManagement.toLowerCase() === 'unit' ? 'Unit' : product.stockManagement === 'weight' ? 'Poids' : product.stockManagement)}
                  </td>
                  <td className="border border-gray-300 px-2 py-3">{product.shelf || '-'}</td>
                  <td className="border border-gray-300 px-2 py-3">{product.color || '-'}</td>
                  <td className="border border-gray-300 px-2 py-3">{product.size || '-'}</td>
                  <td className="border border-gray-300 px-2 py-3 text-right font-bold text-blue-600">{product.stock}</td>
                  <td className="border border-gray-300 px-2 py-3 text-right text-red-500 font-medium">{product.alertQuantity}</td>
                  <td className="border border-gray-300 px-2 py-3 text-right font-mono">{parseFloat(product.purchasePrice || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA</td>
                  <td className="border border-gray-300 px-2 py-3 text-right">{product.taxPercent}%</td>
                  <td className="border border-gray-300 px-2 py-3 text-right font-bold">{parseFloat(product.wholesalePrice || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA</td>
                  <td className="border border-gray-300 px-2 py-3 text-right font-bold text-amber-600">{parseFloat(product.semiWholesalePrice || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA</td>
                  <td className="border border-gray-300 px-2 py-3 text-right font-bold text-emerald-600">{parseFloat(product.retailPrice || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA</td>
                </tr>
              ))}
              {filteredProducts.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={20} className="border border-gray-300 px-2 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-3">
                      <Package className="w-10 h-10 text-gray-300" />
                      <p className="text-lg font-medium">Aucun produit trouvé</p>
                      <p>Essayez de modifier vos critères de recherche ou ajoutez un nouveau produit.</p>
                      <button
                        onClick={() => handleAction('new')}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Ajouter un produit
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Fixed Footer */}
        <div className={`px-6 py-3 bg-gray-50 border-t border-gray-200 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">
              Affichage de {Math.min(filteredProducts.length, 15)} sur {filteredProducts.length} produit(s) • {selectedProducts.length} sélectionné(s)
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
        onClose={() => {
          setIsNewProductModalOpen(false);
          fetchProducts();
        }}
        productData={productToEdit}
        isEdit={isEditMode}
      />

      {/* Import Modal */}
      <ImportProductModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={fetchProducts}
      />
    </div>
  );
}
