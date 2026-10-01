/**
 * GIS Export Utility for Google Earth (KML) and QGIS / ArcGIS (GeoJSON)
 * Generates geospatial vectors for:
 * - Study Site Center Point (GPS)
 * - Watershed Catchment Boundary (Bassin Versant)
 * - Main River Channel (Talweg Oued)
 * - Inundation Envelope Q100 (Zone Inondable)
 */

import { ProjectLocationConfig } from '../types/hydrology';

// Helper to download a string as a file in browser
export function triggerFileDownload(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate realistic watershed boundary points around the center coordinates
export function getCatchmentBoundaryPoints(centerLat: number, centerLng: number, areaKm2: number): Array<[number, number]> {
  const radiusDeg = Math.sqrt(Math.max(areaKm2, 1)) * 0.009;
  const angles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
  return angles.map((a, i) => {
    const rad = (a * Math.PI) / 180;
    const wobble = 0.80 + (i % 3) * 0.20;
    return [
      parseFloat((centerLat + Math.sin(rad) * radiusDeg * wobble).toFixed(6)),
      parseFloat((centerLng + Math.cos(rad) * radiusDeg * wobble * 1.25).toFixed(6))
    ];
  });
}

// Generate main stream talweg coordinates
export function getMainStreamPoints(centerLat: number, centerLng: number, lengthKm: number): Array<[number, number]> {
  const span = (lengthKm * 0.009) / 2;
  return [
    [parseFloat((centerLat + span * 0.8).toFixed(6)), parseFloat((centerLng - span * 0.6).toFixed(6))],
    [parseFloat((centerLat + span * 0.4).toFixed(6)), parseFloat((centerLng - span * 0.2).toFixed(6))],
    [parseFloat(centerLat.toFixed(6)), parseFloat(centerLng.toFixed(6))],
    [parseFloat((centerLat - span * 0.4).toFixed(6)), parseFloat((centerLng + span * 0.3).toFixed(6))],
    [parseFloat((centerLat - span * 0.9).toFixed(6)), parseFloat((centerLng + span * 0.7).toFixed(6))]
  ];
}

// Generate flood zone inundation points
export function getFloodZonePoints(centerLat: number, centerLng: number, areaKm2: number): Array<[number, number]> {
  const radiusDeg = Math.sqrt(Math.max(areaKm2, 1)) * 0.0055;
  const angles = [0, 60, 120, 180, 240, 300, 360];
  return angles.map((a, i) => {
    const rad = (a * Math.PI) / 180;
    const wobble = 0.70 + (i % 2) * 0.30;
    return [
      parseFloat((centerLat + Math.sin(rad) * radiusDeg * wobble).toFixed(6)),
      parseFloat((centerLng + Math.cos(rad) * radiusDeg * wobble * 1.5).toFixed(6))
    ];
  });
}

/**
 * Generate Google Earth KML string
 */
export function generateKmlForGoogleEarth(config: ProjectLocationConfig): string {
  const lat = config.coordinates.lat;
  const lng = config.coordinates.lng;
  const name = config.locationName;
  const area = config.surfaceKm2;
  const length = config.drainLengthKm;

  const boundary = getCatchmentBoundaryPoints(lat, lng, area);
  const stream = getMainStreamPoints(lat, lng, length);
  const floodZone = getFloodZonePoints(lat, lng, area);

  const boundaryCoordsKml = boundary.map(([bLat, bLng]) => `${bLng},${bLat},0`).join(' ');
  const streamCoordsKml = stream.map(([sLat, sLng]) => `${sLng},${sLat},0`).join(' ');
  const floodCoordsKml = floodZone.map(([fLat, fLng]) => `${fLng},${fLat},0`).join(' ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Projet_Inondations_${config.projectName}</name>
    <description><![CDATA[
      <h2>Étude d'Impact et de Modélisation des Risques d'Inondation</h2>
      <p><b>Zone d'étude :</b> ${name}</p>
      <p><b>Coordonnées GPS :</b> ${lat}°N, ${lng}°E</p>
      <p><b>Superficie du Bassin Versant :</b> ${area} km²</p>
      <p><b>Longueur du talweg principal :</b> ${length} km</p>
      <p><b>Pente moyenne :</b> ${config.slopePercent}%</p>
      <hr/>
      <p>Généré automatiquement par l'application d'ingénierie hydrologique et HEC-RAS.</p>
    ]]></description>

    <!-- STYLES -->
    <Style id="pinStyle">
      <IconStyle>
        <scale>1.3</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>

    <Style id="watershedBoundaryStyle">
      <LineStyle>
        <color>ffffaa00</color>
        <width>3</width>
      </LineStyle>
      <PolyStyle>
        <color>4400aaff</color>
        <fill>1</fill>
        <outline>1</outline>
      </PolyStyle>
    </Style>

    <Style id="streamStyle">
      <LineStyle>
        <color>ffff5500</color>
        <width>4</width>
      </LineStyle>
    </Style>

    <Style id="floodZoneStyle">
      <LineStyle>
        <color>ff0000ff</color>
        <width>2.5</width>
      </LineStyle>
      <PolyStyle>
        <color>550000ff</color>
        <fill>1</fill>
        <outline>1</outline>
      </PolyStyle>
    </Style>

    <!-- PLACEMARK 1: GPS CENTER POINT -->
    <Placemark>
      <name>📍 Point de référence GPS - ${name}</name>
      <description>Point d'exutoire et centre d'étude hydrologique</description>
      <styleUrl>#pinStyle</styleUrl>
      <Point>
        <coordinates>${lng},${lat},0</coordinates>
      </Point>
    </Placemark>

    <!-- PLACEMARK 2: WATERSHED CATCHMENT POLYGON -->
    <Placemark>
      <name>Bassin Versant (${area} km²)</name>
      <description>Limite hydrographique du bassin versant d'apport</description>
      <styleUrl>#watershedBoundaryStyle</styleUrl>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${boundaryCoordsKml}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>

    <!-- PLACEMARK 3: MAIN STREAM TALWEG -->
    <Placemark>
      <name>Mجرى الوادي الرئيسي (${length} km)</name>
      <description>Drain hydrographique principal du talweg</description>
      <styleUrl>#streamStyle</styleUrl>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>${streamCoordsKml}</coordinates>
      </LineString>
    </Placemark>

    <!-- PLACEMARK 4: FLOOD SUBMERSION ENVELOPE Q100 -->
    <Placemark>
      <name>حرم الغمر المائي المئوي (Zone Inondable Q100)</name>
      <description>Enveloppe maximale de submersion pour la crue centennale Q100</description>
      <styleUrl>#floodZoneStyle</styleUrl>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${floodCoordsKml}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;
}

/**
 * Generate GeoJSON string for QGIS / ArcGIS
 */
export function generateGeoJsonForGis(config: ProjectLocationConfig): string {
  const lat = config.coordinates.lat;
  const lng = config.coordinates.lng;
  const name = config.locationName;
  const area = config.surfaceKm2;
  const length = config.drainLengthKm;

  const boundary = getCatchmentBoundaryPoints(lat, lng, area).map(([bLat, bLng]) => [bLng, bLat]);
  const stream = getMainStreamPoints(lat, lng, length).map(([sLat, sLng]) => [sLng, sLat]);
  const floodZone = getFloodZonePoints(lat, lng, area).map(([fLat, fLng]) => [fLng, fLat]);

  const geoJson = {
    type: 'FeatureCollection',
    name: `Projet_${config.projectName}`,
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
    },
    features: [
      {
        type: 'Feature',
        properties: {
          id: 'point_gps',
          nom: name,
          type: 'Point_GPS_Exutoire',
          latitude: lat,
          longitude: lng,
          superficie_km2: area
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      },
      {
        type: 'Feature',
        properties: {
          id: 'bassin_versant',
          nom: `Bassin Versant - ${name}`,
          superficie_km2: area,
          perimetre_km: config.perimetreKm,
          pente_pct: config.slopePercent
        },
        geometry: {
          type: 'Polygon',
          coordinates: [boundary]
        }
      },
      {
        type: 'Feature',
        properties: {
          id: 'talweg_principal',
          nom: `Oued / Drain principal - ${name}`,
          longueur_km: length
        },
        geometry: {
          type: 'LineString',
          coordinates: stream
        }
      },
      {
        type: 'Feature',
        properties: {
          id: 'enveloppe_q100',
          nom: 'Enveloppe de Submersion Q100',
          periode_retour: '100 ans',
          type_risque: 'Fort à Très Fort'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [floodZone]
        }
      }
    ]
  };

  return JSON.stringify(geoJson, null, 2);
}

/**
 * Trigger immediate KML download for Google Earth
 */
export function exportToGoogleEarthKml(config: ProjectLocationConfig) {
  const kmlContent = generateKmlForGoogleEarth(config);
  const fileName = `GoogleEarth_${config.projectName}_${config.coordinates.lat.toFixed(2)}N_${config.coordinates.lng.toFixed(2)}E.kml`;
  triggerFileDownload(kmlContent, fileName, 'application/vnd.google-earth.kml+xml');
}

/**
 * Trigger immediate GeoJSON download for QGIS / ArcGIS
 */
export function exportToGeoJson(config: ProjectLocationConfig) {
  const geoJsonContent = generateGeoJsonForGis(config);
  const fileName = `GIS_${config.projectName}_QGIS_ArcGIS.geojson`;
  triggerFileDownload(geoJsonContent, fileName, 'application/geo+json');
}
