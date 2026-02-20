import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import {
  X,
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  UserCheck,
  User,
  Filter,
  FileSpreadsheet,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Printer,
  MoreVertical,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ClientPaymentModal from './ClientPaymentModal';
import PaymentHistoryModal from './PaymentHistoryModal';
import ImportClientModal from './ImportClientModal';
import AddClientModal from './AddClientModal';

export default function ClientListModal({ isOpen, onClose }) {
  const { language, direction } = useLanguage();
  const scrollContainerRef = React.useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClients, setSelectedClients] = useState([]);
  const [sortBy, setSortBy] = useState('nom');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRepresentative, setFilterRepresentative] = useState('all');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedClientForPayment, setSelectedClientForPayment] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState(null);

  const mockClients = [
    {
      id: '1',
      nom: 'Benali',
      prenom: 'Ahmed',
      numero: '+213 555 123 456',
      email: 'ahmed.benali@email.com',
      representant: 'Mohamed Kaci',
      solde: 125000,
      adresse: '123 Rue Didouche Mourad',
      ville: 'Alger',
      dateCreation: '2024-01-15',
      statut: 'actif',
      dernierAchat: '2024-12-01'
    },
    {
      id: '2',
      nom: 'Boulahia',
      prenom: 'Fatima',
      numero: '+213 555 789 012',
      email: 'fatima.boulahia@email.com',
      representant: 'Salim Meziane',
      solde: -45000,
      adresse: '456 Avenue Ben Badis',
      ville: 'Oran',
      dateCreation: '2024-02-08',
      statut: 'actif',
      dernierAchat: '2024-11-28'
    },
    {
      id: '3',
      nom: 'Cherif',
      prenom: 'Karim',
      numero: '+213 555 345 678',
      email: 'karim.cherif@email.com',
      representant: 'Mohamed Kaci',
      solde: 87500,
      adresse: '789 Rue Larbi Ben M\'hidi',
      ville: 'Constantine',
      dateCreation: '2024-03-12',
      statut: 'actif',
      dernierAchat: '2024-11-30'
    },
    {
      id: '4',
      nom: 'Djellali',
      prenom: 'Amina',
      numero: '+213 555 901 234',
      email: 'amina.djellali@email.com',
      representant: 'Rachid Boumediene',
      solde: 256000,
      adresse: '321 Boulevard du 1er Novembre',
      ville: 'Annaba',
      dateCreation: '2024-04-20',
      statut: 'actif',
      dernierAchat: '2024-12-02'
    },
    {
      id: '5',
      nom: 'Mansouri',
      prenom: 'Said',
      numero: '+213 555 567 890',
      email: 'said.mansouri@email.com',
      representant: 'Salim Meziane',
      solde: 0,
      adresse: '654 Rue Emir Abdelkader',
      ville: 'Sétif',
      dateCreation: '2024-05-05',
      statut: 'inactif',
      dernierAchat: '2024-10-15'
    },
    {
      id: '6',
      nom: 'Touati',
      prenom: 'Leila',
      numero: '+213 555 111 222',
      email: 'leila.touati@email.com',
      representant: 'Mohamed Kaci',
      solde: -12000,
      adresse: '987 Avenue Houari Boumediene',
      ville: 'Béjaïa',
      dateCreation: '2024-06-18',
      statut: 'actif',
      dernierAchat: '2024-11-25'
    },
    {
      id: '7',
      nom: 'Hadj Ali',
      prenom: 'Omar',
      numero: '+213 555 333 444',
      email: 'omar.hadjali@email.com',
      representant: 'Rachid Boumediene',
      solde: 189000,
      adresse: '159 Rue Frantz Fanon',
      ville: 'Tlemcen',
      dateCreation: '2024-07-22',
      statut: 'actif',
      dernierAchat: '2024-12-03'
    },
    {
      id: '8',
      nom: 'Benamara',
      prenom: 'Zineb',
      numero: '+213 555 555 666',
      email: 'zineb.benamara@email.com',
      representant: 'Salim Meziane',
      solde: 67800,
      adresse: '753 Boulevard Zighoud Youcef',
      ville: 'Batna',
      dateCreation: '2024-08-14',
      statut: 'actif',
      dernierAchat: '2024-11-29'
    }
  ];

  // Get unique representatives for the filter
  const representatives = useMemo(() => {
    const reps = mockClients.map(client => client.representant);
    return ['all', ...new Set(reps)];
  }, []);

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = mockClients.filter(client => {
      const matchesSearch =
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.numero.includes(searchTerm) ||
        client.representant.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || client.statut === filterStatus;
      const matchesRepresentative = filterRepresentative === 'all' || client.representant === filterRepresentative;

      return matchesSearch && matchesStatus && matchesRepresentative;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [searchTerm, sortBy, sortOrder, filterStatus, filterRepresentative]);

  if (!isOpen) return null;

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectClient = (clientId) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredAndSortedClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredAndSortedClients.map(client => client.id));
    }
  };

  const formatCurrency = (amount) => {
    const formatted = Math.abs(amount).toLocaleString('fr-DZ');
    return amount >= 0 ? `${formatted} DZD` : `-${formatted} DZD`;
  };

  const getSoldeColor = (solde) => {
    if (solde > 0) return 'text-green-600';
    if (solde < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleExport = () => {
    try {
      const dataToExport = filteredAndSortedClients.map(client => ({
        'name': client.prenom || '',
        'family name': client.nom || '',
        'Activity': client.activite || '',
        'Representant': client.representant || '',
        'Adresse': client.adresse || '',
        'Phone Number 01': client.telephone01 || client.numero || '',
        'Phone Number 02': client.telephone02 || '',
        'Email': client.email || '',
        'RC': client.rc || '',
        'NIF': client.nif || '',
        'NIS': client.nis || '',
        'AI': client.ai || '',
        'Balance Paid': client.soldPaye || 0,
        'Debt': client.dette || (client.solde < 0 ? Math.abs(client.solde) : 0),
        'total': client.solde || 0
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

      // Generate filename
      const date = new Date().toISOString().split('T')[0];
      const filename = `clients_export_${date}.xlsx`;

      XLSX.writeFile(workbook, filename);
      toast.success(language === 'ar' ? 'تم تصدير البيانات بنجاح' : 'Données exportées avec succès');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(language === 'ar' ? 'فشل التصدير' : 'Échec de l\'exportation');
    }
  };

  const handleAddClient = () => {
    setSelectedClientForEdit(null);
    setIsAddModalOpen(true);
  };

  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  const handleViewClient = (clientId) => {
    toast.info(`${language === 'ar' ? 'عرض تفاصيل العميل' : 'Affichage des détails du client'} #${clientId}`);
  };

  const handleEditClient = (clientId) => {
    const client = mockClients.find(c => c.id === clientId);
    if (client) {
      setSelectedClientForEdit(client);
      setIsAddModalOpen(true);
    }
  };

  const handleViewHistory = (client) => {
    setSelectedClientForHistory(client);
    setIsHistoryModalOpen(true);
  };

  const handleDeleteClient = (clientId) => {
    const client = mockClients.find(c => c.id === clientId);
    if (client) {
      setClientToDelete(client);
      setIsDeleteConfirmOpen(true);
    }
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      toast.success(language === 'ar'
        ? `تم حذف العميل ${clientToDelete.prenom} ${clientToDelete.nom} بنجاح`
        : `Client ${clientToDelete.prenom} ${clientToDelete.nom} supprimé avec succès`);
      setIsDeleteConfirmOpen(false);
      setClientToDelete(null);
      // Here you would typically call your API to delete the client
    }
  };

  const handlePrint = () => {
    try {
      const doc = new jsPDF();
      const isRTL = language === 'ar';

      // App Title & Header
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138); // Blue 900
      const title = language === 'ar' ? 'Moussir 26 - قائمة العملاء' : 'Moussir 26 - Liste des Clients';
      doc.text(title, 105, 15, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(100);
      const date = new Date().toLocaleDateString();
      doc.text(`Date: ${date}`, 195, 22, { align: 'right' });

      // Table Data
      const tableColumn = [
        language === 'ar' ? 'الاسم واللقب' : 'Nom & Prénom',
        language === 'ar' ? 'الهاتف' : 'Téléphone',
        language === 'ar' ? 'المندوب' : 'Représentant',
        language === 'ar' ? 'الرصيد' : 'Solde',
        language === 'ar' ? 'المدينة' : 'Ville'
      ];

      const tableRows = filteredAndSortedClients.map(client => [
        `${client.prenom} ${client.nom}`,
        client.numero,
        client.representant,
        `${client.solde.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} DA`,
        client.ville
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 58, 138],
          halign: 'center',
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 50 }, // Nom & Prénom
          1: { cellWidth: 35 }, // Téléphone
          2: { cellWidth: 40 }, // Représentant
          3: { cellWidth: 40, halign: 'center', fontStyle: 'bold' }, // Solde (Changed to center)
          4: { cellWidth: 'auto' } // Ville
        }
      });

      // Save the PDF
      const filename = `clients_list_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      toast.success(language === 'ar' ? 'تم إنشاء ملف PDF بنجاح' : 'PDF généré avec succès');
    } catch (error) {
      console.error('Print PDF error:', error);
      toast.error(language === 'ar' ? 'فشل إنشاء ملف PDF' : 'Échec de la génération du PDF');
    }
  };

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="modal-container max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="modal-header-icon">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="modal-header-title">
                  {language === 'ar' ? 'قائمة العملاء' : 'Liste des Clients'}
                </h2>
                <p className="modal-header-subtitle">
                  {language === 'ar'
                    ? `إجمالي ${filteredAndSortedClients.length} عميل`
                    : `${filteredAndSortedClients.length} clients au total`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="modal-close-button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث عن عميل...' : 'Rechercher un client...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 h-10 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Representative Filter */}
              <div className="relative">
                <select
                  value={filterRepresentative}
                  onChange={(e) => setFilterRepresentative(e.target.value)}
                  className="h-10 border border-gray-300 rounded-lg px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="all">
                    {language === 'ar' ? 'كل المندوبين' : 'Tous les Représentants'}
                  </option>
                  {representatives.filter(rep => rep !== 'all').map(rep => (
                    <option key={rep} value={rep}>{rep}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleAddClient}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                {language === 'ar' ? 'إضافة عميل' : 'Ajouter'}
              </Button>

              <Button
                onClick={handleImport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                {language === 'ar' ? 'استيراد' : 'Import'}
              </Button>

              <Button
                onClick={handleExport}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                {language === 'ar' ? 'تصدير' : 'Export'}
              </Button>

              <Button
                onClick={handlePrint}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Printer className="w-4 h-4" />
                {language === 'ar' ? 'طباعة' : 'Print'}
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedClients.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  {language === 'ar'
                    ? `تم تحديد ${selectedClients.length} عميل`
                    : `${selectedClients.length} client(s) sélectionné(s)`
                  }
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    {language === 'ar' ? 'تصدير المحدد' : 'Exporter sélection'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    {language === 'ar' ? 'حذف المحدد' : 'Supprimer sélection'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto max-h-[calc(95vh-280px)]"
          onWheel={(e) => {
            if (e.currentTarget) {
              e.currentTarget.scrollTop += e.deltaY;
            }
          }}
        >
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="border-b border-gray-200">
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedClients.length === filteredAndSortedClients.length && filteredAndSortedClients.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th
                  className="p-3 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('nom')}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'الاسم والعائلة' : 'Nom & Prénom'}
                    </span>
                    {sortBy === 'nom' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="p-3 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('numero')}
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'رقم الهاتف' : 'Numéro'}
                    </span>
                    {sortBy === 'numero' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="p-3 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700">Email</span>
                    {sortBy === 'email' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="p-3 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('representant')}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'المندوب' : 'Représentant'}
                    </span>
                    {sortBy === 'representant' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="p-3 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('solde')}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'الرصيد' : 'Solde'}
                    </span>
                    {sortBy === 'solde' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="p-3 text-left">
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </span>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredAndSortedClients.map((client, index) => (
                <tr
                  key={client.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => handleSelectClient(client.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">
                          {client.prenom[0]}{client.nom[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {client.prenom} {client.nom}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {client.ville}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-gray-900">{client.numero}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-gray-900">{client.email}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-gray-900">{client.representant}</span>
                  </td>
                  <td className="p-3">
                    <span className={`text-sm font-medium ${getSoldeColor(client.solde)}`}>
                      {formatCurrency(client.solde)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewHistory(client)}
                        className="w-8 h-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                        title={language === 'ar' ? 'سجل المدفوعات' : 'Historique des paiements'}
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClient(client.id)}
                        className="w-8 h-8 p-0 hover:bg-orange-100 hover:text-orange-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClient(client.id)}
                        className="w-8 h-8 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* No Results */}
          {filteredAndSortedClients.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'ar' ? 'لم يتم العثور على عملاء' : 'Aucun client trouvé'}
              </h3>
              <p className="text-gray-600">
                {language === 'ar'
                  ? 'جرب تغيير معايير البحث أو المرشحات'
                  : 'Essayez de modifier vos critères de recherche ou filtres'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="text-sm text-gray-600 mr-auto">
            {language === 'ar'
              ? `عرض ${filteredAndSortedClients.length} من ${mockClients.length} عميل`
              : `Affichage de ${filteredAndSortedClients.length} sur ${mockClients.length} clients`
            }
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              {language === 'ar' ? 'العملاء النشطون:' : 'Clients actifs:'}
              <span className="font-medium text-green-600 ml-1">
                {mockClients.filter(c => c.statut === 'actif').length}
              </span>
            </span>
            <span>
              {language === 'ar' ? 'العملاء غير النشطون:' : 'Clients inactifs:'}
              <span className="font-medium text-gray-600 ml-1">
                {mockClients.filter(c => c.statut === 'inactif').length}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Client Payment Modal */}
      <ClientPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        clientData={selectedClientForPayment}
      />

      {/* Payment History Modal */}
      <PaymentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        clientData={selectedClientForHistory}
      />

      {/* Import Client Modal */}
      <ImportClientModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(data) => {
          // You can add logic here to refresh client list or update state
          console.log('Imported data:', data);
        }}
      />

      {/* Add/Edit Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedClientForEdit(null);
        }}
        initialData={selectedClientForEdit}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100 scale-in-center">
            <div className="flex items-center gap-4 text-red-600 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">
                {language === 'ar' ? 'تأكيد الحذف' : 'Confirmer la suppression'}
              </h3>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {language === 'ar'
                ? `هل أنت متأكد من رغبتك في حذف العميل "${clientToDelete?.prenom} ${clientToDelete?.nom}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                : `Êtes-vous sûr de vouloir supprimer le client "${clientToDelete?.prenom} ${clientToDelete?.nom}" ? Cette action est irréversible.`}
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
              >
                {language === 'ar' ? 'إلغاء' : 'Annuler'}
              </Button>
              <Button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg shadow-red-200"
              >
                {language === 'ar' ? 'حذف نهائي' : 'Supprimer définitivement'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
