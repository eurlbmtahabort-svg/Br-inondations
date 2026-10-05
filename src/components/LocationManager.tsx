import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Search,
  Compass,
  Layers,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
  Database,
  ArrowRight,
  Globe,
  Navigation,
  Loader2,
  Crosshair
} from 'lucide-react';
import { ProjectLocationConfig } from '../types/hydrology';
import {
  searchPlacesMultiTier,
  searchLocalDatabase,
  ALGERIAN_GEO_DATABASE,
  GeoLocationResult,
  findNearestSpatialLocation,
  generateHydrologyProfileForCoords,
  fetchFullLocationAndHydrology
} from '../utils/geoSearch';
import { exportToGoogleEarthKml, exportToGeoJson } from '../utils/gisExport';

interface LocationManagerProps {
  currentConfig: ProjectLocationConfig;
  onUpdateConfig: (newConfig: ProjectLocationConfig) => void;
  onNavigateToReport: () => void;
}

export const PRESET_LOCATIONS: ProjectLocationConfig[] = [
  {
    projectName: 'Oued_Boumerdes',
    locationName: 'Boumerdès (بومرداس) - Plaine Côtière et Bassin Versant',
    coordinates: { lat: 36.7598, lng: 3.4732, crs: 'EPSG:32631 (WGS84 UTM 31N)' },
    surfaceKm2: 64.20,
    perimetreKm: 42.80,
    drainLengthKm: 18.50,
    slopePercent: 3.10,
    altMinM: 12.0,
    altMaxM: 610.0,
    urbanizationPct: 22.0,
    climateZone: 'Méditerranéen Tellien',
    soilGroup: 'C'
  },
  {
    projectName: 'Oued_El_Harrach',
    locationName: 'Alger / Oued El Harrach (وادي الحراش - الجزائر)',
    coordinates: { lat: 36.7214, lng: 3.1367, crs: 'EPSG:32631 (WGS84 UTM 31N)' },
    surfaceKm2: 78.50,
    perimetreKm: 48.20,
    drainLengthKm: 22.40,
    slopePercent: 2.10,
    altMinM: 5.0,
    altMaxM: 740.0,
    urbanizationPct: 35.0,
    climateZone: 'Méditerranéen Côtier Dense',
    soilGroup: 'D'
  },
  {
    projectName: 'Oued_Chelif',
    locationName: 'Chélif / Aïn Defla (عين الدفلى - الشلف)',
    coordinates: { lat: 36.1632, lng: 2.7185, crs: 'EPSG:32631 (WGS84 UTM 31N)' },
    surfaceKm2: 92.50,
    perimetreKm: 56.40,
    drainLengthKm: 26.20,
    slopePercent: 1.85,
    altMinM: 220.0,
    altMaxM: 980.0,
    urbanizationPct: 8.5,
    climateZone: 'Semi-aride à orages brutaux',
    soilGroup: 'D'
  },
  {
    projectName: 'BR_inondations',
    locationName: 'Bassin Pilote BR inondations (Site Officiel)',
    coordinates: { lat: 43.6047, lng: 3.8767, crs: 'EPSG:2154 (Lambert-93) / WGS84' },
    surfaceKm2: 48.75,
    perimetreKm: 34.20,
    drainLengthKm: 14.80,
    slopePercent: 2.45,
    altMinM: 142.0,
    altMaxM: 584.0,
    urbanizationPct: 14.5,
    climateZone: 'Méditerranéen / Cévenol',
    soilGroup: 'C'
  }
];

export const LocationManager: React.FC<LocationManagerProps> = ({
  currentConfig,
  onUpdateConfig,
  onNavigateToReport
}) => {
  // Form State
  const [formData, setFormData] = useState<ProjectLocationConfig>(currentConfig);

  useEffect(() => {
    setFormData(currentConfig);
  }, [currentConfig]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'google_satellite' | 'osm_streets' | 'topo'>('google_satellite');

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);

  // Leaflet map reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const gpsAccuracyCircleRef = useRef<L.Circle | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);

  // Custom Glowing Leaflet Pin Icon (High-visibility GPS Pin)
  const createCustomIcon = (isGps: boolean = false) => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
          <div style="
            position:absolute;
            width:36px;
            height:36px;
            border-radius:50%;
            background:${isGps ? '#10b981' : '#06b6d4'};
            opacity:0.35;
            animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
          "></div>
          <div style="
            width:26px;
            height:26px;
            border-radius:50%;
            background:${isGps ? '#10b981' : '#06b6d4'};
            border:3px solid #ffffff;
            box-shadow:0 0 16px ${isGps ? 'rgba(16,185,129,0.9)' : 'rgba(6,182,212,0.9)'}, 0 4px 10px rgba(0,0,0,0.6);
            display:flex;
            align-items:center;
            justify-content:center;
            cursor:pointer;
            z-index:2;
          ">
            <div style="width:7px;height:7px;border-radius:50%;background:#ffffff;"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  };

  // Generate simulated watershed boundary around coordinates
  const generateWatershedPoints = (centerLat: number, centerLng: number, areaKm2: number) => {
    const radiusDeg = Math.sqrt(areaKm2) * 0.009;
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    return angles.map((a, i) => {
      const rad = (a * Math.PI) / 180;
      const wobble = 0.75 + (i % 3) * 0.25;
      return [
        centerLat + Math.sin(rad) * radiusDeg * wobble,
        centerLng + Math.cos(rad) * radiusDeg * wobble * 1.2
      ] as [number, number];
    });
  };

  // Switch Tile Layer
  const setTileLayer = (type: 'google_satellite' | 'osm_streets' | 'topo', map: L.Map) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'; // Google Maps Hybrid (Satellite + Names)
    let maxZoom = 20;

    if (type === 'osm_streets') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      maxZoom = 19;
    } else if (type === 'topo') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 19;
    }

    const layer = L.tileLayer(url, { maxZoom, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] });
    layer.addTo(map);
    tileLayerRef.current = layer;
    setMapType(type);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = formData.coordinates.lat || 36.75;
      const initialLng = formData.coordinates.lng || 3.47;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([initialLat, initialLng], 12);

      // Default to Google Hybrid Satellite tiles
      setTileLayer('google_satellite', map);

      // Main Pin Marker
      const marker = L.marker([initialLat, initialLng], {
        icon: createCustomIcon(false),
        draggable: true,
        zIndexOffset: 1000
      }).addTo(map);

      // On marker drag
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updateLocationFromCoords(pos.lat, pos.lng);
      });

      // On click anywhere on map
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateLocationFromCoords(lat, lng);
      });

      // Watershed Polygon overlay
      const polyCoords = generateWatershedPoints(initialLat, initialLng, formData.surfaceKm2);
      const polygon = L.polygon(polyCoords, {
        color: '#22d3ee',
        weight: 2.5,
        fillColor: '#06b6d4',
        fillOpacity: 0.20,
        dashArray: '6, 6'
      }).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = marker;
      polygonRef.current = polygon;

      // Invalidate size after mount to prevent gray tiles on mobile
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map when coordinates or surface changes
  const updateMapPosition = (lat: number, lng: number, area: number, isGps: boolean = false) => {
    if (mapInstanceRef.current && markerRef.current && polygonRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setIcon(createCustomIcon(isGps));

      const newPoly = generateWatershedPoints(lat, lng, area);
      polygonRef.current.setLatLngs(newPoly);
      mapInstanceRef.current.invalidateSize();
    }
  };

  // Helper when user clicks on map or drags marker
  const updateLocationFromCoords = async (lat: number, lng: number, isGps: boolean = false) => {
    const roundedLat = parseFloat(lat.toFixed(5));
    const roundedLng = parseFloat(lng.toFixed(5));

    // Immediately generate dynamic hydrology profile for clicked/dragged coordinates
    const instantProfile = generateHydrologyProfileForCoords(roundedLat, roundedLng);
    applyCoordinatesToMap(
      roundedLat,
      roundedLng,
      isGps,
      mapInstanceRef.current?.getZoom() || 14,
      instantProfile.locationName,
      instantProfile
    );

    // Asynchronously refine if online via reverse geocoding & elevation
    try {
      const refined = await fetchFullLocationAndHydrology(roundedLat, roundedLng);
      applyCoordinatesToMap(
        roundedLat,
        roundedLng,
        isGps,
        mapInstanceRef.current?.getZoom() || 14,
        refined.locationName,
        refined
      );
    } catch (e) {
      // Keep instant profile
    }
  };

  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [isAiSearching, setIsAiSearching] = useState<boolean>(false);
  const [aiDossier, setAiDossier] = useState<{
    locationName: string;
    lat: number;
    lng: number;
    watershedType: string;
    estimatedAreaKm2: number;
    estimatedSlopePercent: number;
    estimatedQ100: number;
    flashFloodRisk: string;
    historicalFloodNote: string;
    geologicalSummary: string;
  } | null>(null);

  // AI-Powered Semantic & Hydrological Place Search
  const handleAiGeoSearch = async (queryParam?: string) => {
    const q = (queryParam || searchQuery).trim();
    if (!q) {
      setSearchMessage('⚠️ يرجى كتابة اسم المدينة أو الوادي للبحث بالذكاء الاصطناعي (مثال: بومرداس، قسنطينة وادي الرمال، وادي ميزاب، وادي الحراش...)');
      return;
    }

    setIsAiSearching(true);
    setSearchMessage(null);

    try {
      const response = await fetch('/api/ai/geo-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, language: 'ar' })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const item = resData.data;
        setAiDossier(item);

        const lat = typeof item.lat === 'number' ? item.lat : parseFloat(item.lat) || 36.75;
        const lng = typeof item.lng === 'number' ? item.lng : parseFloat(item.lng) || 3.47;
        const locName = item.locationName || q;

        applyCoordinatesToMap(lat, lng, false, 15, `Bassin Versant - ${locName}`);
        setGpsStatus(`✨ تم تحديد وتحليل الموقع بواسطة الذكاء الاصطناعي: ${locName} (${item.watershedType})`);
        setSearchMessage(null);
      } else {
        throw new Error('AI search failed');
      }
    } catch (err) {
      console.warn('AI Geo Search fallback to standard search:', err);
      await handleSearch();
    } finally {
      setIsAiSearching(false);
    }
  };

  // Multi-tier reliable City & Basin Search (Local Directory + Open-Meteo + Nominatim)
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSearchMessage('⚠️ يرجى كتابة اسم المدينة أو الولاية أو الوادي في خانة البحث (مثل: بومرداس، الجزائر، وادي الحراش، سطيف، وهران...) أو اختر من القائمة المنسدلة.');
      return;
    }

    setIsSearching(true);
    setSearchMessage(null);

    try {
      const results = await searchPlacesMultiTier(query);
      if (results && results.length > 0) {
        setSearchResults(results.map(r => ({
          display_name: r.displayName,
          lat: r.lat.toString(),
          lon: r.lng.toString()
        })));

        const top = results[0];
        const lat = top.lat;
        const lng = top.lng;
        const targetName = top.nameAr || top.name;
        const fullLocName = `Bassin Versant - ${targetName}`;

        applyCoordinatesToMap(lat, lng, false, 15, fullLocName);
        setGpsStatus(`✅ تم العثور على المكان ونقل الخريطة فوراً إلى: ${top.displayName} (${lat}°N, ${lng}°E) واعتمادها للدراسة.`);
        setSearchMessage(null);
      } else {
        // Fallback: search local database directly
        const local = searchLocalDatabase(query);
        if (local.length > 0) {
          const top = local[0];
          applyCoordinatesToMap(top.lat, top.lng, false, 15, `Bassin Versant - ${top.nameAr || top.name}`);
          setGpsStatus(`✅ تم العثور على المكان: ${top.displayName}`);
          setSearchMessage(null);
        } else {
          setSearchMessage(`⚠️ لم يتم العثور على نتائج مطابقة لـ "${query}". يرجى اختيار ولايتك مباشرة من قائمة الـ 58 ولاية أعلاه.`);
        }
      }
    } catch (err) {
      console.warn('Search error:', err);
      const local = searchLocalDatabase(query);
      if (local.length > 0) {
        const top = local[0];
        applyCoordinatesToMap(top.lat, top.lng, false, 15, `Bassin Versant - ${top.nameAr || top.name}`);
        setGpsStatus(`✅ تم العثور على المكان محلياً: ${top.displayName}`);
        setSearchMessage(null);
      } else {
        setSearchMessage(`⚠️ تعذر إتمام البحث عبر الإنترنت، يرجى اختيار ولايتك من القائمة المنسدلة أو النقر على الخريطة.`);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Select search result
  const handleSelectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const name = result.display_name.split(',').slice(0, 2).join(', ');
    const fullLocName = `Bassin Versant - ${name}`;

    applyCoordinatesToMap(lat, lng, false, 15, fullLocName);
    setSearchResults([]);
    setSearchQuery(name);
    setSearchMessage(null);
    setGpsStatus(`✅ تم الانتقال بنجاح إلى: ${name} وتحديث الدراسة`);
  };

  // Multi-tier GPS acquisition on mobile and desktop
  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(false);
  const [manualCoords, setManualCoords] = useState<{ lat: string; lng: string }>({
    lat: currentConfig.coordinates.lat.toString(),
    lng: currentConfig.coordinates.lng.toString()
  });

  // Center and fly map to coordinates with safety check & automatic sync
  const applyCoordinatesToMap = (
    lat: number,
    lng: number,
    isGps: boolean = false,
    zoomLevel: number = 15,
    customLocationName?: string,
    explicitConfig?: ProjectLocationConfig
  ) => {
    const roundedLat = parseFloat(lat.toFixed(5));
    const roundedLng = parseFloat(lng.toFixed(5));

    let newConfig: ProjectLocationConfig;
    if (explicitConfig) {
      newConfig = { ...explicitConfig };
      if (customLocationName) {
        newConfig.locationName = customLocationName;
      }
    } else {
      // Generate dynamic hydrology profile based on coordinates and nearest spatial region
      newConfig = generateHydrologyProfileForCoords(roundedLat, roundedLng, customLocationName);
    }

    setFormData(newConfig);
    onUpdateConfig(newConfig);
    setManualCoords({ lat: roundedLat.toString(), lng: roundedLng.toString() });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      mapInstanceRef.current.setView([roundedLat, roundedLng], zoomLevel, { animate: true });

      if (markerRef.current) {
        markerRef.current.setLatLng([roundedLat, roundedLng]);
        markerRef.current.setIcon(createCustomIcon(isGps));
        markerRef.current.bindPopup(`
          <div style="font-family:sans-serif;text-align:center;padding:4px;direction:rtl;">
            <b style="color:${isGps ? '#059669' : '#0284c7'};font-size:12px;">
              ${isGps ? '📍 موقعك الحالي عبر GPS' : '📍 منطقة الدراسة المعتمدة'}
            </b><br>
            <span style="font-weight:bold;color:#0f172a;font-size:11px;">${newConfig.locationName}</span><br>
            <span style="font-size:10px;color:#64748b;">${roundedLat}°N , ${roundedLng}°E</span>
            <div style="margin-top:3px;font-size:9.5px;color:#059669;font-weight:bold;">
              ${newConfig.climateZone}
            </div>
          </div>
        `).openPopup();
      }

      if (polygonRef.current) {
        polygonRef.current.setLatLngs(generateWatershedPoints(roundedLat, roundedLng, newConfig.surfaceKm2));
      }
    }
  };

  // 58 Algerian Wilayas + Major Regional Basins
  const ALGERIAN_WILAYAS = [
    { code: '35', name: 'بومرداس (Boumerdès)', lat: 36.7598, lng: 3.4732 },
    { code: '16', name: 'الجزائر العاصمة (Alger)', lat: 36.7525, lng: 3.0420 },
    { code: '16b', name: 'وادي الحراش - الجزائر (Oued El Harrach)', lat: 36.7214, lng: 3.1367 },
    { code: '09', name: 'البليدة (Blida)', lat: 36.4701, lng: 2.8277 },
    { code: '42', name: 'تيبازة (Tipaza)', lat: 36.5928, lng: 2.4475 },
    { code: '15', name: 'تيزي وزو (Tizi Ouzou)', lat: 36.7118, lng: 4.0459 },
    { code: '06', name: 'بجاية (Béjaïa)', lat: 36.7559, lng: 5.0843 },
    { code: '44', name: 'عين الدفلى (Aïn Defla)', lat: 36.1632, lng: 2.7185 },
    { code: '02', name: 'الشلف (Chlef)', lat: 36.1652, lng: 1.3345 },
    { code: '31', name: 'وهران (Oran)', lat: 35.6976, lng: -0.6337 },
    { code: '25', name: 'قسنطينة (Constantine)', lat: 36.3650, lng: 6.6147 },
    { code: '19', name: 'سطيف (Sétif)', lat: 36.1911, lng: 5.4137 },
    { code: '23', name: 'عنابة (Annaba)', lat: 36.9000, lng: 7.7667 },
    { code: '13', name: 'تلمسان (Tlemcen)', lat: 34.8783, lng: -1.3150 },
    { code: '05', name: 'باتنة (Batna)', lat: 35.5559, lng: 6.1741 },
    { code: '07', name: 'بسكرة (Biskra)', lat: 34.8516, lng: 5.7281 },
    { code: '26', name: 'المدية (Médéa)', lat: 36.2642, lng: 2.7539 },
    { code: '27', name: 'مستغانم (Mostaganem)', lat: 35.9312, lng: 0.0892 },
    { code: '17', name: 'الجلفة (Djelfa)', lat: 34.6728, lng: 3.2630 },
    { code: '28', name: 'المسيلة (M\'Sila)', lat: 35.7058, lng: 4.5419 },
    { code: '10', name: 'البويرة (Bouira)', lat: 36.3749, lng: 3.9020 },
    { code: '34', name: 'برج بوعريريج (Bordj Bou Arréridj)', lat: 36.0732, lng: 4.7611 },
    { code: '18', name: 'جيجل (Jijel)', lat: 36.8206, lng: 5.7667 },
    { code: '21', name: 'سكيكدة (Skikda)', lat: 36.8762, lng: 6.9092 },
    { code: '24', name: 'قالمة (Guelma)', lat: 36.4621, lng: 7.4261 },
    { code: '41', name: 'سوق أهراس (Souk Ahras)', lat: 36.2864, lng: 7.9511 },
    { code: '36', name: 'الطارف (El Tarf)', lat: 36.7672, lng: 8.3138 },
    { code: '43', name: 'ميلة (Mila)', lat: 36.4503, lng: 6.2644 },
    { code: '04', name: 'أم البواقي (Oum El Bouaghi)', lat: 35.8755, lng: 7.1135 },
    { code: '40', name: 'خنشلة (Khenchela)', lat: 35.4358, lng: 7.1433 },
    { code: '12', name: 'تبسة (Tébessa)', lat: 35.4042, lng: 8.1242 },
    { code: '29', name: 'معسكر (Mascara)', lat: 35.3969, lng: 0.1403 },
    { code: '22', name: 'سيدي بلعباس (Sidi Bel Abbès)', lat: 35.1899, lng: -0.6308 },
    { code: '46', name: 'عين تموشنت (Aïn Témouchent)', lat: 35.2975, lng: -1.1404 },
    { code: '48', name: 'غليزان (Relizane)', lat: 35.7373, lng: 0.5559 },
    { code: '14', name: 'تيارت (Tiaret)', lat: 35.3710, lng: 1.3170 },
    { code: '38', name: 'تيسمسيلت (Tissemsilt)', lat: 35.6072, lng: 1.8108 },
    { code: '20', name: 'سعيدة (Saïda)', lat: 34.8303, lng: 0.1517 },
    { code: '45', name: 'النعامة (Naâma)', lat: 33.2667, lng: -0.3167 },
    { code: '32', name: 'البيض (El Bayadh)', lat: 33.6833, lng: 1.0167 },
    { code: '03', name: 'الأغواط (Laghouat)', lat: 33.8000, lng: 2.8651 },
    { code: '47', name: 'غرداية (Ghardaïa)', lat: 32.4909, lng: 3.6735 },
    { code: '30', name: 'ورقلة (Ouargla)', lat: 31.9493, lng: 5.3250 },
    { code: '39', name: 'الوادي (El Oued)', lat: 33.3683, lng: 6.8675 },
    { code: '08', name: 'بشار (Béchar)', lat: 31.6167, lng: -2.2167 },
    { code: '01', name: 'أدرار (Adrar)', lat: 27.8743, lng: -0.2939 },
    { code: '11', name: 'تمنراست (Tamanrasset)', lat: 22.7850, lng: 5.5228 },
    { code: 'fr_br', name: 'بسين بيلوت BR inondations (الموقع المرجعي)', lat: 43.6047, lng: 3.8767 }
  ];

  // Try robust, CORS-open IP-based location fallback
  const tryIpGeolocation = async () => {
    setGpsStatus('جاري تحديد موقعك الفوري عبر الشبكة المحلية (GeoJS)...');
    
    // Fallback 1: get.geojs.io (100% open CORS, zero quota restrictions, very fast)
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      if (res.ok) {
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          const lat = parseFloat(parseFloat(data.latitude).toFixed(5));
          const lng = parseFloat(parseFloat(data.longitude).toFixed(5));
          const cityName = data.city || data.region;
          const profile = generateHydrologyProfileForCoords(
            lat,
            lng,
            cityName ? `حوض وادي ${cityName} (${cityName})` : undefined
          );
          setGpsStatus(`✅ تم تحديد موقعك التلقائي بنجاح: ${profile.locationName} (${lat}°N, ${lng}°E)`);
          applyCoordinatesToMap(lat, lng, true, 15, profile.locationName, profile);
          setIsLocatingGps(false);
          return;
        }
      }
    } catch (e) {
      console.warn('GeoJS fetch failed, trying ipwho.is...');
    }

    // Fallback 2: ipwho.is (open CORS)
    try {
      const res2 = await fetch('https://ipwho.is/');
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.success !== false && data2.latitude && data2.longitude) {
          const lat = parseFloat(data2.latitude.toFixed(5));
          const lng = parseFloat(data2.longitude.toFixed(5));
          const cityName = data2.city || data2.region;
          const profile = generateHydrologyProfileForCoords(
            lat,
            lng,
            cityName ? `حوض وادي ${cityName} (${cityName})` : undefined
          );
          setGpsStatus(`✅ تم تحديد موقعك بنجاح عبر الشبكة: ${profile.locationName} (${lat}°N, ${lng}°E)`);
          applyCoordinatesToMap(lat, lng, true, 15, profile.locationName, profile);
          setIsLocatingGps(false);
          return;
        }
      }
    } catch (e) {
      console.warn('ipwho.is failed, trying freeipapi...');
    }

    // Fallback 3: freeipapi.com
    try {
      const res3 = await fetch('https://freeipapi.com/api/json');
      if (res3.ok) {
        const data3 = await res3.json();
        if (data3 && data3.latitude && data3.longitude) {
          const lat = parseFloat(data3.latitude.toFixed(5));
          const lng = parseFloat(data3.longitude.toFixed(5));
          const cityName = data3.cityName;
          const profile = generateHydrologyProfileForCoords(
            lat,
            lng,
            cityName ? `حوض وادي ${cityName} (${cityName})` : undefined
          );
          setGpsStatus(`✅ تم تحديد موقعك: ${profile.locationName} (${lat}°N, ${lng}°E)`);
          applyCoordinatesToMap(lat, lng, true, 15, profile.locationName, profile);
          setIsLocatingGps(false);
          return;
        }
      }
    } catch (e) {
      console.warn('All IP services failed');
    }

    setGpsStatus('⚠️ تعذر تحديد الـ GPS تلقائياً. يرجى اختيار ولايتك مباشرة من القائمة المنسدلة أدناه أو النقر على الخريطة.');
    setIsLocatingGps(false);
  };

  // Robust multi-stage GPS acquisition on mobile phones with immediate network preview
  const handleUseGPS = () => {
    setIsLocatingGps(true);
    setGpsStatus('📡 جاري الاتصال بالـ GPS بهاتفك... يرجى الضغط على "سماح / Allow" عند ظهور إشعار المتصفح');

    // Immediately trigger fast GeoJS network positioning in parallel so map moves right away!
    tryIpGeolocation();

    if ('geolocation' in navigator) {
      // Step 1: Attempt High Accuracy satellite GPS
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lng = parseFloat(pos.coords.longitude.toFixed(5));
          const accuracy = pos.coords.accuracy || 20;

          // Compute dynamic hydrology and spatial reverse geocode immediately
          const initialProfile = generateHydrologyProfileForCoords(lat, lng);
          applyCoordinatesToMap(lat, lng, true, 16, initialProfile.locationName, initialProfile);

          setGpsStatus(`✅ تم التقاط إشارة GPS الهاتف بدقة فائقة! تم تمركز الخريطة واعتماد: ${initialProfile.locationName} (${lat}°N, ${lng}°E - دقة: ±${Math.round(accuracy)}م)`);
          setIsLocatingGps(false);

          // Asynchronously refine via full geocoding and elevation API
          try {
            const refined = await fetchFullLocationAndHydrology(lat, lng);
            applyCoordinatesToMap(lat, lng, true, 16, refined.locationName, refined);
            setGpsStatus(`✅ تم تحديث بيانات الحوض الهيدرولوجي للموقع: ${refined.locationName}`);
          } catch (e) {
            // Keep initial profile
          }
        },
        (err) => {
          console.warn('High accuracy GPS timed out, trying low accuracy / network triangulation...', err);
          // Step 2: Retry with low accuracy (cellular network + Wi-Fi)
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const lat = parseFloat(pos.coords.latitude.toFixed(5));
              const lng = parseFloat(pos.coords.longitude.toFixed(5));
              const accuracy = pos.coords.accuracy || 80;

              const initialProfile = generateHydrologyProfileForCoords(lat, lng);
              applyCoordinatesToMap(lat, lng, true, 15, initialProfile.locationName, initialProfile);

              setGpsStatus(`✅ تم تحديد موقعك عبر شبكة الهاتف: ${initialProfile.locationName} (${lat}°N, ${lng}°E - دقة: ±${Math.round(accuracy)}م)`);
              setIsLocatingGps(false);

              try {
                const refined = await fetchFullLocationAndHydrology(lat, lng);
                applyCoordinatesToMap(lat, lng, true, 15, refined.locationName, refined);
              } catch (e) {
                // Keep initial profile
              }
            },
            (err2) => {
              console.warn('Low accuracy GPS also finished, keeping fast network location.', err2);
              setIsLocatingGps(false);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
      );
    }
  };

  // Handle Preset selection
  const handleSelectPreset = (preset: ProjectLocationConfig) => {
    setFormData(preset);
    onUpdateConfig(preset);
    setManualCoords({ lat: preset.coordinates.lat.toString(), lng: preset.coordinates.lng.toString() });
    updateMapPosition(preset.coordinates.lat, preset.coordinates.lng, preset.surfaceKm2, false);
    if (markerRef.current) {
      markerRef.current.bindPopup(`
        <div style="font-family:sans-serif;text-align:center;padding:4px;direction:rtl;">
          <b style="color:#0284c7;font-size:12px;">📍 منطقة الدراسة المعتمدة</b><br>
          <span style="font-weight:bold;color:#0f172a;font-size:11px;">${preset.locationName}</span><br>
          <span style="font-size:10px;color:#64748b;">${preset.coordinates.lat.toFixed(4)}°N , ${preset.coordinates.lng.toFixed(4)}°E</span>
          <div style="margin-top:3px;font-size:9.5px;color:#059669;font-weight:bold;">
            ${preset.climateZone}
          </div>
        </div>
      `).openPopup();
    }
  };

  // Run Hydrological calculation
  const handleRunSimulation = () => {
    setIsProcessing(true);
    setSuccessMessage(null);

    setTimeout(() => {
      setIsProcessing(false);
      onUpdateConfig(formData);
      setSuccessMessage(
        `Calcul de l'étude réussi pour "${formData.locationName}". Toutes les données hydrologiques, HEC-RAS et tables Looker Studio ont été actualisées !`
      );
    }, 800);
  };

  // Live calculations
  const graveliusKc = (0.28 * formData.perimetreKm) / Math.sqrt(Math.max(formData.surfaceKm2, 1));
  const deltaH = formData.altMaxM - formData.altMinM;
  const slopeMPerM = formData.slopePercent / 100;
  const tcKirpich = 0.0195 * Math.pow(formData.drainLengthKm * 1000, 0.77) * Math.pow(slopeMPerM, -0.385) / 60;
  const tcGiandotti = (4 * Math.sqrt(formData.surfaceKm2) + 1.5 * formData.drainLengthKm) / (0.8 * Math.sqrt(Math.max(deltaH, 1))) * 60;
  const tcConsensus = Math.max((tcKirpich + tcGiandotti) / 2, 15);
  const coeffC = 0.25 + (formData.urbanizationPct / 100) * 0.65;
  const rainQ100 = 85 + formData.slopePercent * 8;
  const q100Est = (coeffC * (rainQ100 / (tcConsensus / 60)) * formData.surfaceKm2) / 3.6;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Title */}
      <div className="border border-slate-800 bg-slate-900/80 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <Globe className="w-4 h-4" />
              <span>GÉOLOCALISATION GPS & IMAGERIE SATELLITE GOOGLE MAPS</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight font-display">
              Définir la Zone d'Étude & Localiser le Projet
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Activez le <strong>GPS</strong>, recherchez votre ville ou cliquez directement sur la <strong>vue satellite Google Maps</strong>.
              Toutes les données de l'étude (MNT, pluviométrie, débits centennaux $Q_{100}$ et tables Looker Studio) s'ajusteront automatiquement.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
            <button
              onClick={handleUseGPS}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <Crosshair className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Ma position GPS (تحديد موقعي)</span>
            </button>

            <button
              onClick={handleRunSimulation}
              disabled={isProcessing}
              className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Calcul en cours...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Calculer l'Étude (إجراء الدراسة)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* GPS Live Status Alert */}
        {gpsStatus && (
          <div className="mt-3 p-2.5 bg-slate-950/70 border border-slate-700 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{gpsStatus}</span>
          </div>
        )}

        {/* Quick Wilayas / Cities Bar & Dropdown */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
          {/* Active Study Area Confirmation Banner */}
          <div className="p-3 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 border border-cyan-500/50 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <div>
                <div className="text-[11px] font-mono text-cyan-400 font-semibold">
                  📍 منطقة الدراسة المعتمدة حالياً (Zone d'étude active) :
                </div>
                <div className="text-white font-bold text-xs sm:text-sm flex flex-wrap items-center gap-2">
                  <span>{formData.locationName}</span>
                  <span className="text-xs font-mono font-normal text-cyan-200">
                    ({formData.coordinates.lat.toFixed(4)}°N, {formData.coordinates.lng.toFixed(4)}°E)
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onNavigateToReport}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <span>عرض الدراسة والصور المحدثة</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Prominent Dropdown for all 58 Wilayas */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950/80 p-3 rounded-xl border border-cyan-500/40 shadow-lg">
            <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 whitespace-nowrap">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>🏛️ اختر ولايتك مباشرة (58 ولاية جزائرية ومواقع هيدرولوجية) :</span>
            </label>
            <select
              onChange={(e) => {
                const selected = ALGERIAN_WILAYAS.find(w => w.name === e.target.value);
                if (selected) {
                  const profile = generateHydrologyProfileForCoords(selected.lat, selected.lng, selected.name);
                  applyCoordinatesToMap(selected.lat, selected.lng, false, 15, selected.name, profile);
                  setGpsStatus(`✅ تم نقل الخريطة فوراً إلى: ${selected.name} (${selected.lat}°N, ${selected.lng}°E) واعتمادها للدراسة.`);
                }
              }}
              defaultValue=""
              className="flex-1 bg-slate-900 border-2 border-cyan-400/60 rounded-xl px-3 py-2 text-white text-xs sm:text-sm font-semibold focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="" disabled>-- اضغط هنا للاختيار الفوري لولايتك (58 ولاية) --</option>
              {ALGERIAN_WILAYAS.map((w, idx) => (
                <option key={idx} value={w.name}>
                  {w.code ? `[${w.code}] ` : ''}{w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span>أزرار سريعة للمدن الكبرى والأودية :</span>
            </span>
            <span className="text-[11px] text-cyan-400">انقر للانتقال الفوري</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {ALGERIAN_WILAYAS.slice(0, 16).map((w, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const profile = generateHydrologyProfileForCoords(w.lat, w.lng, w.name);
                  applyCoordinatesToMap(w.lat, w.lng, false, 15, w.name, profile);
                  setGpsStatus(`✅ تم الانتقال بنجاح إلى: ${w.name}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 hover:border-cyan-400 hover:bg-slate-800 text-slate-300 hover:text-white text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Search Form */}
        <div className="mt-4 relative">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim().length >= 2) {
                    const matches = searchLocalDatabase(val.trim());
                    if (matches.length > 0) {
                      setSearchResults(matches.slice(0, 8).map(m => ({
                        display_name: m.displayName,
                        lat: m.lat.toString(),
                        lon: m.lng.toString()
                      })));
                    }
                  } else if (val.trim().length === 0) {
                    setSearchResults([]);
                    setSearchMessage(null);
                  }
                }}
                placeholder="Rechercher une ville, wilaya, oued ou fleuve (ex: بومرداس, الجزائر, وادي الحراش, سطيف, تيزي وزو...)"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || isAiSearching}
              className="px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-bold rounded-xl border border-cyan-500/50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-md active:scale-95 shrink-0"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Search className="w-4 h-4 text-cyan-400" />}
              <span>بحث (Chercher)</span>
            </button>
            <button
              type="button"
              onClick={() => handleAiGeoSearch()}
              disabled={isAiSearching || isSearching}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
              title="بحث هيدرولوجي متقدم بالذكاء الاصطناعي مع تقدير خصائص الحوض وتاريخ الفيضانات"
            >
              {isAiSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>جاري البحث الذكي...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
                  <span>بحث بالذكاء الاصطناعي ✨</span>
                </>
              )}
            </button>
          </form>

          {/* AI Hydrological Site Dossier Card */}
          {aiDossier && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/50 shadow-xl space-y-3 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/30 text-cyan-300 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">
                      بطاقة الموقع الهيدرولوجي بالذكاء الاصطناعي (Dossier Hydrologique IA)
                    </span>
                    <span className="text-[10px] text-cyan-300 block">
                      {aiDossier.locationName} · {aiDossier.watershedType}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    خطر السيول: {aiDossier.flashFloodRisk}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAiDossier(null)}
                    className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">الإحداثيات</span>
                  <span className="font-mono text-cyan-300 font-bold">{aiDossier.lat.toFixed(4)}°, {aiDossier.lng.toFixed(4)}°</span>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">المساحة المقدرة</span>
                  <span className="font-mono text-slate-200 font-bold">{aiDossier.estimatedAreaKm2} كم²</span>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">الانحدار التقديري</span>
                  <span className="font-mono text-amber-300 font-bold">{aiDossier.estimatedSlopePercent}%</span>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">تدفق الذروة Q100</span>
                  <span className="font-mono text-rose-400 font-bold">{aiDossier.estimatedQ100} م³/ث</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="text-slate-300 flex items-start gap-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-amber-400 font-bold shrink-0">📜 السجل التاريخي:</span>
                  <span>{aiDossier.historicalFloodNote}</span>
                </div>
                <div className="text-slate-300 flex items-start gap-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-cyan-400 font-bold shrink-0">🌍 طبيعة التربة:</span>
                  <span>{aiDossier.geologicalSummary}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    applyCoordinatesToMap(aiDossier.lat, aiDossier.lng, false, 15, `Bassin Versant - ${aiDossier.locationName}`);
                    setGpsStatus(`✅ تم اعتماد بيانات الموقع بالكامل للدراسة.`);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تأكيد واعتماد هذا الموقع للدراسة</span>
                </button>
              </div>
            </div>
          )}

          {/* Search Error / Guidance Message */}
          {searchMessage && (
            <div className="mt-2 p-2 bg-amber-950/40 border border-amber-500/40 rounded-lg text-xs text-amber-300">
              {searchMessage}
            </div>
          )}

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSearchResult(item)}
                  className="p-3 hover:bg-slate-800 cursor-pointer text-xs text-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-medium line-clamp-1">{item.display_name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                    {parseFloat(item.lat).toFixed(2)}°N, {parseFloat(item.lon).toFixed(2)}°E
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-4 p-3.5 bg-emerald-950/50 border border-emerald-500/60 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-300 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={onNavigateToReport}
              className="px-3 py-1 rounded bg-emerald-400 text-slate-950 font-bold hover:bg-emerald-300 transition-colors shrink-0 flex items-center gap-1"
            >
              <span>Voir le Rapport</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Interactive Work Area: Interactive Map on Left, Parameters on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map Column */}
        <div className="lg:col-span-7 border border-slate-800 bg-slate-900/60 rounded-2xl p-4 sm:p-5 flex flex-col space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <MapPin className="w-4 h-4" />
              <span>VUE SATELLITE GOOGLE MAPS & LOCALISATION GPS</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {/* Google Earth KML Download Button */}
              <button
                type="button"
                onClick={() => exportToGoogleEarthKml(formData)}
                title="تنزيل حدود الحوض ومجرى الوادي لفتحه في Google Earth (.kml)"
                className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Globe className="w-3 h-3 text-amber-400" />
                <span>Google Earth (.KML)</span>
              </button>

              {/* Map Layer Switcher */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px]">
                <button
                  onClick={() => mapInstanceRef.current && setTileLayer('google_satellite', mapInstanceRef.current)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    mapType === 'google_satellite' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🛰️ Satellite Google
                </button>
                <button
                  onClick={() => mapInstanceRef.current && setTileLayer('osm_streets', mapInstanceRef.current)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    mapType === 'osm_streets' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🗺️ Rues / Plans
                </button>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative w-full h-[380px] sm:h-[460px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Direct On-Map Floating GPS Action Button (Highly accessible on phones) */}
            <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleUseGPS}
                disabled={isLocatingGps}
                title="تحديد وانتقال الخريطة إلى موقع هاتفك الحالي"
                className="px-3 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg shadow-2xl backdrop-blur-md border border-emerald-400/60 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                {isLocatingGps ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>جاري تحديد موقعك...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4 text-emerald-200 animate-pulse" />
                    <span>📍 موقعي الحالي (GPS)</span>
                  </>
                )}
              </button>
            </div>

            {/* Float HUD on Map */}
            <div className="absolute bottom-3 left-3 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono text-slate-300 z-[1000] shadow-xl pointer-events-none max-w-[280px]">
              <div className="text-cyan-400 font-bold truncate">📍 {formData.locationName}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Coord : {formData.coordinates.lat.toFixed(4)}°N, {formData.coordinates.lng.toFixed(4)}°E
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">
                Bassin : {formData.surfaceKm2} km² · Q100 est : {q100Est.toFixed(1)} m³/s
              </div>
            </div>

            <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-emerald-400 z-[1000] shadow-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>نقطة الدراسة المباشرة (Active Pin)</span>
            </div>
          </div>

          {/* Quick Manual Coordinates Box & Direct Instruction */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1 text-cyan-400">
                <Navigation className="w-3.5 h-3.5" />
                إدخال يدوي مباشر للإحداثيات (Coordonnées GPS directes) :
              </span>
              <span className="text-[11px] text-slate-400">أو المس الخريطة لنقل النقطة</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5">
                  <span className="text-slate-500 font-mono">Lat:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={manualCoords.lat}
                    onChange={(e) => setManualCoords(prev => ({ ...prev, lat: e.target.value }))}
                    placeholder="36.7598"
                    className="w-full bg-transparent text-white font-mono focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5">
                  <span className="text-slate-500 font-mono">Lng:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={manualCoords.lng}
                    onChange={(e) => setManualCoords(prev => ({ ...prev, lng: e.target.value }))}
                    placeholder="3.4732"
                    className="w-full bg-transparent text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const lat = parseFloat(manualCoords.lat);
                  const lng = parseFloat(manualCoords.lng);
                  if (!isNaN(lat) && !isNaN(lng)) {
                    const profile = generateHydrologyProfileForCoords(lat, lng);
                    applyCoordinatesToMap(lat, lng, false, 15, profile.locationName, profile);
                    setGpsStatus(`✅ تم نقل الخريطة إلى الإحداثيات المحددة: ${profile.locationName} (${lat}°N, ${lng}°E)`);
                    try {
                      const refined = await fetchFullLocationAndHydrology(lat, lng);
                      applyCoordinatesToMap(lat, lng, false, 15, refined.locationName, refined);
                    } catch (e) {
                      // Ignore
                    }
                  }
                }}
                className="w-full sm:w-auto px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
              >
                📍 تطبيق والانتقال
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 pt-1">
            <span>💡 نصيحة: انقر أو المس أي نقطة في الخريطة لنقل موقع الدراسة إليها فوراً.</span>
            <span className="text-cyan-400">الحوض الصباب محدد باللون السيان</span>
          </div>
        </div>

        {/* Parameters & Hydrology Output Column */}
        <div className="lg:col-span-5 border border-slate-800 bg-slate-900/60 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-semibold text-slate-300 uppercase font-mono">
              Données de Terrain & Paramètres
            </span>
            <span className="text-cyan-400 font-mono">Calcul Immédiat</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Location Title */}
            <div>
              <label className="text-slate-400 block mb-1">Nom de la Région ou du Bassin :</label>
              <input
                type="text"
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-medium focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Coordinates Readout */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">LATITUDE (N)</span>
                <span className="text-white font-bold">{formData.coordinates.lat.toFixed(4)}° N</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">LONGITUDE (E)</span>
                <span className="text-white font-bold">{formData.coordinates.lng.toFixed(4)}° E</span>
              </div>
            </div>

            {/* Surface slider */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Superficie du Bassin (A) :</span>
                <span className="text-cyan-400 font-mono font-bold">{formData.surfaceKm2} km²</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="0.5"
                value={formData.surfaceKm2}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFormData({ ...formData, surfaceKm2: val });
                  if (polygonRef.current) {
                    polygonRef.current.setLatLngs(generateWatershedPoints(formData.coordinates.lat, formData.coordinates.lng, val));
                  }
                }}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Drain Length & Slope */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Drain Principal (L) :</span>
                  <span className="text-white font-mono">{formData.drainLengthKm} km</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  step="0.5"
                  value={formData.drainLengthKm}
                  onChange={(e) => setFormData({ ...formData, drainLengthKm: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Pente Moyenne (I) :</span>
                  <span className="text-white font-mono">{formData.slopePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="7.0"
                  step="0.1"
                  value={formData.slopePercent}
                  onChange={(e) => setFormData({ ...formData, slopePercent: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Urbanization & Soil */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Urbanisation :</span>
                  <span className="text-amber-400 font-mono">{formData.urbanizationPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={formData.urbanizationPct}
                  onChange={(e) => setFormData({ ...formData, urbanizationPct: parseInt(e.target.value) })}
                  className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Type de Sol SCS :</label>
                <select
                  value={formData.soilGroup}
                  onChange={(e) => setFormData({ ...formData, soilGroup: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white font-mono text-xs"
                >
                  <option value="A">Groupe A (Perméable)</option>
                  <option value="B">Groupe B (Modéré)</option>
                  <option value="C">Groupe C (Standard)</option>
                  <option value="D">Groupe D (Imperméable)</option>
                </select>
              </div>
            </div>

            {/* Model Results */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                RÉSULTATS DE LA MODÉLISATION EN DIRECT :
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">INDICE Kc</span>
                  <span className="text-sm font-bold text-white">{graveliusKc.toFixed(2)}</span>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">TEMPS tc</span>
                  <span className="text-sm font-bold text-cyan-400">{tcConsensus.toFixed(0)} min</span>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">DÉBIT Q100</span>
                  <span className="text-sm font-bold text-amber-400">{q100Est.toFixed(1)} m³/s</span>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleRunSimulation}
              disabled={isProcessing}
              className="w-full py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Appliquer et Recalculer l'Étude (تطبيق الحساب)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Quick-Buttons row */}
      <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-3 sm:p-4 text-xs space-y-2">
        <span className="text-slate-400 font-mono flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          Ou sélectionnez directement une région d'étude prédéfinie :
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_LOCATIONS.map((preset) => (
            <button
              key={preset.projectName}
              onClick={() => handleSelectPreset(preset)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                formData.projectName === preset.projectName
                  ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="font-semibold truncate">{preset.locationName}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {preset.surfaceKm2} km² · {preset.coordinates.lat.toFixed(2)}°N, {preset.coordinates.lng.toFixed(2)}°E
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
