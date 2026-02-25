import React, { useState, useEffect, useRef } from 'react';
import { Banknote, History, X, Calendar, Printer, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import PaymentHistoryModal from './PaymentHistoryModal';
import { cn } from './ui/utils';

export default function SupplierPaymentModal({ isOpen, onClose, supplier }) {
  const { direction, t, language } = useLanguage();
  const [formData, setFormData] = useState({
    codeFRS: '',
    date: '',
    montant: '0.00',
    mode: '',
    npieces: '',
    observation: ''
  });

  const dateInputRef = useRef(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [localBalance, setLocalBalance] = useState(0);
  const [readyToPrint, setReadyToPrint] = useState(false);
  const lastPaymentRef = useRef(null); // stores data of last validated payment for printing

  useEffect(() => {
    if (isOpen && supplier) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        codeFRS: supplier.codeSupplier || supplier.code || 'FRC0001',
        date: today,
        montant: '0.00',
        mode: '',
        npieces: '',
        observation: ''
      });
      setLocalBalance(supplier.solde || 0);
      setErrors({});
      setReadyToPrint(false);
      lastPaymentRef.current = null;
    }
  }, [isOpen, supplier]);

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
    if (!formData.codeFRS.trim()) newErrors.codeFRS = language === 'ar' ? 'كود المورد مطلوب' : 'Code fournisseur requis';
    if (!formData.date) newErrors.date = language === 'ar' ? 'التاريخ مطلوب' : 'Date requise';

    const amount = parseFloat(formData.montant);
    if (!formData.montant || isNaN(amount) || amount <= 0) {
      newErrors.montant = language === 'ar' ? 'مبلغ غير صالح' : 'Montant invalide';
    }

    if (!formData.mode) newErrors.mode = language === 'ar' ? 'طريقة الدفع مطلوبة' : 'Mode de règlement requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValidate = async () => {
    if (isSubmitting || showSuccess) return;

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const paymentData = {
          supplier_id: supplier.id,
          amount: parseFloat(formData.montant),
          date: formData.date,
          method: formData.mode,
          reference: formData.npieces,
          note: formData.observation
        };

        const result = await window.electronAPI.supplierPayments.create(paymentData);

        if (result.success) {
          // Update balance immediately for visual feedback
          const paidAmount = parseFloat(formData.montant);
          setLocalBalance(prev => prev - paidAmount);

          // Save payment snapshot for printing
          lastPaymentRef.current = {
            ...formData,
            supplierName: supplier?.nomEntreprise || '',
            previousBalance: supplier?.solde || 0,
            paidAmount: parseFloat(formData.montant),
            printDate: new Date().toLocaleDateString(),
            printTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
          };

          setShowSuccess(true);
          setReadyToPrint(true); // start pulse animation on Print button
          toast.success(t('supplierPayment.success') || (language === 'ar' ? 'تم تسجيل الدفع بنجاح' : 'Paiement enregistré avec succès'));

          // Trigger a refresh event if parent component needs to reload data
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('supplierUpdated'));
          }

          // Reset form for next payment instead of closing
          setFormData(prev => ({
            ...prev,
            montant: '0.00',
            npieces: '',
            observation: ''
          }));

          // Hide success state after a delay but stay on screen
          setTimeout(() => {
            setShowSuccess(false);
            setIsSubmitting(false);
          }, 2000);
        } else {
          setIsSubmitting(false);
          toast.error(result.error || (language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Erreur lors de l\'enregistrement'));
        }
      } catch (error) {
        setIsSubmitting(false);
        console.error('Error saving payment:', error);
        toast.error(language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Erreur lors de l\'enregistrement');
      }
    }
  };

  const handlePrint = () => {
    try {
      // Use last validated payment if available, otherwise validate current form
      let data = lastPaymentRef.current;
      if (!data) {
        if (!validateForm()) {
          toast.error(language === 'ar'
            ? 'يرجى تصحيح الأخطاء قبل الطباعة'
            : 'Veuillez remplir tous les champs obligatoires avant d\'imprimer');
          return;
        }
        data = {
          ...formData,
          supplierName: supplier?.nomEntreprise || '',
          previousBalance: supplier?.solde || 0,
          paidAmount: parseFloat(formData.montant),
          printDate: new Date().toLocaleDateString(),
          printTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        };
      }

      const methodLabel = data.mode === 'especes' ? 'CASH' :
        data.mode === 'cheque' ? 'CHECK' :
          data.mode === 'virement' ? 'TRANSFER' : 'OTHER';

      const versement = data.paidAmount;
      const ancienSolde = parseFloat(data.previousBalance);
      const nouveauSolde = ancienSolde - versement;

      const weekdays = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      const now = new Date();
      const formattedDate = `${weekdays[now.getDay()]} ${now.toLocaleDateString('fr-FR')}`;

      // 80mm Thermal Receipt - Technical Calibration to remove margins
      const receiptHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    /* Technical Print Calibration */
    @page { 
      size: 80mm auto; 
      margin: 0; 
    }
    
    * { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
    }
    
    body { 
      font-family: 'Arial', sans-serif;
      width: 280px; /* Fixed width for 80mm printers to avoid side margins */
      margin: 0;
      padding: 8px;
      background-color: #fff;
      color: #000;
      line-height: 1.2;
      font-size: 14px;
    }

    .bold { font-weight: bold; }
    .center { text-align: center; }
    .right { text-align: right; }
    
    .title { 
      font-size: 18px; 
      font-weight: bold; 
      margin: 8px 0;
      text-transform: uppercase;
      text-decoration: underline;
    }
    
    .divider { 
      border-top: 1px dashed #000; 
      margin: 6px 0; 
      width: 100%;
    }

    .info-group { margin: 6px 0; }
    .info-row { display: flex; justify-content: space-between; width: 100%; }
    
    .amount-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 8px 0; 
    }
    .amount-table td { 
      padding: 4px 0; 
      vertical-align: top; 
    }
    .amount-label { width: 50%; }
    .amount-value { width: 50%; text-align: right; font-weight: bold; }
    
    .total-line { 
      border-top: 1px solid #000; 
      font-size: 16px; 
      margin-top: 4px; 
      padding-top: 4px;
    }

    .footer { 
      margin-top: 15px; 
      text-align: right;
      padding-bottom: 20px;
    }

    @media print {
      body {
        margin: 0;
        padding: 4px;
      }
      .receipt {
        width: 280px;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="center" style="font-size: 11px;">Code: ${data.codeFRS || 'N/A'}</div>
    
    <div class="center title">BON DE PAIEMENT</div>
    
    <div class="divider"></div>

    <div class="info-group">
      <div><span class="bold">Fournisseur:</span> ${data.supplierName}</div>
      <div class="info-row">
        <span><span class="bold">Date:</span> ${new Date(data.date).toLocaleDateString('fr-FR')}</span>
        <span><span class="bold">N°:</span> 1</span>
      </div>
    </div>

    <div class="divider"></div>

    <table class="amount-table">
      <tr>
        <td class="amount-label">Ancien Solde</td>
        <td class="amount-value">${ancienSolde.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td class="amount-label">Versement</td>
        <td class="amount-value">${versement.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr class="total-line">
        <td class="bold">Nouveau Solde</td>
        <td class="amount-value">${nouveauSolde.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>

    ${data.observation ? `
    <div class="divider"></div>
    <div style="font-size: 11px; margin-top: 5px;">
      <span class="bold">Note:</span> ${data.observation}
    </div>
    ` : ''}

    <div class="divider"></div>

    <div class="footer">
      <div class="bold">Admin</div>
    </div>
  </div>
</body>
</html>`;

      // Send to Electron for silent printing (no dialog)
      if (window.electronAPI?.printReceipt) {
        window.electronAPI.printReceipt(receiptHtml).then(result => {
          if (result.success) {
            toast.success(language === 'ar' ? 'تمت الطباعة بنجاح' : 'Reçu imprimé avec succès');
            setReadyToPrint(false);
          } else {
            toast.error('Erreur impression: ' + (result.reason || 'inconnue'));
          }
        });
      } else {
        // Fallback: open in popup and let user print manually
        const blob = new Blob([receiptHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const pw = window.open(url, '_blank', 'width=320,height=500');
        if (pw) { pw.addEventListener('load', () => { pw.focus(); pw.print(); }); }
      }
    } catch (error) {
      console.error('Print Error:', error);
      toast.error(language === 'ar' ? 'خطأ في الطباعة' : 'Erreur lors de l\'impression');
    }
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
            <h2 className="text-2xl font-bold text-blue-900 ml-4">
              {language === 'ar' ? 'دفع المورد' : language === 'fr' ? 'Règlement Fournisseur' : 'Supplier Payment'}
            </h2>
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
            {/* Supplier Code */}
            <div className="flex items-center gap-4">
              <label className="text-lg font-bold text-gray-800 w-32">
                {language === 'ar' ? 'كود المورد' : language === 'fr' ? 'Code Fournisseur' : 'Supplier Code'}
              </label>
              <input
                type="text"
                name="codeFRS"
                value={formData.codeFRS}
                readOnly
                className="flex-1 px-3 py-1.5 border-2 border-blue-900 rounded-lg text-blue-900 font-bold bg-blue-50 focus:outline-none cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <label className="text-lg font-bold text-gray-800 w-32">
                  {language === 'ar' ? 'التاريخ' : 'Date'} <span className="text-red-500">*</span>
                </label>
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

            {/* Amount */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <label className="text-lg font-bold text-gray-800 w-32">
                  {language === 'ar' ? 'المبلغ' : language === 'fr' ? 'Montant' : 'Amount'} <span className="text-red-500">*</span>
                </label>
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

            {/* Payment Method */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <label className="text-lg font-bold text-gray-800 w-32">
                  {language === 'ar' ? 'طريقة الدفع' : language === 'fr' ? 'Mode de paiement' : 'Payment Method'} <span className="text-red-500">*</span>
                </label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleInputChange}
                  className={cn(
                    "flex-1 px-3 py-1.5 border-2 rounded-lg text-gray-800 font-medium focus:outline-none appearance-none",
                    errors.mode ? "border-red-500 bg-red-50" : "border-blue-900"
                  )}
                >
                  <option value="">{language === 'ar' ? 'اختر الطريقة...' : 'Select...'}</option>
                  <option value="especes">{t('supplierPayment.paymentMethod.cash')}</option>
                  <option value="cheque">{t('supplierPayment.paymentMethod.check')}</option>
                  <option value="virement">{t('supplierPayment.paymentMethod.transfer')}</option>
                </select>
              </div>
              {errors.mode && <p className="text-red-500 text-xs ml-36 font-bold">{errors.mode}</p>}
            </div>

            {/* Notes */}
            <div className="flex items-start gap-4">
              <label className="text-lg font-bold text-gray-800 w-32 pt-2">
                {language === 'ar' ? 'ملاحظات' : 'Notes'}
              </label>
              <textarea
                name="observation"
                value={formData.observation}
                onChange={handleInputChange}
                rows={4}
                className="flex-1 px-3 py-2 border-2 border-blue-900 rounded-lg text-gray-800 font-medium focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="w-64 flex flex-col items-center justify-between">
            {/* Status Section */}
            <div className="text-center space-y-2">
              <h4 className="text-xl font-bold text-red-800">
                {supplier?.nomEntreprise} (Debtor)
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
                className={`w-full flex items-center justify-between px-6 py-3 rounded-lg transition-all duration-300 shadow-md group ${showSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-700 hover:bg-blue-800'
                  } ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
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
                <span className="text-xl font-bold">{language === 'ar' ? 'إلغاء' : 'Cancel'}</span>
                <div className="w-5 h-5 flex items-center justify-center border-2 border-white rounded transform group-hover:scale-110 transition-transform">✕</div>
              </button>

              <button
                onClick={handlePrint}
                style={readyToPrint ? {
                  animation: 'printPulse 1s ease-in-out infinite',
                } : {}}
                className={`w-full flex items-center justify-between px-6 py-3 rounded-lg transition-all shadow-md group ${readyToPrint
                  ? 'bg-green-600 hover:bg-green-700 text-white ring-4 ring-green-300'
                  : 'bg-blue-700 hover:bg-blue-800 text-white'
                  }`}
              >
                <span className="text-xl font-bold">
                  {readyToPrint
                    ? (language === 'ar' ? '🖨 اطبع الآن!' : '🖨 Print Now!')
                    : (language === 'ar' ? 'طباعة الوصل' : 'Print the Receipt')}
                </span>
                <Printer className={`w-6 h-6 transform group-hover:scale-110 transition-transform ${readyToPrint ? 'animate-bounce' : ''}`} />
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
        clientData={supplier} // Passing supplier as clientData for UI consistency
      />
    </div>
  );
}
