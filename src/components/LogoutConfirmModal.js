import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { LogOut, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  const { direction, t, language } = useLanguage();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md bg-white p-0 border-0 shadow-xl ${direction === 'rtl' ? 'rtl' : ''}`} onClose={onClose}>
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl" style={{ color: '#1b1b1b' }}>
              {t('logout.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-600 mt-2">
            {t('logout.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              {t('logout.warning')}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white">
            <LogOut className="w-4 h-4 mr-2" />
            {t('logout.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

