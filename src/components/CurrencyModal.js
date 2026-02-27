import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Coins, Check, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function CurrencyModal({ isOpen, onClose }) {
  const { direction, t, language, currency, setCurrency } = useLanguage();
  const [confirmCurrency, setConfirmCurrency] = useState(null);

  const currencies = [
    { code: 'DZD', name: t('currency.dzd'), symbol: 'د.ج' },
    { code: 'EUR', name: t('currency.eur'), symbol: '€' },
    { code: 'USD', name: t('currency.usd'), symbol: '$' },
    { code: 'MAD', name: t('currency.mad'), symbol: 'د.م' },
  ];

  const handleCurrencySelect = (selectedCurrency) => {
    // Check if user is admin. We use a fallback if no user is found, 
    // but typically we check localStorage for currentUser's type/role.
    try {
      const userJSON = localStorage.getItem('currentUser') || localStorage.getItem('user');
      if (userJSON) {
        const user = JSON.parse(userJSON);
        if (user.type !== 'Administrateur' && user.type !== 'admin' && user.role !== 'admin') {
          toast.error(language === 'ar' ? 'هذا الإجراء مسموح للمسؤولين فقط' : 'This action is restricted to admin users only.');
          return;
        }
      }
    } catch (e) { }

    setConfirmCurrency(selectedCurrency);
  };

  const handleConfirmReset = async () => {
    try {
      if (window.electronAPI && window.electronAPI.system && window.electronAPI.system.resetDatabase) {
        await window.electronAPI.system.resetDatabase(confirmCurrency);
      }
      setCurrency(confirmCurrency);
      toast.success(t('currency.changed') ? t('currency.changed').replace('{currency}', confirmCurrency) : `Currency changed to ${confirmCurrency}`);
      setConfirmCurrency(null);
      onClose();
      // Force reload to apply reset state across the app
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset database:', error);
      toast.error('Failed to reset database');
    }
  };

  const cancelConfirmation = () => {
    setConfirmCurrency(null);
  };

  const handleClose = () => {
    setConfirmCurrency(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-md bg-white p-0 border-0 shadow-xl ${direction === 'rtl' ? 'rtl' : ''}`} onClose={handleClose}>
        {confirmCurrency ? (
          <>
            <div className="p-6 bg-red-50 border-b border-red-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-700">
                  {t('currency.confirmReset.title') || 'Critical: Database Reset Required'}
                </h2>
              </div>
              <div className="text-red-900 space-y-3 leading-relaxed">
                <p className="font-semibold text-base">
                  {t('currency.confirmReset.message') || 'Changing the application currency requires a COMPLETE reset of the software database.'}
                </p>
                <div className="bg-red-100 p-3 rounded-md list-disc list-inside text-sm">
                  <p>All existing financial data will be permanently deleted:</p>
                  <ul className="list-none mt-2 space-y-1 font-medium">
                    <li>• Prices & Invoices</li>
                    <li>• Reports & Transactions</li>
                    <li>• Clients & Suppliers</li>
                  </ul>
                </div>
                <p className="font-bold text-red-700 border-l-4 border-red-500 pl-3 py-1">
                  This process is completely irreversible once confirmed.
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex items-center justify-end gap-3 rounded-b-lg">
              <Button variant="outline" onClick={cancelConfirmation} className="border-gray-300 text-gray-700 hover:bg-gray-100">
                {t('currency.cancel') || 'Cancel'}
              </Button>
              <Button onClick={handleConfirmReset} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6">
                {t('currency.confirmReset.confirm') || 'Confirm / Reset'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="p-6 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-amber-600" />
                </div>
                <DialogTitle className="text-xl" style={{ color: '#1b1b1b' }}>
                  {t('currency.title')}
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm text-slate-600 mt-2">
                {t('currency.subtitle')}
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 pt-2">
              <div className="space-y-3">
                {currencies.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => handleCurrencySelect(curr.code)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 hover:bg-slate-50 ${currency === curr.code
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <span className="text-2xl">{curr.symbol}</span>
                        <div className={`text-left ${direction === 'rtl' ? 'text-right' : ''}`}>
                          <p className="font-medium" style={{ color: '#1b1b1b' }}>
                            {curr.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {curr.code}
                          </p>
                        </div>
                      </div>
                      {currency === curr.code && (
                        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex items-center justify-end">
              <Button variant="outline" onClick={handleClose}>
                {t('common.cancel') || 'Cancel'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

