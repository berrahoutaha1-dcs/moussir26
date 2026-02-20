import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Education from './components/Education';
import MobileApp from './components/MobileApp';
import ProductsStock from './components/ProductsStock';
import Services from './components/Services';
import Purchases from './components/Purchases';
import Sales from './components/Sales';
import Clients from './components/Clients';
import Suppliers from './components/Suppliers';
import Planification from './components/Planification';
import ChatSupport from './components/ChatSupport';
import { Toaster } from './components/ui/sonner';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [isVenteComptoirOpen, setIsVenteComptoirOpen] = useState(false);
  const { direction, t } = useLanguage();

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveMenuItem('dashboard');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className={`flex bg-slate-50 h-screen overflow-hidden ${direction === 'rtl' ? 'rtl' : ''}`}>
      <Sidebar
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
      />

      <div className={`flex-1 overflow-y-auto ${direction === 'rtl' ? 'sidebar-margin-right' : 'sidebar-margin-left'}`}>
        {activeMenuItem === 'dashboard' && <Dashboard />}
        {activeMenuItem === 'settings' && <Settings onLogout={handleLogout} />}
        {activeMenuItem === 'education' && <Education />}
        {activeMenuItem === 'mobile-app' && <MobileApp />}
        {activeMenuItem === 'products' && <ProductsStock />}
        {activeMenuItem === 'services' && <Services />}
        {activeMenuItem === 'purchases' && <Purchases />}
        {activeMenuItem === 'sales' && <Sales onVenteComptoirChange={setIsVenteComptoirOpen} />}
        {activeMenuItem === 'clients' && <Clients />}
        {activeMenuItem === 'suppliers' && <Suppliers />}
        {activeMenuItem === 'planification' && <Planification />}

        {/* Placeholder content for other menu items */}
        {activeMenuItem !== 'dashboard' && activeMenuItem !== 'settings' && activeMenuItem !== 'education' && activeMenuItem !== 'mobile-app' && activeMenuItem !== 'products' && activeMenuItem !== 'services' && activeMenuItem !== 'purchases' && activeMenuItem !== 'sales' && activeMenuItem !== 'clients' && activeMenuItem !== 'suppliers' && activeMenuItem !== 'planification' && (
          <div className="p-8">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <h2 className="text-2xl mb-4 capitalize" style={{ color: '#1b1b1b' }}>
                {t(`sidebar.${activeMenuItem}`) || activeMenuItem.replace('-', ' ')}
              </h2>
              <p className="text-slate-600">
                {t('common.comingSoon')}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Chat Support - Moved outside scrollable area for better layering */}
      {!isVenteComptoirOpen && <ChatSupport />}

      {/* Toast Notifications */}
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
