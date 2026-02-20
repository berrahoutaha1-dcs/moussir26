import React, { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import BatchFormModal from './BatchFormModal';
import CategoryDeleteModal from './CategoryDeleteModal';
import { toast } from 'sonner';
import {
  X,
  Plus,
  Edit,
  Trash2,
  Package2,
  Search
} from 'lucide-react';

export default function BatchModal({ isOpen, onClose }) {
  const { t, direction } = useLanguage();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');

  const [batches, setBatches] = useState([
    {
      id: '1',
      numLot: '613225450001',
      barcode: '3760123456789',
      designation: 'Crème hydratante',
      quantity: 150,
      expiryDate: '2026-06-26',
      receptionDate: '2025-06-30',
      alertDate: '2026-03-18'
    },
    {
      id: '2',
      numLot: '613225450013',
      barcode: '3760123456790',
      designation: 'Crème hydratante visage',
      quantity: 85,
      expiryDate: '2026-06-11',
      receptionDate: '2025-06-30',
      alertDate: '2026-03-03'
    },
    {
      id: '3',
      numLot: '613225450013',
      barcode: '3760123456791',
      designation: 'Crème hydratante visage',
      quantity: 200,
      expiryDate: '2026-06-13',
      receptionDate: '2025-06-30',
      alertDate: '2026-03-13'
    },
    {
      id: '4',
      numLot: '000000012245',
      barcode: '1234567890123',
      designation: 'test',
      quantity: 12,
      expiryDate: '2025-07-23',
      receptionDate: '2025-07-17',
      alertDate: '2025-07-22'
    },
    {
      id: '5',
      numLot: '613225450013',
      barcode: '3760123456792',
      designation: 'Crème hydratante visage',
      quantity: 75,
      expiryDate: '2025-08-16',
      receptionDate: '2025-07-20',
      alertDate: '2024-03-04'
    },
    {
      id: '6',
      numLot: '000000012245',
      barcode: '1234567890124',
      designation: 'test',
      quantity: 38,
      expiryDate: '2025-08-16',
      receptionDate: '2025-08-12',
      alertDate: '2024-03-04'
    }
  ]);

  const filteredBatches = useMemo(() => {
    return batches.filter(batch =>
      batch.numLot.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [batches, searchTerm]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSelectedBatchData = () => {
    return batches.find(batch => batch.id === selectedBatch) || null;
  };

  const handleNewBatch = () => {
    setFormMode('add');
    setFormModalOpen(true);
  };

  const handleModifyBatch = () => {
    if (selectedBatch) {
      setFormMode('edit');
      setFormModalOpen(true);
    }
  };

  const handleDeleteBatch = () => {
    if (selectedBatch) {
      setDeleteModalOpen(true);
    }
  };

  const handleSaveBatch = (batchData) => {
    if (formMode === 'add') {
      const newBatch = {
        id: Date.now().toString(),
        ...batchData
      };
      setBatches(prev => [...prev, newBatch]);
      toast.success(t('batch.success.added') || 'Lot ajouté');
    } else if (formMode === 'edit' && selectedBatch) {
      setBatches(prev => prev.map(batch =>
        batch.id === selectedBatch
          ? { ...batch, ...batchData }
          : batch
      ));
      toast.success(t('batch.success.updated') || 'Lot modifié');
    }
  };

  const handleConfirmDelete = () => {
    if (selectedBatch) {
      setBatches(prev => prev.filter(batch => batch.id !== selectedBatch));
      setSelectedBatch(null);
      toast.success(t('batch.success.deleted') || 'Lot supprimé');
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
        className={`bg-white rounded-2xl shadow-2xl flex flex-col ${direction === 'rtl' ? 'rtl' : ''}`}
        style={{
          width: '95vw',
          height: '85vh',
          maxWidth: '1400px',
          maxHeight: '900px',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 border-b border-gray-100 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Package2 className="w-5 h-5 text-gray-600" />
            </div>
            <h2 className="text-lg text-gray-900 font-semibold">{t('batch.title') || 'Table des lots'}</h2>
          </div>

          <div className="flex-1 max-w-md w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('search') || 'Rechercher...'}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Action Buttons */}
            <button
              onClick={handleNewBatch}
              className="flex-none flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{t('batch.new') || 'Nouveau'}</span>
            </button>

            <button
              onClick={handleModifyBatch}
              disabled={!selectedBatch}
              className="flex-none flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm whitespace-nowrap"
            >
              <Edit className="w-4 h-4" />
              <span>{t('batch.modify') || 'Modifier'}</span>
            </button>

            <button
              onClick={handleDeleteBatch}
              disabled={!selectedBatch}
              className="flex-none flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('batch.delete') || 'Supprimer'}</span>
            </button>

            <button
              onClick={onClose}
              className="flex-none p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto custom-scrollbar">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50/80 sticky top-0 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    {t('batch.numLot') || 'NumLot'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    {t('batch.designation') || 'Désignation'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    {t('batch.quantity') || 'Quantité'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    {t('batch.expiryDate') || 'Date Péremption'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    {t('batch.receptionDate') || 'Date Réception'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    {t('batch.alertDate') || 'Date Alerte'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredBatches.map((batch, index) => (
                  <tr
                    key={batch.id}
                    onClick={() => setSelectedBatch(batch.id)}
                    className={`cursor-pointer transition-all duration-150 ${selectedBatch === batch.id
                      ? 'bg-blue-50 shadow-sm ring-1 ring-blue-200'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="w-6 text-xs text-gray-400 mr-3">{index + 1}</span>
                        <span className="text-gray-900 font-mono text-sm">{batch.numLot}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 min-w-[300px]">
                      {batch.designation}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                        {batch.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm whitespace-nowrap">
                      {formatDate(batch.expiryDate)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm whitespace-nowrap">
                      {formatDate(batch.receptionDate)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm whitespace-nowrap">
                      {formatDate(batch.alertDate)}
                    </td>
                  </tr>
                ))}

                {/* Empty rows to fill the table - only if list is short */}
                {filteredBatches.length < 10 && Array.from({ length: 10 - filteredBatches.length }).map((_, index) => (
                  <tr key={`empty-${index}`} className="hover:bg-gray-25">
                    <td className="px-6 py-4">
                      <span className="w-6 text-xs text-gray-300 mr-3">{filteredBatches.length + index + 1}</span>
                    </td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Modal for Add/Edit */}
        <BatchFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          onSave={handleSaveBatch}
          batch={getSelectedBatchData()}
          mode={formMode}
        />

        {/* Delete Confirmation Modal */}
        <CategoryDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          category={getSelectedBatchData() ? {
            id: getSelectedBatchData().id,
            name: `${getSelectedBatchData().numLot} - ${getSelectedBatchData().designation}`,
            description: ''
          } : null}
          titleKey="batch.delete.title"
          messageKey="batch.delete.message"
          warningKey="batch.delete.warning"
          confirmKey="batch.delete.confirm"
          cancelKey="batch.add.cancel"
        />
      </div>
    </div>
  );
}
