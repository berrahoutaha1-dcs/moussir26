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
  const [loading, setLoading] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    enabled: true,
    content: ''
  });

  const fetchSettings = async () => {
    try {
      const result = await window.electronAPI.companyInfo.get();
      if (result.success && result.data) {
        setTempSettings({
          enabled: result.data.ticket_note_enabled === 1,
          content: result.data.ticket_note || t(`ticketNote.defaultContent.${language}`) || 'Thank you for your visit!'
        });
      }
    } catch (error) {
      console.error('Error fetching ticket note:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen, language]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.companyInfo.update({
        ticket_note: tempSettings.content,
        ticket_note_enabled: tempSettings.enabled ? 1 : 0
      });

      if (result.success) {
        toast.success(t('ticketNote.success') || 'Settings saved');
        onClose();
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving ticket note:', error);
      toast.error('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTempSettings({
      enabled: true,
      content: t(`ticketNote.defaultContent.${language}`) || 'Thank you for your visit!'
    });
    toast.info(t('ticketNote.resetSuccess') || 'Reset to default');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-[600px] max-h-[90vh] border border-slate-200 overflow-hidden flex flex-col ${direction === 'rtl' ? 'rtl' : ''}`}
      >
        {/* Header */}
        <div className={`bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''} space-x-3`}>
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
              <FileText className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight">
              {t('ticketNote.title') || 'Ticket Note Settings'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className={`p-6 ${direction === 'rtl' ? 'text-right' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 leading-tight">
                  {t('ticketNote.title') || 'Ticket Note'}
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  {t('ticketNote.subtitle') || 'Configure the note that will be printed on your sales tickets'}
                </p>
              </div>
              <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Label htmlFor="note-enabled" className="text-sm font-bold text-slate-600 cursor-pointer">
                  {t('ticketNote.enable') || 'Enable note'}
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

            <div className="space-y-3">
              <Label htmlFor="note-content" className="text-sm font-bold text-slate-700">
                {t('ticketNote.content') || 'Note content'}
              </Label>
              <div className={`relative ${!tempSettings.enabled ? 'opacity-50' : ''}`}>
                <Textarea
                  id="note-content"
                  value={tempSettings.content}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={t('ticketNote.contentPlaceholder') || 'Enter your message...'}
                  className="w-full h-40 resize-none rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all text-sm p-4 leading-relaxed"
                  disabled={!tempSettings.enabled}
                />
                {!tempSettings.enabled && (
                  <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('ticketNote.disabled') || 'Disabled'}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium italic">
                {t('ticketNote.recommendation') || 'Recommended: Maximum 200 characters for good ticket appearance'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4">
          <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'space-x-3'} justify-between`}>
            <Button
              variant="outline"
              className="h-10 border-orange-100 text-orange-500 hover:bg-orange-50 font-bold"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('ticketNote.reset') || 'Default'}
            </Button>

            <div className={`flex ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'space-x-3'}`}>
              <Button
                variant="outline"
                className="h-10 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                onClick={onClose}
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
              <Button
                className="h-10 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                onClick={handleSave}
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {t('common.save') || 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

