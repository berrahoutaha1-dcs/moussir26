import React, { useState, useMemo, useEffect } from 'react';
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
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const response = await window.electronAPI.batches.getAll();
      if (response.success) {
        // Map database fields to the frontend expected field names if necessary
        const mappedData = response.data.map(b => ({
          id: b.id,
          numLot: b.num_lot,
          productId: b.product_id,
          designation: b.designation,
          quantity: b.quantity,
          expiryDate: b.expiry_date,
          receptionDate: b.reception_date,
          alertDate: b.alert_date
        }));
        setBatches(mappedData);
      } else {
        toast.error(response.error || t('error.fetching.batches'));
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error(error.message || t('error.fetching.batches'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBatches();
    }
  }, [isOpen]);

  const filteredBatches = useMemo(() => {
    return batches.filter(batch =>
      batch.numLot.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [batches, searchTerm]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
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

  const handleSaveBatch = async (batchData) => {
    try {
      // Map frontend field names to database field names
      const mappedData = {
        num_lot: batchData.numLot,
        product_id: batchData.productId,
        designation: batchData.designation,
        quantity: batchData.quantity,
        expiry_date: batchData.expiryDate,
        reception_date: batchData.receptionDate,
        alert_date: batchData.alertDate
      };

      let response;
      if (formMode === 'add') {
        response = await window.electronAPI.batches.create(mappedData);
        if (response.success) {
          toast.success(t('batch.success.added') || 'Lot ajouté');
        }
      } else {
        response = await window.electronAPI.batches.update(selectedBatch, mappedData);
        if (response.success) {
          toast.success(t('batch.success.updated') || 'Lot modifié');
        }
      }

      if (response && response.success) {
        fetchBatches();
      } else {
        toast.error(response.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Error saving batch:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedBatch) {
      try {
        const response = await window.electronAPI.batches.delete(selectedBatch);
        if (response.success) {
          setSelectedBatch(null);
          toast.success(t('batch.success.deleted') || 'Lot supprimé');
          fetchBatches();
        } else {
          toast.error(response.error || 'Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Error deleting batch:', error);
        toast.error('Erreur lors de la suppression');
      }
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
