import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Receipt, 
  RotateCcw, 
  Package, 
  FileText,
  Plus,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Card } from './ui/card';

export default function Purchases() {
  const { direction, t } = useLanguage();
  const [activeButton, setActiveButton] = useState(null);

  const purchaseButtons = [
    {
      id: 'bon-achat',
      title: t('purchases.purchaseOrder') || 'Bon d\'achat',
      description: t('purchases.purchaseOrderDesc') || 'Créer un nouveau bon d\'achat',
      icon: ShoppingCart,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'depense',
      title: t('purchases.expense') || 'Dépense',
      description: t('purchases.expenseDesc') || 'Enregistrer une dépense',
      icon: Receipt,
      color: 'bg-red-600 hover:bg-red-700',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'bon-retour',
      title: t('purchases.returnNote') || 'Bon de retour',
      description: t('purchases.returnNoteDesc') || 'Gérer les retours fournisseurs',
      icon: RotateCcw,
      color: 'bg-orange-600 hover:bg-orange-700',
      textColor: 'text-orange-600',
      bgLight: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'bon-reception',
      title: t('purchases.receptionNote') || 'Bon de réception',
      description: t('purchases.receptionNoteDesc') || 'Réceptionner les marchandises',
      icon: Package,
      color: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'bon-commande',
      title: t('purchases.orderNote') || 'Bon de commande',
      description: t('purchases.orderNoteDesc') || 'Passer une commande fournisseur',
      icon: FileText,
      color: 'bg-purple-600 hover:bg-purple-700',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const handleButtonClick = (buttonId) => {
    setActiveButton(buttonId);
    console.log(`Clicked: ${buttonId}`);
  };

  return (
    <div className={`min-h-screen bg-slate-50 p-8 ${direction === 'rtl' ? 'rtl' : ''}`}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl mb-2" style={{ color: '#1b1b1b' }}>
              {t('sidebar.purchases') || 'Gestion des Achats'}
            </h1>
            <p className="text-slate-600 text-lg">
              {t('purchases.subtitle') || 'Gérez tous vos processus d\'achat et de réception'}
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex space-x-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Achats du mois</p>
                  <p className="font-semibold text-slate-900">2,450,000 DA</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Commandes en cours</p>
                  <p className="font-semibold text-slate-900">15</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {purchaseButtons.map((button) => {
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
                    Nouveau
                  </Button>
                </div>

                {/* Decorative Element */}
                <div className={`absolute top-0 right-0 w-20 h-20 ${button.bgLight} rounded-bl-3xl opacity-30`}></div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Activité Récente
          </h2>
          <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
            Voir tout
          </Button>
        </div>

        {/* Activity List */}
        <div className="space-y-4">
          {[
            {
              type: 'Bon d\'achat',
              reference: 'BA-2024-001',
              supplier: 'Fournisseur Alpha',
              amount: '125,000 DA',
              status: 'Validé',
              statusColor: 'bg-green-100 text-green-700',
              time: 'Il y a 2h'
            },
            {
              type: 'Bon de réception',
              reference: 'BR-2024-045',
              supplier: 'Distributeur Beta',
              amount: '89,500 DA',
              status: 'En cours',
              statusColor: 'bg-yellow-100 text-yellow-700',
              time: 'Il y a 4h'
            },
            {
              type: 'Bon de commande',
              reference: 'BC-2024-112',
              supplier: 'Grossiste Gamma',
              amount: '245,750 DA',
              status: 'En attente',
              statusColor: 'bg-blue-100 text-blue-700',
              time: 'Il y a 1j'
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-slate-900">{activity.type}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-600">{activity.reference}</span>
                  </div>
                  <p className="text-sm text-slate-600">{activity.supplier} • {activity.amount}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${activity.statusColor}`}>
                  {activity.status}
                </span>
                <span className="text-sm text-slate-500">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

