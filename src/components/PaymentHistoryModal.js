import React, { useState, useEffect } from 'react';
import { X, Search, Calendar, Banknote, Printer, FileText, Download, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

export default function PaymentHistoryModal({ isOpen, onClose, clientData }) {
    const { direction, t, language } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const isSupplier = !!clientData?.nomEntreprise;

    useEffect(() => {
        const loadHistory = async () => {
            if (!isOpen || !clientData?.id) return;
            setIsLoading(true);
            try {
                if (isSupplier) {
                    const result = await window.electronAPI.supplierPayments.getBySupplier(clientData.id);
                    if (result.success) {
                        setPayments(result.data);
                    }
                } else {
                    // For clients - similar logic if implemented
                }
            } catch (error) {
                console.error('Error loading payment history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadHistory();
    }, [isOpen, clientData, isSupplier]);

    // Filter payments based on search term (amount, note, or method)
    const filteredPayments = React.useMemo(() => {
        return payments.filter(payment => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = (
                payment.amount?.toString().includes(searchTerm) ||
                (payment.note || '').toLowerCase().includes(searchLower) ||
                (payment.method || '').toLowerCase().includes(searchLower)
            );

            const matchesDateFrom = !fromDate || payment.date >= fromDate;
            const matchesDateTo = !toDate || payment.date <= toDate;

            return matchesSearch && matchesDateFrom && matchesDateTo;
        });
    }, [searchTerm, payments, fromDate, toDate]);

    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

    const handlePrint = () => {
        try {
            const doc = new jsPDF();

            // App Title & Header
            doc.setFontSize(22);
            doc.setTextColor(30, 58, 138); // Blue 900
            const isSupplier = !!clientData?.nomEntreprise;
            const title = language === 'ar'
                ? (isSupplier ? 'سجل مدفوعات المورد' : 'سجل مدفوعات العميل')
                : (isSupplier ? 'Historique des Paiements Fournisseur' : 'Historique des Paiements Client');
            doc.text(title, 105, 15, { align: 'center' });

            // Party Info
            doc.setFontSize(12);
            doc.setTextColor(50);
            const partyLabel = language === 'ar' ? (isSupplier ? 'المورد:' : 'العميل:') : (isSupplier ? 'Fournisseur:' : 'Client:');
            const partyName = isSupplier ? clientData?.nomEntreprise : `${clientData?.prenom || ''} ${clientData?.nom || ''}`;
            doc.text(`${partyLabel} ${partyName}`, 14, 25);
            doc.text(`${language === 'ar' ? 'التوقيت:' : 'Généré le:'} ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 196, 25, { align: 'right' });

            // Table Data
            const tableColumn = [
                language === 'ar' ? 'التاريخ' : 'Date',
                language === 'ar' ? 'المبلغ' : 'Montant',
                language === 'ar' ? 'طريقة الدفع' : 'Méthode',
                language === 'ar' ? 'ملاحظات' : 'Notes'
            ];

            const tableRows = filteredPayments.map(p => [
                new Date(p.date).toLocaleDateString(),
                `${p.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} DA`,
                p.method,
                p.note
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 35,
                theme: 'striped',
                headStyles: { fillColor: [30, 58, 138], halign: 'center' },
                columnStyles: {
                    1: { halign: 'right', fontStyle: 'bold' }
                }
            });

            // Summary Footer
            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(14);
            doc.setTextColor(30, 58, 138);
            const totalText = `${language === 'ar' ? 'المجموع الإجمالي:' : 'Total Général:'} ${totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} DA`;
            doc.text(totalText, 196, finalY, { align: 'right' });

            // Save PDF
            const filename = `history_${clientData?.nom}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            toast.success(language === 'ar' ? 'تم استخراج السجل بنجاح' : 'Historique exporté avec succès');
        } catch (error) {
            console.error('PDF Error:', error);
            toast.error(language === 'ar' ? 'خطأ في استخراج PDF' : 'Erreur lors de l\'exportation PDF');
        }
    };

    const handlePrintReceipt = async (payment) => {
        try {
            const isSupplier = !!clientData?.nomEntreprise;
            const supplierName = isSupplier ? clientData?.nomEntreprise : `${clientData?.prenom || ''} ${clientData?.nom || ''}`;
            const codeFRS = isSupplier ? (clientData?.codeSupplier || clientData?.code || 'N/A') : (clientData?.id ? `CL-000${clientData.id}` : 'N/A');

            // Try to find matching transaction for balances
            let ancienSolde = 0;
            let nouveauSolde = 0;

            if (isSupplier) {
                const transResult = await window.electronAPI.supplierTransactions.getBySupplier(clientData.id);
                if (transResult.success) {
                    const match = transResult.data.find(t =>
                        t.type === 'payment' &&
                        Math.abs(t.amount - payment.amount) < 0.01 &&
                        t.date === payment.date
                    );

                    if (match) {
                        nouveauSolde = match.balance_after;
                        ancienSolde = nouveauSolde + payment.amount;
                    }
                }
            }

            const weekdays = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
            const pDate = new Date(payment.date);
            const formattedDate = `${weekdays[pDate.getDay()]} ${pDate.toLocaleDateString('fr-FR')}`;

            const receiptHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Arial', sans-serif;
      width: 280px; 
      margin: 0;
      padding: 8px;
      background-color: #fff;
      color: #000;
      line-height: 1.2;
      font-size: 14px;
    }
    .bold { font-weight: bold; }
    .center { text-align: center; }
    .right { text-align: right; }
    .title { font-size: 18px; font-weight: bold; margin: 8px 0; text-transform: uppercase; text-decoration: underline; }
    .divider { border-top: 1px dashed #000; margin: 6px 0; width: 100%; }
    .info-group { margin: 6px 0; }
    .info-row { display: flex; justify-content: space-between; width: 100%; }
    .amount-table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    .amount-table td { padding: 4px 0; vertical-align: top; }
    .amount-label { width: 50%; }
    .amount-value { width: 50%; text-align: right; font-weight: bold; }
    .total-line { border-top: 1px solid #000; font-size: 16px; margin-top: 4px; padding-top: 4px; }
    .footer { margin-top: 15px; text-align: right; padding-bottom: 20px; }
    @media print { body { margin: 0; padding: 4px; } .receipt { width: 280px; margin: 0; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="center" style="font-size: 11px;">Code: ${codeFRS}</div>
    <div class="center title">BON DE PAIEMENT</div>
    <div class="divider"></div>
    <div class="info-group">
      <div><span class="bold">${isSupplier ? 'Fournisseur' : 'Client'}:</span> ${supplierName}</div>
      <div class="info-row">
        <span><span class="bold">Date:</span> ${formattedDate}</span>
        <span><span class="bold">N°:</span> ${payment.id || 1}</span>
      </div>
    </div>
    <div class="divider"></div>
    <table class="amount-table">
      <tr>
        <td class="amount-label">Ancien Solde</td>
        <td class="amount-value">${ancienSolde.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td class="amount-label">Versement</td>
        <td class="amount-value">${payment.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr class="total-line">
        <td class="bold">Nouveau Solde</td>
        <td class="amount-value">${nouveauSolde.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>
    ${payment.note ? `
    <div class="divider"></div>
    <div style="font-size: 11px; margin-top: 5px;">
      <span class="bold">Note:</span> ${payment.note}
    </div>
    ` : ''}
    <div class="divider"></div>
    <div class="footer">
      <div class="bold">Admin</div>
    </div>
  </div>
</body>
</html>`;

            if (window.electronAPI?.printReceipt) {
                await window.electronAPI.printReceipt(receiptHtml);
                toast.success(language === 'ar' ? 'تم تجهيز الوصل للطباعة' : 'Receipt ready for printing');
            } else {
                toast.error('Print API not available');
            }
        } catch (error) {
            console.error('Print Error:', error);
            toast.error(language === 'ar' ? 'خطأ في الطباعة' : 'Printing error occurred');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
            <div className={`bg-white rounded-xl w-full max-w-4xl shadow-2xl border-2 border-gray-300 overflow-hidden flex flex-col h-[80vh] ${direction === 'rtl' ? 'rtl' : ''}`} style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>

                {/* Header */}
                <div className="bg-blue-900 p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">
                                {language === 'ar'
                                    ? (!!clientData?.nomEntreprise ? 'سجل مدفوعات المورد' : 'سجل مدفوعات العميل')
                                    : (!!clientData?.nomEntreprise ? 'Historique des Paiements Fournisseur' : 'Historique des Paiements Client')}
                            </h2>
                            <p className="text-blue-100 text-sm">
                                {clientData?.nomEntreprise || `${clientData?.prenom || ''} ${clientData?.nom || ''}`} ({clientData?.codeSupplier || clientData?.id})
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Filters Area */}
                <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'البحث بالمبلغ أو الملاحظة...' : 'Search by amount or note...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">{language === 'ar' ? 'من' : language === 'fr' ? 'Du' : 'From'}</span>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">{language === 'ar' ? 'إلى' : language === 'fr' ? 'Au' : 'To'}</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all active:scale-95"
                        >
                            <Printer className="w-4 h-4 text-blue-600" />
                            {language === 'ar' ? 'طباعة الكل' : 'Print All'}
                        </button>
                    </div>
                </div>

                {/* Table Area */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 font-bold text-gray-700 border-b uppercase text-xs tracking-wider">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                <th className="p-4 font-bold text-gray-700 border-b uppercase text-xs tracking-wider">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                                <th className="p-4 font-bold text-gray-700 border-b uppercase text-xs tracking-wider">{language === 'ar' ? 'الطريقة' : 'Method'}</th>
                                <th className="p-4 font-bold text-gray-700 border-b uppercase text-xs tracking-wider">{language === 'ar' ? 'ملاحظات' : 'Notes'}</th>
                                <th className="p-4 font-bold text-gray-700 border-b text-center uppercase text-xs tracking-wider">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map((payment) => (
                                <tr key={payment.id} className="border-b hover:bg-blue-50/50 group">
                                    <td className="p-4 text-gray-800 text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            {new Date(payment.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-blue-900">
                                        {payment.amount.toLocaleString('fr-DZ')} DA
                                    </td>
                                    <td className="p-4 text-gray-700">
                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-tighter border border-gray-200">
                                            {payment.method}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 italic text-sm">
                                        {payment.note}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handlePrintReceipt(payment)}
                                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-full transition-colors"
                                            title={language === 'ar' ? 'طباعة الوصل' : 'Imprimer le reçu'}
                                        >
                                            <Printer className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredPayments.length === 0 && (
                        <div className="p-20 text-center">
                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">
                                {language === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results found'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Summary */}
                <div className="p-4 bg-gray-50 border-t flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <div className="text-sm text-gray-600 font-bold">
                        {language === 'ar' ? 'عدد المدفوعات:' : 'Count:'} <span className="text-blue-900 border-b-2 border-blue-900">{filteredPayments.length}</span>
                    </div>
                    <div className="text-xl font-black text-blue-900 flex items-center gap-4">
                        <span className="text-sm text-gray-500 uppercase tracking-widest">{language === 'ar' ? 'المجموع' : 'Total'}</span>
                        <span className="bg-white px-4 py-1 rounded-lg border-2 border-blue-900 shadow-sm">
                            {totalAmount.toLocaleString('fr-DZ')} DA
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
