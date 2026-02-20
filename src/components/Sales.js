import React, { useState } from 'react';
import VenteComptoir from './VenteComptoir';
import DeliveryNoteModal from './DeliveryNoteModal';
import SalesInvoiceModal from './SalesInvoiceModal';
import SalesListModal from './SalesListModal';
import DeliveryNoteListModal from './DeliveryNoteListModal';
import Etat104Modal from './Etat104Modal';
import ProformaInvoiceModal from './ProformaInvoiceModal';
import OrderModal from './OrderModal';
import { 
  Truck, 
  FileText, 
  BarChart3, 
  ClipboardList, 
  FileSpreadsheet, 
  FilePlus, 
  ShoppingBag,
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Store,
  Scale,
  Heart,
  Percent,
  Tag
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Card } from './ui/card';

export default function Sales({ onVenteComptoirChange }) {
  const { direction, t } = useLanguage();
  const [activeButton, setActiveButton] = useState(null);
  const [showVenteComptoir, setShowVenteComptoir] = useState(false);
  const [deliveryNoteModalOpen, setDeliveryNoteModalOpen] = useState(false);
  const [salesInvoiceModalOpen, setSalesInvoiceModalOpen] = useState(false);
  const [salesListModalOpen, setSalesListModalOpen] = useState(false);
  const [deliveryNoteListModalOpen, setDeliveryNoteListModalOpen] = useState(false);
  const [etat104ModalOpen, setEtat104ModalOpen] = useState(false);
  const [proformaInvoiceModalOpen, setProformaInvoiceModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const salesButtons = [
    {
      id: 'bon-livraison',
      title: t('sales.deliveryNote'),
      description: t('sales.deliveryNoteDesc'),
      icon: Truck,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      id: 'facture-vente',
      title: t('sales.invoice'),
      description: t('sales.invoiceDesc'),
      icon: FileText,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'listing-ventes',
      title: t('sales.list'),
      description: t('sales.listDesc'),
      icon: BarChart3,
      color: 'bg-purple-600 hover:bg-purple-700',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'listing-bl',
      title: t('sales.listingBl'),
      description: t('sales.listingBlDesc'),
      icon: ClipboardList,
      color: 'bg-orange-600 hover:bg-orange-700',
      textColor: 'text-orange-600',
      bgLight: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'etat-104',
      title: t('sales.etat104'),
      description: t('sales.etat104Desc'),
      icon: FileSpreadsheet,
      color: 'bg-red-600 hover:bg-red-700',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'facture-proforma',
      title: t('sales.proforma'),
      description: t('sales.proformaDesc'),
      icon: FilePlus,
      color: 'bg-teal-600 hover:bg-teal-700',
      textColor: 'text-teal-600',
      bgLight: 'bg-teal-50',
      borderColor: 'border-teal-200'
    },
    {
      id: 'bon-commande-client',
      title: t('sales.order'),
      description: t('sales.orderDesc'),
      icon: ShoppingBag,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      textColor: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      id: 'vente-comptoir',
      title: t('sales.pointOfSale'),
      description: t('sales.pointOfSaleDesc'),
      icon: Store,
      color: 'bg-pink-600 hover:bg-pink-700',
      textColor: 'text-pink-600',
      bgLight: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      id: 'vente-balance',
      title: t('sales.balance'),
      description: t('sales.balanceDesc'),
      icon: Scale,
      color: 'bg-amber-600 hover:bg-amber-700',
      textColor: 'text-amber-600',
      bgLight: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      id: 'fidelite',
      title: t('sales.loyalty'),
      description: t('sales.loyaltyDesc'),
      icon: Heart,
      color: 'bg-rose-600 hover:bg-rose-700',
      textColor: 'text-rose-600',
      bgLight: 'bg-rose-50',
      borderColor: 'border-rose-200'
    },
    {
      id: 'remise-total',
      title: t('sales.totalDiscount'),
      description: t('sales.totalDiscountDesc'),
      icon: Percent,
      color: 'bg-cyan-600 hover:bg-cyan-700',
      textColor: 'text-cyan-600',
      bgLight: 'bg-cyan-50',
      borderColor: 'border-cyan-200'
    },
    {
      id: 'remise-produit',
      title: t('sales.productDiscount'),
      description: t('sales.productDiscountDesc'),
      icon: Tag,
      color: 'bg-lime-600 hover:bg-lime-700',
      textColor: 'text-lime-600',
      bgLight: 'bg-lime-50',
      borderColor: 'border-lime-200'
    }
  ];

  const handleButtonClick = (buttonId) => {
    setActiveButton(buttonId);
    if (buttonId === 'vente-comptoir') {
      setShowVenteComptoir(true);
      onVenteComptoirChange?.(true);
    } else if (buttonId === 'bon-livraison') {
      setDeliveryNoteModalOpen(true);
    } else if (buttonId === 'facture-vente') {
      setSalesInvoiceModalOpen(true);
    } else if (buttonId === 'listing-ventes') {
      setSalesListModalOpen(true);
    } else if (buttonId === 'listing-bl') {
      setDeliveryNoteListModalOpen(true);
    } else if (buttonId === 'etat-104') {
      setEtat104ModalOpen(true);
    } else if (buttonId === 'facture-proforma') {
      setProformaInvoiceModalOpen(true);
    } else if (buttonId === 'bon-commande-client') {
      setOrderModalOpen(true);
    } else {
      // Other buttons (vente-balance, fidelite, remise-total, remise-produit)
      console.log(`Clicked: ${buttonId}`);
    }
  };

  const handleCloseVenteComptoir = () => {
    setShowVenteComptoir(false);
    onVenteComptoirChange?.(false);
  };

  return (
    <div className={`min-h-screen bg-slate-50 p-8 ${direction === 'rtl' ? 'rtl' : ''}`}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl mb-2" style={{ color: '#1b1b1b' }}>
              {t('sales.title')}
            </h1>
            <p className="text-slate-600 text-lg">
              {t('sales.subtitle')}
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex space-x-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{t('sales.monthlySales')}</p>
                  <p className="font-semibold text-slate-900">3,850,000 {t('currency') || 'DA'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{t('sales.activeClients')}</p>
                  <p className="font-semibold text-slate-900">128</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{t('sales.growth')}</p>
                  <p className="font-semibold text-slate-900">+15.2%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {salesButtons.map((button) => {
          const IconComponent = button.icon;
          const isActive = activeButton === button.id;
          
          return (
            <Card
              key={button.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer border-2 ${
                isActive 
                  ? `${button.borderColor} ${button.bgLight}` 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              onClick={() => handleButtonClick(button.id)}
            >
              <div className="p-6">
                {/* Icon Container */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 transition-all duration-300 ${
                  isActive 
                    ? `${button.color.split(' ')[0]} text-white` 
                    : `${button.bgLight} ${button.textColor}`
                }`}>
                  <IconComponent className="w-7 h-7" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className={`font-semibold text-lg ${
                    isActive ? button.textColor : 'text-slate-900'
                  }`}>
                    {button.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {button.description}
                  </p>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  <Button
                    className={`w-full ${button.color} text-white transition-all duration-300 hover:shadow-md`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleButtonClick(button.id);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {button.id.includes('listing') || button.id.includes('etat') ? 
                      t('sales.consult') : 
                      button.id === 'vente-comptoir' ? 
                      t('sales.display') : 
                      t('sales.new')}
                  </Button>
                </div>

                {/* Decorative Element */}
                <div className={`absolute top-0 right-0 w-20 h-20 ${button.bgLight} rounded-bl-3xl opacity-30`}></div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Vente Comptoir Modal */}
      {showVenteComptoir && (
        <div className="fixed inset-0 z-50 bg-white">
          <VenteComptoir onClose={handleCloseVenteComptoir} />
        </div>
      )}

      {/* Sales Modals */}
      <DeliveryNoteModal 
        isOpen={deliveryNoteModalOpen} 
        onClose={() => setDeliveryNoteModalOpen(false)} 
      />
      <SalesInvoiceModal 
        isOpen={salesInvoiceModalOpen} 
        onClose={() => setSalesInvoiceModalOpen(false)} 
      />
      <SalesListModal 
        isOpen={salesListModalOpen} 
        onClose={() => setSalesListModalOpen(false)} 
      />
      <DeliveryNoteListModal 
        isOpen={deliveryNoteListModalOpen} 
        onClose={() => setDeliveryNoteListModalOpen(false)} 
      />
      <Etat104Modal 
        isOpen={etat104ModalOpen} 
        onClose={() => setEtat104ModalOpen(false)} 
      />
      <ProformaInvoiceModal 
        isOpen={proformaInvoiceModalOpen} 
        onClose={() => setProformaInvoiceModalOpen(false)} 
      />
      <OrderModal 
        isOpen={orderModalOpen} 
        onClose={() => setOrderModalOpen(false)} 
      />

    </div>
  );
}

