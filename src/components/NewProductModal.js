import React, { useState, useEffect } from 'react';
import { X, Package, Save, Barcode, RefreshCw, Upload, Trash2, Printer, Image as ImageIcon, Calendar, Warehouse, Plus, Minus, Palette, Ruler, LayoutGrid, Bell, Search, Check } from 'lucide-react';
import { cn } from './ui/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export default function NewProductModal({ isOpen, onClose, productData = null, isEdit = false }) {
  const { t, direction } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const hasInitialized = React.useRef(false);

  useEffect(() => {
    const initializeModal = async () => {
      if (isOpen && !hasInitialized.current) {
        hasInitialized.current = true; // Mark as initialized immediately to avoid race conditions
        console.log('--- Modal Opening ---', { isEdit, productId: productData?.id });

        if (isEdit && productData) {
          setIsLoading(true);
          try {
            // Fetch full product details to get depot stocks
            const response = await window.electronAPI.products.getById(productData.id);
            console.log('DEBUG: Full product details response:', response);
            if (response.success && response.data) {
              console.log('DEBUG: ImagePath from backend:', response.data.imagePath);
            }

            const fullProduct = response.success ? response.data : productData;

            setFormData({
              codeBar: fullProduct.codeBar || '',
              barcodes: fullProduct.barcodes || [],
              ref: fullProduct.ean || '',
              designation: fullProduct.designation || '',
              category: fullProduct.categoryId?.toString() || '',
              family: fullProduct.familyId?.toString() || '',
              brand: fullProduct.brandId?.toString() || '',
              supplier: fullProduct.supplierId?.toString() || '',
              purchasePrice: fullProduct.purchasePrice?.toString() || '0.00',
              tva: fullProduct.taxPercent?.toString() || '0',
              retail: fullProduct.retailPrice?.toString() || '0.00',
              semiWholesale: fullProduct.semiWholesalePrice?.toString() || '0.00',
              wholesale: fullProduct.wholesalePrice?.toString() || '0.00',
              color: fullProduct.color || '',
              size: fullProduct.size || '',
              shelf: fullProduct.shelf || '',
              stockCategory: fullProduct.stockCategory || 'store_item',
              simpleQuantity: fullProduct.stock?.toString() || '0',
              storehouseStocks: fullProduct.storehouseStocks || [],
              productionDate: fullProduct.productionDate || '',
              expiryDate: fullProduct.expiryDate || '',
              alertDate: fullProduct.alertDate || '',
              alertQuantity: fullProduct.alertQuantity?.toString() || '0',
              batchNumber: fullProduct.batchNumber || '',
              productType: fullProduct.stockManagement || 'unit',
              imagePath: fullProduct.imagePath || null,
              imagePreview: fullProduct.imagePath ? `app-img://${fullProduct.imagePath}` : null,
              // Add missing compound pack fields
              packageQuantity: fullProduct.packageQuantity?.toString() || '1',
              packagePrice: fullProduct.packagePrice?.toString() || '0.00',
              isCompoundPack: fullProduct.isCompoundPack || false,
              compoundProducts: fullProduct.compoundProducts || [],
            });
          } catch (error) {
            console.error('Error fetching product details:', error);
            toast.error('Erreur lors du chargement des détails du produit');
          } finally {
            setIsLoading(false);
          }
        } else {
          // Reset form for COMPLETELY NEW product only when opening
          setFormData(prev => ({
            ...prev,
            codeBar: '',
            barcodes: [],
            ref: generateRef(),
            designation: '',
            category: '',
            family: '',
            brand: '',
            supplier: '',
            purchasePrice: '0.00',
            tva: '0',
            retail: '0.00',
            semiWholesale: '0.00',
            wholesale: '0.00',
            color: '',
            size: '',
            shelf: '',
            stockCategory: 'store_item',
            simpleQuantity: '0',
            storehouseStocks: [],
            productionDate: '',
            expiryDate: '',
            alertDate: '',
            alertQuantity: '0',
            batchNumber: generateBatchNumber(),
            productType: 'unit',
            image: null,
            imagePreview: null,
            // Ensure these are reset too
            packageQuantity: '1',
            packagePrice: '0.00',
            isCompoundPack: false,
            compoundProducts: [],
          }));
        }
        setErrors({});
        hasInitialized.current = true;
      } else if (!isOpen) {
        hasInitialized.current = false;
      }
    };

    initializeModal();
  }, [isOpen, isEdit, productData]);
  const [showBarcodeHint, setShowBarcodeHint] = useState(false);

  const generateRef = () => {
    // Generate a reference starting with PRD and followed by a portion of the timestamp
    return `PRD-${Date.now().toString().slice(-6)}`;
  };

  const generateBatchNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `LOT-${dateStr}-${random}`;
  };

  const [formData, setFormData] = useState({
    codeBar: '',
    barcodes: [], // Liste des codes-barres
    ref: generateRef(),
    designation: '',
    category: '',
    family: '',
    brand: '',
    supplier: '',
    stockIni: '0.00',
    purchasePrice: '0.00',
    tva: '0',
    retail: '0.00',
    retailMarginNet: '0.00',
    retailMarginPercent: '0.00',
    semiWholesale: '0.00',
    semiWholesaleMarginNet: '0.00',
    semiWholesaleMarginPercent: '0.00',
    wholesale: '0.00',
    wholesaleMarginNet: '0.00',
    wholesaleMarginPercent: '0.00',
    image: null,
    imagePreview: null,
    color: '',
    size: '',
    shelf: '',
    stockCategory: 'store_item', // 'stock' or 'store_item'
    simpleQuantity: '0',
    storehouseStocks: [], // Array of { id, name, quantity }
    productionDate: '',
    expiryDate: '',
    alertDate: '',
    alertQuantity: '0',
    batchNumber: '',
    minStock: '0',
    productType: 'unit',
    // Package specifications
    packageQuantity: '1',
    packagePrice: '0.00',
    isCompoundPack: false,
    compoundProducts: [], // Array of { id, designation, quantity, price }
  });

  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [showStockAlertModal, setShowStockAlertModal] = useState(false);
  const [showStorehouseModal, setShowStorehouseModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showShelfModal, setShowShelfModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showMultiBarcodeModal, setShowMultiBarcodeModal] = useState(false);
  const [multiBarcodeCount, setMultiBarcodeCount] = useState('1');
  const [newBarcodeValue, setNewBarcodeValue] = useState('');
  const [showCompoundPackModal, setShowCompoundPackModal] = useState(false);
  const [showShelfDepotSelection, setShowShelfDepotSelection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrintBarcodeModal, setShowPrintBarcodeModal] = useState(false);
  const [selectedBarcodeForPrint, setSelectedBarcodeForPrint] = useState('');
  const [printSettings, setPrintSettings] = useState({
    printer: 'Xprinter XP-80',
    format: '40x20',
    copies: 1,
    type: 'barcode_price' // 'barcode_price', 'price_ticket', 'barcode_only'
  });

  // Initial states for dynamic lists
  const [storehouses, setStorehouses] = useState([]);
  const [dbShelves, setDbShelves] = useState([]);

  const productTypes = [
    { value: 'unit', label: 'Unit' },
    { value: 'klg', label: 'Klg' },
    { value: 'm2', label: 'M2' },
    { value: 'meter', label: 'Meter' },
    { value: 'liter', label: 'Liter' },
    { value: 'package', label: 'Package' },
  ];

  const [colors, setColors] = useState([
    'Rouge', 'Bleu', 'Vert', 'Noir', 'Blanc', 'Gris', 'Jaune', 'Rose'
  ]);

  const [sizes, setSizes] = useState([
    'XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44', '50ml', '100ml', '500ml'
  ]);

  const [shelves, setShelves] = useState([]);

  const [newWhName, setNewWhName] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newSizeName, setNewSizeName] = useState('');
  const [newShelfName, setNewShelfName] = useState('');

  // Dropdown data states
  const [categories, setCategories] = useState([]);
  const [families, setFamilies] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [productList, setProductList] = useState([]);

  // Fetch dropdown data from database
  const fetchDropdownData = async () => {
    try {
      const [catRes, famRes, brandRes, supRes, whRes, shelfRes, prodRes] = await Promise.all([
        window.electronAPI.categories.getAll().catch(err => ({ success: false, error: err.message })),
        window.electronAPI.productFamilies.getAll().catch(err => ({ success: false, error: err.message })),
        window.electronAPI.brands.getAll().catch(err => ({ success: false, error: err.message })),
        window.electronAPI.suppliers.getAll().catch(err => ({ success: false, error: err.message })),
        window.electronAPI.storehouses.getAll().catch(err => ({ success: false, error: err.message })),
        window.electronAPI.shelves.getAll().catch(err => ({ success: false, error: err.message })),
        window.electronAPI.products.getAll().catch(err => ({ success: false, error: err.message }))
      ]);

      if (catRes && catRes.success) {
        setCategories(catRes.data.map(item => ({
          value: item.id.toString(),
          label: item.name
        })));
      }

      if (famRes && famRes.success) {
        setFamilies(famRes.data.map(item => ({
          value: item.id.toString(),
          label: item.name
        })));
      }

      if (brandRes && brandRes.success) {
        setBrands(brandRes.data.map(item => ({
          value: item.id.toString(),
          label: item.name
        })));
      }

      if (supRes && supRes.success) {
        setSuppliers(supRes.data.map(item => ({
          value: item.id.toString(),
          label: item.nom_entreprise || item.nomEntreprise || item.name || 'Unknown'
        })));
      }

      if (whRes && whRes.success) {
        setStorehouses(whRes.data);
      }

      if (shelfRes && shelfRes.success) {
        setDbShelves(shelfRes.data);
      }

      if (prodRes && prodRes.success) {
        console.log('DEBUG: Fetched products for compound pack:', prodRes.data.length);
        setProductList(prodRes.data.map(p => ({
          id: p.id.toString(),
          codeBar: p.codeBar || p.code_bar || '',
          designation: p.designation || '',
          price: p.retailPrice || p.retail_price || 0
        })));
      } else {
        console.error('DEBUG: Failed to fetch products for compound pack:', prodRes?.error);
      }
    } catch (error) {
      console.error('DEBUG: Error in fetchDropdownData:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);


  const handleRefReset = () => {
    handleInputChange('ref', generateRef());
  };

  const generateBarcodeValue = () => {
    return Math.floor(Math.random() * 9000000000000 + 1000000000000).toString();
  };

  const addBarcode = (value) => {
    let val = value?.toString().trim();

    // Auto-fix for common scanner concatenation (e.g. 123123 -> 123)
    if (val && val.length > 6 && val.length % 2 === 0) {
      const half = val.length / 2;
      const firstHalf = val.substring(0, half);
      const secondHalf = val.substring(half);
      if (firstHalf === secondHalf) {
        val = firstHalf;
      }
    }

    // If empty input but clicked add, show a note as requested
    if (!val) {
      setShowBarcodeHint(true);
      return;
    }

    setShowBarcodeHint(false);

    // Strict duplicate check
    if (formData.barcodes.some(b => b.toLowerCase() === val.toLowerCase())) {
      toast.error(t('product.barcode.alreadyScanned') || 'Ce code-barre a déjà été scanné');
      setNewBarcodeValue(''); // Clear it anyway to allow next scan
      return;
    }

    setFormData(prev => ({
      ...prev,
      barcodes: [...prev.barcodes, val],
      codeBar: prev.codeBar || val
    }));
    setNewBarcodeValue('');
  };

  const generateMultipleBarcodes = () => {
    const count = parseInt(multiBarcodeCount) || 0;
    if (count <= 0) {
      toast.error('Veuillez entrer un nombre valide');
      return;
    }

    if (count > 100) {
      toast.error('La limite est de 100 codes-barres à la fois');
      return;
    }

    const generated = [];
    let attempts = 0;
    const maxAttempts = count * 10;

    while (generated.length < count && attempts < maxAttempts) {
      const val = generateBarcodeValue();
      if (!formData.barcodes.includes(val) && !generated.includes(val)) {
        generated.push(val);
      }
      attempts++;
    }

    if (generated.length < count) {
      toast.warning(`${generated.length} codes générés sur ${count} demandés.`);
    }

    setFormData(prev => ({
      ...prev,
      barcodes: [...prev.barcodes, ...generated],
      codeBar: prev.codeBar || generated[0] || ''
    }));

    setShowMultiBarcodeModal(false);
    setMultiBarcodeCount('1');
    toast.success(`${generated.length} codes-barres générés`);
  };

  const removeBarcode = (val) => {
    setFormData(prev => {
      const newBarcodes = prev.barcodes.filter(b => b !== val);
      return {
        ...prev,
        barcodes: newBarcodes,
        codeBar: prev.codeBar === val ? (newBarcodes[0] || '') : prev.codeBar
      };
    });
  };

  const handlePrintBarcode = (barcode) => {
    setSelectedBarcodeForPrint(barcode);
    setShowPrintBarcodeModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: null
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate alertDate as 3 days before expiryDate
      if (field === 'expiryDate' && value) {
        const expiry = new Date(value);
        expiry.setDate(expiry.getDate() - 15); // Default to 15 days as per common practice if not specified, but let's stick to 3 if that's what was there
        // Actually, let's keep it at 3 as per the current code
        const expiry3 = new Date(value);
        expiry3.setDate(expiry3.getDate() - 3);
        updated.alertDate = expiry3.toISOString().split('T')[0];
      }


      return updated;
    });
  };

  const regenerateRef = () => {
    handleInputChange('ref', generateRef());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.codeBar.trim()) newErrors.codeBar = true;
    if (!formData.designation.trim()) newErrors.designation = true;
    if (!formData.productType) newErrors.productType = true;
    if (!formData.isCompoundPack && (parseFloat(formData.purchasePrice) <= 0 || formData.purchasePrice === '')) newErrors.purchasePrice = true;
    if (parseFloat(formData.retail) <= 0 || formData.retail === '') newErrors.retail = true;
    if (!formData.stockCategory) newErrors.stockCategory = true;

    if (formData.stockCategory === 'stock' && formData.storehouseStocks.length === 0) {
      newErrors.storehouseStocks = true;
    } else if (formData.stockCategory === 'store_item' && (parseInt(formData.simpleQuantity) <= 0 || formData.simpleQuantity === '')) {
      newErrors.simpleQuantity = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.warning('Veuillez remplir les champs obligatoires marqués en rouge');
      // Scroll to the first error if needed or just let the user see them
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const payload = {
        codeBar: formData.codeBar,
        ean: formData.ref,
        designation: formData.designation,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        taxPercent: parseFloat(formData.tva) || 0,
        wholesalePrice: parseFloat(formData.wholesale) || 0,
        semiWholesalePrice: parseFloat(formData.semiWholesale) || 0,
        retailPrice: parseFloat(formData.retail) || 0,
        categoryId: formData.category ? parseInt(formData.category) : null,
        familyId: formData.family ? parseInt(formData.family) : null,
        brandId: formData.brand ? parseInt(formData.brand) : null,
        supplierId: formData.supplier ? parseInt(formData.supplier) : null,
        stockCategory: formData.stockCategory,
        stockManagement: formData.productType,
        shelf: formData.shelf,
        color: formData.color,
        size: formData.size,
        stock: parseFloat(formData.stockCategory === 'stock'
          ? (formData.storehouseStocks.length > 0 ? getTotalQuantity() : formData.simpleQuantity)
          : formData.simpleQuantity) || 0,
        alertDate: formData.alertDate,
        alertQuantity: parseFloat(formData.alertQuantity) || 0,
        batchNumber: formData.batchNumber,
        expiryDate: formData.expiryDate,
        productionDate: formData.productionDate,
        image: formData.imagePreview, // Base64 image data
        storehouseStocks: formData.storehouseStocks // Include depot breakdown in save
      };

      let result;
      if (isEdit && productData?.id) {
        result = await window.electronAPI.products.update(productData.id, payload);
      } else {
        result = await window.electronAPI.products.create(payload);
      }

      if (result.success) {
        setIsSuccess(true);
        toast.success(isEdit ? 'Produit mis à jour avec succès' : 'Produit enregistré avec succès');
        setTimeout(() => {
          setIsSuccess(false);
          setIsLoading(false);
          onClose();
        }, 1500);
      } else {
        setIsLoading(false);
        toast.error(result.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Submit error:', error);
      toast.error(error.message || 'Une erreur est survenue lors de l\'enregistrement');
    }
  };

  const handleStorehouseQuantityChange = (storehouseId, name, quantity) => {
    const qty = parseInt(quantity) || 0;
    setFormData(prev => {
      const existing = prev.storehouseStocks.find(s => s.id === storehouseId);
      let newStocks;

      if (existing) {
        newStocks = prev.storehouseStocks.map(s =>
          s.id === storehouseId ? { ...s, quantity: qty } : s
        );
      } else {
        newStocks = [...prev.storehouseStocks, { id: storehouseId, name, quantity: qty }];
      }

      return { ...prev, storehouseStocks: newStocks };
    });
  };


  const getTotalQuantity = () => {
    if (!formData.storehouseStocks || formData.storehouseStocks.length === 0) return 0;
    return formData.storehouseStocks.reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0);
  };

  // Auto-calculate alertQuantity when total quantity changes if not manually edited
  React.useEffect(() => {
    const total = formData.stockCategory === 'stock' ? getTotalQuantity() : parseInt(formData.simpleQuantity || 0);
    if (!formData.alertQuantity || formData.alertQuantity === '0') {
      setFormData(prev => ({ ...prev, alertQuantity: total.toString() }));
    }
  }, [formData.storehouseStocks, formData.simpleQuantity, formData.stockCategory]);

  // Auto-generate alertDate when expiryDate changes (e.g., 30 days before)
  React.useEffect(() => {
    if (formData.expiryDate && !formData.alertDate) {
      const expiry = new Date(formData.expiryDate);
      expiry.setDate(expiry.getDate() - 3);
      const alertDateStr = expiry.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, alertDate: alertDateStr }));
    }
  }, [formData.expiryDate]);

  // Auto-calculate margins whenever prices change
  React.useEffect(() => {
    const buy = parseFloat(formData.purchasePrice) || 0;

    // Retail margins
    const retailPrice = parseFloat(formData.retail) || 0;
    const retailMarginNet = retailPrice - buy;
    const retailMarginPercent = buy !== 0 ? (retailMarginNet / buy) * 100 : 0;

    // Semi-wholesale margins
    const semiWholesalePrice = parseFloat(formData.semiWholesale) || 0;
    const semiWholesaleMarginNet = semiWholesalePrice - buy;
    const semiWholesaleMarginPercent = buy !== 0 ? (semiWholesaleMarginNet / buy) * 100 : 0;

    // Wholesale margins
    const wholesalePrice = parseFloat(formData.wholesale) || 0;
    const wholesaleMarginNet = wholesalePrice - buy;
    const wholesaleMarginPercent = buy !== 0 ? (wholesaleMarginNet / buy) * 100 : 0;

    setFormData(prev => {
      // Avoid re-triggering if values haven't actually changed in a meaningful way
      if (
        prev.retailMarginNet === retailMarginNet.toFixed(2) &&
        prev.retailMarginPercent === retailMarginPercent.toFixed(2) &&
        prev.semiWholesaleMarginNet === semiWholesaleMarginNet.toFixed(2) &&
        prev.semiWholesaleMarginPercent === semiWholesaleMarginPercent.toFixed(2) &&
        prev.wholesaleMarginNet === wholesaleMarginNet.toFixed(2) &&
        prev.wholesaleMarginPercent === wholesaleMarginPercent.toFixed(2)
      ) {
        return prev;
      }
      return {
        ...prev,
        retailMarginNet: retailMarginNet.toFixed(2),
        retailMarginPercent: retailMarginPercent.toFixed(2),
        semiWholesaleMarginNet: semiWholesaleMarginNet.toFixed(2),
        semiWholesaleMarginPercent: semiWholesaleMarginPercent.toFixed(2),
        wholesaleMarginNet: wholesaleMarginNet.toFixed(2),
        wholesaleMarginPercent: wholesaleMarginPercent.toFixed(2),
      };
    });
  }, [formData.purchasePrice, formData.retail, formData.semiWholesale, formData.wholesale]);

  const handleAddStorehouse = async () => {
    if (!newWhName.trim()) {
      toast.error('Veuillez entrer un nom pour le dépôt');
      return;
    }
    const newId = `wh-${Date.now()}`;
    const result = await window.electronAPI.storehouses.create({
      id: newId,
      name: newWhName.trim(),
      is_default: storehouses.length === 0
    });

    if (result.success) {
      fetchDropdownData();
      setNewWhName('');
      toast.success('Nouveau dépôt ajouté');
    } else {
      toast.error(result.error || 'Erreur lors de l\'ajout du dépôt');
    }
  };

  const handleDeleteStorehouse = async (id) => {
    const result = await window.electronAPI.storehouses.delete(id);
    if (result.success) {
      fetchDropdownData();
      setFormData(prev => ({
        ...prev,
        storehouseStocks: prev.storehouseStocks.filter(s => s.id !== id)
      }));
      toast.success('Dépôt supprimé');
    } else {
      toast.error(result.error || 'Erreur lors de la suppression');
    }
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    if (!colors.includes(newColorName.trim())) {
      setColors(prev => [newColorName.trim(), ...prev]);
    }
    handleInputChange('color', newColorName.trim());
    setNewColorName('');
    setShowColorModal(false);
  };

  const handleAddSize = () => {
    if (!newSizeName.trim()) return;
    if (!sizes.includes(newSizeName.trim())) {
      setSizes(prev => [newSizeName.trim(), ...prev]);
    }
    handleInputChange('size', newSizeName.trim());
    setNewSizeName('');
    setShowSizeModal(false);
  };

  const handleAddShelf = async (manualDepotId = null) => {
    if (!newShelfName.trim()) {
      toast.error('Veuillez entrer un nom d\'étagère');
      return;
    }

    // Determine which depot to use
    let targetWhId = manualDepotId;
    let targetWhName = '';

    if (!targetWhId) {
      const activeWh = formData.storehouseStocks.find(s => s.quantity > 0) || storehouses[0];
      if (!activeWh) {
        toast.error('Veuillez d\'abord configurer un dépôt');
        return;
      }
      targetWhId = activeWh.id;
      targetWhName = activeWh.name;
    } else {
      targetWhName = storehouses.find(wh => wh.id === manualDepotId)?.name || '';
    }

    const result = await window.electronAPI.shelves.create({
      name: newShelfName.trim(),
      storehouseId: targetWhId
    });

    if (result.success) {
      fetchDropdownData();
      handleInputChange('shelf', newShelfName.trim());
      setNewShelfName('');
      setShowShelfModal(false);
      setShowShelfDepotSelection(false);
      toast.success(`Étagère ajoutée et liée à ${targetWhName}`);
    } else {
      toast.error(result.error || 'Erreur lors de l\'ajout');
    }
  };

  const handleDeleteShelf = async (shelfId) => {
    const shelf = dbShelves.find(s => s.id === shelfId);
    const result = await window.electronAPI.shelves.delete(shelfId);
    if (result.success) {
      fetchDropdownData();
      if (formData.shelf === shelf?.name) {
        handleInputChange('shelf', '');
      }
      toast.success('Étagère supprimée');
    } else {
      toast.error(result.error || 'Erreur lors de la suppression');
    }
  };

  const handleDeleteColor = (colorToDelete) => {
    setColors(prev => prev.filter(c => c !== colorToDelete));
    if (formData.color === colorToDelete) {
      handleInputChange('color', '');
    }
  };

  const handleDeleteSize = (sizeToDelete) => {
    setSizes(prev => prev.filter(s => s !== sizeToDelete));
    if (formData.size === sizeToDelete) {
      handleInputChange('size', '');
    }
  };

  // No sync here to avoid mixing Product Type with Depot names


  // No redundant effect here, handled in the main effect with hasInitialized ref.

  if (!isOpen) return null;


  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl ${direction === 'rtl' ? 'rtl' : ''}`}
        style={{
          width: '90vw',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: '#1b1b1b' }}>
                {t('product.new.title') || 'Nouveau Produit'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Upload Section */}
            <div className="lg:col-span-1">
              <Label className="mb-2 block">Image du produit</Label>
              <div
                className={`relative group border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all duration-200 ${formData.imagePreview
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                  }`}
                style={{ height: '300px' }}
              >
                {formData.imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={formData.imagePreview}
                      alt="Product preview"
                      className="w-full h-full object-contain rounded-lg shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('image-upload').click()}
                        className="p-2 bg-white text-blue-600 rounded-full hover:scale-110 transition-transform shadow-lg"
                        disabled={formData.isCompoundPack}
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-2 bg-white text-red-600 rounded-full hover:scale-110 transition-transform shadow-lg"
                        disabled={formData.isCompoundPack}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => document.getElementById('image-upload').click()}
                    className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-blue-500 transition-colors"
                    disabled={formData.isCompoundPack}
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Cliquer pour ajouter</p>
                      <p className="text-xs">PNG, JPG up to 5MB</p>
                    </div>
                  </button>
                )}
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={formData.isCompoundPack}
                />

              </div>

              {/* Pricing Sections */}
              <div className="mt-6 space-y-5 px-1">
                {/* Section 01: Purchase & Tax */}
                <div className="space-y-3">
                  <div className={cn("flex items-center gap-2", formData.isCompoundPack && "opacity-50 pointer-events-none")}>
                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Coût d'Achat</h4>
                  </div>
                  <div className={cn("grid grid-cols-2 gap-3", formData.isCompoundPack && "opacity-50 pointer-events-none")}>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 ml-1">Prix d'Achat (DA)</Label>
                      <Input
                        type="number"
                        value={formData.purchasePrice}
                        onChange={(e) => {
                          handleInputChange('purchasePrice', e.target.value);
                          if (errors.purchasePrice) setErrors(prev => ({ ...prev, purchasePrice: false }));
                        }}
                        className={cn(
                          "h-9 font-bold text-blue-600 bg-slate-50/50 border-slate-100",
                          errors.purchasePrice && "border-red-500 bg-red-50"
                        )}
                        disabled={formData.isCompoundPack}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 ml-1">TVA / TAX (%)</Label>
                      <Input
                        type="number"
                        value={formData.tva}
                        onChange={(e) => handleInputChange('tva', e.target.value)}
                        className="h-9 border-slate-100"
                        disabled={formData.isCompoundPack}
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100/60 w-full"></div>

                {/* Section 02: Retail */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Vente Détail</h4>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Input
                      type="number"
                      value={formData.retail}
                      onChange={(e) => {
                        handleInputChange('retail', e.target.value);
                        if (errors.retail) setErrors(prev => ({ ...prev, retail: false }));
                      }}
                      placeholder="Prix détail"
                      className={cn(
                        "h-9 font-bold text-slate-700 border-slate-100 shadow-sm",
                        errors.retail && "border-red-500 bg-red-50"
                      )}
                      disabled={false}
                    />
                    <div className="flex items-center gap-3 px-1">
                      <span className="text-[10px] font-medium text-emerald-600">Marge: <span className="font-bold">{formData.retailMarginNet} DA</span></span>
                      <span className="text-[10px] font-medium text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">{formData.retailMarginPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Section 03: Semi-Wholesale */}
                <div className={cn("space-y-2", formData.isCompoundPack && "opacity-50 pointer-events-none")}>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Semi-Gros</h4>
                  </div>
                  <div className="space-y-1.5">
                    <Input
                      type="number"
                      value={formData.semiWholesale}
                      onChange={(e) => handleInputChange('semiWholesale', e.target.value)}
                      placeholder="Prix semi-gros"
                      className="h-9 font-bold text-slate-700 border-slate-100 shadow-sm"
                      disabled={formData.isCompoundPack}
                    />
                    <div className="flex items-center gap-3 px-1">
                      <span className="text-[10px] font-medium text-amber-600">Marge: <span className="font-bold">{formData.semiWholesaleMarginNet} DA</span></span>
                      <span className="text-[10px] font-medium text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full">{formData.semiWholesaleMarginPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Section 04: Wholesale */}
                <div className={cn("space-y-2", formData.isCompoundPack && "opacity-50 pointer-events-none")}>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-violet-500 rounded-full"></div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Gros</h4>
                  </div>
                  <div className="space-y-1.5">
                    <Input
                      type="number"
                      value={formData.wholesale}
                      onChange={(e) => handleInputChange('wholesale', e.target.value)}
                      placeholder="Prix de gros"
                      className="h-9 font-bold text-slate-700 border-slate-100 shadow-sm"
                      disabled={formData.isCompoundPack}
                    />
                    <div className="flex items-center gap-3 px-1">
                      <span className="text-[10px] font-medium text-violet-600">Marge: <span className="font-bold">{formData.wholesaleMarginNet} DA</span></span>
                      <span className="text-[10px] font-medium text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-full">{formData.wholesaleMarginPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information Form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code-barre</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        value={formData.codeBar}
                        onChange={(e) => {
                          handleInputChange('codeBar', e.target.value);
                          if (errors.codeBar) setErrors(prev => ({ ...prev, codeBar: false }));
                        }}
                        onBlur={async (e) => {
                          const val = e.target.value;
                          if (val && !isEdit) {
                            try {
                              const result = await window.electronAPI.products.getByBarcode(val);
                              if (result.success && result.data) {
                                toast.error(t('product.error.barcodeExists') || 'Ce code-barre est déjà utilisé par un autre produit');
                                setErrors(prev => ({ ...prev, codeBar: true }));
                              }
                            } catch (err) {
                              console.error('Error checking barcode:', err);
                            }
                          }
                        }}
                        placeholder="Code-barre principal"
                        className={cn("w-full pr-20", errors.codeBar && "border-red-500 bg-red-50")}
                      />
                      {formData.barcodes.length > 1 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100">
                          +{formData.barcodes.length - 1} AUTRES
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBarcodeModal(true)}
                      className="px-3 border-blue-600 text-blue-600 hover:bg-blue-50"
                      title="Gérer les codes-barres"
                    >
                      <Barcode className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Référence</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.ref}
                      onChange={(e) => handleInputChange('ref', e.target.value)}
                      placeholder="Référence"
                      className="flex-1 font-mono"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={regenerateRef}
                      className="px-3 hover:bg-gray-100"
                      title="Régénérer la référence"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Désignation *</Label>
                  <Input
                    value={formData.designation}
                    onChange={(e) => {
                      handleInputChange('designation', e.target.value);
                      if (errors.designation) setErrors(prev => ({ ...prev, designation: false }));
                    }}
                    placeholder="Désignation du produit"
                    required
                    className={cn(errors.designation && "border-red-500 bg-red-50")}
                  />
                </div>
                <div className={cn("space-y-2", formData.isCompoundPack && "opacity-50 pointer-events-none")}>
                  <Label>Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                    disabled={formData.isCompoundPack}
                  >
                    <SelectTrigger placeholder="Sélectionner une catégorie" />
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className={cn("space-y-2", formData.isCompoundPack && "opacity-50 pointer-events-none")}>
                  <Label>Famille</Label>
                  <Select
                    value={formData.family}
                    onValueChange={(value) => handleInputChange('family', value)}
                    disabled={formData.isCompoundPack}
                  >
                    <SelectTrigger placeholder="Sélectionner une famille" />
                    <SelectContent>
                      {families.map((fam) => (
                        <SelectItem key={fam.value} value={fam.value}>
                          {fam.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className={cn("space-y-2", formData.isCompoundPack && "opacity-50 pointer-events-none")}>
                  <Label>Marque</Label>
                  <Select
                    value={formData.brand}
                    onValueChange={(value) => handleInputChange('brand', value)}
                    disabled={formData.isCompoundPack}
                  >
                    <SelectTrigger placeholder="Sélectionner une marque" />
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.value} value={brand.value}>
                          {brand.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className={cn("space-y-2", formData.isCompoundPack && "opacity-50 pointer-events-none")}>
                  <Label>Fournisseur</Label>
                  <Select
                    value={formData.supplier}
                    onValueChange={(value) => handleInputChange('supplier', value)}
                    disabled={formData.isCompoundPack}
                  >
                    <SelectTrigger placeholder="Sélectionner un fournisseur" />
                    <SelectContent>
                      {suppliers.map((sup) => (
                        <SelectItem key={sup.value} value={sup.value}>
                          {sup.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dates de validité</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowExpiryModal(true)}
                    className="w-full justify-between font-normal border-slate-200 hover:border-blue-400"
                    disabled={formData.isCompoundPack}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className={(formData.expiryDate || formData.productionDate) ? "text-slate-900" : "text-slate-500"}>
                        {formData.expiryDate || formData.productionDate
                          ? `${formData.productionDate ? `Prod: ${formData.productionDate}` : ''}${formData.productionDate && formData.expiryDate ? ' | ' : ''}${formData.expiryDate ? `Expir: ${formData.expiryDate}` : ''}`
                          : 'Production & Péremption'}
                      </span>
                    </div>
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>{t('product.type') || 'Product type'}</Label>
                  <Select
                    value={formData.productType}
                    onValueChange={(value) => {
                      handleInputChange('productType', value);
                      if (errors.productType) setErrors(prev => ({ ...prev, productType: false }));
                    }}
                    disabled={formData.isCompoundPack}
                  >
                    <SelectTrigger
                      placeholder="Sélectionner un type"
                      className={cn(errors.productType && "border-red-500 bg-red-50")}
                    />
                    <SelectContent>
                      {productTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Specifications & Stock Section */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  Spécifications & Stock
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={cn("space-y-2", formData.isCompoundPack && "opacity-50 pointer-events-none")}>
                    <Label>Catégorie de Stock</Label>
                    <Select
                      value={formData.stockCategory}
                      onValueChange={(value) => {
                        handleInputChange('stockCategory', value);
                        if (errors.stockCategory) setErrors(prev => ({ ...prev, stockCategory: false }));
                      }}
                      disabled={formData.isCompoundPack}
                    >
                      <SelectTrigger className={cn(errors.stockCategory && "border-red-500 bg-red-50")} />
                      <SelectContent>
                        <SelectItem value="stock">Stock (Multi-dépôt)</SelectItem>
                        <SelectItem value="store_item">Article de Magasin (Simple)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{formData.stockCategory === 'stock' ? 'Gestion des Stocks' : 'Quantité Magasin'}</Label>
                    {formData.stockCategory === 'stock' ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowStorehouseModal(true);
                          if (errors.storehouseStocks) setErrors(prev => ({ ...prev, storehouseStocks: false }));
                        }}
                        className={cn(
                          "w-full justify-between font-normal border-slate-200 hover:border-blue-400 h-9 transition-all",
                          errors.storehouseStocks && "border-red-500 bg-red-50"
                        )}
                        disabled={formData.isCompoundPack}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Warehouse className="w-4 h-4 text-slate-500 shrink-0" />
                          <span className={cn(
                            "truncate text-[13px]",
                            formData.storehouseStocks.some(s => s.quantity > 0) ? "text-blue-700 font-bold" : "text-slate-400 font-light italic"
                          )}>
                            {formData.storehouseStocks.some(s => s.quantity > 0)
                              ? formData.storehouseStocks.filter(s => s.quantity > 0).map(s => s.name).join(', ')
                              : 'Choisir les dépôts'}
                          </span>
                        </div>
                        <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                      </Button>
                    ) : (
                      <Input
                        type="number"
                        value={formData.simpleQuantity}
                        onChange={(e) => {
                          handleInputChange('simpleQuantity', e.target.value);
                          if (errors.simpleQuantity) setErrors(prev => ({ ...prev, simpleQuantity: false }));
                        }}
                        placeholder="0"
                        className={cn(errors.simpleQuantity && "border-red-500 bg-red-50")}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Étagère / Rayon</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowShelfModal(true)}
                      className="w-full justify-between font-normal border-slate-200 hover:border-blue-400 h-9"
                      disabled={formData.isCompoundPack}
                    >
                      <div className="flex items-center gap-2 text-slate-600">
                        <LayoutGrid className="w-4 h-4" />
                        <span className={formData.shelf ? "text-slate-900 font-medium" : "text-slate-400 font-light italic"}>
                          {formData.shelf || 'Choisir...'}
                        </span>
                      </div>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Couleur</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowColorModal(true)}
                      className="w-full justify-between font-normal border-slate-200 hover:border-blue-400 h-9"
                      disabled={formData.isCompoundPack}
                    >
                      <div className="flex items-center gap-2 text-slate-600">
                        <Palette className="w-4 h-4" />
                        <span className={formData.color ? "text-slate-900 font-medium" : "text-slate-400 font-light italic"}>
                          {formData.color || 'Ex: Rouge, Bleu...'}
                        </span>
                      </div>
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Taille / Format</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSizeModal(true)}
                      className="w-full justify-between font-normal border-slate-200 hover:border-blue-400 h-9"
                      disabled={formData.isCompoundPack}
                    >
                      <div className="flex items-center gap-2 text-slate-600">
                        <Ruler className="w-4 h-4" />
                        <span className={formData.size ? "text-slate-900 font-medium" : "text-slate-400 font-light italic"}>
                          {formData.size || 'Ex: XL, 42, 500ml...'}
                        </span>
                      </div>
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantité Total Global</Label>
                    <div className="relative">
                      <Input
                        value={formData.stockCategory === 'stock' ? getTotalQuantity() : (formData.simpleQuantity || 0)}
                        readOnly
                        className="bg-slate-50 border-slate-200 font-bold text-blue-600 h-9"
                        placeholder="0"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Auto</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('product.stockAlert') || "Stock d'Alerte (Minimum)"}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowStockAlertModal(true)}
                      className="w-full justify-between font-normal border-slate-200 hover:border-blue-400 h-9"
                      disabled={formData.isCompoundPack}
                    >
                      <div className="flex items-center gap-2 text-slate-600">
                        <Bell className="w-4 h-4" />
                        <span className={formData.alertQuantity !== '0' || formData.alertDate ? "text-slate-900 font-medium" : "text-slate-400 font-light italic"}>
                          {formData.alertQuantity !== '0' ? `${formData.alertQuantity} units` : ''}
                          {formData.alertDate ? ` (${new Date(formData.alertDate).toLocaleDateString()})` : (formData.alertQuantity === '0' ? 'Configurer...' : '')}
                        </span>
                      </div>
                      <Plus className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Vente pack composé ?</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCompoundPackModal(true)}
                      className={`w-full justify-between font-normal h-9 transition-all ${formData.isCompoundPack
                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold'
                        : 'border-slate-200 hover:border-amber-400 text-slate-600'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Package className={`w-4 h-4 ${formData.isCompoundPack ? 'text-amber-600' : 'text-slate-400'}`} />
                        <span className="text-[13px]">
                          {formData.isCompoundPack ? `${formData.compoundProducts?.length || 0} produits sélectionnés` : 'Pack composé...'}
                        </span>
                      </div>
                      <Plus className={`w-4 h-4 ${formData.isCompoundPack ? 'text-amber-500' : 'text-slate-400'}`} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Package Specifications Section */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  Spécifications Paquet
                </h3>
                <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", formData.isCompoundPack && "opacity-50 pointer-events-none")}>
                  <div className="space-y-2">
                    <Label>Quantité par Paquet</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.packageQuantity}
                        onChange={(e) => handleInputChange('packageQuantity', e.target.value)}
                        placeholder="Ex: 12, 24..."
                        className="pl-9"
                        disabled={formData.isCompoundPack}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">Nombre d'unités contenues dans un paquet</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Prix du Paquet (DA)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.packagePrice}
                        onChange={(e) => handleInputChange('packagePrice', e.target.value)}
                        placeholder="0.00"
                        className="pl-9 font-bold text-amber-600"
                        disabled={formData.isCompoundPack}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500">
                        <span className="text-xs font-bold">DA</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">Prix de vente pour le paquet complet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Expiry Date Selection Modal */}
        {
          showExpiryModal && (
            <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Calendar className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">Dates de validité</h3>
                  </div>
                  <button onClick={() => setShowExpiryModal(false)}>
                    <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Date de Production</Label>
                    <Input
                      type="date"
                      value={formData.productionDate}
                      onChange={(e) => handleInputChange('productionDate', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de Péremption</Label>
                    <Input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date d'Alerte <span className="text-xs text-slate-400 font-normal">(3 jours avant péremption par défaut)</span></Label>
                    <Input
                      type="date"
                      value={formData.alertDate}
                      onChange={(e) => handleInputChange('alertDate', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Numéro de Lot (Auto)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.batchNumber}
                        onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                        className="flex-1 font-mono bg-slate-50"
                        placeholder="Numéro de lot"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleInputChange('batchNumber', generateBatchNumber())}
                        className="px-3 hover:bg-gray-100"
                        title="Régénérer le lot"
                      >
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => setShowExpiryModal(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    Confirmer
                  </Button>
                </div>
              </div>
            </div>
          )
        }

        {/* Storehouse Selection Modal */}
        {
          showStorehouseModal && (
            <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3 text-blue-600">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Warehouse className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 tracking-tight">Gestion des Stocks par Dépôt</h3>
                  </div>
                  <button onClick={() => setShowStorehouseModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                <div className="p-6 max-h-[450px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    {/* Add New Storehouse Section */}
                    <div className="flex gap-2 mb-6 p-4 rounded-xl bg-blue-50/30 border border-blue-100/50">
                      <Input
                        placeholder="Nom du nouveau dépôt..."
                        value={newWhName}
                        onChange={(e) => setNewWhName(e.target.value)}
                        className="bg-white border-blue-100 flex-1 h-10 shadow-sm focus:ring-blue-400"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStorehouse()}
                      />
                      <Button
                        onClick={handleAddStorehouse}
                        className="bg-blue-600 hover:bg-blue-700 h-10 px-4 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter</span>
                      </Button>
                    </div>

                    {storehouses.map((wh) => {
                      const currentStock = formData.storehouseStocks.find(s => s.id === wh.id);
                      return (
                        <div key={wh.id} className="group relative flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                              <Warehouse className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </div>
                            <span className="font-semibold text-slate-700 tracking-tight text-[15px]">{wh.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStorehouse(wh.id);
                              }}
                              className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Supprimer ce dépôt"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all text-slate-600"
                              onClick={() => handleStorehouseQuantityChange(wh.id, wh.name, (currentStock?.quantity || 0) - 1)}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              className="w-16 text-center h-9 font-bold text-slate-800 border-none bg-slate-50 rounded-lg focus:ring-0 focus:bg-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                              value={currentStock?.quantity || 0}
                              onChange={(e) => handleStorehouseQuantityChange(wh.id, wh.name, e.target.value)}
                            />
                            <button
                              type="button"
                              className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all text-slate-600"
                              onClick={() => handleStorehouseQuantityChange(wh.id, wh.name, (currentStock?.quantity || 0) + 1)}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="px-6 py-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-slate-500 font-medium">
                    Total global: <span className="font-bold text-blue-600 text-xl ml-1">{getTotalQuantity()} units</span>
                  </div>
                  <Button
                    onClick={() => setShowStorehouseModal(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
                  >
                    Valider
                  </Button>
                </div>
              </div>
            </div>
          )
        }

        {/* Color Selection Modal */}
        {
          showColorModal && (
            <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3 text-blue-600">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Palette className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 tracking-tight">Choisir une Couleur</h3>
                  </div>
                  <button onClick={() => setShowColorModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex gap-2 mb-6">
                    <Input
                      placeholder="Nouvelle couleur..."
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className="flex-1 h-10 shadow-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddColor()}
                    />
                    <Button onClick={handleAddColor} className="bg-blue-600 hover:bg-blue-700 h-10 px-4">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {colors.map((color) => (
                      <div key={color} className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange('color', color);
                            setShowColorModal(false);
                          }}
                          className={`w-full p-3 rounded-xl border text-sm font-medium transition-all ${formData.color === color
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                            : 'bg-slate-50 text-slate-700 border-slate-100 hover:border-blue-200 hover:bg-white'
                            }`}
                        >
                          {color}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteColor(color);
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Size Selection Modal */}
        {
          showSizeModal && (
            <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3 text-blue-600">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Ruler className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 tracking-tight">Choisir une Taille</h3>
                  </div>
                  <button onClick={() => setShowSizeModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex gap-2 mb-6">
                    <Input
                      placeholder="Nouvelle taille/format..."
                      value={newSizeName}
                      onChange={(e) => setNewSizeName(e.target.value)}
                      className="flex-1 h-10 shadow-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSize()}
                    />
                    <Button onClick={handleAddSize} className="bg-blue-600 hover:bg-blue-700 h-10 px-4">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {sizes.map((size) => (
                      <div key={size} className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange('size', size);
                            setShowSizeModal(false);
                          }}
                          className={`w-full p-3 rounded-xl border text-sm font-medium transition-all ${formData.size === size
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                            : 'bg-slate-50 text-slate-700 border-slate-100 hover:border-blue-200 hover:bg-white'
                            }`}
                        >
                          {size}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSize(size);
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Shelf Selection Modal */}
        {
          showShelfModal && (
            <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3 text-blue-600">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 tracking-tight">Choisir une Étagère</h3>
                  </div>
                  <button onClick={() => setShowShelfModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Nouvelle étagère (ex: Rayon D)..."
                      value={newShelfName}
                      onChange={(e) => setNewShelfName(e.target.value)}
                      className="flex-1 h-10 shadow-sm"
                      onKeyDown={(e) => e.key === 'Enter' && (storehouses.length > 1 ? setShowShelfDepotSelection(true) : handleAddShelf())}
                    />
                    <Button
                      onClick={() => {
                        if (!newShelfName.trim()) {
                          toast.error('Veuillez entrer un nom d\'étagère');
                          return;
                        }
                        if (storehouses.length > 1) {
                          setShowShelfDepotSelection(true);
                        } else {
                          handleAddShelf();
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 h-10 px-4"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="relative min-h-[350px]">
                    {showShelfDepotSelection && (
                      <div className="absolute inset-0 bg-white/98 z-20 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-xl border-t border-slate-100 -mx-6 px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-xs text-blue-600 uppercase tracking-wider">Lier à quel dépôt ?</h4>
                          <button onClick={() => setShowShelfDepotSelection(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                          {storehouses.map(wh => (
                            <button
                              key={wh.id}
                              type="button"
                              onClick={() => handleAddShelf(wh.id)}
                              className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group shadow-sm hover:shadow-md"
                            >
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-blue-200 group-hover:bg-white transition-colors">
                                <Warehouse className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <div className="text-[15px] font-bold text-slate-700 group-hover:text-blue-700">{wh.name}</div>
                                <div className="text-[11px] text-slate-400 uppercase tracking-tighter font-medium mt-0.5">Lier l'étagère "{newShelfName}"</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-4 text-[10px] text-slate-400 italic">
                      {formData.storehouseStocks.some(s => s.quantity > 0)
                        ? `Suggéré: ${formData.storehouseStocks.find(s => s.quantity > 0).name}`
                        : storehouses.length > 0 ? `Suggéré: ${storehouses[0].name}` : ''}
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {dbShelves
                        .filter(shelf => {
                          const activeWhIds = formData.storehouseStocks.filter(s => s.quantity > 0).map(s => s.id);
                          return activeWhIds.length === 0 || activeWhIds.includes(shelf.storehouse_id);
                        })
                        .map((shelf) => (
                          <div key={shelf.id} className="relative group">
                            <button
                              type="button"
                              onClick={() => {
                                handleInputChange('shelf', shelf.name);
                                setShowShelfModal(false);
                              }}
                              className={`w-full p-3 rounded-xl border text-sm font-medium transition-all ${formData.shelf === shelf.name
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                                : 'bg-slate-50 text-slate-700 border-slate-100 hover:border-blue-200 hover:bg-white'
                                }`}
                            >
                              <div className="flex flex-col items-center">
                                <span>{shelf.name}</span>
                                <span className="text-[9px] opacity-70 mt-1">
                                  {storehouses.find(wh => wh.id === shelf.storehouse_id)?.name || 'Dépôt inconnu'}
                                </span>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteShelf(shelf.id);
                              }}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      {dbShelves.filter(shelf => {
                        const activeWhIds = formData.storehouseStocks.filter(s => s.quantity > 0).map(s => s.id);
                        return activeWhIds.length === 0 || activeWhIds.includes(shelf.storehouse_id);
                      }).length === 0 && (
                          <div className="col-span-2 py-8 text-center text-slate-400 text-xs italic">
                            Aucune étagère trouvée pour ce dépôt.
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Barcode Management Modal */}
        {
          showBarcodeModal && (
            <div className="fixed inset-0 flex items-center justify-center z-[120] p-4 bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3 text-blue-600">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Barcode className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 tracking-tight">Gestion des Codes-barres</h3>
                  </div>
                  <button onClick={() => setShowBarcodeModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Entrer ou générer..."
                        value={newBarcodeValue}
                        onChange={(e) => setNewBarcodeValue(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="flex-1 h-10 shadow-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addBarcode(newBarcodeValue);
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowMultiBarcodeModal(true)}
                        className="px-3 border-blue-600 text-blue-600 hover:bg-blue-50"
                        title="Générer plusieurs codes"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => addBarcode(newBarcodeValue)}
                        className="bg-blue-600 hover:bg-blue-700 h-10 px-4"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {showBarcodeHint && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                          Note: Vous devez scanner, générer ou ajouter manuellement un code pour enregistrer cette étape.
                          <br />
                          <span className="text-[10px] opacity-70">(must scan/generate/add manually a code to save this step)</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {formData.barcodes.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 italic text-sm">
                        Aucun code-barre associé
                      </div>
                    ) : (
                      formData.barcodes.map((bc) => (
                        <div key={bc} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 group hover:border-blue-200 hover:bg-white transition-all">
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-bold text-slate-700">{bc}</span>
                            {formData.codeBar === bc && (
                              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Principal</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {formData.codeBar !== bc && (
                              <button
                                onClick={() => handleInputChange('codeBar', bc)}
                                className="text-[10px] font-bold text-slate-400 hover:text-blue-500 uppercase transition-colors"
                              >
                                Définir principal
                              </button>
                            )}
                            <button
                              onClick={() => handlePrintBarcode(bc)}
                              className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                              title="Imprimer le code-barre"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeBarcode(bc)}
                              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <Button onClick={() => setShowBarcodeModal(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                    Terminer
                  </Button>
                </div>
              </div>
            </div>
          )
        }

        {/* Barcode Print Preview Modal */}
        {
          showPrintBarcodeModal && (
            <div className="fixed inset-0 flex items-center justify-center z-[140] p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-700">Paramètres d'impression</h3>
                  </div>
                  <button onClick={() => setShowPrintBarcodeModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="flex h-[400px]">
                  {/* Left Sidebar: Settings */}
                  <div className="w-1/2 p-6 border-r border-slate-100 space-y-8 overflow-y-auto">
                    {/* Format Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-bold border-b border-slate-200 block pb-1">Format:</Label>
                      <div className="space-y-2">
                        {['40 x 20', '50 x 30', '45 x 35'].map(format => (
                          <label key={format} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input
                                type="radio"
                                name="format"
                                checked={printSettings.format === format}
                                onChange={() => setPrintSettings(prev => ({ ...prev, format }))}
                                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-blue-600 transition-all"
                              />
                              <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                            </div>
                            <span className="text-lg font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{format}</span>
                          </label>
                        ))}
                      </div>
                    </div>


                    {/* Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-bold border-b border-slate-200 block pb-1">Type:</Label>
                      <div className="space-y-3">
                        {[
                          { id: 'barcode_price', label: 'Code-barre et prix' },
                          { id: 'barcode_price_name', label: 'Code-barre et prix et nom de produit' },
                          { id: 'price_ticket', label: 'Ticket de prix' },
                          { id: 'barcode_only', label: 'Code-Barres' }
                        ].map(type => (
                          <label key={type.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input
                                type="radio"
                                name="type"
                                checked={printSettings.type === type.id}
                                onChange={() => setPrintSettings(prev => ({ ...prev, type: type.id }))}
                                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-blue-600 transition-all"
                              />
                              <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                            </div>
                            <span className="text-lg font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{type.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Preview */}
                  <div className="w-1/2 p-6 flex flex-col items-center justify-center space-y-8 bg-slate-50/30">
                    <div className="w-full space-y-2">
                      <Label className="text-sm font-bold">Code barre</Label>
                      <div className="h-10 border border-slate-300 bg-white rounded px-3 flex items-center font-mono text-sm">
                        {selectedBarcodeForPrint}
                      </div>
                    </div>

                    {/* Visual Preview Box */}
                    <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-lg flex flex-col items-center justify-center space-y-4 w-[280px] min-h-[180px]">
                      {/* Product Name if selected */}
                      {printSettings.type === 'barcode_price_name' && (
                        <div className="text-center mb-2 px-2">
                          <span className="text-sm font-bold text-slate-700 line-clamp-2 uppercase">
                            {formData.designation}
                          </span>
                        </div>
                      )}

                      {/* Fake Barcode CSS */}
                      {(printSettings.type === 'barcode_price' || printSettings.type === 'barcode_price_name' || printSettings.type === 'barcode_only') && (
                        <div className="flex flex-col items-center">
                          <div className="flex items-end gap-[1px] h-16 w-full max-w-[200px] mb-1">
                            {[1, 3, 1, 2, 1, 4, 1, 2, 1, 3, 1, 1, 2, 1, 2, 1, 3, 1, 2, 1].map((w, i) => (
                              <div key={i} className="bg-black" style={{ width: `${w}px`, height: '100%' }}></div>
                            ))}
                            {[1, 2, 1, 1, 3, 1, 2, 1, 4, 1, 1, 3, 1, 2, 1, 2, 1].map((w, i) => (
                              <div key={i + 20} className="bg-black" style={{ width: `${w}px`, height: '100%' }}></div>
                            ))}
                          </div>
                          <span className="text-[10px] font-mono font-bold tracking-[3px]">{selectedBarcodeForPrint}</span>
                        </div>
                      )}

                      {(printSettings.type === 'barcode_price' || printSettings.type === 'barcode_price_name' || printSettings.type === 'price_ticket') && (
                        <div className="text-center">
                          <span className="text-2xl font-black text-slate-900">
                            {parseFloat(formData.retail).toFixed(2)} DA
                          </span>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 mt-auto"
                      onClick={async () => {
                        try {
                          // 1. Prepare dimensions based on format
                          let width = "40mm";
                          let height = "20mm";
                          if (printSettings.format === '50 x 30') { width = "50mm"; height = "30mm"; }
                          else if (printSettings.format === '45 x 35') { width = "45mm"; height = "35mm"; }

                          // 2. Build Label HTML
                          const labelHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    @page { size: ${width} ${height}; margin: 0; }
    body { 
      margin: 0; padding: 0; 
      width: ${width}; height: ${height};
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: Arial, sans-serif; overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .barcode-container { 
      display: block; 
      text-align: center;
      width: 100%;
      margin-top: 2mm;
    }
    .bars { 
      display: block; 
      height: 10mm; 
      white-space: nowrap; 
      overflow: hidden;
      margin-bottom: 2px;
    }
    .bar { 
      display: inline-block;
      background-color: #000 !important; 
      height: 100%; 
      min-height: 10mm;
    }
    .barcode-text { font-size: 8px; font-weight: bold; margin-top: 1px; font-family: monospace; letter-spacing: 1px; }
    .price-text { font-size: 14px; font-weight: 900; margin-top: 2px; }
    .name-text { font-size: 10px; font-weight: bold; margin-bottom: 2px; text-align: center; width: 90%; text-transform: uppercase; }
    .only-price { font-size: 20px; font-weight: 900; }
  </style>
</head>
<body>
  ${printSettings.type === 'barcode_price_name' ? `
    <div class="name-text">${formData.designation}</div>
  ` : ''}

  ${(printSettings.type === 'barcode_price' || printSettings.type === 'barcode_price_name' || printSettings.type === 'barcode_only') ? `
    <div class="barcode-container">
      <div class="bars">
        ${[1, 3, 1, 2, 1, 4, 1, 2, 1, 3, 1, 1, 2, 1, 2, 1, 3, 1, 2, 1, 1, 2, 1, 1, 3, 1, 2, 1, 4, 1, 1, 3, 1, 2, 1, 2, 1, 1, 2, 1].map((w, i) => `
          <div class="bar" style="width: ${w * 2}px;"></div>
        `).join('')}
      </div>
      <div class="barcode-text">${selectedBarcodeForPrint}</div>
    </div>
  ` : ''}

  ${(printSettings.type === 'barcode_price' || printSettings.type === 'barcode_price_name' || printSettings.type === 'price_ticket') ? `
    <div class="${printSettings.type === 'price_ticket' ? 'only-price' : 'price-text'}">
      ${parseFloat(formData.retail).toFixed(2)} DA
    </div>
  ` : ''}
</body>
</html>`;

                          // 3. Print multiple copies if needed
                          if (window.electronAPI?.printReceipt) {
                            for (let i = 0; i < printSettings.copies; i++) {
                              await window.electronAPI.printReceipt(labelHtml);
                            }
                            toast.success(`${printSettings.copies} étiquette(s) envoyée(s) à l'imprimante`);
                            setShowPrintBarcodeModal(false);
                          } else {
                            toast.error("API d'impression non disponible");
                          }
                        } catch (err) {
                          console.error("Print Error:", err);
                          toast.error("Erreur lors de l'impression");
                        }
                      }}
                    >
                      Imprimer
                      <Printer className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Multi-Barcode Generation Modal */}
        {
          showMultiBarcodeModal && (
            <div className="fixed inset-0 flex items-center justify-center z-[130] p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50/50">
                  <div className="flex items-center gap-3 text-blue-600">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 tracking-tight">Générer Multiple</h3>
                  </div>
                  <button onClick={() => setShowMultiBarcodeModal(false)} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                    <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                <div className="p-8">
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <Label className="text-slate-600 font-medium">Nombre de codes-barres à générer</Label>
                      <div className="flex items-center justify-center gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => setMultiBarcodeCount(prev => Math.max(1, (parseInt(prev) || 1) - 1).toString())}
                          className="w-12 h-12 rounded-xl border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:border-blue-200 hover:text-blue-500 transition-all active:scale-90"
                        >
                          <Minus className="w-6 h-6" />
                        </button>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={multiBarcodeCount}
                          onChange={(e) => setMultiBarcodeCount(e.target.value)}
                          className="w-24 h-14 text-center text-2xl font-black border-2 border-blue-100 bg-blue-50/30 text-blue-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setMultiBarcodeCount(prev => Math.min(100, (parseInt(prev) || 1) + 1).toString())}
                          className="w-12 h-12 rounded-xl border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:border-blue-200 hover:text-blue-500 transition-all active:scale-90"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                      <p className="text-xs text-slate-500 text-center leading-relaxed">
                        Chaque code généré sera unique et s'ajoutera à la liste actuelle du produit.
                        Limite maximale : 100 unités par action.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMultiBarcodeModal(false)}
                    className="flex-1 h-12 rounded-xl border-slate-200 hover:bg-white"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    onClick={generateMultipleBarcodes}
                    className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200"
                  >
                    Générer
                  </Button>
                </div>
              </div>
            </div>
          )
        }

        {/* Stock Alert Configuration Modal */}
        {
          showStockAlertModal && (
            <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3 text-blue-600">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 tracking-tight leading-none">Configuration Alerte</h3>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">Paramètres de notification stock</p>
                    </div>
                  </div>
                  <button onClick={() => setShowStockAlertModal(false)} className="p-2 hover:bg-white rounded-full transition-all shadow-sm">
                    <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-700 font-bold flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        Quantité d'Alerte
                      </Label>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">Seuil Minimal</span>
                    </div>
                    <div className="relative group">
                      <Input
                        type="number"
                        value={formData.alertQuantity}
                        onChange={(e) => {
                          handleInputChange('alertQuantity', e.target.value);
                          handleInputChange('minStock', e.target.value); // Keep them in sync
                        }}
                        className="w-full h-14 pl-12 text-2xl font-black text-slate-800 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-2xl transition-all"
                        placeholder="0"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-blue-400 transition-colors">
                        <Plus className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 italic font-medium px-1">
                      L'alerte se déclenchera dès que le stock global sera inférieur à ce nombre.
                    </p>
                  </div>
                </div>

                <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex gap-3">
                  <Button
                    onClick={() => setShowStockAlertModal(false)}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
                  >
                    Confirmer
                  </Button>
                </div>
              </div>
            </div>
          )
        }

        <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
          <Button variant="outline" onClick={onClose}>
            {t('product.new.cancel') || 'Annuler'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isSuccess}
            className={cn(
              "min-w-32 transition-all duration-300 relative overflow-hidden",
              isSuccess ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 scale-105 shadow-lg shadow-emerald-200" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isSuccess ? (
              <Check className="w-4 h-4 mr-2 animate-in zoom-in duration-500" />
            ) : (
              <Save className={cn("w-4 h-4 mr-2", isLoading && "animate-pulse")} />
            )}
            {isSuccess ? 'Enregistré' : (isLoading ? (t('product.new.saving') || 'Enregistrement...') : (t('product.new.save') || 'Enregistrer'))}
          </Button>
        </div>

        {/* Compound Pack Configuration Modal */}
        {showCompoundPackModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
                <div className="flex items-center gap-3 text-amber-600">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 tracking-tight">Configuration du Pack Composé</h3>
                    <p className="text-xs text-amber-600/80 font-medium">Sélectionnez les produits à inclure dans ce package</p>
                  </div>
                </div>
                <button onClick={() => setShowCompoundPackModal(false)} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Left side: Product Selection */}
                <div className="flex-1 p-6 border-r border-slate-100 flex flex-col min-h-0">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher un produit par nom ou code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div className="overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '330px' }}>
                    <div className="space-y-2">
                      {productList.filter(p =>
                        p.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.codeBar.includes(searchTerm)
                      ).map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all group"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700 text-sm">{product.designation}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{product.codeBar}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-blue-600">{product.price.toFixed(2)} DA</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const exists = formData.compoundProducts.find(p => p.id === product.id);
                                if (!exists) {
                                  handleInputChange('compoundProducts', [...formData.compoundProducts, { ...product, quantity: 1 }]);
                                } else {
                                  toast.error('Ce produit est déjà dans le pack');
                                }
                              }}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 text-blue-600"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right side: Selected Products List & Quantities */}
                <div className="w-full md:w-[400px] bg-slate-50/50 p-6 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Contenu du Pack</h4>
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {formData.compoundProducts?.length || 0} ITEMS
                    </span>
                  </div>

                  <div className="overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '325px' }}>
                    {(formData.compoundProducts?.length || 0) > 0 ? (
                      <div className="space-y-3">
                        {formData.compoundProducts.map((item, idx) => (
                          <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-right-5 duration-200">
                            <div className="flex justify-between items-start mb-3">
                              <span className="font-bold text-slate-700 text-sm leading-tight pr-4">{item.designation}</span>
                              <button
                                onClick={() => {
                                  const newList = formData.compoundProducts.filter(p => p.id !== item.id);
                                  handleInputChange('compoundProducts', newList);
                                }}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-100">
                                <button
                                  className="w-7 h-7 rounded-md hover:bg-white hover:shadow-sm text-slate-500 flex items-center justify-center transition-all"
                                  onClick={() => {
                                    const newList = [...formData.compoundProducts];
                                    if (newList[idx].quantity > 1) {
                                      newList[idx].quantity -= 1;
                                      handleInputChange('compoundProducts', newList);
                                    }
                                  }}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center font-bold text-slate-700 text-xs">{item.quantity}</span>
                                <button
                                  className="w-7 h-7 rounded-md hover:bg-white hover:shadow-sm text-slate-500 flex items-center justify-center transition-all"
                                  onClick={() => {
                                    const newList = [...formData.compoundProducts];
                                    newList[idx].quantity += 1;
                                    handleInputChange('compoundProducts', newList);
                                  }}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="text-right flex flex-col items-end gap-1">
                                <div className="text-[10px] text-slate-400 font-medium italic">Vente Détail (DA)</div>
                                <Input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => {
                                    const newList = [...formData.compoundProducts];
                                    newList[idx].price = parseFloat(e.target.value) || 0;
                                    handleInputChange('compoundProducts', newList);
                                  }}
                                  className="w-24 h-7 text-right font-bold text-slate-700 bg-slate-50 border-slate-100 focus:bg-white text-xs px-2"
                                />
                                <div className="text-[10px] text-blue-500 font-bold mt-1">
                                  Sous-total: {(item.price * item.quantity).toFixed(2)} DA
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
                        <Package className="w-12 h-12 mb-3" />
                        <p className="text-sm font-medium">Votre pack est vide.<br />Ajoutez des produits pour commencer.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-slate-500">PRIX TOTAL PACK</span>
                      <span className="text-xl font-black text-blue-600">
                        {formData.compoundProducts?.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2) || '0.00'} DA
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        handleInputChange('isCompoundPack', true);
                        handleInputChange('retail', formData.compoundProducts?.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2) || '0.00');
                        setShowCompoundPackModal(false);
                        toast.success('Le pack a été configuré avec succès');
                      }}
                      disabled={(formData.compoundProducts?.length || 0) === 0}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-amber-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      <span>Enregistrer ce Pack</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
