import React, { useState } from 'react';
import { X, Search, Plus, FileText, Printer, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import ClientSelectionModal from './ClientSelectionModal';
// import ProductListModal from './ProductListModal';

export default function SalesInvoiceModal({ isOpen, onClose }) {
  const { t, direction } = useLanguage();
  const [selectedClient, setSelectedClient] = useState(null);
  const [products, setProducts] = useState([]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('FAC-' + Date.now().toString().slice(-6));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setIsClientModalOpen(false);
  };

  const handleProductSelect = (product) => {
    setProducts([...products, { ...product, quantity: 1, total: product.prix }]);
    setIsProductModalOpen(false);
  };

  const handleRemoveProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, quantity) => {
    const newProducts = [...products];
    newProducts[index].quantity = quantity;
    newProducts[index].total = newProducts[index].prix * quantity;
    setProducts(newProducts);
  };

  const subtotal = products.reduce((sum, p) => sum + (p.total || 0), 0);
  const tax = subtotal * 0.19; // 19% VAT
  const total = subtotal + tax;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('sales.invoice')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('sales.invoiceNumber') || 'Numéro de facture'}
              </label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('common.date') || 'Date'}
              </label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('sales.dueDate') || 'Date d\'échéance'}
              </label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('common.client') || 'Client'}
            </label>
            <Button
              onClick={() => setIsClientModalOpen(true)}
              variant="outline"
              className="w-full justify-start"
            >
              {selectedClient ? selectedClient.name : t('sales.selectClient') || 'Sélectionner un client'}
            </Button>
          </div>

          {/* Products Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {t('products.title') || 'Produits'}
              </h3>
              <Button onClick={() => setIsProductModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('products.add') || 'Ajouter un produit'}
              </Button>
            </div>

            {products.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">{t('products.designation') || 'Désignation'}</th>
                      <th className="p-3 text-right">{t('products.price') || 'Prix HT'}</th>
                      <th className="p-3 text-right">{t('products.quantity') || 'Quantité'}</th>
                      <th className="p-3 text-right">{t('common.total') || 'Total HT'}</th>
                      <th className="p-3 text-center">{t('common.actions') || 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{product.designation}</td>
                        <td className="p-3 text-right">{product.prix?.toLocaleString()} {t('currency') || 'DA'}</td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={product.quantity || 1}
                            onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value) || 1)}
                            className="w-20 ml-auto"
                          />
                        </td>
                        <td className="p-3 text-right">
                          {(product.total || 0).toLocaleString()} {t('currency') || 'DA'}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProduct(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <tr>
                      <td colSpan="3" className="p-3 text-right font-semibold">
                        {t('sales.subtotal') || 'Sous-total HT'}
                      </td>
                      <td className="p-3 text-right">
                        {subtotal.toLocaleString()} {t('currency') || 'DA'}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="p-3 text-right font-semibold">
                        {t('sales.vat') || 'TVA (19%)'}
                      </td>
                      <td className="p-3 text-right">
                        {tax.toLocaleString()} {t('currency') || 'DA'}
                      </td>
                      <td></td>
                    </tr>
                    <tr className="bg-gray-200 font-bold">
                      <td colSpan="3" className="p-3 text-right">
                        {t('common.total') || 'Total TTC'}
                      </td>
                      <td className="p-3 text-right">
                        {total.toLocaleString()} {t('currency') || 'DA'}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="border rounded-lg p-8 text-center text-gray-500">
                {t('sales.noProducts') || 'Aucun produit ajouté'}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              {t('common.cancel') || 'Annuler'}
            </Button>
            <Button>
              <Printer className="w-4 h-4 mr-2" />
              {t('common.print') || 'Imprimer'}
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              {t('common.save') || 'Enregistrer'}
            </Button>
          </div>
        </div>

        {/* Client Selection Modal */}
        <ClientSelectionModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          onSelectClient={handleClientSelect}
        />

        {/* Product Selection - Simple inline selection */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t('products.title') || 'Sélectionner un produit'}</h3>
                <Button variant="ghost" onClick={() => setIsProductModalOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    handleProductSelect({ designation: 'Produit 1', prix: 1000 });
                    setIsProductModalOpen(false);
                  }}
                >
                  Produit 1 - 1000 DA
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    handleProductSelect({ designation: 'Produit 2', prix: 2000 });
                    setIsProductModalOpen(false);
                  }}
                >
                  Produit 2 - 2000 DA
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

