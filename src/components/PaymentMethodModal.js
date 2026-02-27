import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Receipt, Plus, Trash2, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function PaymentMethodModal({ isOpen, onClose }) {
  const { direction, t, language } = useLanguage();
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', name: '', enabled: true },
    { id: '2', name: '', enabled: true },
    { id: '3', name: '', enabled: false },
    { id: '4', name: 'test', enabled: true },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');

  // Update payment method names when language changes
  useEffect(() => {
    setPaymentMethods(prev => [
      { ...prev[0], name: t('payment.cash') || 'Espèces' },
      { ...prev[1], name: t('payment.bankCard') || 'Carte Bancaire' },
      { ...prev[2], name: t('payment.check') || 'Chèque' },
      ...prev.slice(3)
    ]);
  }, [t]);

  const handleToggle = (id) => {
    setPaymentMethods(prev => prev.map(method =>
      method.id === id ? { ...method, enabled: !method.enabled } : method
    ));
  };

  const handleAdd = () => {
    if (!newMethodName.trim()) {
      toast.error(t('paymentMethod.error.nameRequired') || 'Name is required');
      return;
    }
    setPaymentMethods(prev => [...prev, {
      id: Date.now().toString(),
      name: newMethodName,
      enabled: true
    }]);
    setNewMethodName('');
    setIsAdding(false);
    toast.success(t('paymentMethod.success.added') || 'Added successfully');
  };

  const handleDelete = (id) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    toast.success(t('paymentMethod.success.deleted') || 'Deleted successfully');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-[360px] bg-white p-0 border-0 shadow-2xl rounded-2xl ${direction === 'rtl' ? 'rtl' : ''} overflow-hidden`}>
        <DialogHeader className="p-6 pb-2 relative flex flex-row items-start space-x-4 border-b border-transparent">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Receipt className="w-6 h-6 text-blue-500" strokeWidth={1.5} />
          </div>
          <div className="flex-1 mt-1">
            <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
              {t('settings.paymentMethods') || 'Payment Methods'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              {t('settings.paymentMethodsDesc') || 'Manage available payment methods'}
            </DialogDescription>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <div className="p-6 py-4">
          <div className="flex justify-end items-center mb-4">
            <button
              onClick={() => setIsAdding(true)}
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 flex items-center transition-colors px-2 py-1"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {t('common.add') || 'Add'}
            </button>
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
            {isAdding && (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 animate-in fade-in slide-in-from-top-2 duration-200">
                <Input
                  autoFocus
                  value={newMethodName}
                  onChange={(e) => setNewMethodName(e.target.value)}
                  placeholder={t('paymentMethod.name') || 'Method name'}
                  className="h-9 text-sm bg-white border-blue-100 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') setIsAdding(false);
                  }}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setIsAdding(false)} className="text-xs text-slate-500 hover:text-slate-700">
                    {t('common.cancel') || 'Cancel'}
                  </button>
                  <button onClick={handleAdd} className="text-xs font-bold text-blue-600 hover:text-blue-700 font-bold">
                    {t('common.save') || 'Save'}
                  </button>
                </div>
              </div>
            )}

            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={method.enabled}
                      onChange={() => handleToggle(method.id)}
                      className="peer w-4.5 h-4.5 rounded-md border-slate-300 text-blue-500 focus:ring-blue-500/20 cursor-pointer transition-all"
                    />
                  </div>
                  <span className={`text-sm font-medium transition-colors ${method.enabled ? 'text-slate-700' : 'text-slate-300 line-through'}`}>
                    {method.name}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(method.id)}
                  className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-end bg-slate-50/30">
          <button
            onClick={onClose}
            className="text-sm font-bold text-slate-800 hover:text-black transition-colors px-4 py-2"
          >
            {t('common.close') || 'Close'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

