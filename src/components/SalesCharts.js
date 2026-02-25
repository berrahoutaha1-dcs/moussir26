import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Mock data for sales rate chart
const salesData = {
  weekly: [
    { name: 'Lun', sales: 4000 },
    { name: 'Mar', sales: 3000 },
    { name: 'Mer', sales: 2000 },
    { name: 'Jeu', sales: 2780 },
    { name: 'Ven', sales: 1890 },
    { name: 'Sam', sales: 2390 },
    { name: 'Dim', sales: 3490 },
  ],
  monthly: [
    { name: 'Jan', sales: 65000 },
    { name: 'Fév', sales: 59000 },
    { name: 'Mar', sales: 80000 },
    { name: 'Avr', sales: 81000 },
    { name: 'Mai', sales: 56000 },
    { name: 'Jun', sales: 85000 },
    { name: 'Jul', sales: 90000 },
    { name: 'Aoû', sales: 87000 },
    { name: 'Sep', sales: 74000 },
    { name: 'Oct', sales: 89000 },
    { name: 'Nov', sales: 95000 },
    { name: 'Déc', sales: 102000 },
  ],
  yearly: [
    { name: '2020', sales: 850000 },
    { name: '2021', sales: 920000 },
    { name: '2022', sales: 1050000 },
    { name: '2023', sales: 1200000 },
    { name: '2024', sales: 1380000 },
  ],
  custom: [
    { name: '01/05', sales: 15000 },
    { name: '05/05', sales: 22000 },
    { name: '10/05', sales: 18000 },
    { name: '15/05', sales: 25000 },
    { name: '20/05', sales: 30000 },
  ]
};

export default function SalesCharts() {
  const { t, direction } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Product data with translated names
  const productData = [
    { name: t('charts.products.laptops'), percentage: 28, sales: 450, color: '#10b981' },
    { name: t('charts.products.smartphones'), percentage: 22, sales: 380, color: '#3b82f6' },
    { name: t('charts.products.tablets'), percentage: 18, sales: 290, color: '#f59e0b' },
    { name: t('charts.products.accessories'), percentage: 15, sales: 240, color: '#14b8a6' },
    { name: t('charts.products.printers'), percentage: 10, sales: 150, color: '#8b5cf6' },
    { name: t('charts.products.others'), percentage: 7, sales: 120, color: '#ef4444' },
  ];

  const periodButtons = [
    { key: 'weekly', label: t('charts.weekly') },
    { key: 'monthly', label: t('charts.monthly') },
    { key: 'yearly', label: t('charts.yearly') },
  ];

  const formatSalesValue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M €`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k €`;
    }
    return `${value} €`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800">{label}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {`Ventes: ${formatSalesValue(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const ProductTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800">{data.name}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {`${data.percentage}% (${data.sales} unités)`}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleApplyCustomRange = () => {
    if (dateRange.from && dateRange.to) {
      setSelectedPeriod('custom');
      setShowDatePicker(false);
    }
  };

  return (
    <div className={`grid grid-cols-1 xl:grid-cols-2 gap-6 ${direction === 'rtl' ? 'rtl' : ''}`}>
      {/* Sales Rate Chart */}
      <Card className="border-0 shadow-sm bg-white overflow-visible">
        <CardHeader className="pb-4">
          <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <CardTitle className="text-lg" style={{ color: '#1b1b1b' }}>
              {t('charts.salesRate')}
            </CardTitle>
            <div className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex rounded-lg border border-slate-200 p-1 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                {periodButtons.map((button) => (
                  <Button
                    key={button.key}
                    variant={selectedPeriod === button.key ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setSelectedPeriod(button.key);
                      setShowDatePicker(false);
                    }}
                    className={`px-3 py-1 text-xs rounded-md transition-all ${selectedPeriod === button.key
                      ? 'text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    style={selectedPeriod === button.key ? { backgroundColor: '#1b1b1b' } : {}}
                  >
                    {button.label}
                  </Button>
                ))}
              </div>

              {/* Custom Range Button */}
              <div className="relative">
                <Button
                  variant={selectedPeriod === 'custom' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`px-3 py-1 text-xs rounded-md border border-slate-200 flex items-center gap-2 transition-all ${selectedPeriod === 'custom' ? 'text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  style={selectedPeriod === 'custom' ? { backgroundColor: '#1b1b1b' } : {}}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {selectedPeriod === 'custom' ? t('charts.custom') : ''}
                </Button>

                {/* Date Picker Dropdown */}
                {showDatePicker && (
                  <div className={`absolute top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-4 w-72 ${direction === 'rtl' ? 'left-0' : 'right-0'
                    }`}>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">
                          {t('common.from')}
                        </label>
                        <input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                          className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">
                          {t('common.to')}
                        </label>
                        <input
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                          className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                        />
                      </div>
                      <Button
                        className="w-full bg-[#1b1b1b] hover:bg-black text-white"
                        size="sm"
                        onClick={handleApplyCustomRange}
                      >
                        {t('common.apply')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full" style={{ position: 'relative', minWidth: '100%', minHeight: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData[selectedPeriod] || salesData.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={formatSalesValue}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#1b1b1b"
                  strokeWidth={3}
                  dot={{ fill: '#1b1b1b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#1b1b1b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Product Sales Percentage Chart */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg" style={{ color: '#1b1b1b' }}>
            {t('charts.productSales')}
          </CardTitle>
          <p className="text-sm text-slate-600">
            {t('charts.productSalesSubtitle')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full" style={{ position: 'relative', minWidth: '100%', minHeight: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="percentage"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ProductTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm text-slate-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

