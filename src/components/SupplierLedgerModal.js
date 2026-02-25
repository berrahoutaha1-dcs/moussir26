import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Calendar, Banknote, Printer, FileText, Download, LayoutList, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SupplierPaymentModal from './SupplierPaymentModal';

export default function SupplierLedgerModal({ isOpen, onClose, supplier }) {
    const { direction, language, t } = useLanguage();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const loadLedger = async () => {
        if (!isOpen || !supplier?.id) return;
        setIsLoading(true);
        try {
            const result = await window.electronAPI.supplierTransactions.getBySupplier(supplier.id);
            if (result.success) {
                setTransactions(result.data);
            }
        } catch (error) {
            console.error('Error loading supplier ledger:', error);
            toast.error(language === 'ar' ? 'خطأ في تحميل الوضعية' : 'Erreur lors du chargement de la situation');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLedger();
    }, [isOpen, supplier]);

    // Listen for updates (from payment modal or other changes)
    useEffect(() => {
        const handleUpdate = () => {
            if (isOpen) loadLedger();
        };
        window.addEventListener('supplierUpdated', handleUpdate);
        return () => window.removeEventListener('supplierUpdated', handleUpdate);
    }, [isOpen, supplier]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = (
                (tx.description || '').toLowerCase().includes(searchLower) ||
                (tx.reference || '').toLowerCase().includes(searchLower) ||
                tx.amount?.toString().includes(searchTerm)
            );

            // Date filtering
            let matchesDate = true;
            if (startDate || endDate) {
                const txDate = new Date(tx.date).setHours(0, 0, 0, 0);
                if (startDate) {
                    const start = new Date(startDate).setHours(0, 0, 0, 0);
                    if (txDate < start) matchesDate = false;
                }
                if (endDate) {
                    const end = new Date(endDate).setHours(23, 59, 59, 999);
                    if (txDate > end) matchesDate = false;
                }
            }

            return matchesSearch && matchesDate;
        });
    }, [transactions, searchTerm, startDate, endDate]);

    const totals = useMemo(() => {
        const res = filteredTransactions.reduce((acc, tx) => {
            acc.debit += (tx.debit || 0);
            acc.credit += (tx.credit || 0);
            return acc;
        }, { debit: 0, credit: 0 });

        // Derive current balance from the latest transaction in the FULL list
        // to ensure it matches the ledger rows immediately
        let balance = supplier?.solde || 0;
        if (transactions.length > 0) {
            // The transactions are returned in chronological order from the backend
            balance = transactions[transactions.length - 1].balance_after;
        }

        return { ...res, currentBalance: balance };
    }, [filteredTransactions, transactions, supplier]);

    const handlePrint = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(20);
            const title = language === 'ar' ? 'وضعية المورد' : 'Situation du Fournisseur';
            doc.text(title, 105, 15, { align: 'center' });

            doc.setFontSize(12);
            doc.text(`${language === 'ar' ? 'المورد:' : 'Fournisseur:'} ${supplier?.nomEntreprise}`, 14, 25);
            doc.text(`${language === 'ar' ? 'التاريخ:' : 'Date:'} ${new Date().toLocaleDateString()}`, 196, 25, { align: 'right' });

            const tableColumn = [
                language === 'ar' ? 'التاريخ' : 'Date',
                language === 'ar' ? 'البيان' : 'Description',
                language === 'ar' ? 'المرجع' : 'Référence',
                language === 'ar' ? 'مدين' : 'Débit',
                language === 'ar' ? 'دائن' : 'Crédit',
                language === 'ar' ? 'الرصيد' : 'Solde'
            ];

            const tableRows = filteredTransactions.map(tx => [
                new Date(tx.date).toLocaleDateString(),
                tx.description || '',
                tx.reference || '',
                tx.debit > 0 ? tx.debit.toLocaleString() : '',
                tx.credit > 0 ? tx.credit.toLocaleString() : '',
                tx.balance_after.toLocaleString()
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 35,
                theme: 'striped',
                headStyles: { fillColor: [30, 58, 138] }
            });

            doc.save(`situation_${supplier?.nomEntreprise}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF Error:', error);
            toast.error('Error generating PDF');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
            <div className={`bg-white rounded-xl w-full max-w-5xl shadow-2xl border-2 border-gray-300 overflow-hidden flex flex-col h-[85vh] ${direction === 'rtl' ? 'rtl' : ''}`}>

                {/* Header */}
                <div className="bg-blue-900 p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <LayoutList className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">
                                {language === 'ar' ? 'وضعية المورد التفصيلية' : 'Situation Détaillée Fournisseur'}
                            </h2>
                            <p className="text-blue-100 text-sm">
                                {supplier?.nomEntreprise} ({supplier?.codeSupplier})
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-sm"
                        >
                            <Banknote className="w-5 h-5" />
                            <span>{language === 'ar' ? 'دفع جديد' : 'Nouveau Paiement'}</span>
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'بحث بالحوار أو المرجع...' : 'Rechercher description, référence...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-300 shadow-sm">
                        <div className="flex items-center gap-2 px-2 border-r">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border-none focus:ring-0 text-sm p-1 outline-none"
                                title={language === 'ar' ? 'من' : 'Du'}
                            />
                        </div>
                        <div className="flex items-center gap-2 px-2">
                            <span className="text-gray-400 text-xs font-bold">TO</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border-none focus:ring-0 text-sm p-1 outline-none"
                                title={language === 'ar' ? 'إلى' : 'Au'}
                            />
                        </div>
                        {(startDate || endDate || searchTerm) && (
                            <button
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                    setSearchTerm('');
                                }}
                                className="p-1.5 hover:bg-red-50 text-red-500 rounded-md transition-colors border-l ml-1"
                                title={language === 'ar' ? 'إعادة ضبط' : 'Réinitialiser'}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <Printer className="w-4 h-4 text-blue-600" />
                            {language === 'ar' ? 'طباعة الكشف' : 'Imprimer Relevé'}
                        </button>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 font-bold text-gray-700 border-b text-xs uppercase">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                <th className="p-4 font-bold text-gray-700 border-b text-xs uppercase">{language === 'ar' ? 'البيان' : 'Description'}</th>
                                <th className="p-4 font-bold text-gray-700 border-b text-xs uppercase">{language === 'ar' ? 'المرجع' : 'Référence'}</th>
                                <th className="p-4 font-bold text-gray-700 border-b text-xs uppercase text-right">{language === 'ar' ? 'مدين' : 'Débit'}</th>
                                <th className="p-4 font-bold text-gray-700 border-b text-xs uppercase text-right">{language === 'ar' ? 'دائن' : 'Crédit'}</th>
                                <th className="p-4 font-bold text-gray-700 border-b text-xs uppercase text-right">{language === 'ar' ? 'الرصيد' : 'Solde'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="6" className="p-10 text-center text-gray-500">Chargement...</td></tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr><td colSpan="6" className="p-10 text-center text-gray-500">Aucune transaction trouvée</td></tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-sm font-medium">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                {tx.type === 'purchase' ? <ArrowUpRight className="w-4 h-4 text-red-500" /> :
                                                    tx.type === 'payment' ? <ArrowDownLeft className="w-4 h-4 text-green-500" /> :
                                                        null}
                                                {tx.description}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">{tx.reference}</td>
                                        <td className="p-4 text-sm font-bold text-red-600 text-right">
                                            {tx.debit > 0 ? tx.debit.toLocaleString('fr-DZ') : '-'}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-green-600 text-right">
                                            {tx.credit > 0 ? tx.credit.toLocaleString('fr-DZ') : '-'}
                                        </td>
                                        <td className="p-4 text-sm font-black text-blue-900 text-right bg-blue-50/30">
                                            {tx.balance_after.toLocaleString('fr-DZ')} DA
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary Footer */}
                <div className="p-4 bg-blue-900 text-white flex justify-between items-center">
                    <div className="flex gap-8">
                        <div>
                            <span className="text-xs uppercase text-blue-300 block">{language === 'ar' ? 'إجمالي المدين' : 'Total Débit'}</span>
                            <span className="text-xl font-bold">{totals.debit.toLocaleString('fr-DZ')} DA</span>
                        </div>
                        <div>
                            <span className="text-xs uppercase text-blue-300 block">{language === 'ar' ? 'إجمالي الدائن' : 'Total Crédit'}</span>
                            <span className="text-xl font-bold">{totals.credit.toLocaleString('fr-DZ')} DA</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs uppercase text-blue-300 block">{language === 'ar' ? 'الوضعية الحالية' : 'Situation Actuelle'}</span>
                        <span className="text-3xl font-black text-yellow-400">
                            {totals.currentBalance.toLocaleString('fr-DZ')} DA
                        </span>
                    </div>
                </div>
            </div>

            {/* Nested Payment Modal */}
            <SupplierPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    // Refresh ledger after payment
                    window.dispatchEvent(new CustomEvent('supplierUpdated'));
                }}
                supplier={supplier}
            />
        </div>
    );
}
