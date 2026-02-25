import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import CategoryModal from './CategoryModal';
import ProductFamilyModal from './ProductFamilyModal';
import BrandModal from './BrandModal';
import BatchModal from './BatchModal';
import ProductListModal from './ProductListModal';
import StockManagementModal from './StockManagementModal';
import {
  Package,
  Plus,
  Grid3X3,
  Tag,
  Boxes,
  BarChart3,
  PackageCheck
} from 'lucide-react';

export default function ProductsStock() {
  const { t, direction, language } = useLanguage();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isProductListModalOpen, setIsProductListModalOpen] = useState(false);
  const [isStockManagementModalOpen, setIsStockManagementModalOpen] = useState(false);

  const actionButtons = [
    {
      id: 'category',
      title: t('products.category') || 'Catégories',
      description: t('products.categoryDesc') || 'Gérer les catégories de produits',
      icon: Grid3X3,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'addProductFamily',
      title: t('products.addProductFamily') || 'Familles de produits',
      description: t('products.addProductFamilyDesc') || 'Créer et gérer les familles de produits',
      icon: Package,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'addProductBrand',
      title: t('products.addProductBrand') || 'Marques',
      description: t('products.addProductBrandDesc') || 'Gérer les marques de produits',
      icon: Tag,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      id: 'addProduct',
      title: t('products.addProduct') || 'Ajouter produit',
      description: t('products.addProductDesc') || 'Créer un nouveau produit',
      icon: Plus,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      id: 'stockManagement',
      title: t('products.stockManagement') || 'Gestion de stock',
      description: t('products.stockManagementDesc') || 'Gérer et suivre le stock',
      icon: BarChart3,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      id: 'addBatch',
      title: t('products.addBatch') || 'Lots',
      description: t('products.addBatchDesc') || 'Gérer les lots de produits',
      icon: Boxes,
      color: 'bg-gradient-to-br from-teal-500 to-teal-600',
      hoverColor: 'hover:from-teal-600 hover:to-teal-700',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600'
    }
  ];

  const handleButtonClick = (action) => {
    switch (action) {
      case 'category':
        setIsCategoryModalOpen(true);
        break;
      case 'addProductFamily':
        setIsFamilyModalOpen(true);
        break;
      case 'addProductBrand':
        setIsBrandModalOpen(true);
        break;
      case 'addProduct':
        setIsProductListModalOpen(true);
        break;
      case 'stockManagement':
        setIsStockManagementModalOpen(true);
        break;
      case 'addBatch':
        setIsBatchModalOpen(true);
        break;
      default:
        break;
    }
  };

  return (
    <div className={`p-8 bg-slate-50 min-h-screen ${direction === 'rtl' ? 'rtl' : ''}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`mb-8 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center mb-4 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <div className={`p-3 bg-white rounded-xl shadow-sm border border-slate-200 ${direction === 'rtl' ? 'ml-4' : 'mr-4'}`}>
              <PackageCheck className="w-8 h-8" style={{ color: '#1b1b1b' }} />
            </div>
            <div>
              <h1 className="text-3xl mb-1" style={{ color: '#1b1b1b' }}>
                {t('products.title') || 'Produits / Stock'}
              </h1>
              <p className="text-slate-600">
                {t('products.subtitle') || 'Gérez vos produits, catégories, marques et stocks'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionButtons.map((button) => {
            const IconComponent = button.icon;

            return (
              <button
                key={button.id}
                onClick={() => handleButtonClick(button.id)}
                className={`
                  group relative overflow-hidden
                  bg-white hover:bg-slate-50
                  border border-slate-200 hover:border-slate-300
                  rounded-2xl p-6
                  shadow-sm hover:shadow-lg
                  transition-all duration-300 ease-in-out
                  transform hover:scale-[1.02] hover:-translate-y-1
                  ${direction === 'rtl' ? 'text-right' : 'text-left'}
                `}
              >
                {/* Background Gradient on Hover */}
                <div className={`
                  absolute inset-0 opacity-0 group-hover:opacity-5
                  ${button.color}
                  transition-opacity duration-300
                `} />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`
                    inline-flex items-center justify-center
                    w-16 h-16 rounded-xl mb-4
                    ${button.iconBg}
                    group-hover:scale-110
                    transition-transform duration-300
                  `}>
                    <IconComponent className={`w-8 h-8 ${button.iconColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 group-hover:text-slate-900" style={{ color: '#1b1b1b' }}>
                    {button.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 text-sm leading-relaxed group-hover:text-slate-700">
                    {button.description}
                  </p>

                  {/* Action Arrow */}
                  <div className={`
                    mt-4 flex items-center
                    ${direction === 'rtl' ? 'justify-start' : 'justify-end'}
                  `}>
                    <div className={`
                      w-8 h-8 rounded-full
                      ${button.color}
                      flex items-center justify-center
                      opacity-0 group-hover:opacity-100
                      transform ${direction === 'rtl' ? '-translate-x-2' : 'translate-x-2'} group-hover:translate-x-0
                      transition-all duration-300
                    `}>
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={direction === 'rtl' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Additional Info Card */}
        <div className="mt-12">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className={`flex items-start ${direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'space-x-4'} space-x-4`}>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className={`flex-1 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                <h3 className="mb-2" style={{ color: '#1b1b1b' }}>
                  {language === 'ar' ? 'إدارة شاملة للمنتجات' : 'Gestion complète des produits'}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {language === 'ar'
                    ? 'نظم منتجاتك بكفاءة حسب الفئات والعائلات والعلامات التجارية. قم بإدارة مخزونك في الوقت الفعلي مع نظام الدفعات لمتابعة دقيقة لمخزونك وتحسين إدارة عملك التجاري.'
                    : 'Organisez efficacement vos produits par catégories, familles et marques. Gérez vos stocks en temps réel avec un système de lots pour un suivi précis de vos inventaires et une optimisation de votre gestion commerciale.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Product Family Modal */}
      <ProductFamilyModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
      />

      {/* Brand Modal */}
      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
      />

      {/* Batch Modal */}
      <BatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
      />

      {/* Product List Modal */}
      <ProductListModal
        isOpen={isProductListModalOpen}
        onClose={() => setIsProductListModalOpen(false)}
      />

      {/* Stock Management Modal */}
      <StockManagementModal
        isOpen={isStockManagementModalOpen}
        onClose={() => setIsStockManagementModalOpen(false)}
      />
    </div>
  );
}

