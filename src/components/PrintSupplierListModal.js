import React, { useState } from 'react';
import { X, Printer, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * PrintSupplierListModal
 * Shows a preview of the supplier list in a modal, then prints via Electron IPC.
 *
 * Props:
 *  isOpen     – boolean
 *  onClose    – fn()
 *  suppliers  – array of supplier objects (filteredSuppliers)
 *  language   – 'fr' | 'ar' | 'en'
 */
export default function PrintSupplierListModal({ isOpen, onClose, suppliers = [], language = 'fr' }) {
    const [isPrinting, setIsPrinting] = useState(false);

    if (!isOpen) return null;

    const now = new Date();
    const printDate = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const printTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const fmt = (v) =>
        parseFloat(v || 0).toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // ── Build full-page printable HTML ──────────────────────────────────────
    const buildHTML = () => {
        const rows = suppliers.map((s, i) => `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td class="center">${i + 1}</td>
        <td><strong>${s.nomEntreprise || '—'}</strong><br/><span class="sub">${s.codeSupplier || ''}</span></td>
        <td>${s.responsable || '—'}</td>
        <td>${s.telephone || '—'}</td>
        <td>${s.email || '—'}</td>
        <td>${s.categorieActivite || '—'}</td>
        <td class="right amount">${fmt(s.solde ?? 0)} DA</td>
      </tr>`).join('');

        return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Liste des Fournisseurs</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10px;
      color: #222;
      padding: 20px 24px;
    }
    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .header-left h1 {
      font-size: 18px;
      font-weight: bold;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .header-left p {
      font-size: 10px;
      color: #555;
      margin-top: 2px;
    }
    .header-right {
      text-align: right;
      font-size: 9px;
      color: #666;
      line-height: 1.6;
    }
    /* ── Summary pills ── */
    .summary {
      display: flex;
      gap: 16px;
      margin-bottom: 14px;
    }
    .pill {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 5px 12px;
      font-size: 10px;
      color: #1e40af;
    }
    .pill strong { font-size: 13px; display: block; }
    /* ── Table ── */
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead tr {
      background: #1e3a8a;
      color: #fff;
    }
    thead th {
      padding: 7px 8px;
      text-align: left;
      font-size: 9px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    thead th.center { text-align: center; }
    thead th.right  { text-align: right; }
    tbody tr.even { background: #fff; }
    tbody tr.odd  { background: #f8faff; }
    tbody tr:hover { background: #eff6ff; }
    tbody td {
      padding: 6px 8px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
      font-size: 9.5px;
    }
    .sub  { color: #888; font-size: 8px; }
    .center { text-align: center; }
    .right  { text-align: right; }
    .amount { font-weight: bold; color: #1e3a8a; }
    /* ── Footer ── */
    .footer {
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      font-size: 9px;
      color: #888;
    }
    .total-row {
      background: #1e3a8a !important;
      color: #fff;
      font-weight: bold;
    }
    .total-row td { color: #fff; border-bottom: none; }
    @media print {
      body { padding: 12px 16px; }
      @page { margin: 10mm; size: A4 landscape; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <h1>${language === 'ar' ? 'قائمة الموردين' : 'Liste des Fournisseurs'}</h1>
      <p>${language === 'ar' ? 'إدارة مورديك' : 'Gestion de vos fournisseurs'}</p>
    </div>
    <div class="header-right">
      <div><strong>MOUSSIR 26</strong></div>
      <div>${language === 'ar' ? 'تاريخ الطباعة:' : 'Date d\'impression:'} ${printDate}</div>
      <div>${language === 'ar' ? 'الوقت:' : 'Heure:'} ${printTime}</div>
    </div>
  </div>

  <!-- Summary pills -->
  <div class="summary">
    <div class="pill">
      <strong>${suppliers.length}</strong>
      ${language === 'ar' ? 'مورد' : 'Fournisseur(s)'}
    </div>
    <div class="pill">
      <strong>${fmt(suppliers.reduce((s, x) => s + (x.solde ?? 0), 0))} DA</strong>
      ${language === 'ar' ? 'الرصيد الإجمالي' : 'Solde total'}
    </div>
  </div>

  <!-- Table -->
  <table>
    <thead>
      <tr>
        <th class="center" style="width:30px">#</th>
        <th>${language === 'ar' ? 'المورد / الكود' : 'Fournisseur / Code'}</th>
        <th>${language === 'ar' ? 'المسؤول' : 'Responsable'}</th>
        <th>${language === 'ar' ? 'الهاتف' : 'Téléphone'}</th>
        <th>Email</th>
        <th>${language === 'ar' ? 'الفئة' : 'Catégorie'}</th>
        <th class="right">${language === 'ar' ? 'الرصيد' : 'Solde'}</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <!-- Total row -->
      <tr class="total-row">
        <td colspan="6" style="text-align:right;padding-right:10px;">
          ${language === 'ar' ? 'المجموع الإجمالي' : 'Total général'}
        </td>
        <td class="right">${fmt(suppliers.reduce((s, x) => s + (x.solde ?? 0), 0))} DA</td>
      </tr>
    </tbody>
  </table>

  <!-- Footer -->
  <div class="footer">
    <span>${language === 'ar' ? 'تم الإنشاء تلقائياً بواسطة نظام MOUSSIR 26' : 'Généré automatiquement par MOUSSIR 26'}</span>
    <span>Admin</span>
  </div>
</body>
</html>`;
    };

    // ── Send to OS print dialog ──────────────────────────────────────────────
    const handleConfirmPrint = async () => {
        setIsPrinting(true);
        try {
            const html = buildHTML();
            if (window.electronAPI?.printReceipt) {
                const result = await window.electronAPI.printReceipt(html);
                if (result?.success === false) throw new Error(result.reason || 'Print failed');
            } else {
                const win = window.open('', '_blank', 'width=900,height=600');
                win.document.write(html);
                win.document.close();
                win.focus();
                win.print();
                win.close();
            }
            toast.success(language === 'ar' ? 'تمت الطباعة بنجاح' : "Liste envoyée à l'imprimante");
            onClose();
        } catch (err) {
            console.error('Print error:', err);
            toast.error(language === 'ar' ? 'خطأ في الطباعة' : "Erreur d'impression");
        } finally {
            setIsPrinting(false);
        }
    };

    const totalSolde = suppliers.reduce((s, x) => s + (x.solde ?? 0), 0);

    // ── JSX Preview ──────────────────────────────────────────────────────────
    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 w-full mx-4 overflow-hidden"
                style={{ maxWidth: '860px', maxHeight: '88vh', fontFamily: "'Segoe UI', Arial, sans-serif" }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Modal header bar ── */}
                <div className="flex items-center justify-between px-6 py-4 bg-blue-900 text-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Printer className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold uppercase tracking-wide">
                                {language === 'ar' ? 'معاينة قائمة الموردين' : 'Aperçu — Liste des Fournisseurs'}
                            </h2>
                            <p className="text-blue-200 text-xs mt-0.5">{printDate} · {printTime}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Summary strip ── */}
                <div className="flex items-center gap-6 px-6 py-3 bg-blue-50 border-b border-blue-100 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-bold text-blue-900">
                            {suppliers.length} {language === 'ar' ? 'مورد' : 'fournisseur(s)'}
                        </span>
                    </div>
                    <div className="text-sm text-gray-600">|</div>
                    <div className="text-sm font-semibold text-blue-900">
                        {language === 'ar' ? 'الرصيد الإجمالي:' : 'Solde total:'}&nbsp;
                        <span className="text-blue-700">{fmt(totalSolde)} DA</span>
                    </div>
                </div>

                {/* ── Table preview (scrollable) ── */}
                <div className="flex-1 overflow-auto px-4 py-4">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-blue-900 text-white">
                                <th className="px-3 py-2 text-center text-xs font-bold uppercase w-8">#</th>
                                <th className="px-3 py-2 text-left text-xs font-bold uppercase">
                                    {language === 'ar' ? 'المورد' : 'Fournisseur'}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-bold uppercase hidden md:table-cell">
                                    {language === 'ar' ? 'المسؤول' : 'Responsable'}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-bold uppercase hidden lg:table-cell">
                                    {language === 'ar' ? 'الهاتف' : 'Téléphone'}
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-bold uppercase hidden lg:table-cell">
                                    Email
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-bold uppercase hidden md:table-cell">
                                    {language === 'ar' ? 'الفئة' : 'Catégorie'}
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-bold uppercase">
                                    {language === 'ar' ? 'الرصيد' : 'Solde'}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((s, i) => (
                                <tr
                                    key={s.id}
                                    className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}
                                >
                                    <td className="px-3 py-2 text-center text-xs text-gray-400">{i + 1}</td>
                                    <td className="px-3 py-2">
                                        <div className="font-semibold text-gray-900 text-sm">{s.nomEntreprise || '—'}</div>
                                        <div className="text-xs text-gray-400">{s.codeSupplier}</div>
                                    </td>
                                    <td className="px-3 py-2 text-gray-700 text-xs hidden md:table-cell">{s.responsable || '—'}</td>
                                    <td className="px-3 py-2 text-gray-700 text-xs hidden lg:table-cell">{s.telephone || '—'}</td>
                                    <td className="px-3 py-2 text-gray-600 text-xs hidden lg:table-cell">{s.email || '—'}</td>
                                    <td className="px-3 py-2 hidden md:table-cell">
                                        {s.categorieActivite
                                            ? <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">{s.categorieActivite}</span>
                                            : <span className="text-gray-300 text-xs">—</span>
                                        }
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-blue-900 text-sm">
                                        {fmt(s.solde ?? 0)} DA
                                    </td>
                                </tr>
                            ))}
                            {/* Total row */}
                            <tr className="bg-blue-900 text-white">
                                <td colSpan={6} className="px-3 py-2 text-right text-sm font-bold uppercase tracking-wide">
                                    {language === 'ar' ? 'المجموع الإجمالي' : 'Total général'}
                                </td>
                                <td className="px-3 py-2 text-right font-black text-base">
                                    {fmt(totalSolde)} DA
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {suppliers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <Building2 className="w-12 h-12 mb-3 opacity-40" />
                            <p className="font-medium">{language === 'ar' ? 'لا يوجد موردون' : 'Aucun fournisseur à afficher'}</p>
                        </div>
                    )}
                </div>

                {/* ── Action buttons ── */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-sm"
                    >
                        {language === 'ar' ? 'إلغاء' : 'Annuler'}
                    </button>
                    <button
                        onClick={handleConfirmPrint}
                        disabled={isPrinting || suppliers.length === 0}
                        className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold transition-all shadow-md hover:shadow-lg active:scale-95 text-sm"
                    >
                        {isPrinting
                            ? <Loader2 className="w-5 h-5 animate-spin" />
                            : <Printer className="w-5 h-5" />
                        }
                        <span>
                            {isPrinting
                                ? (language === 'ar' ? 'جاري الطباعة...' : 'Impression en cours...')
                                : (language === 'ar' ? 'طباعة القائمة' : `Imprimer la liste (${suppliers.length})`)}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
