import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Crown, Calendar, Clock, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function SubscriptionModal({ isOpen, onClose, onOpenLifetimeSubscription }) {
  const { direction, t, language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 120,
    hours: 8,
    minutes: 44,
    seconds: 21
  });

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const progressPercentage = 65;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md ${direction === 'rtl' ? 'rtl' : ''}`} onClose={onClose}>
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="modal-header-icon">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="modal-header-title">
                  {t('subscription.title')}
                </DialogTitle>
                <DialogDescription className="modal-header-subtitle mt-1">
                  {t('subscription.subtitle')}
                </DialogDescription>
              </div>
            </div>
            <button onClick={onClose} className="modal-close-button">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-600" />
            </div>
            
            <h3 className="text-lg mb-2" style={{ color: '#1b1b1b' }}>
              {t('subscription.trialPeriod')}
            </h3>
            <p className="text-slate-600 mb-4">
              {t('subscription.daysRemaining').replace('{days}', timeLeft.days)}
            </p>
            
            <div className="mb-2">
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-slate-500">{progressPercentage}% {t('subscription.remaining')}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-600">{t('subscription.timeRemaining')}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl mb-1" style={{ color: '#1b1b1b' }}>{timeLeft.days}</div>
                <div className="text-xs text-slate-500">{t('sidebar.days')}</div>
              </div>
              <div>
                <div className="text-2xl mb-1" style={{ color: '#1b1b1b' }}>{timeLeft.hours}</div>
                <div className="text-xs text-slate-500">{t('notifications.hours')}</div>
              </div>
              <div>
                <div className="text-2xl mb-1" style={{ color: '#1b1b1b' }}>{timeLeft.minutes}</div>
                <div className="text-xs text-slate-500">{t('notifications.minutes')}</div>
              </div>
              <div>
                <div className="text-2xl mb-1" style={{ color: '#1b1b1b' }}>{timeLeft.seconds}</div>
                <div className="text-xs text-slate-500">{t('sidebar.seconds')}</div>
              </div>
            </div>
          </div>

          {onOpenLifetimeSubscription && (
            <Button 
              className="w-full h-12 bg-slate-800 hover:bg-slate-900 text-white mb-6"
              onClick={() => {
                onOpenLifetimeSubscription();
                onClose();
              }}
            >
              <Crown className="w-4 h-4 mr-2" />
              {t('subscription.upgradeToLifetime')}
            </Button>
          )}

          <div>
            <h4 className="text-sm mb-3" style={{ color: '#1b1b1b' }}>
              {t('subscription.planIncludes')}
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-slate-600">
                <div className="w-2 h-2 bg-slate-800 rounded-full mr-3"></div>
                {t('subscription.unlimitedProducts')}
              </li>
              <li className="flex items-center text-sm text-slate-600">
                <div className="w-2 h-2 bg-slate-800 rounded-full mr-3"></div>
                {t('subscription.technicalSupport')}
              </li>
              <li className="flex items-center text-sm text-slate-600">
                <div className="w-2 h-2 bg-slate-800 rounded-full mr-3"></div>
                {t('subscription.freeUpdates')}
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

