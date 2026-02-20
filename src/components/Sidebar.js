import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  ShoppingCart,
  ShoppingBag,
  BarChart3,
  Settings,
  Building2,
  Languages,
  Smartphone,
  GraduationCap,
  Calendar,
  Wrench
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageModal from './LanguageModal';
import moussirLogo from '../assets/moussirlogo.png';

const getMenuItems = (t) => [
  { id: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard },
  { id: 'clients', label: t('sidebar.clients'), icon: Users },
  { id: 'suppliers', label: t('sidebar.suppliers'), icon: Truck },
  { id: 'products', label: t('sidebar.products'), icon: Package },
  { id: 'services', label: t('sidebar.services'), icon: Wrench },
  { id: 'sales', label: t('sidebar.sales'), icon: ShoppingCart },
  { id: 'purchases', label: t('sidebar.purchases'), icon: ShoppingBag },
  { id: 'reports', label: t('sidebar.reports'), icon: BarChart3 },
  { id: 'mobile-app', label: t('sidebar.mobileApp'), icon: Smartphone },
  { id: 'education', label: t('sidebar.education'), icon: GraduationCap },
  { id: 'planification', label: t('sidebar.planification') || 'Planification', icon: Calendar },
  { id: 'settings', label: t('sidebar.settings'), icon: Settings },
];

export default function Sidebar({ activeItem, onItemClick }) {
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const { t, direction } = useLanguage();

  const menuItems = getMenuItems(t);

  return (
    <div className={`sidebar-width h-screen fixed ${direction === 'rtl' ? 'right-0' : 'left-0'} top-0 shadow-lg ${direction === 'rtl' ? 'rtl' : ''} sidebar-container flex flex-col z-40`} style={{ backgroundColor: '#1b1b1b' }}>
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700 flex-shrink-0">
        <div className={`flex items-center justify-center ${direction === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
          <img
            src={moussirLogo}
            alt="Moussir 26 Logo"
            className="h-16 w-auto object-contain"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="px-4 flex-1 overflow-y-auto mt-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onItemClick(item.id)}
                  className={`w-full flex items-center ${direction === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'} px-4 py-3 rounded-xl transition-all duration-200 ${direction === 'rtl' ? 'text-right' : 'text-left'} group ${isActive
                    ? 'bg-white text-black shadow-lg transform scale-[1.02]'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="transition-colors sidebar-menu-text">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Language Button */}
      <div className="px-4 pb-6 flex-shrink-0">
        <button
          onClick={() => setIsLanguageModalOpen(true)}
          className={`w-full flex items-center ${direction === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'} px-4 py-3 rounded-xl transition-all duration-200 ${direction === 'rtl' ? 'text-right' : 'text-left'} group text-slate-300 hover:bg-slate-800 hover:text-white`}
        >
          <Languages className="w-5 h-5 text-slate-400 group-hover:text-slate-200" />
          <span className="transition-colors sidebar-menu-text">{t('sidebar.language')}</span>
        </button>
      </div>

      {/* Language Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />
    </div>
  );
}
