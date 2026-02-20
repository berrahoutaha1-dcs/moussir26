import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import SalesCharts from './SalesCharts';
import NotificationsModal from './NotificationsModal';
import { Users, Truck, AlertCircle, ShoppingBag, ShoppingCart, CreditCard, Bell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../utils/currency';
import apiService from '../services/api';

export default function Dashboard() {
  const { t, direction, currency } = useLanguage();
  console.log('Dashboard updated with new stat cards');
  const [notificationCount, setNotificationCount] = useState(11);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [stats, setStats] = useState([
    {
      title: t('dashboard.totalCustomers'),
      value: '0',
      icon: Users,
      color: '#10b981',
      trend: { value: '0%', isPositive: true }
    },
    {
      title: t('sidebar.suppliers'),
      value: '0',
      icon: Truck,
      color: '#3b82f6',
      trend: { value: '0%', isPositive: true }
    },
    {
      title: t('dashboard.totalDebts'),
      value: formatCurrency(0, currency),
      icon: AlertCircle,
      color: '#ef4444',
      trend: { value: '0%', isPositive: false }
    },
    {
      title: t('dashboard.totalSuppliersDebts'),
      value: formatCurrency(0, currency),
      icon: CreditCard,
      color: '#f43f5e',
      trend: { value: '0%', isPositive: false }
    },
    {
      title: t('dashboard.todayPurchases'),
      value: formatCurrency(0, currency),
      icon: ShoppingBag,
      color: '#f59e0b',
      trend: { value: '0%', isPositive: true }
    },
    {
      title: t('dashboard.todaySales'),
      value: formatCurrency(0, currency),
      icon: ShoppingCart,
      color: '#14b8a6',
      trend: { value: '0%', isPositive: true }
    },
    {
      title: t('dashboard.totalExpenses'),
      value: formatCurrency(0, currency),
      icon: CreditCard,
      color: '#8b5cf6',
      trend: { value: '0%', isPositive: false }
    },
  ]);

  useEffect(() => {
    loadDashboardStats();
  }, [currency, t]);

  const loadDashboardStats = async () => {
    try {
      const result = await apiService.getDashboardStats();
      if (result.success && result.data) {
        const data = result.data;
        setStats([
          {
            title: t('dashboard.totalCustomers'),
            value: data.totalCustomers?.toLocaleString() || '0',
            icon: Users,
            color: '#10b981',
            trend: { value: '12%', isPositive: true }
          },
          {
            title: t('sidebar.suppliers'),
            value: data.totalSuppliers?.toLocaleString() || '0',
            icon: Truck,
            color: '#3b82f6',
            trend: { value: '3%', isPositive: true }
          },
          {
            title: t('dashboard.totalDebts'),
            value: formatCurrency(data.totalDebts || 0, currency),
            icon: AlertCircle,
            color: '#ef4444',
            trend: { value: '8%', isPositive: false }
          },
          {
            title: t('dashboard.totalSuppliersDebts'),
            value: formatCurrency(data.totalSuppliersDebts || 0, currency),
            icon: CreditCard,
            color: '#f43f5e',
            trend: { value: '2%', isPositive: false }
          },
          {
            title: t('dashboard.todayPurchases'),
            value: formatCurrency(data.todayPurchases || 0, currency),
            icon: ShoppingBag,
            color: '#f59e0b',
            trend: { value: '22%', isPositive: true }
          },
          {
            title: t('dashboard.todaySales'),
            value: formatCurrency(data.todaySales || 0, currency),
            icon: ShoppingCart,
            color: '#14b8a6',
            trend: { value: '18%', isPositive: true }
          },
          {
            title: t('dashboard.totalExpenses'),
            value: formatCurrency(data.totalExpenses || 0, currency),
            icon: CreditCard,
            color: '#8b5cf6',
            trend: { value: '5%', isPositive: false }
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const handleNotificationsClick = () => {
    setIsNotificationsOpen(true);
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
  };


  return (
    <div className={`p-8 bg-slate-50 min-h-screen ${direction === 'rtl' ? 'rtl' : ''}`}>
      {/* Header with Notifications Button */}
      <div className={`mb-8 flex items-start justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
        <div className={`${direction === 'rtl' ? 'text-right' : ''}`}>
          <h1 className="text-3xl mb-2" style={{ color: '#1b1b1b' }}>{t('dashboard.title')}</h1>
          <p className="text-slate-600">{t('dashboard.subtitle')}</p>
        </div>

        {/* Notifications Button */}
        <div className={`${direction === 'rtl' ? 'ml-4' : 'mr-4'} mt-1`}>
          <button
            onClick={handleNotificationsClick}
            className={`flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-400 rounded-md hover:bg-gray-200 hover:border-gray-500 transition-all duration-200 shadow-sm ${direction === 'rtl' ? 'flex-row-reverse' : ''
              }`}
          >
            <div className="relative">
              <Bell className="w-4 h-4 text-gray-700" />
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </div>
              )}
            </div>
            <span className="text-gray-800 font-medium text-sm">
              {t('common.notifications')}
            </span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Sales Charts */}
      <div className="mb-8">
        <SalesCharts />
      </div>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={handleCloseNotifications}
      />
    </div>
  );
}

