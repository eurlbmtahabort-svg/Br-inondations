import React, { useState } from 'react';
import { Calculator, CheckCircle, AlertTriangle, RefreshCw, BookmarkCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import { HYDRAULIC_STRUCTURES } from '../data/projectData';

export const HydraulicCalculator: React.FC = () => {
  // Sizing mode
  const [structureType, setStructureType] = useState<'dalot' | 'canal' | 'buse'>('dalot');

  // Parameters
  const [designFlow, setDesignFlow] = useState<number>(104.7); // Q100 m3/s
  const [slopePercent, setSlopePercent] = useState<number>(0.85); // 0.85%
  const [stricklerK, setStricklerK] = useState<number>(75); // Lisse béton
  const [numCells, setNumCells] = useState<number>(2); // Double cadre
  const [cellWidth, setCellWidth] = useState<number>(4.5); // m
  const [cellHeight, setCellHeight] = useState<number>(3.0); // m
  const [sideSlopeM, setSideSlopeM] = useState<number>(1.5); // Fruit pour trapèze (m: 1 vertical pour m horizontal)
  const [pipeDiameter, setPipeDiameter] = useState<number>(1.8); // m

  // Calculations
  const slope = slopePercent / 100;
  const flowPerCell = designFlow / numCells;

  // Sizing results
  let waterDepth = 0;
  let flowArea = 0;
  let wettedPerimeter = 0;
  let hydraulicRadius = 0;
  let flowVelocity = 0;
  let totalCapacity = 0;
  let freeboard = 0;

  if (structureType === 'dalot') {
    // Rectangular open-channel / closed conduit flow
    // Q = K * S * Rh^(2/3) * sqrt(I)
    // S = b * y ; P = b + 2y
    // Solve for y iteratively
    let y = 0.5;
    for (let i = 0; i < 40; i++) {
      const S = cellWidth * y;
      const P = cellWidth + 2 * y;
      const Rh = S / P;
      const Qcalc = stricklerK * S * Math.pow(Rh, 2 / 3) * Math.sqrt(slope);
      const diff = flowPerCell - Qcalc;
      if (Math.abs(diff) < 0.001) break;
      // Numerical derivative
      const dQ = stricklerK * Math.sqrt(slope) * (cellWidth * Math.pow(Rh, 2/3) + S * (2/3) * Math.pow(Rh, -1/3) * ((cellWidth*P - S*2)/(P*P)));
      y = y + diff / Math.max(dQ, 0.1);
      if (y <= 0) y = 0.05;
      if (y > cellHeight * 1.5) break;
    }
    waterDepth = Math.min(y, cellHeight * 1.3);
    flowArea = cellWidth * waterDepth * numCells;
    wettedPerimeter = (cellWidth + 2 * waterDepth) * numCells;
    hydraulicRadius = (cellWidth * waterDepth) / (cellWidth + 2 * waterDepth);
    flowVelocity = designFlow / flowArea;
    freeboard = cellHeight - waterDepth;

    // Full capacity
    const Sfull = cellWidth * cellHeight;
    const Pfull = 2 * (cellWidth + cellHeight);
    const RhFull = Sfull / Pfull;
    totalCapacity = numCells * (stricklerK * Sfull * Math.pow(RhFull, 2 / 3) * Math.sqrt(slope));
  } else if (structureType === 'canal') {
    // Trapezoidal channel: S = (b + m*y)*y ; P = b + 2*y*sqrt(1 + m^2)
    let y = 0.8;
    for (let i = 0; i < 40; i++) {
      const S = (cellWidth + sideSlopeM * y) * y;
      const P = cellWidth + 2 * y * Math.sqrt(1 + sideSlopeM * sideSlopeM);
      const Rh = S / P;
      const Qcalc = stricklerK * S * Math.pow(Rh, 2 / 3) * Math.sqrt(slope);
      const diff = flowPerCell - Qcalc;
      if (Math.abs(diff) < 0.001) break;
      const dQ = stricklerK * Math.sqrt(slope) * 1.5 * Math.pow(Rh, 2/3) * (cellWidth + 2 * sideSlopeM * y);
      y = y + diff / Math.max(dQ, 0.1);
      if (y <= 0) y = 0.05;
      if (y > cellHeight * 1.8) break;
    }
    waterDepth = y;
    flowArea = (cellWidth + sideSlopeM * waterDepth) * waterDepth * numCells;
    wettedPerimeter = (cellWidth + 2 * waterDepth * Math.sqrt(1 + sideSlopeM * sideSlopeM)) * numCells;
    hydraulicRadius = flowArea / wettedPerimeter;
    flowVelocity = designFlow / flowArea;
    freeboard = cellHeight - waterDepth;

    const Sfull = (cellWidth + sideSlopeM * cellHeight) * cellHeight;
    const Pfull = cellWidth + 2 * cellHeight * Math.sqrt(1 + sideSlopeM * sideSlopeM);
    const RhFull = Sfull / Pfull;
    totalCapacity = numCells * (stricklerK * Sfull * Math.pow(RhFull, 2 / 3) * Math.sqrt(slope));
  } else {
    // Circular pipe approximation
    // Full section: S = pi * D^2 / 4 ; P = pi * D ; Rh = D/4
    const D = pipeDiameter;
    const Sfull = (Math.PI * D * D) / 4;
    const Pfull = Math.PI * D;
    const RhFull = D / 4;
    totalCapacity = numCells * (stricklerK * Sfull * Math.pow(RhFull, 2 / 3) * Math.sqrt(slope));
    
    // Fill ratio approximation
    const ratio = Math.min(designFlow / totalCapacity, 1.2);
    waterDepth = D * Math.min(ratio * 0.85, 1.0);
    flowArea = Sfull * Math.min(ratio, 1.0) * numCells;
    flowVelocity = designFlow / Math.max(flowArea, 0.1);
    freeboard = D - waterDepth;
    hydraulicRadius = RhFull;
  }

  const isFreeboardValid = freeboard >= 0.30;
  const isVelocitySelfCleansing = flowVelocity >= 0.60;
  const isVelocityNonErosive = flowVelocity <= 4.50;
  const safetyMarginPct = ((totalCapacity - designFlow) / designFlow) * 100;

  const loadPreset = (preset: typeof HYDRAULIC_STRUCTURES[0]) => {
    setDesignFlow(preset.designFlowM3s);
    setSlopePercent(preset.slopePercent);
    setStricklerK(preset.manningStricklerK);

    if (preset.type === 'Dalot Béton Armé') {
      setStructureType('dalot');
      setNumCells(2);
      setCellWidth(4.5);
      setCellHeight(3.0);
    } else if (preset.type === 'Canal Trapézoïdal') {
      setStructureType('canal');
      setNumCells(1);
      setCellWidth(5.0);
      setCellHeight(2.8);
      setSideSlopeM(1.5);
    } else if (preset.type === 'Buse Circulaire') {
      setStructureType('buse');
      setNumCells(3);
      setPipeDiameter(1.8);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <Calculator className="w-4 h-4" />
              <span>DIMENSIONNEMENT HYDRAULIQUE RIGORISTE · FORMULE DE MANNING-STRICKLER</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-display">
              Calculateur Hydraulique des Ouvrages d'Assainissement
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
              Outil de vérification et de dimensionnement des dalots béton armé, buses circulaires et canaux de dérivation
              avec contrôle de la revanche réglementaire et des vitesses d'auto-curage.
            </p>
          </div>

          {/* Sizing type selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setStructureType('dalot')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                structureType === 'dalot' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dalot Cadre BA
            </button>
            <button
              onClick={() => setStructureType('canal')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                structureType === 'canal' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Canal Trapézoïdal
            </button>
            <button
              onClick={() => setStructureType('buse')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                structureType === 'buse' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Batterie de Buses
            </button>
          </div>
        </div>
      </div>

      {/* Preset loader bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-xs">
        <span className="text-slate-400 font-mono flex items-center gap-1.5 mr-2">
          <BookmarkCheck className="w-4 h-4 text-cyan-400" />
          Pré-configurations du Projet BR :
        </span>
        {HYDRAULIC_STRUCTURES.filter(s => s.type !== 'Bassin de Rétention' && s.type !== 'Digue de Protection').map((preset) => (
          <button
            key={preset.id}
            onClick={() => loadPreset(preset)}
            className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors"
          >
            {preset.id} : {preset.type} ({preset.dimensions})
          </button>
        ))}
      </div>

      {/* Main calculation interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Column */}
        <div className="lg:col-span-5 border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300 uppercase font-mono">
              Paramètres d'Entrée Hydraulique
            </span>
            <span className="text-xs text-cyan-400 font-mono">Formule Q = K·S·Rh^(2/3)·I^(1/2)</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Design Flow */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Débit de Projet Centennal (Q) :</span>
                <span className="font-mono font-semibold text-cyan-400">{designFlow} m³/s</span>
              </div>
              <input
                type="range"
                min="5"
                max="160"
                step="0.5"
                value={designFlow}
                onChange={(e) => setDesignFlow(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Longitudinal slope */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Pente Radier (I) :</span>
                <span className="font-mono font-semibold text-cyan-400">{slopePercent}% ({ (slopePercent * 10).toFixed(1) } m/km)</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={slopePercent}
                onChange={(e) => setSlopePercent(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Strickler coefficient */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Coefficient de Strickler (K) :</span>
                <span className="font-mono font-semibold text-cyan-400">{stricklerK} (Manning n = {(1/stricklerK).toFixed(3)})</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="30"
                  max="90"
                  step="1"
                  value={stricklerK}
                  onChange={(e) => setStricklerK(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                  {stricklerK >= 75 ? 'Béton lisse' : stricklerK >= 60 ? 'Béton brut' : 'Enrochement'}
                </span>
              </div>
            </div>

            {/* Geometry specific inputs */}
            {structureType === 'dalot' && (
              <>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Nombre d'alvéoles (N) :</label>
                    <select
                      value={numCells}
                      onChange={(e) => setNumCells(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                    >
                      <option value={1}>1 cadre simple</option>
                      <option value={2}>2 cadres (Double dalot)</option>
                      <option value={3}>3 cadres (Triple dalot)</option>
                      <option value={4}>4 cadres</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Largeur alvéole (b) :</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cellWidth}
                      onChange={(e) => setCellWidth(Math.max(0.5, parseFloat(e.target.value) || 1))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Hauteur d'ouverture (H) :</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cellHeight}
                    onChange={(e) => setCellHeight(Math.max(0.5, parseFloat(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </>
            )}

            {structureType === 'canal' && (
              <>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Largeur au radier (b) :</label>
                    <input
                      type="number"
                      step="0.2"
                      value={cellWidth}
                      onChange={(e) => setCellWidth(Math.max(0.5, parseFloat(e.target.value) || 1))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Hauteur totale berge (H) :</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cellHeight}
                      onChange={(e) => setCellHeight(Math.max(0.5, parseFloat(e.target.value) || 1))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Fruit des talus m (1V / mH) :</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sideSlopeM}
                    onChange={(e) => setSideSlopeM(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </>
            )}

            {structureType === 'buse' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-slate-400 block mb-1">Nombre de conduites :</label>
                  <select
                    value={numCells}
                    onChange={(e) => setNumCells(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  >
                    <option value={1}>1 buse</option>
                    <option value={2}>2 buses jumelées</option>
                    <option value={3}>3 buses en batterie</option>
                    <option value={4}>4 buses</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Diamètre nominal Ø (m) :</label>
                  <input
                    type="number"
                    step="0.1"
                    value={pipeDiameter}
                    onChange={(e) => setPipeDiameter(Math.max(0.4, parseFloat(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Output & Diagnostics Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Key Results Display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Tirant d'Eau Normal</span>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {waterDepth.toFixed(2)} <span className="text-xs font-normal text-slate-400">m</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Remplissage : {((waterDepth / (structureType === 'buse' ? pipeDiameter : cellHeight)) * 100).toFixed(0)}%
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Vitesse d'Écoulement</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {flowVelocity.toFixed(2)} <span className="text-xs font-normal text-slate-400">m/s</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                V = Q / Section mouillée
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Revanche de Sécurité</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${freeboard >= 0.30 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {freeboard.toFixed(2)} <span className="text-xs font-normal text-slate-400">m</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Norme min: 0.30 - 0.50m
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Capacité Maximale</span>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {totalCapacity.toFixed(1)} <span className="text-xs font-normal text-slate-400">m³/s</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Marge: +{safetyMarginPct.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Validation Checklist Card */}
          <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center justify-between">
              <span>Critères de Conformité Hydraulique & Normes de Génie Civil</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                isFreeboardValid && isVelocitySelfCleansing && isVelocityNonErosive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {isFreeboardValid && isVelocitySelfCleansing && isVelocityNonErosive ? 'DIMENSIONNEMENT CONFORME' : 'AJUSTEMENT RECOMMANDÉ'}
              </span>
            </h3>

            <div className="space-y-2 text-xs">
              {/* Check 1: Freeboard */}
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  {isFreeboardValid ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold text-slate-200">Revanche libre (Freeboard) : </span>
                    <span className="text-slate-400">Garantit la non-mise en charge pour le passage des corps flottants.</span>
                  </div>
                </div>
                <span className="font-mono font-semibold text-slate-300">
                  {freeboard >= 0.30 ? `OK (${freeboard.toFixed(2)}m ≥ 0.30m)` : `NON CONFORME (${freeboard.toFixed(2)}m < 0.30m)`}
                </span>
              </div>

              {/* Check 2: Self cleansing */}
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  {isVelocitySelfCleansing ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold text-slate-200">Condition d'auto-curage (V ≥ 0.60 m/s) : </span>
                    <span className="text-slate-400">Évite la sédimentation et l'ensablement en étiage.</span>
                  </div>
                </div>
                <span className="font-mono font-semibold text-slate-300">
                  {flowVelocity.toFixed(2)} m/s {isVelocitySelfCleansing ? '≥ 0.60 m/s' : '< 0.60 m/s (Risque dépôt)'}
                </span>
              </div>

              {/* Check 3: Non-erosion */}
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  {isVelocityNonErosive ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold text-slate-200">Vitesse maximale non érosive (V ≤ 4.50 m/s) : </span>
                    <span className="text-slate-400">Protège le radier en béton armé contre l'abrasion hydro-dynamique.</span>
                  </div>
                </div>
                <span className="font-mono font-semibold text-slate-300">
                  {flowVelocity.toFixed(2)} m/s {isVelocityNonErosive ? '≤ 4.50 m/s (Admissible)' : '> 4.50 m/s (Abrasif)'}
                </span>
              </div>
            </div>

            {/* Engineering Recommendation Box */}
            <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-lg text-xs text-slate-300">
              <span className="font-semibold text-cyan-300">Prescription de l'Expert Hydraulique : </span>
              {safetyMarginPct > 15 ? (
                <span>L'ouvrage présente une réserve capacitaire de +{safetyMarginPct.toFixed(1)}%, garantissant la résilience face aux incertitudes climatiques et à l'embâcle partiel.</span>
              ) : safetyMarginPct >= 0 ? (
                <span>L'ouvrage est calibré au plus juste (+{safetyMarginPct.toFixed(1)}%). Une surélévation de 20 cm ou un débroussaillage régulier en amont est impératif.</span>
              ) : (
                <span className="text-rose-300">Ouvrage sous-dimensionné pour la crue de projet ({safetyMarginPct.toFixed(1)}%). Risque imminent de surverse et de rupture d'accotement !</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
