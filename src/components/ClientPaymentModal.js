import React, { useState, useEffect, useRef } from 'react';
import { Banknote, History, X, Calendar, Printer } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import PaymentHistoryModal from './PaymentHistoryModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && clientData) {
      const today = new Date().toISOString().split('T')[0]; // Use YYYY-MM-DD for date input
      setFormData({
        codeClient: clientData.id ? `CL-000${clientData.id}` : '',
        date: today,
        montant: '0.00',
        modeReglement: '',
        nPieces: '',
        observation: ''
      });
      setErrors({});
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
    if (!formData.montant || parseFloat(formData.montant) < 0) newErrors.montant = t('clientPayment.error.invalidAmount');
    if (!formData.modeReglement) newErrors.modeReglement = t('clientPayment.error.methodRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValidate = () => {
    if (validateForm()) {
      toast.success(t('clientPayment.success'));
      onClose();
    }
  };

  const handlePrint = () => {
    try {
      if (!validateForm()) {
        toast.error(language === 'ar' ? 'يرجى تصحيح الأخطاء قبل الطباعة' : 'Veuillez corriger les erreurs avant l\'impression');
        return;
      }

      // Thermal Receipt Format (80mm width, dynamic height)
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [80, 150]
      });

      const width = doc.internal.pageSize.getWidth();
      const centerX = width / 2;
      const margin = 7;
      let y = 12;

      // Header: Store Name & Slogan
      doc.setFont('courier', 'bold');
      doc.setFontSize(14);
      doc.text('MOUSSIR 26', centerX, y, { align: 'center' });
      y += 5;

      doc.setFontSize(7);
      doc.setFont('courier', 'normal');
      doc.text('PROFESSIONAL BUSINESS MANAGEMENT', centerX, y, { align: 'center' });
      y += 6;

      // Separator
      const separator = '- - - - - - - - - - - - - - - - - - - - -';
      doc.text(separator, centerX, y, { align: 'center' });
      y += 7;

      // Title: *** RECEIPT ***
      doc.setFontSize(16);
      doc.setFont('courier', 'bold');
      const recTitle = language === 'ar' ? '*** وصل دفع ***' : '***  RECEIPT  ***';
      doc.text(recTitle, centerX, y, { align: 'center' });
      y += 8;

      // Cashier and Date/Time Info
      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      const cashierStr = 'CASHIER #1';
      const dateStr = new Date(formData.date).toLocaleDateString();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      doc.text(cashierStr, margin, y);
      doc.text(`${dateStr} - ${timeStr}`, width - margin, y, { align: 'right' });
      y += 5;

      // Separator
      doc.text(separator, centerX, y, { align: 'center' });
      y += 8;

      // Item Section
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');

      // Label for the payment
      const itemLabel = language === 'ar' ? 'دفعة عميل' : 'CLIENT PAYMENT';
      doc.text(itemLabel, margin, y);
      doc.text(`${parseFloat(formData.montant).toFixed(2)}`, width - margin, y, { align: 'right' });
      y += 5;

      // Client Details Line
      doc.setFontSize(7);
      const clientNom = clientData?.nom || '';
      const clientPrenom = clientData?.prenom || '';
      const clientFullName = `${clientNom} ${clientPrenom}`.trim().toUpperCase();
      doc.text(`CLIENT: ${clientFullName}`, margin + 2, y);
      y += 4;
      doc.text(`REF: ${formData.codeClient || 'N/A'}`, margin + 2, y);
      y += 4;
      const methodVal = (formData.modeReglement === 'especes' ? 'CASH' :
        formData.modeReglement === 'cheque' ? 'CHECK' : 'TRANSFER');
      doc.text(`METHOD: ${methodVal}`, margin + 2, y);
      y += 7;

      // Separator before totals
      doc.setFontSize(8);
      doc.text(separator, centerX, y, { align: 'center' });
      y += 6;

      // Totals Section
      doc.setFontSize(9);
      doc.text('SUBTOTAL', margin, y);
      doc.text(`${parseFloat(formData.montant).toFixed(2)}`, width - margin, y, { align: 'right' });
      y += 5;
      const loyaltyLabel = language === 'ar' ? 'الرصيد السابق' : 'PREVIOUS BALANCE';
      doc.text(loyaltyLabel, margin, y);
      doc.text(`${parseFloat(clientData?.solde || 0).toFixed(2)}`, width - margin, y, { align: 'right' });
      y += 5;

      // Separator before main total
      doc.text(separator, centerX, y, { align: 'center' });
      y += 7;

      // TOTAL AMOUNT
      doc.setFontSize(11);
      doc.setFont('courier', 'bold');
      doc.text('TOTAL AMOUNT', margin, y);
      doc.text(`${parseFloat(formData.montant).toFixed(2)} DA`, width - margin, y, { align: 'right' });
      y += 7;

      // CASH and CHANGE
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      doc.text('CASH', margin, y);
      doc.text(`${parseFloat(formData.montant).toFixed(2)}`, width - margin, y, { align: 'right' });
      y += 5;
      doc.text('CHANGE', margin, y);
      doc.text('0.00', width - margin, y, { align: 'right' });
      y += 8;

      // Separator before footer
      doc.text(separator, centerX, y, { align: 'center' });
      y += 7;

      // Footer: THANK YOU FOR SHOPPING!
      doc.setFontSize(10);
      doc.setFont('courier', 'bold');
      const footerMsg = language === 'ar' ? 'شكرا لزيارتكم!' : 'THANK YOU FOR SHOPPING!';
      doc.text(footerMsg, centerX, y, { align: 'center' });
      y += 7;

      // Separator before barcode
      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.text(separator, centerX, y, { align: 'center' });
      y += 8;

      // Barcode mimic
      doc.setFontSize(16);
      doc.text('|| ||| | || |||| | ||| || ||', centerX, y, { align: 'center', charSpace: 1 });

      // Direct Print Execution
      doc.autoPrint();
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const blobUrl = doc.output('bloburl');
      iframe.src = blobUrl;

      toast.success(language === 'ar' ? 'تم تجهيز الوصل للطباعة' : 'Receipt ready for printing');

    } catch (error) {
      console.error('Print Error:', error);
      toast.error(language === 'ar' ? 'خطأ في الطباعة' : 'Printing error occurred');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className={`bg-white rounded-xl w-full max-w-4xl shadow-2xl border-2 border-gray-300 overflow-hidden flex flex-col ${direction === 'rtl' ? 'rtl' : ''}`} style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>

        {/* Simple Header like Screenshot */}
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
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="p-1 hover:bg-red-100 rounded text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 flex gap-8">
          {/* Left Column: Form */}
          <div className="flex-1 space-y-4">
            {/* Code Client */}
            <div className="flex items-center gap-4">
              <label className="text-lg font-bold text-gray-800 w-32">{t('clientPayment.clientCode')}</label>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  name="codeClient"
                  value={formData.codeClient}
                  readOnly
                  className="flex-1 px-3 py-1.5 border-2 border-blue-900 rounded-lg text-blue-900 font-bold bg-blue-50 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-4">
              <label className="text-lg font-bold text-gray-800 w-32">{t('clientPayment.date')}</label>
              <div className="relative flex-1">
                <input
                  ref={dateInputRef}
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border-2 border-blue-900 rounded-lg text-gray-800 font-medium focus:outline-none pr-10 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:hidden"
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

            {/* Montant */}
            <div className="flex items-center gap-4">
              <label className="text-lg font-bold text-gray-800 w-32">{t('clientPayment.amount').replace(' (DZD)', '').replace(' (DA)', '')}</label>
              <div className="relative flex-1">
                <input
                  type="text"
                  name="montant"
                  value={formData.montant}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border-2 border-blue-900 rounded-lg text-gray-800 font-medium focus:outline-none text-right pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-700">DA</span>
              </div>
            </div>

            {/* Mode Reg */}
            <div className="flex items-center gap-4">
              <label className="text-lg font-bold text-gray-800 w-32">{t('clientPayment.method')}</label>
              <select
                name="modeReglement"
                value={formData.modeReglement}
                onChange={handleInputChange}
                className="flex-1 px-3 py-1.5 border-2 border-blue-900 rounded-lg text-gray-800 font-medium focus:outline-none appearance-none"
              >
                <option value="">{t('clientPayment.select')}</option>
                <option value="especes">{t('clientPayment.cash')}</option>
                <option value="cheque">{t('clientPayment.check')}</option>
                <option value="virement">{t('clientPayment.transfer')}</option>
              </select>
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
                {clientData?.nom || clientData?.prenom} {t('clientPayment.debtor')}
              </h4>
              <p className="text-2xl font-black text-red-700">
                {(clientData?.solde || clientData?.montantDu || 0).toLocaleString('fr-DZ')} DA
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 w-full">
              <button
                onClick={handleValidate}
                className="w-full flex items-center justify-between px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all shadow-md group"
              >
                <span className="text-xl font-bold">{t('clientPayment.validate')}</span>
                <div className="w-5 h-5 flex items-center justify-center border-2 border-white rounded transform group-hover:scale-110 transition-transform">✓</div>
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
                className="w-full flex items-center justify-between px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all shadow-md group"
              >
                <span className="text-xl font-bold">{t('clientPayment.print')}</span>
                <Printer className="w-6 h-6 transform group-hover:scale-110 transition-transform" />
              </button>
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
    </div>
  );
}

