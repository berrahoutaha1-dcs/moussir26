import React, { useState } from 'react';
import { X, Search, Building2, AlertTriangle, CheckCircle, Package, Clock, Download, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SupplierPaymentModal from './SupplierPaymentModal';

export default function SupplierSituationModal({ isOpen, onClose }) {
  const { language, direction } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Données d'exemple de la situation des fournisseurs
  const situationData = [
    {
      id: 'FORN001',
      nomEntreprise: 'ALPHA Industries',
      codeSupplier: 'ALPHA2024',
      montantTotal: 1200000,
      montantPaye: 1200000,
      montantDu: 0,
      montantEnRetard: 0,
      nombreCommandes: 24,
      delaiMoyenLivraison: 5,
      tauxPonctualite: 98,
      evaluation: 'excellent',
      derniereLivraison: '2024-01-20',
      prochaineCommande: '2024-02-05',
      categorieActivite: 'Électronique',
      statut: 'actif'
    },
    {
      id: 'FORN002',
      nomEntreprise: 'BETA Distributions',
      codeSupplier: 'BETA2024',
      montantTotal: 850000,
      montantPaye: 720000,
      montantDu: 130000,
      montantEnRetard: 45000,
      nombreCommandes: 18,
      delaiMoyenLivraison: 7,
      tauxPonctualite: 85,
      evaluation: 'bon',
      derniereLivraison: '2024-01-18',
      prochaineCommande: '2024-01-30',
      categorieActivite: 'Alimentaire',
      statut: 'attention'
    },
    {
      id: 'FORN003',
      nomEntreprise: 'GAMMA Construction',
      codeSupplier: 'GAMMA2024',
      montantTotal: 2100000,
      montantPaye: 1400000,
      montantDu: 700000,
      montantEnRetard: 350000,
      nombreCommandes: 12,
      delaiMoyenLivraison: 12,
      tauxPonctualite: 65,
      evaluation: 'faible',
      derniereLivraison: '2023-12-15',
      prochaineCommande: '2024-02-15',
      categorieActivite: 'Construction',
      statut: 'critique'
    },
    {
      id: 'FORN004',
      nomEntreprise: 'DELTA Textiles',
      codeSupplier: 'DELTA2024',
      montantTotal: 950000,
      montantPaye: 850000,
      montantDu: 100000,
      montantEnRetard: 0,
      nombreCommandes: 20,
      delaiMoyenLivraison: 6,
      tauxPonctualite: 92,
      evaluation: 'bon',
      derniereLivraison: '2024-01-19',
      prochaineCommande: '2024-02-02',
      categorieActivite: 'Textile',
      statut: 'actif'
    },
    {
      id: 'FORN005',
      nomEntreprise: 'EPSILON Services',
      codeSupplier: 'EPSILON2024',
      montantTotal: 450000,
      montantPaye: 380000,
      montantDu: 70000,
      montantEnRetard: 20000,
      nombreCommandes: 8,
      delaiMoyenLivraison: 9,
      tauxPonctualite: 78,
      evaluation: 'moyen',
      derniereLivraison: '2023-11-30',
      prochaineCommande: '2024-02-10',
      categorieActivite: 'Service',
      statut: 'attention'
    }
  ];

  // Filtrage des fournisseurs
  const filteredSuppliers = situationData.filter(supplier => {
    const matchesSearch = supplier.nomEntreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.codeSupplier.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Calculs des statistiques
  const totalSuppliers = situationData.length;
  const totalMontantPaye = situationData.reduce((sum, supplier) => sum + supplier.montantPaye, 0);
  const totalMontantDu = situationData.reduce((sum, supplier) => sum + supplier.montantDu, 0);
  const suppliersAttention = filteredSuppliers.filter(s => s.statut === 'attention').length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSupplierClick = (supplier) => {
    setSelectedSupplier(supplier);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleDeleteSupplier = (id) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المورد؟' : 'Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      toast.success(language === 'ar' ? 'تم الحذف بنجاح' : 'Suppression réussie');
    }
  };

  const exportToPDF = () => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentTime = new Date().toLocaleTimeString('fr-FR');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Situation des Fournisseurs - LogiSoft 360</title>
        <style>
          body { 
            font-family: 'Calibri', Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            font-size: 12px; 
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #1b1b1b; 
            padding-bottom: 15px;
          }
          .header h1 { 
            color: #1b1b1b; 
            margin: 0; 
            font-size: 24px; 
            font-weight: bold;
          }
          .header h2 { 
            color: #666; 
            margin: 5px 0 0 0; 
            font-size: 16px; 
            font-weight: normal;
          }
          .info { 
            margin-bottom: 20px; 
            text-align: right; 
            font-size: 11px; 
            color: #666;
          }
          .summary { 
            display: flex; 
            justify-content: space-around; 
            margin-bottom: 25px; 
            padding: 15px; 
            background-color: #f8f9fa; 
            border-radius: 8px;
          }
          .summary-item { 
            text-align: center; 
            padding: 10px;
          }
          .summary-title { 
            font-size: 11px; 
            color: #666; 
            margin-bottom: 5px; 
            text-transform: uppercase;
          }
          .summary-value { 
            font-size: 18px; 
            font-weight: bold; 
            color: #1b1b1b;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
          }
          th { 
            background-color: #1b1b1b; 
            color: white; 
            padding: 12px 8px; 
            text-align: left; 
            font-weight: bold; 
            font-size: 11px;
          }
          td { 
            padding: 10px 8px; 
            border-bottom: 1px solid #ddd; 
            font-size: 10px;
          }
          tr:nth-child(even) { 
            background-color: #f9f9f9;
          }
          .supplier-name { 
            font-weight: bold; 
            color: #1b1b1b;
          }
          .amount-total { 
            color: #374151; 
            font-weight: bold;
          }
          .amount-paid { 
            color: #16a34a; 
            font-weight: bold;
          }
          .amount-due { 
            color: #ea580c; 
            font-weight: bold;
          }
          .footer { 
            margin-top: 30px; 
            text-align: center; 
            font-size: 10px; 
            color: #666; 
            border-top: 1px solid #ddd; 
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LogiSoft 360</h1>
          <h2>Situation des Fournisseurs</h2>
        </div>
        
        <div class="info">
          <div>Date d'édition : ${currentDate}</div>
          <div>Heure : ${currentTime}</div>
          <div>Nombre de fournisseurs : ${filteredSuppliers.length}</div>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-title">Total</div>
            <div class="summary-value">${filteredSuppliers.length}</div>
          </div>
          <div class="summary-item">
            <div class="summary-title">Attention</div>
            <div class="summary-value" style="color: #ea580c;">${suppliersAttention}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 25%;">Fournisseur</th>
              <th style="width: 15%;">Code</th>
              <th style="width: 15%;">Activité</th>
              <th style="width: 12%;">Total (DZD)</th>
              <th style="width: 12%;">Payé (DZD)</th>
              <th style="width: 12%;">Dû (DZD)</th>
              <th style="width: 9%;">Commandes</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSuppliers.map(supplier => `
              <tr>
                <td class="supplier-name">${supplier.nomEntreprise}</td>
                <td>${supplier.codeSupplier}</td>
                <td>${supplier.categorieActivite}</td>
                <td class="amount-total">${formatCurrency(supplier.montantTotal)}</td>
                <td class="amount-paid">${formatCurrency(supplier.montantPaye)}</td>
                <td class="amount-due">${formatCurrency(supplier.montantDu)}</td>
                <td style="text-align: center;">${supplier.nombreCommandes}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div>Document généré par LogiSoft 360 - Système de Gestion Commerciale</div>
          <div>© ${new Date().getFullYear()} - Tous droits réservés</div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
    } else {
      alert(language === 'ar' ? 'يرجى السماح بالنوافذ المنبثقة لتصدير PDF' : 'Veuillez autoriser les popups pour exporter le PDF');
    }
  };

  const exportToExcel = () => {
    const headers = ['Fournisseur', 'Code', 'Activité', 'Total (DZD)', 'Payé (DZD)', 'Dû (DZD)', 'Commandes'];

    let csvContent = headers.join(',') + '\n';

    filteredSuppliers.forEach(supplier => {
      const row = [
        `"${supplier.nomEntreprise}"`,
        `"${supplier.codeSupplier}"`,
        `"${supplier.categorieActivite}"`,
        supplier.montantTotal,
        supplier.montantPaye,
        supplier.montantDu,
        supplier.nombreCommandes
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `situation-fournisseurs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                  {language === 'ar' ? 'حالة الموردين' : 'Situation des Fournisseurs'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'تحليل الأداء والوضع المالي' : 'Analyse de performance et situation financière'}
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

        {/* Statistiques */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    {language === 'ar' ? 'إجمالي الموردين' : 'Total Fournisseurs'}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{totalSuppliers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    {language === 'ar' ? 'إجمالي المدفوع' : 'Total Payé'}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(totalMontantPaye)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-600 rounded-md flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    {language === 'ar' ? 'إجمالي المستحق' : 'Total Dû'}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(totalMontantDu)}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Filtres et Recherche */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث بالاسم أو كود المورد...' : 'Rechercher par nom ou code fournisseur...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table des fournisseurs */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                    {language === 'ar' ? 'المورد' : 'Fournisseur'}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                    {language === 'ar' ? 'المبالغ (د.ج)' : 'Montants (DZD)'}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                    {language === 'ar' ? 'الطلبات' : 'Commandes'}
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
                    onClick={() => handleSupplierClick(supplier)}
                    className={`border-b border-gray-100 hover:bg-blue-50 hover:cursor-pointer transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{supplier.nomEntreprise}</div>
                        <div className="text-xs text-gray-600">{supplier.codeSupplier}</div>
                        <div className="text-xs text-blue-600">{supplier.categorieActivite}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="text-gray-600">{language === 'ar' ? 'الإجمالي: ' : 'Total: '}</span>
                          <span className="font-medium text-gray-900">{formatCurrency(supplier.montantTotal)}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-600">{language === 'ar' ? 'المدفوع: ' : 'Payé: '}</span>
                          <span className="font-medium text-green-600">{formatCurrency(supplier.montantPaye)}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-600">{language === 'ar' ? 'المستحق: ' : 'Dû: '}</span>
                          <span className="font-medium text-orange-600">{formatCurrency(supplier.montantDu)}</span>
                        </div>

                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Package className="w-3 h-3 text-gray-500" />
                        <span className="font-medium text-gray-900 text-sm">{supplier.nombreCommandes}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {language === 'ar' ? 'آخر: ' : 'Dernière: '}{new Date(supplier.derniereLivraison).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSupplierClick(supplier);
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
              {filteredSuppliers.length} {language === 'ar' ? 'مورد معروض' : 'fournisseur(s) affiché(s)'} {language === 'ar' ? 'من' : 'sur'} {situationData.length}
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToPDF}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {language === 'ar' ? 'تصدير PDF' : 'Exporter PDF'}
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {language === 'ar' ? 'تصدير Excel' : 'Exporter Excel'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                {language === 'ar' ? 'إغلاق' : 'Fermer'}
              </button>
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
    </div>
  );
}
