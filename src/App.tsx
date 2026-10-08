/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { ReportView } from './components/ReportView';
import { DashboardView } from './components/DashboardView';
import { HecRasVisualizer } from './components/HecRasVisualizer';
import { HydraulicCalculator } from './components/HydraulicCalculator';
import { LookerStudioHub } from './components/LookerStudioHub';
import { LocationManager, PRESET_LOCATIONS } from './components/LocationManager';
import { ProjectLocationConfig } from './types/hydrology';
import { exportStudyToWord } from './utils/wordExport';
import { WordExportModal } from './components/WordExportModal';
import { ExecutiveSummaryModal } from './components/ExecutiveSummaryModal';
import { exportToGoogleEarthKml, exportToGeoJson } from './utils/gisExport';
import { AiHydrologyAdvisor } from './components/AiHydrologyAdvisor';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { AdvancedEngineeringHub } from './components/AdvancedEngineeringHub';

export default function App() {
  const [activeTab, setActiveTab] = useState<'report' | 'dashboard' | 'hecras' | 'looker' | 'calculator' | 'location' | 'ai' | 'advanced'>('location');
  const [locationConfig, setLocationConfig] = useState<ProjectLocationConfig>(PRESET_LOCATIONS[0]);
  const [language, setLanguage] = useState<'fr' | 'ar'>('ar');
  const [isWordModalOpen, setIsWordModalOpen] = useState<boolean>(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);

  const handlePrint = () => {
    setActiveTab('report');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleQuickExport = () => {
    setActiveTab('looker');
  };

  const handleExportWord = () => {
    setIsWordModalOpen(true);
  };

  const handleOpenSummary = () => {
    setIsSummaryModalOpen(true);
  };

  const handleExportGoogleEarth = () => {
    exportToGoogleEarthKml(locationConfig);
  };

  const handleExportGeoJson = () => {
    exportToGeoJson(locationConfig);
  };

  const handleUpdateConfig = (newConfig: ProjectLocationConfig) => {
    setLocationConfig(newConfig);
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 ${language === 'ar' ? 'font-arabic' : ''}`}>
      {/* Top Bar following 3-Zone Contract with Language & Word Export */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onPrint={handlePrint}
        onQuickExport={handleQuickExport}
        onExportWord={handleExportWord}
        onOpenSummary={handleOpenSummary}
        onExportGoogleEarth={handleExportGoogleEarth}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        currentLocationName={locationConfig.locationName}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full pb-16">
        {activeTab === 'location' && (
          <LocationManager
            currentConfig={locationConfig}
            onUpdateConfig={handleUpdateConfig}
            onNavigateToReport={() => setActiveTab('report')}
          />
        )}
        {activeTab === 'report' && (
          <ReportView
            onNavigateToLocation={() => setActiveTab('location')}
            currentLocationConfig={locationConfig}
            language={language}
            onExportWord={handleExportWord}
            onOpenSummary={handleOpenSummary}
            onExportGoogleEarth={handleExportGoogleEarth}
            onExportGeoJson={handleExportGeoJson}
            onNavigateToAi={() => setActiveTab('ai')}
          />
        )}
        {activeTab === 'dashboard' && <DashboardView locationConfig={locationConfig} />}
        {activeTab === 'hecras' && <HecRasVisualizer />}
        {activeTab === 'advanced' && <AdvancedEngineeringHub locationConfig={locationConfig} />}
        {activeTab === 'calculator' && <HydraulicCalculator />}
        {activeTab === 'looker' && <LookerStudioHub />}
        {activeTab === 'ai' && (
          <AiHydrologyAdvisor
            currentConfig={locationConfig}
            language={language}
            onNavigateToReport={() => setActiveTab('report')}
            onNavigateToCalculator={() => setActiveTab('calculator')}
          />
        )}
      </main>

      {/* Clean Engineering Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 px-4 lg:px-8 text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-semibold text-slate-300">[{locationConfig.projectName}]</span>
            <span className="text-slate-400">·</span>
            <span className="truncate max-w-sm sm:max-w-md">{locationConfig.locationName}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportWord}
              className="text-cyan-400 hover:text-cyan-300 underline font-medium"
            >
              {language === 'ar' ? '📄 تصدير التقرير كاملاً كملف Word (.doc)' : '📄 Exporter le rapport en Word (.doc)'}
            </button>
            <span>·</span>
            <span className="text-slate-500 font-mono">HEC-HMS & HEC-RAS 1D/2D</span>
          </div>
        </div>
      </footer>

      {/* Word Export Modal with Arabic, French, and Bilingual options */}
      <WordExportModal
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        config={locationConfig}
        defaultLang={language}
      />

      {/* Executive Summary Sheet Modal (Fiche Synthétique du Bassin) */}
      <ExecutiveSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        config={locationConfig}
        language={language}
        onExportWord={handleExportWord}
      />

      {/* APK & App Installation Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        language={language}
      />
    </div>
  );
}
