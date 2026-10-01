import React, { useState } from 'react';
import { Download, Printer, FileText, LayoutDashboard, Waves, Database, Calculator, MapPin, FileDown, Languages, Globe, Award, Sparkles, Brain, Smartphone } from 'lucide-react';

interface HeaderProps {
  activeTab: 'report' | 'dashboard' | 'hecras' | 'looker' | 'calculator' | 'location' | 'ai';
  setActiveTab: (tab: 'report' | 'dashboard' | 'hecras' | 'looker' | 'calculator' | 'location' | 'ai') => void;
  onPrint: () => void;
  onQuickExport: () => void;
  onExportWord: () => void;
  onOpenSummary?: () => void;
  onExportGoogleEarth?: () => void;
  onOpenApkModal?: () => void;
  currentLocationName?: string;
  language: 'fr' | 'ar';
  setLanguage: (lang: 'fr' | 'ar') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onPrint,
  onQuickExport,
  onExportWord,
  onOpenSummary,
  onExportGoogleEarth,
  onOpenApkModal,
  currentLocationName,
  language,
  setLanguage
}) => {
  const isAr = language === 'ar';

  const navItems = [
    {
      id: 'location' as const,
      label: isAr ? 'منطقة الدراسة (Lieu)' : 'Zone d\'Étude (Lieu)',
      icon: MapPin,
      highlight: true
    },
    {
      id: 'report' as const,
      label: isAr ? 'تقرير الخبرة (Rapport)' : 'Rapport d\'Expertise',
      icon: FileText
    },
    {
      id: 'dashboard' as const,
      label: isAr ? 'لوحة القيادة (Dashboard)' : 'Tableau de Bord',
      icon: LayoutDashboard
    },
    {
      id: 'hecras' as const,
      label: isAr ? 'نمذجة HEC-RAS' : 'Modélisation HEC-RAS',
      icon: Waves
    },
    {
      id: 'calculator' as const,
      label: isAr ? 'حاسبة الأبعاد' : 'Dimensionnement',
      icon: Calculator
    },
    {
      id: 'ai' as const,
      label: isAr ? 'مستشار الذكاء الاصطناعي ✨' : 'Conseiller IA ✨',
      icon: Sparkles,
      highlight: true
    },
    {
      id: 'looker' as const,
      label: isAr ? 'بيانات Looker Studio' : 'Looker Studio Hub',
      icon: Database
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 no-print transition-all">
      {/* Primary Top Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          <button
            onClick={() => setActiveTab('report')}
            className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-cyan-300 transition-colors font-display text-left"
          >
            {isAr ? 'مشروع دراسة الفيضانات' : 'BR inondations'}
          </button>
        </div>

        {/* Zone 2: Desktop Navigation Links (hidden on mobile, visible on lg+) */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 font-semibold shadow-inner border border-slate-700'
                    : item.highlight
                    ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions + Word Export + Language Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'fr' ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'ar' ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              العربية
            </button>
          </div>

          {/* Google Earth KML Export Button */}
          {onExportGoogleEarth && (
            <button
              onClick={onExportGoogleEarth}
              title={isAr ? 'تنزيل حدود الحوض ومجرى الوادي لبرنامج Google Earth (.kml)' : 'Télécharger le fichier pour Google Earth (.kml)'}
              className="hidden md:flex px-2 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 rounded-md transition-colors items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Earth</span>
            </button>
          )}

          {/* Executive Summary Sheet Button */}
          {onOpenSummary && (
            <button
              onClick={onOpenSummary}
              title={isAr ? 'عرض بطاقة ملخص الحوض الفنية السريعة' : 'Fiche synthétique du bassin versant'}
              className="hidden sm:flex px-2 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/40 hover:bg-emerald-500/20 rounded-md transition-colors items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'بطاقة الحوض' : 'Fiche Synthèse'}</span>
            </button>
          )}

          {/* APK / App Installation Button */}
          {onOpenApkModal && (
            <button
              onClick={onOpenApkModal}
              title={isAr ? 'تثبيت التطبيق على الهاتف أو تنزيل APK' : 'Installer l\'app ou télécharger l\'APK'}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap shadow-[0_0_12px_rgba(16,185,129,0.35)] cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isAr ? 'تطبيق APK 📱' : 'App APK 📱'}</span>
            </button>
          )}

          {/* Word .doc Export Button */}
          <button
            onClick={onExportWord}
            title={isAr ? 'تصدير كامل الدراسة كملف وورد Microsoft Word (.doc)' : 'Exporter le rapport complet en document Word (.doc)'}
            className="px-2.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap shadow-[0_0_12px_rgba(37,99,235,0.4)] cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isAr ? 'وورد (.doc)' : 'Word (.doc)'}</span>
          </button>

          {/* Quick PDF Print Button */}
          <button
            onClick={onPrint}
            title={isAr ? 'طباعة أو تصدير PDF' : 'Imprimer ou exporter en PDF'}
            className="hidden sm:flex px-2 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 rounded-md hover:bg-slate-800 hover:text-white transition-colors items-center gap-1 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          {/* Quick CSV Export Button */}
          <button
            onClick={onQuickExport}
            className="px-2 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Looker</span>
          </button>
        </div>
      </div>

      {/* Secondary Responsive Scrollable Bar for Mobile & Tablets */}
      <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/90 px-2 py-1.5 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap flex items-center gap-1 font-medium transition-colors shrink-0 ${
                isActive
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              <Icon className="w-3 h-3 text-cyan-400" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
