import React, { useState } from 'react';
import {
  Layers,
  CloudRain,
  Activity,
  AlertOctagon,
  TrendingUp,
  MapPin,
  Clock,
  Shield,
  Gauge,
  Sliders,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import {
  WATERSHED_DATA,
  GUMBEL_IDF_DATA,
  PEAK_DISCHARGE_DATA,
  HEC_RAS_SECTIONS,
  HYDROGRAPH_SERIES,
  EARLY_WARNING_THRESHOLDS
} from '../data/projectData';
import { ProjectLocationConfig } from '../types/hydrology';

interface DashboardViewProps {
  locationConfig?: ProjectLocationConfig;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ locationConfig }) => {
  const [selectedHydroTime, setSelectedHydroTime] = useState<number>(6); // Peak at 6h
  const [activeReturnPeriod, setActiveReturnPeriod] = useState<10 | 50 | 100 | 500>(100);
  const [simulatedRain24h, setSimulatedRain24h] = useState<number>(85); // mm for SAP test
  const [selectedSectionPoint, setSelectedSectionPoint] = useState<string>('XS_3050_PONT_RN');

  // Find active hydrograph slice
  const currentHydroSlice = HYDROGRAPH_SERIES.find(h => h.t === selectedHydroTime) || HYDROGRAPH_SERIES[6];

  // Determine Early Warning Status based on simulatedRain24h
  let activeWarning = EARLY_WARNING_THRESHOLDS[0];
  if (simulatedRain24h >= 110) {
    activeWarning = EARLY_WARNING_THRESHOLDS[3]; // ROUGE
  } else if (simulatedRain24h >= 75) {
    activeWarning = EARLY_WARNING_THRESHOLDS[2]; // ORANGE
  } else if (simulatedRain24h >= 45) {
    activeWarning = EARLY_WARNING_THRESHOLDS[1]; // JAUNE
  }

  // Active section data
  const highlightedSection = HEC_RAS_SECTIONS.find(s => s.sectionId === selectedSectionPoint) || HEC_RAS_SECTIONS[4];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Executive Headline & KPIs */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <Activity className="w-4 h-4" />
              <span>TABLEAU DE BORD EXÉCUTIF LOOKER STUDIO · SYNTHÈSE DES RISQUES D'INONDATION</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-display">
              Indicateurs Clés de l'Étude d'Impact Hydraulique
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
              Consolidation multidimensionnelle des données hydrologiques pour{' '}
              <strong className="text-cyan-300">{locationConfig?.locationName || 'le secteur du projet'}</strong>,
              des simulations HEC-HMS / HEC-RAS et des seuils d'alerte civile.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Période d'Analyse :</span>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
              {([10, 50, 100, 500] as const).map((T) => (
                <button
                  key={T}
                  onClick={() => setActiveReturnPeriod(T)}
                  className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
                    activeReturnPeriod === T
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  T = {T} ans
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 6 Key Hydraulic KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Superficie Bassin</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {locationConfig ? locationConfig.surfaceKm2 : 48.75} <span className="text-xs font-normal text-slate-400">km²</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
              Pente : {locationConfig ? locationConfig.slopePercent : 2.45}%
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Pluie Max 24h</div>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
              {GUMBEL_IDF_DATA.find(g => g.returnPeriodYears === activeReturnPeriod)?.dailyPrecipitationMm}{' '}
              <span className="text-xs font-normal text-slate-400">mm</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Loi de Gumbel</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Débit de Pointe</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {PEAK_DISCHARGE_DATA.find(p => p.returnPeriodYears === activeReturnPeriod)?.retainedDischargeM3s}{' '}
              <span className="text-xs font-normal text-slate-400">m³/s</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">HEC-HMS (SCS-CN)</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Temps Concentr. (tc)</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              112 <span className="text-xs font-normal text-slate-400">min</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Consensus 4 formules</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Volume de Crue</div>
            <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
              {(GUMBEL_IDF_DATA.find(g => g.returnPeriodYears === activeReturnPeriod)!.rainfallVolumeM3 / 1000000).toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">Mm³</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Épaisseur ruisselée</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Population Exposée</div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">
              450 <span className="text-xs font-normal text-slate-400">hab.</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">142 logements en zone rouge</div>
          </div>
        </div>
      </div>

      {/* Row 2: Dynamic Hyetograph/Hydrograph simulation & Early Warning Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dynamic Rainfall-Runoff Hydrograph Viewer */}
        <div className="lg:col-span-8 border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-semibold text-cyan-400">MODÉLISATION PLUIE-DÉBIT HEC-HMS</span>
              <h3 className="text-base font-semibold text-white mt-0.5">
                Hyétogramme de Pluie et Hydrogramme de Crue Associé
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-cyan-400 inline-block" /> Q(t) Débit (m³/s)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2 bg-slate-600 inline-block" /> P(t) Pluie (mm/h)
              </span>
            </div>
          </div>

          {/* Combined Chart SVG */}
          <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800 relative">
            <svg viewBox="0 0 600 240" className="w-full h-auto">
              <defs>
                <linearGradient id="hydroFillQ100" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((val) => {
                const y = 200 - (val / 110) * 160;
                return (
                  <g key={val}>
                    <line x1="45" y1={y} x2="570" y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                    <text x="40" y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Rainfall Bars (Hyetograph inverted at top) */}
              {HYDROGRAPH_SERIES.map((d) => {
                const x = 50 + (d.t / 24) * 510;
                const barH = (d.rainMm / 50) * 45;
                return (
                  <rect
                    key={d.t}
                    x={x - 6}
                    y={15}
                    width={12}
                    height={barH}
                    fill="#475569"
                    opacity={0.7}
                    rx="1"
                  />
                );
              })}

              {/* Hydrograph Curve Q100 */}
              <path
                d={
                  HYDROGRAPH_SERIES.reduce((acc, d, idx) => {
                    const x = 50 + (d.t / 24) * 510;
                    const y = 200 - (d.q100 / 110) * 160;
                    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                  }, '') + ` L 560 200 L 50 200 Z`
                }
                fill="url(#hydroFillQ100)"
              />

              <path
                d={HYDROGRAPH_SERIES.reduce((acc, d, idx) => {
                  const x = 50 + (d.t / 24) * 510;
                  const y = 200 - (d.q100 / 110) * 160;
                  return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
              />

              {/* Time scrubber marker */}
              {(() => {
                const scrubX = 50 + (selectedHydroTime / 24) * 510;
                const scrubY = 200 - (currentHydroSlice.q100 / 110) * 160;
                return (
                  <g>
                    <line x1={scrubX} y1="15" x2={scrubX} y2="200" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 2" />
                    <circle cx={scrubX} cy={scrubY} r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={scrubX} y={scrubY - 8} fill="#f43f5e" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      {currentHydroSlice.q100.toFixed(1)} m³/s
                    </text>
                  </g>
                );
              })()}

              {/* Time X axis */}
              <line x1="45" y1="200" x2="570" y2="200" stroke="#64748b" strokeWidth="1" />
              {HYDROGRAPH_SERIES.map((d) => (
                <text key={d.t} x={50 + (d.t / 24) * 510} y="215" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  {d.timeLabel}
                </text>
              ))}
            </svg>
          </div>

          {/* Time Scrubber controls */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instant sélectionné : T + {selectedHydroTime}h00</span>
              </span>
              <span className="text-cyan-400 font-semibold">
                Débit instantané : {currentHydroSlice.q100} m³/s · Précipitation : {currentHydroSlice.rainMm} mm/h
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="1"
              value={selectedHydroTime}
              onChange={(e) => setSelectedHydroTime(parseInt(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Early Warning System (SAP) Station Monitor */}
        <div className="lg:col-span-4 border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-semibold text-cyan-400">SYSTÈME D'ALERTE PRÉCOCE (SAP)</span>
              <Gauge className="w-4 h-4 text-cyan-400" />
            </div>

            {/* Simulated Rainfall Input */}
            <div className="space-y-2 my-4">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Précipitation cumulée 24h :</span>
                <span className="font-mono font-bold text-white">{simulatedRain24h} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="140"
                step="5"
                value={simulatedRain24h}
                onChange={(e) => setSimulatedRain24h(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Vigilance Level Box */}
            <div className={`p-4 rounded-xl border transition-all ${
              activeWarning.niveau === 'ROUGE' ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]' :
              activeWarning.niveau === 'ORANGE' ? 'bg-orange-950/40 border-orange-500/60 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.2)]' :
              activeWarning.niveau === 'JAUNE' ? 'bg-amber-950/40 border-amber-500/60 text-amber-300' :
              'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
                <span className="font-mono font-bold text-xs uppercase tracking-wider">
                  NIVEAU {activeWarning.niveau} · {activeWarning.label}
                </span>
              </div>
              <div className="text-xs mt-2 text-slate-200">
                Débit estimé au collecteur : <strong className="font-mono">{activeWarning.debitSeuilM3s} m³/s</strong>
              </div>
            </div>

            {/* Protocol checklist */}
            <div className="mt-4 space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">
                Actions Opérationnelles Déclenchées :
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activeWarning.actionsDeclenchees.map((act, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-950/50 p-2 rounded border border-slate-800/80">
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Réseau : 4 capteurs connectés</span>
            <span className="text-emerald-400">● Télémétrie Opérationnelle</span>
          </div>
        </div>
      </div>

      {/* Row 3: Hydraulic Risk Matrix (h vs v) & Spatial Inundation Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Matrix Chart (h x v) */}
        <div className="lg:col-span-7 border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-semibold text-cyan-400">MATRICE OFFICIELLE DES ALÉAS (PPRi / DIRECTIVE EU)</span>
              <h3 className="text-base font-semibold text-white mt-0.5">
                Croisement Hauteur de Submersion (h) × Vitesse d'Écoulement (v)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">11 Sections modélisées</span>
          </div>

          <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800 relative">
            <svg viewBox="0 0 500 280" className="w-full h-auto">
              {/* Colored Hazard Quadrants */}
              {/* Faible: h < 0.5 & v < 0.5 */}
              <rect x="40" y="210" width="80" height="40" fill="#10b981" fillOpacity="0.25" />
              {/* Moyen */}
              <rect x="120" y="210" width="80" height="40" fill="#f59e0b" fillOpacity="0.25" />
              <rect x="40" y="160" width="80" height="50" fill="#f59e0b" fillOpacity="0.25" />
              {/* Fort */}
              <rect x="200" y="160" width="260" height="90" fill="#f97316" fillOpacity="0.25" />
              <rect x="40" y="70" width="160" height="90" fill="#f97316" fillOpacity="0.25" />
              {/* Très Fort: h >= 2.0 or v >= 2.0 */}
              <rect x="40" y="20" width="420" height="50" fill="#f43f5e" fillOpacity="0.30" />
              <rect x="360" y="70" width="100" height="180" fill="#f43f5e" fillOpacity="0.30" />

              {/* Grid Lines */}
              <line x1="40" y1="210" x2="460" y2="210" stroke="#64748b" strokeDasharray="3 3" />
              <line x1="40" y1="160" x2="460" y2="160" stroke="#64748b" strokeDasharray="3 3" />
              <line x1="40" y1="70" x2="460" y2="70" stroke="#64748b" strokeDasharray="3 3" />
              <line x1="120" y1="20" x2="120" y2="250" stroke="#64748b" strokeDasharray="3 3" />
              <line x1="200" y1="20" x2="200" y2="250" stroke="#64748b" strokeDasharray="3 3" />
              <line x1="360" y1="20" x2="360" y2="250" stroke="#64748b" strokeDasharray="3 3" />

              {/* Axis labels */}
              <text x="35" y="213" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="end">0.5m</text>
              <text x="35" y="163" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="end">1.0m</text>
              <text x="35" y="73" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="end">2.0m</text>
              <text x="35" y="25" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="end">3.0m</text>

              <text x="120" y="265" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">0.5 m/s</text>
              <text x="200" y="265" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">1.0 m/s</text>
              <text x="360" y="265" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">2.0 m/s</text>

              {/* Scatter Points of HEC-RAS sections */}
              {HEC_RAS_SECTIONS.map((sec) => {
                // v from 0 to 3.0 m/s -> X from 40 to 460
                const px = 40 + (sec.q100VelocityMs / 3.0) * 420;
                // h from 0 to 5.5 m -> Y from 250 to 20
                const py = 250 - (sec.q100DepthM / 5.5) * 230;
                const isSelected = sec.sectionId === selectedSectionPoint;

                return (
                  <g
                    key={sec.sectionId}
                    className="cursor-pointer"
                    onClick={() => setSelectedSectionPoint(sec.sectionId)}
                  >
                    <circle
                      cx={px}
                      cy={py}
                      r={isSelected ? 7 : 5}
                      fill={
                        sec.hazardLevel === 'Très Fort' ? '#f43f5e' :
                        sec.hazardLevel === 'Fort' ? '#f97316' :
                        sec.hazardLevel === 'Moyen' ? '#f59e0b' : '#10b981'
                      }
                      stroke={isSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <text
                      x={px}
                      y={py - 8}
                      fill="#e2e8f0"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {sec.stationPK}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Matrix Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 mt-2">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500/60 inline-block rounded" /> Aléa Faible</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500/60 inline-block rounded" /> Aléa Moyen</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-orange-500/60 inline-block rounded" /> Aléa Fort</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500/60 inline-block rounded" /> Aléa Très Fort</span>
            </div>
          </div>
        </div>

        {/* Selected Section Detail Card */}
        <div className="lg:col-span-5 border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-semibold text-cyan-400">FICHE TECHNIQUE DE LA SECTION</span>
            <span className="text-xs font-mono text-slate-400">{highlightedSection.stationPK}</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs font-mono text-cyan-400 font-bold">{highlightedSection.sectionId}</div>
              <h4 className="text-sm font-semibold text-white mt-0.5">{highlightedSection.vulnerabilityZone}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {highlightedSection.observations}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">TIRANT D'EAU Q100</span>
                <span className="text-base font-bold text-white">{highlightedSection.q100DepthM.toFixed(2)} m</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">VITESSE MOYENNE</span>
                <span className="text-base font-bold text-cyan-400">{highlightedSection.q100VelocityMs.toFixed(2)} m/s</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">COTE D'EAU (Z)</span>
                <span className="text-base font-bold text-slate-200">{highlightedSection.q100WaterLevelM.toFixed(2)} m</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">LARGEUR AU MIROIR</span>
                <span className="text-base font-bold text-slate-200">{highlightedSection.q100TopWidthM.toFixed(1)} m</span>
              </div>
            </div>

            <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              highlightedSection.hazardLevel === 'Très Fort' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
              highlightedSection.hazardLevel === 'Fort' ? 'bg-orange-500/10 border-orange-500/30 text-orange-300' :
              'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <span className="font-semibold font-mono">Niveau d'Aléa Submersion :</span>
              <span className="font-bold uppercase font-mono">{highlightedSection.hazardLevel} (Score: {highlightedSection.hazardScore}/10)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
