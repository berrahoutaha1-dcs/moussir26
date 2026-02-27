import React, { useState, useEffect } from 'react';
import { X, Settings, Trash2, Edit3, Plus, ChevronDown, Save, FileText, Search } from 'lucide-react';
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
  const [printers, setPrinters] = useState([]);
  const [systemPrinters, setSystemPrinters] = useState([]);
  const [showSystemDropdown, setShowSystemDropdown] = useState(false);

  const fetchPrinters = async () => {
    try {
      const result = await window.electronAPI.printers.getAll();
      if (result.success) {
        // Ensure we always have at least some rows for the UI aesthetic
        const rows = [...result.data];
        while (rows.length < 8) {
          rows.push({ id: `empty-${rows.length}`, libelle: '', imprimante: '' });
        }
        setPrinters(rows);
      }
    } catch (error) {
      console.error('Error fetching printers:', error);
      toast.error('Error fetching printers');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPrinters();
      setSelectedRow(null);
      setEditingRow(null);
    }
  }, [isOpen]);

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
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, editingRow, selectedRow]);

  if (!isOpen) return null;

  const handleNew = () => {
    const emptyIndex = printers.findIndex(p => !p.libelle && !p.imprimante && typeof p.id === 'string' && p.id.startsWith('empty'));
    if (emptyIndex !== -1) {
      setSelectedRow(emptyIndex);
      setEditingRow(emptyIndex);
      setEditingData({ libelle: '', imprimante: '' });
    } else {
      // Add a new empty row if needed
      const newIndex = printers.length;
      setPrinters([...printers, { id: `empty-${newIndex}`, libelle: '', imprimante: '' }]);
      setSelectedRow(newIndex);
      setEditingRow(newIndex);
      setEditingData({ libelle: '', imprimante: '' });
    }
  };

  const handleEdit = () => {
    if (selectedRow !== null) {
      const printer = printers[selectedRow];
      setEditingRow(selectedRow);
      setEditingData({
        libelle: printer.libelle,
        imprimante: printer.imprimante
      });
    }
  };

  const handleDelete = async () => {
    if (selectedRow !== null) {
      const printer = printers[selectedRow];
      if (typeof printer.id === 'number') {
        try {
          const result = await window.electronAPI.printers.delete(printer.id);
          if (result.success) {
            toast.success(t('printers.success.deleted') || 'Deleted');
            fetchPrinters();
            setSelectedRow(null);
          }
        } catch (error) {
          toast.error('Delete failed');
        }
      } else {
        // Just clear the UI row
        const newPrinters = [...printers];
        newPrinters[selectedRow] = { ...printer, libelle: '', imprimante: '' };
        setPrinters(newPrinters);
        setSelectedRow(null);
      }
    }
  };

  const handleSave = async () => {
    if (editingRow !== null) {
      if (!editingData.libelle.trim()) {
        toast.error('Label required');
        return;
      }
      if (!editingData.imprimante.trim()) {
        toast.error('Path required');
        return;
      }

      const printer = printers[editingRow];
      try {
        let result;
        if (typeof printer.id === 'number') {
          result = await window.electronAPI.printers.update(printer.id, editingData);
        } else {
          result = await window.electronAPI.printers.create(editingData);
        }

        if (result.success) {
          toast.success('Saved');
          setEditingRow(null);
          fetchPrinters();
        }
      } catch (error) {
        toast.error('Save error');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditingData({ libelle: '', imprimante: '' });
  };

  const handleAutoDetect = async () => {
    try {
      toast.loading('Detecting printers...', { id: 'detect' });
      const result = await window.electronAPI.printers.detect();
      if (result.success) {
        setSystemPrinters(result.data);
        setShowSystemDropdown(true);
        toast.success('System printers detected', { id: 'detect' });
      }
    } catch (error) {
      toast.error('Failed to detect printers', { id: 'detect' });
    }
  };

  const selectSystemPrinter = (printerName) => {
    if (editingRow !== null) {
      setEditingData(prev => ({
        ...prev,
        imprimante: printerName,
        libelle: prev.libelle || printerName
      }));
    } else {
      const emptyRowIndex = printers.findIndex(p => !p.libelle && !p.imprimante && typeof p.id === 'string' && p.id.startsWith('empty'));
      if (emptyRowIndex !== -1) {
        setSelectedRow(emptyRowIndex);
        setEditingRow(emptyRowIndex);
        setEditingData({ libelle: printerName, imprimante: printerName });
      } else {
        const newIndex = printers.length;
        setPrinters([...printers, { id: `empty-${newIndex}`, libelle: '', imprimante: '' }]);
        setSelectedRow(newIndex);
        setEditingRow(newIndex);
        setEditingData({ libelle: printerName, imprimante: printerName });
      }
    }
    setShowSystemDropdown(false);
  };

  const handleTicketNote = () => {
    setIsTicketNoteModalOpen(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-[945px] h-[580px] border border-slate-200 overflow-hidden flex flex-col ${direction === 'rtl' ? 'rtl' : ''}`}
        tabIndex={0}
      >
        {/* Header */}
        <div className={`bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-3`}>
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
              <Settings className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <span className="font-bold text-slate-800 tracking-tight text-lg">
                {t('printers.title')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`px-6 py-5 ${direction === 'rtl' ? 'text-right' : ''}`}>
            <h1 className="text-2xl font-bold text-slate-800 leading-tight">
              {t('printers.subtitle')}
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">
              {editingRow !== null
                ? t('printers.subtitleEdit')
                : t('printers.subtitleNormal')
              }
            </p>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className={`flex ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'space-x-2'}`}>
              {editingRow !== null ? (
                <>
                  <Button
                    variant="outline"
                    className="h-9 px-4 border-green-200 text-green-600 hover:bg-green-50 font-bold"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {t('printers.save')}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 px-4 border-slate-200 text-slate-600 hover:bg-slate-50"
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
                    className="h-9 px-4 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 disabled:opacity-30 disabled:grayscale transition-all"
                    onClick={handleDelete}
                    disabled={selectedRow === null || (typeof printers[selectedRow]?.id === 'string' && !printers[selectedRow].libelle)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('printers.delete')}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 px-4 border-orange-100 text-orange-500 hover:bg-orange-50 hover:border-orange-200 disabled:opacity-30 disabled:grayscale transition-all"
                    onClick={handleEdit}
                    disabled={selectedRow === null || (typeof printers[selectedRow]?.id === 'string' && !printers[selectedRow].libelle)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {t('printers.edit')}
                  </Button>
                  <Button
                    className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                    onClick={handleNew}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('printers.new')}
                  </Button>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className={`h-9 px-4 border-purple-200 text-purple-600 hover:bg-purple-50 font-bold ${showSystemDropdown ? 'bg-purple-50 ring-2 ring-purple-100' : ''}`}
                      onClick={handleAutoDetect}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {t('printers.detect')}
                    </Button>

                    {showSystemDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowSystemDropdown(false)}></div>
                        <div className="absolute top-full mt-2 left-0 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">
                              Real Printers Detected
                            </span>
                          </div>
                          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                            {systemPrinters.length === 0 ? (
                              <div className="p-4 text-center text-xs text-slate-400">No printers found</div>
                            ) : (
                              systemPrinters.map(p => (
                                <button
                                  key={p.name}
                                  onClick={() => selectSystemPrinter(p.name)}
                                  className="w-full text-left px-3 py-2.5 hover:bg-blue-50 rounded-lg text-sm text-slate-700 transition-colors flex items-center group"
                                >
                                  <div className="w-2 h-2 rounded-full bg-green-500 mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  <span className="truncate">{p.name}</span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="h-9 px-4 border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold"
                    onClick={handleTicketNote}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {t('printers.ticketNote')}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Table Header */}
          <div className="bg-blue-600 text-white mx-6 mt-4 rounded-t-xl">
            <div className="grid grid-cols-[1.2fr,1.8fr]">
              <div className={`px-6 py-3.5 border-r border-blue-500/30 ${direction === 'rtl' ? 'border-l border-r-0' : ''}`}>
                <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} justify-between`}>
                  <span className="font-bold text-xs uppercase tracking-wider">{t('printers.label')}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" strokeWidth={3} />
                </div>
              </div>
              <div className="px-6 py-3.5">
                <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} justify-between`}>
                  <span className="font-bold text-xs uppercase tracking-wider">{t('printers.printer')}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 bg-white mx-6 border-x border-b border-slate-100 rounded-b-xl overflow-y-auto mb-6 custom-scrollbar">
            {printers.map((printer, index) => (
              <div
                key={printer.id}
                className={`grid grid-cols-[1.2fr,1.8fr] border-b border-slate-50 transition-all duration-200 ${selectedRow === index ? 'bg-blue-50/50' :
                    editingRow === index ? 'bg-green-50/30' :
                      'hover:bg-slate-50/50 cursor-pointer'
                  }`}
                onClick={() => editingRow === null && setSelectedRow(index)}
              >
                <div className={`px-6 py-3 border-r border-slate-100 ${direction === 'rtl' ? 'border-l border-r-0' : ''}`}>
                  <Input
                    value={editingRow === index ? editingData.libelle : printer.libelle}
                    placeholder={t('printers.labelPlaceholder') || 'Printer name...'}
                    className={`border-none bg-transparent p-0 h-6 text-sm font-medium focus:ring-0 placeholder:text-slate-300 ${editingRow === index ? 'bg-white border border-blue-200 px-3 h-8 shadow-sm rounded-lg -ml-1' : ''
                      }`}
                    readOnly={editingRow !== index}
                    onChange={(e) => editingRow === index && setEditingData(prev => ({ ...prev, libelle: e.target.value }))}
                  />
                </div>
                <div className="px-6 py-3">
                  <Input
                    value={editingRow === index ? editingData.imprimante : printer.imprimante}
                    placeholder={t('printers.printerPlaceholder') || 'Path/System name...'}
                    className={`border-none bg-transparent p-0 h-6 text-sm font-mono text-slate-500 focus:ring-0 placeholder:text-slate-200 ${editingRow === index ? 'bg-white border border-blue-200 px-3 h-8 shadow-sm rounded-lg' : ''
                      }`}
                    readOnly={editingRow !== index}
                    onChange={(e) => editingRow === index && setEditingData(prev => ({ ...prev, imprimante: e.target.value }))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3">
          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'space-x-4'} justify-between`}>
            <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'space-x-2.5'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${editingRow !== null ? 'bg-orange-400' : 'bg-green-400'}`}></div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                {editingRow !== null
                  ? t('printers.editMode')
                  : t('printers.systemReady') || 'System Ready'
                }
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                {printers.filter(p => (typeof p.id === 'number') || (p.libelle && p.imprimante)).length} {t('printers.configured') || 'Configured'}
              </span>
              {selectedRow !== null && (
                <span className="text-[11px] font-bold text-blue-500 uppercase tracking-tight bg-blue-50 px-2 py-0.5 rounded">
                  Ligne {selectedRow + 1}
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
