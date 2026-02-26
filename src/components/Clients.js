import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  BarChart2,
  Plus,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import ClientListModal from './ClientListModal';
import AddClientModal from './AddClientModal';
import RepresentantsListModal from './RepresentantsListModal';
import ClientSituationModal from './ClientSituationModal';
import apiService from '../services/api';

export default function Clients() {
  const { direction, t } = useLanguage();
  const [activeButton, setActiveButton] = useState(null);
  const [isClientListModalOpen, setIsClientListModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isRepresentantsListModalOpen, setIsRepresentantsListModalOpen] = useState(false);
  const [isClientSituationModalOpen, setIsClientSituationModalOpen] = useState(false);
  const [representativeCount, setRepresentativeCount] = useState(null); // null = loading
  const [clientCount, setClientCount] = useState(null);                 // null = loading

  const fetchStats = async () => {
    try {
      // Fetch representatives
      const repResult = await window.electronAPI.representatives.getAll();
      if (repResult.success) {
        setRepresentativeCount(repResult.data.length);
      }

      // Fetch clients
      const clientResult = await apiService.getAllClients();
      if (clientResult.success) {
        setClientCount(clientResult.data.length);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();

    // Re-fetch whenever any related data changes
    const onClientUpdate = () => fetchStats();
    const onRepUpdate = () => fetchStats();

    window.addEventListener('clientUpdated', onClientUpdate);
    window.addEventListener('representativeUpdated', onRepUpdate);
    return () => {
      window.removeEventListener('clientUpdated', onClientUpdate);
      window.removeEventListener('representativeUpdated', onRepUpdate);
    };
  }, []);

  const clientButtons = [
    {
      id: 'liste-clients',
      title: t('clients.list') || 'Liste des clients',
      description: t('clients.listDesc') || 'Consulter tous les clients',
      icon: Users,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-200',
      buttonText: 'Consulter'
    },
    {
      id: 'ajouter-client',
      title: t('clients.add') || 'Ajouter client',
      description: t('clients.addDesc') || 'Créer un nouveau client',
      icon: UserPlus,
      color: 'bg-orange-600 hover:bg-orange-700',
      textColor: 'text-orange-600',
      bgLight: 'bg-orange-50',
      borderColor: 'border-orange-200',
      buttonText: 'Ajouter'
    },
    {
      id: 'liste-representants',
      title: t('clients.representatives') || 'Liste des représentants',
      description: t('clients.representativesDesc') || 'Gérer les représentants',
      icon: UserCheck,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      buttonText: 'Consulter'
    },
    {
      id: 'situation-clients',
      title: t('clients.situation') || 'Situation des clients',
      description: t('clients.situationDesc') || 'Analyser la situation clients',
      icon: BarChart2,
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
      case 'liste-clients':
        setIsClientListModalOpen(true);
        break;
      case 'ajouter-client':
        setIsAddClientModalOpen(true);
        break;
      case 'liste-representants':
        setIsRepresentantsListModalOpen(true);
        break;
      case 'situation-clients':
        setIsClientSituationModalOpen(true);
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
              {t('clients.title') || 'Gestion des Clients'}
            </h1>
            <p className="text-slate-600 text-lg">
              {t('clients.subtitle') || 'Gérez vos clients, représentants et analysez leur situation'}
            </p>
          </div>

          <div className={`flex ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'space-x-4'} space-x-4`}>
            {/* Representatives counter */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 min-w-[140px]">
              <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'space-x-3'} space-x-3`}>
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                    {t('clients.representatives') || 'Representatives List'}
                  </p>
                  {representativeCount === null ? (
                    <div className="h-5 w-8 mt-1 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    <p className="text-xl font-bold text-slate-900">{representativeCount.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Total clients counter */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 min-w-[140px]">
              <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'space-x-3'} space-x-3`}>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Total Clients</p>
                  {clientCount === null ? (
                    <div className="h-5 w-8 mt-1 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    <p className="text-xl font-bold text-slate-900">{clientCount.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {clientButtons.map((button) => {
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

      {/* Client List Modal */}
      <ClientListModal
        isOpen={isClientListModalOpen}
        onClose={() => { setIsClientListModalOpen(false); fetchStats(); }}
      />

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => { setIsAddClientModalOpen(false); fetchStats(); }}
      />

      {/* Representants List Modal */}
      <RepresentantsListModal
        isOpen={isRepresentantsListModalOpen}
        onClose={() => { setIsRepresentantsListModalOpen(false); fetchStats(); }}
      />

      {/* Client Situation Modal */}
      <ClientSituationModal
        isOpen={isClientSituationModalOpen}
        onClose={() => setIsClientSituationModalOpen(false)}
      />
    </div>
  );
}

