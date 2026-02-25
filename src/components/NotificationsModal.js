import React from 'react';
import { X, Bell, AlertTriangle, Clock, Info, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotificationsModal({ isOpen, onClose }) {
  const { direction, t } = useLanguage();

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Mock data for notifications
  const notifications = [
    {
      id: 1,
      type: 'critical',
      icon: AlertTriangle,
      title: t('notifications.stockCritical'),
      message: 'Smartphone Samsung Galaxy - ' + t('notifications.stockMessage').replace('{count}', '2'),
      time: '10 ' + t('notifications.minutes') + ' ' + t('notifications.ago'),
      priority: 'high'
    },
    {
      id: 2,
      type: 'warning',
      icon: Clock,
      title: t('notifications.subscriptionExpiring'),
      message: t('notifications.subscriptionMessage').replace('{days}', '7').replace('{plan}', 'Plan Professionnel'),
      time: '1 ' + t('notifications.hour') + ' ' + t('notifications.ago'),
      priority: 'medium'
    },
    {
      id: 3,
      type: 'info',
      icon: Info,
      title: t('notifications.updateAvailable'),
      message: t('notifications.updateMessage').replace('{version}', '2.1.0'),
      time: '1 ' + t('notifications.day') + ' ' + t('notifications.ago'),
      priority: 'low'
    },
    {
      id: 6,
      type: 'critical',
      icon: Clock,
      title: 'Rupture de stock imminente',
      message: 'Imprimante HP LaserJet - Stock restant: 1 unité.',
      time: '3 ' + t('notifications.hours') + ' ' + t('notifications.ago'),
      priority: 'high'
    },
    {
      id: 7,
      type: 'critical',
      icon: AlertTriangle,
      title: 'Alerte Stock Bas',
      message: 'Scanner Canon LiDE 300 - Stock restant: 5 unités.',
      time: '4 ' + t('notifications.hours') + ' ' + t('notifications.ago'),
      priority: 'high'
    },
  ];

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'critical':
        return {
          border: 'border-red-300',
          bg: 'bg-red-50',
          iconColor: 'text-red-600',
          textColor: 'text-red-900'
        };
      case 'warning':
        return {
          border: 'border-yellow-300',
          bg: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-900'
        };
      case 'info':
        return {
          border: 'border-blue-300',
          bg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-900'
        };
      default:
        return {
          border: 'border-slate-300',
          bg: 'bg-slate-50',
          iconColor: 'text-slate-600',
          textColor: 'text-slate-900'
        };
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: '#1b1b1b' }}>
                {t('notifications.title')}
              </h2>
              <p className="text-sm text-slate-600">
                {notifications.length} {t('common.notification')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            const style = getNotificationStyle(notification.type);

            return (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${style.border} ${style.bg} transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.bg}`}>
                    <Icon className={`w-5 h-5 ${style.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${style.textColor}`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

