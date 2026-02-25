import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Upload, FileSpreadsheet, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export default function ImportModal({ isOpen, onClose }) {
  const { direction, t } = useLanguage();
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl ${direction === 'rtl' ? 'rtl' : ''}`}
        style={{ width: '90vw', maxWidth: '600px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Upload className="w-5 h-5 text-black" />
            <h2 className="text-lg text-black">
              {direction === 'rtl' ? 'استيراد المنتجات' : 'Import de Produits'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Card className="mb-4">
            <CardContent className="p-6">
              <div className="text-center">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 mb-4">
                  {direction === 'rtl' ? 'اختر ملف Excel أو CSV لاستيراد المنتجات' : 'Sélectionnez un fichier Excel ou CSV pour importer les produits'}
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button as="span" variant="outline" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {direction === 'rtl' ? 'اختر الملف' : 'Choisir un fichier'}
                  </Button>
                </label>
                {file && (
                  <p className="mt-4 text-sm text-slate-600">
                    {direction === 'rtl' ? 'الملف المحدد:' : 'Fichier sélectionné:'} {file.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Download className="w-4 h-4" />
            <a href="#" className="text-blue-600 hover:underline">
              {direction === 'rtl' ? 'تحميل نموذج Excel' : 'Télécharger un modèle Excel'}
            </a>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {direction === 'rtl' ? 'إلغاء' : 'Annuler'}
          </Button>
          <Button disabled={!file}>
            {direction === 'rtl' ? 'استيراد' : 'Importer'}
          </Button>
        </div>
      </div>
    </div>
  );
}

