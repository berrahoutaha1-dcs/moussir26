import React, { useState, useEffect } from 'react';
import { X, Settings, Trash2, Edit3, Plus, ChevronDown, Save, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import TicketNoteModal from './TicketNoteModal';

export default function PrintersModal({ isOpen, onClose }) {
  const { direction, t, language } = useLanguage();
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [isTicketNoteModalOpen, setIsTicketNoteModalOpen] = useState(false);
  const [printers, setPrinters] = useState([
    { id: 1, libelle: '', imprimante: '\\\\COMPUTER\\HP_LaserJet_Pro' },
    { id: 2, libelle: '', imprimante: '\\\\SERVER\\Canon_iR_2625' },
    { id: 3, libelle: '', imprimante: '\\\\LOCAL\\Brother_QL_700' },
    { id: 4, libelle: '', imprimante: '' },
    { id: 5, libelle: '', imprimante: '' },
    { id: 6, libelle: '', imprimante: '' },
    { id: 7, libelle: '', imprimante: '' },
    { id: 8, libelle: '', imprimante: '' },
  ]);

  // Update printer labels when language changes
  useEffect(() => {
    if (isOpen) {
      setPrinters(prev => [
        { ...prev[0], libelle: prev[0].libelle || t('printers.mainPrinter') },
        ...prev.slice(1)
      ]);
    }
  }, [isOpen, t]);

  const [editingData, setEditingData] = useState({ libelle: '', imprimante: '' });

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (editingRow !== null) {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelEdit();
          }
        } else {
          if (e.key === 'Delete' && selectedRow !== null) {
            e.preventDefault();
            handleDelete();
          } else if (e.key === 'F2' && selectedRow !== null) {
            e.preventDefault();
            handleEdit();
          } else if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            handleNew();
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, editingRow, selectedRow]);

  if (!isOpen) return null;

  const handleNew = () => {
    const emptyIndex = printers.findIndex(p => !p.libelle && !p.imprimante);
    if (emptyIndex !== -1) {
      setSelectedRow(emptyIndex);
      setEditingRow(emptyIndex);
      setEditingData({ libelle: '', imprimante: '' });
      toast.success(t('printers.success.creationMode'));
    } else {
      toast.error(t('printers.error.allRowsOccupied'));
    }
  };

  const handleEdit = () => {
    if (selectedRow !== null) {
      const printer = printers[selectedRow];
      if (printer.libelle || printer.imprimante) {
        setEditingRow(selectedRow);
        setEditingData({
          libelle: printer.libelle,
          imprimante: printer.imprimante
        });
        toast.success(t('printers.success.editMode'));
      } else {
        toast.warning(t('printers.warning.selectConfigured'));
      }
    }
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      const printer = printers[selectedRow];
      if (printer.libelle || printer.imprimante) {
        const newPrinters = [...printers];
        newPrinters[selectedRow] = { ...printer, libelle: '', imprimante: '' };
        setPrinters(newPrinters);
        setSelectedRow(null);
        toast.success(t('printers.success.deleted'));
      } else {
        toast.warning(t('printers.warning.noPrinterToDelete'));
      }
    }
  };

  const handleSave = () => {
    if (editingRow !== null) {
      if (!editingData.libelle.trim()) {
        toast.error(t('printers.error.labelRequired'));
        return;
      }
      if (!editingData.imprimante.trim()) {
        toast.error(t('printers.error.pathRequired'));
        return;
      }

      const newPrinters = [...printers];
      newPrinters[editingRow] = {
        ...newPrinters[editingRow],
        libelle: editingData.libelle.trim(),
        imprimante: editingData.imprimante.trim()
      };
      
      setPrinters(newPrinters);
      setEditingRow(null);
      setEditingData({ libelle: '', imprimante: '' });
      toast.success(t('printers.success.saved'));
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditingData({ libelle: '', imprimante: '' });
    toast.info(t('printers.info.editCancelled'));
  };

  const handleAutoDetect = () => {
    const detectedPrinters = [
      { libelle: 'HP LaserJet Pro', imprimante: '\\\\COMPUTER\\HP_LaserJet_Pro' },
      { libelle: 'Canon PIXMA', imprimante: '\\\\LOCAL\\Canon_PIXMA_TS3150' },
      { libelle: 'Brother DCP', imprimante: '\\\\NETWORK\\Brother_DCP_L2540DW' }
    ];

    let added = 0;
    const newPrinters = [...printers];
    
    detectedPrinters.forEach(detected => {
      const emptyIndex = newPrinters.findIndex(p => !p.libelle && !p.imprimante);
      if (emptyIndex !== -1) {
        newPrinters[emptyIndex] = { ...newPrinters[emptyIndex], ...detected };
        added++;
      }
    });

    setPrinters(newPrinters);
    if (added > 0) {
      toast.success(t('printers.success.detected').replace('{count}', added));
    } else {
      toast.warning(t('printers.warning.noNewPrinters'));
    }
  };

  const handleTicketNote = () => {
    setIsTicketNoteModalOpen(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-[945px] h-[567px] border border-slate-200 overflow-hidden ${direction === 'rtl' ? 'rtl' : ''}`}
        tabIndex={0}
      >
        <div className={`bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-6 py-4 flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-3`}>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium text-slate-700">
              {t('printers.title')}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className={`bg-white px-6 py-4 border-b border-slate-100 ${direction === 'rtl' ? 'text-right' : ''}`}>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              {t('printers.subtitle')}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {editingRow !== null 
                ? t('printers.subtitleEdit')
                : t('printers.subtitleNormal')
              }
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
          <div className={`flex ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-3`}>
            {editingRow !== null ? (
              <>
                <Button 
                  variant="outline"
                  className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                  onClick={handleSave}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t('printers.save')}
                </Button>
                <Button 
                  variant="outline"
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  onClick={handleCancelEdit}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('printers.cancel')}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 disabled:opacity-50"
                  onClick={handleDelete}
                  disabled={selectedRow === null}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('printers.delete')}
                </Button>
                <Button 
                  variant="outline"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 disabled:opacity-50"
                  onClick={handleEdit}
                  disabled={selectedRow === null}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {t('printers.edit')}
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200"
                  onClick={handleNew}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('printers.new')}
                </Button>
                <Button 
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                  onClick={handleAutoDetect}
                >
                  🔍 {t('printers.detect')}
                </Button>
                <Button 
                  variant="outline"
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                  onClick={handleTicketNote}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {t('printers.ticketNote')}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="grid grid-cols-2">
            <div className={`px-6 py-3 border-r border-blue-500 ${direction === 'rtl' ? 'border-l border-r-0' : ''}`}>
              <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} justify-between`}>
                <span className="font-medium">{t('printers.label')}</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </div>
            </div>
            <div className="px-6 py-3">
              <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} justify-between`}>
                <span className="font-medium">{t('printers.printer')}</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white overflow-auto">
          {printers.map((printer, index) => (
            <div 
              key={printer.id}
              className={`grid grid-cols-2 border-b border-slate-100 transition-colors duration-150 ${
                selectedRow === index ? 'bg-blue-50 border-blue-200' : 
                editingRow === index ? 'bg-green-50 border-green-200' : 
                'hover:bg-slate-50 cursor-pointer'
              }`}
              onClick={() => editingRow === null && setSelectedRow(index)}
            >
              <div className={`px-6 py-3 border-r border-slate-100 ${direction === 'rtl' ? 'border-l border-r-0' : ''}`}>
                <Input 
                  value={editingRow === index ? editingData.libelle : printer.libelle}
                  placeholder={t('printers.labelPlaceholder')}
                  className={`border-none bg-transparent p-0 h-6 text-sm focus:ring-0 focus:border-none placeholder:text-slate-400 ${
                    editingRow === index ? 'bg-white border border-blue-300 px-2 rounded' : ''
                  }`}
                  readOnly={editingRow !== index}
                  onChange={(e) => editingRow === index && setEditingData(prev => ({ ...prev, libelle: e.target.value }))}
                />
              </div>
              <div className="px-6 py-3">
                <Input 
                  value={editingRow === index ? editingData.imprimante : printer.imprimante}
                  placeholder={t('printers.printerPlaceholder')}
                  className={`border-none bg-transparent p-0 h-6 text-sm focus:ring-0 focus:border-none placeholder:text-slate-400 ${
                    editingRow === index ? 'bg-white border border-blue-300 px-2 rounded' : ''
                  }`}
                  readOnly={editingRow !== index}
                  onChange={(e) => editingRow === index && setEditingData(prev => ({ ...prev, imprimante: e.target.value }))}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-2">
          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} justify-between`}>
            <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-2`}>
              <div className={`w-2 h-2 rounded-full ${editingRow !== null ? 'bg-orange-500' : 'bg-green-500'}`}></div>
              <span className="text-xs text-slate-600">
                {editingRow !== null 
                  ? t('printers.editMode')
                  : t('printers.systemReady')
                }
              </span>
            </div>
            <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-4`}>
              <span className="text-xs text-slate-500">
                {t('printers.configured').replace('{count}', printers.filter(p => p.libelle || p.imprimante).length)}
              </span>
              {selectedRow !== null && (
                <span className="text-xs text-blue-600">
                  {t('printers.rowSelected').replace('{row}', selectedRow + 1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <TicketNoteModal
        isOpen={isTicketNoteModalOpen}
        onClose={() => setIsTicketNoteModalOpen(false)}
      />
    </div>
  );
}

