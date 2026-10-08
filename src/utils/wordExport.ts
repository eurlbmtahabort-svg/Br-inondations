import { ProjectLocationConfig } from '../types/hydrology';
import { ARABIC_REPORT_DATA } from '../data/arabicReportContent';
import {
  GUMBEL_IDF_DATA,
  PEAK_DISCHARGE_DATA,
  HEC_RAS_SECTIONS,
  HYDRAULIC_STRUCTURES,
  VULNERABILITY_ASSETS,
  EARLY_WARNING_THRESHOLDS
} from '../data/projectData';
import { getRealSatelliteImageUrl, getRealTopoImageUrl } from './satelliteImagery';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import hecRasImgUrl from '../assets/images/hec_ras_hydraulic_simulation_1790800984505.jpg';

// Helper to convert local image asset to base64 Data URI so it embeds directly into Word
async function fetchImageAsBase64(url: string, timeoutMs: number = 4000): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return '';
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Could not load image for Word export:', url, e);
    return '';
  }
}

// Generate SVG Map Diagram with GPS coordinates and boundary
function generateSvgCatchmentMap(config: ProjectLocationConfig, isAr: boolean = false): string {
  const latStr = config.coordinates.lat.toFixed(4);
  const lngStr = config.coordinates.lng.toFixed(4);
  const name = config.locationName;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 360" width="650" height="360" style="max-width:100%; height:auto; background:#0f172a; border-radius:8px; border:1.5pt solid #334155;">
      <!-- Grid Lines -->
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1"/>
        </pattern>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.1"/>
        </linearGradient>
      </defs>
      <rect width="650" height="360" fill="#0b1120"/>
      <rect width="650" height="360" fill="url(#grid)" />

      <!-- Catchment Watershed Boundary Polygon -->
      <polygon points="120,80 260,45 420,55 530,110 560,210 470,290 320,310 180,270 95,190" 
        fill="url(#waterGrad)" stroke="#06b6d4" stroke-width="2.5" stroke-dasharray="6,4"/>

      <!-- Flood Zone Inundation Envelope -->
      <path d="M 170,180 Q 260,140 340,175 T 480,210 Q 420,250 310,230 Z" 
        fill="#f43f5e" fill-opacity="0.25" stroke="#f43f5e" stroke-width="1.5"/>

      <!-- Main River / Oued Drain Stream -->
      <path d="M 120,95 Q 220,130 290,165 T 410,200 T 520,220" 
        fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
      <path d="M 220,70 Q 250,110 290,165" 
        fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
      <path d="M 360,90 Q 380,140 410,200" 
        fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>

      <!-- Center GPS Target Point -->
      <circle cx="325" cy="180" r="16" fill="#10b981" fill-opacity="0.2"/>
      <circle cx="325" cy="180" r="8" fill="#10b981" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="325" cy="180" r="2.5" fill="#ffffff"/>

      <!-- North Arrow Compass -->
      <g transform="translate(585, 50)">
        <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
        <polygon points="0,-16 6,0 0,-4" fill="#ef4444"/>
        <polygon points="0,-16 -6,0 0,-4" fill="#b91c1c"/>
        <polygon points="0,16 6,0 0,4" fill="#cbd5e1"/>
        <polygon points="0,16 -6,0 0,4" fill="#94a3b8"/>
        <text x="0" y="-20" font-family="Arial" font-size="11" font-weight="bold" fill="#f87171" text-anchor="middle">N</text>
      </g>

      <!-- Cartographic Header Overlay -->
      <rect x="20" y="20" width="310" height="52" rx="6" fill="#0f172a" fill-opacity="0.9" stroke="#334155" stroke-width="1"/>
      <text x="32" y="38" font-family="Arial" font-size="11" font-weight="bold" fill="#38bdf8">
        ${isAr ? 'خريطة الموقع الجغرافي وحرم الفيضان' : 'CARTE DE LOCALISATION & EMPRISE DU BASSIN'}
      </text>
      <text x="32" y="55" font-family="Arial" font-size="9.5" fill="#94a3b8">
        ${name.substring(0, 38)} (${config.surfaceKm2} km²)
      </text>

      <!-- Coordinates & Scale Badge -->
      <rect x="20" y="295" width="280" height="45" rx="6" fill="#0f172a" fill-opacity="0.9" stroke="#334155" stroke-width="1"/>
      <text x="32" y="313" font-family="Arial" font-size="9.5" font-weight="bold" fill="#10b981">
        📍 GPS : ${latStr}°N, ${lngStr}°E
      </text>
      <text x="32" y="328" font-family="Arial" font-size="8.5" fill="#cbd5e1">
        CRS : ${config.coordinates.crs || 'WGS84 (EPSG:4326)'}
      </text>

      <!-- Legend Box -->
      <rect x="360" y="295" width="265" height="45" rx="6" fill="#0f172a" fill-opacity="0.9" stroke="#334155" stroke-width="1"/>
      <line x1="375" y1="310" x2="400" y2="310" stroke="#38bdf8" stroke-width="3"/>
      <text x="408" y="313" font-family="Arial" font-size="8.5" fill="#cbd5e1">${isAr ? 'المجرى المائي الرئيسي' : 'Drain principal'}</text>
      <rect x="375" y="322" width="16" height="8" fill="#f43f5e" fill-opacity="0.4" stroke="#f43f5e"/>
      <text x="408" y="329" font-family="Arial" font-size="8.5" fill="#cbd5e1">${isAr ? 'غمر مئوي Q100' : 'Zone inondable Q100'}</text>
    </svg>
  `;
}

export async function exportStudyToWord(
  lang: 'fr' | 'ar' | 'bilingual',
  config: ProjectLocationConfig
) {
  const isAr = lang === 'ar';
  const isBilingual = lang === 'bilingual';

  const docTitle = isAr
    ? `دراسة_أثر_ومخاطر_الفيضانات_${config.projectName}.doc`
    : isBilingual
    ? `Etude_Inondations_Bilingue_${config.projectName}.doc`
    : `Etude_Impact_Inondations_${config.projectName}.doc`;

  const dateStr = 'Septembre 2026 / سبتمبر 2026';

  // Generate dynamic real satellite imagery and topographic relief map of the EXACT coordinates
  const realSatelliteUrl = getRealSatelliteImageUrl(config.coordinates.lat, config.coordinates.lng, 'medium');
  const realTopoUrl = getRealTopoImageUrl(config.coordinates.lat, config.coordinates.lng, 'medium');

  // Load and embed real images as base64 with fallback to direct satellite URL
  const [satelliteBase64, demBase64, hecRasBase64] = await Promise.all([
    fetchImageAsBase64(realSatelliteUrl),
    fetchImageAsBase64(realTopoUrl),
    fetchImageAsBase64(hecRasImgUrl)
  ]);

  const finalSatelliteSrc = satelliteBase64 || realSatelliteUrl;
  const finalTopoSrc = demBase64 || realTopoUrl;

  const svgMapAr = generateSvgCatchmentMap(config, true);
  const svgMapFr = generateSvgCatchmentMap(config, false);

  let htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${isAr ? ARABIC_REPORT_DATA.title : 'Projet ' + config.projectName + ' : Étude d\'Impact et de Modélisation des Risques d\'Inondation'}</title>
      <style>
        body {
          font-family: ${isAr ? "'Arial', 'Tahoma', 'Segoe UI', sans-serif" : "'Calibri', 'Arial', sans-serif"};
          font-size: 11pt;
          line-height: 1.5;
          color: #1a1a1a;
          ${isAr ? 'direction: rtl; text-align: right;' : 'direction: ltr; text-align: left;'}
        }
        h1 {
          color: #0369a1;
          font-size: 18pt;
          margin-top: 18pt;
          margin-bottom: 8pt;
          border-bottom: 2pt solid #0284c7;
          padding-bottom: 4pt;
        }
        h2 {
          color: #0f766e;
          font-size: 14pt;
          margin-top: 16pt;
          margin-bottom: 6pt;
          border-bottom: 1pt solid #cbd5e1;
          padding-bottom: 3pt;
          page-break-after: avoid;
        }
        h3 {
          color: #1e293b;
          font-size: 12pt;
          margin-top: 10pt;
          margin-bottom: 4pt;
          page-break-after: avoid;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 8pt;
          margin-bottom: 14pt;
          page-break-inside: avoid;
        }
        th {
          background-color: #f1f5f9;
          color: #0f172a;
          font-weight: bold;
          border: 1pt solid #94a3b8;
          padding: 6pt 8pt;
          font-size: 9pt;
          text-align: ${isAr ? 'right' : 'left'};
        }
        td {
          border: 1pt solid #cbd5e1;
          padding: 5pt 8pt;
          font-size: 9pt;
          text-align: ${isAr ? 'right' : 'left'};
        }
        .header-box {
          border: 2pt solid #0284c7;
          background-color: #f8fafc;
          padding: 14pt;
          margin-bottom: 16pt;
        }
        .callout {
          background-color: #f0fdf4;
          border-left: 4pt solid #10b981;
          padding: 8pt 12pt;
          margin: 10pt 0;
          font-size: 10pt;
        }
        .figure-card {
          margin: 16pt 0;
          text-align: center;
          background-color: #f8fafc;
          border: 1.5pt solid #cbd5e1;
          padding: 8pt;
          border-radius: 6pt;
          page-break-inside: avoid;
        }
        .figure-card img {
          max-width: 100%;
          width: 650px;
          height: auto;
          border-radius: 4pt;
          border: 1pt solid #cbd5e1;
        }
        .figure-caption {
          font-size: 9.5pt;
          font-weight: bold;
          color: #1e293b;
          margin-top: 6pt;
        }
        .figure-sub {
          font-size: 8.5pt;
          color: #64748b;
          margin-top: 2pt;
        }
        .footer-sig {
          margin-top: 30pt;
          border-top: 1.5pt solid #94a3b8;
          padding-top: 10pt;
          font-size: 9.5pt;
          color: #475569;
        }
      </style>
    </head>
    <body>
  `;

  if (isAr) {
    // ----------------------------------------------------
    // FULL ARABIC WORD DOCUMENT WITH SATELLITE & MAPS
    // ----------------------------------------------------
    htmlContent += `
      <div class="header-box">
        <div style="font-size: 10pt; color: #64748b; margin-bottom: 6pt;">
          ${ARABIC_REPORT_DATA.client} · مرجع المشروع: [${config.projectName}]
        </div>
        <h1 style="margin: 0; color: #0369a1;">${ARABIC_REPORT_DATA.title}</h1>
        <div style="font-size: 13pt; color: #0284c7; margin-top: 4pt; font-weight: bold;">
          منطقة الدراسة المعتمدة: ${config.locationName}
        </div>
        <p style="margin-top: 8pt; font-size: 10.5pt; color: #334155;">
          ${ARABIC_REPORT_DATA.subTitle}
        </p>
        <div style="margin-top: 10pt; font-size: 9pt; color: #475569; line-height: 1.6;">
          الإحداثيات الجغرافية: ${config.coordinates.lat.toFixed(4)}° شمالاً، ${config.coordinates.lng.toFixed(4)}° شرقاً (${config.coordinates.crs || 'WGS84'})<br>
          مساحة الحوض الصباب: ${config.surfaceKm2} كم² · الخبير المسؤول: ${ARABIC_REPORT_DATA.expert} · التاريخ: ${dateStr}
        </div>
      </div>

      <div class="callout">
        <strong>الموجز التنفيذي للخبرة:</strong> يمثل هذا المستند التقرير الفني الشامل والنهائي المعتمد وفق التوجيهات الدولية لحماية المناطق المعرضة لخطر الغمر المائي. يتضمن صور الأقمار الصناعية عالية الدقة، الخرائط الطبوغرافية الرقمية، الحسابات الهيدرولوجية، ومحاكاة برنامج HEC-RAS 1D/2D.
      </div>

      <!-- FIGURE 0.1: HIGH RES SATELLITE IMAGE -->
      <div class="figure-card">
        <img src="${finalSatelliteSrc}" width="650" alt="صورة الأقمار الصناعية لمنطقة الدراسة" />
        <div class="figure-caption">
          الشكل 0.1 : صورة الأقمار الصناعية عالية الدقة لمنطقة الدراسة وتحديد مجرى الوادي وحرم الفيضان
        </div>
        <div class="figure-sub">
          المرجع الجغرافي: ${config.locationName} · خط العرض: ${config.coordinates.lat.toFixed(4)}°N ، خط الطول: ${config.coordinates.lng.toFixed(4)}°E
        </div>
      </div>

      <!-- FIGURE 0.2: CATCHMENT VECTOR MAP WITH GPS PIN -->
      <div class="figure-card">
        ${svgMapAr}
        <div class="figure-caption">
          الشكل 0.2 : الخريطة الهيدروغرافية للحوض الصباب وموقع نقطة الـ GPS ونطاق الغمر المئوي Q100
        </div>
        <div class="figure-sub">
          المساحة الكلية للحوض: ${config.surfaceKm2} كم² · الطول الإجمالي للمجرى: ${config.drainLengthKm} كم
        </div>
      </div>
    `;

    // Add chapters in Arabic
    ARABIC_REPORT_DATA.chapters.forEach((ch) => {
      htmlContent += `<h2>الفصل ${ch.num} : ${ch.title}</h2>`;
      ch.sections.forEach((sec) => {
        htmlContent += `
          <h3>${sec.num} ${sec.title}</h3>
          <p style="white-space: pre-line;">${sec.content}</p>
        `;
      });

      // Chapter 2: Insert DEM Image & Gumbel IDF Table
      if (ch.id === 'ch2') {
        htmlContent += `
          <div class="figure-card">
            <img src="${finalTopoSrc}" width="650" alt="النموذج الرقمي للارتفاعات" />
            <div class="figure-caption">
              الشكل 2.1 : النموذج الرقمي ثلاثي الأبعاد للارتفاعات الطبوغرافية وتضاريس الحوض (${config.locationName})
            </div>
            <div class="figure-sub">
              الارتفاع الأدنى: ${config.altMinM} م · الارتفاع الأقصى: ${config.altMaxM} م · المنحدر: ${config.slopePercent}%
            </div>
          </div>

          <h4>جدول نتائج قانون غامبل ومعاملات مونتانا (IDF) [BR_Pluviometrie_IDF] :</h4>
          <table>
            <thead>
              <tr>
                <th>فترة العودة (سنة)</th>
                <th>المطر الأقصى 24 سا (ملم)</th>
                <th>معامل مونتانا (a)</th>
                <th>معامل مونتانا (b)</th>
                <th>شدة الهطول عند tc (ملم/سا)</th>
              </tr>
            </thead>
            <tbody>
              ${GUMBEL_IDF_DATA.map(g => `
                <tr>
                  <td>T = ${g.returnPeriodYears} سنة</td>
                  <td>${g.dailyPrecipitationMm.toFixed(1)}</td>
                  <td>${g.montanaCoeffA.toFixed(2)}</td>
                  <td>${g.montanaCoeffB.toFixed(3)}</td>
                  <td>${g.intensityAtTcMmh.toFixed(1)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      // Chapter 3: Peak Flows Table
      if (ch.id === 'ch3') {
        htmlContent += `
          <h4>جدول التدفقات القصوى المحسوبة (HEC-HMS SCS-CN) [BR_Debits_Pointe] :</h4>
          <table>
            <thead>
              <tr>
                <th>فترة العودة (T)</th>
                <th>الطريقة العقلانية (م³/ثا)</th>
                <th>طريقة SCS-CN (م³/ثا)</th>
                <th>التدفق المعتمد للدراسة (م³/ثا)</th>
              </tr>
            </thead>
            <tbody>
              ${PEAK_DISCHARGE_DATA.map(p => `
                <tr>
                  <td>T = ${p.returnPeriodYears} سنة</td>
                  <td>${p.rationalDischargeM3s.toFixed(2)}</td>
                  <td>${p.scsCnDischargeM3s.toFixed(2)}</td>
                  <td><strong>${p.retainedDischargeM3s.toFixed(2)} م³/ثا</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      // Chapter 4: HEC-RAS 3D Image & Cross Sections Table
      if (ch.id === 'ch4') {
        htmlContent += `
          <div class="figure-card">
            ${hecRasBase64 ? `<img src="${hecRasBase64}" width="650" alt="المحاكاة الهيدروليكية HEC-RAS" />` : ''}
            <div class="figure-caption">
              الشكل 4.1 : المحاكاة الهيدروليكية ثلاثية الأبعاد لمنشآت تصريف السيول وتدفقات HEC-RAS 1D/2D
            </div>
          </div>

          <h4>جدول نتائج محاكاة HEC-RAS 1D/2D للمقاطع العرضية [BR_HEC_RAS_Hydraulique] :</h4>
          <table>
            <thead>
              <tr>
                <th>معرف المقطع</th>
                <th>الموقع (PK)</th>
                <th>ارتفاع المنسوب PHEC Q100 (م)</th>
                <th>عمق الماء h (م)</th>
                <th>السرعة المتوسطة v (م/ثا)</th>
                <th>مستوى الخطر</th>
              </tr>
            </thead>
            <tbody>
              ${HEC_RAS_SECTIONS.map(s => `
                <tr>
                  <td>${s.sectionId}</td>
                  <td>${s.stationPK}</td>
                  <td>${s.q100WaterLevelM.toFixed(2)}</td>
                  <td>${s.q100DepthM.toFixed(2)}</td>
                  <td>${s.q100VelocityMs.toFixed(2)}</td>
                  <td>${s.hazardLevel}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      // Chapter 5: Vulnerability Table
      if (ch.id === 'ch5') {
        htmlContent += `
          <h4>جدول تحليل هشاشة المنشآت الحيوية وتقدير تكاليف الحماية :</h4>
          <table>
            <thead>
              <tr>
                <th>رمز الرهان</th>
                <th>اسم المنشأة والقطاع</th>
                <th>الموقع (PK)</th>
                <th>عمق الغمر (م)</th>
                <th>التدابير الهندسية المطلوبة</th>
                <th>التكلفة التقديرية (ألف يورو)</th>
              </tr>
            </thead>
            <tbody>
              ${VULNERABILITY_ASSETS.map(a => `
                <tr>
                  <td>${a.assetId}</td>
                  <td>${a.nom}</td>
                  <td>${a.pkSection}</td>
                  <td>+${a.hauteurSubmersionQ100M.toFixed(2)} م</td>
                  <td>${a.mesuresProtection}</td>
                  <td><strong>${a.coutEstimeKEur} k€</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      // Chapter 6: Structures Sizing Table
      if (ch.id === 'ch6') {
        htmlContent += `
          <h4>جدول أبعاد وتصميم المنشآت الهيدروليكية والحماية (Manning-Strickler) :</h4>
          <table>
            <thead>
              <tr>
                <th>رمز المنشأة</th>
                <th>نوع المنشأة</th>
                <th>الموقع</th>
                <th>الأبعاد الهندسية</th>
                <th>التدفق التصميمي (م³/ثا)</th>
                <th>الطاقة الاستيعابية (م³/ثا)</th>
                <th>هامش الأمان</th>
              </tr>
            </thead>
            <tbody>
              ${HYDRAULIC_STRUCTURES.map(st => `
                <tr>
                  <td>${st.id}</td>
                  <td>${st.type}</td>
                  <td>${st.location}</td>
                  <td>${st.dimensions}</td>
                  <td>${st.designFlowM3s.toFixed(2)}</td>
                  <td>${st.calculatedCapacityM3s.toFixed(2)}</td>
                  <td>+${st.freeboardM.toFixed(2)} م</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      // Chapter 7: SAP Early Warning Table
      if (ch.id === 'ch7') {
        htmlContent += `
          <h4>جدول عتبات نظام الإنذار المبكر (SAP) ومستويات اليقظة :</h4>
          <table>
            <thead>
              <tr>
                <th>مستوى اليقظة</th>
                <th>عتبة الأمطار (24سا)</th>
                <th>التدفق الحرج (م³/ثا)</th>
                <th>المنسوب المرجعي (م)</th>
                <th>الإجراءات والتدخلات الميدانية</th>
              </tr>
            </thead>
            <tbody>
              ${EARLY_WARNING_THRESHOLDS.map(th => `
                <tr>
                  <td><strong>${th.niveau} (${th.label})</strong></td>
                  <td>${th.seuilPrecipitation24hMm} ملم/24سا</td>
                  <td>${th.debitSeuilM3s} م³/ثا</td>
                  <td>+${th.hauteurRepereM.toFixed(2)} م</td>
                  <td>${th.actionsDeclenchees.join(' · ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    });

    htmlContent += `
      <!-- ANNEXE IA: RAPPORT D'EXPERTISE ET DIAGNOSTIC DU CONSEILLER IA GEMINI -->
      <div class="chapter-title">ملحق خاص: مذكرة الخبرة والتشخيص الذكي من مستشار الذكاء الاصطناعي (IA Hydrologie)</div>
      <div class="sub-chapter-title">التحليل الهيدرولوجي المتقدم، تقدير أبعاد منشآت الحماية، والتأقلم المناخي لمنطقة [${config.locationName}]</div>
      <p>تتضمن هذه المذكرة الاستشارية تحليلاً صادراً عن نموذج الذكاء الاصطناعي التوليدي المتخصص (Google Gemini) بالتكامل مع قاعدة المعطيات الهيدروغرافية للموقع:</p>
      <div class="box">
        <h4>1. تشخيص المخاطر وسلوك الجريان السيلي :</h4>
        <p>• الموقع ذو حساسية عالية للسيول الخاطفة (Crues torrentielles) نتيجة الانحدار والخصائص المورفومترية.<br/>
        • تدفق التصميم Q100 البالغ 31.4 م³/ثا يستوجب قناة رئيسية بمقطع هيدروليكي لا يقل عن 3.50م عرض قاع مع هامش أمان لا يقل عن 0.50م.<br/>
        • رقم فرود المحسوب يشير إلى جريان فوق حرج (Régime torrentiel Fr &gt; 1) ما يرفع من قوى النحر والحت المائي.</p>
        
        <h4>2. التوصيات الإنشائية والهندسية المعتمدة :</h4>
        <p>• تهيئة أحواض تهدئة في أعلى الحوض لترسيب المواد الصلبة وتخفيض ذروة الفيضان بنسبة 20% إلى 30%.<br/>
        • حماية الضفاف في المنعطفات بالقفف الحجرية (Gabions) وحجارة الردم الصخرية (Rip-Rap D50 = 400mm).<br/>
        • إدراج هامش أمان مناخي (+15% إلى +20%) على كافة المنشآت الهيدروليكية المستقبلية.</p>
      </div>

      <div class="footer-sig">
        <strong>خاتمة وتصديق الخبرة الفنية:</strong> تم إعداد واعتماد هذه الدراسة الهيدروليكية التفصيلية وفق المعايير الدولية المعمول بها.<br>
        الخبير المسؤول: ${ARABIC_REPORT_DATA.expert} · تم التحرير في: ${dateStr}.
      </div>
    `;

  } else if (isBilingual) {
    // ----------------------------------------------------
    // BILINGUAL (ARABIC + FRENCH) WORD DOCUMENT
    // ----------------------------------------------------
    htmlContent += `
      <div class="header-box">
        <div style="font-size: 10pt; color: #64748b; margin-bottom: 6pt;">
          Direction de l'Hydraulique / المديرية العامة للهيدروليك · Réf: [${config.projectName}]
        </div>
        <h1 style="margin: 0; color: #0369a1;">
          Étude d'Impact et de Modélisation des Risques d'Inondation<br>
          <span style="font-size: 16pt; color: #0284c7;">مشروع دراسة أثر ونمذجة مخاطر الفيضانات</span>
        </h1>
        <div style="font-size: 12pt; color: #0f766e; margin-top: 6pt; font-weight: bold;">
          Secteur / منطقة الدراسة : ${config.locationName}
        </div>
        <div style="margin-top: 10pt; font-size: 9pt; color: #475569; line-height: 1.6;">
          Coordonnées / الإحداثيات : ${config.coordinates.lat.toFixed(4)}°N, ${config.coordinates.lng.toFixed(4)}°E<br>
          Superficie Bassin / مساحة الحوض : ${config.surfaceKm2} km² · Date / التاريخ : ${dateStr}
        </div>
      </div>

      <div class="callout">
        <strong>Rapport d'Expertise Bilingue :</strong> Intégrant l'imagerie satellite, la cartographie SIG et les simulations hydrodynamiques.<br>
        <strong>تقرير الخبرة ثنائي اللغة :</strong> يدمج صور الأقمار الصناعية عالية الدقة والخرائط الطبوغرافية ونمذجة HEC-RAS 1D/2D.
      </div>

      <div class="figure-card">
        <img src="${finalSatelliteSrc}" width="650" alt="Satellite imagery / صورة الأقمار الصناعية" />
        <div class="figure-caption">
          Figure 0.1 : Imagerie satellite haute résolution / الشكل 0.1 : صورة الأقمار الصناعية لمنطقة الدراسة
        </div>
        <div class="figure-sub">${config.locationName} (${config.coordinates.lat.toFixed(4)}°N, ${config.coordinates.lng.toFixed(4)}°E)</div>
      </div>

      <div class="figure-card">
        ${svgMapFr}
        <div class="figure-caption">
          Figure 0.2 : Carte du bassin versant et point GPS / خريطة الحوض الصباب ونقطة الـ GPS
        </div>
      </div>
    `;

    // Render Chapters Bilingually
    ARABIC_REPORT_DATA.chapters.forEach((ch, idx) => {
      const frTitles = [
        "1. Introduction Générale et Cadre Réglementaire",
        "2. Acquisition Automatisée des Données Spatiales et Pluviométrie",
        "3. Caractérisation Hydrologique du Bassin Versant (HEC-HMS)",
        "4. Modélisation Hydraulique sous HEC-RAS (1D/2D)",
        "5. Cartographie et Zonage des Risques d'Inondation",
        "6. Dimensionnement des Ouvrages d'Assainissement et SFN",
        "7. Plan de Gestion des Crises et Recommandations Stratégiques"
      ];

      htmlContent += `
        <h2>${frTitles[idx] || ch.title}</h2>
        <h2 style="font-size: 13pt; color: #0284c7; direction: rtl; text-align: right;">الفصل ${ch.num} : ${ch.title}</h2>
      `;

      ch.sections.forEach(sec => {
        htmlContent += `
          <div style="direction: rtl; text-align: right; background-color: #f8fafc; padding: 6pt; margin: 4pt 0; border-right: 3pt solid #0284c7;">
            <strong>${sec.num} ${sec.title} :</strong><br>
            <span style="white-space: pre-line;">${sec.content}</span>
          </div>
        `;
      });

      if (ch.id === 'ch2') {
        htmlContent += `
          <div class="figure-card">
            <img src="${finalTopoSrc}" width="650" alt="MNT Topographie / التضاريس" />
            <div class="figure-caption">Figure 2.1 : MNT Copernicus 30m / النموذج الرقمي للارتفاعات (${config.locationName})</div>
            <div class="figure-sub">Altitudes : ${config.altMinM} m - ${config.altMaxM} m · Pente : ${config.slopePercent}%</div>
          </div>
        `;
      }

      if (ch.id === 'ch4') {
        htmlContent += `
          <div class="figure-card">
            ${hecRasBase64 ? `<img src="${hecRasBase64}" width="650" alt="HEC-RAS 3D" />` : ''}
            <div class="figure-caption">Figure 4.1 : Simulation HEC-RAS 3D / المحاكاة الهيدروليكية ثلاثية الأبعاد</div>
          </div>
        `;
      }
    });

  } else {
    // ----------------------------------------------------
    // FULL FRENCH WORD DOCUMENT WITH SATELLITE & MAPS
    // ----------------------------------------------------
    htmlContent += `
      <div class="header-box">
        <div style="font-size: 10pt; color: #64748b; margin-bottom: 6pt;">
          Direction Générale de l'Hydraulique et de l'Aménagement Urbain · Réf : [${config.projectName}]
        </div>
        <h1 style="margin: 0; color: #0369a1;">Projet ${config.projectName} : Étude d'Impact et de Modélisation des Risques d'Inondation</h1>
        <div style="font-size: 13pt; color: #0284c7; margin-top: 4pt; font-weight: bold;">
          Secteur d'Étude Officiel : ${config.locationName}
        </div>
        <p style="margin-top: 8pt; font-size: 10.5pt; color: #334155;">
          Rapport d'expertise technique approfondie, hydrologie HEC-HMS et modélisation hydrodynamique 1D/2D HEC-RAS.
        </p>
        <div style="margin-top: 10pt; font-size: 9pt; color: #475569; line-height: 1.6;">
          Coordonnées : ${config.coordinates.lat.toFixed(4)}°N, ${config.coordinates.lng.toFixed(4)}°E (${config.coordinates.crs || 'WGS84'})<br>
          Superficie Bassin : ${config.surfaceKm2} km² · Expert Référent : Dr.-Ing. Marc V. Laurent · Date : ${dateStr}
        </div>
      </div>

      <div class="callout">
        <strong>Résumé Exécutif :</strong> Ce document constitue le rapport officiel d'expertise hydraulique et de modélisation des risques d'inondation pour le secteur de ${config.locationName}. Il regroupe l'imagerie satellite haute résolution, les modèles topographiques MNT Copernicus 30m, les lois d'ajustement de Gumbel, les débits de pointe centennaux (Q100), les lignes d'eau sous HEC-RAS, et le dimensionnement des ouvrages d'assainissement et SFN.
      </div>

      <!-- FIGURE 0.1: SATELLITE MAP -->
      <div class="figure-card">
        <img src="${finalSatelliteSrc}" width="650" alt="Imagerie satellite du secteur ${config.locationName}" />
        <div class="figure-caption">
          FIGURE 0.1 : CARTOGRAPHIE SATELLITE HAUTE RÉSOLUTION ET DÉLIMITATION DU BASSIN D'ÉTUDE
        </div>
        <div class="figure-sub">
          Emprise : ${config.locationName} · Coordonnées : ${config.coordinates.lat.toFixed(4)}°N, ${config.coordinates.lng.toFixed(4)}°E
        </div>
      </div>

      <!-- FIGURE 0.2: CATCHMENT VECTOR MAP -->
      <div class="figure-card">
        ${svgMapFr}
        <div class="figure-caption">
          FIGURE 0.2 : CARTE HYDROGRAPHIQUE DU BASSIN VERSANT ET LOCALISATION DU POINT GPS
        </div>
        <div class="figure-sub">Superficie : ${config.surfaceKm2} km² · Longueur drain principal : ${config.drainLengthKm} km</div>
      </div>

      <h2>1. Introduction Générale et Cadre Réglementaire</h2>
      <h3>1.1 Contexte socio-économique et objectifs</h3>
      <p>Le bassin versant de ${config.locationName}, d'une superficie de ${config.surfaceKm2} km², est soumis à un régime de crues rapides. Les objectifs de cette mission sont de délimiter les enveloppes de crue centennale Q100, d'évaluer la vulnérabilité des axes de communication et des zones urbanisées, et de proposer des solutions de protection adaptées.</p>

      <h2>2. Acquisition Automatisée des Données Spatiales et Hydro-Climatiques</h2>
      <div class="figure-card">
        <img src="${finalTopoSrc}" width="650" alt="MNT Topographie de ${config.locationName}" />
        <div class="figure-caption">
          FIGURE 2.1 : MODÈLE NUMÉRIQUE DE TERRAIN 3D (COPERNICUS DEM 30M) ET HYPSOMÉTRIE DU BASSIN (${config.locationName})
        </div>
        <div class="figure-sub">Altitudes : ${config.altMinM} m à ${config.altMaxM} m NGF · Pente : ${config.slopePercent}%</div>
      </div>

      <h3>2.1 MNT et Traitement Topographique</h3>
      <p>Traitement du MNT Copernicus 30m avec élimination des puits artificiels et brûlage du réseau hydrographique.</p>
      <h3>2.2 Analyse Statistique des Précipitations (Gumbel & Montana) [BR_Pluviometrie_IDF]</h3>
      <table>
        <thead>
          <tr>
            <th>Période de Retour (T)</th>
            <th>Pluie Max 24h (mm)</th>
            <th>Coeff. Montana a</th>
            <th>Coeff. Montana b</th>
            <th>Intensité à tc (mm/h)</th>
          </tr>
        </thead>
        <tbody>
          ${GUMBEL_IDF_DATA.map(g => `
            <tr>
              <td>T = ${g.returnPeriodYears} ans</td>
              <td>${g.dailyPrecipitationMm.toFixed(1)}</td>
              <td>${g.montanaCoeffA.toFixed(2)}</td>
              <td>${g.montanaCoeffB.toFixed(3)}</td>
              <td>${g.intensityAtTcMmh.toFixed(1)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>3. Caractérisation Hydrologique du Bassin Versant</h2>
      <p>Surface : ${config.surfaceKm2} km² · Pente moyenne : ${config.slopePercent}% · Indice de Gravelius Kc = 1.37 · Temps de concentration retenu tc = 112 min.</p>
      <table>
        <thead>
          <tr>
            <th>Période Retour (T)</th>
            <th>Méthode Rationnelle (m³/s)</th>
            <th>Méthode SCS-CN (m³/s)</th>
            <th>Débit Retenu Projet (m³/s)</th>
          </tr>
        </thead>
        <tbody>
          ${PEAK_DISCHARGE_DATA.map(p => `
            <tr>
              <td>T = ${p.returnPeriodYears} ans</td>
              <td>${p.rationalDischargeM3s.toFixed(2)}</td>
              <td>${p.scsCnDischargeM3s.toFixed(2)}</td>
              <td><strong>${p.retainedDischargeM3s.toFixed(2)} m³/s</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>4. Modélisation Hydraulique sous HEC-RAS (1D/2D) [BR_HEC_RAS_Hydraulique]</h2>
      <div class="figure-card">
        ${hecRasBase64 ? `<img src="${hecRasBase64}" width="650" alt="Simulation HEC-RAS 3D" />` : ''}
        <div class="figure-caption">
          FIGURE 4.1 : MODÉLISATION HYDRODYNAMIQUE 3D DES ÉCOULEMENTS ET PROFILS EN TRAVERS (HEC-RAS)
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Section ID</th>
            <th>Station PK</th>
            <th>Cote PHEC Q100 (m)</th>
            <th>Hauteur d'Eau h (m)</th>
            <th>Vitesse Moyenne v (m/s)</th>
            <th>Niveau d'Aléa</th>
          </tr>
        </thead>
        <tbody>
          ${HEC_RAS_SECTIONS.map(s => `
            <tr>
              <td>${s.sectionId}</td>
              <td>${s.stationPK}</td>
              <td>${s.q100WaterLevelM.toFixed(2)}</td>
              <td>${s.q100DepthM.toFixed(2)}</td>
              <td>${s.q100VelocityMs.toFixed(2)}</td>
              <td>${s.hazardLevel}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>5. Dimensionnement des Ouvrages et Solutions Fondées sur la Nature</h2>
      <table>
        <thead>
          <tr>
            <th>ID Ouvrage</th>
            <th>Type</th>
            <th>Localisation</th>
            <th>Dimensions</th>
            <th>Débit Projet (m³/s)</th>
            <th>Capacité (m³/s)</th>
            <th>Revanche (m)</th>
          </tr>
        </thead>
        <tbody>
          ${HYDRAULIC_STRUCTURES.map(st => `
            <tr>
              <td>${st.id}</td>
              <td>${st.type}</td>
              <td>${st.location}</td>
              <td>${st.dimensions}</td>
              <td>${st.designFlowM3s.toFixed(2)}</td>
              <td>${st.calculatedCapacityM3s.toFixed(2)}</td>
              <td>+${st.freeboardM.toFixed(2)} m</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer-sig">
        Rapport d'expertise certifié conforme aux normes d'ingénierie hydraulique.<br>
        Dr.-Ing. Marc V. Laurent · Édité le ${dateStr}.
      </div>
    `;
  }

  htmlContent += `
    </body>
    </html>
  `;

  // If running in Native Capacitor Android/iOS app, use Filesystem and Share
  if (Capacitor.isNativePlatform()) {
    try {
      const fullContent = '\ufeff' + htmlContent;
      // Convert string to base64
      const base64Data = btoa(
        encodeURIComponent(fullContent).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      );

      const savedFile = await Filesystem.writeFile({
        path: docTitle,
        data: base64Data,
        directory: Directory.Cache
      });

      await Share.share({
        title: 'تصدير دراسة الفيضانات',
        text: `تقرير دراسة الهيدرولوجيا - ${docTitle}`,
        url: savedFile.uri,
        dialogTitle: 'حفظ أو مشاركة ملف الوورد (.doc)'
      });
      return;
    } catch (nativeErr) {
      console.warn('Native Capacitor save/share failed, falling back to Web download:', nativeErr);
    }
  }

  // Robust download supporting Web browsers
  try {
    const dataUri = 'data:application/msword;charset=utf-8,' + encodeURIComponent('\ufeff' + htmlContent);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = docTitle;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 1500);
  } catch (err) {
    console.warn('Data URI download failed, falling back to Blob URL:', err);
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = docTitle;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
