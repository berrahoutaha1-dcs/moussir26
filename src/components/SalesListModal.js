import React, { useState } from 'react';
import { X, Search, Eye, Printer, Download, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function SalesListModal({ isOpen, onClose }) {
  const { t, direction } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Mock sales data
  const [sales] = useState([
    {
      id: 'SALE001',
      invoiceNumber: 'FAC-2024-001',
      client: 'Société ALPHA',
      date: '2024-01-15',
      amount: 450000,
      status: 'paid',
      paymentMethod: 'Cash'
    },
    {
      id: 'SALE002',
      invoiceNumber: 'FAC-2024-002',
      client: 'BETA Distribution',
      date: '2024-01-16',
      amount: 320000,
      status: 'pending',
      paymentMethod: 'Credit'
    },
    {
      id: 'SALE003',
      invoiceNumber: 'FAC-2024-003',
      client: 'GAMMA Entreprise',
      date: '2024-01-17',
      amount: 780000,
      status: 'paid',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'SALE004',
      invoiceNumber: 'FAC-2024-004',
      client: 'DELTA Services',
      date: '2024-01-18',
      amount: 210000,
      status: 'paid',
      paymentMethod: 'Cash'
    },
    {
      id: 'SALE005',
      invoiceNumber: 'FAC-2024-005',
      client: 'EPSILON Commerce',
      date: '2024-01-19',
      amount: 560000,
      status: 'overdue',
      paymentMethod: 'Credit'
    }
  ]);

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDateFrom = !filterDateFrom || sale.date >= filterDateFrom;
    const matchesDateTo = !filterDateTo || sale.date <= filterDateTo;
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('sales.list')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder={t('common.search') || 'Rechercher...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder={t('common.from') || 'De'}
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
              <Input
                type="date"
                placeholder={t('common.to') || 'À'}
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                {t('common.filter') || 'Filtrer'}
              </Button>
            </div>
          </div>

          {/* Sales Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">{t('sales.invoiceNumber') || 'Numéro'}</th>
                  <th className="p-3 text-left">{t('common.client') || 'Client'}</th>
                  <th className="p-3 text-left">{t('common.date') || 'Date'}</th>
                  <th className="p-3 text-right">{t('common.amount') || 'Montant'}</th>
                  <th className="p-3 text-center">{t('common.status') || 'Statut'}</th>
                  <th className="p-3 text-center">{t('common.actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{sale.invoiceNumber}</td>
                    <td className="p-3">{sale.client}</td>
                    <td className="p-3">{new Date(sale.date).toLocaleDateString()}</td>
                    <td className="p-3 text-right font-semibold">
                      {sale.amount.toLocaleString()} {t('currency') || 'DA'}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'paid' ? 'bg-green-100 text-green-800' :
                        sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {sale.status === 'paid' ? (t('common.paid') || 'Payé') :
                         sale.status === 'pending' ? (t('common.pending') || 'En attente') :
                         (t('common.overdue') || 'En retard')}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan="3" className="p-3 text-right">
                    {t('common.total') || 'Total'}
                  </td>
                  <td className="p-3 text-right">
                    {totalAmount.toLocaleString()} {t('currency') || 'DA'}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              {t('common.close') || 'Fermer'}
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              {t('common.export') || 'Exporter'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}




