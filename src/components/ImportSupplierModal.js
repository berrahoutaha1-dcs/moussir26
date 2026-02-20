import React, { useState, useRef } from 'react';
import {
    X,
    Upload,
    FileSpreadsheet,
    Download,
    AlertCircle,
    CheckCircle2,
    Info,
    ChevronRight,
    ChevronLeft,
    Search,
    Building2
} from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import apiService from '../services/api';

export default function ImportSupplierModal({ isOpen, onClose, onImportSuccess }) {
    const { language } = useLanguage();
    const fileInputRef = useRef(null);
    const [step, setStep] = useState(1); // 1: Guide/Template, 2: Preview
    const [isDragging, setIsDragging] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    if (!isOpen) return null;

    const columns = [
        'Company Name', 'Reference', 'Phone', 'Email', 'Address',
        'Activity', 'NIF', 'NIS', 'RC', 'AI', 'Balance'
    ];

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    const handleFile = async (file) => {
        if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
            toast.error(language === 'ar' ? 'يرجى اختيار ملف Excel أو CSV' : 'Veuillez choisir un fichier Excel ou CSV');
            return;
        }

        setFileName(file.name);

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Get JSON data from sheet
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (json.length < 2) {
                    toast.error(language === 'ar' ? 'الملف فارغ أو لا يحتوي على بيانات' : 'Le fichier est vide ou ne contient pas de données');
                    return;
                }

                const headers = json[0];
                const rows = json.slice(1);

                // Map headers to indices
                const headerMap = {};
                columns.forEach(col => {
                    const index = headers.findIndex(h => h && h.toString().trim().toLowerCase() === col.toLowerCase());
                    if (index !== -1) headerMap[col] = index;
                });

                // Parse rows
                const parsedData = rows.filter(row => row.length > 0 && row[0]).map(row => {
                    const rowData = {};
                    columns.forEach(col => {
                        const index = headerMap[col];
                        rowData[col] = index !== undefined ? row[index] || '' : '';
                    });
                    return rowData;
                });

                if (parsedData.length === 0) {
                    toast.error(language === 'ar' ? 'لم يتم العثور على بيانات صالحة' : 'Aucune donnée valide trouvée');
                    return;
                }

                setPreviewData(parsedData);
                setStep(2);
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error parsing file:', error);
            toast.error(language === 'ar' ? 'خطأ في قراءة الملف' : 'Erreur lors de la lecture du fichier');
        }
    };

    const downloadTemplate = () => {
        const csvContent = '\uFEFF' + columns.join(',') + '\nALPHA Industries,ALPHA2024,0555123456,contact@alpha.dz,"Zone Industrielle, Alger",Electronique,000,000,000,000,0';
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'supplier_import_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(language === 'ar' ? 'تم تحميل النموذج بنجاح' : 'Modèle téléchargé avec succès');
    };

    const confirmImport = async () => {
        setIsImporting(true);
        try {
            // In a real app, you'd loop and call apiService.createSupplier for each row
            // or use a bulk import endpoint if available.
            // For now, let's simulate and assume it works for the preview.

            for (const item of previewData) {
                const supplierData = {
                    nomEntreprise: item['Company Name'],
                    codeSupplier: item['Reference'],
                    telephone: item['Phone'].toString(),
                    email: item['Email'],
                    adresse: item['Address'],
                    categorieActivite: item['Activity'],
                    nif: item['NIF'].toString(),
                    nis: item['NIS'].toString(),
                    rc: item['RC'].toString(),
                    ai: item['AI'].toString(),
                    solde: parseFloat(item['Balance'] || 0),
                    typeSolde: 'positif'
                };
                await apiService.createSupplier(supplierData);
            }

            toast.success(language === 'ar' ? 'تم استيراد الموردين بنجاح' : 'Fournisseurs importés avec succès');

            // Trigger a refresh event
            if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('supplierUpdated'));
            }

            onImportSuccess && onImportSuccess(previewData);
            onClose();
        } catch (error) {
            console.error('Error importing suppliers:', error);
            toast.error(language === 'ar' ? 'خطأ أثناء الاستيراد' : 'Erreur lors de l\'importation');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <div className="bg-white w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-gray-100">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <Upload className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                {language === 'ar' ? 'استيراد قائمة الموردين' : 'Importer la Liste des Fournisseurs'}
                            </h2>
                            <p className="text-blue-100 text-sm opacity-90">
                                {step === 1
                                    ? (language === 'ar' ? 'إعداد ملف الموردين' : 'Guide et préparation du fichier')
                                    : (language === 'ar' ? 'معاينة الموردين' : 'Aperçu des fournisseurs avant confirmation')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {step === 1 ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                                        <div className="flex gap-3">
                                            <Info className="w-6 h-6 text-blue-600 shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-blue-900 mb-2">
                                                    {language === 'ar' ? 'تعليمات الاستيراد' : 'Instructions d\'importation'}
                                                </h4>
                                                <ul className="text-sm text-blue-800 space-y-2 list-disc ml-4">
                                                    <li>{language === 'ar' ? 'استخدم النموذج لتحقيق أفضل النتائج.' : 'Utilisez le modèle pour de meilleurs résultats.'}</li>
                                                    <li>{language === 'ar' ? 'تأكد من أن اسم الشركة وكود المورد والهاتف موجودة.' : 'Le nom, le code et le téléphone sont obligatoires.'}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                            <Building2 className="w-5 h-5 text-blue-600" />
                                            {language === 'ar' ? 'تحميل النموذج' : 'Télécharger le modèle'}
                                        </h3>
                                        <Button
                                            onClick={downloadTemplate}
                                            variant="outline"
                                            className="w-full flex items-center justify-center gap-2 border-dashed border-2 hover:bg-blue-50"
                                        >
                                            <Download className="w-5 h-5" />
                                            {language === 'ar' ? 'تحميل نموذج Excel/CSV' : 'Télécharger modèle Excel/CSV'}
                                        </Button>
                                    </div>
                                </div>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-4 border-dashed rounded-3xl flex flex-col items-center justify-center p-12 transition-all cursor-pointer bg-gray-50
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}
                                >
                                    <Upload className="w-16 h-16 text-blue-600 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                                        {language === 'ar' ? 'سحب الملف هنا' : 'Glissez votre fichier ici'}
                                    </h3>
                                    <p className="text-gray-500 text-sm text-center">
                                        {language === 'ar' ? 'يدعم ملفات CSV و XLSX' : 'Supporte les fichiers CSV et XLSX'}
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept=".csv, .xlsx"
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl border border-green-200">
                                <div>
                                    <h4 className="font-bold text-green-900">
                                        {language === 'ar' ? 'تم فحص الملف:' : 'Fichier validé :'} {fileName}
                                    </h4>
                                    <p className="text-sm text-green-700">
                                        {previewData.length} {language === 'ar' ? 'مورد مكتشف' : 'fournisseurs détectés'}
                                    </p>
                                </div>
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    {language === 'ar' ? 'تغيير' : 'Changer'}
                                </Button>
                            </div>

                            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {columns.map(col => (
                                                    <th key={col} className="p-3 text-left font-bold text-gray-700 border-b">
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.slice(0, 10).map((row, idx) => (
                                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                                    {columns.map(col => (
                                                        <td key={col} className="p-3 text-gray-600">
                                                            {row[col]}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {previewData.length > 10 && (
                                    <div className="p-2 text-center text-gray-400 italic text-xs">
                                        + {previewData.length - 10} more rows
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isImporting}>
                        {language === 'ar' ? 'إلغاء' : 'Annuler'}
                    </Button>
                    {step === 2 && (
                        <Button
                            onClick={confirmImport}
                            disabled={isImporting}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                        >
                            {isImporting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {language === 'ar' ? 'جاري الاستيراد...' : 'Importation...'}
                                </div>
                            ) : (
                                language === 'ar' ? 'تأكيد الاستيراد' : 'Confirmer l\'importation'
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
