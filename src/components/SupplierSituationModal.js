import React, { useState, useEffect } from 'react';
import { X, Search, Building2, AlertTriangle, CheckCircle, Package, Clock, Download, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import SupplierPaymentModal from './SupplierPaymentModal';


export default function SupplierSituationModal({ isOpen, onClose }) {
  const { language, direction } = useLanguage();
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliersData, setSuppliersData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();

    // Listen for supplier updates
    const handleUpdate = () => loadData();
    window.addEventListener('supplierUpdated', handleUpdate);
    return () => window.removeEventListener('supplierUpdated', handleUpdate);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.suppliers.getAll();
      if (result.success) {
        setSuppliersData(result.data);
        // Refresh selected supplier if one is open
        if (selectedSupplier) {
          const updated = result.data.find(s => s.id === selectedSupplier.id);
          if (updated) {
            setSelectedSupplier(updated);
          }
        }
      }
    } catch (error) {
      console.error('Error loading situation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
  const filteredSuppliers = suppliersData.filter(supplier => {
    const searchLower = searchTerm.toLowerCase();
    const name = (supplier.nomEntreprise || supplier.nom_entreprise || '').toLowerCase();
    const code = (supplier.codeSupplier || supplier.code_supplier || '').toLowerCase();

    return name.includes(searchLower) || code.includes(searchLower);
  });

  // Calculs des statistiques
  const totalSuppliers = suppliersData.length;
  const totalMontantDu = suppliersData.reduce((sum, s) => sum + (s.solde || 0), 0);
  const totalMontantPaye = suppliersData.reduce((sum, s) => sum + (s.totalPaye || 0), 0);
  const suppliersAttention = filteredSuppliers.filter(s => s.solde > 1000000).length;

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

  const handleDeleteSupplier = async (id) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المورد؟' : 'Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        const result = await window.electronAPI.suppliers.delete(id);
        if (result.success) {
          toast.success(language === 'ar' ? 'تم الحذف بنجاح' : 'Suppression réussie');
          loadData();
          // Notify other components
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('supplierUpdated'));
          }
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
        toast.error(language === 'ar' ? 'خطأ في الحذف' : 'Erreur lors de la suppression');
      }
    }
  };

  const exportToPDF = () => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentTime = new Date().toLocaleTimeString('fr-FR');
    const today = new Date().toISOString().split('T')[0];

    const rowsHtml = filteredSuppliers.map(supplier => `
      <tr>
        <td class="supplier-name">${supplier.nomEntreprise || '-'}</td>
        <td>${supplier.codeSupplier || '-'}</td>
        <td>${supplier.categorieActivite || '-'}</td>
        <td class="amount-paid">${(supplier.totalPaye || 0).toLocaleString('fr-DZ')} DA</td>
        <td class="amount-due">${(supplier.solde || 0).toLocaleString('fr-DZ')} DA</td>
        <td style="text-align:center">${supplier.nombreCommandes || 0}</td>
      </tr>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Aperçu – Situation des Fournisseurs</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f0f2f5; font-size: 12px; color: #333; }

    /* Sticky toolbar */
    .toolbar {
      position: sticky; top: 0; z-index: 999;
      background: #1b1b1b;
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 28px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    }
    .toolbar-title { color: #fff; font-size: 14px; font-weight: 600; }
    .toolbar-btns { display: flex; gap: 10px; }
    .btn-dl {
      background: #2563eb; color: #fff; border: none;
      padding: 9px 22px; border-radius: 6px; font-size: 13px; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; gap: 7px;
    }
    .btn-dl:hover { background: #1d4ed8; }
    .btn-close {
      background: transparent; color: #bbb; border: 1px solid #555;
      padding: 9px 16px; border-radius: 6px; font-size: 13px; cursor: pointer;
    }
    .btn-close:hover { background: #333; color: #fff; }

    /* Page wrapper + document card */
    .page-wrapper { padding: 32px; }
    .document {
      background: #fff; max-width: 960px; margin: 0 auto;
      padding: 40px; border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
    }

    /* Header */
    .doc-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #1b1b1b; }
    .doc-header h1 { font-size: 32px; font-weight: 900; color: #1b1b1b; letter-spacing: -0.5px; margin-bottom: 2px; }
    .doc-header h2 { font-size: 15px; font-weight: 400; color: #666; margin-top: 4px; }

    /* Info */
    .doc-info { text-align: right; font-size: 11px; color: #888; margin-bottom: 20px; }

    /* Summary cards */
    .summary { display: flex; gap: 16px; margin-bottom: 28px; }
    .summary-card {
      flex: 1; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;
      text-align: center; background: #f9fafb;
    }
    .summary-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 8px; }
    .summary-value { font-size: 22px; font-weight: 700; color: #111827; }
    .summary-card.green .summary-value { color: #16a34a; }
    .summary-card.orange .summary-value { color: #ea580c; }

    /* Table */
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #1b1b1b; color: #fff;
      padding: 11px 10px; text-align: left; font-size: 11px; letter-spacing: 0.4px;
    }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
    tr:nth-child(even) td { background: #f9fafb; }
    .supplier-name { font-weight: 700; color: #111827; }
    .amount-paid { color: #16a34a; font-weight: 600; }
    .amount-due { color: #ea580c; font-weight: 600; }

    /* Footer */
    .doc-footer { margin-top: 32px; text-align: center; font-size: 10px; color: #9ca3af; padding-top: 16px; border-top: 1px solid #e5e7eb; }

    /* Print overrides */
    @media print {
      body { background: #fff; }
      .toolbar { display: none !important; }
      .page-wrapper { padding: 0; }
      .document { box-shadow: none; border-radius: 0; padding: 20px; max-width: 100%; }
    }
  </style>
</head>
<body>

  <div class="toolbar">
    <span class="toolbar-title">📄 Aperçu — Situation des Fournisseurs</span>
    <div class="toolbar-btns">
      <button class="btn-dl" id="savePdfBtn" onclick="savePdf()">⬇ Télécharger PDF</button>
      <button class="btn-close" onclick="window.close()">✕ Fermer</button>
    </div>
  </div>

  <script>
    async function savePdf() {
      const btn = document.getElementById('savePdfBtn');
      btn.disabled = true;
      btn.textContent = '⏳ Génération...';

      try {
        // Extract only the document content (no toolbar) for a clean PDF
        const docHtml = document.querySelector('.page-wrapper').outerHTML;
        const fullHtml = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">' +
          document.head.innerHTML +
          '</head><body style="background:#fff;padding:0;margin:0">' +
          docHtml + '</body></html>';

        // Call main process via parent window's electronAPI
        const api = window.electronAPI || (window.opener && window.opener.electronAPI);
        if (!api || !api.savePDF) {
          alert('Erreur : API non disponible. Veuillez redémarrer l\\'application.');
          return;
        }

        const result = await api.savePDF(fullHtml);

        if (result.success) {
          btn.textContent = '✅ Enregistré !';
          setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '⬇ Télécharger PDF';
          }, 2500);
        } else if (result.reason !== 'canceled') {
          alert('Erreur lors de la génération du PDF : ' + result.reason);
          btn.disabled = false;
          btn.innerHTML = '⬇ Télécharger PDF';
        } else {
          btn.disabled = false;
          btn.innerHTML = '⬇ Télécharger PDF';
        }
      } catch (e) {
        alert('Erreur : ' + e.message);
        btn.disabled = false;
        btn.innerHTML = '⬇ Télécharger PDF';
      }
    }
  </script>

  <div class="page-wrapper">
    <div class="document">

      <div class="doc-header">
        <h1>Moussir 26</h1>
        <h2>Situation des Fournisseurs</h2>
      </div>

      <div class="doc-info">
        Date d'édition : ${currentDate} &nbsp;|&nbsp; Heure : ${currentTime} &nbsp;|&nbsp; Fournisseurs : ${filteredSuppliers.length}
      </div>

      <div class="summary">
        <div class="summary-card">
          <div class="summary-label">Total Fournisseurs</div>
          <div class="summary-value">${totalSuppliers}</div>
        </div>
        <div class="summary-card green">
          <div class="summary-label">Total Payé (DZD)</div>
          <div class="summary-value">${totalMontantPaye.toLocaleString('fr-DZ')}</div>
        </div>
        <div class="summary-card orange">
          <div class="summary-label">Total Dû (DZD)</div>
          <div class="summary-value">${totalMontantDu.toLocaleString('fr-DZ')}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:28%">Fournisseur</th>
            <th style="width:16%">Code</th>
            <th style="width:16%">Activité</th>
            <th style="width:14%">Total Payé (DZD)</th>
            <th style="width:14%">Solde Dû (DZD)</th>
            <th style="width:12%">Commandes</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="doc-footer">
        <div>Document généré par Moussir 26 — Système de Gestion Commerciale</div>
        <div>© ${new Date().getFullYear()} — Tous droits réservés</div>
      </div>

    </div>
  </div>
</body>
</html>`;

    const previewWindow = window.open('', '_blank', 'width=1100,height=750,scrollbars=yes,resizable=yes');
    if (previewWindow) {
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
    } else {
      alert(language === 'ar'
        ? 'يرجى السماح بالنوافذ المنبثقة لعرض المعاينة'
        : "Veuillez autoriser les popups pour afficher l'aperçu PDF");
    }
  };

  const exportToExcel = () => {
    const headers = ['Fournisseur', 'Code', 'Activité', 'Total Payé (DZD)', 'Solde Dû (DZD)', 'Commandes'];

    let csvContent = headers.join(',') + '\n';

    filteredSuppliers.forEach(supplier => {
      const row = [
        `"${supplier.nomEntreprise || ''}"`,
        `"${supplier.codeSupplier || ''}"`,
        `"${supplier.categorieActivite || ''}"`,
        supplier.totalPaye || 0,
        supplier.solde || 0,
        supplier.nombreCommandes || 0
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
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
                          <span className="text-gray-600">{language === 'ar' ? 'المستحق: ' : 'Dû: '}</span>
                          <span className="font-medium text-orange-600">{formatCurrency(supplier.solde || 0)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Package className="w-3 h-3 text-gray-500" />
                        <span className="font-medium text-gray-900 text-sm">{supplier.nombreCommandes || 0}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {language === 'ar' ? 'آخر: ' : 'Dernière: '}{supplier.derniereLivraison ? new Date(supplier.derniereLivraison).toLocaleDateString('fr-FR') : '-'}
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
