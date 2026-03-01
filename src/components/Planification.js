import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  Package,
  RefreshCw,
  Download,
  Printer,
  ArrowUpDown,
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit,
  Trash2,
  Phone
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import PlanificationModal from './PlanificationModal';
import CalendarModal from './CalendarModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner';
import apiService from '../services/api';

export default function Planification() {
  const { t, direction, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isPlanificationModalOpen, setIsPlanificationModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [selectedPlannings, setSelectedPlannings] = useState([]);
  const [editingPlanning, setEditingPlanning] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planningToDelete, setPlanningToDelete] = useState(null);
  const [sortConfig, setSortConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [plannings, setPlannings] = useState([]);

  const loadPlannings = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getAllPlannings();
      if (result.success) {
        setPlannings(result.data);
      } else {
        toast.error(t('planification.error.loadFailed'));
      }
    } catch (error) {
      console.error('Error loading plannings:', error);
      toast.error(t('planification.error.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlannings();
  }, [dateFilter, statusFilter, priorityFilter]);

  const handleAddPlanning = () => {
    setEditingPlanning(null);
    setIsPlanificationModalOpen(true);
  };

  const handleEditPlanning = (planning) => {
    setEditingPlanning(planning);
    setIsPlanificationModalOpen(true);
  };

  const handleDeletePlanning = (planning) => {
    setPlanningToDelete(planning);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePlanning = async () => {
    if (planningToDelete) {
      try {
        const result = await apiService.deletePlanning(planningToDelete.id);
        if (result.success) {
          setPlannings(prev => prev.filter(p => p.id !== planningToDelete.id));
          toast.success(t('planification.success.deleted'));
        } else {
          toast.error(t('planification.error.deleteFailed'));
        }
      } catch (error) {
        console.error('Error deleting planning:', error);
        toast.error(t('planification.error.deleteFailed'));
      }
      setPlanningToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPlannings.length === 0) {
      toast.error(t('planification.error.noSelection'));
      return;
    }

    try {
      const results = await Promise.all(selectedPlannings.map(id => apiService.deletePlanning(id)));
      if (results.every(r => r.success)) {
        setPlannings(prev => prev.filter(p => !selectedPlannings.includes(p.id)));
        toast.success(t('planification.success.bulkDeleted'));
        setSelectedPlannings([]);
      } else {
        toast.error(t('planification.error.bulkDeleteFailed'));
        loadPlannings(); // Reload to be safe
      }
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error(t('planification.error.bulkDeleteFailed'));
    }
  };

  const handleSelectAll = () => {
    if (selectedPlannings.length === filteredPlannings.length) {
      setSelectedPlannings([]);
    } else {
      setSelectedPlannings(filteredPlannings.map(p => p.id));
    }
  };

  const handleSelectPlanning = (planningId) => {
    setSelectedPlannings(prev =>
      prev.includes(planningId)
        ? prev.filter(id => id !== planningId)
        : [...prev, planningId]
    );
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleRefresh = async () => {
    await loadPlannings();
    toast.success(t('planification.success.refreshed'));
  };

  const handleExport = async () => {
    try {
      const headers = ['Client', 'Service', 'Date', 'Heure', 'Revenue', 'Payment%', 'Statut', 'Priorité'];
      const csvContent = [
        headers.join(','),
        ...filteredPlannings.map(p => [
          `"${p.clientName}"`,
          `"${p.serviceDescription}"`,
          p.scheduledDate,
          p.scheduledTime,
          p.revenue,
          p.paymentPercentage,
          p.status,
          p.priority
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `planifications_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success(t('planification.success.exported'));
    } catch (error) {
      toast.error(t('planification.error.exportFailed'));
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success(t('planification.success.printed'));
  };

  const handleStatusChange = async (planningId, newStatus) => {
    try {
      const planning = plannings.find(p => p.id === planningId);
      if (!planning) return;

      const result = await apiService.updatePlanning(planningId, { ...planning, status: newStatus });
      if (result.success) {
        setPlannings(prev => prev.map(p =>
          p.id === planningId ? { ...p, status: newStatus } : p
        ));
        toast.success(t('planification.success.statusUpdated'));
      } else {
        toast.error(t('planification.error.updateFailed'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('planification.error.updateFailed'));
    }
  };

  const handleContactClient = (planning) => {
    const message = t('planification.whatsappMessage', {
      clientName: planning.clientName,
      date: planning.scheduledDate,
      time: planning.scheduledTime,
      service: planning.serviceDescription
    });
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = planning.clientPhone.replace(/\s+/g, '').replace(/^\+/, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    toast.success(t('planification.success.whatsappOpened'));
  };

  const handleSavePlanning = async (planningData) => {
    try {
      if (editingPlanning) {
        const result = await apiService.updatePlanning(editingPlanning.id, planningData);
        if (result.success) {
          setPlannings(prev => prev.map(p =>
            p.id === editingPlanning.id ? result.data : p
          ));
          toast.success(t('planification.success.updated'));
        } else {
          toast.error(t('planification.error.updateFailed'));
        }
      } else {
        const result = await apiService.createPlanning(planningData);
        if (result.success) {
          setPlannings(prev => [result.data, ...prev]);
          toast.success(t('planification.success.added'));
        } else {
          toast.error(t('planification.error.addFailed'));
        }
      }
      setIsPlanificationModalOpen(false);
      setEditingPlanning(null);
    } catch (error) {
      console.error('Error saving planning:', error);
      toast.error(t('planification.error.saveFailed'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredPlannings = plannings.filter(planning => {
    const matchesSearch = planning.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      planning.serviceDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      planning.clientPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || planning.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || planning.priority === priorityFilter;

    let matchesDate = true;
    const planningDate = new Date(planning.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case 'today':
        matchesDate = planningDate.toDateString() === today.toDateString();
        break;
      case 'week':
        const weekFromNow = new Date(today);
        weekFromNow.setDate(today.getDate() + 7);
        matchesDate = planningDate >= today && planningDate <= weekFromNow;
        break;
      case 'month':
        const monthFromNow = new Date(today);
        monthFromNow.setMonth(today.getMonth() + 1);
        matchesDate = planningDate >= today && planningDate <= monthFromNow;
        break;
      case 'overdue':
        matchesDate = planningDate < today && planning.status !== 'completed';
        break;
      default:
        matchesDate = true;
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });

  const sortedPlannings = [...filteredPlannings].sort((a, b) => {
    if (!sortConfig) return 0;
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === 'scheduledDate' || sortConfig.key === 'deadline') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const todayPlannings = plannings.filter(p => {
    const today = new Date().toISOString().split('T')[0];
    return p.scheduledDate === today;
  });
  const upcomingPlannings = plannings.filter(p => new Date(p.scheduledDate) > new Date());
  const overduePlannings = plannings.filter(p =>
    new Date(p.deadline) < new Date() && p.status !== 'completed'
  );
  const completedPlannings = plannings.filter(p => p.status === 'completed');

  return (
    <div className={`p-8 bg-slate-50 min-h-screen ${direction === 'rtl' ? 'rtl' : ''}`}>
      {/* Header */}
      <div className={`flex justify-between items-start mb-8 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1b1b1b' }}>
            {t('planification.title')}
          </h1>
          <p className="text-slate-600">
            {t('planification.subtitle')}
          </p>
        </div>

        <div className={`flex gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('planification.refresh')}
          </Button>

          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t('planification.export')}
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            {t('planification.print')}
          </Button>

          <Button
            onClick={() => setIsCalendarModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2 border-2 hover:bg-gray-100"
          >
            <Calendar className="w-4 h-4" />
            {t('planification.calendar')}
          </Button>

          <Button
            onClick={handleAddPlanning}
            className="text-white font-bold flex items-center gap-2"
            style={{ backgroundColor: '#1b1b1b' }}
          >
            <Plus className="w-5 h-5" />
            {t('planification.add')}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <Card className="border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  {t('planification.stats.pending')}
                </p>
                <p className="text-xl font-black text-blue-600 leading-none">{todayPlannings.length}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  {t('planification.stats.inProgress')}
                </p>
                <p className="text-xl font-black text-green-600 leading-none">{upcomingPlannings.length}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  {t('planification.stats.overdue')}
                </p>
                <p className="text-xl font-black text-red-600 leading-none">{overduePlannings.length}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  {t('planification.stats.completed')}
                </p>
                <p className="text-xl font-black text-purple-600 leading-none">{completedPlannings.length}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <Filter className="w-5 h-5" />
              {t('planification.filters')}
            </div>

            {selectedPlannings.length > 0 && (
              <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm text-gray-600">
                  {t('planification.selected', { count: selectedPlannings.length })}
                </span>
                <Button
                  onClick={handleBulkDelete}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className={`w-4 h-4 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                  {t('planification.deleteSelected')}
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 ${direction === 'rtl' ? 'text-right' : ''}`}>
            <div className="relative">
              <Search className={`absolute top-3 w-4 h-4 text-gray-400 ${direction === 'rtl' ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={t('planification.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${direction === 'rtl' ? 'pr-10 text-right' : 'pl-10'}`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${direction === 'rtl' ? 'text-right' : ''}`}
            >
              <option value="all">{t('planification.filterStatus.all')}</option>
              <option value="pending">{t('planification.status.pending')}</option>
              <option value="in-progress">{t('planification.status.inProgress')}</option>
              <option value="completed">{t('planification.status.completed')}</option>
              <option value="delayed">{t('planification.status.delayed')}</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${direction === 'rtl' ? 'text-right' : ''}`}
            >
              <option value="all">{t('planification.filterPriority.all')}</option>
              <option value="high">{t('planification.priority.high')}</option>
              <option value="medium">{t('planification.priority.medium')}</option>
              <option value="low">{t('planification.priority.low')}</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${direction === 'rtl' ? 'text-right' : ''}`}
            >
              <option value="all">{t('planification.filterDate.all')}</option>
              <option value="today">{t('planification.filterDate.today')}</option>
              <option value="week">{t('planification.filterDate.week')}</option>
              <option value="month">{t('planification.filterDate.month')}</option>
              <option value="overdue">{t('planification.filterDate.overdue')}</option>
            </select>

            <div className={`text-sm text-gray-600 flex items-center ${direction === 'rtl' ? 'justify-end' : 'justify-start'}`}>
              {t('planification.results', {
                filtered: sortedPlannings.length,
                total: plannings.length
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planifications Table */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <Calendar className="w-5 h-5" />
            {t('planification.list')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className={`py-3 px-4 font-semibold text-gray-700 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedPlannings.length === sortedPlannings.length && sortedPlannings.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>{t('planification.table.client')}</span>
                      <button onClick={() => handleSort('clientName')} className="text-gray-400 hover:text-gray-600">
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                  <th className={`py-3 px-4 font-semibold text-gray-700 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {t('planification.table.service')}
                  </th>
                  <th className={`py-3 px-4 font-semibold text-gray-700 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {t('planification.table.dateTime')}
                  </th>
                  <th className={`py-3 px-4 font-semibold text-gray-700 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {t('planification.table.deadline')}
                  </th>
                  <th className={`py-3 px-4 font-semibold text-gray-700 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {t('planification.table.amount')}
                  </th>
                  <th className={`py-3 px-4 font-semibold text-gray-700 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {t('planification.table.status')}
                  </th>
                  <th className={`py-3 px-4 font-semibold text-gray-700 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {t('planification.table.priority')}
                  </th>
                  <th className={`py-3 px-4 font-semibold text-gray-700 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {t('planification.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPlannings.map((planning, index) => (
                  <tr key={planning.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${selectedPlannings.includes(planning.id) ? 'bg-blue-50' : ''}`}>
                    <td className={`py-4 px-4 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <input
                          type="checkbox"
                          checked={selectedPlannings.includes(planning.id)}
                          onChange={() => handleSelectPlanning(planning.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{planning.clientName}</p>
                          <p className="text-sm text-gray-500">{planning.clientPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`py-4 px-4 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{planning.serviceDescription}</span>
                      </div>
                    </td>
                    <td className={`py-4 px-4 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <div>
                        <p className="font-medium">{planning.scheduledDate}</p>
                        <p className="text-sm text-gray-500">{planning.scheduledTime}</p>
                      </div>
                    </td>
                    <td className={`py-4 px-4 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <div>
                        <span className={`text-sm font-medium ${new Date(planning.deadline) < new Date() && planning.status !== 'completed' ? 'text-red-600' : 'text-gray-700'}`}>
                          {planning.deadline}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {t('planification.debtClearance')}: {planning.debtClearanceDay}
                        </div>
                      </div>
                    </td>
                    <td className={`py-4 px-4 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <div>
                        <div className="font-medium text-green-600">
                          {planning.revenue.toLocaleString()} {t('currency') || 'DZD'}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${planning.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          planning.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {planning.paymentPercentage.toFixed(0)}% {t(`planification.payment.${planning.paymentStatus}`)}
                        </div>
                      </div>
                    </td>
                    <td className={`py-4 px-4 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <select
                        value={planning.status}
                        onChange={(e) => handleStatusChange(planning.id, e.target.value)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(planning.status)} bg-transparent cursor-pointer`}
                      >
                        <option value="pending">{t('planification.status.pending')}</option>
                        <option value="in-progress">{t('planification.status.inProgress')}</option>
                        <option value="completed">{t('planification.status.completed')}</option>
                        <option value="delayed">{t('planification.status.delayed')}</option>
                      </select>
                    </td>
                    <td className={`py-4 px-4 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <span className={`text-sm ${planning.priority === 'high' ? 'text-red-600 font-bold' :
                        planning.priority === 'medium' ? 'text-orange-600 font-medium' :
                          'text-green-600 font-normal'
                        }`}>
                        {t(`planification.priority.${planning.priority}`)}
                      </span>
                    </td>
                    <td className={`py-4 px-4 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContactClient(planning)}
                          className="text-green-600 hover:text-green-700 hover:border-green-300"
                          title={t('planification.contact')}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPlanning(planning)}
                          className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                          title={t('planification.edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePlanning(planning)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                          title={t('planification.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sortedPlannings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {t('planification.noResults')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Planification Modal */}
      <PlanificationModal
        isOpen={isPlanificationModalOpen}
        editingPlanning={editingPlanning}
        onClose={() => {
          setIsPlanificationModalOpen(false);
          setEditingPlanning(null);
        }}
        onSubmit={handleSavePlanning}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className={`max-w-md ${direction === 'rtl' ? 'rtl' : ''}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">
                  {t('planification.deleteConfirm.title')}
                </div>
              </div>
            </DialogTitle>
            <DialogDescription className={`text-gray-600 mt-4 ${direction === 'rtl' ? 'text-right' : ''}`}>
              {t('planification.deleteConfirm.message', {
                clientName: planningToDelete?.clientName || ''
              })}
            </DialogDescription>
          </DialogHeader>

          <div className={`flex gap-4 mt-6 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1"
            >
              {t('planification.deleteConfirm.cancel')}
            </Button>
            <Button
              onClick={confirmDeletePlanning}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {t('planification.deleteConfirm.confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        plannings={plannings}
      />
    </div>
  );
}

