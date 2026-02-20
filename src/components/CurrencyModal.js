import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Coins, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function CurrencyModal({ isOpen, onClose }) {
  const { direction, t, language, currency, setCurrency } = useLanguage();

  const currencies = [
    { code: 'DZD', name: t('currency.dzd'), symbol: 'د.ج' },
    { code: 'EUR', name: t('currency.eur'), symbol: '€' },
    { code: 'USD', name: t('currency.usd'), symbol: '$' },
    { code: 'MAD', name: t('currency.mad'), symbol: 'د.م' },
  ];

  const handleCurrencySelect = (selectedCurrency) => {
    setCurrency(selectedCurrency);
    toast.success(t('currency.changed').replace('{currency}', selectedCurrency));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md bg-white p-0 border-0 shadow-xl ${direction === 'rtl' ? 'rtl' : ''}`} onClose={onClose}>
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

        <div className="p-6">
          <div className="space-y-3">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencySelect(curr.code)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 hover:bg-slate-50 ${
                  currency === curr.code
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
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

