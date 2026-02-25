import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Receipt, Plus, Trash2, Edit, Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function PaymentMethodModal({ isOpen, onClose }) {
  const { direction, t, language } = useLanguage();
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', name: '', enabled: true },
    { id: '2', name: '', enabled: true },
    { id: '3', name: '', enabled: false },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');

  // Update payment method names when language changes
  useEffect(() => {
    setPaymentMethods(prev => [
      { ...prev[0], name: t('payment.cash') },
      { ...prev[1], name: t('payment.bankCard') },
      { ...prev[2], name: t('payment.check') },
    ]);
  }, [t]);

  const handleToggle = (id) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === id ? { ...method, enabled: !method.enabled } : method
    ));
  };

  const handleAdd = () => {
    if (!newMethodName.trim()) {
      toast.error(t('paymentMethod.error.nameRequired'));
      return;
    }
    setPaymentMethods(prev => [...prev, {
      id: Date.now().toString(),
      name: newMethodName,
      enabled: true
    }]);
    setNewMethodName('');
    setIsAdding(false);
    toast.success(t('paymentMethod.success.added'));
  };

  const handleDelete = (id) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    toast.success(t('paymentMethod.success.deleted'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md bg-white p-0 border-0 shadow-xl ${direction === 'rtl' ? 'rtl' : ''}`} onClose={onClose}>
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-indigo-600" />
            </div>
            <DialogTitle className="text-xl" style={{ color: '#1b1b1b' }}>
              {t('payment.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-600 mt-2">
            {t('payment.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {t('payment.add')}
            </Button>
          </div>

          {isAdding && (
            <div className="mb-4 p-4 bg-slate-50 rounded-lg">
              <Label>{t('payment.methodName')}</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newMethodName}
                  onChange={(e) => setNewMethodName(e.target.value)}
                  placeholder={t('payment.methodNamePlaceholder')}
                />
                <Button onClick={handleAdd} size="sm">
                  <Save className="w-4 h-4" />
                </Button>
                <Button onClick={() => { setIsAdding(false); setNewMethodName(''); }} variant="outline" size="sm">
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={method.enabled}
                    onChange={() => handleToggle(method.id)}
                    className="w-4 h-4"
                  />
                  <span className={method.enabled ? 'text-slate-900' : 'text-slate-400'}>
                    {method.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(method.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex items-center justify-end">
          <Button onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

