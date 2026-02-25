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
    const [existingSuppliers, setExistingSuppliers] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    // Fetch existing suppliers to detect duplicates
    React.useEffect(() => {
        if (isOpen) {
            loadExistingSuppliers();
        }
    }, [isOpen]);

    const loadExistingSuppliers = async () => {
        try {
            const result = await apiService.getAllSuppliers();
            if (result.success) {
                setExistingSuppliers(result.data);
            }
        } catch (error) {
            console.error('Error loading existing suppliers:', error);
        }
    };

    if (!isOpen) return null;

    const columns = [
        "Nom de l'entreprise", "Code fournisseur", "Catégorie d'activité", "Téléphone",
        "Email", "Adresse", "NIF", "NIS", "RC", "AI", "Montant du solde", "Type de solde"
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

                // Parse rows and detect duplicates
                const parsedData = rows.filter(row => row.length > 0 && row[0]).map(row => {
                    const rowData = {};
                    columns.forEach(col => {
                        const index = headerMap[col];
                        rowData[col] = index !== undefined ? row[index] || '' : '';
                    });

                    // Check if already exists in database
                    const code = rowData["Code fournisseur"]?.toString().trim();
                    const name = rowData["Nom de l'entreprise"]?.toString().trim();

                    const isDuplicate = existingSuppliers.some(s =>
                        (code && s.codeSupplier === code) ||
                        (name && s.nomEntreprise.toLowerCase() === name.toLowerCase())
                    );

                    return {
                        ...rowData,
                        isDuplicate,
                        skip: isDuplicate // Default to true if duplicate
                    };
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
        const csvContent = '\uFEFF' + columns.join(',') + '\nTEST,FORN000001,Alimentaire,666666666,test@gmail.com,Paris,0,0,0,0,1500,Débit (-)\nTEST,FORN000002,Alimentaire,666666666,test@gmail.com,USA,0,0,0,0,180,Crédit (+)';
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'template_import_fournisseurs.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(language === 'ar' ? 'تم تحميل النموذج بنجاح' : 'Modèle téléchargé avec succès');
    };

    const confirmImport = async () => {
        setIsImporting(true);
        let successCount = 0;
        let failCount = 0;
        let skipCount = 0;
        let firstError = null;

        try {
            for (const item of previewData) {
                if (item.skip) {
                    skipCount++;
                    continue;
                }
                const rawAmount = parseFloat(item['Montant du solde'] || 0);
                const typeSolde = item['Type de solde'] || '';

                // If it's Debit (-), it usually means we have a credit on them (negative debt)
                // If it's Credit (+), it's a debt we owe them (positive balance)
                const solde = typeSolde.includes('-') ? -Math.abs(rawAmount) : Math.abs(rawAmount);

                const supplierData = {
                    nomEntreprise: item["Nom de l'entreprise"] ? item["Nom de l'entreprise"].toString().trim() : '',
                    codeSupplier: item["Code fournisseur"] ? item["Code fournisseur"].toString().trim() : '',
                    telephone: item['Téléphone'] ? item['Téléphone'].toString() : '',
                    email: item['Email'] ? item['Email'].toString().trim() : '',
                    adresse: item['Adresse'] ? item['Adresse'].toString().trim() : '',
                    categorieActivite: item["Catégorie d'activité"] ? item["Catégorie d'activité"].toString().trim() : '',
                    nif: item['NIF'] ? item['NIF'].toString() : '',
                    nis: item['NIS'] ? item['NIS'].toString() : '',
                    rc: item['RC'] ? item['RC'].toString() : '',
                    ai: item['AI'] ? item['AI'].toString() : '',
                    solde: solde,
                    typeSolde: solde >= 0 ? 'positif' : 'negatif',
                    statut: 'actif'
                };

                // Skip if required fields are missing
                if (!supplierData.nomEntreprise || !supplierData.codeSupplier) {
                    if (!firstError) firstError = language === 'ar' ? 'اسم الشركة وكود المورد مطلوبان' : 'Nom et Code sont requis';
                    failCount++;
                    continue;
                }

                const result = await apiService.createSupplier(supplierData);
                if (result && result.success) {
                    successCount++;
                } else {
                    const errorMsg = result?.error || 'Unknown error';
                    if (!firstError) firstError = errorMsg;
                    console.error('Failed to import supplier:', supplierData.nomEntreprise, errorMsg);
                    failCount++;
                }
            }

            if (failCount === 0) {
                toast.success(language === 'ar'
                    ? `تم استيراد ${successCount} مورد بنجاح${skipCount > 0 ? ` (تخطي ${skipCount})` : ''}`
                    : `Importation réussie : ${successCount} ajoutés${skipCount > 0 ? ` (${skipCount} ignorés)` : ''}.`);
            } else if (successCount > 0) {
                toast.warning(language === 'ar'
                    ? `تم استيراد ${successCount} مورد، وفشل ${failCount}. (أول خطأ: ${firstError})`
                    : `${successCount} importés, ${failCount} échoués. (Erreur: ${firstError})`);
            } else {
                toast.error(language === 'ar'
                    ? `فشل الاستيراد: ${firstError}`
                    : `Échec de l'importation: ${firstError}`);
            }

            // Close modal first
            onClose();

            // Notify and refresh with a small delay to ensure DB stability and UI smoothness
            setTimeout(() => {
                if (window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('supplierUpdated'));
                }
                if (onImportSuccess) {
                    onImportSuccess(previewData);
                }
            }, 500);

        } catch (error) {
            console.error('Error in confirmImport:', error);
            toast.error(language === 'ar' ? 'خطأ أثناء الاستيراد' : 'Erreur lors de l\'importation');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <div
                className="bg-white w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-gray-100 italic-none"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
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
                                    ? (language === 'ar' ? 'خطوات الاستيراد الصحيحة' : 'Guide et préparation du fichier')
                                    : (language === 'ar' ? 'معاينة الموردين قبل التأكيد' : 'Aperçu des fournisseurs avant confirmation')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Stepper block to match Client modal */}
                <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 ${step === 1 ? 'text-blue-600' : 'text-green-600'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 1 ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                                {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                            </div>
                            <span className="font-bold text-sm uppercase tracking-wider">{language === 'ar' ? 'إعداد الملف' : 'Préparation'}</span>
                        </div>
                        <div className={`h-1 flex-1 rounded-full ${step > 1 ? 'bg-green-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center gap-2 ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                2
                            </div>
                            <span className="font-bold text-sm uppercase tracking-wider">{language === 'ar' ? 'المعاينة والتأكيد' : 'Aperçu'}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {step === 1 ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
                                        <div className="flex gap-3">
                                            <Info className="w-6 h-6 text-amber-600 shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-amber-900 mb-2">
                                                    {language === 'ar' ? 'هام جداً' : 'Instructions Importantes'}
                                                </h4>
                                                <ul className="text-sm text-amber-800 space-y-2 list-disc ml-4">
                                                    <li>{language === 'ar' ? 'يجب الالتزام بترتيب الأعمدة كما هو موضح في النموذج.' : 'L\'ordre des colonnes doit être strictement identique au modèle.'}</li>
                                                    <li>{language === 'ar' ? 'تأكد من أن اسم الشركة وكود المورد والهاتف موجودة كحد أدنى.' : 'Le nom de l\'entreprise, le code et le téléphone sont obligatoires.'}</li>
                                                    <li>{language === 'ar' ? 'تأكد من صحة أرقام الهواتف والبيانات المالية.' : 'Vérifiez la validité des numéros de téléphone et des soldes.'}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                            <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                            {language === 'ar' ? 'تحميل النموذج' : 'Structure attendue du fichier'}
                                        </h3>

                                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                            <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">Template Preview</span>
                                                <Button
                                                    size="sm"
                                                    onClick={downloadTemplate}
                                                    className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs gap-2"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    {language === 'ar' ? 'تحميل كملف CSV' : 'Télécharger modèle CSV'}
                                                </Button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-[10px] text-left">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            {columns.map(col => (
                                                                <th key={col} className="p-2 border-r border-gray-200 font-black text-gray-600 whitespace-nowrap bg-blue-50/50">
                                                                    {col}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            {columns.map(col => (
                                                                <td key={col} className="p-2 border-r border-b border-gray-100 text-gray-400 italic">
                                                                    {col}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`flex-1 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center p-12 transition-all cursor-pointer group
                                            ${isDragging ? 'border-blue-500 bg-blue-50 scale-[0.98]' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110
                                            ${isDragging ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                            <Upload className="w-12 h-12" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-800 mb-2 text-center">
                                            {language === 'ar' ? 'قم بسحب وإفلات ملفك هنا' : 'Glissez-déposez votre fichier ici'}
                                        </h3>
                                        <p className="text-gray-500 mb-8 max-w-xs text-center font-medium">
                                            {language === 'ar' ? 'يدعم ملفات CSV و XLSX' : 'Supporte les fichiers CSV et XLSX'}
                                        </p>
                                        <div className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 group-hover:bg-blue-700">
                                            {language === 'ar' ? 'اختر ملفاً' : 'Sélectionner un fichier'}
                                        </div>
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
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-blue-900">
                                            {language === 'ar' ? 'تم فحص الملف:' : 'Fichier validé :'} {fileName}
                                        </h4>
                                        <p className="text-sm text-blue-700">
                                            {previewData.length} {language === 'ar' ? 'مورد مكتشف' : 'fournisseurs détectés'}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" onClick={() => setStep(1)} className="bg-white border-blue-200 text-blue-700 font-bold hover:bg-blue-100">
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    {language === 'ar' ? 'تغيير' : 'Changer de fichier'}
                                </Button>
                            </div>

                            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white">
                                <div className="bg-gray-100 p-4 border-b flex items-center gap-3">
                                    <Search className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Preview Mode (First 10 Rows)</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="p-4 border-r border-gray-200 font-black text-gray-700 w-10">
                                                    {/* Toggle All */}
                                                </th>
                                                <th className="p-4 border-r border-gray-200 font-black text-gray-700">
                                                    {language === 'ar' ? 'الحالة' : 'Statut'}
                                                </th>
                                                {columns.map(col => (
                                                    <th key={col} className="p-4 border-r border-gray-200 font-black text-gray-700 whitespace-nowrap">
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.slice(0, 50).map((row, idx) => (
                                                <tr key={idx} className={`border-b border-gray-100 transition-colors ${row.skip ? 'bg-gray-50 opacity-60' : 'hover:bg-blue-50/30'}`}>
                                                    <td className="p-4 border-r border-gray-100 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={!row.skip}
                                                            onChange={() => {
                                                                const newData = [...previewData];
                                                                newData[idx].skip = !newData[idx].skip;
                                                                setPreviewData(newData);
                                                            }}
                                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="p-4 border-r border-gray-100">
                                                        {row.isDuplicate ? (
                                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase">
                                                                {language === 'ar' ? 'موجود' : 'Existe déjà'}
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">
                                                                {language === 'ar' ? 'جديد' : 'Nouveau'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    {columns.map(col => (
                                                        <td key={col} className={`p-4 border-r border-gray-100 text-gray-600 font-medium ${row.isDuplicate && col === 'Code fournisseur' ? 'text-amber-600 font-bold' : ''}`}>
                                                            {row[col]}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <Button variant="ghost" onClick={onClose} disabled={isImporting} className="text-gray-500 font-bold hover:bg-gray-200">
                        {language === 'ar' ? 'إلغاء' : 'Annuler'}
                    </Button>

                    <div className="flex gap-3">
                        {step === 2 && (
                            <Button
                                onClick={confirmImport}
                                disabled={isImporting}
                                className="px-8 bg-green-600 hover:bg-green-700 text-white font-black text-lg shadow-xl shadow-green-100 gap-3"
                            >
                                {isImporting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {language === 'ar' ? 'جاري الاستيراد...' : 'Importation...'}
                                    </div>
                                ) : (
                                    <>
                                        <ChevronRight className="w-6 h-6" />
                                        {language === 'ar' ? 'تأكيد الاستيراد' : 'Confirmer l\'importation'}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
