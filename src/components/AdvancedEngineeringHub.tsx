import React, { useState } from 'react';
import { 
  Sliders, 
  TrendingUp, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  MapPin, 
  Download, 
  Layers, 
  Activity, 
  CheckCircle2, 
  FileCode, 
  Globe2,
  AlertTriangle
} from 'lucide-react';
import { ProjectLocationConfig } from '../types/hydrology';
import { exportToGoogleEarthKml, exportToGeoJson } from '../utils/gisExport';

interface AdvancedEngineeringHubProps {
  locationConfig: ProjectLocationConfig;
}

export const AdvancedEngineeringHub: React.FC<AdvancedEngineeringHubProps> = ({ locationConfig }) => {
  const [activeSubTab, setActiveSubTab] = useState<'climate' | 'breach' | 'costbenefit' | 'tc' | 'gis'>('climate');

  // Climate Change State
  const [rcpScenario, setRcpScenario] = useState<'RCP45' | 'RCP85'>('RCP85');
  const tempIncrease = rcpScenario === 'RCP85' ? 2.8 : 1.5;
  const precipFactor = rcpScenario === 'RCP85' ? 1.22 : 1.12;

  // Levee Breach State
  const [breachWidth, setBreachWidth] = useState<number>(35); // meters
  const [waterHead, setWaterHead] = useState<number>(4.2); // meters
  const waveVelocity = Math.sqrt(9.81 * waterHead) * 1.4; // m/s
  const arrivalTimeMinutes = Math.round((1.5 / (waveVelocity * 3.6)) * 60); // approx minutes for 1.5 km distance

  // Cost Benefit State
  const [structureType, setStructureType] = useState<'dam' | 'wall' | 'channel'>('wall');
  const [structureCostMln, setStructureCostMln] = useState<number>(14.5);
  const avoidedDamagesMln = structureType === 'dam' ? 62.0 : structureType === 'wall' ? 48.5 : 35.0;
  const bcrRatio = (avoidedDamagesMln / structureCostMln).toFixed(2);

  // Time of concentration method
  const [tcMethod, setTcMethod] = useState<'kirpich' | 'giandotti' | 'scs'>('kirpich');
  const L_km = locationConfig.drainLengthKm;
  const H_m = locationConfig.altMaxM - locationConfig.altMinM;
  const S_m_km = H_m / Math.max(L_km, 0.1);
  const A_km2 = locationConfig.surfaceKm2;

  // Calculate tc based on method
  let tcMinutes = 112;
  if (tcMethod === 'kirpich') {
    tcMinutes = Math.round(0.0195 * Math.pow(L_km * 1000, 0.77) * Math.pow(S_m_km, -0.385));
  } else if (tcMethod === 'giandotti') {
    tcMinutes = Math.round((33 * Math.sqrt(A_km2) + 10 * L_km) / (15 * Math.sqrt(H_m)));
  } else {
    tcMinutes = Math.round(57 * Math.pow(L_km, 0.8) * Math.pow((1000 / 75) - 9, 0.7) / Math.pow(S_m_km * 100, 0.5));
  }
  tcMinutes = Math.max(15, Math.min(tcMinutes, 360));

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="border border-slate-800 bg-slate-900/80 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>MODULES D'INGÉNIERIE AVANCÉE · HYDRO-INFORMATIQUE & GESTION DES RISQUES</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-display">
              Centre d'Expertise et de Simulation Avancée
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
              Outils de pointe pour l'analyse des scénarios climatiques (IPCC), modélisation de rupture de digues, 
              analyse coût-bénéfice, temps de concentration dynamique et exportation géospatiale SIG.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-xl">
            <span className="text-xs font-mono text-slate-400 px-2">Zone:</span>
            <span className="text-xs font-bold text-cyan-300 font-mono bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-500/30">
              {locationConfig.locationName} ({locationConfig.surfaceKm2} km²)
            </span>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveSubTab('climate')}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium font-mono flex items-center justify-center gap-2 transition-all ${
              activeSubTab === 'climate'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            1. Changement Climatique (IPCC)
          </button>
          <button
            onClick={() => setActiveSubTab('breach')}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium font-mono flex items-center justify-center gap-2 transition-all ${
              activeSubTab === 'breach'
                ? 'bg-rose-500 text-white font-bold shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            2. Rupture de Digue (Brach)
          </button>
          <button
            onClick={() => setActiveSubTab('costbenefit')}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium font-mono flex items-center justify-center gap-2 transition-all ${
              activeSubTab === 'costbenefit'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            3. Analyse Coût-Bénéfice (CBA)
          </button>
          <button
            onClick={() => setActiveSubTab('tc')}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium font-mono flex items-center justify-center gap-2 transition-all ${
              activeSubTab === 'tc'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            4. Temps de Concentration (tc)
          </button>
          <button
            onClick={() => setActiveSubTab('gis')}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium font-mono flex items-center justify-center gap-2 transition-all ${
              activeSubTab === 'gis'
                ? 'bg-indigo-500 text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            5. Export SIG (KML / GeoJSON)
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CLIMATE CHANGE (IPCC RCP 4.5 / RCP 8.5) */}
      {activeSubTab === 'climate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Paramètres Climatiques IPCC
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulation de l'impact du réchauffement global sur l'intensité des précipitations extrêmes et l'augmentation des débits de crue centennale (Q100).
            </p>
            <div className="space-y-3">
              <label className="text-xs font-mono text-slate-300 block">Scénario d'Émission GES (GIEC):</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRcpScenario('RCP45')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    rcpScenario === 'RCP45'
                      ? 'border-cyan-400 bg-cyan-950/30 text-white font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-mono">RCP 4.5</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Stabilisation modérée (+1.5°C)</div>
                </button>
                <button
                  onClick={() => setRcpScenario('RCP85')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    rcpScenario === 'RCP85'
                      ? 'border-cyan-400 bg-cyan-950/30 text-white font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-mono">RCP 8.5</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Émissions élevées (+2.8°C)</div>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Hausse Température Horizon 2050:</span>
                <span className="text-white font-mono font-bold">+{tempIncrease}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Facteur Amplification Pluie:</span>
                <span className="text-cyan-400 font-mono font-bold">×{precipFactor}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Impact sur les Débits de Crue (Q100 & Q500)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Débit Q100 Actuel</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">142.5 <span className="text-xs text-slate-400">m³/s</span></div>
              </div>
              <div className="bg-slate-950 border border-cyan-500/40 rounded-xl p-4 bg-cyan-950/10">
                <div className="text-xs font-mono text-cyan-400">Q100 (Horizon 2050 - {rcpScenario})</div>
                <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                  {(142.5 * precipFactor).toFixed(1)} <span className="text-xs text-cyan-400">m³/s</span>
                </div>
                <div className="text-[10px] text-cyan-400 font-mono mt-1">+{((precipFactor - 1) * 100).toFixed(0)}% augmentation</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Q500 (Extrême 2050)</div>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  {(198.0 * precipFactor).toFixed(1)} <span className="text-xs text-slate-400">m³/s</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              <strong>Recommandation d'Ingénierie Climatique :</strong> Les ouvrages de protection (murs de quête et bassins de rétention) doivent intégrer une revanche de sécurité supplémentaire de <strong>+0.45m</strong> pour absorber la majoration de débit liée au scénario {rcpScenario}.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LEVEE BREACH WAVE PROPAGATION */}
      {activeSubTab === 'breach' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Paramètres de Rupture (Breach)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulation dynamique d'une brèche soudaine dans le digue de protection ou le barrage de rétention en amont de la zone urbaine.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Largeur de Brèche (B): {breachWidth} m</label>
                <input 
                  type="range" min="10" max="100" value={breachWidth} 
                  onChange={(e) => setBreachWidth(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Charge d'Eau (H): {waterHead} m</label>
                <input 
                  type="range" min="1.0" max="8.0" step="0.2" value={waterHead} 
                  onChange={(e) => setWaterHead(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Propagation de l'Onde de Crue & Temps d'Arrivée
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Vitesse de l'Onde (Celerity)</div>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{waveVelocity.toFixed(1)} <span className="text-xs text-slate-400">m/s</span></div>
              </div>
              <div className="bg-slate-950 border border-rose-500/40 rounded-xl p-4 bg-rose-950/10">
                <div className="text-xs font-mono text-rose-400">Temps d'Arrivée (1.5 km en aval)</div>
                <div className="text-2xl font-bold font-mono text-rose-300 mt-1">{arrivalTimeMinutes} <span className="text-xs text-rose-400">minutes</span></div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Débit de Rupture de Pointe</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{(310 * (breachWidth / 35)).toFixed(0)} <span className="text-xs text-slate-400">m³/s</span></div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
              <div className="font-bold text-rose-400">🚨 Protocole d'Alerte Civile d'Urgence :</div>
              <p className="text-slate-300 leading-relaxed">
                En cas de rupture de la digue principale avec une charge de {waterHead}m, l'onde de submersion atteindra les premiers quartiers habités en moins de <strong>{arrivalTimeMinutes} minutes</strong>. Un système de sirènes automatisées couplé aux capteurs limnimétriques est indispensable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: COST BENEFIT ANALYSIS (CBA) */}
      {activeSubTab === 'costbenefit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Évaluation Économique (CBA)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyse coût-bénéfice comparant l'investissement requis pour les ouvrages de protection par rapport aux dommages évités aux infrastructures.
            </p>
            <div className="space-y-3">
              <label className="text-xs font-mono text-slate-300 block">Type d'Ouvrage de Protection:</label>
              <select 
                value={structureType} 
                onChange={(e) => {
                  const t = e.target.value as any;
                  setStructureType(t);
                  setStructureCostMln(t === 'dam' ? 24.0 : t === 'wall' ? 14.5 : 9.2);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="dam">Bassin de rétention amont (Retarding Basin)</option>
                <option value="wall">Murs de quête en béton armé (Flood Walls)</option>
                <option value="channel">Calage et élargissement de l'Oued (Channeling)</option>
              </select>

              <div>
                <label className="text-xs font-mono text-slate-300 block mt-2 mb-1">Coût d'Investissement: {structureCostMln} M DZD / M€</label>
                <input 
                  type="range" min="5.0" max="40.0" step="0.5" value={structureCostMln} 
                  onChange={(e) => setStructureCostMln(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Indicateurs de Rentabilité Économique
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Coût de l'Ouvrage</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{structureCostMln} <span className="text-xs text-slate-400">M</span></div>
              </div>
              <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 bg-emerald-950/10">
                <div className="text-xs font-mono text-emerald-400">Ratio Coût-Bénéfice (BCR)</div>
                <div className="text-3xl font-bold font-mono text-emerald-300 mt-1">{bcrRatio}</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-1">Rentable si BCR &gt; 1.5</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Dommages Évités (Q100)</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{avoidedDamagesMln} <span className="text-xs text-slate-400">M</span></div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              <strong>Conclusion Économique :</strong> Avec un ratio Benefit-Cost (BCR) de <strong>{bcrRatio}</strong>, le projet d'aménagement de protection est économiquement très viable et hautement recommandé par les bailleurs de fonds internationaux.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: TIME OF CONCENTRATION (tc) ADVANCED */}
      {activeSubTab === 'tc' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Formules de Temps de Concentration
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sélectionnez la méthode empirique adaptée aux caractéristiques morphologiques du bassin versant.
            </p>
            <div className="space-y-3">
              {[
                { id: 'kirpich', name: 'Kirpich (1940)', desc: 'Idéal pour bassins à forte pente et petits cours d\'eau' },
                { id: 'giandotti', name: 'Giandotti (1934)', desc: 'Standard européen pour bassins versants étendus' },
                { id: 'scs', name: 'SCS Lag Formula', desc: 'Méthode USDA basée sur le curve number' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setTcMethod(m.id as any)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    tcMethod === m.id
                      ? 'border-amber-400 bg-amber-950/30 text-white font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">{m.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              Résultat du Temps de Concentration (tc)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Longueur Talweg (L)</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{L_km} <span className="text-xs text-slate-400">km</span></div>
              </div>
              <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-4 bg-amber-950/10">
                <div className="text-xs font-mono text-amber-400">Temps de Concentration (tc)</div>
                <div className="text-3xl font-bold font-mono text-amber-300 mt-1">{tcMinutes} <span className="text-xs text-amber-400">min</span></div>
                <div className="text-[10px] text-amber-400 font-mono mt-1">({(tcMinutes / 60).toFixed(2)} heures)</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Dénivelé (ΔH)</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{H_m} <span className="text-xs text-slate-400">m</span></div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              <strong>Analyse Méthodologique :</strong> La méthode <strong>{tcMethod.toUpperCase()}</strong> appliquée sur ce bassin de {A_km2} km² donne un temps de concentration de {tcMinutes} minutes, déterminant directement l'intensité critique des pluies dans le calcul rationnel.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: GIS EXPORT HUB */}
      {activeSubTab === 'gis' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-indigo-400" />
            Centre d'Exportation Géospatiale (SIG / GIS)
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Téléchargez les vecteurs géographiques aux formats standard de l'industrie pour les importer directement dans **Google Earth**, **QGIS**, ou **ArcGIS**.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Google Earth KML Format (.kml)</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Inclut le point GPS d'exutoire, le polygone du bassin versant, le talweg du oued et l'enveloppe de submersion Q100 en 3D.
                </p>
              </div>
              <button
                onClick={() => exportToGoogleEarthKml(locationConfig)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger le fichier KML
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">QGIS / ArcGIS GeoJSON (.geojson)</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Format vectoriel standard contenant les métadonnées hydrologiques complètes pour l'analyse spatiale avancée.
                </p>
              </div>
              <button
                onClick={() => exportToGeoJson(locationConfig)}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold font-mono rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger le fichier GeoJSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
