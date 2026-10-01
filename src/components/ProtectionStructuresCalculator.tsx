import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  Droplets,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Download,
  Info
} from 'lucide-react';
import { ProjectLocationConfig } from '../types/hydrology';

interface ProtectionStructuresCalculatorProps {
  config: ProjectLocationConfig;
  language: 'fr' | 'ar';
}

export const ProtectionStructuresCalculator: React.FC<ProtectionStructuresCalculatorProps> = ({
  config,
  language
}) => {
  const isAr = language === 'ar';

  // Base hydrologic inputs from current study
  const areaKm2 = config.surfaceKm2;
  const slope = Math.max(config.slopePercent / 100, 0.005);
  const coeffC = 0.25 + (config.urbanizationPct / 100) * 0.65;
  const rainIntensityMmh = 85 + config.slopePercent * 8;
  const defaultQ100 = parseFloat(((coeffC * rainIntensityMmh * areaKm2) / 3.6).toFixed(2));

  // User adjustable design parameters
  const [designDischarge, setDesignDischarge] = useState<number>(defaultQ100);
  const [stricklerK, setStricklerK] = useState<number>(70); // 70 = Béton lisse, 35 = Enrochement
  const [structureType, setStructureType] = useState<'dalot' | 'canal' | 'bassin'>('dalot');

  // Dalot state
  const [dalotCells, setDalotCells] = useState<number>(2);
  const [dalotWidth, setDalotWidth] = useState<number>(3.0); // m per cell
  const [dalotHeight, setDalotHeight] = useState<number>(2.5); // m

  // Canal state
  const [canalBottomWidth, setCanalBottomWidth] = useState<number>(4.0); // m
  const [canalSideSlope, setCanalSideSlope] = useState<number>(1.0); // 1:1 or 0 for rectangular
  const [canalTotalHeight, setCanalTotalHeight] = useState<number>(2.5); // m

  // Retention basin state
  const [targetEcretementPct, setTargetEcretementPct] = useState<number>(40); // 40% reduction of peak

  // 1. Dalot Calculations (Manning-Strickler iterative water depth)
  const calcDalot = () => {
    const qPerCell = designDischarge / Math.max(dalotCells, 1);
    let y = 0.5;
    for (let i = 0; i < 30; i++) {
      const area = dalotWidth * y;
      const perim = dalotWidth + 2 * y;
      const rh = area / Math.max(perim, 0.1);
      const qCalc = stricklerK * area * Math.pow(rh, 2 / 3) * Math.sqrt(slope);
      const diff = qCalc - qPerCell;
      if (Math.abs(diff) < 0.01) break;
      y = Math.max(0.1, y - diff * 0.02);
    }
    const waterDepth = Math.min(parseFloat(y.toFixed(2)), dalotHeight * 1.2);
    const flowArea = dalotWidth * waterDepth * dalotCells;
    const velocity = parseFloat((designDischarge / Math.max(flowArea, 0.1)).toFixed(2));
    const freeboard = parseFloat((dalotHeight - waterDepth).toFixed(2));
    const isSafe = freeboard >= 0.30;
    const froude = parseFloat((velocity / Math.sqrt(9.81 * waterDepth)).toFixed(2));

    return { waterDepth, velocity, freeboard, isSafe, froude };
  };

  // 2. Canal Calculations
  const calcCanal = () => {
    let y = 0.5;
    for (let i = 0; i < 35; i++) {
      const area = (canalBottomWidth + canalSideSlope * y) * y;
      const perim = canalBottomWidth + 2 * y * Math.sqrt(1 + canalSideSlope * canalSideSlope);
      const rh = area / Math.max(perim, 0.1);
      const qCalc = stricklerK * area * Math.pow(rh, 2 / 3) * Math.sqrt(slope);
      const diff = qCalc - designDischarge;
      if (Math.abs(diff) < 0.01) break;
      y = Math.max(0.1, y - diff * 0.02);
    }
    const waterDepth = parseFloat(y.toFixed(2));
    const flowArea = (canalBottomWidth + canalSideSlope * waterDepth) * waterDepth;
    const velocity = parseFloat((designDischarge / Math.max(flowArea, 0.1)).toFixed(2));
    const freeboard = parseFloat((canalTotalHeight - waterDepth).toFixed(2));
    const isSafe = freeboard >= 0.50;
    const froude = parseFloat((velocity / Math.sqrt(9.81 * waterDepth)).toFixed(2));

    return { waterDepth, velocity, freeboard, isSafe, froude, flowArea };
  };

  // 3. Basin Calculations
  const calcBasin = () => {
    const qIn = designDischarge;
    const qOut = designDischarge * (1 - targetEcretementPct / 100);
    const tcHours = Math.max((0.0195 * Math.pow(config.drainLengthKm * 1000, 0.77) * Math.pow(slope, -0.385)) / 60, 0.5);
    // Method of volumes (Rain hydrograph triangular approximation)
    const requiredVolumeM3 = Math.round(0.5 * (qIn - qOut) * tcHours * 3600);
    const waterDepthM = 3.0; // typical depth
    const footprintAreaM2 = Math.round(requiredVolumeM3 / waterDepthM);

    return { qOut: parseFloat(qOut.toFixed(2)), requiredVolumeM3, footprintAreaM2, waterDepthM };
  };

  const dalotRes = calcDalot();
  const canalRes = calcCanal();
  const basinRes = calcBasin();

  return (
    <div className="border border-slate-800 bg-slate-900/70 rounded-2xl p-5 sm:p-7 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold mb-1">
            <Calculator className="w-4 h-4" />
            <span>{isAr ? 'الأبعاد الهندسية لمنشآت الحماية (MANNING-STRICKLER)' : 'DIMENSIONNEMENT DES OUVRAGES HYDRAULIQUES'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            {isAr ? 'حاسبة أبعاد العبارات الصندوقية والقنوات وسدود التسكين' : 'Dimensionnement des Dalots, Canaux et Bassins d\'Écrêtement'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {isAr
              ? `محسوبة تلقائياً لتدفق الذروة Q100 = ${designDischarge} م³/ثا لمنطقة: ${config.locationName}`
              : `Calculé automatiquement pour le débit de pointe centennal Q100 = ${designDischarge} m³/s (${config.locationName})`}
          </p>
        </div>

        {/* Structure Selector Tabs */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setStructureType('dalot')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              structureType === 'dalot' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'عبارة صندوقية (Dalot)' : 'Dalot Béton'}
          </button>
          <button
            onClick={() => setStructureType('canal')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              structureType === 'canal' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'قناة تصريف (Canal)' : 'Canal Béton'}
          </button>
          <button
            onClick={() => setStructureType('bassin')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              structureType === 'bassin' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'حوض تسكين (Bassin)' : 'Bassin Rétention'}
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs on Left, Results & Diagram on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parameters Input Column */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAr ? 'معايير التصميم الهيدروليكي' : 'PARAMÈTRES DE CONCEPTION'}</span>
          </h3>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-semibold">
              {isAr ? 'تدفق التصميم Q100 (م³/ثا)' : 'Débit de Projet Q100 (m³/s)'}
            </label>
            <input
              type="number"
              step="0.5"
              value={designDischarge}
              onChange={(e) => setDesignDischarge(Math.max(parseFloat(e.target.value) || 1, 0.1))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-semibold">
              {isAr ? 'معامل الخشونة لستريكلر K (Manning-Strickler)' : 'Coefficient de Strickler K'}
            </label>
            <select
              value={stricklerK}
              onChange={(e) => setStricklerK(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
            >
              <option value="75">K = 75 (Béton préfabriqué très lisse / بيتون أملس)</option>
              <option value="70">K = 70 (Béton armé standard coffré / بيتون مسلح عادي)</option>
              <option value="60">K = 60 (Maçonnerie de moellons / بناء حجري)</option>
              <option value="35">K = 35 (Lit naturel enroché / مجرى صخري طبيعي)</option>
            </select>
          </div>

          {structureType === 'dalot' && (
            <>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">
                    {isAr ? 'عدد الفتحات (N)' : 'Nombre d\'alvéoles'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={dalotCells}
                    onChange={(e) => setDalotCells(Math.max(parseInt(e.target.value) || 1, 1))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">
                    {isAr ? 'عرض الفتحة B (م)' : 'Largeur alvéole B (m)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={dalotWidth}
                    onChange={(e) => setDalotWidth(Math.max(parseFloat(e.target.value) || 1, 0.5))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">
                  {isAr ? 'ارتفاع الفتحة H (م)' : 'Hauteur totale H (m)'}
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="1"
                  value={dalotHeight}
                  onChange={(e) => setDalotHeight(Math.max(parseFloat(e.target.value) || 1, 0.5))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </>
          )}

          {structureType === 'canal' && (
            <>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">
                    {isAr ? 'عرض القاع b (م)' : 'Largeur radier b (m)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={canalBottomWidth}
                    onChange={(e) => setCanalBottomWidth(Math.max(parseFloat(e.target.value) || 1, 0.5))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">
                    {isAr ? 'انحدار الضفة m (1:m)' : 'Fruit talus m (1:m)'}
                  </label>
                  <select
                    value={canalSideSlope}
                    onChange={(e) => setCanalSideSlope(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="0">m = 0 (Rectangulaire / مستطيل)</option>
                    <option value="1">m = 1.0 (Trapézoïdal 1:1 / شبه منحرف)</option>
                    <option value="1.5">m = 1.5 (Talus doux 3:2)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">
                  {isAr ? 'الارتفاع الإجمالي للقناة H (م)' : 'Hauteur totale berge H (m)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={canalTotalHeight}
                  onChange={(e) => setCanalTotalHeight(Math.max(parseFloat(e.target.value) || 1, 0.5))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </>
          )}

          {structureType === 'bassin' && (
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">
                  {isAr ? 'نسبة تسكين ذروة الفيضان (%)' : 'Taux d\'écrêtement visé (%)'}
                </label>
                <input
                  type="range"
                  min="20"
                  max="70"
                  value={targetEcretementPct}
                  onChange={(e) => setTargetEcretementPct(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-cyan-300">
                  <span>20%</span>
                  <span className="font-bold text-white">{targetEcretementPct}%</span>
                  <span>70%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results & Verification Card Column */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-400">
                {isAr ? 'نتائج الحساب والتحقق الهيدروليكي' : 'RÉSULTATS DE CALCUL & VÉRIFICATION'}
              </span>
              {(structureType === 'dalot' ? dalotRes.isSafe : structureType === 'canal' ? canalRes.isSafe : true) ? (
                <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'مقبول هيدروليكياً (CONFORME)' : 'DIMENSIONNEMENT SÉCURISÉ'}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-mono text-rose-400 font-bold bg-rose-950/60 border border-rose-500/40 px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isAr ? 'خطر التدفق الفائض (DÉBORDEMENT)' : 'REVANCHE INSUFFISANTE'}</span>
                </span>
              )}
            </div>

            {/* Dalot Results */}
            {structureType === 'dalot' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">عمق الماء (Tirant d'eau y)</span>
                  <span className="text-base sm:text-lg font-mono font-bold text-white">{dalotRes.waterDepth} م</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">السرعة (Vitesse V)</span>
                  <span className="text-base sm:text-lg font-mono font-bold text-cyan-300">{dalotRes.velocity} م/ثا</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">علو الأمان (Revanche)</span>
                  <span className={`text-base sm:text-lg font-mono font-bold ${dalotRes.isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {dalotRes.freeboard} م
                  </span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">رقم فرود (Froude Fr)</span>
                  <span className="text-base sm:text-lg font-mono font-bold text-amber-300">
                    {dalotRes.froude} {dalotRes.froude < 1 ? '(نهري)' : '(سيلي)'}
                  </span>
                </div>
              </div>
            )}

            {/* Canal Results */}
            {structureType === 'canal' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">عمق التدفق y</span>
                  <span className="text-base sm:text-lg font-mono font-bold text-white">{canalRes.waterDepth} م</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">السرعة المتوسطة V</span>
                  <span className="text-base sm:text-lg font-mono font-bold text-cyan-300">{canalRes.velocity} م/ثا</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">علو الحافة الحرة</span>
                  <span className={`text-base sm:text-lg font-mono font-bold ${canalRes.isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {canalRes.freeboard} م
                  </span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">مقطع الجريان Sm</span>
                  <span className="text-base sm:text-lg font-mono font-bold text-purple-300">{canalRes.flowArea.toFixed(1)} م²</span>
                </div>
              </div>
            )}

            {/* Basin Results */}
            {structureType === 'bassin' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">التدفق المفرغ بعد التسكين Qout</span>
                  <span className="text-lg font-mono font-bold text-emerald-400">{basinRes.qOut} م³/ثا</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">الحجم التخزيني المطلوب Vret</span>
                  <span className="text-lg font-mono font-bold text-cyan-300">{basinRes.requiredVolumeM3.toLocaleString()} م³</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">المساحة السطحية التقريبية</span>
                  <span className="text-lg font-mono font-bold text-white">{basinRes.footprintAreaM2.toLocaleString()} م²</span>
                </div>
              </div>
            )}

            {/* Technical Recommendations Callout */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs leading-relaxed text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Info className="w-3.5 h-3.5" />
                <span>{isAr ? 'التوصية التقنية للمهندس :' : 'Recommandation Technique :'}</span>
              </div>
              <p>
                {structureType === 'dalot' &&
                  (isAr
                    ? `منشأة العبارة المقترحة تتكون من ${dalotCells} فتحات بمقاس (${dalotWidth}م × ${dalotHeight}م). علو الأمان المتبقي يبلغ ${dalotRes.freeboard}م وهو ${dalotRes.isSafe ? 'كافٍ ومطابق لتعليمات DRE' : 'غير كافٍ، يرجى زيادة الارتفاع أو عدد الفتحات'}.`
                    : `Dalot préconisé : ${dalotCells} alvéole(s) de (${dalotWidth}m × ${dalotHeight}m). La revanche hydraulique est de ${dalotRes.freeboard}m (${dalotRes.isSafe ? 'conforme aux normes' : 'insuffisante, augmenter la section'}).`)}
                {structureType === 'canal' &&
                  (isAr
                    ? `القناة المقترحة بعرض قاع ${canalBottomWidth}م وارتفاع ${canalTotalHeight}م تؤمن تصريف سيل Q100 بسرعة ${canalRes.velocity} م/ثا مع حافة حرة ${canalRes.freeboard}م.`
                    : `Canal préconisé : radier b = ${canalBottomWidth}m, profondeur d'eau y = ${canalRes.waterDepth}m, vitesse moyenne V = ${canalRes.velocity} m/s.`)}
                {structureType === 'bassin' &&
                  (isAr
                    ? `حوض التسكين يقلل تدفق الذروة بنسبة ${targetEcretementPct}% لتخفيف الضغط عن شبكة تصريف المياه والجسور في اتجاه مجرى الوادي.`
                    : `Le bassin de rétention permet un laminage de ${targetEcretementPct}%, réduisant le débit de crue centennale de ${designDischarge} à ${basinRes.qOut} m³/s.`)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
