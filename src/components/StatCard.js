import React from 'react';
import { Card, CardContent } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';

export default function StatCard({ title, value, icon: Icon, color, trend }) {
  const { t } = useLanguage();
  
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-slate-600 text-sm mb-1">{title}</p>
            <p className="text-2xl mb-2" style={{ color: '#1b1b1b' }}>{value}</p>
            {trend && (
              <div className="flex items-center space-x-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  trend.isPositive 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {trend.isPositive ? '+' : ''}{trend.value}
                </span>
                <span className="text-xs text-slate-500">{t('dashboard.vsLastMonth')}</span>
              </div>
            )}
          </div>
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

