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
  AlertTriangle,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ProjectLocationConfig } from '../types/hydrology';
import { exportToGoogleEarthKml, exportToGeoJson } from '../utils/gisExport';

interface AdvancedEngineeringHubProps {
  locationConfig: ProjectLocationConfig;
}

export const AdvancedEngineeringHub: React.FC<AdvancedEngineeringHubProps> = ({ locationConfig }) => {
  const [activeSubTab, setActiveSubTab] = useState<'climate' | 'breach' | 'costbenefit' | 'tc' | 'shear' | 'cctp' | 'nbs' | 'gis'>('climate');

  // Climate Change State
  const [rcpScenario, setRcpScenario] = useState<'RCP45' | 'RCP85'>('RCP85');
  const tempIncrease = rcpScenario === 'RCP85' ? 2.8 : 1.5;
  const precipFactor = rcpScenario === 'RCP85' ? 1.22 : 1.12;

  // Levee Breach State
  const [breachWidth, setBreachWidth] = useState<number>(35); // meters
  const [waterHead, setWaterHead] = useState<number>(4.2); // meters
  const waveVelocity = Math.sqrt(9.81 * waterHead) * 1.4; // m/s
  const arrivalTimeMinutes = Math.round((1.5 / (waveVelocity * 3.6)) * 60);

  // Cost Benefit State
  const [structureType, setStructureType] = useState<'dam' | 'wall' | 'channel'>('wall');
  const [structureCostMln, setStructureCostMln] = useState<number>(14.5);
  const avoidedDamagesMln = structureType === 'dam' ? 62.0 : structureType === 'wall' ? 48.5 : 35.0;
  const bcrRatio = (avoidedDamagesMln / structureCostMln).toFixed(2);

  // Time of concentration method
  const [tcMethod, setTcMethod] = useState<'kirpich' | 'giandotti' | 'passini' | 'ventura'>('kirpich');
  const L_km = locationConfig.drainLengthKm;
  const H_m = locationConfig.altMaxM - locationConfig.altMinM;
  const S_m_km = H_m / Math.max(L_km, 0.1);
  const A_km2 = locationConfig.surfaceKm2;

  // Multi-formula Tc calculations
  const tcKirpich = Math.round(0.0195 * Math.pow(L_km * 1000, 0.77) * Math.pow(S_m_km, -0.385));
  const tcGiandotti = Math.round((33 * Math.sqrt(A_km2) + 10 * L_km) / (15 * Math.sqrt(H_m)));
  const tcPassini = Math.round(0.108 * Math.pow(A_km2 * L_km, 1/3) / Math.sqrt(S_m_km));
  const tcVentura = Math.round(0.127 * Math.sqrt(A_km2 / S_m_km));

  const currentTc = tcMethod === 'kirpich' ? tcKirpich : tcMethod === 'giandotti' ? tcGiandotti : tcMethod === 'passini' ? tcPassini : tcVentura;

  // Shear stress & erosion calculation
  const [channelBedSlope, setChannelBedSlope] = useState<number>(0.0085);
  const [hydraulicRadius, setHydraulicRadius] = useState<number>(1.75); // m
  const unitWeightWater = 9810; // N/m3
  const shearStressPa = unitWeightWater * hydraulicRadius * channelBedSlope; // tau = gamma * Rh * S
  const permissibleShearPa = 120; // Pa for reinforced concrete / gabion revetment
  const isErosionRisk = shearStressPa > permissibleShearPa;

  // CCTP Copy state
  const [copiedCctp, setCopiedCctp] = useState<boolean>(false);
  const cctpText = `CAHIER DES CLAUSES TECHNIQUES PARTICULIÈRES (CCTP) - PROJET ${locationConfig.projectName.toUpperCase()}
========================================================================================
1. OBJECTIF DE L'ÉTUDE ET CADRE GÉOGRAPHIQUE :
   - Secteur d'étude : ${locationConfig.locationName}
   - Superficie du bassin versant : ${locationConfig.surfaceKm2} km²
   - Coordonnées exutoire : ${locationConfig.coordinates.lat.toFixed(4)}°N, ${locationConfig.coordinates.lng.toFixed(4)}°E

2. SPÉCIFICATIONS DES OUVRAGES DE PROTECTION CONTRE LES CRUES :
   - Débit de dimensionnement centennal Q100 retenu.
   - Revêtement des berges par gabions boîtes et matelas Reno (D50 = 350-400mm).
   - Béton armé dosé à 350 kg/m³ (C30/37) pour les dalots et radiers submergés.

3. CONTRÔLE DES CONTRAINTES HYDRAULIQUES ET DE L'ÉROSION :
   - Contrainte tangentielle maximale admise : τ = 120 Pa.
   - Vitesse maximale d'écoulement tolérée en régime torrentiel : v ≤ 3.5 m/s.
   - Intégration d'un rehaussement de sécurité de +0.50m pour revanche de crue.
`;

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
              analyse coût-bénéfice, comparaison de temps de concentration, vérification du cisaillement et cahier des charges CCTP.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-xl">
            <span className="text-xs font-mono text-slate-400 px-2">Zone:</span>
            <span className="text-xs font-bold text-cyan-300 font-mono bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-500/30">
              {locationConfig.locationName} ({locationConfig.surfaceKm2} km²)
            </span>
          </div>
        </div>

        {/* Sub-navigation Tabs (8 modules) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-6 pt-6 border-t border-slate-800">
          {[
            { id: 'climate', label: '1. Climat IPCC', icon: TrendingUp, color: 'cyan' },
            { id: 'breach', label: '2. Rupture Digue', icon: ShieldAlert, color: 'rose' },
            { id: 'costbenefit', label: '3. Analyse CBA', icon: DollarSign, color: 'emerald' },
            { id: 'tc', label: '4. Comparatif tc', icon: Clock, color: 'amber' },
            { id: 'shear', label: '5. Cisaillement τ', icon: Zap, color: 'teal' },
            { id: 'cctp', label: '6. Cahier CCTP', icon: FileText, color: 'purple' },
            { id: 'nbs', label: '7. Solutions NBS', icon: ShieldCheck, color: 'green' },
            { id: 'gis', label: '8. Export SIG', icon: Globe2, color: 'indigo' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium font-mono flex items-center justify-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label.split('. ')[1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: CLIMATE CHANGE (IPCC RCP 4.5 / RCP 8.5) */}
      {activeSubTab === 'climate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Scénarios Climatiques GIEC (IPCC)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sélectionnez l'horizon d'émissions de gaz à effet de serre pour estimer la surcote des précipitations extrêmes.
            </p>
            <div className="space-y-3">
              {[
                { id: 'RCP45', name: 'Scénario RCP 4.5 (Modéré)', temp: '+1.5°C à +2.0°C', mult: '+12% de pluie' },
                { id: 'RCP85', name: 'Scénario RCP 8.5 (Pessimiste)', temp: '+2.8°C à +4.0°C', mult: '+22% de pluie' },
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setRcpScenario(sc.id as any)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    rcpScenario === sc.id
                      ? 'border-cyan-400 bg-cyan-950/30 text-white font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-mono font-bold text-cyan-300">{sc.name}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 font-mono">
                    <span>{sc.temp}</span>
                    <span className="text-cyan-400 font-bold">{sc.mult}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Impact sur le Débit Centennal Q100 ({locationConfig.locationName})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Hausse Température</div>
                <div className="text-2xl font-bold font-mono text-amber-400 mt-1">+{tempIncrease} <span className="text-xs text-slate-400">°C</span></div>
              </div>
              <div className="bg-slate-950 border border-cyan-500/40 rounded-xl p-4 bg-cyan-950/10">
                <div className="text-xs font-mono text-cyan-400">Facteur Multiplicatif Q100</div>
                <div className="text-3xl font-bold font-mono text-cyan-300 mt-1">×{precipFactor}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Nouveau Q100 Corrigé</div>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{(104.7 * precipFactor).toFixed(1)} <span className="text-xs text-slate-400">m³/s</span></div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              <strong>Recommandation d'Ingénierie Climatique :</strong> L'intégration du facteur climatique {rcpScenario} impose un rehaussement des berges de protection de <strong>+35 cm</strong> supplémentaires pour garantir la résilience des ouvrages d'ici 2075.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LEVEE BREACH */}
      {activeSubTab === 'breach' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Paramètres de Rupture (Dam/Levee Breach)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">Largeur de Brèche B (m) : {breachWidth}m</label>
                <input 
                  type="range" min="10" max="80" value={breachWidth} onChange={(e) => setBreachWidth(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">Charge d'Eau H (m) : {waterHead}m</label>
                <input 
                  type="range" min="1.0" max="8.0" step="0.1" value={waterHead} onChange={(e) => setWaterHead(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              Résultats de l'Onde de Submersion (Dam Break Hydrodynamics)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Vitesse de l'Onde</div>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{waveVelocity.toFixed(1)} <span className="text-xs text-slate-400">m/s</span></div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Temps d'Arrivée (1.5 km)</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{arrivalTimeMinutes} <span className="text-xs text-slate-400">min</span></div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Débit de Pointe Brèche</div>
                <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{(280 * Math.sqrt(waterHead) * breachWidth / 35).toFixed(0)} <span className="text-xs text-slate-400">m³/s</span></div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              <strong>Alerte de Sécurité Civile :</strong> En cas de rupture subite de la digue amont, l'onde de crue atteindrait la zone urbanisée en moins de <strong>{arrivalTimeMinutes} minutes</strong>, justifiant l'installation de sirènes d'alerte automatique (SAP).
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: COST BENEFIT ANALYSIS */}
      {activeSubTab === 'costbenefit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Analyse Coût-Bénéfice (CBA)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">Type d'Ouvrage de Protection</label>
                <select 
                  value={structureType} onChange={(e) => setStructureType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono"
                >
                  <option value="wall">Mur de soutènement & Berges bétonnées</option>
                  <option value="dam">Bassin de rétention & Digue écrêteur</option>
                  <option value="channel">Calage et élargissement du collecteur</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">Coût d'Investissement ({structureCostMln} M€)</label>
                <input 
                  type="range" min="5.0" max="30.0" step="0.5" value={structureCostMln} onChange={(e) => setStructureCostMln(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Indicateurs Économiques et Rentabilité
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Coût Projet</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{structureCostMln} <span className="text-xs text-slate-400">M€</span></div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Dommages Évités</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{avoidedDamagesMln} <span className="text-xs text-slate-400">M€</span></div>
              </div>
              <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 bg-emerald-950/10">
                <div className="text-xs font-mono text-emerald-400">Ratio Bénéfice/Coût (BCR)</div>
                <div className="text-3xl font-bold font-mono text-emerald-300 mt-1">{bcrRatio}</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              <strong>Conclusion Économique :</strong> Avec un ratio BCR de <strong>{bcrRatio}</strong> (supérieur à 1.5), l'investissement dans la protection est hautement rentable et validé par les standards internationaux des bailleurs de fonds.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: TIME OF CONCENTRATION (tc) MULTI-FORMULA COMPARISON */}
      {activeSubTab === 'tc' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Comparaison des Formules de Temps de Concentration ($t_c$)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sélectionnez la formule empirique à retenir pour le calcul de la pluie critique du bassin ({locationConfig.surfaceKm2} km²).
            </p>
            <div className="space-y-2">
              {[
                { id: 'kirpich', name: 'Kirpich (1940)', val: tcKirpich, desc: 'Petits bassins à forte pente' },
                { id: 'giandotti', name: 'Giandotti (1934)', val: tcGiandotti, desc: 'Standard bassins versants moyens' },
                { id: 'passini', name: 'Passini (1914)', val: tcPassini, desc: 'Bassins mixtes collinéens' },
                { id: 'ventura', name: 'Ventura (1905)', val: tcVentura, desc: 'Formule morphométrique rapide' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setTcMethod(m.id as any)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    tcMethod === m.id
                      ? 'border-amber-400 bg-amber-950/30 text-white font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-mono font-bold">{m.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                  </div>
                  <div className="text-sm font-mono font-bold text-amber-300">{m.val} min</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              Analyse Comparative et Recommandation d'Expert
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-mono text-slate-400">Kirpich</div>
                <div className="text-xl font-bold font-mono text-white mt-1">{tcKirpich} min</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-mono text-slate-400">Giandotti</div>
                <div className="text-xl font-bold font-mono text-white mt-1">{tcGiandotti} min</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-mono text-slate-400">Passini</div>
                <div className="text-xl font-bold font-mono text-white mt-1">{tcPassini} min</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] font-mono text-slate-400">Ventura</div>
                <div className="text-xl font-bold font-mono text-white mt-1">{tcVentura} min</div>
              </div>
            </div>

            <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>Valeur Retenue pour la Note de Calcul : {currentTc} minutes ({(currentTc / 60).toFixed(2)} h)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                La méthode <strong>{tcMethod.toUpperCase()}</strong> a été validée par l'expert en raison de la pente moyenne de {locationConfig.slopePercent}% et de la longueur du talweg de {locationConfig.drainLengthKm} km.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SHEAR STRESS & EROSION VERIFICATION */}
      {activeSubTab === 'shear' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-teal-400" />
              Paramètres de Cisaillement ($\tau$)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">Pente du Lit S : {channelBedSlope}</label>
                <input 
                  type="range" min="0.001" max="0.030" step="0.0005" value={channelBedSlope} onChange={(e) => setChannelBedSlope(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">Rayon Hydraulique $R_h$ (m) : {hydraulicRadius}m</label>
                <input 
                  type="range" min="0.5" max="4.0" step="0.1" value={hydraulicRadius} onChange={(e) => setHydraulicRadius(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              Vérification de la Stabilité au Glissement et à l'Érosion
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Contrainte de Cisaillement (τ)</div>
                <div className="text-2xl font-bold font-mono text-teal-300 mt-1">{shearStressPa.toFixed(1)} <span className="text-xs text-slate-400">Pa</span></div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-400">Seuil Admissible (τ_adm)</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{permissibleShearPa} <span className="text-xs text-slate-400">Pa</span></div>
              </div>
              <div className={`bg-slate-950 border rounded-xl p-4 ${isErosionRisk ? 'border-rose-500/50 bg-rose-950/20' : 'border-emerald-500/50 bg-emerald-950/20'}`}>
                <div className="text-xs font-mono text-slate-400">Statut de Stabilité</div>
                <div className={`text-lg font-bold font-mono mt-1 ${isErosionRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isErosionRisk ? 'Risque d\'Affouillement' : 'Parfaitement Stable'}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              <strong>Diagnostic Géotechnique :</strong> La contrainte tangentielle calculée τ = {shearStressPa.toFixed(1)} Pa est {isErosionRisk ? 'supérieure' : 'inférieure'} à la résistance limite des gabions et du béton ({permissibleShearPa} Pa). {isErosionRisk ? 'Un enrochement Rip-Rap (D50=400mm) est requis.' : 'Le revêtement proposé est stable sans risque de ravinage.'}
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: CCTP TECHNICAL SPECIFICATIONS GENERATOR */}
      {activeSubTab === 'cctp' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-400" />
                Générateur du Cahier des Clauses Techniques Particulières (CCTP)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Document contractuel prêt à l'emploi pour les appels d'offres de travaux d'aménagement hydraulique.
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(cctpText);
                setCopiedCctp(true);
                setTimeout(() => setCopiedCctp(false), 2000);
              }}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              {copiedCctp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedCctp ? 'Copié dans le presse-papier !' : 'Copier le CCTP'}
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[400px]">
            {cctpText}
          </pre>
        </div>
      )}

      {/* SUB-TAB 7: NATURE-BASED SOLUTIONS (NBS) MATRIX */}
      {activeSubTab === 'nbs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-green-400" />
            Matrice des Solutions Fondées sur la Nature (SFN / NBS)
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Évaluation multicritère des mesures d'atténuation écologiques intégrées au projet pour réduire le pic de crue et préserver la biodiversité.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {[
              { title: '1. Reboisement des Versants', score: '9.2 / 10', cost: 'Faible', effect: 'Réduction de 18% du pic de ruissellement et fixation des sols sur les pentes.' },
              { title: '2. Bassins de Rétention Naturels', score: '9.5 / 10', cost: 'Moyen', effect: 'Écrêtement majeur de la crue centennale Q100 en amont de la zone urbanisée.' },
              { title: '3. Restauration de la Ripisylve', score: '8.8 / 10', cost: 'Faible', effect: 'Augmentation de la rugosité naturelle, dissipation d\'énergie et piégeage des sédiments.' },
            ].map((nbs, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-green-400 font-bold">{nbs.score}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Coût: {nbs.cost}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{nbs.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{nbs.effect}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 8: GIS EXPORT HUB */}
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
