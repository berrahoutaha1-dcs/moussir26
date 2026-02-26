import React, { useState, useEffect, useRef } from 'react';
import { Banknote, History, X, Calendar, Printer, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import PaymentHistoryModal from './PaymentHistoryModal';
import PrintReceiptModal from './PrintReceiptModal';
import { cn } from './ui/utils';
import apiService from '../services/api';

export default function ClientPaymentModal({ isOpen, onClose, clientData }) {
  const { direction, t, language } = useLanguage();
  const [formData, setFormData] = useState({
    codeClient: '',
    date: '',
    montant: '0.00',
    modeReglement: '',
    nPieces: '',
    observation: ''
  });

  const dateInputRef = useRef(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [localBalance, setLocalBalance] = useState(0);
  const [readyToPrint, setReadyToPrint] = useState(false);
  const lastPaymentRef = useRef(null);

  useEffect(() => {
    if (isOpen && clientData) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        codeClient: clientData.codeClient || (clientData.id ? `CL-000${clientData.id}` : ''),
        date: today,
        montant: '0.00',
        modeReglement: '',
        nPieces: '',
        observation: ''
      });
      setLocalBalance(clientData.solde || clientData.montantDu || 0);
      setErrors({});
      setReadyToPrint(false);
      lastPaymentRef.current = null;
    }
  }, [isOpen, clientData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.codeClient.trim()) newErrors.codeClient = t('clientPayment.error.clientCodeRequired');
    if (!formData.date) newErrors.date = t('clientPayment.error.dateRequired');
    if (!formData.montant || parseFloat(formData.montant) <= 0) newErrors.montant = t('clientPayment.error.invalidAmount');
    if (!formData.modeReglement) newErrors.modeReglement = t('clientPayment.error.methodRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValidate = async () => {
    if (isSubmitting || showSuccess) return;

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const paidAmount = parseFloat(formData.montant);

        // Record payment in database (this handles balance updates in the service)
        const result = await apiService.createClientPayment({
          client_id: clientData.id,
          amount: paidAmount,
          date: formData.date,
          method: formData.modeReglement,
          note: formData.observation,
          reference: formData.nPieces
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to record payment');
        }

        // Calculate local balance for UI immediate feedback
        const currentSolde = clientData.solde || 0;
        const currentType = clientData.typeSolde || clientData.type_solde || 'positif';
        let currentBalanceValue = currentType === 'negatif' ? -currentSolde : currentSolde;
        let newBalanceValue = currentBalanceValue + paidAmount;

        const newSolde = Math.abs(newBalanceValue);
        const newType = newBalanceValue >= 0 ? 'positif' : 'negatif';

        setLocalBalance(newType === 'negatif' ? newSolde : 0);

        lastPaymentRef.current = {
          ...formData,
          clientName: `${clientData?.nom || clientData?.nom_complet || ''} ${clientData?.prenom || ''}`.trim(),
          previousBalance: currentSolde,
          newBalance: newSolde,
          newBalanceType: newType,
          paidAmount: paidAmount,
          receiptNo: result.data?.id || '',
          // French-formatted date: "mercredi 25/02/2026"
          formattedDate: (() => {
            const d = new Date(formData.date + 'T00:00:00');
            const weekday = d.toLocaleDateString('fr-FR', { weekday: 'long' });
            const dmy = d.toLocaleDateString('fr-FR');
            return `${weekday} ${dmy}`;
          })(),
          printDate: new Date().toLocaleDateString('fr-FR'),
          printTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        };

        setShowSuccess(true);
        setReadyToPrint(true);
        toast.success(t('clientPayment.success'));

        // Notify parent to refresh
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('clientUpdated'));
        }

        // Reset form for next payment
        setFormData(prev => ({
          ...prev,
          montant: '0.00',
          nPieces: '',
          observation: ''
        }));

        setTimeout(() => {
          setShowSuccess(false);
          setIsSubmitting(false);
        }, 2000);

      } catch (error) {
        setIsSubmitting(false);
        console.error('Error saving payment:', error);
        const errorMsg = error.message || (language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Erreur lors de l\'enregistrement');
        toast.error(errorMsg);
      }
    }
  };

  const handlePrint = () => {
    // Build receipt data from last validated payment, or from the current form
    let data = lastPaymentRef.current;
    if (!data) {
      // No payment validated yet — validate the form first
      if (!validateForm()) {
        toast.error(
          language === 'ar'
            ? 'يرجى تصحيح الأخطاء قبل الطباعة'
            : 'Veuillez corriger les erreurs avant l\'impression'
        );
        return;
      }
      data = {
        ...formData,
        clientName: `${clientData?.nom || ''} ${clientData?.prenom || ''}`.trim(),
        previousBalance: clientData?.solde || clientData?.montantDu || 0,
        paidAmount: parseFloat(formData.montant),
        printDate: new Date().toLocaleDateString(),
        printTime: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      };
    }
    // Open the print preview modal
    lastPaymentRef.current = data;
    setIsPrintModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className={`bg-white rounded-xl w-full max-w-4xl shadow-2xl border-2 border-gray-300 overflow-hidden flex flex-col ${direction === 'rtl' ? 'rtl' : ''}`} style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>

        {/* Header */}
        <div className="bg-white border-b-2 border-blue-800 p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Banknote className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900 ml-4">{t('clientPayment.title')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-bold shadow-sm"
            >
              <History className="w-5 h-5" />
              <span>{language === 'ar' ? 'سجل المدفوعات' : language === 'fr' ? 'Historique' : 'History'}</span>
            </button>
            <button onClick={onClose} className="p-1 hover:bg-red-100 rounded text-red-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 flex gap-8">
          {/* Left Column: Form */}
          <div className="flex-1 space-y-4">
            {/* Code Client */}
            <div className="flex items-center gap-4">
              <label className="text-lg font-bold text-gray-800 w-32">{t('clientPayment.clientCode')}</label>
              <input
                type="text"
                name="codeClient"
                value={formData.codeClient}
                readOnly
                className="flex-1 px-3 py-1.5 border-2 border-blue-900 rounded-lg text-blue-900 font-bold bg-blue-50 focus:outline-none cursor-not-allowed"
              />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <label className="text-lg font-bold text-gray-800 w-32">{t('clientPayment.date')}</label>
                <div className="relative flex-1">
                  <input
                    ref={dateInputRef}
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full px-3 py-1.5 border-2 rounded-lg text-gray-800 font-medium focus:outline-none pr-10 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:hidden",
                      errors.date ? "border-red-500 bg-red-50" : "border-blue-900"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-800 hover:text-blue-900 transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {errors.date && <p className="text-red-500 text-xs ml-36 font-bold">{errors.date}</p>}
            </div>

            {/* Montant */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <label className="text-lg font-bold text-gray-800 w-32">{t('clientPayment.amount').replace(' (DZD)', '').replace(' (DA)', '')}</label>
                <div className="relative flex-1">
                  <input
                    type="text"
                    name="montant"
                    value={formData.montant}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full px-3 py-1.5 border-2 rounded-lg text-gray-800 font-medium focus:outline-none text-right pr-16",
                      errors.montant ? "border-red-500 bg-red-50" : "border-blue-900"
                    )}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-700">DA</span>
                </div>
              </div>
              {errors.montant && <p className="text-red-500 text-xs ml-36 font-bold">{errors.montant}</p>}
            </div>

            {/* Mode Reg */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <label className="text-lg font-bold text-gray-800 w-32">{t('clientPayment.method')}</label>
                <select
                  name="modeReglement"
                  value={formData.modeReglement}
                  onChange={handleInputChange}
                  className={cn(
                    "flex-1 px-3 py-1.5 border-2 rounded-lg text-gray-800 font-medium focus:outline-none appearance-none",
                    errors.modeReglement ? "border-red-500 bg-red-50" : "border-blue-900"
                  )}
                >
                  <option value="">{t('clientPayment.select')}</option>
                  <option value="especes">{t('clientPayment.cash')}</option>
                  <option value="cheque">{t('clientPayment.check')}</option>
                  <option value="virement">{t('clientPayment.transfer')}</option>
                </select>
              </div>
              {errors.modeReglement && <p className="text-red-500 text-xs ml-36 font-bold">{errors.modeReglement}</p>}
            </div>

            {/* Observation */}
            <div className="flex items-start gap-4">
              <label className="text-lg font-bold text-gray-800 w-32 pt-2">{t('clientPayment.notes')}</label>
              <textarea
                name="observation"
                value={formData.observation}
                onChange={handleInputChange}
                rows={4}
                className="flex-1 px-3 py-2 border-2 border-blue-900 rounded-lg text-gray-800 font-medium focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Right Column: Status and Buttons */}
          <div className="w-64 flex flex-col items-center justify-between">
            {/* Status Section */}
            <div className="text-center space-y-2">
              <h4 className="text-xl font-bold text-red-800">
                {clientData?.nomComplet || `${clientData?.nom || ''} ${clientData?.prenom || ''}`} (Debtor)
              </h4>
              <p className="text-2xl font-black text-red-700">
                {(localBalance || 0).toLocaleString('fr-DZ')} DA
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 w-full">
              <button
                onClick={handleValidate}
                disabled={isSubmitting || showSuccess}
                className={cn(
                  "w-full flex items-center justify-between px-6 py-3 rounded-lg transition-all duration-300 shadow-md group text-white",
                  showSuccess ? "bg-green-600 hover:bg-green-700" : "bg-blue-700 hover:bg-blue-800",
                  isSubmitting && "opacity-80 cursor-not-allowed"
                )}
              >
                <span className="text-xl font-bold">
                  {showSuccess
                    ? (language === 'ar' ? 'بنجاح' : 'Success')
                    : isSubmitting
                      ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                      : (language === 'ar' ? 'تأكيد' : 'Validate')}
                </span>
                <div className="flex items-center justify-center">
                  {showSuccess ? (
                    <Check className="w-6 h-6 text-white animate-zoom-in" />
                  ) : isSubmitting ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <div className="w-5 h-5 flex items-center justify-center border-2 border-white rounded transform group-hover:scale-110 transition-transform">✓</div>
                  )}
                </div>
              </button>

              <button
                onClick={onClose}
                className="w-full flex items-center justify-between px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all shadow-md group"
              >
                <span className="text-xl font-bold">{t('clientPayment.cancel')}</span>
                <div className="w-5 h-5 flex items-center justify-center border-2 border-white rounded transform group-hover:scale-110 transition-transform">✕</div>
              </button>

              <button
                onClick={handlePrint}
                style={readyToPrint ? {
                  animation: 'printPulse 1s ease-in-out infinite',
                } : {}}
                className={cn(
                  "w-full flex items-center justify-between px-6 py-3 rounded-lg transition-all shadow-md group text-white",
                  readyToPrint ? "bg-green-600 hover:bg-green-700 ring-4 ring-green-300" : "bg-blue-700 hover:bg-blue-800"
                )}
              >
                <span className="text-xl font-bold">
                  {readyToPrint
                    ? (language === 'ar' ? '🖨 اطبع الآن!' : '🖨 Print Now!')
                    : (language === 'ar' ? 'طباعة الوصل' : 'Print the Receipt')}
                </span>
                <Printer className={cn(
                  "w-6 h-6 transform group-hover:scale-110 transition-transform",
                  readyToPrint && "animate-bounce"
                )} />
              </button>
              <style>{`
                @keyframes printPulse {
                  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
                  50% { transform: scale(1.03); box-shadow: 0 0 0 10px rgba(34,197,94,0); }
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Modal */}
      <PaymentHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        clientData={clientData}
      />

      {/* Print Receipt Preview Modal */}
      <PrintReceiptModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        receiptData={lastPaymentRef.current}
        language={language}
      />
    </div>
  );
}

