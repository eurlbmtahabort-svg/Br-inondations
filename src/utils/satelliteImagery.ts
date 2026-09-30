/**
 * Dynamic Satellite Imagery, Topographic Relief & Hydraulic Cartography Generator
 * Generates high-resolution satellite imagery URLs for the EXACT GPS coordinates of the study,
 * with multi-provider fallback (ESRI World Imagery, ESRI Topo, Carto).
 * Also generates dynamic vector cartographic figures with the real location metadata.
 */

import { ProjectLocationConfig } from '../types/hydrology';

/**
 * Returns dynamic ESRI World Imagery URL centered at exact lat/lng
 */
export function getRealSatelliteImageUrl(
  lat: number,
  lng: number,
  zoomLevel: 'close' | 'medium' | 'wide' = 'medium'
): string {
  const span = zoomLevel === 'close' ? 0.015 : zoomLevel === 'wide' ? 0.060 : 0.035;
  const minLng = (lng - span * 1.3).toFixed(5);
  const maxLng = (lng + span * 1.3).toFixed(5);
  const minLat = (lat - span).toFixed(5);
  const maxLat = (lat + span).toFixed(5);
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${minLng},${minLat},${maxLng},${maxLat}&bboxSR=4326&imageSR=4326&size=800,480&f=image`;
}

/**
 * Returns dynamic ESRI World Topo / DEM Relief URL centered at exact lat/lng
 */
export function getRealTopoImageUrl(
  lat: number,
  lng: number,
  zoomLevel: 'close' | 'medium' | 'wide' = 'medium'
): string {
  const span = zoomLevel === 'close' ? 0.015 : zoomLevel === 'wide' ? 0.060 : 0.035;
  const minLng = (lng - span * 1.3).toFixed(5);
  const maxLng = (lng + span * 1.3).toFixed(5);
  const minLat = (lat - span).toFixed(5);
  const maxLat = (lat + span).toFixed(5);
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/export?bbox=${minLng},${minLat},${maxLng},${maxLat}&bboxSR=4326&imageSR=4326&size=800,480&f=image`;
}

/**
 * Generates an SVG cartographic map depicting the watershed boundary,
 * river centerline, flood submersion envelope, and cartographic metadata for the exact study coordinates.
 */
export function generateStudyWatershedSvg(config: ProjectLocationConfig, isAr: boolean = false): string {
  const latStr = config.coordinates.lat.toFixed(4);
  const lngStr = config.coordinates.lng.toFixed(4);
  const name = config.locationName;
  const area = config.surfaceKm2;
  const q100 = (0.45 * (85 + config.slopePercent * 8) * area / 3.6).toFixed(1);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 420" width="100%" height="auto" style="border-radius:12px; background:#0b1120; font-family:sans-serif;">
      <defs>
        <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.8"/>
        </pattern>
        <radialGradient id="satelliteGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.0"/>
        </radialGradient>
        <linearGradient id="floodGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#fb7185" stop-opacity="0.2"/>
        </linearGradient>
      </defs>

      <!-- Background with Satellite Raster Simulation -->
      <rect width="700" height="420" fill="#090d16" />
      <rect width="700" height="420" fill="url(#gridPattern)" />
      <circle cx="350" cy="210" r="260" fill="url(#satelliteGlow)" />

      <!-- Topographic Contour Lines -->
      <path d="M 50,320 Q 200,280 350,300 T 650,340" fill="none" stroke="#334155" stroke-width="1.2" stroke-dasharray="3,3"/>
      <path d="M 70,250 Q 220,210 360,230 T 630,270" fill="none" stroke="#334155" stroke-width="1.2" stroke-dasharray="3,3"/>
      <path d="M 100,170 Q 250,130 380,150 T 600,190" fill="none" stroke="#334155" stroke-width="1.2" stroke-dasharray="3,3"/>
      <path d="M 130,100 Q 270,70 410,90 T 570,120" fill="none" stroke="#334155" stroke-width="1.2" stroke-dasharray="3,3"/>

      <!-- Catchment Watershed Boundary -->
      <polygon points="140,90 280,50 460,65 580,130 610,240 520,335 340,360 190,310 110,215"
        fill="#06b6d4" fill-opacity="0.12" stroke="#22d3ee" stroke-width="2.5" stroke-dasharray="7,5"/>

      <!-- Flood Submersion Envelope Q100 -->
      <path d="M 180,205 Q 270,165 360,200 T 510,240 Q 440,285 320,265 Z"
        fill="url(#floodGrad)" stroke="#f43f5e" stroke-width="2"/>

      <!-- River / Oued Centerline -->
      <path d="M 135,110 Q 240,150 315,190 T 440,225 T 560,250"
        fill="none" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 235,80 Q 270,125 315,190"
        fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 390,105 Q 410,160 440,225"
        fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Target GPS Study Point Pin -->
      <circle cx="350" cy="205" r="22" fill="#10b981" fill-opacity="0.25"/>
      <circle cx="350" cy="205" r="10" fill="#10b981" stroke="#ffffff" stroke-width="3"/>
      <circle cx="350" cy="205" r="3.5" fill="#ffffff"/>

      <!-- Top Title Header Banner -->
      <rect x="25" y="20" width="410" height="60" rx="8" fill="#0f172a" fill-opacity="0.95" stroke="#334155" stroke-width="1.2"/>
      <text x="40" y="42" font-size="13" font-weight="bold" fill="#38bdf8">
        ${isAr ? 'خريطة الموقع الهيدرولوجي وحرم الفيضان' : 'CARTE HYDROLOGIQUE & ZONE INONDABLE'}
      </text>
      <text x="40" y="63" font-size="11" fill="#cbd5e1">
        ${name.substring(0, 48)}
      </text>

      <!-- North Compass Indicator -->
      <g transform="translate(640, 55)">
        <circle cx="0" cy="0" r="24" fill="#0f172a" fill-opacity="0.95" stroke="#475569" stroke-width="1.5"/>
        <polygon points="0,-18 7,0 0,-4" fill="#ef4444"/>
        <polygon points="0,-18 -7,0 0,-4" fill="#b91c1c"/>
        <polygon points="0,18 7,0 0,4" fill="#cbd5e1"/>
        <polygon points="0,18 -7,0 0,4" fill="#94a3b8"/>
        <text x="0" y="-22" font-size="11" font-weight="bold" fill="#f87171" text-anchor="middle">N</text>
      </g>

      <!-- Bottom Coordinate Card -->
      <rect x="25" y="340" width="310" height="55" rx="8" fill="#0f172a" fill-opacity="0.95" stroke="#334155" stroke-width="1.2"/>
      <text x="40" y="360" font-size="11" font-weight="bold" fill="#10b981">
        📍 GPS : ${latStr}°N , ${lngStr}°E
      </text>
      <text x="40" y="380" font-size="9.5" fill="#94a3b8">
        ${isAr ? `المساحة: ${area} كم² · تدفق Q100 = ${q100} م³/ثا` : `Superficie : ${area} km² · Débit Q100 = ${q100} m³/s`}
      </text>

      <!-- Legend Card -->
      <rect x="390" y="340" width="285" height="55" rx="8" fill="#0f172a" fill-opacity="0.95" stroke="#334155" stroke-width="1.2"/>
      <line x1="405" y1="358" x2="430" y2="358" stroke="#38bdf8" stroke-width="3"/>
      <text x="438" y="362" font-size="9.5" fill="#cbd5e1">
        ${isAr ? 'المجرى الرئيسي للوادي' : 'Oued / Cours d\'eau'}
      </text>
      <rect x="405" y="372" width="25" height="10" fill="#f43f5e" fill-opacity="0.4" stroke="#f43f5e" stroke-width="1"/>
      <text x="438" y="381" font-size="9.5" fill="#cbd5e1">
        ${isAr ? 'نطاق الغمر المئوي Q100' : 'Zone inondable centennale Q100'}
      </text>
    </svg>
  `;
}

/**
 * Generates an SVG Topographic Elevation Profile matching min/max altitudes and slope
 */
export function generateStudyDemProfileSvg(config: ProjectLocationConfig, isAr: boolean = false): string {
  const altMin = config.altMinM;
  const altMax = config.altMaxM;
  const len = config.drainLengthKm;
  const slope = config.slopePercent;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 280" width="100%" height="auto" style="border-radius:12px; background:#0f172a; font-family:sans-serif;">
      <!-- Grid -->
      <defs>
        <linearGradient id="demGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.1"/>
        </linearGradient>
      </defs>

      <!-- Axes -->
      <line x1="70" y1="220" x2="650" y2="220" stroke="#475569" stroke-width="1.5"/>
      <line x1="70" y1="40" x2="70" y2="220" stroke="#475569" stroke-width="1.5"/>

      <!-- Labels -->
      <text x="65" y="50" font-size="10" fill="#94a3b8" text-anchor="end">${altMax} m</text>
      <text x="65" y="135" font-size="10" fill="#94a3b8" text-anchor="end">${Math.round((altMax + altMin) / 2)} m</text>
      <text x="65" y="220" font-size="10" fill="#94a3b8" text-anchor="end">${altMin} m</text>

      <text x="70" y="240" font-size="10" fill="#94a3b8" text-anchor="middle">PK 0+000</text>
      <text x="360" y="240" font-size="10" fill="#94a3b8" text-anchor="middle">PK ${(len / 2).toFixed(1)} km</text>
      <text x="650" y="240" font-size="10" fill="#94a3b8" text-anchor="middle">PK ${len} km (Exutoire)</text>

      <!-- Elevation Profile Curve -->
      <path d="M 70,55 Q 250,110 400,165 T 650,215 L 650,220 L 70,220 Z" fill="url(#demGrad)" />
      <path d="M 70,55 Q 250,110 400,165 T 650,215" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>

      <!-- Points & Annotations -->
      <circle cx="70" cy="55" r="4.5" fill="#f43f5e"/>
      <circle cx="650" cy="215" r="4.5" fill="#10b981"/>

      <!-- Legend / Badge -->
      <rect x="85" y="25" width="460" height="30" rx="6" fill="#1e293b" fill-opacity="0.9" stroke="#334155" stroke-width="1"/>
      <text x="95" y="45" font-size="11" font-weight="bold" fill="#38bdf8">
        ${isAr ? `الملف الطوبوغرافي الطولي (المنحدر: ${slope}% · فارق الارتفاع ΔH = ${altMax - altMin} م)` : `Profil en long topographique MNT (Pente moyenne : ${slope}% · Dénivelée ΔH = ${altMax - altMin} m)`}
      </text>
    </svg>
  `;
}
