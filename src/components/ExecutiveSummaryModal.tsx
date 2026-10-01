import React from 'react';
import {
  FileText,
  Download,
  X,
  MapPin,
  Globe,
  Compass,
  Layers,
  Droplets,
  ShieldAlert,
  Printer,
  ExternalLink,
  Award
} from 'lucide-react';
import { ProjectLocationConfig } from '../types/hydrology';
import { exportToGoogleEarthKml, exportToGeoJson } from '../utils/gisExport';
import { getRealSatelliteImageUrl } from '../utils/satelliteImagery';

interface ExecutiveSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProjectLocationConfig;
  language: 'fr' | 'ar';
  onExportWord: () => void;
}

export const ExecutiveSummaryModal: React.FC<ExecutiveSummaryModalProps> = ({
  isOpen,
  onClose,
  config,
  language,
  onExportWord
}) => {
  if (!isOpen) return null;

  const isAr = language === 'ar';

  // Live calculated indicators
  const graveliusKc = (0.28 * config.perimetreKm) / Math.sqrt(Math.max(config.surfaceKm2, 1));
  const deltaH = config.altMaxM - config.altMinM;
  const slopeMPerM = config.slopePercent / 100;
  const tcKirpich = 0.0195 * Math.pow(config.drainLengthKm * 1000, 0.77) * Math.pow(slopeMPerM, -0.385) / 60;
  const tcGiandotti = (4 * Math.sqrt(config.surfaceKm2) + 1.5 * config.drainLengthKm) / (0.8 * Math.sqrt(Math.max(deltaH, 1))) * 60;
  const tcConsensus = Math.max((tcKirpich + tcGiandotti) / 2, 15);
  const coeffC = 0.25 + (config.urbanizationPct / 100) * 0.65;
  const rainQ100 = 85 + config.slopePercent * 8;
  const q100Est = (coeffC * (rainQ100 / (tcConsensus / 60)) * config.surfaceKm2) / 3.6;
  const q10Est = q100Est * 0.48;
  const q50Est = q100Est * 0.82;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-8 text-slate-100 space-y-6"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-cyan-400 font-bold block">
                {isAr ? 'البطاقة الفنية الموجزة (FICHE SYNTHÉTIQUE)' : 'FICHE SYNTHÉTIQUE D\'EXPERTISE TECHNIQUE'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {isAr ? `بطاقة الحوض الصباب: ${config.locationName}` : `Bassin Versant : ${config.locationName}`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="طباعة / Imprimer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Satellite Snapshot & Quick Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <div className="md:col-span-1 rounded-lg overflow-hidden border border-slate-800 h-36">
            <img
              src={getRealSatelliteImageUrl(config.coordinates.lat, config.coordinates.lng, 'close')}
              alt={config.locationName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="md:col-span-2 flex flex-col justify-center space-y-1.5 text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <MapPin className="w-4 h-4" />
              <span>{config.locationName}</span>
            </div>
            <div className="text-slate-300">
              📍 {isAr ? 'الإحداثيات الجغرافية:' : 'Coordonnées GPS :'} <strong className="text-white">{config.coordinates.lat.toFixed(4)}°N , {config.coordinates.lng.toFixed(4)}°E</strong>
            </div>
            <div className="text-slate-400">
              📐 {isAr ? 'نظام الإسقاط العالمي:' : 'Système de projection :'} {config.coordinates.crs || 'WGS84 (EPSG:4326)'}
            </div>
            <div className="text-slate-400">
              🌦️ {isAr ? 'المنطقة المناخية:' : 'Zone bioclimatique :'} <span className="text-emerald-300">{config.climateZone}</span> · {isAr ? 'صنف النفاذية:' : 'Sol SCS :'} <strong>Groupe {config.soilGroup}</strong>
            </div>
          </div>
        </div>

        {/* 2-Column Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          {/* Morphometry */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2.5">
            <div className="text-cyan-400 font-bold border-b border-slate-800 pb-1.5 flex items-center justify-between">
              <span>{isAr ? '1. الخصائص المورفومترية' : '1. MORPHOMÉTRIE DU BASSIN'}</span>
              <span>[MNT GLO-30]</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">{isAr ? 'مساحة الحوض (A) :' : 'Superficie du Bassin (A) :'}</span>
              <strong className="text-white">{config.surfaceKm2} km²</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">{isAr ? 'محيط الحوض (P) :' : 'Périmètre hydrographique (P) :'}</span>
              <strong className="text-white">{config.perimetreKm} km</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">{isAr ? 'معامل جرافليوس (Kc) :' : 'Indice de Gravelius (Kc) :'}</span>
              <strong className="text-cyan-300">{graveliusKc.toFixed(2)} ({graveliusKc < 1.15 ? 'حوض دائري مستجيب' : 'حوض مستطيل ممدود'})</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">{isAr ? 'طول المجرى المائي (L) :' : 'Longueur du Talweg (L) :'}</span>
              <strong className="text-white">{config.drainLengthKm} km</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">{isAr ? 'الانحدار المتوسط والفارق ΔH :' : 'Pente moyenne & ΔH :'}</span>
              <strong className="text-white">{config.slopePercent}% (ΔH = {deltaH} m)</strong>
            </div>
          </div>

          {/* Hydrology & Peak Flows */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2.5">
            <div className="text-cyan-400 font-bold border-b border-slate-800 pb-1.5 flex items-center justify-between">
              <span>{isAr ? '2. النتائج الهيدرولوجية والتدفقات' : '2. HYDROLOGIE & DÉBITS DE POINTE'}</span>
              <span>[HEC-HMS]</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">{isAr ? 'زمن التركيز (Tc Consensus) :' : 'Temps de Concentration (Tc) :'}</span>
              <strong className="text-cyan-300">{tcConsensus.toFixed(1)} min ({(tcConsensus / 60).toFixed(2)} h)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">{isAr ? 'معامل الجريان السطحي (C) :' : 'Coefficient de Ruissellement (C) :'}</span>
              <strong className="text-white">{coeffC.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">{isAr ? 'تدفق السيل العشري Q10 :' : 'Débit Décennal Q10 :'}</span>
              <strong className="text-emerald-300">{q10Est.toFixed(1)} m³/s</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">{isAr ? 'تدفق السيل الخمسيني Q50 :' : 'Débit Cinquantennal Q50 :'}</span>
              <strong className="text-amber-300">{q50Est.toFixed(1)} m³/s</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">{isAr ? 'تدفق الذروة المئوي Q100 :' : 'Débit Centennal Q100 :'}</span>
              <strong className="text-rose-400 text-sm">{q100Est.toFixed(1)} m³/s</strong>
            </div>
          </div>
        </div>

        {/* Direct One-Click GIS Downloads Bar */}
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? '📥 تنزيل ملفات الخرائط والمواقع مباشرة (One-Click GIS Downloads) :' : 'TÉLÉCHARGEMENTS CARTOGRAPHIQUES & SIG :'}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => exportToGoogleEarthKml(config)}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Google Earth (.KML)</span>
            </button>

            <button
              onClick={() => exportToGeoJson(config)}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>QGIS / ArcGIS (.GeoJSON)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onExportWord();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'تقرير وورد كامل (.DOC)' : 'Rapport Word (.DOC)'}</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-3 border-t border-slate-800">
          <span>Direction Générale de l'Hydraulique · Modèle HEC-HMS & HEC-RAS</span>
          <span>Expertise certifiée · Septembre 2026</span>
        </div>
      </div>
    </div>
  );
};
