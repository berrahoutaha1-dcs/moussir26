import React, { useState, useEffect } from 'react';
import { X, Bell, AlertTriangle, Clock, Info, Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotificationsModal({ isOpen, onClose, onCountChange }) {
  const { direction, t } = useLanguage();
  const [stockAlerts, setStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      if (window.electronAPI?.batches?.getAll) {
        const result = await window.electronAPI.batches.getAll();
        if (result.success && result.data) {
          // Filter batches where stock quantity is at or below the alert threshold
          const alerts = result.data.filter(
            (b) => b.alert_quantity > 0 && b.quantity <= b.alert_quantity
          );
          setStockAlerts(alerts);
          // Notify parent of alert count
          if (onCountChange) onCountChange(alerts.length);
        }
      }
    } catch (err) {
      console.error('Error loading stock alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  // Determine severity based on how far below the threshold the stock is
  const getSeverity = (batch) => {
    const ratio = batch.quantity / batch.alert_quantity;
    if (batch.quantity === 0) return 'critical';
    if (ratio <= 0.5) return 'critical';
    return 'warning';
  };

  const getStyle = (severity) => {
    if (severity === 'critical')
      return {
        border: 'border-red-300',
        bg: 'bg-red-50',
        iconColor: 'text-red-600',
        textColor: 'text-red-900',
        badge: 'bg-red-100 text-red-700',
        badgeText: 'Critique',
      };
    return {
      border: 'border-amber-300',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-900',
      badge: 'bg-amber-100 text-amber-700',
      badgeText: 'Avertissement',
    };
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
                {t('notifications.title') || 'Notifications'}
              </h2>
              <p className="text-sm text-slate-600">
                {loading
                  ? 'Chargement...'
                  : stockAlerts.length > 0
                    ? `${stockAlerts.length} alerte(s) de stock détectée(s)`
                    : 'Aucune alerte de stock'}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm">Analyse des stocks en cours…</p>
            </div>
          ) : stockAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <Package className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-slate-700 font-semibold text-lg">Tous les stocks sont OK</p>
                <p className="text-slate-400 text-sm mt-1">
                  Aucun lot n'est en dessous de son seuil d'alerte.
                </p>
              </div>
            </div>
          ) : (
            stockAlerts.map((batch) => {
              const severity = getSeverity(batch);
              const style = getStyle(severity);
              const Icon = severity === 'critical' ? AlertTriangle : Clock;
              const deficit = batch.alert_quantity - batch.quantity;

              return (
                <div
                  key={batch.id}
                  className={`p-4 rounded-xl border ${style.border} ${style.bg} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}
                    >
                      <Icon className={`w-5 h-5 ${style.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className={`font-bold text-sm ${style.textColor}`}>
                          {batch.designation || `Lot ${batch.num_lot}`}
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${style.badge}`}
                        >
                          {style.badgeText}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Lot <span className="font-mono font-bold">{batch.num_lot}</span> — Stock
                        actuel :{' '}
                        <span className={`font-bold ${style.iconColor}`}>{batch.quantity}</span>{' '}
                        unité(s) — Seuil :{' '}
                        <span className="font-bold">{batch.alert_quantity}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Déficit de <strong>{deficit}</strong> unité(s) pour atteindre le seuil
                        {batch.expiry_date && (
                          <>
                            {' '}
                            · Péremption :{' '}
                            <span className="font-semibold">
                              {new Date(batch.expiry_date).toLocaleDateString('fr-DZ')}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Mini progress bar */}
                  <div className="mt-3 ml-14">
                    <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${severity === 'critical' ? 'bg-red-500' : 'bg-amber-400'
                          }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((batch.quantity / batch.alert_quantity) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {Math.round((batch.quantity / batch.alert_quantity) * 100)}% du seuil
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
          >
            {t('common.close') || 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
}
