import React, { useState } from 'react';
import { X, Search, Users, DollarSign, AlertTriangle, FileText, Download, History, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import ClientPaymentModal from './ClientPaymentModal';
import PaymentHistoryModal from './PaymentHistoryModal';
import { useLanguage } from '../contexts/LanguageContext';

export default function ClientSituationModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState(null);

  // Données d'exemple des clients
  const clientsData = [
    {
      id: 'CLI001',
      nom: 'Société ALPHA',
      code: 'ALPHA2024',
      email: 'contact@alpha.dz',
      telephone: '0555 123 456',
      adresse: 'Zone Industrielle, Alger',
      facturesNombre: 15,
      montantTotal: 2450000,
      montantPaye: 2100000,
      montantDu: 350000,
      montantEchu: 0,
      statut: 'excellent',
      dernierPaiement: '2024-01-15',
      prochaineEcheance: '2024-02-15',
      limiteCredit: 5000000,
      representant: 'Ahmed Benali'
    },
    {
      id: 'CLI002',
      nom: 'BETA Distribution',
      code: 'BETA2024',
      email: 'finance@beta.dz',
      telephone: '0661 234 567',
      adresse: 'Centre Ville, Oran',
      facturesNombre: 8,
      montantTotal: 1800000,
      montantPaye: 1200000,
      montantDu: 600000,
      montantEchu: 150000,
      statut: 'attention',
      dernierPaiement: '2023-12-20',
      prochaineEcheance: '2024-01-20',
      limiteCredit: 3000000,
      representant: 'Fatima Kaci'
    },
    {
      id: 'CLI003',
      nom: 'GAMMA Entreprise',
      code: 'GAMMA2024',
      email: 'admin@gamma.dz',
      telephone: '0770 345 678',
      adresse: 'Zone d\'Activité, Constantine',
      facturesNombre: 22,
      montantTotal: 4200000,
      montantPaye: 2800000,
      montantDu: 1400000,
      montantEchu: 800000,
      statut: 'critique',
      dernierPaiement: '2023-11-10',
      prochaineEcheance: '2023-12-10',
      limiteCredit: 2500000,
      representant: 'Mohamed Saidi'
    },
    {
      id: 'CLI004',
      nom: 'DELTA Services',
      code: 'DELTA2024',
      email: 'compta@delta.dz',
      telephone: '0556 456 789',
      adresse: 'Nouveau Pôle, Annaba',
      facturesNombre: 12,
      montantTotal: 1950000,
      montantPaye: 1950000,
      montantDu: 0,
      montantEchu: 0,
      statut: 'excellent',
      dernierPaiement: '2024-01-10',
      prochaineEcheance: '2024-02-10',
      limiteCredit: 4000000,
      representant: 'Amina Benaissa'
    },
    {
      id: 'CLI005',
      nom: 'EPSILON Commerce',
      code: 'EPSILON2024',
      email: 'direction@epsilon.dz',
      telephone: '0662 567 890',
      adresse: 'Zone Commerciale, Sétif',
      facturesNombre: 18,
      montantTotal: 3100000,
      montantPaye: 2600000,
      montantDu: 500000,
      montantEchu: 200000,
      statut: 'attention',
      dernierPaiement: '2023-12-15',
      prochaineEcheance: '2024-01-15',
      limiteCredit: 3500000,
      representant: 'Karim Tizi'
    }
  ];

  // Filtrage des clients
  const filteredClients = clientsData.filter(client => {
    const matchesSearch = client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Calculs des statistiques
  const totalClients = clientsData.length;
  const totalMontantPaye = clientsData.reduce((sum, client) => sum + client.montantPaye, 0);
  const totalMontantDu = clientsData.reduce((sum, client) => sum + client.montantDu, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const exportToPDF = () => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentTime = new Date().toLocaleTimeString('fr-FR');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Situation des Clients - LogiSoft 360</title>
        <style>
          @page { margin: 20mm; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            color: #333;
            line-height: 1.4;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #8b5cf6; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .header h1 { 
            color: #8b5cf6; 
            margin: 0; 
            font-size: 28px; 
            font-weight: bold;
          }
          .header p { 
            margin: 5px 0; 
            color: #666; 
            font-size: 14px;
          }
          .summary { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 20px; 
            margin-bottom: 30px; 
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .summary-item { 
            text-align: center; 
            padding: 15px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e9ecef;
          }
          .summary-title { 
            font-size: 12px; 
            color: #666; 
            margin-bottom: 8px; 
            font-weight: 600;
            text-transform: uppercase;
          }
          .summary-value { 
            font-size: 18px; 
            font-weight: bold; 
            color: #333;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            background: white;
          }
          th { 
            background: #8b5cf6; 
            color: white; 
            padding: 12px 8px; 
            text-align: left; 
            font-size: 12px; 
            font-weight: 600;
            border: 1px solid #7c3aed;
          }
          td { 
            padding: 10px 8px; 
            border: 1px solid #e9ecef; 
            font-size: 11px;
            vertical-align: top;
          }
          tr:nth-child(even) { 
            background: #f8f9fa; 
          }
          tr:hover { 
            background: #e3f2fd; 
          }
          .client-name { 
            font-weight: bold; 
            color: #333; 
            font-size: 12px;
          }
          .client-code { 
            color: #666; 
            font-size: 10px;
            font-style: italic;
          }
          .amount-total { 
            font-weight: bold; 
            color: #333; 
          }
          .amount-paid { 
            font-weight: bold; 
            color: #16a34a; 
          }
          .amount-due { 
            font-weight: bold; 
            color: #ea580c; 
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 10px; 
            color: #666; 
            border-top: 1px solid #e9ecef; 
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LogiSoft 360</h1>
          <p>Situation des Clients</p>
          <p>Généré le ${currentDate} à ${currentTime}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-title">Total Clients</div>
            <div class="summary-value" style="color: #2563eb;">${totalClients}</div>
          </div>
          <div class="summary-item">
            <div class="summary-title">Total Payé</div>
            <div class="summary-value" style="color: #16a34a;">${formatCurrency(totalMontantPaye)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-title">Total Dû</div>
            <div class="summary-value" style="color: #ea580c;">${formatCurrency(totalMontantDu)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 25%;">Client</th>
              <th style="width: 15%;">Code</th>
              <th style="width: 20%;">Contact</th>
              <th style="width: 10%;">Factures</th>
              <th style="width: 15%;">Total (DZD)</th>
              <th style="width: 15%;">Payé (DZD)</th>
            </tr>
          </thead>
          <tbody>
            ${filteredClients.map(client => `
              <tr>
                <td class="client-name">${client.nom}</td>
                <td class="client-code">${client.code}</td>
                <td>
                  <div>${client.telephone}</div>
                  <div style="font-size: 10px; color: #666;">${client.email}</div>
                  <div style="font-size: 10px; color: #8b5cf6;">Rep: ${client.representant}</div>
                </td>
                <td style="text-align: center;">${client.facturesNombre}</td>
                <td class="amount-total">${formatCurrency(client.montantTotal)}</td>
                <td class="amount-paid">${formatCurrency(client.montantPaye)}</td>
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

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `situation-clients-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const headers = ['Client', 'Code', 'Email', 'Téléphone', 'Représentant', 'Factures', 'Total (DZD)', 'Payé (DZD)', 'Dû (DZD)'];

    let csvContent = headers.join(',') + '\n';

    filteredClients.forEach(client => {
      const row = [
        `"${client.nom}"`,
        `"${client.code}"`,
        `"${client.email}"`,
        `"${client.telephone}"`,
        `"${client.representant}"`,
        client.facturesNombre,
        client.montantTotal,
        client.montantPaye,
        client.montantDu
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `situation-clients-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePaymentClick = (client) => {
    setSelectedClient(client);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setSelectedClient(null);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setIsPaymentModalOpen(true);
  };

  const handleViewHistory = (client) => {
    setSelectedClientForHistory(client);
    setIsHistoryModalOpen(true);
  };

  const handleDeleteClient = (clientId) => {
    toast.warning(language === 'ar' ? `حذف العميل #${clientId}` : `Suppression du client #${clientId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="modal-container w-full max-w-7xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="modal-header">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="modal-header-icon">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="modal-header-title">Situation des Clients</h3>
                <p className="modal-header-subtitle">Analyse détaillée des paiements et créances</p>
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

        {/* Statistiques */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Clients</p>
                  <p className="text-2xl font-bold text-blue-700">{totalClients}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Payé</p>
                  <p className="text-xl font-bold text-green-700">{formatCurrency(totalMontantPaye)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-orange-600 font-medium">Total Dû</p>
                  <p className="text-xl font-bold text-orange-700">{formatCurrency(totalMontantDu)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recherche */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, code ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
            />
          </div>
        </div>

        {/* Table des clients */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-purple-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-700 border-b border-gray-200">Client</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-purple-700 border-b border-gray-200">Contact</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-purple-700 border-b border-gray-200">Factures</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-purple-700 border-b border-gray-200">Montants (DZD)</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-purple-700 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, index) => (
                  <tr key={client.id} className={`border-b border-gray-100 hover:bg-purple-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{client.nom}</div>
                        <div className="text-sm text-gray-600">{client.code}</div>
                        <div className="text-xs text-gray-500">{client.adresse}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900">{client.telephone}</div>
                      <div className="text-xs text-gray-600">{client.email}</div>
                      <div className="text-xs text-purple-600 font-medium">Rep: {client.representant}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">{client.facturesNombre}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Limite: {formatCurrency(client.limiteCredit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-600">Total: </span>
                          <span className="font-semibold text-gray-900">{formatCurrency(client.montantTotal)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Payé: </span>
                          <span className="font-semibold text-green-600">{formatCurrency(client.montantPaye)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Dû: </span>
                          <span className="font-semibold text-orange-600">{formatCurrency(client.montantDu)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
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
                          onClick={() => handleEditClient(client)}
                          className="w-8 h-8 p-0 hover:bg-orange-100 hover:text-orange-600"
                          title={language === 'ar' ? 'تعديل' : 'Modifier'}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredClients.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Users className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Aucun client trouvé</p>
                <p className="text-sm">Essayez de modifier vos critères de recherche</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="text-sm text-gray-600 mr-auto">
            Affichage de {filteredClients.length} client(s) sur {totalClients} au total
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToPDF}
              className="modal-button-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter PDF
            </button>
            <button
              onClick={exportToExcel}
              className="modal-button-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter Excel
            </button>
            <button onClick={onClose} className="modal-button-primary">
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Client Payment Modal */}
      <ClientPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handlePaymentModalClose}
        clientData={selectedClient}
      />

      <PaymentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        clientData={selectedClientForHistory}
      />
    </div>
  );
}
