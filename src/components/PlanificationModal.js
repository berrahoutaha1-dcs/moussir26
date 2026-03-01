import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Calendar,
  User,
  Phone,
  Package,
  FileText,
  Upload,
  DollarSign,
  CreditCard,
  Plus,
  Search,
  X,
  Briefcase,
  Paperclip,
  Activity,
  AlertCircle,
  Layers,
  Tag,
  Eye,
  Trash2,
  Pencil,
  Check
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import apiService from '../services/api';
import AddClientModal from './AddClientModal';

export default function PlanificationModal({ isOpen, onClose, onSubmit, editingPlanning }) {
  const { direction, t, language } = useLanguage();

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    serviceType: 'Service',
    serviceDescription: '',
    scheduledDate: '',
    scheduledTime: '',
    deadline: '',
    status: '',
    priority: '',
    notes: '',
    revenue: '0.00',
    paymentMethods: [],
    calculationMethod: '', // 'percentage' or 'amount'
    percentage: '0',
    paidAmount: '0.00',
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [allClients, setAllClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const serviceDropdownRef = React.useRef(null);
  const dropdownRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [editingFileIndex, setEditingFileIndex] = useState(null);
  const [tempFileName, setTempFileName] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const result = await apiService.getAllClients();
        if (result.success) {
          setAllClients(result.data);
          setFilteredClients(result.data);
        }
      } catch (error) {
        console.error('Error loading clients:', error);
      }
    };
    if (isOpen) {
      fetchClients();
      const fetchItems = async () => {
        try {
          const sRes = await apiService.getAllServices();
          if (sRes.success) setAllServices(sRes.data);
        } catch (e) {
          console.error(e);
        }
      };
      fetchItems();
    }
  }, [isOpen]);

  useEffect(() => {
    const list = allServices;
    if (serviceSearchTerm.trim() === '') {
      setFilteredServices(list);
    } else {
      const term = serviceSearchTerm.toLowerCase();
      setFilteredServices(list.filter(item => {
        const name = (item.name) || '';
        const desc = (item.description) || '';
        const cat = (item.categoryName || '') || '';
        return name.toLowerCase().includes(term) || desc.toLowerCase().includes(term) || cat.toLowerCase().includes(term);
      }));
    }
  }, [serviceSearchTerm, allServices]);

  useEffect(() => {
    if (clientSearchTerm.trim() === '') {
      setFilteredClients(allClients);
    } else {
      const term = clientSearchTerm.toLowerCase();
      setFilteredClients(allClients.filter(c =>
        (c.nomComplet || '').toLowerCase().includes(term) ||
        (c.telephone || '').includes(term) ||
        (c.activite || '').toLowerCase().includes(term)
      ));
    }
  }, [clientSearchTerm, allClients]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsClientDropdownOpen(false);
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target)) {
        setIsServiceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingPlanning) {
      setFormData({
        ...editingPlanning,
        revenue: editingPlanning.revenue?.toString() || '0.00',
        paidAmount: editingPlanning.paymentAmount?.toString() || '0.00',
        percentage: editingPlanning.paymentPercentage?.toString() || '0',
        attachments: editingPlanning.attachments || []
      });
    } else {
      resetForm();
    }
  }, [editingPlanning, isOpen]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

    const validFiles = [];
    const newErrors = { ...errors };

    files.forEach(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size is 50MB.`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} has an unsupported format. Please upload PDF, PNG, or JPG.`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles.map(file => ({
          file,
          displayName: file.name
        }))]
      }));
    }

    // Clear the input so the same file can be uploaded again if deleted
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const previewAttachment = (item) => {
    const url = URL.createObjectURL(item.file);
    window.open(url, '_blank');
  };

  const startRenaming = (index, name) => {
    setEditingFileIndex(index);
    setTempFileName(name);
  };

  const saveRename = (index) => {
    if (tempFileName.trim()) {
      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.map((item, i) =>
          i === index ? { ...item, displayName: tempFileName } : item
        )
      }));
    }
    setEditingFileIndex(null);
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      serviceType: 'Service',
      serviceDescription: '',
      scheduledDate: '',
      scheduledTime: '',
      deadline: '',
      status: '',
      priority: '',
      notes: '',
      revenue: '0.00',
      paymentMethods: [],
      calculationMethod: '',
      percentage: '0',
      paidAmount: '0.00',
      attachments: []
    });
    setErrors({});
    setServiceSearchTerm('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-calculate if revenue or percentage/amount changes
      if (field === 'revenue' || field === 'percentage' || field === 'calculationMethod' || field === 'paidAmount') {
        const rev = parseFloat(newData.revenue) || 0;
        if (newData.calculationMethod === 'percentage') {
          const perc = parseFloat(newData.percentage) || 0;
          newData.paidAmount = (rev * (perc / 100)).toFixed(2);
        } else if (field === 'paidAmount') {
          const paid = parseFloat(newData.paidAmount) || 0;
          newData.percentage = rev > 0 ? ((paid / rev) * 100).toFixed(1) : '0';
        }
      }

      return newData;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleServiceSelect = (item) => {
    const name = item.name;
    const price = parseFloat(item.price || item.tarif) || 0;

    setFormData(prev => {
      const newData = {
        ...prev,
        serviceDescription: name,
        revenue: price.toString()
      };

      // Recalculate
      const rev = parseFloat(newData.revenue) || 0;
      if (newData.calculationMethod === 'percentage') {
        const perc = parseFloat(newData.percentage) || 0;
        newData.paidAmount = (rev * (perc / 100)).toFixed(2);
      } else {
        const paid = parseFloat(newData.paidAmount) || 0;
        newData.percentage = rev > 0 ? ((paid / rev) * 100).toFixed(1) : '0';
      }
      return newData;
    });
  };


  const validateForm = () => {
    const newErrors = {};
    if (!formData.clientName.trim()) newErrors.clientName = 'Required';
    if (!formData.clientPhone.trim()) newErrors.clientPhone = 'Required';
    if (!formData.serviceDescription.trim()) newErrors.serviceDescription = 'Required';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Required';
    if (!formData.scheduledTime) newErrors.scheduledTime = 'Required';
    if (!formData.deadline) newErrors.deadline = 'Required';
    if (!formData.status) newErrors.status = 'Required';
    if (!formData.priority) newErrors.priority = 'Required';
    if (!formData.notes || !formData.notes.trim()) newErrors.notes = 'Required';
    if (!formData.calculationMethod) newErrors.calculationMethod = 'Required';
    if (!formData.revenue || parseFloat(formData.revenue) <= 0) newErrors.revenue = 'Required';
    if (formData.paidAmount === '' || isNaN(parseFloat(formData.paidAmount)) || parseFloat(formData.paidAmount) <= 0) newErrors.paidAmount = 'Required';
    if (!formData.attachments || formData.attachments.length === 0) newErrors.attachments = 'Required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول الإلزامية' : 'Veuillez remplir tous les champs obligatoires');
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const exportData = {
      ...formData,
      revenue: parseFloat(formData.revenue),
      paymentAmount: parseFloat(formData.paidAmount),
      paymentPercentage: parseFloat(formData.percentage)
    };

    if (onSubmit) {
      onSubmit(exportData);
    }

    resetForm();
    onClose();
  };

  const remainingAmount = (parseFloat(formData.revenue) || 0) - (parseFloat(formData.paidAmount) || 0);
  const paymentStatus = formData.paidAmount === formData.revenue && formData.revenue !== '0.00' ? 'Payé' : 'En attente';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`h-auto max-h-[92vh] p-0 overflow-hidden bg-[#f0f4ff] border-none shadow-[0_25px_70px_rgba(0,0,0,0.2)] rounded-[24px] flex flex-col ${direction === 'rtl' ? 'rtl' : ''}`}
        style={{ width: '1240px', maxWidth: '1300px' }}
      >

        {/* Header - Exposed */}
        <div className="bg-white px-7 py-5 flex items-center justify-between border-b border-slate-100 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#0f172a] tracking-tight leading-none">Nouvelle Planification</h2>
              <p className="text-slate-400 font-bold text-xs mt-0.5">Gestion complète de la planification client</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body - Exposed Grid */}
        <div className="p-7 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-7">

            {/* Left Column */}
            <div className="flex flex-col gap-7">
              {/* Informations Client */}
              <div className="bg-white p-4 rounded-[18px] shadow-sm border border-slate-100/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-xs">Informations Client</h3>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5 relative" ref={dropdownRef}>
                    <div className="flex items-center justify-between ml-1 mb-1.5">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Nom du Client <span className="text-rose-500">*</span>
                      </Label>
                      <button
                        type="button"
                        onClick={() => setIsAddClientModalOpen(true)}
                        className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-2 py-0.5 rounded-full"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        Nouveau
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        value={formData.clientName}
                        onChange={(e) => handleInputChange('clientName', e.target.value)}
                        onFocus={() => setIsClientDropdownOpen(true)}
                        placeholder="Sélectionner depuis la liste"
                        className={`h-11 bg-slate-50/50 border-slate-200 rounded-xl pl-4 pr-11 focus:ring-indigo-500 focus:bg-white text-xs font-semibold ${errors.clientName ? 'border-rose-500 bg-rose-50/30' : ''}`}
                      />
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {isClientDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 z-[100] mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-3 bg-slate-50 border-b border-slate-100">
                          <div className="relative">
                            <Input
                              autoFocus
                              placeholder="Rechercher un client..."
                              value={clientSearchTerm}
                              onChange={(e) => setClientSearchTerm(e.target.value)}
                              className="h-9 bg-white border-slate-200 rounded-lg pl-9 text-xs"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </div>
                        <div className="max-h-[220px] overflow-y-auto">
                          {filteredClients.length > 0 ? (
                            filteredClients.map((client) => (
                              <div
                                key={client.id}
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    clientName: client.nomComplet || `${client.prenom} ${client.nom}`,
                                    clientPhone: client.telephone || ''
                                  }));
                                  setIsClientDropdownOpen(false);
                                  setClientSearchTerm('');
                                }}
                                className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors group"
                              >
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-700 text-xs group-hover:text-indigo-600 transition-colors">
                                    {client.nomComplet || `${client.prenom} ${client.nom}`}
                                  </span>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                      <Phone className="w-2.5 h-2.5" />
                                      {client.telephone || 'N/A'}
                                    </span>
                                    {client.activite && (
                                      <span className="text-[10px] text-indigo-400 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                                        {client.activite}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <User className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                              <p className="text-[11px] text-slate-400 font-bold">Aucun client trouvé</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Téléphone <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        value={formData.clientPhone}
                        onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                        placeholder="05..."
                        className={`h-11 bg-slate-50/50 border-slate-200 rounded-xl pl-11 focus:ring-indigo-500 focus:bg-white text-xs font-semibold ${errors.clientPhone ? 'border-rose-500 bg-rose-50/30' : ''}`}
                      />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations Service / Multi-Select */}
              {/* Informations Service */}
              <div className="bg-white p-5 rounded-[22px] shadow-sm border border-slate-100/50">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Informations Service</h3>
                    <p className="text-[9px] text-slate-400 font-bold tracking-tighter uppercase">Sélectionner un service de la liste</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5 relative" ref={serviceDropdownRef}>
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nom / Description du Service <span className="text-rose-500">*</span></Label>
                    <div className="relative">
                      <Input
                        value={formData.serviceDescription}
                        onChange={(e) => {
                          handleInputChange('serviceDescription', e.target.value);
                          setServiceSearchTerm(e.target.value);
                        }}
                        onFocus={() => setIsServiceDropdownOpen(true)}
                        placeholder="Rechercher un service..."
                        className={`h-11 bg-slate-50/50 border-slate-200 rounded-xl pl-4 pr-11 focus:ring-orange-500 focus:bg-white text-xs font-semibold transition-all ${errors.serviceDescription ? 'border-rose-500 bg-rose-50/30' : ''}`}
                      />
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 pointer-events-none" />
                    </div>

                    {isServiceDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 z-[100] mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in slide-in-from-top-2 duration-200">
                        <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                          {filteredServices.length > 0 ? (
                            filteredServices.map((item) => {
                              const name = item.name || '';
                              const price = parseFloat(item.price || item.tarif) || 0;
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    handleServiceSelect(item);
                                    setIsServiceDropdownOpen(false);
                                    setServiceSearchTerm('');
                                  }}
                                  className="p-3 hover:bg-orange-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors group flex justify-between items-center"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-700 text-[11px] group-hover:text-orange-600 transition-colors">{name}</span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase">{item.categoryName || 'GENERAL'}</span>
                                  </div>
                                  <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                                    {price.toLocaleString()} DZD
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-8 text-center bg-slate-50/30">
                              <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Aucun résultat trouvé</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pièces Jointes */}
              <div className="bg-white p-4 rounded-[18px] shadow-sm border border-slate-100/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                    <Paperclip className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-xs">Pièces Jointes <span className="text-rose-500">*</span></h3>
                </div>

                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current.click()}
                  className={`border border-dashed rounded-xl p-4 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group ${errors.attachments ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                    <Upload className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-700">Sélectionner fichier</p>
                  <p className="text-[8px] text-slate-400 font-medium mt-1">PDF, PNG, JPG (Max 50MB)</p>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.attachments.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 group">
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                          <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-slate-400 shrink-0">
                            {item.file.type === 'application/pdf' ? <FileText className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                          </div>

                          {editingFileIndex === index ? (
                            <div className="flex items-center gap-1 flex-1">
                              <input
                                autoFocus
                                className="text-[10px] font-semibold text-slate-600 bg-white border border-indigo-200 rounded px-1.5 py-0.5 outline-none w-full"
                                value={tempFileName}
                                onChange={(e) => setTempFileName(e.target.value)}
                                onBlur={() => saveRename(index)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveRename(index);
                                  if (e.key === 'Escape') setEditingFileIndex(null);
                                }}
                              />
                              <button onClick={() => saveRename(index)} className="text-emerald-500 hover:text-emerald-600">
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[150px]">
                              {item.displayName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => startRenaming(index, item.displayName)}
                            className="p-1 hover:bg-white rounded text-amber-500 transition-colors"
                            title="Renommer"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => previewAttachment(item)}
                            className="p-1 hover:bg-white rounded text-blue-500 transition-colors"
                            title="Aperçu"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="p-1 hover:bg-white rounded text-rose-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Dates et Horaires */}
              <div className="bg-white p-4 rounded-[18px] shadow-sm border border-slate-100/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-md bg-green-100 flex items-center justify-center text-green-600">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-xs">Dates et Horaires</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">Date <span className="text-rose-500">*</span></Label>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                      className={`h-9 bg-slate-50 rounded-lg text-[11px] font-semibold transition-all ${errors.scheduledDate ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100'}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">Heure <span className="text-rose-500">*</span></Label>
                    <Input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                      className={`h-9 bg-slate-50 rounded-lg text-[11px] font-semibold transition-all ${errors.scheduledTime ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100'}`}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">Date Limite <span className="text-rose-500">*</span></Label>
                    <Input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                      className={`h-9 bg-slate-50 rounded-lg text-[11px] font-semibold transition-all ${errors.deadline ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Statut et Priorité */}
              <div className="bg-white p-4 rounded-[18px] shadow-sm border border-slate-100/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-md bg-orange-100 flex items-center justify-center text-orange-600">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-xs">Statut et Priorité</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">Statut <span className="text-rose-500">*</span></Label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className={`w-full h-9 bg-white border rounded-lg px-3 outline-none appearance-none font-bold text-[11px] text-slate-700 transition-all ${errors.status ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100'}`}
                      >
                        <option value="" disabled>Sélectionner...</option>
                        <option value="pending">Attente</option>
                        <option value="in-progress">Cours</option>
                        <option value="completed">Terminé</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-100" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">Priorité <span className="text-rose-500">*</span></Label>
                    <div className="relative">
                      <select
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className={`w-full h-9 bg-white border rounded-lg px-3 outline-none appearance-none font-bold text-[11px] text-slate-700 transition-all ${errors.priority ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100'}`}
                      >
                        <option value="" disabled>Sélectionner...</option>
                        <option value="low">Basse</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-100" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">Notes <span className="text-rose-500">*</span></Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Notes..."
                    className={`min-h-[80px] bg-slate-50 border rounded-xl resize-none p-3 text-[11px] font-semibold transition-all ${errors.notes ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100'}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Informations Paiement */}
              <div className="bg-white p-4 rounded-[18px] shadow-sm border border-slate-100/50">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-xs">Paiement</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight ml-0.5">CA (DZD) <span className="text-rose-500">*</span></Label>
                    <Input
                      value={formData.revenue}
                      onChange={(e) => handleInputChange('revenue', e.target.value)}
                      placeholder="0.00"
                      className={`h-9 bg-slate-50 border rounded-lg font-bold text-sm text-slate-800 px-3 transition-all ${errors.revenue ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100'}`}
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                    <span className={`text-[9px] font-bold uppercase tracking-tight ${errors.calculationMethod ? 'text-rose-500' : 'text-slate-400'}`}>
                      Calcul <span className="text-rose-500">*</span>
                    </span>
                    <div className={`p-0.5 rounded-lg flex items-center gap-0.5 transition-all ${errors.calculationMethod ? 'bg-rose-50 border-2 border-rose-500' : 'bg-slate-100 border border-transparent'}`}>
                      <button
                        type="button"
                        onClick={() => handleInputChange('calculationMethod', 'percentage')}
                        className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${formData.calculationMethod === 'percentage' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('calculationMethod', 'amount')}
                        className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${formData.calculationMethod === 'amount' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                      >
                        DZD
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold text-slate-400 uppercase">% <span className="text-rose-500">*</span></Label>
                      <Input
                        value={formData.percentage}
                        onChange={(e) => handleInputChange('percentage', e.target.value)}
                        className={`h-8 bg-slate-50 border rounded-lg font-bold text-center text-[10px] transition-all ${errors.paidAmount ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold text-slate-400 uppercase">DZD <span className="text-rose-500">*</span></Label>
                      <Input
                        value={formData.paidAmount}
                        onChange={(e) => handleInputChange('paidAmount', e.target.value)}
                        className={`h-8 bg-slate-50 border rounded-lg font-bold text-center text-[10px] transition-all ${errors.paidAmount ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100'}`}
                      />
                    </div>
                  </div>

                  {/* Payment Summary Box */}
                  <div className="bg-[#f8faff] rounded-xl p-3 border border-slate-100/60 shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-bold text-slate-600 uppercase">Statut:</span>
                      <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded-full text-[8px] font-bold uppercase">{paymentStatus}</span>
                    </div>
                    <div className="space-y-1.5 mb-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-semibold">Payé:</span>
                        <span className="text-emerald-600 font-bold">{formData.paidAmount}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-semibold">Restant:</span>
                        <span className="text-rose-500 font-bold">{remainingAmount.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-1000"
                        style={{ width: `${formData.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
                >
                  {editingPlanning ? 'Modifier' : 'Ajouter'}
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="w-full h-9 border-slate-200 bg-white text-slate-400 font-bold rounded-xl text-[10px]"
                >
                  Annuler
                </Button>
              </div>
            </div>

          </div>
        </div >
      </DialogContent>
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
      />
    </Dialog>
  );
}

// Helper component for chevron
const ChevronDown = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);

