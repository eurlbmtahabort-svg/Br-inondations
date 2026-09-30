export interface ProjectLocationConfig {
  projectName: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
    crs: string;
  };
  surfaceKm2: number;
  perimetreKm: number;
  drainLengthKm: number;
  slopePercent: number;
  altMinM: number;
  altMaxM: number;
  urbanizationPct: number;
  climateZone: string;
  soilGroup: 'A' | 'B' | 'C' | 'D';
}

export interface WatershedMetrics {
  id: string;
  projectName: string;
  surfaceKm2: number;
  perimetreKm: number;
  graveliusIndex: number;
  mainDrainLengthKm: number;
  averageSlopeMPerKm: number;
  averageSlopePercent: number;
  altMinM: number;
  altMaxM: number;
  altMeanM: number;
  deltaHM: number;
  equivalentRectangleLengthKm: number;
  equivalentRectangleWidthKm: number;
  landUse: {
    foretVegetationNaturellePct: number;
    terresAgricolesPct: number;
    zoneUrbaineDensePct: number;
    zonePeriurbaineArtisanalePct: number;
    plansEauRipisylvePct: number;
  };
  concentrationTimes: {
    formula: string;
    description: string;
    timeMinutes: number;
    timeHours: number;
    retained: boolean;
  }[];
  retainedTcMinutes: number;
  retainedTcHours: number;
}

export interface GumbelStatistic {
  returnPeriodYears: number;
  gumbelVariableY: number;
  dailyPrecipitationMm: number;
  precipitationConfidenceMinMm: number;
  precipitationConfidenceMaxMm: number;
  montanaCoeffA: number;
  montanaCoeffB: number;
  intensityAtTcMmh: number;
  rainfallVolumeM3: number;
}

export interface PeakDischarge {
  returnPeriodYears: number;
  rationalDischargeM3s: number;
  scsCnDischargeM3s: number;
  giandottiDischargeM3s: number;
  hydrogramPeakM3s: number;
  retainedDischargeM3s: number;
  runoffVolumeMm: number;
  runoffCoefficient: number;
}

export interface CrossSectionHECRAS {
  sectionId: string;
  stationPK: string;
  distanceM: number;
  invertElevationM: number;
  leftBankElevationM: number;
  rightBankElevationM: number;
  manningChannel: number;
  manningLeftBank: number;
  manningRightBank: number;
  bedWidthM: number;
  bankSlopeLeft: number;
  bankSlopeRight: number;
  q10WaterLevelM: number;
  q50WaterLevelM: number;
  q100WaterLevelM: number;
  q100DepthM: number;
  q100VelocityMs: number;
  q100Froude: number;
  q100TopWidthM: number;
  hazardLevel: 'Faible' | 'Moyen' | 'Fort' | 'Très Fort';
  hazardScore: number;
  vulnerabilityZone: string;
  observations: string;
}

export interface HydraulicStructure {
  id: string;
  type: 'Dalot Béton Armé' | 'Buse Circulaire' | 'Canal Trapézoïdal' | 'Bassin de Rétention' | 'Digue de Protection';
  location: string;
  designFlowM3s: number;
  dimensions: string;
  manningStricklerK: number;
  slopePercent: number;
  calculatedCapacityM3s: number;
  waterVelocityMs: number;
  freeboardM: number;
  safetyMarginPct: number;
  status: 'Conforme' | 'Sous-dimensionné' | 'Optimisé';
  natureBasedSolution: boolean;
}

export interface InfrastructureVulnerability {
  assetId: string;
  nom: string;
  categorie: 'Réseau Routier' | 'Pont & Ouvrage d Art' | 'Zone Résidentielle' | 'Zone Artisanale' | 'Équipement Stratégique' | 'Parcelle Agricole';
  pkSection: string;
  coteSeuilM: number;
  hauteurSubmersionQ100M: number;
  niveauAlea: 'Faible' | 'Moyen' | 'Fort' | 'Très Fort';
  impactFonctionnel: string;
  mesuresProtection: string;
  coutEstimeKEur: number;
}

export interface EarlyWarningThreshold {
  niveau: 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE';
  label: string;
  seuilPrecipitation1hMm: number;
  seuilPrecipitation24hMm: number;
  debitSeuilM3s: number;
  hauteurRepereM: number;
  actionsDeclenchees: string[];
}
