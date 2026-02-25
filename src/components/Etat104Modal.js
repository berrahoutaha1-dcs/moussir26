import React, { useState } from 'react';
import { Download, FileSpreadsheet, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Etat104Modal({ isOpen, onClose }) {
  const { t, direction } = useLanguage();
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const [exportFormat, setExportFormat] = useState('excel');

  const handleGenerate = () => {
    // Generate Etat 104 report
    console.log('Generating Etat 104 report', { periodFrom, periodTo, exportFormat });
    // This would typically call an API to generate the report
    alert(t('sales.reportGenerated') || 'Rapport État 104 généré avec succès');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            {t('sales.etat104')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              {t('sales.etat104Desc') || 'Rapport fiscal État 104'}
            </p>
          </div>

          {/* Period Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('common.period') || 'Période'}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {t('common.from') || 'Du'}
                  </label>
                  <Input
                    type="date"
                    value={periodFrom}
                    onChange={(e) => setPeriodFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {t('common.to') || 'Au'}
                  </label>
                  <Input
                    type="date"
                    value={periodTo}
                    onChange={(e) => setPeriodTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('common.format') || 'Format d\'export'}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="excel"
                    checked={exportFormat === 'excel'}
                    onChange={(e) => setExportFormat(e.target.value)}
                  />
                  <span>Excel (.xlsx)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="pdf"
                    checked={exportFormat === 'pdf'}
                    onChange={(e) => setExportFormat(e.target.value)}
                  />
                  <span>PDF (.pdf)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              {t('common.cancel') || 'Annuler'}
            </Button>
            <Button onClick={handleGenerate}>
              <Download className="w-4 h-4 mr-2" />
              {t('common.generate') || 'Générer le rapport'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}




