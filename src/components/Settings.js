import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  User,
  Users,
  Briefcase,
  FolderOpen,
  CreditCard,
  Lock,
  Pencil,
  DollarSign,
  ChevronRight,
  Receipt,
  Printer,
  LogOut,
  Headphones,
  Coins
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SubscriptionModal from './SubscriptionModal';
import UserInfoModal from './UserInfoModal';
import ChangePasswordModal from './ChangePasswordModal';
import ChangeUsernameModal from './ChangeUsernameModal';
import PaymentMethodModal from './PaymentMethodModal';
import CurrencyModal from './CurrencyModal';
import LogoutConfirmModal from './LogoutConfirmModal';
import UsersModal from './UsersModal';
import WorkersModal from './WorkersModal';
import PrintersModal from './PrintersModal';
import WorkerPaymentsModal from './WorkerPaymentsModal';

export default function Settings({ onLogout }) {
  const { t, direction } = useLanguage();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isChangeUsernameModalOpen, setIsChangeUsernameModalOpen] = useState(false);
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isLogoutConfirmModalOpen, setIsLogoutConfirmModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isWorkersModalOpen, setIsWorkersModalOpen] = useState(false);
  const [isPrintersModalOpen, setIsPrintersModalOpen] = useState(false);
  const [isWorkerPaymentsModalOpen, setIsWorkerPaymentsModalOpen] = useState(false);

  const settingsItems = [
    {
      id: 'profile',
      title: t('settings.myInfo'),
      description: t('settings.myInfoDesc'),
      icon: User,
      color: '#3b82f6',
    },
    {
      id: 'users',
      title: t('settings.users'),
      description: t('settings.usersDesc'),
      icon: Users,
      color: '#10b981',
    },
    {
      id: 'workers',
      title: t('settings.workers'),
      description: t('settings.workersDesc'),
      icon: Briefcase,
      color: '#8b5cf6',
    },
    {
      id: 'payment-workers',
      title: t('settings.paymentWorkers') || 'Paiement Personnel',
      description: t('settings.paymentWorkersDesc') || 'Gérer les paiements du personnel',
      icon: DollarSign,
      color: '#059669',
    },
    {
      id: 'payment-methods',
      title: t('settings.paymentMethods'),
      description: t('settings.paymentMethodsDesc'),
      icon: Receipt,
      color: '#6366f1',
    },
    {
      id: 'printers',
      title: t('settings.printers') || 'Imprimantes',
      description: t('settings.printersDesc') || 'Gérer les imprimantes du système',
      icon: Printer,
      color: '#7c3aed',
    },
    {
      id: 'currency',
      title: t('settings.currency') || 'Devise',
      description: t('settings.currencyDesc') || 'Changer la devise de l\'application',
      icon: Coins,
      color: '#f59e0b',
    },
    {
      id: 'subscription',
      title: t('settings.subscription'),
      description: t('settings.subscriptionDesc'),
      icon: CreditCard,
      color: '#ef4444',
    },
    {
      id: 'change-password',
      title: t('settings.changePassword'),
      description: t('settings.changePasswordDesc'),
      icon: Lock,
      color: '#06b6d4',
    },
    {
      id: 'change-username',
      title: t('settings.changeUsername') || 'Changer le nom d\'utilisateur',
      description: t('settings.changeUsernameDesc') || 'Modifier votre nom d\'utilisateur',
      icon: Pencil,
      color: '#84cc16',
    },
    {
      id: 'support-plans',
      title: t('settings.supportPlans') || 'Demande de mise à jour personnalisée',
      description: t('settings.supportPlansDesc') || 'Plans d\'assistance technique et mises à jour',
      icon: Headphones,
      color: '#6366f1',
    },
    {
      id: 'logout',
      title: t('settings.logout'),
      description: t('settings.logoutDesc'),
      icon: LogOut,
      color: '#dc2626',
    },
  ];

  const handleSettingClick = (settingId) => {
    switch (settingId) {
      case 'subscription':
        setIsSubscriptionModalOpen(true);
        break;
      case 'profile':
        setIsUserInfoModalOpen(true);
        break;
      case 'change-password':
        setIsChangePasswordModalOpen(true);
        break;
      case 'change-username':
        setIsChangeUsernameModalOpen(true);
        break;
      case 'payment-methods':
        setIsPaymentMethodModalOpen(true);
        break;
      case 'currency':
        setIsCurrencyModalOpen(true);
        break;
      case 'logout':
        setIsLogoutConfirmModalOpen(true);
        break;
      case 'users':
        setIsUsersModalOpen(true);
        break;
      case 'workers':
        setIsWorkersModalOpen(true);
        break;
      case 'printers':
        setIsPrintersModalOpen(true);
        break;
      case 'payment-workers':
        setIsWorkerPaymentsModalOpen(true);
        break;
      case 'support-plans':
        // TODO: Implement SupportPlansModal
        console.log('Support Plans modal not yet implemented');
        break;
      default:
        console.log(`Opening ${settingId} settings`);
    }
  };

  const handleLogoutConfirm = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className={`p-8 bg-slate-50 min-h-screen ${direction === 'rtl' ? 'rtl' : ''}`}>
      <div className={`mb-8 ${direction === 'rtl' ? 'text-right' : ''}`}>
        <h1 className="text-3xl mb-2" style={{ color: '#1b1b1b' }}>{t('settings.title') || 'Paramètres'}</h1>
        <p className="text-slate-600">{t('settings.subtitle') || 'Configurez et personnalisez votre application'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-white group"
              onClick={() => handleSettingClick(item.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>

                <div>
                  <h3 className="text-lg mb-2 group-hover:text-opacity-80 transition-colors" style={{ color: '#1b1b1b' }}>
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Info */}
      <div className="mt-8">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className={`text-lg ${direction === 'rtl' ? 'text-right' : ''}`} style={{ color: '#1b1b1b' }}>
              {t('settings.systemInfo') || 'Informations système'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className={`${direction === 'rtl' ? 'text-right' : ''}`}>
                <p className="text-slate-500 mb-1">{t('settings.appVersion') || 'Version de l\'application'}</p>
                <p className="text-slate-900">Moussir 26 v2.1.0</p>
              </div>
              <div className={`${direction === 'rtl' ? 'text-right' : ''}`}>
                <p className="text-slate-500 mb-1">{t('settings.licenseType') || 'Type de licence'}</p>
                <p className="text-slate-900">{t('settings.licenseValue')}</p>
              </div>
              <div className={`${direction === 'rtl' ? 'text-right' : ''}`}>
                <p className="text-slate-500 mb-1">{t('settings.lastUpdate') || 'Dernière mise à jour'}</p>
                <p className="text-slate-900">15 Décembre 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      <UserInfoModal
        isOpen={isUserInfoModalOpen}
        onClose={() => setIsUserInfoModalOpen(false)}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />

      <ChangeUsernameModal
        isOpen={isChangeUsernameModalOpen}
        onClose={() => setIsChangeUsernameModalOpen(false)}
      />

      <PaymentMethodModal
        isOpen={isPaymentMethodModalOpen}
        onClose={() => setIsPaymentMethodModalOpen(false)}
      />

      <CurrencyModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
      />

      <LogoutConfirmModal
        isOpen={isLogoutConfirmModalOpen}
        onClose={() => setIsLogoutConfirmModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />

      <UsersModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
      />

      <WorkersModal
        isOpen={isWorkersModalOpen}
        onClose={() => setIsWorkersModalOpen(false)}
      />

      <PrintersModal
        isOpen={isPrintersModalOpen}
        onClose={() => setIsPrintersModalOpen(false)}
      />

      <WorkerPaymentsModal
        isOpen={isWorkerPaymentsModalOpen}
        onClose={() => setIsWorkerPaymentsModalOpen(false)}
      />
    </div>
  );
}

