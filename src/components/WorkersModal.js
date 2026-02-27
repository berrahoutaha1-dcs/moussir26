import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, ChevronUp, ChevronDown, Edit, Trash2, X, Search } from 'lucide-react';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import CreateWorkerModal from './CreateWorkerModal';
import { toast } from 'sonner';

export default function WorkersModal({ isOpen, onClose }) {
  const { direction, t, language } = useLanguage();
  const [workers, setWorkers] = useState([]);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [sortField, setSortField] = useState('nomPrenom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isCreateWorkerModalOpen, setIsCreateWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWorkers = async () => {
    try {
      const result = await window.electronAPI.workers.getAll();
      if (result.success) {
        setWorkers(result.data);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWorkers();
      setSelectedWorkers([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSearch = async (val) => {
    setSearchTerm(val);
    try {
      if (val.trim() === '') {
        fetchWorkers();
      } else {
        const result = await window.electronAPI.workers.search(val);
        if (result.success) {
          setWorkers(result.data);
        }
      }
    } catch (error) {
      console.error('Error searching workers:', error);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleWorkerSelect = (workerId) => {
    setSelectedWorkers(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedWorkers(workers.map(w => w.id));
    } else {
      setSelectedWorkers([]);
    }
  };

  const handleNewWorker = () => {
    setEditingWorker(null);
    setIsCreateWorkerModalOpen(true);
  };

  const handleSaveWorker = async (workerData) => {
    try {
      let result;
      if (editingWorker) {
        result = await window.electronAPI.workers.update(editingWorker.id, workerData);
      } else {
        result = await window.electronAPI.workers.create(workerData);
      }

      if (result.success) {
        toast.success(editingWorker ? t('workers.success.updated') : t('workers.success.added'));
        fetchWorkers();
        setIsCreateWorkerModalOpen(false);
        setEditingWorker(null);
      } else {
        toast.error('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving worker:', error);
      toast.error('Failed to save worker');
    }
  };

  const handleEditWorker = () => {
    if (selectedWorkers.length === 1) {
      const workerToEdit = workers.find(w => w.id === selectedWorkers[0]);
      if (workerToEdit) {
        setEditingWorker(workerToEdit);
        setIsCreateWorkerModalOpen(true);
      }
    }
  };

  const handleDeleteWorkers = async () => {
    if (selectedWorkers.length > 0) {
      const confirmMessage = t('workers.confirmDelete').replace('{count}', selectedWorkers.length);

      if (window.confirm(confirmMessage)) {
        try {
          for (const id of selectedWorkers) {
            await window.electronAPI.workers.delete(id);
          }
          setSelectedWorkers([]);
          fetchWorkers();
          toast.success(t('workers.success.deleted'));
        } catch (error) {
          console.error('Error deleting workers:', error);
          toast.error('Failed to delete workers');
        }
      }
    }
  };

  const sortedWorkers = [...workers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp className="w-2 h-2 text-blue-200 opacity-50" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-2 h-2 text-white" />
      : <ChevronDown className="w-2 h-2 text-white" />;
  };

  const formatSalary = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`bg-white p-0 border-0 shadow-xl rounded-lg ${direction === 'rtl' ? 'rtl' : ''}`} style={{ width: '20cm', height: '15cm', maxWidth: '20cm', maxHeight: '15cm' }}>
          <DialogHeader className="px-3 py-2 relative border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-sm text-blue-600 mb-0">
                  {t('workers.title')}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-600">
                  {t('workers.subtitle')}
                </DialogDescription>
              </div>

              <div className="flex space-x-1">
                <div className="relative mr-2">
                  <Search className={`absolute ${direction === 'rtl' ? 'right-2' : 'left-2'} top-2 w-3 h-3 text-slate-400`} />
                  <Input
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={t('common.search')}
                    className={`h-7 text-xs ${direction === 'rtl' ? 'pr-7' : 'pl-7'} w-40 bg-slate-50 border-slate-200 focus:bg-white`}
                  />
                </div>
                <Button
                  onClick={onClose}
                  size="sm"
                  className="px-2 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                >
                  {t('workers.close')}
                </Button>
                <Button
                  onClick={handleDeleteWorkers}
                  disabled={selectedWorkers.length === 0}
                  size="sm"
                  className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('workers.delete')}
                </Button>
                <Button
                  onClick={handleEditWorker}
                  disabled={selectedWorkers.length !== 1}
                  size="sm"
                  className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('workers.edit')}
                </Button>
                <Button
                  onClick={handleNewWorker}
                  size="sm"
                  className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {t('workers.new')}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="p-3 flex flex-col" style={{ height: 'calc(15cm - 100px)' }}>
            <div className="border border-slate-200 rounded-md overflow-auto flex-1">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow className="bg-blue-500 hover:bg-blue-500 border-0">
                    <TableHead className="w-[40px] text-center py-1 border-0">
                      <input
                        type="checkbox"
                        className="rounded border-white bg-white w-3 h-3"
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={selectedWorkers.length === workers.length && workers.length > 0}
                      />
                    </TableHead>
                    <TableHead
                      className="text-white cursor-pointer hover:bg-blue-600 transition-colors py-1 border-0 text-xs w-[160px]"
                      onClick={() => handleSort('nomPrenom')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{t('workers.fullName')}</span>
                        <SortIcon field="nomPrenom" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-white cursor-pointer hover:bg-blue-600 transition-colors py-1 border-0 text-xs w-[100px]"
                      onClick={() => handleSort('dateNaissance')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{t('workers.birthDate')}</span>
                        <SortIcon field="dateNaissance" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-white cursor-pointer hover:bg-blue-600 transition-colors py-1 border-0 text-xs w-[120px]"
                      onClick={() => handleSort('cin')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{t('workers.idNumber')}</span>
                        <SortIcon field="cin" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-white cursor-pointer hover:bg-blue-600 transition-colors py-1 border-0 text-xs w-[100px]"
                      onClick={() => handleSort('dateEmbauche')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{t('workers.hireDate')}</span>
                        <SortIcon field="dateEmbauche" />
                      </div>
                    </TableHead>
                    <TableHead
                      className={`text-white cursor-pointer hover:bg-blue-600 transition-colors py-1 border-0 text-xs text-right w-[120px] ${direction === 'rtl' ? 'text-left' : 'text-right'}`}
                      onClick={() => handleSort('salaire')}
                    >
                      <div className={`flex items-center ${direction === 'rtl' ? 'justify-start' : 'justify-end'} space-x-1`}>
                        <span>{t('workers.salary')}</span>
                        <SortIcon field="salaire" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedWorkers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-3 text-slate-500 text-xs">
                        {t('workers.noWorkers')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedWorkers.map((worker) => (
                      <TableRow
                        key={worker.id}
                        className={`hover:bg-slate-50 cursor-pointer border-0 ${selectedWorkers.includes(worker.id) ? 'bg-blue-50' : 'bg-white'
                          }`}
                        onClick={() => handleWorkerSelect(worker.id)}
                      >
                        <TableCell className="text-center py-1 w-[40px]">
                          <input
                            type="checkbox"
                            className="rounded w-3 h-3"
                            checked={selectedWorkers.includes(worker.id)}
                            onChange={() => handleWorkerSelect(worker.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell className="py-1 text-slate-900 text-xs w-[160px]">
                          {worker.nomPrenom}
                        </TableCell>
                        <TableCell className="py-1 text-slate-700 text-xs w-[100px]">
                          {worker.dateNaissance}
                        </TableCell>
                        <TableCell className="py-1 text-slate-700 text-xs w-[120px]">
                          {worker.cin}
                        </TableCell>
                        <TableCell className="py-1 text-slate-700 text-xs w-[100px]">
                          {worker.dateEmbauche}
                        </TableCell>
                        <TableCell className={`py-1 text-slate-700 text-xs ${direction === 'rtl' ? 'text-left' : 'text-right'} w-[120px]`}>
                          {formatSalary(worker.salaire)} {language === 'ar' ? 'د.ج' : 'DZD'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {workers.length > 0 && (
              <div className={`mt-2 flex justify-between items-center text-xs text-slate-600 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div>
                  {t('workers.total')
                    .replace('{count}', workers.length)
                    .replace('{plural}', workers.length > 1 ? (language === 'ar' ? 'ين' : 's') : '')}
                </div>
                <div>
                  {(language === 'ar' ? t('workers.payrollAr') : t('workers.payroll'))
                    .replace('{amount}', formatSalary(workers.reduce((total, worker) => total + (worker.salaire || 0), 0)))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreateWorkerModal
        isOpen={isCreateWorkerModalOpen}
        onClose={() => {
          setIsCreateWorkerModalOpen(false);
          setEditingWorker(null);
        }}
        onSave={handleSaveWorker}
        worker={editingWorker}
      />
    </>
  );
}

