import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle } from 'lucide-react';

export default function MobileApp() {
  const { t, direction } = useLanguage();

  const features = [
    t('mobileApp.statistics'),
    t('mobileApp.notifications'),
    t('mobileApp.stockManagement'),
    t('mobileApp.supplierStatus'),
    t('mobileApp.customerStatus')
  ];

  return (
    <div className={`p-8 bg-slate-50 min-h-screen ${direction === 'rtl' ? 'rtl' : ''}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`mb-8 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
          <h1 className="text-3xl mb-2" style={{ color: '#1b1b1b' }}>
            {t('mobileApp.title')}
          </h1>
          <p className="text-slate-600">
            {t('mobileApp.subtitle')}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Information */}
          <div className={`${direction === 'rtl' ? 'lg:order-2' : 'lg:order-1'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className={`mb-6 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                <h2 className="text-2xl mb-4" style={{ color: '#1b1b1b' }}>
                  {t('mobileApp.comingSoon')}
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {t('mobileApp.description')}
                </p>
              </div>

              <div className={`space-y-4 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                <h3 className="text-lg mb-4" style={{ color: '#1b1b1b' }}>
                  {t('mobileApp.featuresTitle')}
                </h3>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <CheckCircle className={`w-5 h-5 text-green-500 ${direction === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Note Section */}
              <div className={`mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                <p className="text-blue-800 text-sm">
                  <strong>{t('mobileApp.note') || 'Note:'}</strong> {t('mobileApp.noteDescription') || 'The mobile app will be available for download soon.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Mobile App Image */}
          <div className={`flex flex-col items-center ${direction === 'rtl' ? 'lg:order-1' : 'lg:order-2'}`}>
            {/* Download Badges */}
            <div className="flex flex-col items-center space-y-4">
              <h4 className="text-lg font-medium" style={{ color: '#1b1b1b' }}>
                {t('mobileApp.downloadSoon') || 'Download Soon'}
              </h4>
              {/* Download badges placeholder */}
              <div className="flex items-center space-x-4">
                <div className="bg-black rounded-lg px-4 py-2 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded"></div>
                  <div className="text-white">
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </div>
                <div className="bg-black rounded-lg px-4 py-2 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded"></div>
                  <div className="text-white">
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 text-center max-w-xs">
                {t('mobileApp.downloadNote') || 'Available on iOS and Android platforms'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom section - Additional info */}
        <div className="mt-12 flex justify-center">
          <div
            className="bg-white rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center px-6"
            style={{
              width: '756px', // 20 cm
              height: '151px',  // 4 cm
              maxWidth: '100%'
            }}
          >
            <div className={`text-center ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: '#1b1b1b' }}>
                {t('mobileApp.stayTuned') || 'Stay Tuned!'}
              </h3>
              <p className="text-slate-600 text-sm leading-tight">
                {t('mobileApp.stayTunedDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

