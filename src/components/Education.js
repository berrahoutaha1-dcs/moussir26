import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { Play, GraduationCap, Clock, BookOpen } from 'lucide-react';

export default function Education() {
  const { direction, t } = useLanguage();
  const videoId = 'So4SeJn3hf0';
  const startTime = 288;

  const additionalTutorials = [
    { title: t('education.tutorial1.title'), duration: t('education.tutorial1.duration') },
    { title: t('education.tutorial2.title'), duration: t('education.tutorial2.duration') },
    { title: t('education.tutorial3.title'), duration: t('education.tutorial3.duration') },
    { title: t('education.tutorial4.title'), duration: t('education.tutorial4.duration') },
    { title: t('education.tutorial5.title'), duration: t('education.tutorial5.duration') },
    { title: t('education.tutorial6.title'), duration: t('education.tutorial6.duration') }
  ];

  const quickTips = [
    { text: t('education.tip1'), color: 'bg-green-500' },
    { text: t('education.tip2'), color: 'bg-blue-500' },
    { text: t('education.tip3'), color: 'bg-purple-500' },
    { text: t('education.tip4'), color: 'bg-orange-500' }
  ];

  return (
    <div className={`p-8 bg-slate-50 min-h-screen ${direction === 'rtl' ? 'rtl' : ''}`}>
      {/* Header */}
      <div className={`mb-8 ${direction === 'rtl' ? 'text-right' : ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#1b1b1b15' }}
          >
            <GraduationCap className="w-6 h-6" style={{ color: '#1b1b1b' }} />
          </div>
          <div>
            <h1 className="text-3xl mb-1" style={{ color: '#1b1b1b' }}>{t('education.title')}</h1>
            <p className="text-slate-600">{t('education.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Main Video Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2" style={{ color: '#1b1b1b' }}>
                <Play className="w-5 h-5" />
                {t('education.mainTutorial')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-b-xl"
                  src={`https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=0&rel=0&modestbranding=1`}
                  title={t('education.videoTitle')}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video Info Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#1b1b1b' }}>
                <Clock className="w-5 h-5" />
                {t('education.informations')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">{t('education.totalDuration')}</p>
                <p className="text-lg" style={{ color: '#1b1b1b' }}>{t('education.duration')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">{t('education.level')}</p>
                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  {t('education.beginner')}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">{t('education.language')}</p>
                <p className="text-lg" style={{ color: '#1b1b1b' }}>{t('education.languageValue')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">{t('education.chapters')}</p>
                <p className="text-lg" style={{ color: '#1b1b1b' }}>{t('education.chaptersValue')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#1b1b1b' }}>
                <BookOpen className="w-5 h-5" />
                {t('education.quickTips')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className={`space-y-3 text-sm text-slate-700 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                {quickTips.map((tip, index) => (
                  <li key={index} className={`flex items-start gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-2 h-2 rounded-full ${tip.color} mt-2 flex-shrink-0`}></div>
                    <span>{tip.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Videos Section */}
      <div className="mb-8">
        <h2 className={`text-2xl mb-6 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ color: '#1b1b1b' }}>
          {t('education.additionalTutorials')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {additionalTutorials.map((video, index) => (
            <Card key={index} className="border-0 shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
              <div className="relative">
                {/* Video Thumbnail */}
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <img
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                    alt={video.title}
                  />
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                      <Play className={`w-6 h-6 text-gray-800 ${direction === 'rtl' ? 'mr-1' : 'ml-1'}`} />
                    </div>
                  </div>
                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className={`text-sm leading-tight ${direction === 'rtl' ? 'text-right' : 'text-left'}`} style={{ color: '#1b1b1b' }}>
                  {video.title}
                </h3>
                <p className={`text-xs text-slate-500 mt-1 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{t('education.tutorialBy')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

