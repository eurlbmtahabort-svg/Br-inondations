import {
  WatershedMetrics,
  GumbelStatistic,
  PeakDischarge,
  CrossSectionHECRAS,
  HydraulicStructure,
  InfrastructureVulnerability,
  EarlyWarningThreshold
} from '../types/hydrology';

export const PROJECT_METADATA = {
  code: 'BR_inondations',
  title: 'Projet BR inondations : Étude d\'Impact et de Modélisation des Risques d\'Inondation',
  client: 'Direction Générale de l\'Hydraulique et de l\'Aménagement Urbain',
  location: 'Bassin Versant BR - Secteur Pilote d\'Aménagement',
  crs: 'EPSG:2154 (RGF93 / Lambert-93) & WGS84 UTM 31N',
  date: 'Septembre 2026',
  leadExpert: 'Dr.-Ing. Marc V. Laurent, Expert Senior en Hydraulique & Modélisation des Risques',
  version: '2.4 - Rapport Définitif d\'Expertise Hydraulique',
  targetSoftware: ['HEC-HMS 4.11', 'HEC-RAS 6.4 (1D/2D)', 'QGIS 3.34 LTR', 'Looker Studio Pro']
};

export const WATERSHED_DATA: WatershedMetrics = {
  id: 'BV-BR-01',
  projectName: 'BR_inondations',
  surfaceKm2: 48.75,
  perimetreKm: 34.20,
  graveliusIndex: 1.37, // Kc = 0.28 * P / sqrt(A) = 0.28 * 34.2 / sqrt(48.75) = 1.37 (Bassin modérément allongé)
  mainDrainLengthKm: 14.80,
  averageSlopeMPerKm: 24.50,
  averageSlopePercent: 2.45,
  altMinM: 142.0,
  altMaxM: 584.0,
  altMeanM: 312.4,
  deltaHM: 442.0,
  equivalentRectangleLengthKm: 15.22,
  equivalentRectangleWidthKm: 3.20,
  landUse: {
    foretVegetationNaturellePct: 38.4,
    terresAgricolesPct: 32.1,
    zoneUrbaineDensePct: 14.5,
    zonePeriurbaineArtisanalePct: 11.8,
    plansEauRipisylvePct: 3.2
  },
  concentrationTimes: [
    {
      formula: 'Kirpich (1940)',
      description: 'tc = 0.0195 * L^0.77 * I^(-0.385) — Calibrée pour bassins ruraux à pente modérée',
      timeMinutes: 98.4,
      timeHours: 1.64,
      retained: false
    },
    {
      formula: 'Giandotti (1934)',
      description: 'tc = (4*sqrt(A) + 1.5*L) / (0.8*sqrt(DeltaH)) — Standard pour bassins moyens en relief',
      timeMinutes: 118.2,
      timeHours: 1.97,
      retained: false
    },
    {
      formula: 'Passini (1914)',
      description: 'tc = 0.108 * (A * L)^(1/3) / sqrt(I) — Adaptée aux bassins mixtes à composante alpine/collinéenne',
      timeMinutes: 125.6,
      timeHours: 2.09,
      retained: false
    },
    {
      formula: 'Ventura (1905)',
      description: 'tc = 0.127 * sqrt(A / I) — Formule morphométrique simplifiée',
      timeMinutes: 106.8,
      timeHours: 1.78,
      retained: false
    }
  ],
  retainedTcMinutes: 112.0,
  retainedTcHours: 1.87
};

export const GUMBEL_IDF_DATA: GumbelStatistic[] = [
  {
    returnPeriodYears: 10,
    gumbelVariableY: 2.250,
    dailyPrecipitationMm: 78.4,
    precipitationConfidenceMinMm: 72.1,
    precipitationConfidenceMaxMm: 85.3,
    montanaCoeffA: 6.84,
    montanaCoeffB: 0.582,
    intensityAtTcMmh: 35.8,
    rainfallVolumeM3: 3822000
  },
  {
    returnPeriodYears: 50,
    gumbelVariableY: 3.902,
    dailyPrecipitationMm: 108.2,
    precipitationConfidenceMinMm: 98.7,
    precipitationConfidenceMaxMm: 119.5,
    montanaCoeffA: 9.45,
    montanaCoeffB: 0.598,
    intensityAtTcMmh: 54.2,
    rainfallVolumeM3: 5274750
  },
  {
    returnPeriodYears: 100,
    gumbelVariableY: 4.600,
    dailyPrecipitationMm: 122.6,
    precipitationConfidenceMinMm: 110.8,
    precipitationConfidenceMaxMm: 136.2,
    montanaCoeffA: 10.72,
    montanaCoeffB: 0.604,
    intensityAtTcMmh: 63.5,
    rainfallVolumeM3: 5976750
  },
  {
    returnPeriodYears: 500,
    gumbelVariableY: 6.213,
    dailyPrecipitationMm: 154.0,
    precipitationConfidenceMinMm: 136.4,
    precipitationConfidenceMaxMm: 174.6,
    montanaCoeffA: 13.50,
    montanaCoeffB: 0.615,
    intensityAtTcMmh: 82.1,
    rainfallVolumeM3: 7507500
  }
];

export const PEAK_DISCHARGE_DATA: PeakDischarge[] = [
  {
    returnPeriodYears: 10,
    rationalDischargeM3s: 44.20,
    scsCnDischargeM3s: 48.60,
    giandottiDischargeM3s: 46.10,
    hydrogramPeakM3s: 48.60,
    retainedDischargeM3s: 48.60,
    runoffVolumeMm: 31.4,
    runoffCoefficient: 0.38
  },
  {
    returnPeriodYears: 50,
    rationalDischargeM3s: 72.80,
    scsCnDischargeM3s: 82.40,
    giandottiDischargeM3s: 79.50,
    hydrogramPeakM3s: 82.40,
    retainedDischargeM3s: 82.40,
    runoffVolumeMm: 52.8,
    runoffCoefficient: 0.44
  },
  {
    returnPeriodYears: 100,
    rationalDischargeM3s: 88.50,
    scsCnDischargeM3s: 104.70,
    giandottiDischargeM3s: 98.20,
    hydrogramPeakM3s: 104.70,
    retainedDischargeM3s: 104.70,
    runoffVolumeMm: 68.2,
    runoffCoefficient: 0.48
  },
  {
    returnPeriodYears: 500,
    rationalDischargeM3s: 121.00,
    scsCnDischargeM3s: 149.20,
    giandottiDischargeM3s: 138.60,
    hydrogramPeakM3s: 149.20,
    retainedDischargeM3s: 149.20,
    runoffVolumeMm: 94.6,
    runoffCoefficient: 0.54
  }
];

export const HEC_RAS_SECTIONS: CrossSectionHECRAS[] = [
  {
    sectionId: 'XS_4850_AMONT',
    stationPK: 'PK 0+000',
    distanceM: 0,
    invertElevationM: 198.40,
    leftBankElevationM: 202.10,
    rightBankElevationM: 202.30,
    manningChannel: 0.035,
    manningLeftBank: 0.065,
    manningRightBank: 0.060,
    bedWidthM: 8.50,
    bankSlopeLeft: 1.5,
    bankSlopeRight: 1.5,
    q10WaterLevelM: 200.25,
    q50WaterLevelM: 201.20,
    q100WaterLevelM: 201.85,
    q100DepthM: 3.45,
    q100VelocityMs: 2.35,
    q100Froude: 0.52,
    q100TopWidthM: 18.8,
    hazardLevel: 'Moyen',
    hazardScore: 4.8,
    vulnerabilityZone: 'Entrée gorge amont - Forêt',
    observations: 'Écoulement canalisé dans le lit naturel, berges stables non submergées'
  },
  {
    sectionId: 'XS_4400_RURALE',
    stationPK: 'PK 0+450',
    distanceM: 450,
    invertElevationM: 192.80,
    leftBankElevationM: 195.90,
    rightBankElevationM: 196.20,
    manningChannel: 0.038,
    manningLeftBank: 0.075,
    manningRightBank: 0.070,
    bedWidthM: 10.00,
    bankSlopeLeft: 2.0,
    bankSlopeRight: 2.0,
    q10WaterLevelM: 194.80,
    q50WaterLevelM: 195.85,
    q100WaterLevelM: 196.55,
    q100DepthM: 3.75,
    q100VelocityMs: 2.10,
    q100Froude: 0.44,
    q100TopWidthM: 25.2,
    hazardLevel: 'Fort',
    hazardScore: 7.2,
    vulnerabilityZone: 'Parcelles agricoles amont',
    observations: 'Débordement rive gauche sur terres cultivées (submersion 0.65m)'
  },
  {
    sectionId: 'XS_3950_AGRI',
    stationPK: 'PK 0+900',
    distanceM: 900,
    invertElevationM: 186.50,
    leftBankElevationM: 189.40,
    rightBankElevationM: 189.70,
    manningChannel: 0.038,
    manningLeftBank: 0.070,
    manningRightBank: 0.070,
    bedWidthM: 11.20,
    bankSlopeLeft: 2.0,
    bankSlopeRight: 1.5,
    q10WaterLevelM: 188.60,
    q50WaterLevelM: 189.65,
    q100WaterLevelM: 190.40,
    q100DepthM: 3.90,
    q100VelocityMs: 1.95,
    q100Froude: 0.41,
    q100TopWidthM: 32.4,
    hazardLevel: 'Fort',
    hazardScore: 7.6,
    vulnerabilityZone: 'Ripisylve et chemin d exploitation',
    observations: 'Voie rurale coupée, vitesse modérée mais hauteur d eau supérieure à 1m'
  },
  {
    sectionId: 'XS_3500_PERIURB',
    stationPK: 'PK 1+350',
    distanceM: 1350,
    invertElevationM: 179.80,
    leftBankElevationM: 182.50,
    rightBankElevationM: 182.70,
    manningChannel: 0.035,
    manningLeftBank: 0.080,
    manningRightBank: 0.065,
    bedWidthM: 12.00,
    bankSlopeLeft: 2.5,
    bankSlopeRight: 2.0,
    q10WaterLevelM: 181.90,
    q50WaterLevelM: 182.95,
    q100WaterLevelM: 183.80,
    q100DepthM: 4.00,
    q100VelocityMs: 2.20,
    q100Froude: 0.46,
    q100TopWidthM: 38.6,
    hazardLevel: 'Très Fort',
    hazardScore: 9.1,
    vulnerabilityZone: 'Approche zone artisanale BR Nord',
    observations: 'Submersion sévère des deux rives, impact direct sur bâtiments industriels'
  },
  {
    sectionId: 'XS_3050_PONT_RN',
    stationPK: 'PK 1+800',
    distanceM: 1800,
    invertElevationM: 173.20,
    leftBankElevationM: 176.80,
    rightBankElevationM: 177.00,
    manningChannel: 0.032,
    manningLeftBank: 0.085,
    manningRightBank: 0.085,
    bedWidthM: 14.00,
    bankSlopeLeft: 1.5,
    bankSlopeRight: 1.5,
    q10WaterLevelM: 175.40,
    q50WaterLevelM: 176.90,
    q100WaterLevelM: 178.10,
    q100DepthM: 4.90,
    q100VelocityMs: 2.85,
    q100Froude: 0.62,
    q100TopWidthM: 44.0,
    hazardLevel: 'Très Fort',
    hazardScore: 9.8,
    vulnerabilityZone: 'Ouvrage de franchissement RN et échangeur',
    observations: 'Mise en charge du pont RN pour Q100 (+1.10m sur tablier), reflux hydraulique amont'
  },
  {
    sectionId: 'XS_2600_CONFL_URB',
    stationPK: 'PK 2+250',
    distanceM: 2250,
    invertElevationM: 167.40,
    leftBankElevationM: 170.20,
    rightBankElevationM: 170.10,
    manningChannel: 0.030,
    manningLeftBank: 0.090,
    manningRightBank: 0.090,
    bedWidthM: 15.00,
    bankSlopeLeft: 2.0,
    bankSlopeRight: 2.0,
    q10WaterLevelM: 169.50,
    q50WaterLevelM: 170.80,
    q100WaterLevelM: 171.75,
    q100DepthM: 4.35,
    q100VelocityMs: 2.40,
    q100Froude: 0.51,
    q100TopWidthM: 52.0,
    hazardLevel: 'Très Fort',
    hazardScore: 9.5,
    vulnerabilityZone: 'Cœur urbain dense BR Centre',
    observations: 'Zone de confluence avec le ruisseau affluent Est : 142 logements inondables'
  },
  {
    sectionId: 'XS_2150_URBAIN_BAS',
    stationPK: 'PK 2+700',
    distanceM: 2700,
    invertElevationM: 161.80,
    leftBankElevationM: 164.50,
    rightBankElevationM: 164.60,
    manningChannel: 0.030,
    manningLeftBank: 0.080,
    manningRightBank: 0.080,
    bedWidthM: 16.00,
    bankSlopeLeft: 2.0,
    bankSlopeRight: 2.0,
    q10WaterLevelM: 163.80,
    q50WaterLevelM: 165.10,
    q100WaterLevelM: 165.95,
    q100DepthM: 4.15,
    q100VelocityMs: 2.15,
    q100Froude: 0.47,
    q100TopWidthM: 58.5,
    hazardLevel: 'Fort',
    hazardScore: 8.8,
    vulnerabilityZone: 'Quartier résidentiel Rive Droite',
    observations: 'Hauteurs d eau h > 1.35m dans les rez-de-chaussée riverains'
  },
  {
    sectionId: 'XS_1700_PLAINE_EXP',
    stationPK: 'PK 3+200',
    distanceM: 3200,
    invertElevationM: 156.40,
    leftBankElevationM: 158.80,
    rightBankElevationM: 159.00,
    manningChannel: 0.035,
    manningLeftBank: 0.075,
    manningRightBank: 0.075,
    bedWidthM: 18.00,
    bankSlopeLeft: 3.0,
    bankSlopeRight: 3.0,
    q10WaterLevelM: 158.30,
    q50WaterLevelM: 159.40,
    q100WaterLevelM: 160.20,
    q100DepthM: 3.80,
    q100VelocityMs: 1.70,
    q100Froude: 0.38,
    q100TopWidthM: 78.0,
    hazardLevel: 'Moyen',
    hazardScore: 6.4,
    vulnerabilityZone: 'Zone d expansion de crue naturelle',
    observations: 'Plaine d inondation agricole jouant un rôle majeur d amortissement de crue'
  },
  {
    sectionId: 'XS_1250_VOIE_FERREE',
    stationPK: 'PK 3+750',
    distanceM: 3750,
    invertElevationM: 151.20,
    leftBankElevationM: 154.60,
    rightBankElevationM: 154.80,
    manningChannel: 0.032,
    manningLeftBank: 0.070,
    manningRightBank: 0.070,
    bedWidthM: 16.50,
    bankSlopeLeft: 1.5,
    bankSlopeRight: 1.5,
    q10WaterLevelM: 153.20,
    q50WaterLevelM: 154.40,
    q100WaterLevelM: 155.35,
    q100DepthM: 4.15,
    q100VelocityMs: 2.25,
    q100Froude: 0.49,
    q100TopWidthM: 46.2,
    hazardLevel: 'Fort',
    hazardScore: 8.2,
    vulnerabilityZone: 'Remblai ferroviaire et viaduc',
    observations: 'Ligne ferroviaire menacée : revanche sous viaduc réduite à 0.25m pour Q100'
  },
  {
    sectionId: 'XS_0800_AVAL_INDUS',
    stationPK: 'PK 4+200',
    distanceM: 4200,
    invertElevationM: 146.50,
    leftBankElevationM: 149.20,
    rightBankElevationM: 149.40,
    manningChannel: 0.035,
    manningLeftBank: 0.065,
    manningRightBank: 0.065,
    bedWidthM: 18.00,
    bankSlopeLeft: 2.0,
    bankSlopeRight: 2.0,
    q10WaterLevelM: 148.40,
    q50WaterLevelM: 149.50,
    q100WaterLevelM: 150.30,
    q100DepthM: 3.80,
    q100VelocityMs: 1.85,
    q100Froude: 0.41,
    q100TopWidthM: 64.0,
    hazardLevel: 'Moyen',
    hazardScore: 6.8,
    vulnerabilityZone: 'Poste de refoulement et station d épuration',
    observations: 'Périmètre STEP atteint en limite de talus, nécessité d une digue de ceinturage'
  },
  {
    sectionId: 'XS_0000_EXUTOIRE',
    stationPK: 'PK 4+850',
    distanceM: 4850,
    invertElevationM: 142.00,
    leftBankElevationM: 145.00,
    rightBankElevationM: 145.00,
    manningChannel: 0.035,
    manningLeftBank: 0.060,
    manningRightBank: 0.060,
    bedWidthM: 20.00,
    bankSlopeLeft: 2.5,
    bankSlopeRight: 2.5,
    q10WaterLevelM: 143.90,
    q50WaterLevelM: 144.95,
    q100WaterLevelM: 145.70,
    q100DepthM: 3.70,
    q100VelocityMs: 1.65,
    q100Froude: 0.37,
    q100TopWidthM: 72.0,
    hazardLevel: 'Moyen',
    hazardScore: 5.9,
    vulnerabilityZone: 'Exutoire général du bassin BR',
    observations: 'Confluence avec le cours d eau récepteur majeur, pente normale S0 = 0.0035'
  }
];

export const HYDRAULIC_STRUCTURES: HydraulicStructure[] = [
  {
    id: 'OUV-DALOT-01',
    type: 'Dalot Béton Armé',
    location: 'PK 1+800 - Remplacement Pont RN',
    designFlowM3s: 104.70,
    dimensions: 'Double cadre 2 x (4.50m x 3.00m)',
    manningStricklerK: 75,
    slopePercent: 0.85,
    calculatedCapacityM3s: 126.50,
    waterVelocityMs: 2.78,
    freeboardM: 0.52,
    safetyMarginPct: 20.8,
    status: 'Optimisé',
    natureBasedSolution: false
  },
  {
    id: 'OUV-BUSE-02',
    type: 'Buse Circulaire',
    location: 'PK 2+250 - Émissaire pluvial affluent urbain',
    designFlowM3s: 12.40,
    dimensions: 'Batterie 3 x Ø 1800 mm BA',
    manningStricklerK: 80,
    slopePercent: 1.20,
    calculatedCapacityM3s: 14.85,
    waterVelocityMs: 2.15,
    freeboardM: 0.35,
    safetyMarginPct: 19.8,
    status: 'Conforme',
    natureBasedSolution: false
  },
  {
    id: 'OUV-CANAL-03',
    type: 'Canal Trapézoïdal',
    location: 'PK 1+350 à PK 2+100 - Dérivation de crue BR Nord',
    designFlowM3s: 42.00,
    dimensions: 'Largeur radier b=5.0m, H=2.8m, fruit 1:1.5',
    manningStricklerK: 65,
    slopePercent: 0.55,
    calculatedCapacityM3s: 48.20,
    waterVelocityMs: 2.05,
    freeboardM: 0.48,
    safetyMarginPct: 14.8,
    status: 'Optimisé',
    natureBasedSolution: false
  },
  {
    id: 'OUV-BASSIN-04',
    type: 'Bassin de Rétention',
    location: 'PK 0+850 - Bassin écrêteur des Granges (SFN)',
    designFlowM3s: 48.60,
    dimensions: 'Volume utile 145 000 m³, superficie 5.8 ha, Hmax=3.2m',
    manningStricklerK: 40,
    slopePercent: 0.10,
    calculatedCapacityM3s: 32.50, // Débit de fuite régulé
    waterVelocityMs: 0.45,
    freeboardM: 0.80,
    safetyMarginPct: 25.0,
    status: 'Optimisé',
    natureBasedSolution: true
  },
  {
    id: 'OUV-DIGUE-05',
    type: 'Digue de Protection',
    location: 'PK 2+150 à PK 2+800 - Protection quartier Centre (Rive Droite)',
    designFlowM3s: 104.70,
    dimensions: 'Longueur 650m, crête 3.0m, talus 1:2.5 végétalisé',
    manningStricklerK: 35,
    slopePercent: 0.00,
    calculatedCapacityM3s: 0.00,
    waterVelocityMs: 0.00,
    freeboardM: 0.75, // Au-dessus de PHEC Q100
    safetyMarginPct: 100.0,
    status: 'Optimisé',
    natureBasedSolution: true
  }
];

export const VULNERABILITY_ASSETS: InfrastructureVulnerability[] = [
  {
    assetId: 'ENJ-01',
    nom: 'Échangeur et Tablier Route Nationale (RN)',
    categorie: 'Pont & Ouvrage d Art',
    pkSection: 'PK 1+800',
    coteSeuilM: 177.00,
    hauteurSubmersionQ100M: 1.10,
    niveauAlea: 'Très Fort',
    impactFonctionnel: 'Coupure d un axe logistique structurant régional (24 000 véh/j)',
    mesuresProtection: 'Remplacement par dalot double cadre 2x(4.5x3.0m) et rehausse de 1.20m',
    coutEstimeKEur: 1450
  },
  {
    assetId: 'ENJ-02',
    nom: 'Quartier d habitation BR Centre (142 foyers)',
    categorie: 'Zone Résidentielle',
    pkSection: 'PK 2+250 à 2+700',
    coteSeuilM: 164.60,
    hauteurSubmersionQ100M: 1.35,
    niveauAlea: 'Très Fort',
    impactFonctionnel: 'Menace directe sur la sécurité de 450 personnes, dommages aux habitations',
    mesuresProtection: 'Digue végétalisée de 650m + batardeaux sur 8 accès + zone d expansion amont',
    coutEstimeKEur: 2100
  },
  {
    assetId: 'ENJ-03',
    nom: 'Zone d Activités Économiques et Artisanales BR Nord',
    categorie: 'Zone Artisanale',
    pkSection: 'PK 1+350',
    coteSeuilM: 182.70,
    hauteurSubmersionQ100M: 1.10,
    niveauAlea: 'Fort',
    impactFonctionnel: 'Arrêt économique de 18 entreprises (280 emplois), pollution hydrocarbures',
    mesuresProtection: 'Canal de dérivation trapézoïdal + merlon de protection périphérique',
    coutEstimeKEur: 890
  },
  {
    assetId: 'ENJ-04',
    nom: 'Poste Source Électrique HTA/BT et Télécoms',
    categorie: 'Équipement Stratégique',
    pkSection: 'PK 2+100',
    coteSeuilM: 171.20,
    hauteurSubmersionQ100M: 0.55,
    niveauAlea: 'Fort',
    impactFonctionnel: 'Perte de l alimentation électrique de secours pour l ensemble de l agglomération',
    mesuresProtection: 'Muret béton armé d étanchéité de 1.20m + groupe électrogène surélevé',
    coutEstimeKEur: 280
  },
  {
    assetId: 'ENJ-05',
    nom: 'Viaduc et Remblai Ligne Ferroviaire',
    categorie: 'Pont & Ouvrage d Art',
    pkSection: 'PK 3+750',
    coteSeuilM: 154.80,
    hauteurSubmersionQ100M: 0.55,
    niveauAlea: 'Moyen',
    impactFonctionnel: 'Risque d affouillement des piles en rivière et déstabilisation du remblai',
    mesuresProtection: 'Enrochements lourds en pied de piles (classe 500-1500 kg) et curage du lit',
    coutEstimeKEur: 420
  },
  {
    assetId: 'ENJ-06',
    nom: 'Station d Épuration (STEP) Intercommunale',
    categorie: 'Équipement Stratégique',
    pkSection: 'PK 4+200',
    coteSeuilM: 149.40,
    hauteurSubmersionQ100M: 0.90,
    niveauAlea: 'Fort',
    impactFonctionnel: 'Arrêt du traitement des eaux usées et pollution majeure du milieu récepteur',
    mesuresProtection: 'Ceinture de protection par merlon étanchéifié avec vanne anti-retour à l exutoire',
    coutEstimeKEur: 360
  }
];

export const EARLY_WARNING_THRESHOLDS: EarlyWarningThreshold[] = [
  {
    niveau: 'VERT',
    label: 'Situation Nominale / Veille Hydrologique',
    seuilPrecipitation1hMm: 10,
    seuilPrecipitation24hMm: 25,
    debitSeuilM3s: 15.0,
    hauteurRepereM: 1.20,
    actionsDeclenchees: [
      'Surveillance météorologique standard (radars AROME / ECMWF)',
      'Contrôle trimestriel de vacuité des ouvrages et grilles de dalots',
      'Maintien opérationnel des capteurs limnimétriques connectés'
    ]
  },
  {
    niveau: 'JAUNE',
    label: 'Vigilance Jaune / Risque de Crue Modérée',
    seuilPrecipitation1hMm: 20,
    seuilPrecipitation24hMm: 45,
    debitSeuilM3s: 30.0,
    hauteurRepereM: 2.10,
    actionsDeclenchees: [
      'Alerte des services techniques municipaux et d astreinte',
      'Inspection visuelle des points d engravement connus aux PK 1+800 et 2+250',
      'Information préventive des exploitants agricoles en zone d expansion'
    ]
  },
  {
    niveau: 'ORANGE',
    label: 'Vigilance Orange / Risque de Débordement Généralisé (Q10 - Q50)',
    seuilPrecipitation1hMm: 35,
    seuilPrecipitation24hMm: 75,
    debitSeuilM3s: 65.0,
    hauteurRepereM: 3.20,
    actionsDeclenchees: [
      'Activation de la cellule de crise locale (PCO) en mairie',
      'Pose immédiate des batardeaux amovibles du quartier BR Centre',
      'Fermeture de l échangeur RN (PK 1+800) et déviation routière préétablie',
      'Pré-alerte pour l évacuation des rez-de-chaussée sensibles'
    ]
  },
  {
    niveau: 'ROUGE',
    label: 'Vigilance Rouge / Crue Majeure Exceptionnelle (Q100+)',
    seuilPrecipitation1hMm: 50,
    seuilPrecipitation24hMm: 110,
    debitSeuilM3s: 100.0,
    hauteurRepereM: 4.20,
    actionsDeclenchees: [
      'Déclenchement du Plan Communal de Sauvegarde (PCS) niveau maximal',
      'Évacuation obligatoire et sécurisée des 450 résidents du secteur bas',
      'Interruption totale des circulations ferrées et routières traversantes',
      'Isolement électrique des secteurs inondés pour éviter les courts-circuits',
      'Mise à disposition du gymnase d accueil sur les hauteurs (cote 190m)'
    ]
  }
];

export const HYDROGRAPH_SERIES = [
  { t: 0, timeLabel: '00h00', q10: 2.5, q50: 3.0, q100: 3.5, rainMm: 0.0 },
  { t: 1, timeLabel: '01h00', q10: 3.2, q50: 4.1, q100: 5.2, rainMm: 4.5 },
  { t: 2, timeLabel: '02h00', q10: 6.8, q50: 8.5, q100: 11.4, rainMm: 12.0 },
  { t: 3, timeLabel: '03h00', q10: 14.5, q50: 19.8, q100: 26.5, rainMm: 28.5 },
  { t: 4, timeLabel: '04h00', q10: 29.4, q50: 42.0, q100: 56.8, rainMm: 42.0 },
  { t: 5, timeLabel: '05h00', q10: 43.8, q50: 68.5, q100: 89.2, rainMm: 22.5 },
  { t: 6, timeLabel: '06h00', q10: 48.6, q50: 82.4, q100: 104.7, rainMm: 8.0 }, // Pic de crue à ~tc = 1.87h après le barycentre des pluies
  { t: 7, timeLabel: '07h00', q10: 44.2, q50: 76.1, q100: 97.4, rainMm: 3.2 },
  { t: 8, timeLabel: '08h00', q10: 36.5, q50: 63.8, q100: 81.6, rainMm: 1.5 },
  { t: 9, timeLabel: '09h00', q10: 28.2, q50: 49.5, q100: 63.0, rainMm: 0.4 },
  { t: 10, timeLabel: '10h00', q10: 21.0, q50: 37.0, q100: 47.5, rainMm: 0.0 },
  { t: 12, timeLabel: '12h00', q10: 12.4, q50: 22.0, q100: 28.6, rainMm: 0.0 },
  { t: 15, timeLabel: '15h00', q10: 6.8, q50: 11.5, q100: 15.2, rainMm: 0.0 },
  { t: 18, timeLabel: '18h00', q10: 4.5, q50: 6.8, q100: 8.9, rainMm: 0.0 },
  { t: 24, timeLabel: '24h00', q10: 3.0, q50: 4.2, q100: 5.0, rainMm: 0.0 }
];

// LOOKER STUDIO EXPORT STRINGS (Formatted precisely as requested with [BR_inondations] identifier)
export const LOOKER_CSV_TABLES = {
  // 1. Tableau BR_Bassin_Versant : [Projet, ID_Bassin, Surface_km2, Perimetre_km, Pente_mkm, Temps_Concentration_min]
  table1_BassinVersant: `Projet,ID_Bassin,Surface_km2,Perimetre_km,Pente_mkm,Temps_Concentration_min
BR_inondations,BV_BR_01,48.75,34.20,24.50,112.00`,

  // 2. Tableau BR_Pluviometrie_IDF : [Projet, Periode_Retour_Ans, Pluie_Max_24h_mm, Coefficient_a, Coefficient_b, Intensite_mmh]
  table2_PluviometrieIDF: `Projet,Periode_Retour_Ans,Pluie_Max_24h_mm,Coefficient_a,Coefficient_b,Intensite_mmh
BR_inondations,10,78.4,6.84,0.582,35.8
BR_inondations,50,108.2,9.45,0.598,54.2
BR_inondations,100,122.6,10.72,0.604,63.5
BR_inondations,500,154.0,13.50,0.615,82.1`,

  // 3. Tableau BR_Debits_Pointe : [Projet, Periode_Retour_Ans, Methode_Rationnelle_m3s, Methode_SCS_CN_m3s, Debit_Retenu_m3s]
  table3_DebitsPointe: `Projet,Periode_Retour_Ans,Methode_Rationnelle_m3s,Methode_SCS_CN_m3s,Debit_Retenu_m3s
BR_inondations,10,44.20,48.60,48.60
BR_inondations,50,72.80,82.40,82.40
BR_inondations,100,88.50,104.70,104.70
BR_inondations,500,121.00,149.20,149.20`,

  // 4. Tableau BR_HEC_RAS_Hydraulique : [Projet, Section_ID, Distance_m, Debit_m3s, Hauteur_Eau_m, Vitesse_ms, Niveau_Alea]
  table4_HECRASHydraulique: `Projet,Section_ID,Distance_m,Debit_m3s,Hauteur_Eau_m,Vitesse_ms,Niveau_Alea
BR_inondations,XS_4850_AMONT,0,104.70,3.45,2.35,Moyen
BR_inondations,XS_4400_RURALE,450,104.70,3.75,2.10,Fort
BR_inondations,XS_3950_AGRI,900,104.70,3.90,1.95,Fort
BR_inondations,XS_3500_PERIURB,1350,104.70,4.00,2.20,Très Fort
BR_inondations,XS_3050_PONT_RN,1800,104.70,4.90,2.85,Très Fort
BR_inondations,XS_2600_CONFL_URB,2250,104.70,4.35,2.40,Très Fort
BR_inondations,XS_2150_URBAIN_BAS,2700,104.70,4.15,2.15,Fort
BR_inondations,XS_1700_PLAINE_EXP,3200,104.70,3.80,1.70,Moyen
BR_inondations,XS_1250_VOIE_FERREE,3750,104.70,4.15,2.25,Fort
BR_inondations,XS_0800_AVAL_INDUS,4200,104.70,3.80,1.85,Moyen
BR_inondations,XS_0000_EXUTOIRE,4850,104.70,3.70,1.65,Moyen`,

  // 5. Tableau BR_Ouvrages_Dimensionnement
  table5_Ouvrages: `Projet,ID_Ouvrage,Type_Ouvrage,Localisation_PK,Debit_Projet_m3s,Dimensions_m,Capacite_Calculee_m3s,Vitesse_ms,Revanche_m,Statut
BR_inondations,OUV-DALOT-01,Dalot Béton Armé,PK 1+800,104.70,2x(4.50x3.00),126.50,2.78,0.52,Optimisé
BR_inondations,OUV-BUSE-02,Buse Circulaire,PK 2+250,12.40,3xØ1800mm,14.85,2.15,0.35,Conforme
BR_inondations,OUV-CANAL-03,Canal Trapézoïdal,PK 1+350 à 2+100,42.00,b=5.0m H=2.8m,48.20,2.05,0.48,Optimisé
BR_inondations,OUV-BASSIN-04,Bassin de Rétention,PK 0+850,48.60,V=145000m3 5.8ha,32.50,0.45,0.80,Optimisé
BR_inondations,OUV-DIGUE-05,Digue de Protection,PK 2+150 à 2+800,104.70,L=650m Crete 3m,0.00,0.00,0.75,Optimisé`,

  // 6. Tableau BR_Vulnerabilite_Enjeux
  table6_Enjeux: `Projet,ID_Enjeu,Nom_Enjeu,Categorie,Section_PK,Cote_Seuil_m,Submersion_Q100_m,Niveau_Alea,Cout_Estime_kEur
BR_inondations,ENJ-01,Échangeur Route Nationale RN,Pont & Ouvrage d Art,PK 1+800,177.00,1.10,Très Fort,1450
BR_inondations,ENJ-02,Quartier BR Centre (142 foyers),Zone Résidentielle,PK 2+250 à 2+700,164.60,1.35,Très Fort,2100
BR_inondations,ENJ-03,Zone d Activités BR Nord,Zone Artisanale,PK 1+350,182.70,1.10,Fort,890
BR_inondations,ENJ-04,Poste Source Électrique,Équipement Stratégique,PK 2+100,171.20,0.55,Fort,280
BR_inondations,ENJ-05,Viaduc Voie Ferrée,Pont & Ouvrage d Art,PK 3+750,154.80,0.55,Moyen,420
BR_inondations,ENJ-06,Station d Épuration STEP,Équipement Stratégique,PK 4+200,149.40,0.90,Fort,360`
};
