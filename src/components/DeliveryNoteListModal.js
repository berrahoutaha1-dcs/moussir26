import React, { useState } from 'react';
import { X, Search, Eye, Printer, Download, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function DeliveryNoteListModal({ isOpen, onClose }) {
  const { t, direction } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Mock delivery notes data
  const [deliveryNotes] = useState([
    {
      id: 'BL001',
      noteNumber: 'BL-2024-001',
      client: 'Société ALPHA',
      date: '2024-01-15',
      amount: 450000,
      status: 'delivered'
    },
    {
      id: 'BL002',
      noteNumber: 'BL-2024-002',
      client: 'BETA Distribution',
      date: '2024-01-16',
      amount: 320000,
      status: 'pending'
    },
    {
      id: 'BL003',
      noteNumber: 'BL-2024-003',
      client: 'GAMMA Entreprise',
      date: '2024-01-17',
      amount: 780000,
      status: 'delivered'
    },
    {
      id: 'BL004',
      noteNumber: 'BL-2024-004',
      client: 'DELTA Services',
      date: '2024-01-18',
      amount: 210000,
      status: 'delivered'
    }
  ]);

  const filteredNotes = deliveryNotes.filter(note => {
    const matchesSearch = note.noteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDateFrom = !filterDateFrom || note.date >= filterDateFrom;
    const matchesDateTo = !filterDateTo || note.date <= filterDateTo;
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const totalAmount = filteredNotes.reduce((sum, note) => sum + note.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('sales.listingBl')}</DialogTitle>
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

          {/* Delivery Notes Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">{t('sales.noteNumber') || 'Numéro de bon'}</th>
                  <th className="p-3 text-left">{t('common.client') || 'Client'}</th>
                  <th className="p-3 text-left">{t('common.date') || 'Date'}</th>
                  <th className="p-3 text-right">{t('common.amount') || 'Montant'}</th>
                  <th className="p-3 text-center">{t('common.status') || 'Statut'}</th>
                  <th className="p-3 text-center">{t('common.actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotes.map((note) => (
                  <tr key={note.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{note.noteNumber}</td>
                    <td className="p-3">{note.client}</td>
                    <td className="p-3">{new Date(note.date).toLocaleDateString()}</td>
                    <td className="p-3 text-right font-semibold">
                      {note.amount.toLocaleString()} {t('currency') || 'DA'}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        note.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {note.status === 'delivered' ? (t('sales.delivered') || 'Livré') :
                         (t('common.pending') || 'En attente')}
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




