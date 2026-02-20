import React, { useState, useEffect, useRef } from 'react';
import { Banknote, History, X, Calendar, Printer } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import PaymentHistoryModal from './PaymentHistoryModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      setErrors({});
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
    if (!formData.montant || parseFloat(formData.montant) < 0) newErrors.montant = language === 'ar' ? 'مبلغ غير صالح' : 'Montant invalide';
    if (!formData.mode) newErrors.mode = language === 'ar' ? 'طريقة الدفع مطلوبة' : 'Mode de règlement requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValidate = () => {
    if (validateForm()) {
      toast.success(t('supplierPayment.success') || (language === 'ar' ? 'تم تسجيل الدفع بنجاح' : 'Paiement enregistré avec succès'));
      onClose();
    }
  };

  const handlePrint = () => {
    try {
      if (!validateForm()) {
        toast.error(language === 'ar' ? 'يرجى تصحيح الأخطاء قبل الطباعة' : 'Veuillez corriger les erreurs avant l\'impression');
        return;
      }

      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [80, 150]
      });

      const width = doc.internal.pageSize.getWidth();
      const centerX = width / 2;
      const margin = 7;
      let y = 12;

      doc.setFont('courier', 'bold');
      doc.setFontSize(14);
      doc.text('MOUSSIR 26', centerX, y, { align: 'center' });
      y += 5;

      doc.setFontSize(7);
      doc.setFont('courier', 'normal');
      doc.text('PROFESSIONAL BUSINESS MANAGEMENT', centerX, y, { align: 'center' });
      y += 6;

      const separator = '- - - - - - - - - - - - - - - - - - - - -';
      doc.text(separator, centerX, y, { align: 'center' });
      y += 7;

      doc.setFontSize(16);
      doc.setFont('courier', 'bold');
      const recTitle = language === 'ar' ? '*** وصل دفع مورد ***' : '*** SUPPLIER RECEIPT ***';
      doc.text(recTitle, centerX, y, { align: 'center' });
      y += 8;

      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.text('CASHIER #1', margin, y);
      const dateStr = new Date(formData.date).toLocaleDateString();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      doc.text(`${dateStr} - ${timeStr}`, width - margin, y, { align: 'right' });
      y += 5;

      doc.text(separator, centerX, y, { align: 'center' });
      y += 8;

      doc.setFontSize(9);
      const itemLabel = language === 'ar' ? 'دفعة مورد' : 'SUPPLIER PAYMENT';
      doc.text(itemLabel, margin, y);
      doc.text(`${parseFloat(formData.montant).toFixed(2)}`, width - margin, y, { align: 'right' });
      y += 5;

      doc.setFontSize(7);
      const supplierName = (supplier?.nomEntreprise || '').toUpperCase();
      doc.text(`SUPPLIER: ${supplierName}`, margin + 2, y);
      y += 4;
      doc.text(`REF: ${formData.codeFRS || 'N/A'}`, margin + 2, y);
      y += 4;
      const methodVal = (formData.mode === 'especes' ? 'CASH' :
        formData.mode === 'cheque' ? 'CHECK' :
          formData.mode === 'virement' ? 'TRANSFER' : 'OTHER');
      doc.text(`METHOD: ${methodVal}`, margin + 2, y);
      y += 7;

      doc.setFontSize(8);
      doc.text(separator, centerX, y, { align: 'center' });
      y += 6;

      doc.setFontSize(9);
      doc.text('SUBTOTAL', margin, y);
      doc.text(`${parseFloat(formData.montant).toFixed(2)}`, width - margin, y, { align: 'right' });
      y += 5;
      const balanceLabel = language === 'ar' ? 'الرصيد السابق' : 'PREVIOUS BALANCE';
      doc.text(balanceLabel, margin, y);
      doc.text(`${parseFloat(supplier?.solde || 0).toFixed(2)}`, width - margin, y, { align: 'right' });
      y += 5;

      doc.text(separator, centerX, y, { align: 'center' });
      y += 7;

      doc.setFontSize(11);
      doc.setFont('courier', 'bold');
      doc.text('TOTAL AMOUNT', margin, y);
      doc.text(`${parseFloat(formData.montant).toFixed(2)} DA`, width - margin, y, { align: 'right' });
      y += 15;

      doc.autoPrint();
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      iframe.src = doc.output('bloburl');

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

            {/* Date */}
            <div className="flex items-center gap-4">
              <label className="text-lg font-bold text-gray-800 w-32">
                {language === 'ar' ? 'التاريخ' : 'Date'}
              </label>
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

            {/* Amount */}
            <div className="flex items-center gap-4">
              <label className="text-lg font-bold text-gray-800 w-32">
                {language === 'ar' ? 'المبلغ' : language === 'fr' ? 'Montant' : 'Amount'}
              </label>
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

            {/* Payment Method */}
            <div className="flex items-center gap-4">
              <label className="text-lg font-bold text-gray-800 w-32">
                {language === 'ar' ? 'طريقة الدفع' : language === 'fr' ? 'Mode de paiement' : 'Payment Method'}
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleInputChange}
                className="flex-1 px-3 py-1.5 border-2 border-blue-900 rounded-lg text-gray-800 font-medium focus:outline-none appearance-none"
              >
                <option value="">{language === 'ar' ? 'اختر الطريقة...' : 'Select...'}</option>
                <option value="especes">{t('supplierPayment.paymentMethod.cash')}</option>
                <option value="cheque">{t('supplierPayment.paymentMethod.check')}</option>
                <option value="virement">{t('supplierPayment.paymentMethod.transfer')}</option>
              </select>
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
                {(supplier?.solde || 0).toLocaleString('fr-DZ')} DA
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 w-full">
              <button
                onClick={handleValidate}
                className="w-full flex items-center justify-between px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all shadow-md group"
              >
                <span className="text-xl font-bold">{language === 'ar' ? 'تأكيد' : 'Validate'}</span>
                <div className="w-5 h-5 flex items-center justify-center border-2 border-white rounded transform group-hover:scale-110 transition-transform">✓</div>
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
                className="w-full flex items-center justify-between px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all shadow-md group"
              >
                <span className="text-xl font-bold">{language === 'ar' ? 'طباعة الوصل' : 'Print the Receipt'}</span>
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
        clientData={supplier} // Passing supplier as clientData for UI consistency
      />
    </div>
  );
}
