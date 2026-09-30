import React, { useState } from 'react';
import { Waves, ArrowRight, ShieldAlert, CheckCircle2, ChevronRight, Activity, Info } from 'lucide-react';
import { HEC_RAS_SECTIONS } from '../data/projectData';
import { CrossSectionHECRAS } from '../types/hydrology';

export const HecRasVisualizer: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('XS_3050_PONT_RN');
  const [displayReturnPeriod, setDisplayReturnPeriod] = useState<'all' | 'q10' | 'q50' | 'q100'>('all');

  const selectedSection = HEC_RAS_SECTIONS.find((s) => s.sectionId === selectedSectionId) || HEC_RAS_SECTIONS[4];

  // Cross section SVG coordinate mapping
  const svgWidth = 640;
  const svgHeight = 280;
  const paddingX = 45;
  const paddingY = 40;

  // Local geometry approximation for rendering
  const bedWidth = selectedSection.bedWidthM;
  const topWidth = selectedSection.q100TopWidthM;
  const zBed = selectedSection.invertElevationM;
  const zLeftBank = selectedSection.leftBankElevationM;
  const zRightBank = selectedSection.rightBankElevationM;
  const zMax = Math.max(zLeftBank, zRightBank, selectedSection.q100WaterLevelM) + 0.8;
  const zMin = zBed - 0.5;

  const scaleY = (z: number) => {
    return svgHeight - paddingY - ((z - zMin) / (zMax - zMin)) * (svgHeight - 2 * paddingY);
  };

  const scaleX = (distFromCenter: number) => {
    // distFromCenter in [-topWidth/1.5, topWidth/1.5]
    const halfSpan = Math.max(topWidth / 1.6, 25);
    return svgWidth / 2 + (distFromCenter / halfSpan) * ((svgWidth - 2 * paddingX) / 2);
  };

  // Channel points
  const pBedLeft = { x: scaleX(-bedWidth / 2), y: scaleY(zBed) };
  const pBedRight = { x: scaleX(bedWidth / 2), y: scaleY(zBed) };
  const pBankLeft = { x: scaleX(-topWidth / 2), y: scaleY(zLeftBank) };
  const pBankRight = { x: scaleX(topWidth / 2), y: scaleY(zRightBank) };
  const pFloodLeft = { x: scaleX(-topWidth * 0.75), y: scaleY(zLeftBank + 0.3) };
  const pFloodRight = { x: scaleX(topWidth * 0.75), y: scaleY(zRightBank + 0.3) };

  const terrainPath = `M ${pFloodLeft.x} ${pFloodLeft.y} L ${pBankLeft.x} ${pBankLeft.y} L ${pBedLeft.x} ${pBedLeft.y} L ${pBedRight.x} ${pBedRight.y} L ${pBankRight.x} ${pBankRight.y} L ${pFloodRight.x} ${pFloodRight.y}`;
  const terrainFill = `${terrainPath} L ${pFloodRight.x} ${svgHeight - paddingY} L ${pFloodLeft.x} ${svgHeight - paddingY} Z`;

  // Water level Y coordinates
  const yQ10 = scaleY(selectedSection.q10WaterLevelM);
  const yQ50 = scaleY(selectedSection.q50WaterLevelM);
  const yQ100 = scaleY(selectedSection.q100WaterLevelM);

  // Water polygon for Q100
  const waterQ100Path = `M ${pBankLeft.x} ${yQ100} L ${pBedLeft.x} ${pBedLeft.y} L ${pBedRight.x} ${pBedRight.y} L ${pBankRight.x} ${yQ100} Z`;

  // Freeboard calculation for Q100
  const minBank = Math.min(zLeftBank, zRightBank);
  const freeboard = minBank - selectedSection.q100WaterLevelM;
  const isOverflow = freeboard < 0;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Title block */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <Waves className="w-4 h-4" />
              <span>SIMULATEUR HYDRAULIQUE HEC-RAS 1D / 2D TRANSIENT & PERMANENT</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-display">
              Visualisation des Profils en Travers et Ligne d'Eau
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
              Examen des cotes d'eau atteintes, vitesses d'écoulement et zones d'aléa de submersion
              le long des 4 850 mètres modélisés du collecteur naturel BR.
            </p>
          </div>

          {/* Return period selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
            {(['all', 'q100', 'q50', 'q10'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setDisplayReturnPeriod(period)}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
                  displayReturnPeriod === period
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {period === 'all' ? 'Toutes Crues' : period.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main interactive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cross section picker list */}
        <div className="lg:col-span-4 border border-slate-800 bg-slate-900/60 rounded-xl p-4 flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="font-semibold text-slate-300 uppercase font-mono">Sections HEC-RAS</span>
            <span className="text-slate-400 font-mono">11 Profils bathymétriques</span>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[580px] pr-1">
            {HEC_RAS_SECTIONS.map((sec) => {
              const isSelected = sec.sectionId === selectedSectionId;
              return (
                <div
                  key={sec.sectionId}
                  onClick={() => setSelectedSectionId(sec.sectionId)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-semibold text-cyan-400">{sec.stationPK}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      sec.hazardLevel === 'Très Fort' ? 'bg-rose-500/20 text-rose-400' :
                      sec.hazardLevel === 'Fort' ? 'bg-orange-500/20 text-orange-400' :
                      sec.hazardLevel === 'Moyen' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      Aléa {sec.hazardLevel}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-200 line-clamp-1">
                    {sec.vulnerabilityZone}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-1 border-t border-slate-800/60">
                    <span>h(Q100) = {sec.q100DepthM.toFixed(2)}m</span>
                    <span>v = {sec.q100VelocityMs.toFixed(2)} m/s</span>
                    <span>Z = {sec.q100WaterLevelM.toFixed(2)}m</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dynamic SVG Cross Section & Profile analysis */}
        <div className="lg:col-span-8 space-y-6">
          {/* Cross Section SVG Card */}
          <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">{selectedSection.stationPK}</span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="text-xs font-mono text-slate-300">ID: {selectedSection.sectionId}</span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="text-xs text-slate-400 font-mono">Dist: {selectedSection.distanceM} m</span>
                </div>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  Profil en Travers {selectedSection.stationPK} — {selectedSection.vulnerabilityZone}
                </h3>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2">
                {isOverflow ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Débordement Lit Majeur (+{Math.abs(freeboard).toFixed(2)}m)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Revanche Conforme (+{freeboard.toFixed(2)}m)</span>
                  </div>
                )}
              </div>
            </div>

            {/* SVG Render */}
            <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800/80 relative">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
                <defs>
                  <linearGradient id="waterGradQ100" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#0891b2" stopOpacity="0.80" />
                  </linearGradient>
                  <linearGradient id="terrainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1={paddingX} y1={yQ100} x2={svgWidth - paddingX} y2={yQ100} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />
                <line x1={paddingX} y1={scaleY(zBed)} x2={svgWidth - paddingX} y2={scaleY(zBed)} stroke="#475569" strokeWidth="0.8" opacity="0.4" />

                {/* Substratum terrain */}
                <path d={terrainFill} fill="url(#terrainGrad)" />
                <path d={terrainPath} fill="none" stroke="#94a3b8" strokeWidth="2.5" />

                {/* Water Body (Q100) */}
                {(displayReturnPeriod === 'all' || displayReturnPeriod === 'q100') && (
                  <>
                    <path d={waterQ100Path} fill="url(#waterGradQ100)" />
                    <line x1={pBankLeft.x} y1={yQ100} x2={pBankRight.x} y2={yQ100} stroke="#38bdf8" strokeWidth="2" />
                    <text x={svgWidth - paddingX - 10} y={yQ100 - 6} fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="end">
                      PHEC Q100 = {selectedSection.q100WaterLevelM.toFixed(2)} m
                    </text>
                  </>
                )}

                {/* Water Level Q50 line */}
                {(displayReturnPeriod === 'all' || displayReturnPeriod === 'q50') && (
                  <>
                    <line x1={scaleX(-topWidth * 0.42)} y1={yQ50} x2={scaleX(topWidth * 0.42)} y2={yQ50} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
                    <text x={paddingX + 10} y={yQ50 - 4} fill="#f59e0b" fontSize="9" fontFamily="monospace">
                      Q50 = {selectedSection.q50WaterLevelM.toFixed(2)} m
                    </text>
                  </>
                )}

                {/* Water Level Q10 line */}
                {(displayReturnPeriod === 'all' || displayReturnPeriod === 'q10') && (
                  <>
                    <line x1={scaleX(-topWidth * 0.35)} y1={yQ10} x2={scaleX(topWidth * 0.35)} y2={yQ10} stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
                    <text x={paddingX + 10} y={yQ10 - 4} fill="#10b981" fontSize="9" fontFamily="monospace">
                      Q10 = {selectedSection.q10WaterLevelM.toFixed(2)} m
                    </text>
                  </>
                )}

                {/* Bank Annotations */}
                <circle cx={pBankLeft.x} cy={pBankLeft.y} r="3" fill="#cbd5e1" />
                <circle cx={pBankRight.x} cy={pBankRight.y} r="3" fill="#cbd5e1" />
                <text x={pBankLeft.x - 4} y={pBankLeft.y - 8} fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">
                  Berge G ({zLeftBank.toFixed(2)}m)
                </text>
                <text x={pBankRight.x + 4} y={pBankRight.y - 8} fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="start">
                  Berge D ({zRightBank.toFixed(2)}m)
                </text>

                {/* Bed Invert Annotation */}
                <circle cx={scaleX(0)} cy={scaleY(zBed)} r="3" fill="#38bdf8" />
                <text x={scaleX(0)} y={scaleY(zBed) + 14} fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  Radier : {zBed.toFixed(2)} m
                </text>
              </svg>

              {/* Legend overlay */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 mt-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 bg-cyan-400 inline-block" /> Q100 (104.7 m³/s)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 bg-amber-400 inline-block" /> Q50 (82.4 m³/s)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 bg-emerald-400 inline-block" /> Q10 (48.6 m³/s)
                  </span>
                </div>
                <span>Manning lit: n={selectedSection.manningChannel} · berges: n={selectedSection.manningLeftBank}</span>
              </div>
            </div>

            {/* Diagnostic observation */}
            <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">Diagnostic d'Expertise Hydraulique : </span>
                {selectedSection.observations}
              </div>
            </div>
          </div>

          {/* Hydraulic Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Tirant d'Eau (h)</div>
              <div className="text-xl font-mono font-bold text-white mt-1">
                {selectedSection.q100DepthM.toFixed(2)} <span className="text-xs font-normal text-slate-400">m</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Sur radier PK</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Vitesse Moyenne (v)</div>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                {selectedSection.q100VelocityMs.toFixed(2)} <span className="text-xs font-normal text-slate-400">m/s</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Sous crue centennale</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Nombre de Froude</div>
              <div className="text-xl font-mono font-bold text-amber-400 mt-1">
                {selectedSection.q100Froude.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {selectedSection.q100Froude < 1 ? 'Régime Fluvial (Fr < 1)' : 'Régime Torrentiel (Fr > 1)'}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Largeur au Miroir (B)</div>
              <div className="text-xl font-mono font-bold text-white mt-1">
                {selectedSection.q100TopWidthM.toFixed(1)} <span className="text-xs font-normal text-slate-400">m</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Emprise d inondation</div>
            </div>
          </div>

          {/* Long profile interactive preview */}
          <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5">
            <h4 className="text-xs font-semibold uppercase font-mono text-slate-300 mb-3 flex items-center justify-between">
              <span>Profil en Long Hydraulique (PK 0+000 à PK 4+850)</span>
              <span className="text-cyan-400">Pente moyenne = 2.45 %</span>
            </h4>
            <div className="h-32 w-full flex items-end gap-1.5 pt-4">
              {HEC_RAS_SECTIONS.map((sec) => {
                const heightPct = ((sec.invertElevationM - 140) / (200 - 140)) * 100;
                const waterHeightPct = ((sec.q100WaterLevelM - 140) / (202 - 140)) * 100;
                const isSelected = sec.sectionId === selectedSectionId;

                return (
                  <div
                    key={sec.sectionId}
                    onClick={() => setSelectedSectionId(sec.sectionId)}
                    title={`${sec.stationPK} : Radier=${sec.invertElevationM}m, Q100=${sec.q100WaterLevelM}m`}
                    className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
                  >
                    <div className="w-full relative flex flex-col justify-end" style={{ height: `${waterHeightPct}%` }}>
                      <div className={`w-full rounded-t transition-colors ${
                        isSelected ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-cyan-700/60 group-hover:bg-cyan-500'
                      }`} style={{ height: '6px' }} />
                      <div className="w-full bg-slate-700/40 rounded-b mt-0.5" style={{ height: `${heightPct}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-1 truncate">
                      {sec.distanceM}m
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
