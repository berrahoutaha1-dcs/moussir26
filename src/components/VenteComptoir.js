import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import ClientSelectionModal from './ClientSelectionModal';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../utils/currency';
import {
  Pause,
  Play,
  Search,
  List,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export default function VenteComptoir({ onClose }) {
  const { t, direction, currency } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [totalAmount, setTotalAmount] = useState(0);
  const [products, setProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductListOpen, setIsProductListOpen] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);

  const [availableProducts] = useState([
    { id: 'P001', designation: 'Laptop Dell XPS 13', prix: 125000, stock: 5, category: 'Informatique', barcode: '123456789012' },
    { id: 'P002', designation: 'Smartphone Samsung Galaxy S24', prix: 89000, stock: 12, category: 'Téléphonie', barcode: '123456789013' },
    { id: 'P003', designation: 'Tablette iPad Air', prix: 67000, stock: 8, category: 'Informatique', barcode: '123456789014' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setIsClientModalOpen(false);
  };

  const addProduct = (product) => {
    // Check if product is already in the list
    const isAlreadyInList = products.some(p => p.designation === product.designation);

    if (isAlreadyInList) {
      toast.error(t('vente.error.alreadyAdded') || 'Ce produit est déjà dans la liste');
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      designation: product.designation,
      prixHT: product.prix,
      quantite: 1,
      total: product.prix
    };
    const newProducts = [...products, newProduct];
    setProducts(newProducts);
    calculateTotal(newProducts);
    setIsProductListOpen(false);
    setSearchTerm('');
  };

  const calculateTotal = (productList) => {
    const total = productList.reduce((sum, product) => sum + product.total, 0);
    const clientDiscount = selectedClient ? selectedClient.discount : 0;
    const finalTotal = total - (total * clientDiscount / 100);
    setTotalAmount(finalTotal);
  };

  const clearTransaction = () => {
    setProducts([]);
    setTotalAmount(0);
    setSelectedProductIndex(-1);
  };

  const deleteSelectedProduct = () => {
    if (selectedProductIndex >= 0 && selectedProductIndex < products.length) {
      const newProducts = products.filter((_, index) => index !== selectedProductIndex);
      setProducts(newProducts);
      calculateTotal(newProducts);
      setSelectedProductIndex(-1);
    }
  };

  const validateTransaction = () => {
    if (products.length === 0) {
      toast.error(t('vente.error.noProducts'));
      return;
    }

    if (!selectedClient) {
      toast.error(t('vente.error.noClient'));
      return;
    }

    toast.success(t('vente.success'));
    clearTransaction();
  };

  const filteredProducts = availableProducts.filter(product =>
    product.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

  return (
    <div className="h-screen bg-white flex flex-col font-mono text-sm overflow-hidden">
      {/* Header Bar */}
      <div className="bg-black text-white px-4 py-3 relative text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div
              className="bg-slate-600 text-white rounded-lg px-4 py-3 min-w-[490px]"
              style={{ backgroundColor: '#3f4651' }}
            >
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span
                      onClick={() => setIsClientModalOpen(true)}
                      className="cursor-pointer hover:text-blue-300 px-2 py-1 rounded-md hover:bg-blue-500/20"
                    >
                      {t('vente.clientLabel')}
                    </span>
                    {selectedClient ? (
                      <span className="px-2 py-1 rounded-md" style={{ color: '#5b9bd5', fontWeight: '600' }}>
                        {selectedClient.name}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-md border border-gray-400 text-gray-300 text-sm italic">
                        {t('vente.clickToSelect')}
                      </span>
                    )}
                  </div>
                  <span>
                    {t('vente.discountLabel')} {selectedClient ? selectedClient.discount : 0} %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>
                    {t('vente.oldBalanceLabel')} {selectedClient ? selectedClient.balance.toFixed(2) : '0.00'} {currency}
                  </span>
                  <span>
                    {t('vente.loyaltyPointsLabel')} {selectedClient ? selectedClient.loyaltyPoints : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('vente.dateLabel')} {new Date().toLocaleDateString('fr-FR')}</span>
                  <span>{t('vente.pointsEarnedLabel')} 0</span>
                </div>
                <div className="text-left">
                  <span>
                    {t('vente.newBalanceLabel')} {selectedClient ? selectedClient.balance.toFixed(2) : '0.00'} {currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-end items-end space-x-8">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col">
                <label className="text-white mb-1 text-xs font-medium">{t('vente.stockLabel')}</label>
                <Input className="w-20 h-8 px-2 text-xs bg-white text-black" readOnly value="0" />
              </div>
              <div className="flex flex-col">
                <label className="text-white mb-1 text-xs font-medium">OPA:</label>
                <Input className="w-20 h-8 px-2 text-xs bg-white text-black" readOnly value="0" />
              </div>
            </div>
          </div>
        </div>

        {/* Center Total Amount */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div style={{ fontSize: '72px', fontWeight: '800', color: 'white' }}>
            {formatCurrency(totalAmount, currency)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className="w-48 bg-gray-100">
          <div className="bg-black border-b border-gray-600">
            <Button
              onClick={onClose}
              className="w-full h-12 rounded-none bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {t('vente.exit')}
            </Button>
          </div>

          <div className="bg-black text-white text-center py-6">
            <div className="font-mono font-bold" style={{ fontSize: '48px' }}>
              {formatTime(currentTime)}
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col">
          {/* Control Buttons Row */}
          <div className="bg-gray-100 px-2 py-2 flex justify-between items-center border-t border-gray-300">
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-500 text-black px-2 py-1 rounded font-bold text-sm">
                $ {t('vente.payment')}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={t('vente.searchProduct')}
                  className="w-96"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={async (e) => {
                    if (e.key === 'Enter') {
                      const val = searchTerm.trim();
                      if (val) {
                        try {
                          // Try to find exact match by barcode
                          const result = await window.electronAPI.products.getByBarcode(val);
                          if (result.success && result.data) {
                            addProduct(result.data);
                            return;
                          }

                          // If no exact barcode match, open the list with the search term
                          setIsProductListOpen(true);
                        } catch (err) {
                          console.error('Error during barcode scan:', err);
                          setIsProductListOpen(true);
                        }
                      } else {
                        setIsProductListOpen(true);
                      }
                    }
                  }}
                />
                <button
                  onClick={() => setIsProductListOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-10 rounded-md flex items-center gap-2"
                >
                  <List size={16} />
                  <span>{t('vente.list')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="flex-1 bg-white">
            <div className="grid grid-cols-4 bg-gray-100 border-b-2 border-gray-300 text-sm font-semibold text-gray-700">
              <div className="p-3 text-left border-r border-gray-300">
                {t('vente.designation')}
              </div>
              <div className="p-3 border-r border-gray-300 text-center">
                {t('vente.price')}
              </div>
              <div className="p-3 border-r border-gray-300 text-center">
                {t('vente.quantity')}
              </div>
              <div className="p-3 text-center">
                {t('vente.total')}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`grid grid-cols-4 border-b border-gray-200 text-sm min-h-[52px] cursor-pointer hover:bg-blue-50 ${selectedProductIndex === index ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                    }`}
                  onClick={() => setSelectedProductIndex(index)}
                >
                  <div className="p-3 border-r border-gray-200 flex items-center">
                    <span className="font-medium text-gray-800">{product.designation}</span>
                  </div>
                  <div className="p-3 border-r border-gray-200 flex items-center justify-center">
                    <span className="font-medium text-gray-700">{formatCurrency(product.prixHT, currency)}</span>
                  </div>
                  <div className="p-3 border-r border-gray-200 flex items-center justify-center">
                    <span className="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{product.quantite}</span>
                  </div>
                  <div className="p-3 flex items-center justify-center">
                    <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">{formatCurrency(product.total, currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-36 bg-gray-600 flex flex-col">
          <Button
            className="h-16 rounded-none border-b border-gray-500 text-white text-[9px] hover:bg-blue-600 bg-blue-500"
            onClick={validateTransaction}
          >
            {t('vente.validate')}
          </Button>
          <Button
            className="h-16 rounded-none border-b border-gray-500 text-white text-[9px] hover:bg-red-600 bg-gray-600"
            onClick={deleteSelectedProduct}
            disabled={selectedProductIndex < 0}
          >
            {t('vente.delete')}
          </Button>
          <Button
            className="h-16 rounded-none border-b border-gray-500 text-white text-[9px] hover:bg-gray-500 bg-gray-600"
            onClick={clearTransaction}
          >
            {t('vente.cancel')}
          </Button>
          <Button
            className="h-16 rounded-none border-b border-gray-500 text-white text-[9px] hover:bg-green-600 bg-gray-600"
            onClick={() => setIsProductListOpen(true)}
          >
            {t('vente.add')}
          </Button>
        </div>
      </div>

      {/* Product List Modal */}
      {isProductListOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('vente.productList')}</h2>
              <button onClick={() => setIsProductListOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
                ×
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 ${direction === 'rtl' ? 'right-3' : 'left-3'} text-gray-400`} size={20} />
                <Input
                  type="text"
                  placeholder={t('vente.search')}
                  className={`${direction === 'rtl' ? 'pr-10' : 'pl-10'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addProduct(product)}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">{product.designation}</h3>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">{t('vente.priceLabel')}</span>
                        <span className="ml-2 font-bold">{formatCurrency(product.prix, currency)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('vente.stockLabel')}</span>
                        <span className={`ml-2 ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {product.stock}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('vente.categoryLabel')}</span>
                        <span className="ml-2">{product.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('common.code')}:</span>
                        <span className="ml-2">{product.barcode || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 mt-4 flex justify-end">
              <Button onClick={() => setIsProductListOpen(false)} variant="outline">
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Client Selection Modal */}
      <ClientSelectionModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelectClient={handleClientSelect}
      />
    </div>
  );
}

