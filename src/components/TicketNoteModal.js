import React, { useState, useEffect } from 'react';
import { X, FileText, Save, RotateCcw, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export default function TicketNoteModal({ isOpen, onClose }) {
  const { direction, t, language } = useLanguage();
  const [noteSettings, setNoteSettings] = useState({
    enabled: true,
    content: t(`ticketNote.defaultContent.${language}`) || t('ticketNote.defaultContent.en')
  });

  const [tempSettings, setTempSettings] = useState(noteSettings);

  useEffect(() => {
    if (isOpen) {
      setTempSettings(noteSettings);
    }
  }, [isOpen, noteSettings]);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
          e.preventDefault();
          handleSave();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setNoteSettings(tempSettings);
    toast.success(t('ticketNote.success'));
    onClose();
  };

  const handleCancel = () => {
    setTempSettings(noteSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
      enabled: true,
      content: t(`ticketNote.defaultContent.${language}`) || t('ticketNote.defaultContent.en')
    };
    setTempSettings(defaultSettings);
    toast.info(t('ticketNote.resetSuccess'));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-[600px] h-[400px] border border-slate-200 overflow-hidden ${direction === 'rtl' ? 'rtl' : ''}`}
        tabIndex={0}
      >
        <div className={`bg-gradient-to-r from-emerald-50 to-white border-b border-slate-200 px-6 py-4 flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} justify-between`}>
          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-3`}>
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-medium text-slate-700">
              {t('ticketNote.title')}
            </span>
          </div>
          <button 
            onClick={handleCancel}
            className="w-8 h-8 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className={`bg-white px-6 py-4 border-b border-slate-100 ${direction === 'rtl' ? 'text-right' : ''}`}>
          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} justify-between`}>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">
                {t('ticketNote.title')}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {t('ticketNote.subtitle')}
              </p>
            </div>
            <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-2`}>
              <Label htmlFor="note-enabled" className="text-sm font-medium text-slate-700">
                {t('ticketNote.enable')}
              </Label>
              <Switch
                id="note-enabled"
                checked={tempSettings.enabled}
                onCheckedChange={(checked) => 
                  setTempSettings(prev => ({ ...prev, enabled: checked }))
                }
              />
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="note-content" className="text-sm font-medium text-slate-700">
              {t('ticketNote.content')}
            </Label>
            <Textarea
              id="note-content"
              value={tempSettings.content}
              onChange={(e) => setTempSettings(prev => ({ ...prev, content: e.target.value }))}
              placeholder={t('ticketNote.contentPlaceholder')}
              className="w-full h-32 resize-none"
              disabled={!tempSettings.enabled}
            />
            <p className="text-xs text-slate-500">
              {t('ticketNote.recommendation')}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} justify-between`}>
            <Button 
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('ticketNote.reset')}
            </Button>
            
            <div className={`flex ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-3`}>
              <Button 
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 mr-2" />
                {t('common.cancel')}
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all duration-200"
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" />
                {t('common.save')}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border-t border-emerald-200 px-6 py-2">
          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} justify-between`}>
            <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-2`}>
              <div className={`w-2 h-2 rounded-full ${tempSettings.enabled ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-slate-600">
                {tempSettings.enabled 
                  ? t('ticketNote.enabled')
                  : t('ticketNote.disabled')
                }
              </span>
            </div>
            <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-4`}>
              <span className="text-xs text-slate-500">
                {t('ticketNote.shortcuts')}
              </span>
              {tempSettings.enabled && (
                <span className={`text-xs text-emerald-600 flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <Check className={`w-3 h-3 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                  {t('ticketNote.validated')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

