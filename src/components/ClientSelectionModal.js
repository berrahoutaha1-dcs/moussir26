import React, { useState } from 'react';
import { X, Search, User, Phone, Mail, MapPin, DollarSign, Star } from 'lucide-react';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';

export default function ClientSelectionModal({ isOpen, onClose, onSelectClient }) {
  const { direction, t, language, currency } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const mockClients = [
    {
      id: '1',
      name: 'Ahmed Benali',
      phone: '0555123456',
      email: 'ahmed.benali@email.com',
      address: 'Alger Centre',
      balance: 1500.00,
      loyaltyPoints: 120,
      discount: 5
    },
    {
      id: '2', 
      name: 'Fatima Zerrouki',
      phone: '0661234567',
      email: 'fatima.zerrouki@email.com',
      address: 'Oran',
      balance: -250.00,
      loyaltyPoints: 85,
      discount: 3
    },
    {
      id: '3',
      name: 'Mohamed Khelifa',
      phone: '0771234568',
      email: 'mohamed.khelifa@email.com', 
      address: 'Constantine',
      balance: 750.00,
      loyaltyPoints: 200,
      discount: 8
    },
    {
      id: 'divers',
      name: 'Divers',
      phone: '',
      email: '',
      address: '',
      balance: 0.00,
      loyaltyPoints: 0,
      discount: 0
    }
  ];

  if (!isOpen) return null;

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm)) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectClient = (client) => {
    if (onSelectClient) {
      onSelectClient(client);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden border border-slate-200 ${direction === 'rtl' ? 'rtl' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">
            {t('clientSelection.title')}
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-gray-50">
          <div className="relative">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 ${direction === 'rtl' ? 'right-3' : 'left-3'} w-5 h-5 text-slate-400`} />
            <Input
              type="text"
              placeholder={t('clientSelection.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${direction === 'rtl' ? 'pr-10' : 'pl-10'}`}
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto bg-white">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              onClick={() => handleSelectClient(client)}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 text-base mb-1">{client.name}</h3>
                    <div className="text-sm text-gray-600 space-y-0.5">
                      {client.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {client.phone}</p>}
                      {client.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</p>}
                      {client.address && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {client.address}</p>}
                    </div>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-sm">
                    <p className="text-gray-600 mb-1">
                      {t('clientSelection.balance')} 
                      <span className={`ml-1 font-semibold ${client.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {client.balance.toFixed(2)} {currency}
                      </span>
                    </p>
                    <p className="text-gray-600 mb-1 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {t('clientSelection.points')} {client.loyaltyPoints}
                    </p>
                    <p className="text-gray-600">
                      {t('clientSelection.discount')} {client.discount}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

