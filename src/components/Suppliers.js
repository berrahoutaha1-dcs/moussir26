import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  BarChart3,
  Plus,
  Building2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import AddSupplierModal from './AddSupplierModal';
import SupplierListModal from './SupplierListModal';
import SupplierSituationModal from './SupplierSituationModal';

export default function Suppliers() {
  const { direction, t } = useLanguage();
  const [activeButton, setActiveButton] = useState(null);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isSupplierListModalOpen, setIsSupplierListModalOpen] = useState(false);
  const [isSupplierSituationModalOpen, setIsSupplierSituationModalOpen] = useState(false);
  const [supplierCount, setSupplierCount] = useState(0);

  const fetchSupplierCount = async () => {
    try {
      const result = await window.electronAPI.suppliers.getAll();
      if (result.success && Array.isArray(result.data)) {
        setSupplierCount(result.data.length);
      }
    } catch (error) {
      console.error('Error fetching supplier count:', error);
    }
  };

  useEffect(() => {
    fetchSupplierCount();

    // Listen for updates
    const handleUpdate = () => fetchSupplierCount();
    window.addEventListener('supplierUpdated', handleUpdate);
    return () => window.removeEventListener('supplierUpdated', handleUpdate);
  }, []);

  const supplierButtons = [
    {
      id: 'ajouter-fournisseurs',
      title: t('suppliers.add') || 'Ajouter fournisseurs',
      description: t('suppliers.addDesc') || 'Enregistrer un nouveau fournisseur',
      icon: UserPlus,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-200',
      buttonText: 'Ajouter'
    },
    {
      id: 'liste-fournisseurs',
      title: t('suppliers.list') || 'Liste des fournisseurs',
      description: t('suppliers.listDesc') || 'Consulter tous les fournisseurs',
      icon: Users,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      buttonText: 'Consulter'
    },
    {
      id: 'situation-fournisseurs',
      title: t('suppliers.situation') || 'Situation fournisseurs',
      description: t('suppliers.situationDesc') || 'Analyser la situation fournisseurs',
      icon: BarChart3,
      color: 'bg-purple-600 hover:bg-purple-700',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
      borderColor: 'border-purple-200',
      buttonText: 'Analyser'
    }
  ];

  const handleButtonClick = (buttonId) => {
    setActiveButton(buttonId);

    switch (buttonId) {
      case 'ajouter-fournisseurs':
        setIsAddSupplierModalOpen(true);
        break;
      case 'liste-fournisseurs':
        setIsSupplierListModalOpen(true);
        break;
      case 'situation-fournisseurs':
        setIsSupplierSituationModalOpen(true);
        break;
      default:
        console.log(`Clicked: ${buttonId}`);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 p-8 ${direction === 'rtl' ? 'rtl' : ''}`}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl mb-2" style={{ color: '#1b1b1b' }}>
              {t('suppliers.title') || 'Gestion des Fournisseurs'}
            </h1>
            <p className="text-slate-600 text-lg">
              {t('suppliers.subtitle') || 'Gérez vos fournisseurs, analysez leur performance et optimisez vos approvisionnements'}
            </p>
          </div>

          {/* Quick Stats */}
          <div className={`flex ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'space-x-4'} space-x-4`}>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'space-x-3'} space-x-3`}>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{t('suppliers.totalSuppliers') || 'Total fournisseurs'}</p>
                  <p className="font-semibold text-slate-900">{supplierCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {supplierButtons.map((button) => {
          const IconComponent = button.icon;
          const isActive = activeButton === button.id;

          return (
            <Card
              key={button.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer border-2 ${isActive
                ? `${button.borderColor} ${button.bgLight}`
                : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              onClick={() => handleButtonClick(button.id)}
            >
              <div className="p-6">
                {/* Icon Container */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 transition-all duration-300 ${isActive
                  ? `${button.color.split(' ')[0]} text-white`
                  : `${button.bgLight} ${button.textColor}`
                  }`}>
                  <IconComponent className="w-7 h-7" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className={`font-semibold text-lg ${isActive ? button.textColor : 'text-slate-900'
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
                    {button.buttonText} +
                  </Button>
                </div>

                {/* Decorative Element */}
                <div className={`absolute top-0 ${direction === 'rtl' ? 'left-0' : 'right-0'} w-20 h-20 ${button.bgLight} ${direction === 'rtl' ? 'rounded-br-3xl' : 'rounded-bl-3xl'} opacity-30`}></div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modals */}
      {/* Add Supplier Modal */}
      <AddSupplierModal
        isOpen={isAddSupplierModalOpen}
        onClose={() => setIsAddSupplierModalOpen(false)}
      />

      {/* Supplier List Modal */}
      <SupplierListModal
        isOpen={isSupplierListModalOpen}
        onClose={() => setIsSupplierListModalOpen(false)}
      />

      {/* Supplier Situation Modal */}
      <SupplierSituationModal
        isOpen={isSupplierSituationModalOpen}
        onClose={() => setIsSupplierSituationModalOpen(false)}
      />
    </div>
  );
}

