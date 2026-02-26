import React, { useState } from 'react';
import { X, Printer, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * PrintReceiptModal — "BON DE PAIEMENT" template
 *
 * Matches the physical receipt format:
 *   Code: CLT-XXXX
 *   BON DE PAIEMENT (bold + underline)
 *   ---- dashed ----
 *   Client: …       Date: …       N°: …
 *   ---- dashed ----
 *   Ancien Solde        10 000,00
 *   Versement            1 000,00
 *   ____ solid ____
 *   Nouveau Solde       11 000,00  (bold)
 *   ---- dashed ----
 *                           Admin
 */
export default function PrintReceiptModal({ isOpen, onClose, receiptData, language = 'fr' }) {
    const [isPrinting, setIsPrinting] = useState(false);

    if (!isOpen || !receiptData) return null;

    const {
        codeClient = '',
        clientName = '',
        paidAmount = 0,
        previousBalance = 0,
        newBalance = 0,
        newBalanceType = 'negatif',
        receiptNo = '',
        formattedDate = '',
        printDate = new Date().toLocaleDateString('fr-FR'),
    } = receiptData;

    // French-style number formatter: 10 000,00
    const fmt = (val) =>
        parseFloat(val || 0).toLocaleString('fr-DZ', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const displayDate = formattedDate || printDate;

    // ── Build the printable HTML ─────────────────────────────────────────────
    const buildReceiptHTML = () => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Bon de Paiement</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
      color: #222;
      width: 80mm;
      margin: 0 auto;
      padding: 12px 10px 16px;
    }
    .code {
      text-align: center;
      font-size: 11px;
      color: #555;
      margin-bottom: 3px;
    }
    .title {
      text-align: center;
      font-size: 17px;
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 8px;
    }
    .dashed {
      border: none;
      border-top: 1px dashed #999;
      margin: 6px 0;
    }
    .solid {
      border: none;
      border-top: 1.5px solid #333;
      margin: 5px 0;
    }
    .client-line { margin: 3px 0; font-size: 12px; }
    .client-line b { font-weight: bold; }
    .date-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin: 3px 0;
      font-size: 12px;
    }
    .amount-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin: 4px 0;
      font-size: 12px;
    }
    .amount-row.total {
      font-weight: bold;
      font-size: 13px;
    }
    .admin {
      text-align: right;
      margin-top: 10px;
      font-size: 12px;
      color: #444;
    }
    @media print {
      body { width: 80mm; }
      @page { margin: 0; size: 80mm auto; }
    }
  </style>
</head>
<body>
  <div class="code">Code: ${codeClient}</div>
  <div class="title">BON DE PAIEMENT</div>

  <hr class="dashed"/>

  <div class="client-line"><b>Client:</b> ${clientName}</div>
  <div class="date-row">
    <span><b>Date:</b> ${displayDate}</span>
    <span>N°: ${receiptNo}</span>
  </div>

  <hr class="dashed"/>

  <div class="amount-row">
    <span>Ancien Solde</span>
    <span>${fmt(previousBalance)}</span>
  </div>
  <div class="amount-row">
    <span>Versement</span>
    <span>${fmt(paidAmount)}</span>
  </div>

  <hr class="solid"/>

  <div class="amount-row total">
    <span>Nouveau Solde</span>
    <span>${fmt(newBalance)}</span>
  </div>

  <hr class="dashed"/>

  <div class="admin">Admin</div>
</body>
</html>`;

    // ── Send to Electron native OS print dialog ───────────────────────────────
    const handleConfirmPrint = async () => {
        setIsPrinting(true);
        try {
            const html = buildReceiptHTML();

            if (window.electronAPI && window.electronAPI.printReceipt) {
                const result = await window.electronAPI.printReceipt(html);
                if (result && result.success === false) {
                    throw new Error(result.reason || 'Print failed');
                }
            } else {
                // Web fallback
                const win = window.open('', '_blank', 'width=420,height=520');
                win.document.write(html);
                win.document.close();
                win.focus();
                win.print();
                win.close();
            }

            toast.success(
                language === 'ar' ? 'تمت الطباعة بنجاح' : "Reçu envoyé à l'imprimante"
            );
            onClose();
        } catch (err) {
            console.error('Print error:', err);
            toast.error(language === 'ar' ? 'خطأ في الطباعة' : "Erreur d'impression");
        } finally {
            setIsPrinting(false);
        }
    };

    // ── JSX Preview (mirrors the printed layout) ─────────────────────────────
    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative flex flex-col items-center gap-5 p-6 bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-sm w-full mx-4"
                onClick={e => e.stopPropagation()}
                style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
            >
                {/* ── Modal header ── */}
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Printer className="w-5 h-5 text-blue-700" />
                        </div>
                        <h2 className="text-lg font-bold text-blue-900">
                            {language === 'ar' ? 'معاينة الوصل' : 'Aperçu du reçu'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Receipt preview card ── */}
                <div
                    className="w-full bg-white border border-gray-300 rounded shadow-lg overflow-hidden"
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif', maxWidth: '300px' }}
                >
                    {/* Top blue strip */}
                    <div className="h-1.5 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400" />

                    <div className="px-5 py-4 space-y-1" style={{ fontSize: '12px', color: '#222' }}>

                        {/* Code */}
                        <p style={{ textAlign: 'center', fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                            Code: {codeClient}
                        </p>

                        {/* Title */}
                        <p style={{
                            textAlign: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            textDecoration: 'underline',
                            marginBottom: '6px',
                        }}>
                            BON DE PAIEMENT
                        </p>

                        {/* Dashed separator */}
                        <div style={{ borderTop: '1px dashed #aaa', margin: '6px 0' }} />

                        {/* Client */}
                        <p><strong>Client:</strong> {clientName}</p>

                        {/* Date + N° */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span><strong>Date:</strong> {displayDate}</span>
                            <span style={{ color: '#444' }}>N°: {receiptNo}</span>
                        </div>

                        {/* Dashed separator */}
                        <div style={{ borderTop: '1px dashed #aaa', margin: '6px 0' }} />

                        {/* Ancien Solde */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                            <span>Ancien Solde</span>
                            <span>{fmt(previousBalance)}</span>
                        </div>

                        {/* Versement */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                            <span>Versement</span>
                            <span>{fmt(paidAmount)}</span>
                        </div>

                        {/* Solid separator */}
                        <div style={{ borderTop: '1.5px solid #333', margin: '5px 0' }} />

                        {/* Nouveau Solde */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            padding: '2px 0',
                        }}>
                            <span>Nouveau Solde</span>
                            <span>{fmt(newBalance)}</span>
                        </div>

                        {/* Dashed separator */}
                        <div style={{ borderTop: '1px dashed #aaa', margin: '6px 0' }} />

                        {/* Admin */}
                        <p style={{ textAlign: 'right', color: '#555', marginTop: '4px' }}>Admin</p>
                    </div>

                    {/* Bottom blue strip */}
                    <div className="h-1.5 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400" />
                </div>

                {/* ── Action buttons ── */}
                <div className="flex gap-3 w-full" style={{ maxWidth: '300px' }}>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-sm"
                    >
                        {language === 'ar' ? 'إلغاء' : 'Annuler'}
                    </button>

                    <button
                        onClick={handleConfirmPrint}
                        disabled={isPrinting}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold transition-all shadow-md hover:shadow-lg active:scale-95 text-sm"
                    >
                        {isPrinting
                            ? <Loader2 className="w-5 h-5 animate-spin" />
                            : <Printer className="w-5 h-5" />
                        }
                        <span>{language === 'ar' ? 'طباعة' : 'Imprimer'}</span>
                        {!isPrinting && <CheckCircle2 className="w-4 h-4 opacity-80" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
