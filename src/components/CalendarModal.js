import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search, CheckCircle, Clock, AlertTriangle, XCircle, Phone, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';

export default function CalendarModal({ isOpen, onClose, plannings = [] }) {
  const { direction, t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const mapPlanningStatus = (status) => {
    switch (status) {
      case 'completed': return 'terminé';
      case 'delayed': return 'retardé';
      case 'pending': return 'en attente';
      case 'in-progress': return 'en cours';
      default: return 'en attente';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'terminé': return 'bg-green-500 text-white';
      case 'retardé': return 'bg-red-500 text-white';
      case 'en attente': return 'bg-yellow-500 text-white';
      case 'en cours': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'terminé': return <CheckCircle className="w-3 h-3" />;
      case 'retardé': return <XCircle className="w-3 h-3" />;
      case 'en attente': return <Clock className="w-3 h-3" />;
      case 'en cours': return <AlertTriangle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDateKey = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPlanningsForDay = (date) => {
    if (!date) return [];
    const dateKey = formatDateKey(date);
    
    const dayPlannings = plannings.filter(p => p.scheduledDate === dateKey);
    
    return dayPlannings.filter(planning => {
      const status = mapPlanningStatus(planning.status);
      const matchesStatus = filterStatus === 'all' || status === filterStatus;
      const matchesSearch = planning.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           planning.serviceDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date());
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });
  const weekDays = language === 'ar' 
    ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : language === 'fr'
      ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDayPlannings = selectedDay ? getPlanningsForDay(selectedDay) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col border-3 border-gray-300 ${direction === 'rtl' ? 'rtl' : ''}`}>
        <div className={`bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b-2 border-gray-200 flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} justify-between rounded-t-2xl`}>
          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} gap-4`}>
            <div className="bg-white p-3 rounded-xl shadow-md border-2 border-gray-300">
              <CalendarIcon className="w-7 h-7" style={{ color: '#1b1b1b' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#1b1b1b' }}>
                {t('calendar.title')}
              </h2>
              <p className="text-sm text-gray-600">
                {t('calendar.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-all hover:bg-gray-200 p-2 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} gap-4 flex-wrap`}>
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <Input
                  type="text"
                  placeholder={t('calendar.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${direction === 'rtl' ? 'pr-10' : 'pl-10'} py-2 border-2 border-gray-300 rounded-lg focus:border-gray-500 transition-all`}
                />
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-gray-500 focus:outline-none transition-all bg-white"
            >
              <option value="all">{t('calendar.filter.all')}</option>
              <option value="terminé">{t('calendar.filter.completed')}</option>
              <option value="en cours">{t('calendar.filter.inProgress')}</option>
              <option value="en attente">{t('calendar.filter.pending')}</option>
              <option value="retardé">{t('calendar.filter.delayed')}</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className={`flex-1 p-6 overflow-auto ${selectedDay ? 'w-2/3' : 'w-full'}`}>
            <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} justify-between mb-6`}>
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all border-2 border-gray-300"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              
              <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} gap-4`}>
                <h3 className="text-xl font-bold capitalize" style={{ color: '#1b1b1b' }}>
                  {monthName}
                </h3>
                <Button
                  onClick={goToToday}
                  variant="outline"
                  className="border-2 border-gray-300 hover:bg-gray-100"
                >
                  {t('calendar.today')}
                </Button>
              </div>
              
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all border-2 border-gray-300"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200">
              <div className="grid grid-cols-7 gap-0 border-b-2 border-gray-200">
                {weekDays.map(day => (
                  <div
                    key={day}
                    className="py-3 text-center font-bold text-gray-700 bg-gray-50 text-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0">
                {days.map((date, index) => {
                  const dayPlannings = getPlanningsForDay(date);
                  const isToday = date && date.toDateString() === new Date().toDateString();
                  const isSelected = date && selectedDay && date.toDateString() === selectedDay.toDateString();

                  return (
                    <div
                      key={index}
                      onClick={() => date && setSelectedDay(date)}
                      className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-all hover:bg-gray-50
                        ${!date ? 'bg-gray-50' : ''}
                        ${isToday ? 'bg-blue-50 border-2 border-blue-500' : ''}
                        ${isSelected ? 'bg-blue-100 border-2 border-blue-600' : ''}
                      `}
                    >
                      {date && (
                        <>
                          <div className={`font-bold text-sm mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                            {date.getDate()}
                          </div>
                          <div className="space-y-1 overflow-y-auto max-h-[90px]">
                            {dayPlannings.slice(0, 3).map(planning => {
                              const status = mapPlanningStatus(planning.status);
                              return (
                                <div
                                  key={planning.id}
                                  className={`${getStatusColor(status)} px-2 py-1 rounded text-xs flex items-center gap-1`}
                                >
                                  {getStatusIcon(status)}
                                  <span className="truncate flex-1">{planning.clientName}</span>
                                </div>
                              );
                            })}
                            {dayPlannings.length > 3 && (
                              <div className="text-xs text-gray-500 font-medium text-center">
                                +{dayPlannings.length - 3} {t('calendar.more')}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {selectedDay && (
            <div className={`w-1/3 border-l-2 border-gray-200 bg-gray-50 p-6 overflow-auto ${direction === 'rtl' ? 'border-r-2 border-l-0' : ''}`}>
              <h3 className={`font-bold text-lg mb-4 ${direction === 'rtl' ? 'text-right' : ''}`} style={{ color: '#1b1b1b' }}>
                {t('calendar.details')} - {selectedDay.toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>

              {selectedDayPlannings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>{t('calendar.noOrders')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDayPlannings.map(planning => {
                    const status = mapPlanningStatus(planning.status);
                    return (
                      <div
                        key={planning.id}
                        className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className={`flex items-start ${direction === 'rtl' ? 'flex-row-reverse' : ''} justify-between mb-3`}>
                          <div>
                            <h4 className="font-bold text-gray-900">{planning.clientName}</h4>
                            <p className="text-xs text-gray-500">PLN-{planning.id}</p>
                          </div>
                          <span className={`${getStatusColor(status)} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                            {getStatusIcon(status)}
                            {status}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} gap-2 text-gray-700`}>
                            <Package className="w-4 h-4 text-gray-500" />
                            <span>{planning.serviceDescription}</span>
                          </div>
                          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} gap-2 text-gray-700`}>
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{planning.clientPhone}</span>
                          </div>
                          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} gap-2 text-gray-700`}>
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{planning.scheduledTime}</span>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <span className="font-bold text-green-600">{planning.revenue?.toLocaleString() || 0} DZD</span>
                          </div>
                          {planning.notes && (
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600 italic">{planning.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

