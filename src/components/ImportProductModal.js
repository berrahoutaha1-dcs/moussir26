import React, { useState, useRef, useEffect } from 'react';
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
    Package
} from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import apiService from '../services/api';

const ImportProductModal = ({ isOpen, onClose, onImportSuccess }) => {
    const { language, direction } = useLanguage();
    const fileInputRef = useRef(null);
    const [step, setStep] = useState(1); // 1: Guide/Template, 2: Preview
    const [isDragging, setIsDragging] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [existingProducts, setExistingProducts] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    // Fetch existing products to detect duplicates
    useEffect(() => {
        if (isOpen) {
            loadExistingProducts();
        }
    }, [isOpen]);

    const loadExistingProducts = async () => {
        try {
            const result = await apiService.getAllProducts();
            if (result.success) {
                setExistingProducts(result.data);
            }
        } catch (error) {
            console.error('Error loading existing products:', error);
        }
    };

    if (!isOpen) return null;

    const columns = [
        "CODE BARRE", "REFERENCE", "DESIGNATION", "CATEGORIE", "FAMILLE", "MARQUE", "FOURNISSEUR",
        "CATEGORIE DE STOCK", "GESTION DES STOCKS", "ETAGERE / RAYON", "COULEUR", "TAILLE/FORMAT",
        "QUANTITE TOTAL GLOBAL", "STOCK ALERT", "PRIX D'ACHAT", "TVA/TAX %", "GROS", "SEMI-GROS", "DETAIL"
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

                // Map headers to indices with fuzzy matching
                const headerMap = {};
                columns.forEach(col => {
                    const colNormalized = col.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');

                    const index = headers.findIndex(h => {
                        if (!h) return false;
                        const hStr = h.toString().trim().toLowerCase();
                        const hNormalized = hStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');

                        // Exact match or normalized match
                        if (hStr === col.toLowerCase() || hNormalized === colNormalized) return true;

                        // Common variations
                        if (colNormalized === 'categorie' && (hNormalized === 'categore' || hNormalized === 'category')) return true;
                        if (colNormalized === 'reference' && hNormalized === 'ref') return true;
                        if (colNormalized === 'designation' && (hNormalized === 'nom' || hNormalized === 'designatio')) return true;
                        if (colNormalized === 'fournisseur' && hNormalized === 'fournisseu') return true;
                        if (colNormalized === 'gestiondesstocks' && (hNormalized === 'stockmanagement' || hNormalized === 'gestiondestock')) return true;

                        return false;
                    });
                    if (index !== -1) headerMap[col] = index;
                });

                // Parse rows and detect duplicates
                const parsedData = rows.filter(row => row.length > 0 && row[0]).map(row => {
                    const rowData = {};
                    columns.forEach(col => {
                        const index = headerMap[col];
                        rowData[col] = index !== undefined ? row[index] || '' : '';
                    });

                    // Check if already exists in database (by designation or barcode)
                    const barcode = rowData["CODE BARRE"]?.toString().trim();
                    const designation = rowData["DESIGNATION"]?.toString().trim();

                    const isDuplicate = existingProducts.some(p =>
                        (barcode && p.codeBar === barcode) ||
                        (designation && p.designation && p.designation.toLowerCase() === designation.toLowerCase())
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
        const header = columns.join(',');
        const row1 = ",,test,Modifié après,Modifié après,Modifié après,Modifié après,Stock (Multi-dépôt),Dépôt Principal,A-01,Modifié après,Modifié après,1000,Modifié après,150,Modifié après,Modifié après,Modifié après,190";
        const row2 = ",,test,Modifié après,Modifié après,Modifié après,Modifié après,Article de Magasin (Simple),Magasin,-,Modifié après,Modifié après,1500,Modifié après,200,Modifié après,Modifié après,Modifié après,500";
        const csvContent = '\uFEFF' + header + '\n' + row1 + '\n' + row2;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'template_import_produits.csv');
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

                const productData = {
                    codeBar: item["CODE BARRE"] ? item["CODE BARRE"].toString().trim() : '',
                    ean: item["REFERENCE"] ? item["REFERENCE"].toString().trim() : '',
                    designation: item["DESIGNATION"] ? item["DESIGNATION"].toString().trim() : '',
                    categoryName: item["CATEGORIE"] ? item["CATEGORIE"].toString().trim() : '',
                    familyName: item["FAMILLE"] ? item["FAMILLE"].toString().trim() : '',
                    brandName: item["MARQUE"] ? item["MARQUE"].toString().trim() : '',
                    supplierName: item["FOURNISSEUR"] ? item["FOURNISSEUR"].toString().trim() : '',
                    stockCategory: (item["CATEGORIE DE STOCK"]?.toString().toLowerCase().includes('multi') ? 'stock' : 'store_item'),
                    stockManagement: (item["CATEGORIE DE STOCK"]?.toString().toLowerCase().includes('multi') && (!item["GESTION DES STOCKS"] || item["GESTION DES STOCKS"].toString().trim().toLowerCase() === 'unit'))
                        ? 'Dépôt Principal'
                        : (item["GESTION DES STOCKS"] ? item["GESTION DES STOCKS"].toString().trim() : 'unit'),
                    shelf: item["ETAGERE / RAYON"] ? item["ETAGERE / RAYON"].toString().trim() : '',
                    color: item["COULEUR"] ? item["COULEUR"].toString().trim() : '',
                    size: item["TAILLE/FORMAT"] ? item["TAILLE/FORMAT"].toString().trim() : '',
                    stock: parseFloat(item["QUANTITE TOTAL GLOBAL"] || 0),
                    alertQuantity: parseFloat(item["STOCK ALERT"] || 0),
                    purchasePrice: parseFloat(item["PRIX D'ACHAT"] || 0),
                    taxPercent: parseFloat(item["TVA/TAX %"] || 0),
                    wholesalePrice: parseFloat(item["GROS"] || 0),
                    semiWholesalePrice: parseFloat(item["SEMI-GROS"] || 0),
                    retailPrice: parseFloat(item["DETAIL"] || 0),
                    statut: 'actif'
                };

                // Skip if required fields are missing
                if (!productData.designation) {
                    failCount++;
                    continue;
                }

                const result = await apiService.createProduct(productData);
                if (result && result.success) {
                    successCount++;
                } else {
                    const errorMsg = result?.error || 'Unknown error';
                    if (!firstError) firstError = errorMsg;
                    failCount++;
                }
            }

            if (failCount === 0) {
                toast.success(language === 'ar'
                    ? `تم استيراد ${successCount} منتج بنجاح${skipCount > 0 ? ` (تخطي ${skipCount})` : ''}`
                    : `Importation réussie : ${successCount} produits ajoutés${skipCount > 0 ? ` (${skipCount} ignorés)` : ''}.`);
            } else if (successCount > 0) {
                toast.warning(language === 'ar'
                    ? `تم استيراد ${successCount} منتج، وفشل ${failCount}.`
                    : `${successCount} importés, ${failCount} échoués.`);
            } else {
                toast.error(language === 'ar'
                    ? `فشل الاستيراد: ${firstError}`
                    : `Échec de l'importation: ${firstError}`);
            }

            onClose();

            // Trigger refresh
            if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('productUpdated'));
            }
            if (onImportSuccess) {
                onImportSuccess(previewData);
            }

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
                className={`bg-white w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-gray-100 ${direction === 'rtl' ? 'rtl' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className={`p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-4 ${direction === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <Upload className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                {language === 'ar' ? 'استيراد قائمة المنتجات' : 'Importer la Liste des Produits'}
                            </h2>
                            <p className="text-blue-100 text-sm opacity-90">
                                {step === 1
                                    ? (language === 'ar' ? 'خطوات الاستيراد الصحيحة' : 'Guide et préparation du fichier')
                                    : (language === 'ar' ? 'معاينة المنتجات قبل التأكيد' : 'Aperçu des produits avant confirmation')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Stepper */}
                <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
                    <div className={`flex items-center gap-4 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
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
                            <span className="font-bold text-sm uppercase tracking-wider">{language === 'ar' ? 'المعاينة' : 'Aperçu'}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {step === 1 ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${direction === 'rtl' ? 'text-right' : ''}`}>
                                <div className="space-y-6">
                                    <div className={`bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl ${direction === 'rtl' ? 'border-l-0 border-r-4 text-right' : ''}`}>
                                        <div className={`flex gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                            <Info className="w-6 h-6 text-amber-600 shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-amber-900 mb-2">
                                                    {language === 'ar' ? 'هام جداً' : 'Instructions Importantes'}
                                                </h4>
                                                <ul className={`text-sm text-amber-800 space-y-2 list-disc ml-4 ${direction === 'rtl' ? 'ml-0 mr-4' : ''}`}>
                                                    <li>{language === 'ar' ? 'يجب الالتزام بترتيب الأعمدة كما هو موضح في النموذج.' : 'L\'ordre des colonnes doit être strictement identique au modèle.'}</li>
                                                    <li>{language === 'ar' ? 'التسمية والباركود حقلان أساسيان لتعريف المنتج.' : 'La désignation et le code barre sont essentiels.'}</li>
                                                    <li>{language === 'ar' ? 'تأكد من صحة الأسعار والكميات قبل الرفع.' : 'Vérifiez les prix et les stocks avant l\'importation.'}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className={`font-bold text-gray-800 flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                            <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                            {language === 'ar' ? 'هيكل الملف المطلوب' : 'Structure attendue du fichier'}
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
                                                    <thead className="bg-gray-50 text-center">
                                                        <tr className={direction === 'rtl' ? 'flex-row-reverse' : ''}>
                                                            {columns.map(col => (
                                                                <th key={col} className="p-2 border-r border-gray-200 font-black text-gray-600 whitespace-nowrap bg-blue-50/50">
                                                                    {col}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {[
                                                            ["", "", "test", "Modifié après", "Modifié après", "Modifié après", "Modifié après", "Stock (Multi-dépôt)", "Dépôt Principal", "A-01", "Modifié après", "Modifié après", "1000", "Modifié après", "150", "Modifié après", "Modifié après", "Modifié après", "190"],
                                                            ["", "", "test", "Modifié après", "Modifié après", "Modifié après", "Modifié après", "Article de Magasin (Simple)", "Magasin", "-", "Modifié après", "Modifié après", "1500", "Modifié après", "200", "Modifié après", "Modifié après", "Modifié après", "500"]
                                                        ].map((exampleRow, rowIdx) => (
                                                            <tr key={rowIdx}>
                                                                {exampleRow.map((val, colIdx) => (
                                                                    <td key={colIdx} className="p-2 border-r border-b border-gray-100 text-gray-400 italic">
                                                                        {val}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
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
                            <div className={`flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-200 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-blue-900">
                                            {language === 'ar' ? 'تم فحص الملف:' : 'Fichier validé :'} {fileName}
                                        </h4>
                                        <p className="text-sm text-blue-700">
                                            {previewData.length} {language === 'ar' ? 'منتج مكتشف' : 'produits détectés'}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" onClick={() => setStep(1)} className="bg-white border-blue-200 text-blue-700 font-bold hover:bg-blue-100">
                                    <ChevronLeft className={`w-4 h-4 ${direction === 'rtl' ? 'rotate-180 ml-0 mr-2' : 'mr-2'}`} />
                                    {language === 'ar' ? 'تغيير الملف' : 'Changer de fichier'}
                                </Button>
                            </div>

                            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white">
                                <div className={`bg-gray-100 p-4 border-b flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                    <Search className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Aperçu des données</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr className={direction === 'rtl' ? 'flex-row-reverse' : ''}>
                                                <th className="p-4 border-r border-gray-200 font-black text-gray-700 w-10">
                                                    {/* Select */}
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
                                                <tr key={idx} className={`border-b border-gray-100 transition-colors ${row.skip ? 'bg-gray-50 opacity-60' : 'hover:bg-blue-50/30'} ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
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
                                                        <td key={col} className={`p-4 border-r border-gray-100 text-gray-600 font-medium whitespace-nowrap ${direction === 'rtl' ? 'text-right' : ''}`}>
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
                <div className={`p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
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
                                        <ChevronRight className={`w-6 h-6 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
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
};

export default ImportProductModal;
