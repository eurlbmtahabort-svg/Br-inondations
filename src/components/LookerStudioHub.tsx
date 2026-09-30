import React, { useState } from 'react';
import { Download, Copy, Check, ExternalLink, Database, Table, HelpCircle, ArrowRight } from 'lucide-react';
import { LOOKER_CSV_TABLES } from '../data/projectData';

export const LookerStudioHub: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTableKey, setActiveTableKey] = useState<keyof typeof LOOKER_CSV_TABLES>('table4_HECRASHydraulique');

  const tablesMeta = [
    {
      key: 'table1_BassinVersant' as const,
      name: 'BR_Bassin_Versant',
      label: '1. Paramètres Morphométriques Bassin Versant',
      filename: 'BR_Bassin_Versant.csv',
      description: 'Morphométrie, indice de compacité et temps de concentration consensus retenu.',
      columns: ['Projet', 'ID_Bassin', 'Surface_km2', 'Perimetre_km', 'Pente_mkm', 'Temps_Concentration_min'],
      lookerRole: 'Dimension de filtrage et métriques globales de bassin versant'
    },
    {
      key: 'table2_PluviometrieIDF' as const,
      name: 'BR_Pluviometrie_IDF',
      label: '2. Statistiques Pluviométriques & IDF Montana',
      filename: 'BR_Pluviometrie_IDF.csv',
      description: 'Ajustement de Gumbel, coefficients de Montana (a, b) et intensités de calcul.',
      columns: ['Projet', 'Periode_Retour_Ans', 'Pluie_Max_24h_mm', 'Coefficient_a', 'Coefficient_b', 'Intensite_mmh'],
      lookerRole: 'Graphique de dispersion et courbes IDF logarithmiques par période de retour'
    },
    {
      key: 'table3_DebitsPointe' as const,
      name: 'BR_Debits_Pointe',
      label: '3. Débits de Pointe Hydro-HEC-HMS',
      filename: 'BR_Debits_Pointe.csv',
      description: 'Comparaison Méthode Rationnelle vs SCS-CN sous HEC-HMS et débit projet retenu.',
      columns: ['Projet', 'Periode_Retour_Ans', 'Methode_Rationnelle_m3s', 'Methode_SCS_CN_m3s', 'Debit_Retenu_m3s'],
      lookerRole: 'Graphique à barres groupées et KPIs comparatifs des débits de crue'
    },
    {
      key: 'table4_HECRASHydraulique' as const,
      name: 'BR_HEC_RAS_Hydraulique',
      label: '4. Modélisation Hydraulique HEC-RAS 1D/2D',
      filename: 'BR_HEC_RAS_Hydraulique.csv',
      description: 'Sections transversales, distances PK, cotes d\'eau, vitesses moyennes et aléas.',
      columns: ['Projet', 'Section_ID', 'Distance_m', 'Debit_m3s', 'Hauteur_Eau_m', 'Vitesse_ms', 'Niveau_Alea'],
      lookerRole: 'Profil en long, matrice de croisement d\'aléa h × v et cartes bathymétriques'
    },
    {
      key: 'table5_Ouvrages' as const,
      name: 'BR_Ouvrages_Dimensionnement',
      label: '5. Dimensionnement des Ouvrages & SFN',
      filename: 'BR_Ouvrages_Dimensionnement.csv',
      description: 'Dalots béton armé, buses, canaux de dérivation, bassins de rétention et digues.',
      columns: ['Projet', 'ID_Ouvrage', 'Type_Ouvrage', 'Localisation_PK', 'Debit_Projet_m3s', 'Dimensions_m', 'Capacite_Calculee_m3s', 'Vitesse_ms', 'Revanche_m', 'Statut'],
      lookerRole: 'Tableau de suivi des investissements et conformités hydrauliques'
    },
    {
      key: 'table6_Enjeux' as const,
      name: 'BR_Vulnerabilite_Enjeux',
      label: '6. Vulnérabilité des Enjeux et Infrastructures',
      filename: 'BR_Vulnerabilite_Enjeux.csv',
      description: 'Infrastructures critiques exposées (RN, voies ferrées, quartier résidentiel, STEP).',
      columns: ['Projet', 'ID_Enjeu', 'Nom_Enjeu', 'Categorie', 'Section_PK', 'Cote_Seuil_m', 'Submersion_Q100_m', 'Niveau_Alea', 'Cout_Estime_kEur'],
      lookerRole: 'Cartographie des risques, répartition des coûts de protection et hiérarchisation'
    }
  ];

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadCsv = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    tablesMeta.forEach((t) => {
      handleDownloadCsv(t.filename, LOOKER_CSV_TABLES[t.key]);
    });
  };

  const activeTableMeta = tablesMeta.find((t) => t.key === activeTableKey)!;
  const activeCsvContent = LOOKER_CSV_TABLES[activeTableKey];
  const rows = activeCsvContent.trim().split('\n').map((r) => r.split(','));
  const headerRow = rows[0];
  const dataRows = rows.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header section */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <Database className="w-4 h-4" />
              <span>MODULE D'EXPORTATION ANALYTIQUE · LOOKER STUDIO COMPATIBLE</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-display">
              Centre de Données Hydrauliques & Hydrologiques
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
              Ensemble des jeux de données normalisés pour le <strong className="text-slate-200">Projet BR inondations</strong>, 
              prêts pour l'import direct dans Google Looker Studio, Google Sheets ou votre SIG d'aménagement (QGIS / ArcGIS).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger les 6 tables CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tablesMeta.map((table) => {
          const isSelected = activeTableKey === table.key;
          return (
            <div
              key={table.key}
              onClick={() => setActiveTableKey(table.key)}
              className={`cursor-pointer rounded-xl p-4 transition-all border ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-medium text-cyan-400">
                  [{table.name}]
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {LOOKER_CSV_TABLES[table.key].trim().split('\n').length - 1} lignes
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-200 line-clamp-1 mb-1">
                {table.label}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {table.description}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <Table className="w-3 h-3 text-cyan-400" />
                  {table.columns.length} colonnes
                </span>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleCopy(table.key, LOOKER_CSV_TABLES[table.key])}
                    title="Copier le CSV"
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    {copiedKey === table.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDownloadCsv(table.filename, LOOKER_CSV_TABLES[table.key])}
                    title="Télécharger le fichier CSV"
                    className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Table Inspection & Data Table */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 lg:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                TABLE ACTIVE : {activeTableMeta.name}
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-400 font-mono">ID Projet: [BR_inondations]</span>
            </div>
            <h2 className="text-base font-semibold text-white mt-0.5">
              {activeTableMeta.label}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(activeTableMeta.key, activeCsvContent)}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5"
            >
              {copiedKey === activeTableMeta.key ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copié dans le presse-papier !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier (Google Sheets)</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleDownloadCsv(activeTableMeta.filename, activeCsvContent)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger .CSV</span>
            </button>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto max-h-[460px] divide-y divide-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase font-mono tracking-wider sticky top-0 z-10 text-[11px] border-b border-slate-800">
              <tr>
                {headerRow.map((col, idx) => (
                  <th key={idx} className="px-4 py-3 whitespace-nowrap font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                  {row.map((cell, cIdx) => {
                    const isAlea = cell === 'Faible' || cell === 'Moyen' || cell === 'Fort' || cell === 'Très Fort';
                    return (
                      <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap text-slate-200">
                        {isAlea ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            cell === 'Très Fort' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            cell === 'Fort' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            cell === 'Moyen' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {cell}
                          </span>
                        ) : (
                          <span>{cell}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Looker Studio Mapping Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-semibold font-mono">Rôle Looker Studio :</span>
            <span>{activeTableMeta.lookerRole}</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Encodage : UTF-8 · Séparateur : Virgule (RFC 4180)
          </div>
        </div>
      </div>

      {/* Guide Looker Studio Integration Step-by-Step */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Procédure de Connexion dans Google Looker Studio</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="w-6 h-6 rounded-full bg-cyan-400/10 text-cyan-400 font-mono font-bold flex items-center justify-center text-xs">
              1
            </div>
            <h4 className="font-semibold text-slate-200">Import des Fichiers CSV</h4>
            <p className="text-slate-400 leading-relaxed">
              Ouvrez <strong className="text-slate-300">lookerstudio.google.com</strong>, créez un rapport vierge et choisissez la source de données <strong className="text-slate-300">Importation de fichiers (CSV)</strong> ou connectez une feuille <strong className="text-slate-300">Google Sheets</strong> après y avoir collé les tables ci-dessus.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="w-6 h-6 rounded-full bg-cyan-400/10 text-cyan-400 font-mono font-bold flex items-center justify-center text-xs">
              2
            </div>
            <h4 className="font-semibold text-slate-200">Typage des Dimensions & Métriques</h4>
            <p className="text-slate-400 leading-relaxed">
              Assurez-vous que les champs numériques (<code className="text-cyan-300">Debit_m3s</code>, <code className="text-cyan-300">Hauteur_Eau_m</code>, <code className="text-cyan-300">Vitesse_ms</code>) sont typés en <em className="text-slate-300">Nombre</em>, et les champs <code className="text-cyan-300">Section_ID</code> et <code className="text-cyan-300">Niveau_Alea</code> en <em className="text-slate-300">Texte</em>.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="w-6 h-6 rounded-full bg-cyan-400/10 text-cyan-400 font-mono font-bold flex items-center justify-center text-xs">
              3
            </div>
            <h4 className="font-semibold text-slate-200">Graphiques Clés Recommandés</h4>
            <p className="text-slate-400 leading-relaxed">
              1. <strong>Profil en long</strong> : Graphique combiné (Axe X = Distance_m, Barres = Hauteur_Eau_m, Ligne = Vitesse_ms).<br/>
              2. <strong>Matrice de Risque</strong> : Graphique à bulles X/Y (Hauteur vs Vitesse, couleur selon Niveau_Alea).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
