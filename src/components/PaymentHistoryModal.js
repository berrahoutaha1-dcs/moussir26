import React, { useState, useEffect } from 'react';
import { X, Search, Calendar, Printer, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import PrintReceiptModal from './PrintReceiptModal';

export default function PaymentHistoryModal({ isOpen, onClose, clientData }) {
    const { direction, t, language } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // The receipt currently being previewed in PrintReceiptModal
    const [selectedReceipt, setSelectedReceipt] = useState(null);

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
                    const result = await window.electronAPI.clientPayments.getByClient(clientData.id);
                    if (result.success) {
                        setPayments(result.data);
                    }
                }
            } catch (error) {
                console.error('Error loading payment history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadHistory();

        const handleUpdate = () => {
            if (isOpen) loadHistory();
        };

        window.addEventListener('clientUpdated', handleUpdate);
        return () => {
            window.removeEventListener('clientUpdated', handleUpdate);
        };
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

    // ── "Print All" – sends all filtered payments as a single combined receipt ──
    const handlePrintAll = async () => {
        if (filteredPayments.length === 0) return;
        const clientName = isSupplier
            ? clientData?.nomEntreprise
            : `${clientData?.prenom || ''} ${clientData?.nom || ''}`.trim();
        const code = isSupplier
            ? (clientData?.codeSupplier || clientData?.code || 'N/A')
            : (clientData?.codeClient || `CL-${String(clientData?.id).padStart(4, '0')}` || 'N/A');

        const fmt = (v) => parseFloat(v || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const rowsHtml = filteredPayments.map(p => {
            const d = new Date(p.date + 'T00:00:00');
            const weekday = d.toLocaleDateString('fr-FR', { weekday: 'long' });
            const dmy = d.toLocaleDateString('fr-FR');
            return `<tr><td>${weekday} ${dmy}</td><td style="text-align:right;font-weight:bold">${fmt(p.amount)}</td><td>${p.method || ''}</td><td>${p.note || ''}</td></tr>`;
        }).join('');

        const totalHtml = `<tr style="border-top:2px solid #333;font-weight:bold;font-size:13px">
            <td colspan="3">Total</td><td style="text-align:right">${fmt(totalAmount)}</td></tr>`;

        const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>Historique Paiements</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;font-size:11px;padding:12px 10px;color:#222;width:80mm;margin:0 auto}
  .code{text-align:center;font-size:10px;color:#555;margin-bottom:2px}
  .title{text-align:center;font-size:16px;font-weight:bold;text-decoration:underline;margin-bottom:7px}
  .client{margin:3px 0;font-size:11px}
  .dashed{border:none;border-top:1px dashed #999;margin:6px 0}
  table{width:100%;border-collapse:collapse;margin-top:6px}
  th{font-size:9px;text-transform:uppercase;border-bottom:1px solid #999;padding:3px 2px;text-align:left}
  td{padding:3px 2px;font-size:10px;vertical-align:top}
  .admin{text-align:right;margin-top:10px;font-size:11px;color:#444}
  @media print{body{width:80mm}@page{margin:0;size:80mm auto}}
</style></head><body>
  <div class="code">Code: ${code}</div>
  <div class="title">HISTORIQUE DES PAIEMENTS</div>
  <hr class="dashed"/>
  <div class="client"><b>${isSupplier ? 'Fournisseur' : 'Client'}:</b> ${clientName}</div>
  <div class="client"><b>Date d'impression:</b> ${new Date().toLocaleDateString('fr-FR')}</div>
  <hr class="dashed"/>
  <table>
    <thead><tr><th>Date</th><th style="text-align:right">Montant</th><th>Méthode</th><th>Note</th></tr></thead>
    <tbody>${rowsHtml}${totalHtml}</tbody>
  </table>
  <hr class="dashed"/>
  <div class="admin">Admin</div>
</body></html>`;

        try {
            if (window.electronAPI?.printReceipt) {
                await window.electronAPI.printReceipt(html);
                toast.success(language === 'ar' ? 'تمت الطباعة' : 'Envoyé à l\'imprimante');
            }
        } catch (err) {
            console.error(err);
            toast.error(language === 'ar' ? 'خطأ في الطباعة' : 'Erreur impression');
        }
    };

    // ── Single receipt: fetch balances, build receipt data, open preview modal ──
    const handlePrintReceipt = async (payment) => {
        try {
            const clientName = isSupplier
                ? clientData?.nomEntreprise
                : `${clientData?.prenom || ''} ${clientData?.nom || ''}`.trim();
            const code = isSupplier
                ? (clientData?.codeSupplier || clientData?.code || 'N/A')
                : (clientData?.codeClient || `CL-${String(clientData?.id).padStart(4, '0')}`);

            // Fetch transactions to get ancien/nouveau solde
            let ancienSolde = 0;
            let nouveauSolde = 0;

            const transAPI = isSupplier
                ? window.electronAPI?.supplierTransactions?.getBySupplier
                : window.electronAPI?.clientTransactions?.getByClient;

            if (transAPI) {
                const transResult = await transAPI(clientData.id);
                if (transResult?.success) {
                    const match = transResult.data.find(t =>
                        t.type === 'payment' &&
                        Math.abs(t.amount - payment.amount) < 0.01 &&
                        t.date === payment.date
                    );
                    if (match) {
                        // balance_after is signed (e.g. -4000 means client owes 4000 DA)
                        // Nouveau Solde = |balance_after|
                        // Ancien Solde  = |balance_after - payment|  (reverse the payment to get pre-payment state)
                        nouveauSolde = Math.abs(match.balance_after ?? 0);
                        ancienSolde = Math.abs((match.balance_after ?? 0) - payment.amount);
                    }
                }
            }

            // Build the formatted date: "mercredi 25/02/2026"
            const pDate = new Date(payment.date + 'T00:00:00');
            const weekday = pDate.toLocaleDateString('fr-FR', { weekday: 'long' });
            const dmy = pDate.toLocaleDateString('fr-FR');

            setSelectedReceipt({
                codeClient: code,
                clientName,
                paidAmount: payment.amount,
                previousBalance: ancienSolde,
                newBalance: nouveauSolde,
                receiptNo: payment.id || '',
                formattedDate: `${weekday} ${dmy}`,
                printDate: pDate.toLocaleDateString('fr-FR'),
                printTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            });
        } catch (error) {
            console.error('Print Error:', error);
            toast.error(language === 'ar' ? 'خطأ في الطباعة' : 'Erreur impression');
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
                            onClick={handlePrintAll}
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

            {/* BON DE PAIEMENT preview modal */}
            <PrintReceiptModal
                isOpen={!!selectedReceipt}
                onClose={() => setSelectedReceipt(null)}
                receiptData={selectedReceipt}
                language={language}
            />
        </div>
    );
}
