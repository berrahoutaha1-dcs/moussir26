import React, { useState, useEffect } from 'react';
import { X, Search, Building2, Phone, Mail, Edit, Trash2, Plus, Upload, Printer } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import SupplierPaymentModal from './SupplierPaymentModal';
import ImportSupplierModal from './ImportSupplierModal';
import { toast } from 'sonner';
import apiService from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SupplierListModal({ isOpen, onClose }) {
  const { language, direction } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('tous');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliersData, setSuppliersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadSuppliers();
    }
  }, [isOpen]);

  // Listen for supplier updates
  useEffect(() => {
    const handleSupplierUpdate = () => {
      loadSuppliers();
    };

    window.addEventListener('supplierUpdated', handleSupplierUpdate);
    return () => {
      window.removeEventListener('supplierUpdated', handleSupplierUpdate);
    };
  }, []);

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getAllSuppliers();
      if (result.success) {
        // Transform database fields to match component expectations
        const transformed = result.data.map(supplier => ({
          id: supplier.id,
          nomEntreprise: supplier.nom_entreprise,
          codeSupplier: supplier.code_supplier,
          telephone: supplier.telephone,
          email: supplier.email,
          adresse: supplier.adresse,
          categorieActivite: supplier.categorie_activite,
          statut: supplier.statut,
          dateCreation: supplier.created_at,
          solde: supplier.solde,
          typeSolde: supplier.type_solde
        }));

        // Add a test supplier to verify functionalities (Delete, Print, etc.)
        transformed.push({
          id: 'TEST_999',
          nomEntreprise: 'SOCIÉTÉ TEST MOUSSIR 26',
          codeSupplier: 'TEST-2024',
          telephone: '0555 11 22 33',
          email: 'test@moussir.dz',
          adresse: '123 Avenue de Test, Alger',
          categorieActivite: 'Électronique',
          statut: 'actif',
          dateCreation: new Date().toISOString(),
          solde: 12500.00,
          typeSolde: 'positif',
          responsable: 'Admin Test'
        });

        setSuppliersData(transformed);
      } else {
        toast.error(result.error || (language === 'ar' ? 'خطأ في تحميل الموردين' : 'Erreur lors du chargement des fournisseurs'));
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      toast.error(language === 'ar' ? 'خطأ في تحميل الموردين' : 'Erreur lors du chargement des fournisseurs');
    } finally {
      setIsLoading(false);
    }
  };

  // Données d'exemple des fournisseurs (fallback)
  const mockSuppliersData = [
    {
      id: 'FORN001',
      nomEntreprise: 'ALPHA Industries',
      codeSupplier: 'ALPHA2024',
      responsable: 'Ahmed Benali',
      telephone: '0555 123 456',
      email: 'contact@alpha.dz',
      adresse: 'Zone Industrielle, Alger',
      ville: 'Alger',
      categorieActivite: 'Électronique',
      conditionsPaiement: '30 jours',
      statut: 'actif',
      dateCreation: '2024-01-15',
      dernierCommande: '2024-01-20',
      solde: 61662.40
    },
    {
      id: 'FORN002',
      nomEntreprise: 'BETA Distributions',
      codeSupplier: 'BETA2024',
      responsable: 'Fatima Kaci',
      telephone: '0661 234 567',
      email: 'commercial@beta.dz',
      adresse: 'Centre Ville, Oran',
      ville: 'Oran',
      categorieActivite: 'Alimentaire',
      conditionsPaiement: '15 jours',
      statut: 'actif',
      dateCreation: '2023-12-10',
      dernierCommande: '2024-01-18',
      solde: 35420.75
    },
    {
      id: 'FORN003',
      nomEntreprise: 'GAMMA Construction',
      codeSupplier: 'GAMMA2024',
      responsable: 'Mohamed Saidi',
      telephone: '0770 345 678',
      email: 'admin@gamma.dz',
      adresse: 'Zone d\'Activité, Constantine',
      ville: 'Constantine',
      categorieActivite: 'Construction',
      conditionsPaiement: '45 jours',
      statut: 'suspendu',
      dateCreation: '2023-11-05',
      dernierCommande: '2023-12-15',
      solde: -15280.90
    },
    {
      id: 'FORN004',
      nomEntreprise: 'DELTA Textiles',
      codeSupplier: 'DELTA2024',
      responsable: 'Amina Benaissa',
      telephone: '0556 456 789',
      email: 'production@delta.dz',
      adresse: 'Nouveau Pôle, Annaba',
      ville: 'Annaba',
      categorieActivite: 'Textile',
      conditionsPaiement: '30 jours',
      statut: 'actif',
      dateCreation: '2024-01-02',
      dernierCommande: '2024-01-19',
      solde: 28750.60
    },
    {
      id: 'FORN005',
      nomEntreprise: 'EPSILON Services',
      codeSupplier: 'EPSILON2024',
      responsable: 'Karim Tizi',
      telephone: '0662 567 890',
      email: 'direction@epsilon.dz',
      adresse: 'Zone Commerciale, Sétif',
      ville: 'Sétif',
      categorieActivite: 'Service',
      conditionsPaiement: 'Comptant',
      statut: 'inactif',
      dateCreation: '2023-09-20',
      dernierCommande: '2023-11-30',
      solde: 0.00
    }
  ];

  // Filtrage des fournisseurs
  const filteredSuppliers = suppliersData.filter(supplier => {
    const searchLow = (searchTerm || '').toLowerCase();
    const matchesSearch = (supplier.nomEntreprise || '').toLowerCase().includes(searchLow) ||
      (supplier.codeSupplier || '').toLowerCase().includes(searchLow);

    const matchesCategory = categoryFilter === 'tous' || (supplier.categorieActivite || '') === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(suppliersData.map(s => s.categorieActivite).filter(Boolean))];

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleAddSupplier = () => {
    toast.info(language === 'ar' ? 'فتح نموذج إضافة مورد جديد' : 'Ouverture du formulaire d\'ajout de fournisseur');
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المورد؟' : 'Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        const result = await apiService.deleteSupplier(supplierId);
        if (result.success) {
          toast.success(language === 'ar' ? 'تم حذف المورد بنجاح' : 'Fournisseur supprimé avec succès');
          loadSuppliers();
        } else {
          toast.error(result.error || (language === 'ar' ? 'خطأ في حذف المورد' : 'Erreur lors de la suppression'));
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
        toast.error(language === 'ar' ? 'خطأ في حذف المورد' : 'Erreur lors de la suppression');
      }
    }
  };

  const handleExport = () => {
    toast.success(language === 'ar' ? 'تم تصدير قائمة الموردين' : 'Liste des fournisseurs exportée');
  };

  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  const handleSelectSupplier = (id) => {
    setSelectedSuppliers(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSuppliers.length === filteredSuppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(filteredSuppliers.map(s => s.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSuppliers.length === 0) return;

    if (window.confirm(language === 'ar'
      ? `هل أنت متأكد من حذف ${selectedSuppliers.length} مورد؟`
      : `Êtes-vous sûr de vouloir supprimer ${selectedSuppliers.length} fournisseur(s) ?`)) {
      try {
        for (const id of selectedSuppliers) {
          await apiService.deleteSupplier(id);
        }
        toast.success(language === 'ar' ? 'تم الحذف بنجاح' : 'Suppression réussie');
        setSelectedSuppliers([]);
        loadSuppliers();
      } catch (error) {
        console.error('Bulk delete error:', error);
        toast.error(language === 'ar' ? 'خطأ في الحذف' : 'Erreur lors de la suppression');
      }
    }
  };

  const handlePrintList = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(20);
      doc.text(language === 'ar' ? 'قائمة الموردين' : 'Liste des Fournisseurs', pageWidth / 2, 15, { align: 'center' });

      const tableData = filteredSuppliers.map(s => [
        s.nomEntreprise,
        s.codeSupplier,
        s.telephone,
        s.email,
        s.categorieActivite,
        s.solde.toFixed(2) + ' DA'
      ]);

      autoTable(doc, {
        head: [[
          language === 'ar' ? 'الشركة' : 'Entreprise',
          'Code',
          language === 'ar' ? 'الهاتف' : 'Téléphone',
          'Email',
          language === 'ar' ? 'الفئة' : 'Catégorie',
          language === 'ar' ? 'الرصيد' : 'Solde'
        ]],
        body: tableData,
        startY: 25,
        styles: { fontSize: 8 },
        headStyles: { fillStyle: [27, 27, 27] }
      });

      doc.autoPrint();
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.src = doc.output('bloburl');
    } catch (error) {
      console.error('Print list error:', error);
      toast.error(language === 'ar' ? 'خطأ في الطباعة' : 'Erreur d\'impression');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg w-full max-w-7xl h-[85vh] flex flex-col shadow-xl"
        style={{ border: '2px solid #1b1b1b' }}
      >
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'ar' ? 'قائمة الموردين' : 'Liste des Fournisseurs'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'إدارة مورديك' : 'Gestion de vos fournisseurs'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filtres et Actions */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex flex-col lg:flex-row gap-3 items-center">
            <div className="flex flex-col md:flex-row gap-3 flex-1">
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث بالاسم، الكود أو المسؤول...' : 'Rechercher par nom, code ou responsable...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm"
                />
              </div>



              {/* Filtre catégorie */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm min-w-[140px]"
                >
                  <option value="tous">{language === 'ar' ? 'جميع الفئات' : 'Toutes catégories'}</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bouton Ajouter */}
            <Button
              onClick={handleAddSupplier}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {language === 'ar' ? 'جديد' : 'Nouveau'}
            </Button>
          </div>
        </div>

        {/* Table des fournisseurs */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left border-b border-gray-200 w-10">
                    <input
                      type="checkbox"
                      checked={selectedSuppliers.length === filteredSuppliers.length && filteredSuppliers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                    {language === 'ar' ? 'المورد' : 'Fournisseur'}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                    {language === 'ar' ? 'الاتصال' : 'Contact'}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier, index) => (
                  <tr
                    key={supplier.id}
                    className={`border-b border-gray-100 hover:bg-blue-50 hover:cursor-pointer transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      } ${selectedSuppliers.includes(supplier.id) ? 'bg-blue-100' : ''}`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedSuppliers.includes(supplier.id)}
                        onChange={() => handleSelectSupplier(supplier.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3" onClick={() => handleEditSupplier(supplier)}>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{supplier.nomEntreprise}</div>
                        <div className="text-xs text-gray-600">{supplier.codeSupplier}</div>
                        <div className="text-xs text-blue-600">{supplier.responsable}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-xs">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-900">{supplier.telephone}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">{supplier.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSupplier(supplier);
                          }}
                          className="w-7 h-7 bg-green-50 hover:bg-green-100 text-green-600 rounded-md flex items-center justify-center transition-colors duration-200"
                          title={language === 'ar' ? 'تعديل' : 'Modifier'}
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSupplier(supplier.id);
                          }}
                          className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-600 rounded-md flex items-center justify-center transition-colors duration-200"
                          title={language === 'ar' ? 'حذف' : 'Supprimer'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSuppliers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Building2 className="w-12 h-12 mb-3 opacity-50" />
                <p className="font-medium">
                  {language === 'ar' ? 'لم يتم العثور على موردين' : 'Aucun fournisseur trouvé'}
                </p>
                <p className="text-sm">
                  {language === 'ar' ? 'قم بتعديل معايير البحث' : 'Modifiez vos critères de recherche'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredSuppliers.length} {language === 'ar' ? 'مورد معروض' : 'fournisseur(s) affiché(s)'} {language === 'ar' ? 'من' : 'sur'} {suppliersData.length}
            </div>
            <div className="flex gap-3">
              {selectedSuppliers.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBulkDelete}
                  className="px-4 py-2 text-sm font-medium border-red-600 text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {language === 'ar' ? 'حذف' : 'Supprimer'} ({selectedSuppliers.length})
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handlePrintList}
                className="px-4 py-2 text-sm font-medium border-gray-600 text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                {language === 'ar' ? 'طباعة' : 'Imprimer'}
              </Button>
              <Button
                variant="outline"
                onClick={handleImport}
                className="px-4 py-2 text-sm font-medium border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {language === 'ar' ? 'استيراد' : 'Importer'}
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium"
              >
                {language === 'ar' ? 'تصدير' : 'Exporter'}
              </Button>
              <Button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
              >
                {language === 'ar' ? 'إغلاق' : 'Fermer'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de règlement fournisseur */}
      <SupplierPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        supplier={selectedSupplier}
      />

      {/* Modal d'importation fournisseurs */}
      <ImportSupplierModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => loadSuppliers()}
      />
    </div>
  );
}
