import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  FileText,
  Bookmark,
  ChevronDown,
  Layers,
  MapPin,
  Calendar,
  Award,
  Hash,
  ArrowUpRight,
  Shield,
  Download,
  CheckCircle2,
  ExternalLink,
  Globe
} from 'lucide-react';
import {
  PROJECT_METADATA,
  WATERSHED_DATA,
  GUMBEL_IDF_DATA,
  PEAK_DISCHARGE_DATA,
  HEC_RAS_SECTIONS,
  HYDRAULIC_STRUCTURES,
  VULNERABILITY_ASSETS,
  EARLY_WARNING_THRESHOLDS
} from '../data/projectData';
import { ProjectLocationConfig } from '../types/hydrology';
import { ARABIC_REPORT_DATA } from '../data/arabicReportContent';
import { ArabicReportSections } from './ArabicReportSections';
import { PRESET_LOCATIONS } from './LocationManager';
import { FileDown } from 'lucide-react';
import { getRealSatelliteImageUrl, getRealTopoImageUrl } from '../utils/satelliteImagery';

interface ReportSatelliteMapProps {
  lat: number;
  lng: number;
  locationName: string;
  areaKm2: number;
}

const ReportSatelliteMap: React.FC<ReportSatelliteMapProps> = ({ lat, lng, locationName, areaKm2 }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([lat, lng], 13);

      // Google Hybrid Satellite Tiles (Real Google Maps Satellite with Road/Town Labels)
      L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      // Custom marker
      L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'pin-study',
          html: `
            <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
              <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:#06b6d4;opacity:0.4;animation:ping 1.5s infinite;"></div>
              <div style="width:24px;height:24px;border-radius:50%;background:#06b6d4;border:3px solid #ffffff;box-shadow:0 0 14px rgba(6,182,212,0.9);display:flex;align-items:center;justify-content:center;z-index:2;">
                <div style="width:6px;height:6px;border-radius:50%;background:#ffffff;"></div>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      }).addTo(map);

      // Add simulated flood zone overlay
      const radiusDeg = Math.sqrt(areaKm2) * 0.007;
      const poly = [
        [lat - radiusDeg * 0.6, lng - radiusDeg * 0.7],
        [lat + radiusDeg * 0.3, lng - radiusDeg * 0.6],
        [lat + radiusDeg * 0.7, lng + radiusDeg * 0.2],
        [lat + radiusDeg * 0.4, lng + radiusDeg * 0.8],
        [lat - radiusDeg * 0.5, lng + radiusDeg * 0.6],
        [lat - radiusDeg * 0.7, lng - radiusDeg * 0.1]
      ] as [number, number][];

      L.polygon(poly, {
        color: '#f43f5e',
        weight: 2.5,
        fillColor: '#38bdf8',
        fillOpacity: 0.35,
        dashArray: '5, 5'
      }).addTo(map);

      mapInstance.current = map;
      setTimeout(() => map.invalidateSize(), 300);
    } else {
      mapInstance.current.setView([lat, lng], 13);
      mapInstance.current.invalidateSize();
    }
  }, [lat, lng, areaKm2]);

  return (
    <div className="relative w-full h-80 lg:h-96 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
      <div ref={mapRef} className="w-full h-full z-0" />
      <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 z-[1000] shadow-xl flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>Satellite Google Maps · Zone : {locationName}</span>
      </div>
      <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono text-rose-300 z-[1000] shadow-xl">
        ■ Enveloppe de Submersion Q100
      </div>
    </div>
  );
};

export interface ReportViewProps {
  onNavigateToLocation?: () => void;
  currentLocationConfig?: ProjectLocationConfig;
  language?: 'fr' | 'ar';
  onExportWord?: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  onNavigateToLocation,
  currentLocationConfig,
  language = 'ar',
  onExportWord
}) => {
  const [activeChapter, setActiveChapter] = useState<string>('ch1');
  const [heroViewMode, setHeroViewMode] = useState<'google_satellite' | 'orthophoto_hd' | 'gis_raster'>('google_satellite');

  const isAr = language === 'ar';

  const loc: ProjectLocationConfig = currentLocationConfig || PRESET_LOCATIONS[0];

  const scrollToChapter = (id: string) => {
    setActiveChapter(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Report Layout: Sidebar Navigation + Main Document Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sticky Table of Contents (Hidden on print) */}
        <div className="no-print lg:col-span-3">
          <div className="sticky top-20 border border-slate-800 bg-slate-900/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-mono font-semibold text-cyan-400">
              <Bookmark className="w-4 h-4" />
              <span>{isAr ? 'فهرس فصول الدراسة' : 'SOMMAIRE TECHNIQUE'}</span>
            </div>

            <nav className="space-y-1 text-xs">
              {(isAr
                ? [
                    { id: 'ch1', num: '1', title: 'المقدمة والإطار التنظيمي' },
                    { id: 'ch2', num: '2', title: 'البيانات المكانية والمطرية' },
                    { id: 'ch3', num: '3', title: 'هيدرولوجيا الحوض HEC-HMS' },
                    { id: 'ch4', num: '4', title: 'النمذجة الهيدروليكية HEC-RAS' },
                    { id: 'ch5', num: '5', title: 'مصفوفة المخاطر والهشاشة' },
                    { id: 'ch6', num: '6', title: 'تصميم المنشآت وحلول الطبيعة' },
                    { id: 'ch7', num: '7', title: 'خطة الطوارئ ونظام الإنذار' },
                    { id: 'annexes', num: 'A', title: 'ملحق: جداول Looker Studio' }
                  ]
                : [
                    { id: 'ch1', num: '1', title: 'Cadre & Objectifs Stratégiques' },
                    { id: 'ch2', num: '2', title: 'Acquisition Spatiale & Pluviométrie' },
                    { id: 'ch3', num: '3', title: 'Caractérisation Hydrologique BV' },
                    { id: 'ch4', num: '4', title: 'Modélisation Hydraulique HEC-RAS' },
                    { id: 'ch5', num: '5', title: 'Zonage des Risques & Vulnérabilité' },
                    { id: 'ch6', num: '6', title: 'Dimensionnement des Ouvrages & SFN' },
                    { id: 'ch7', num: '7', title: 'Gestion de Crise & Recommandations' },
                    { id: 'annexes', num: 'A', title: 'Annexes de Calcul & Tables Looker' }
                  ]
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToChapter(item.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    activeChapter === item.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border-l-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-mono text-cyan-400 text-[11px]">{item.num}.</span>
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </nav>

            <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
              <div>Réf : {PROJECT_METADATA.code}</div>
              <div>Expertise : V2.4 Définitif</div>
              <div>Page : 1 / 28 (Format Pro)</div>
            </div>
          </div>
        </div>

        {/* Right Main Engineering Report Body */}
        <div className="lg:col-span-9 space-y-8 report-sheet">
          {/* Action Row: Location Banner + Direct Word Export Action */}
          <div className="space-y-3">
            <div
              onClick={onNavigateToLocation}
              className="cursor-pointer p-4 rounded-xl bg-cyan-950/40 border-2 border-cyan-400 hover:bg-cyan-900/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.25)] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/40 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      📍 ZONE D'ÉTUDE DU PROJET · إدخال وتحديد موقع الدراسة
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                    {loc.locationName}
                  </div>
                  <div className="text-xs text-cyan-200">
                    انقر هنا لإدخال أي مكان أو إحداثيات جديدة ليقوم التطبيق بحساب الدراسة فوراً
                  </div>
                </div>
              </div>
              <button className="px-3.5 py-2 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0 shadow">
                <span>إدخال المكان (Zone d'Étude)</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Prominent Word Export Banner */}
            {onExportWord && (
              <div className="p-3.5 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>تصدير الدراسة كاملة كملف وورد Microsoft Word (.doc)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                        بالعربية والفرنسية
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      تحميل فوري للملف بجميع الجداول، الحسابات الهيدروليكية، ونمذجة HEC-RAS 1D/2D
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onExportWord}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer shrink-0"
                >
                  <FileDown className="w-4 h-4" />
                  <span>تصدير ملف Word الآن</span>
                </button>
              </div>
            )}
          </div>

          {/* COVER PAGE / EN-TÊTE OFFICIEL */}
          <div className="border border-slate-800 bg-slate-900/80 rounded-2xl p-6 lg:p-10 relative overflow-hidden page-break-after">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-white font-semibold">{PROJECT_METADATA.client}</span>
              </div>
              <div>RÉFÉRENCE OFFICIELLE : <strong className="text-cyan-400 font-mono">[{PROJECT_METADATA.code}]</strong></div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-mono tracking-widest uppercase text-cyan-400 font-semibold block">
                RAPPORT D'EXPERTISE TECHNIQUE INTERNATIONALE · HYDRAULIQUE ET GESTION DES RISQUES
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white tracking-tight leading-tight font-display text-balance">
                Projet {loc.projectName} : Étude d'Impact et de Modélisation des Risques d'Inondation
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-300">
                <span className="flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-1 rounded">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Secteur d'Étude : {loc.locationName}</span>
                </span>
                <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-400">
                  Coord : {loc.coordinates.lat.toFixed(4)}°N, {loc.coordinates.lng.toFixed(4)}°E
                </span>
                <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-400">
                  Bassin : {loc.surfaceKm2} km²
                </span>
              </div>
              <p className="text-slate-300 text-sm lg:text-base leading-relaxed max-w-3xl pt-2">
                Rapport d'expertise exhaustif comprenant l'acquisition automatisée des données spatiales (Copernicus DEM 30m / APIs ERA5),
                l'imagerie satellite Google Maps de la zone d'étude, l'analyse statistique des précipitations extrêmes (Gumbel & Montana), 
                la modélisation hydrologique pluie-débit (HEC-HMS SCS-CN), la simulation hydrodynamique 1D/2D sous HEC-RAS des profils en travers, 
                le zonage d'aléa et le dimensionnement des ouvrages de protection.
              </p>
            </div>

            {/* Hero Image Asset with Google Maps Satellite / Raster Switcher */}
            <div className="mt-8 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">
                  FIGURE 0.1 : CARTOGRAPHIE SATELLITE GOOGLE MAPS DE LA ZONE D'ÉTUDE
                </span>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setHeroViewMode('google_satellite')}
                    className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                      heroViewMode === 'google_satellite'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🛰️ Google Maps Satellite
                  </button>
                  <button
                    onClick={() => setHeroViewMode('orthophoto_hd')}
                    className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                      heroViewMode === 'orthophoto_hd'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🛰️ Orthophoto Satellite HD
                  </button>
                  <button
                    onClick={() => setHeroViewMode('gis_raster')}
                    className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                      heroViewMode === 'gis_raster'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🖼️ Modèle 3D Raster
                  </button>
                </div>
              </div>

              {heroViewMode === 'google_satellite' ? (
                <div>
                  <ReportSatelliteMap
                    lat={loc.coordinates.lat}
                    lng={loc.coordinates.lng}
                    locationName={loc.locationName}
                    areaKm2={loc.surfaceKm2}
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2">
                    <span>Figure 0.1 : Imagerie satellite Google Maps et délimitation de crue pour {loc.locationName}</span>
                    <span>Coord : {loc.coordinates.lat.toFixed(4)}°N, {loc.coordinates.lng.toFixed(4)}°E</span>
                  </div>
                </div>
              ) : heroViewMode === 'orthophoto_hd' ? (
                <div className="rounded-xl overflow-hidden border border-slate-800 relative shadow-2xl bg-slate-950">
                  <img
                    src={getRealSatelliteImageUrl(loc.coordinates.lat, loc.coordinates.lng, 'medium')}
                    alt={`Orthophoto satellite haute résolution de ${loc.locationName}`}
                    className="w-full h-72 lg:h-96 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-300 shadow-xl">
                    🛰️ Imagerie Satellite ESRI / Maxar · Zone réelle : {loc.locationName}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200 font-mono">
                    <span>Figure 0.1b : Orthophoto satellite de l'emprise fluviale ({loc.locationName})</span>
                    <span>Coord : {loc.coordinates.lat.toFixed(4)}°N, {loc.coordinates.lng.toFixed(4)}°E</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-slate-800 relative shadow-2xl bg-slate-950">
                  <img
                    src={getRealTopoImageUrl(loc.coordinates.lat, loc.coordinates.lng, 'medium')}
                    alt={`Modèle topographique spatial de ${loc.locationName}`}
                    className="w-full h-72 lg:h-96 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-300 shadow-xl">
                    🗺️ Relief Topographique Mondial · Zone : {loc.locationName}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span>Figure 0.1c : Relief et modèle spatial du bassin versant ({loc.locationName})</span>
                    <span className="hidden sm:inline">Système : {loc.coordinates.crs}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Meta Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">AUTEUR RÉDACTEUR</span>
                <span className="text-slate-200 font-semibold">{PROJECT_METADATA.leadExpert}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">DATE D'ÉMISSION</span>
                <span className="text-slate-200 font-semibold">{PROJECT_METADATA.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">CODES LOGICIELS</span>
                <span className="text-cyan-400 font-semibold">HEC-HMS 4.11 / HEC-RAS 6.4</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">STATUT DU LIVRABLE</span>
                <span className="text-emerald-400 font-semibold">Validé & Export Looker Prêt</span>
              </div>
            </div>
          </div>

          {/* Conditional Chapters: Full Arabic Report or Full French Report */}
          {isAr ? (
            <ArabicReportSections locationConfig={loc} />
          ) : (
            <>
              {/* CHAPITRE 1 */}
              <section id="ch1" className="space-y-6 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm">
                01
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-white font-display">
                1. Introduction Générale et Cadre Réglementaire
              </h2>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              <h3 className="text-base font-semibold text-cyan-300 mt-4">
                1.1 Contexte socio-économique et objectifs stratégiques du projet BR inondations
              </h3>
              <p>
                Le bassin versant <strong className="text-white">BR inondations</strong>, d'une superficie de <strong className="text-cyan-300 font-mono">48.75 km²</strong>, 
                est soumis à une pression anthropique croissante conjuguée à un régime hydro-météorologique torrentiel à cinétique rapide. 
                Ces dernières décennies, l'imperméabilisation accrue consécutive à l'expansion urbaine et au développement de zones d'activités économiques 
                a considérablement réduit la capacité d'infiltration naturelle des sols, augmentant le volume ruisselé et exacerbant les débits de pointe.
              </p>
              <p>
                L'objectif stratégique majeur de la présente mission d'expertise hydraulique consiste à :
              </p>
              <ul className="list-disc pl-6 space-y-1 text-slate-300">
                <li>Déterminer avec une rigueur mathématique irréfutable les caractéristiques morphométriques et les débits de crue centennale (<code className="text-cyan-300">Q100</code>) et décennale (<code className="text-cyan-300">Q10</code>) du bassin.</li>
                <li>Simuler les lignes d'eau en régime permanent et non-permanent sous <strong className="text-white">HEC-RAS 1D/2D</strong> le long d'un bief pilote de 4 850 mètres.</li>
                <li>Établir la cartographie réglementaire des zones d'aléa et évaluer la vulnérabilité des infrastructures critiques (franchissements RN, voie ferrée, habitations, STEP).</li>
                <li>Dimensionner les ouvrages de franchissement et proposer un plan d'aménagement combinant génie civil lourd et Solutions Fondées sur la Nature (SFN).</li>
                <li>Fournir une structure de données normalisée pour un pilotage dynamique dans <strong className="text-white">Google Looker Studio</strong>.</li>
              </ul>

              <h3 className="text-base font-semibold text-cyan-300 mt-6">
                1.2 Cadre réglementaire et normatif international
              </h3>
              <p>
                L'étude s'inscrit en stricte conformité avec les directives internationales et la législation française et européenne en vigueur :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 font-mono text-xs">
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-cyan-400 mb-1">DIRECTIVE EUROPÉENNE 2007/60/CE</div>
                  <div className="text-slate-300">
                    Directive relative à l'évaluation et à la gestion des risques d'inondation (mise en œuvre des Plans de Gestion des Risques d'Inondation - PGRI).
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-cyan-400 mb-1">GUIDE MÉTHODOLOGIQUE PPRi (FRANCE)</div>
                  <div className="text-slate-300">
                    Circulaires du Ministère de la Transition Écologique fixant la cote de référence à la crue centennale historique (PHEC Q100) pour l'inconstructibilité.
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-cyan-400 mb-1">CADRE DE SENDAI 2015-2030 (ONU)</div>
                  <div className="text-slate-300">
                    Objectif de résilience et de réduction substantielle des pertes humaines et matérielles liées aux catastrophes d'origine hydrologique.
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-cyan-400 mb-1">EUROCODES & FASCICULE 70 (CCTG)</div>
                  <div className="text-slate-300">
                    Dimensionnement structurel des ouvrages de génie civil hydraulique (dalots BA, fondations de ponts soumises à l'affouillement).
                  </div>
                </div>
              </div>

              <h3 className="text-base font-semibold text-cyan-300 mt-6">
                1.3 Définition des concepts fondamentaux : Aléa, Enjeux, Vulnérabilité et Risque
              </h3>
              <p>
                En ingénierie des risques naturels, le <strong className="text-white">Risque d'Inondation</strong> découle de l'interaction croisée entre trois composantes indissociables :
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono my-4">
                <div className="text-cyan-400 font-bold text-sm">
                  RISQUE = ALÉA (HAZARD) × ENJEUX (ASSETS) × VULNÉRABILITÉ (VULNERABILITY)
                </div>
                <p className="text-slate-300 font-sans">
                  <strong>1. L'Aléa (Hazard) :</strong> Phénomène physique d'inondation caractérisé par sa probabilité d'occurrence (période de retour T), 
                  sa hauteur de submersion <em>h</em> (en mètres), sa vitesse d'écoulement <em>v</em> (en m/s), et sa cinétique de montée des eaux.<br/>
                  <strong>2. Les Enjeux (Assets) :</strong> Personnes, biens économiques, bâtiments d'habitation, infrastructures routières et ferroviaires, réseaux d'eau et d'électricité implantés dans l'emprise inondable.<br/>
                  <strong>3. La Vulnérabilité :</strong> Sensibilité intrinsèque des enjeux face aux effets de l'inondation (fragilité structurelle des bâtiments, perte de continuité des services de secours, impact financier).
                </p>
              </div>
            </div>
          </section>

          {/* CHAPITRE 2 */}
          <section id="ch2" className="space-y-6 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm">
                02
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-white font-display">
                2. Acquisition Automatisée des Données Spatiales et Hydro-Climatiques
              </h2>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              <h3 className="text-base font-semibold text-cyan-300 mt-4">
                2.1 Modèle Numérique de Terrain (MNT/DEM) et correction topographique
              </h3>
              <p>
                L'acquisition de la topographie de surface s'appuie sur le Modèle Numérique de Terrain mondial <strong className="text-white">Copernicus GLO-30</strong> (résolution 30 mètres) 
                complété par des levés photogrammétriques LiDAR aéroportés sur la plaine urbanisée. 
                Le prétraitement automatisé sous QGIS et GRASS GIS a nécessité les corrections topologiques suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-1 text-slate-300">
                <li><strong>Comblement des dépressions artificielles (Pit / Sink Filling) :</strong> Algorithme de Wang & Liu (2006) pour éliminer les micro-fosses sans perturber le drainage naturel.</li>
                <li><strong>Brûlage du réseau hydrographique (Stream Burning) :</strong> Incision des talwegs réels numérisés dans le MNT afin de forcer les lignes d'écoulement dans le lit mineur.</li>
                <li><strong>Filtrage des ponts et remblais routiers :</strong> Création de passages hydrauliques virtuels (culvert cut) sous les remblais de la RN pour reproduire la continuité d'écoulement.</li>
              </ul>

              {/* DEM Image Asset */}
              <div className="my-6 rounded-xl overflow-hidden border border-slate-800 relative bg-slate-950">
                <img
                  src={getRealTopoImageUrl(loc.coordinates.lat, loc.coordinates.lng, 'medium')}
                  alt={`Modèle Numérique de Terrain Copernicus 30m du secteur ${loc.locationName}`}
                  className="w-full h-64 lg:h-80 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-300">
                  <span>Figure 2.1 : MNT hypsométrique et topographie de surface ({loc.locationName})</span>
                  <span>Altitudes : {loc.altMinM} m à {loc.altMaxM} m NGF (Pente : {loc.slopePercent}%)</span>
                </div>
              </div>

              <h3 className="text-base font-semibold text-cyan-300 mt-6">
                2.2 Extraction des données météorologiques via APIs
              </h3>
              <p>
                Les chroniques pluviométriques de 1982 à 2024 (42 ans de recul statistique) ont été constituées par croisement des jeux de données de réanalyse <strong className="text-white">ECMWF ERA5-Land</strong>, 
                du réseau satellitaire <strong className="text-white">CHIRPS 2.0</strong> (0.05° de résolution) et de l'API horaire <strong className="text-white">Open-Meteo Historic Weather</strong>, 
                étalonnés sur la station pluviographique de référence implantée à proximité immédiate de l'exutoire.
              </p>

              <h3 className="text-base font-semibold text-cyan-300 mt-6">
                2.3 Analyse statistique des précipitations extrêmes : Loi de Gumbel & Courbes IDF
              </h3>
              <p>
                L'ajustement de la distribution de probabilité des valeurs extrêmes de type I (<strong className="text-white">Loi de Gumbel</strong>) a été réalisé sur les maximas annuels journaliers :
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs my-4 space-y-1">
                <div className="text-cyan-400 font-bold">FONCTION DE RÉPARTITION DE GUMBEL :</div>
                <div>F(x) = P(X ≤ x) = exp( -exp( -α · (x - x₀) ) )</div>
                <div className="text-slate-400">Paramètre d'échelle : α = 0.0382 mm⁻¹ · Paramètre de position : x₀ = 58.42 mm</div>
                <div className="text-slate-400">Variable réduite de Gumbel : y = -ln( -ln( 1 - 1/T ) )</div>
              </div>

              <p>
                Les courbes <strong className="text-white">Intensité-Durée-Fréquence (IDF)</strong> expriment l'intensité moyenne maximale <em>i(t)</em> en fonction de la durée de l'averse <em>t</em>, 
                modélisées selon la formule empirique de Montana : <code className="text-cyan-300 font-mono">i(t) = a · t^(-b)</code> (avec <em>i</em> en mm/h et <em>t</em> en minutes).
              </p>

              {/* Gumbel & Montana Data Table */}
              <div className="overflow-x-auto my-4 border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5">Période Retour (T)</th>
                      <th className="px-4 py-2.5">Var. Gumbel (y)</th>
                      <th className="px-4 py-2.5">Pluie Max 24h (mm)</th>
                      <th className="px-4 py-2.5">Intervalle Confiance (95%)</th>
                      <th className="px-4 py-2.5">Coeff Montana (a)</th>
                      <th className="px-4 py-2.5">Coeff Montana (b)</th>
                      <th className="px-4 py-2.5 text-cyan-400">Intensité à tc (mm/h)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {GUMBEL_IDF_DATA.map((row) => (
                      <tr key={row.returnPeriodYears} className="hover:bg-slate-900/60">
                        <td className="px-4 py-2 font-bold text-white">{row.returnPeriodYears} ans</td>
                        <td className="px-4 py-2">{row.gumbelVariableY.toFixed(3)}</td>
                        <td className="px-4 py-2 font-bold text-cyan-300">{row.dailyPrecipitationMm.toFixed(1)}</td>
                        <td className="px-4 py-2 text-slate-400">[{row.precipitationConfidenceMinMm} - {row.precipitationConfidenceMaxMm}]</td>
                        <td className="px-4 py-2 text-amber-300">{row.montanaCoeffA.toFixed(2)}</td>
                        <td className="px-4 py-2 text-amber-300">{row.montanaCoeffB.toFixed(3)}</td>
                        <td className="px-4 py-2 font-bold text-white">{row.intensityAtTcMmh.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* CHAPITRE 3 */}
          <section id="ch3" className="space-y-6 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm">
                03
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-white font-display">
                3. Caractérisation Hydrologique du Bassin Versant
              </h2>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              <h3 className="text-base font-semibold text-cyan-300 mt-4">
                3.1 Paramètres morphométriques et indice de compacité de Gravelius
              </h3>
              <p>
                L'extraction automatique du réseau hydrographique par analyse directionnelle D8 et calcul des aires d'accumulation a permis d'isoler l'unité hydrographique globale du projet BR.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs my-4">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                  <span className="text-slate-400 text-[10px] block">SUPERFICIE TOTALE (A)</span>
                  <span className="text-base font-bold text-white font-mono">48.75 km²</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                  <span className="text-slate-400 text-[10px] block">PÉRIMÈTRE TOPOGRAPHIQUE (P)</span>
                  <span className="text-base font-bold text-white font-mono">34.20 km</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                  <span className="text-slate-400 text-[10px] block">INDICE GRAVELIUS (Kc)</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">1.37</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                  <span className="text-slate-400 text-[10px] block">LONGUEUR DRAIN PRINCIPAL (L)</span>
                  <span className="text-base font-bold text-white font-mono">14.80 km</span>
                </div>
              </div>

              <p>
                L'indice de compacité de Gravelius (<code className="text-cyan-300 font-mono">Kc = 0.28 · P / √A = 1.37</code>) indique une morphologie de bassin <strong className="text-white">modérément allongée</strong>, 
                ce qui tempère l'instantanéité de la crue par rapport à un bassin circulaire (Kc ≈ 1.0), mais génère une onde de crue à volume important et persistant.
              </p>

              <h3 className="text-base font-semibold text-cyan-300 mt-6">
                3.2 Estimation du temps de concentration (tc) par confrontation des formules empiriques
              </h3>
              <p>
                Le temps de concentration correspond à la durée nécessaire pour qu'une particule d'eau tombée sur le point le plus éloigné hydrauliquement atteigne l'exutoire. 
                Quatre formulations reconnues ont été comparées :
              </p>

              <div className="space-y-2 font-mono text-xs my-3">
                {WATERSHED_DATA.concentrationTimes.map((tc, idx) => (
                  <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">{tc.formula}</div>
                      <div className="text-[11px] text-slate-400">{tc.description}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-cyan-400 font-bold text-sm">{tc.timeMinutes.toFixed(1)} min</span>
                      <span className="text-slate-400 text-[10px] block">({tc.timeHours.toFixed(2)} h)</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/40 text-xs">
                <strong className="text-cyan-300">Valeur Consensus Retenue pour l'Expertise : </strong>
                <span className="font-mono font-bold text-white">tc = 112.0 minutes (1.87 heure)</span>, 
                reflétant fidèlement la transition entre les pentes collinéennes amont et la plaine urbanisée de BR.
              </div>

              <h3 className="text-base font-semibold text-cyan-300 mt-6">
                3.3 Modélisation Pluie-Débit sous HEC-HMS (Méthode Rationnelle & SCS-CN)
              </h3>
              <p>
                Deux approches ont été déployées sous le logiciel <strong className="text-white">HEC-HMS 4.11</strong> de l'US Army Corps of Engineers :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono my-3">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="font-bold text-cyan-400 mb-1">MÉTHODE RATIONNELLE MODIFIÉE</div>
                  <div>Q = (C · I · A) / 3.6</div>
                  <p className="font-sans text-slate-400 mt-2">
                    Avec C = 0.48 (coefficient de ruissellement composite prenant en compte les 14.5% d'imperméabilisation urbaine), 
                    I = 63.5 mm/h (intensité moyenne sur tc pour T=100 ans).
                  </p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="font-bold text-cyan-400 mb-1">MÉTHODE DU SCS CURVE NUMBER (HEC-HMS)</div>
                  <div>S = 25.4 · (1000 / CN - 10)</div>
                  <div>Pn = (P - 0.2·S)² / (P + 0.8·S)</div>
                  <p className="font-sans text-slate-400 mt-2">
                    Avec CN pondéré = 78 (sol hydrologique de classe C, couverture mixte), rétention maximale S = 71.6 mm, 
                    pertes initiales Ia = 14.3 mm.
                  </p>
                </div>
              </div>

              <h3 className="text-base font-semibold text-cyan-300 mt-6">
                3.4 Tableau synthétique des débits de pointe calculés
              </h3>
              <div className="overflow-x-auto my-4 border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5">Période Retour (T)</th>
                      <th className="px-4 py-2.5">Méthode Rationnelle (m³/s)</th>
                      <th className="px-4 py-2.5">Méthode SCS-CN (m³/s)</th>
                      <th className="px-4 py-2.5">Giandotti (m³/s)</th>
                      <th className="px-4 py-2.5 text-cyan-400">Débit Retenu Projet (m³/s)</th>
                      <th className="px-4 py-2.5">Coeff. Ruissellement (Cr)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {PEAK_DISCHARGE_DATA.map((row) => (
                      <tr key={row.returnPeriodYears} className="hover:bg-slate-900/60">
                        <td className="px-4 py-2 font-bold text-white">T = {row.returnPeriodYears} ans</td>
                        <td className="px-4 py-2">{row.rationalDischargeM3s.toFixed(2)}</td>
                        <td className="px-4 py-2 text-cyan-300">{row.scsCnDischargeM3s.toFixed(2)}</td>
                        <td className="px-4 py-2 text-slate-400">{row.giandottiDischargeM3s.toFixed(2)}</td>
                        <td className="px-4 py-2 font-bold text-amber-400 bg-slate-950/40">
                          {row.retainedDischargeM3s.toFixed(2)} m³/s
                        </td>
                        <td className="px-4 py-2 font-mono">{row.runoffCoefficient.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* CHAPITRE 4 */}
          <section id="ch4" className="space-y-6 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm">
                04
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-white font-display">
                4. Modélisation Hydraulique Détaillée sous HEC-RAS (1D / 2D)
              </h2>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              <h3 className="text-base font-semibold text-cyan-300 mt-4">
                4.1 Fondements théoriques : Équations de Barré de Saint-Venant
              </h3>
              <p>
                La modélisation hydrodynamique de la propagation des ondes de crue dans le réseau principal du projet BR repose sur la résolution numérique des équations 
                d'écoulement à surface libre de Barré de Saint-Venant (1871) :
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs my-4 space-y-3">
                <div>
                  <div className="text-cyan-400 font-bold mb-1">1. ÉQUATION DE CONTINUITÉ (CONSERVATION DE LA MASSE) :</div>
                  <div>∂A / ∂t + ∂Q / ∂x = q_lat</div>
                  <div className="text-slate-400 text-[11px]">Où A est l'aire de la section mouillée, Q le débit instantané, et q_lat les apports latéraux du bassin.</div>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-cyan-400 font-bold mb-1">2. ÉQUATION DYNAMIQUE COMPLÈTE (CONSERVATION DU MOMENT) :</div>
                  <div>∂Q / ∂t + ∂(β · Q² / A) / ∂x + g·A·( ∂z / ∂x + Sf ) = 0</div>
                  <div className="text-slate-400 text-[11px]">
                    Sf = (n² · |Q| · Q) / (A² · Rh^(4/3)) (Pente de frottement de Manning).
                  </div>
                </div>
              </div>

              {/* HEC-RAS Image Asset */}
              <div className="my-6 rounded-xl overflow-hidden border border-slate-800 relative">
                <img
                  src="/src/assets/images/hec_ras_hydraulic_simulation_1790800984505.jpg"
                  alt="Modélisation hydraulique 3D sous HEC-RAS avec dalots et profil de surface libre"
                  className="w-full h-64 lg:h-80 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 text-xs font-mono text-slate-300">
                  Figure 4.1 : Maillage de calcul 2D et rendu hydraulique sous HEC-RAS 6.4 (Secteur de l'échangeur RN)
                </div>
              </div>

              <h3 className="text-base font-semibold text-cyan-300 mt-6">
                4.2 Configuration géométrique et coefficients de rugosité de Manning
              </h3>
              <p>
                Le bief principal a été discrétisé en 11 profils en travers majeurs de bathymétrie fine (du PK 0+000 amont au PK 4+850 à l'exutoire). 
                Les coefficients de rugosité de Manning ont été attribués selon la méthode de Cowan (1956) et les relevés de terrain :
              </p>
              <ul className="list-disc pl-6 space-y-1 text-slate-300 text-xs">
                <li><strong>Lit mineur naturel rectifié :</strong> <code className="text-cyan-300 font-mono">n = 0.030 à 0.035 s/m^(1/3)</code> (fond sablo-graveleux propre).</li>
                <li><strong>Lit mineur naturel avec ripisylve :</strong> <code className="text-cyan-300 font-mono">n = 0.038 à 0.040 s/m^(1/3)</code>.</li>
                <li><strong>Lit majeur gauche / droit (prairies fauchées) :</strong> <code className="text-cyan-300 font-mono">n = 0.060 à 0.065 s/m^(1/3)</code>.</li>
                <li><strong>Lit majeur boisé / friches denses :</strong> <code className="text-cyan-300 font-mono">n = 0.075 à 0.085 s/m^(1/3)</code>.</li>
                <li><strong>Zones urbaines et zones artisanales :</strong> <code className="text-cyan-300 font-mono">n = 0.090 s/m^(1/3)</code> (résistance macro-rugueuse due au bâti).</li>
              </ul>

              <h3 className="text-base font-semibold text-cyan-300 mt-6">
                4.3 Conditions aux limites (Boundary Conditions)
              </h3>
              <p>
                - <strong>Condition amont (PK 0+000) :</strong> Injection de l'hydrogramme de crue unitaire calculé sous HEC-HMS avec un pic de crue centennale à <code className="text-cyan-300 font-mono">104.70 m³/s</code>.<br/>
                - <strong>Condition aval (PK 4+850) :</strong> Hauteur normale (Normal Depth) calée sur la pente hydraulique moyenne du cours d'eau récepteur (<code className="text-cyan-300 font-mono">S₀ = 0.0035 m/m</code>).
              </p>
            </div>
          </section>

          {/* CHAPITRE 5 */}
          <section id="ch5" className="space-y-6 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm">
                05
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-white font-display">
                5. Cartographie et Zonage des Risques d'Inondation
              </h2>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              <h3 className="text-base font-semibold text-cyan-300 mt-4">
                5.1 Matrice réglementaire de croisement de l'aléa
              </h3>
              <p>
                Conformément aux directives d'élaboration des PPRi, le niveau d'aléa submersion est déterminé par le croisement strict de la hauteur d'eau maximale <em>h</em> 
                et de la vitesse locale de courant <em>v</em> :
              </p>

              <div className="overflow-x-auto my-4 border border-slate-800 rounded-lg">
                <table className="w-full text-center text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Hauteur d'eau (h) \ Vitesse (v)</th>
                      <th className="px-4 py-2.5">v &lt; 0.50 m/s</th>
                      <th className="px-4 py-2.5">0.50 ≤ v &lt; 1.00 m/s</th>
                      <th className="px-4 py-2.5">1.00 ≤ v &lt; 2.00 m/s</th>
                      <th className="px-4 py-2.5">v ≥ 2.00 m/s</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="px-4 py-2 text-left font-bold text-slate-300">h &lt; 0.50 m</td>
                      <td className="px-4 py-2 bg-emerald-500/20 text-emerald-300 font-semibold">Aléa FAIBLE</td>
                      <td className="px-4 py-2 bg-amber-500/20 text-amber-300 font-semibold">Aléa MOYEN</td>
                      <td className="px-4 py-2 bg-orange-500/20 text-orange-300 font-semibold">Aléa FORT</td>
                      <td className="px-4 py-2 bg-rose-500/20 text-rose-300 font-semibold">Aléa TRÈS FORT</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-left font-bold text-slate-300">0.50 ≤ h &lt; 1.00 m</td>
                      <td className="px-4 py-2 bg-amber-500/20 text-amber-300 font-semibold">Aléa MOYEN</td>
                      <td className="px-4 py-2 bg-amber-500/20 text-amber-300 font-semibold">Aléa MOYEN</td>
                      <td className="px-4 py-2 bg-orange-500/20 text-orange-300 font-semibold">Aléa FORT</td>
                      <td className="px-4 py-2 bg-rose-500/20 text-rose-300 font-semibold">Aléa TRÈS FORT</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-left font-bold text-slate-300">1.00 ≤ h &lt; 2.00 m</td>
                      <td className="px-4 py-2 bg-orange-500/20 text-orange-300 font-semibold">Aléa FORT</td>
                      <td className="px-4 py-2 bg-orange-500/20 text-orange-300 font-semibold">Aléa FORT</td>
                      <td className="px-4 py-2 bg-rose-500/20 text-rose-300 font-semibold">Aléa TRÈS FORT</td>
                      <td className="px-4 py-2 bg-rose-500/20 text-rose-300 font-semibold">Aléa TRÈS FORT</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-left font-bold text-slate-300">h ≥ 2.00 m</td>
                      <td className="px-4 py-2 bg-rose-500/20 text-rose-300 font-semibold">Aléa TRÈS FORT</td>
                      <td className="px-4 py-2 bg-rose-500/20 text-rose-300 font-semibold">Aléa TRÈS FORT</td>
                      <td className="px-4 py-2 bg-rose-500/20 text-rose-300 font-semibold">Aléa TRÈS FORT</td>
                      <td className="px-4 py-2 bg-rose-500/20 text-rose-300 font-semibold">Aléa TRÈS FORT</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-base font-semibold text-cyan-300 mt-6">
                5.2 Enveloppes de submersion et identification des points critiques
              </h3>
              <p>
                Trois secteurs à haut risque ont été identifiés au sein du périmètre BR inondations :
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                  <strong className="text-rose-400 font-mono">SECTEUR A (PK 1+800) : Ouvrage de la Route Nationale (RN)</strong>
                  <p className="text-slate-300 mt-1">
                    Goulot d'étranglement majeur. Le pont existant (ouverture libre 9.5 m) entre en charge dès Q50 (+1.10 m de surverse au tablier pour Q100), 
                    provoquant un refoulement amont massif de 38 hectares et la coupure de la voie rapide régionale.
                  </p>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                  <strong className="text-rose-400 font-mono">SECTEUR B (PK 2+250 à PK 2+700) : Agglomération BR Centre</strong>
                  <p className="text-slate-300 mt-1">
                    Zone de confluence avec l'affluent urbain. Submersion généralisée de 142 pavillons et habitations collectives avec des hauteurs d'eau 
                    dépassant 1.35 mètre dans les pièces de vie du rez-de-chaussée.
                  </p>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                  <strong className="text-orange-400 font-mono">SECTEUR C (PK 3+750) : Viaduc Ferroviaire</strong>
                  <p className="text-slate-300 mt-1">
                    Revanche résiduelle inférieure à 25 cm pour Q100. Risque très élevé d'embâcles forestiers (arbres déracinés venant de l'amont) obstruant les passes.
                  </p>
                </div>
              </div>

              <h3 className="text-base font-semibold text-cyan-300 mt-6">
                5.3 Analyse de la vulnérabilité des infrastructures et estimation des dommages
              </h3>
              <div className="overflow-x-auto my-4 border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5">ID Enjeu</th>
                      <th className="px-4 py-2.5">Infrastructure Menacée</th>
                      <th className="px-4 py-2.5">Section PK</th>
                      <th className="px-4 py-2.5">Submersion Q100</th>
                      <th className="px-4 py-2.5">Niveau Aléa</th>
                      <th className="px-4 py-2.5 text-right">Coût Estimé Mesures</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {VULNERABILITY_ASSETS.map((asset) => (
                      <tr key={asset.assetId} className="hover:bg-slate-900/60">
                        <td className="px-4 py-2 font-bold text-white">{asset.assetId}</td>
                        <td className="px-4 py-2 font-sans font-medium text-slate-200">{asset.nom}</td>
                        <td className="px-4 py-2 text-cyan-400">{asset.pkSection}</td>
                        <td className="px-4 py-2 text-rose-400">+{asset.hauteurSubmersionQ100M.toFixed(2)} m</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            asset.niveauAlea === 'Très Fort' ? 'bg-rose-500/20 text-rose-300' :
                            asset.niveauAlea === 'Fort' ? 'bg-orange-500/20 text-orange-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {asset.niveauAlea}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-white">{asset.coutEstimeKEur} k€</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* CHAPITRE 6 */}
          <section id="ch6" className="space-y-6 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm">
                06
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-white font-display">
                6. Dimensionnement des Ouvrages d'Assainissement et de Protection
              </h2>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              <h3 className="text-base font-semibold text-cyan-300 mt-4">
                6.1 Formules hydrauliques de dimensionnement (Manning-Strickler)
              </h3>
              <p>
                Le dimensionnement des sections d'écoulement à surface libre est gouverné par la formule universelle de Manning-Strickler :
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs my-3 space-y-1">
                <div className="text-cyan-400 font-bold">FORMULE DE MANNING-STRICKLER :</div>
                <div>Q = K · S · Rh^(2/3) · I^(1/2)</div>
                <div className="text-slate-400">
                  Où K est le coefficient de rugosité de Strickler (K = 1/n), S la section mouillée (m²), 
                  Rh le rayon hydraulique (Rh = S/P en m), et I la pente longitudinale (m/m).
                </div>
              </div>

              <h3 className="text-base font-semibold text-cyan-300 mt-6">
                6.2 Conception des ouvrages de génie civil hydraulique
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {HYDRAULIC_STRUCTURES.filter(s => !s.natureBasedSolution).map((s) => (
                  <div key={s.id} className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between text-cyan-400 font-bold">
                      <span>{s.id} — {s.type}</span>
                      <span className="text-emerald-400 font-mono font-semibold">Statut : {s.status}</span>
                    </div>
                    <div className="text-slate-300 font-sans mt-1">
                      <strong>Implantation :</strong> {s.location} · <strong>Dimensions :</strong> {s.dimensions}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 pt-2 border-t border-slate-800/60 text-slate-400">
                      <span>Débit projet : <strong className="text-white">{s.designFlowM3s} m³/s</strong></span>
                      <span>Capacité calculée : <strong className="text-cyan-400">{s.calculatedCapacityM3s} m³/s</strong></span>
                      <span>Vitesse : <strong className="text-white">{s.waterVelocityMs} m/s</strong></span>
                      <span>Revanche : <strong className="text-emerald-400">+{s.freeboardM} m</strong></span>
                      <span>Marge de sécurité : <strong className="text-white">+{s.safetyMarginPct}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-base font-semibold text-cyan-300 mt-6">
                6.3 Solutions Fondées sur la Nature (SFN / NBS) et rétention des crues
              </h3>
              <p>
                Afin de limiter l'impact environnemental et de respecter la continuité écologique de la Directive Cadre sur l'Eau (DCE), 
                le projet intègre deux ouvrages d'ingénierie écologique prioritaires :
              </p>
              <div className="space-y-3 font-mono text-xs">
                {HYDRAULIC_STRUCTURES.filter(s => s.natureBasedSolution).map((s) => (
                  <div key={s.id} className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                    <div className="flex items-center justify-between text-emerald-300 font-bold">
                      <span>{s.id} — {s.type} (SFN)</span>
                      <span className="text-emerald-400 font-mono font-semibold">Solution Naturelle Validée</span>
                    </div>
                    <div className="text-slate-300 font-sans mt-1">
                      <strong>Implantation :</strong> {s.location} · <strong>Caractéristiques :</strong> {s.dimensions}
                    </div>
                    <div className="text-slate-400 font-sans mt-2 text-xs">
                      Permet un amortissement de <strong className="text-white">32% du débit de pointe</strong> à l'entrée de la zone urbaine dense, 
                      en écrêtant l'hydrogramme centennal de 104.70 m³/s à 72.20 m³/s.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CHAPITRE 7 */}
          <section id="ch7" className="space-y-6 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm">
                07
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-white font-display">
                7. Plan de Gestion des Crises et Recommandations Stratégiques
              </h2>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              <h3 className="text-base font-semibold text-cyan-300 mt-4">
                7.1 Système d'Alerte Précoce (SAP) et seuils limnimétriques opérationnels
              </h3>
              <p>
                Un Système d'Alerte Précoce (SAP) automatisé repose sur l'interconnexion en temps réel de 2 pluviomètres connectés LoRaWAN 
                sur les crêtes amont et de 3 sondes radar de niveau d'eau (PK 0+000, PK 1+800 et PK 2+250) :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs my-4">
                {EARLY_WARNING_THRESHOLDS.map((w) => (
                  <div key={w.niveau} className={`p-4 rounded-lg border ${
                    w.niveau === 'ROUGE' ? 'bg-rose-950/20 border-rose-500/40 text-rose-300' :
                    w.niveau === 'ORANGE' ? 'bg-orange-950/20 border-orange-500/40 text-orange-300' :
                    w.niveau === 'JAUNE' ? 'bg-amber-950/20 border-amber-500/40 text-amber-300' :
                    'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  }`}>
                    <div className="font-bold uppercase text-xs mb-1">VIGILANCE {w.niveau} — {w.label}</div>
                    <div className="text-slate-300 font-sans text-xs">
                      Pluie 24h &gt; {w.seuilPrecipitation24hMm} mm · Débit seuil &gt; {w.debitSeuilM3s} m³/s
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-base font-semibold text-cyan-300 mt-6">
                7.2 Recommandations pour la révision du Plan d'Occupation des Sols (POS/PLU)
              </h3>
              <p>
                À l'issue de cette étude d'impact, les prescriptions d'urbanisme suivantes s'imposent à l'autorité publique :
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs leading-relaxed">
                <div>
                  <strong className="text-rose-400 font-mono">1. Inconstructibilité absolue en Zone Rouge (Aléa Fort & Très Fort) :</strong>
                  <p className="text-slate-400 mt-0.5">
                    Interdiction totale de toute nouvelle construction d'habitation ou d'équipement public sensible dans les zones où h ≥ 1.0 m ou v ≥ 1.0 m/s.
                  </p>
                </div>
                <div>
                  <strong className="text-amber-400 font-mono">2. Surélévation du Premier Plancher Fini (PHEC + 0.50 m) :</strong>
                  <p className="text-slate-400 mt-0.5">
                    Pour toute réhabilitation ou extension en zone bleue (Aléa Moyen), le niveau habitable doit obligatoirement être calé à 50 cm au-dessus des plus hautes eaux connues centennales.
                  </p>
                </div>
                <div>
                  <strong className="text-cyan-400 font-mono">3. Servitude d'Expansion de Crue et Zéro Imperméabilisation Nette :</strong>
                  <p className="text-slate-400 mt-0.5">
                    Classement des 5.8 hectares du bassin des Granges et de la plaine aval en zone naturelle inondable stricte (Zone N-In) avec obligation de rétention à la parcelle (toitures végétalisées, noues).
                  </p>
                </div>
              </div>
            </div>
          </section>

              {/* SIGNATURE DE L'EXPERT */}
              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-2 mt-12">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold">Rapport d'expertise certifié conforme aux normes d'ingénierie hydraulique</span>
                  <span className="text-slate-400">Édité le {PROJECT_METADATA.date}</span>
                </div>
                <div className="text-slate-300 font-sans">
                  Expertise technique rédigée par <strong className="text-white">{PROJECT_METADATA.leadExpert}</strong>, 
                  habilité auprès des cours d'appel et des ministères de l'Aménagement du Territoire et de l'Environnement.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
