import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, X, Check, Wallet, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function CreateWorkerPaymentModal({ isOpen, onClose, onSave, payment }) {
    const { direction, t, language } = useLanguage();
    const [workers, setWorkers] = useState([]);
    const [formData, setFormData] = useState({
        worker_id: '',
        montant: '',
        date_paiement: new Date().toISOString().split('T')[0],
        mode_paiement: t('paymentMethod.cash') || 'Espèces',
        note: ''
    });

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const result = await window.electronAPI.workers.getAll();
                if (result.success) {
                    setWorkers(result.data);
                }
            } catch (error) {
                console.error('Error fetching workers:', error);
            }
        };
        if (isOpen) {
            fetchWorkers();
        }
    }, [isOpen]);

    useEffect(() => {
        if (payment && isOpen) {
            setFormData({
                worker_id: payment.worker_id.toString(),
                montant: payment.montant.toString(),
                date_paiement: payment.date_paiement,
                mode_paiement: payment.mode_paiement,
                note: payment.note || ''
            });
        } else if (!payment && isOpen) {
            setFormData({
                worker_id: '',
                montant: '',
                date_paiement: new Date().toISOString().split('T')[0],
                mode_paiement: t('paymentMethod.cash') || 'Espèces',
                note: ''
            });
        }
    }, [payment, isOpen, t]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!formData.worker_id || !formData.montant || !formData.date_paiement) {
            toast.error(t('common.fillRequiredFields') || 'Please fill all required fields');
            return;
        }

        onSave({
            ...formData,
            worker_id: parseInt(formData.worker_id),
            montant: parseFloat(formData.montant)
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`max-w-md bg-white p-0 border-0 shadow-xl rounded-lg ${direction === 'rtl' ? 'rtl' : ''}`}>
                <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                            <Wallet className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-slate-800">
                                {payment ? t('workerPayments.edit') : t('workerPayments.new')}
                            </DialogTitle>
                            <DialogDescription className="text-[10px] text-slate-500">
                                {t('workerPayments.subtitle')}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-5 space-y-4">
                    <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5 block flex items-center">
                            <User className="w-3 h-3 mr-1 text-slate-400" />
                            {t('workerPayments.worker')}
                        </Label>
                        <select
                            value={formData.worker_id}
                            onChange={(e) => handleInputChange('worker_id', e.target.value)}
                            className="w-full h-9 text-xs border border-slate-200 rounded-md px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                        >
                            <option value="">{t('common.select') || 'Select...'}</option>
                            {workers.map(worker => (
                                <option key={worker.id} value={worker.id}>{worker.nomPrenom}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                                {t('workerPayments.amount')}
                            </Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={formData.montant}
                                    onChange={(e) => handleInputChange('montant', e.target.value)}
                                    className="h-9 text-xs border border-slate-200 rounded-md px-3 bg-white pr-10"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-bold">DZD</span>
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                                {t('workerPayments.date')}
                            </Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={formData.date_paiement}
                                    onChange={(e) => handleInputChange('date_paiement', e.target.value)}
                                    className="h-9 text-xs border border-slate-200 rounded-md px-3 bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                            {t('workerPayments.method')}
                        </Label>
                        <div className="flex space-x-2">
                            {[t('paymentMethod.cash'), t('paymentMethod.bankCard'), t('paymentMethod.check'), 'Autre'].map((method) => (
                                method && (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => handleInputChange('mode_paiement', method)}
                                        className={`flex-1 py-1.5 px-2 text-[10px] rounded-md border transition-all ${formData.mode_paiement === method
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {method}
                                    </button>
                                )
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                            {t('workerPayments.note')}
                        </Label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => handleInputChange('note', e.target.value)}
                            className="w-full h-16 text-xs border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm resize-none"
                            placeholder={t('workerPayments.note') + '...'}
                        />
                    </div>

                    <div className="flex space-x-2 mt-2 pt-4 border-t border-slate-100">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 h-9 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md"
                        >
                            {t('common.cancel') || 'Cancel'}
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2"
                        >
                            <Check className="w-3.5 h-3.5" />
                            <span>{t('common.save') || 'Save'}</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
