import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, ChevronUp, ChevronDown, Trash2, Search, Wallet } from 'lucide-react';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import CreateWorkerPaymentModal from './CreateWorkerPaymentModal';
import { toast } from 'sonner';

export default function WorkerPaymentsModal({ isOpen, onClose }) {
    const { direction, t, language } = useLanguage();
    const [payments, setPayments] = useState([]);
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [sortField, setSortField] = useState('date_paiement');
    const [sortDirection, setSortDirection] = useState('desc');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPayments = async () => {
        try {
            const result = await window.electronAPI.workerPayments.getAll();
            if (result.success) {
                setPayments(result.data);
            }
        } catch (error) {
            console.error('Error fetching worker payments:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchPayments();
            setSelectedPayments([]);
            setSearchTerm('');
        }
    }, [isOpen]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleSelect = (id) => {
        setSelectedPayments(prev =>
            prev.includes(id)
                ? prev.filter(pId => pId !== id)
                : [...prev, id]
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedPayments(payments.map(p => p.id));
        } else {
            setSelectedPayments([]);
        }
    };

    const handleNewPayment = () => {
        setEditingPayment(null);
        setIsPaymentModalOpen(true);
    };

    const handleEditPayment = () => {
        if (selectedPayments.length === 1) {
            const payment = payments.find(p => p.id === selectedPayments[0]);
            if (payment) {
                setEditingPayment(payment);
                setIsPaymentModalOpen(true);
            }
        }
    };

    const handleSavePayment = async (paymentData) => {
        try {
            let result;
            if (editingPayment) {
                result = await window.electronAPI.workerPayments.update(editingPayment.id, paymentData);
            } else {
                result = await window.electronAPI.workerPayments.create(paymentData);
            }

            if (result.success) {
                toast.success(editingPayment ? t('workerPayments.success.updated') : t('workerPayments.success.added'));
                fetchPayments();
                setIsPaymentModalOpen(false);
                setEditingPayment(null);
            } else {
                toast.error('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving payment:', error);
            toast.error('Failed to save payment: ' + (error.message || error));
        }
    };

    const handleDeletePayments = async () => {
        if (selectedPayments.length > 0) {
            if (window.confirm(t('workerPayments.confirmDelete').replace('{count}', selectedPayments.length))) {
                try {
                    for (const id of selectedPayments) {
                        await window.electronAPI.workerPayments.delete(id);
                    }
                    setSelectedPayments([]);
                    fetchPayments();
                    toast.success(t('workerPayments.success.deleted'));
                } catch (error) {
                    console.error('Error deleting payments:', error);
                    toast.error('Failed to delete payments');
                }
            }
        }
    };

    const filteredPayments = payments.filter(p =>
        p.worker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mode_paiement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.note?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedPayments = [...filteredPayments].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <ChevronUp className="w-2 h-2 text-blue-200 opacity-50" />;
        return sortDirection === 'asc'
            ? <ChevronUp className="w-2 h-2 text-white" />
            : <ChevronDown className="w-2 h-2 text-white" />;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className={`bg-white p-0 border-0 shadow-xl rounded-lg ${direction === 'rtl' ? 'rtl' : ''}`} style={{ width: '20cm', height: '15cm', maxWidth: '20cm', maxHeight: '15cm' }}>
                    <DialogHeader className="px-3 py-2 relative border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                    <Wallet className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <DialogTitle className="text-sm text-blue-600 mb-0">
                                        {t('workerPayments.title')}
                                    </DialogTitle>
                                    <DialogDescription className="text-[10px] text-slate-500">
                                        {t('workerPayments.subtitle')}
                                    </DialogDescription>
                                </div>
                            </div>

                            <div className="flex space-x-1">
                                <div className="relative mr-2">
                                    <Search className={`absolute ${direction === 'rtl' ? 'right-2' : 'left-2'} top-2 w-3 h-3 text-slate-400`} />
                                    <Input
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={t('common.search')}
                                        className={`h-7 text-xs ${direction === 'rtl' ? 'pr-7' : 'pl-7'} w-40 bg-slate-50 border-slate-200 focus:bg-white`}
                                    />
                                </div>
                                <Button onClick={onClose} size="sm" className="px-2 h-7 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 border-0">
                                    {t('common.close') || 'Close'}
                                </Button>
                                <Button
                                    onClick={handleDeletePayments}
                                    disabled={selectedPayments.length === 0}
                                    size="sm"
                                    className="px-2 h-7 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md disabled:opacity-50"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    {t('workerPayments.delete')}
                                </Button>
                                <Button
                                    onClick={handleEditPayment}
                                    disabled={selectedPayments.length !== 1}
                                    size="sm"
                                    className="px-2 h-7 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50"
                                >
                                    {t('common.edit') || 'Edit'}
                                </Button>
                                <Button
                                    onClick={handleNewPayment}
                                    size="sm"
                                    className="px-2 h-7 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center"
                                >
                                    <Plus className="w-3 h-3 mr-1" />
                                    {t('workerPayments.new')}
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-3 flex flex-col" style={{ height: 'calc(15cm - 100px)' }}>
                        <div className="border border-slate-200 rounded-md overflow-hidden flex flex-col flex-1">
                            <div className="overflow-auto flex-1 h-0">
                                <Table className="table-fixed w-full">
                                    <TableHeader className="sticky top-0 z-10">
                                        <TableRow className="bg-blue-600 hover:bg-blue-600 border-0">
                                            <TableHead className="w-[40px] text-center py-1.5 border-0">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-white bg-white w-3 h-3"
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                    checked={selectedPayments.length === sortedPayments.length && sortedPayments.length > 0}
                                                />
                                            </TableHead>
                                            <TableHead className="text-white py-1.5 border-0 text-xs w-[140px] cursor-pointer" onClick={() => handleSort('worker_name')}>
                                                <div className="flex items-center space-x-1">
                                                    <span>{t('workerPayments.worker')}</span>
                                                    <SortIcon field="worker_name" />
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-white py-1.5 border-0 text-xs w-[100px] cursor-pointer" onClick={() => handleSort('date_paiement')}>
                                                <div className="flex items-center space-x-1">
                                                    <span>{t('workerPayments.date')}</span>
                                                    <SortIcon field="date_paiement" />
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-white py-1.5 border-0 text-xs w-[100px] cursor-pointer" onClick={() => handleSort('mode_paiement')}>
                                                <div className="flex items-center space-x-1">
                                                    <span>{t('workerPayments.method')}</span>
                                                    <SortIcon field="mode_paiement" />
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-white py-1.5 border-0 text-xs w-[130px]">
                                                <span>{t('workerPayments.note')}</span>
                                            </TableHead>
                                            <TableHead className={`text-white py-1.5 border-0 text-xs w-[110px] cursor-pointer ${direction === 'rtl' ? 'text-left' : 'text-right'}`} onClick={() => handleSort('montant')}>
                                                <div className={`flex items-center ${direction === 'rtl' ? 'justify-start' : 'justify-end'} space-x-1`}>
                                                    <span>{t('workerPayments.amount')}</span>
                                                    <SortIcon field="montant" />
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedPayments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                                                    {t('workerPayments.noPayments')}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            sortedPayments.map((payment) => (
                                                <TableRow
                                                    key={payment.id}
                                                    className={`hover:bg-blue-50/50 cursor-pointer border-b border-slate-100 group transition-colors ${selectedPayments.includes(payment.id) ? 'bg-blue-50' : 'bg-white'
                                                        }`}
                                                    onClick={() => handleSelect(payment.id)}
                                                >
                                                    <TableCell className="text-center py-1.5 w-[40px]">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded w-3 h-3"
                                                            checked={selectedPayments.includes(payment.id)}
                                                            onChange={() => handleSelect(payment.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="py-1.5 text-slate-900 font-medium text-[11px] w-[140px]">
                                                        {payment.worker_name}
                                                    </TableCell>
                                                    <TableCell className="py-1.5 text-slate-600 text-[11px] w-[100px]">
                                                        {payment.date_paiement}
                                                    </TableCell>
                                                    <TableCell className="py-1.5 text-slate-600 text-[11px] w-[100px]">
                                                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 text-[10px]">
                                                            {payment.mode_paiement}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-1.5 text-slate-500 text-[10px] w-[130px] truncate italic">
                                                        {payment.note || '-'}
                                                    </TableCell>
                                                    <TableCell className={`py-1.5 font-bold text-blue-600 text-[11px] ${direction === 'rtl' ? 'text-left' : 'text-right'} w-[110px]`}>
                                                        {formatCurrency(payment.montant)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className={`mt-3 flex justify-between items-center px-2 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            <div>
                                {t('workers.total').replace('{count}', sortedPayments.length).replace('{plural}', sortedPayments.length > 1 ? (language === 'ar' ? 'ين' : 's') : '')}
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-slate-500 font-normal">{t('workerPayments.total').split(':')[0]}:</span>
                                <span className="text-lg text-blue-700">
                                    {formatCurrency(sortedPayments.reduce((total, p) => total + (p.montant || 0), 0))} {language === 'ar' ? 'د.ج' : 'DZD'}
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <CreateWorkerPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setEditingPayment(null);
                }}
                onSave={handleSavePayment}
                payment={editingPayment}
            />
        </>
    );
}
