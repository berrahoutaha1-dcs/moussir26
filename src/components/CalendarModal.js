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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-300">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-[85vw] h-[85vh] flex flex-col border border-slate-200 overflow-hidden ${direction === 'rtl' ? 'rtl' : ''}`}>
        <div className={`bg-white px-6 py-4 border-b border-slate-100 flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} justify-between shadow-sm z-10`}>
          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} gap-3`}>
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-100">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0f172a] tracking-tight leading-none">
                {t('calendar.title')}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
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

        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} gap-3 flex-wrap`}>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400`} />
                <Input
                  type="text"
                  placeholder={t('calendar.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${direction === 'rtl' ? 'pr-9' : 'pl-9'} h-9 py-1 bg-white border-slate-200 rounded-lg focus:ring-indigo-500 transition-all text-xs`}
                />
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 px-3 py-1 border border-slate-200 rounded-lg focus:ring-indigo-500 focus:outline-none transition-all bg-white text-xs font-semibold text-slate-700"
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
          <div className={`flex-1 p-4 overflow-auto ${selectedDay ? 'w-2/3' : 'w-full'}`}>
            <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} justify-between mb-4`}>
              <button
                onClick={previousMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-all border border-slate-200 text-slate-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} gap-3`}>
                <h3 className="text-base font-extrabold text-slate-800 capitalize leading-none">
                  {monthName}
                </h3>
                <Button
                  onClick={goToToday}
                  variant="outline"
                  className="h-8 border border-slate-200 hover:bg-slate-50 text-[10px] font-bold px-3"
                >
                  {t('calendar.today')}
                </Button>
              </div>

              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-all border border-slate-200 text-slate-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="grid grid-cols-7 gap-0 border-b border-slate-100 bg-slate-50/50">
                {weekDays.map(day => (
                  <div
                    key={day}
                    className="py-2 text-center font-bold text-slate-400 uppercase tracking-tighter text-[9px]"
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
                      className={`min-h-[85px] p-1.5 border border-slate-50 cursor-pointer transition-all hover:bg-indigo-50/30 group
                        ${!date ? 'bg-slate-50/50' : 'bg-white'}
                        ${isToday ? 'bg-indigo-50/50 ring-1 ring-inset ring-indigo-500' : ''}
                        ${isSelected ? 'bg-indigo-100/50 ring-2 ring-inset ring-indigo-600' : ''}
                      `}
                    >
                      {date && (
                        <>
                          <div className={`font-black text-[10px] mb-1 flex items-center justify-center w-5 h-5 rounded-full transition-colors ${isToday ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50'}`}>
                            {date.getDate()}
                          </div>
                          <div className="space-y-0.5 overflow-hidden">
                            {dayPlannings.slice(0, 2).map(planning => {
                              const status = mapPlanningStatus(planning.status);
                              return (
                                <div
                                  key={planning.id}
                                  className={`${getStatusColor(status)} px-2 py-1 rounded text-xs flex items-center gap-1`}
                                >
                                  {getStatusIcon(status)}
                                  <span className="truncate flex-1 font-bold">{planning.clientName}</span>
                                </div>
                              );
                            })}
                            {dayPlannings.length > 2 && (
                              <div className="text-[8px] text-slate-400 font-black text-center uppercase tracking-tighter mt-0.5">
                                +{dayPlannings.length - 2} {t('calendar.more')}
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
            <div className={`w-1/3 border-l border-slate-100 bg-white p-5 overflow-auto shadow-inner ${direction === 'rtl' ? 'border-r border-l-0' : ''}`}>
              <h3 className={`font-black text-xs text-slate-800 mb-4 uppercase tracking-widest ${direction === 'rtl' ? 'text-right' : ''}`}>
                {selectedDay.toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
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

