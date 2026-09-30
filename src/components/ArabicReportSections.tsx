import React from 'react';
import {
  ShieldAlert,
  Droplets,
  Layers,
  Activity,
  Calculator,
  AlertTriangle,
  Building,
  CheckCircle2,
  Table,
  FileSpreadsheet
} from 'lucide-react';
import { ARABIC_REPORT_DATA } from '../data/arabicReportContent';
import {
  GUMBEL_IDF_DATA,
  PEAK_DISCHARGE_DATA,
  HEC_RAS_SECTIONS,
  HYDRAULIC_STRUCTURES,
  VULNERABILITY_ASSETS,
  EARLY_WARNING_THRESHOLDS
} from '../data/projectData';
import { ProjectLocationConfig } from '../types/hydrology';
import {
  getRealSatelliteImageUrl,
  getRealTopoImageUrl,
  generateStudyWatershedSvg,
  generateStudyDemProfileSvg
} from '../utils/satelliteImagery';

interface ArabicReportSectionsProps {
  locationConfig: ProjectLocationConfig;
}

export const ArabicReportSections: React.FC<ArabicReportSectionsProps> = ({ locationConfig }) => {
  return (
    <div className="space-y-10 text-right font-sans" dir="rtl">
      {ARABIC_REPORT_DATA.chapters.map((ch) => (
        <section
          key={ch.id}
          id={ch.id}
          className="border-t border-slate-800 pt-8 space-y-6"
        >
          {/* Chapter Title Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm border border-cyan-500/30 shrink-0">
              0{ch.num}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              الفصل {ch.num} : {ch.title}
            </h2>
          </div>

          {/* Chapter Sections */}
          <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
            {ch.sections.map((sec, sIdx) => (
              <div key={sIdx} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-3">
                <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
                  <span className="font-mono text-cyan-400 text-xs px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                    {sec.num}
                  </span>
                  <span>{sec.title}</span>
                </h3>
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {sec.content}
                </div>
              </div>
            ))}
          </div>

          {/* Embedded Visual Figures & Data Tables per Chapter */}

          {/* Chapter 1: Real Satellite Imagery & Vector Hydrographic Map */}
          {ch.id === 'ch1' && (
            <div className="space-y-6 mt-6">
              {/* Real Satellite Orthophoto */}
              <div className="border border-slate-800 bg-slate-950 rounded-2xl overflow-hidden shadow-xl">
                <div className="relative">
                  <img
                    src={getRealSatelliteImageUrl(locationConfig.coordinates.lat, locationConfig.coordinates.lng, 'medium')}
                    alt={`صورة الأقمار الصناعية لمنطقة ${locationConfig.locationName}`}
                    className="w-full h-72 sm:h-96 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 shadow-xl flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>🛰️ صورة الأقمار الصناعية الحقيقية (ESRI / World Imagery) · {locationConfig.locationName}</span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200 font-mono">
                    <span>الشكل 1.1 : تصوير فضائي عالي الدقة لمنطقة ومجرى {locationConfig.locationName}</span>
                    <span>الإحداثيات : {locationConfig.coordinates.lat.toFixed(4)}°N , {locationConfig.coordinates.lng.toFixed(4)}°E</span>
                  </div>
                </div>
              </div>

              {/* Vector Map */}
              <div className="border border-slate-800 bg-slate-950/80 rounded-2xl p-4 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold pb-2 border-b border-slate-800">
                  <span>الشكل 1.2 : المخطط الهيدروغرافي للحوض الصباب وحرم الفيضان المئوي Q100</span>
                  <span>المساحة : {locationConfig.surfaceKm2} كم²</span>
                </div>
                <div dangerouslySetInnerHTML={{ __html: generateStudyWatershedSvg(locationConfig, true) }} />
              </div>
            </div>
          )}

          {/* Chapter 2: Topographic Relief & Gumbel IDF Table */}
          {ch.id === 'ch2' && (
            <div className="space-y-6 mt-6">
              {/* Real Topographic Relief */}
              <div className="border border-slate-800 bg-slate-950 rounded-2xl overflow-hidden shadow-xl">
                <div className="relative">
                  <img
                    src={getRealTopoImageUrl(locationConfig.coordinates.lat, locationConfig.coordinates.lng, 'medium')}
                    alt={`الخريطة الطبوغرافية لمنطقة ${locationConfig.locationName}`}
                    className="w-full h-72 sm:h-80 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 shadow-xl">
                    🗺️ الخريطة الطبوغرافية الرقمية (Topographic Relief) · {locationConfig.locationName}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200 font-mono">
                    <span>الشكل 2.1 : نموذج الارتفاعات الرقمية وتضاريس الحوض</span>
                    <span>الارتفاع : {locationConfig.altMinM} م إلى {locationConfig.altMaxM} م (المنحدر : {locationConfig.slopePercent}%)</span>
                  </div>
                </div>
              </div>

              {/* DEM Long Profile */}
              <div className="border border-slate-800 bg-slate-950/80 rounded-2xl p-4 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold pb-2 border-b border-slate-800">
                  <span>الشكل 2.2 : المقطع الطولي لطبوغرافيا المجرى الرئيسي</span>
                  <span>طول المجرى : {locationConfig.drainLengthKm} كم</span>
                </div>
                <div dangerouslySetInnerHTML={{ __html: generateStudyDemProfileSvg(locationConfig, true) }} />
              </div>
            <div className="mt-6 border border-slate-800 bg-slate-950/70 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                  <Table className="w-4 h-4" />
                  <span>جدول البيانات المطرية ومنحنيات IDF غامبل [BR_Pluviometrie_IDF]</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">مهيأ لـ Looker Studio</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-200 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/80 text-cyan-300">
                      <th className="py-2.5 px-3 text-right">فترة العودة (سنة)</th>
                      <th className="py-2.5 px-3 text-right">المطر الأقصى 24سا (ملم)</th>
                      <th className="py-2.5 px-3 text-right">معامل مونتانا (a)</th>
                      <th className="py-2.5 px-3 text-right">معامل مونتانا (b)</th>
                      <th className="py-2.5 px-3 text-right">الشدة عند زمن التركيز (ملم/سا)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {GUMBEL_IDF_DATA.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-bold text-white">T = {item.returnPeriodYears} سنة</td>
                        <td className="py-2 px-3">{item.dailyPrecipitationMm.toFixed(1)} ملم</td>
                        <td className="py-2 px-3 text-cyan-400">{item.montanaCoeffA.toFixed(2)}</td>
                        <td className="py-2 px-3 text-cyan-400">{item.montanaCoeffB.toFixed(3)}</td>
                        <td className="py-2 px-3 font-bold text-emerald-400">{item.intensityAtTcMmh.toFixed(1)} ملم/سا</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          )}

          {/* Chapter 3: Peak Discharge Table */}
          {ch.id === 'ch3' && (
            <div className="mt-6 border border-slate-800 bg-slate-950/70 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                  <Droplets className="w-4 h-4" />
                  <span>جدول تدفقات الذروة المحسوبة (HEC-HMS SCS-CN) [BR_Debits_Pointe]</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">مهيأ لـ Looker Studio</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-200 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/80 text-cyan-300">
                      <th className="py-2.5 px-3 text-right">فترة العودة (T)</th>
                      <th className="py-2.5 px-3 text-right">الطريقة العقلانية (م³/ثا)</th>
                      <th className="py-2.5 px-3 text-right">طريقة SCS-CN (م³/ثا)</th>
                      <th className="py-2.5 px-3 text-right">التدفق المعتمد للدراسة (م³/ثا)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {PEAK_DISCHARGE_DATA.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-bold text-white">T = {item.returnPeriodYears} سنة</td>
                        <td className="py-2 px-3">{item.rationalDischargeM3s.toFixed(2)}</td>
                        <td className="py-2 px-3">{item.scsCnDischargeM3s.toFixed(2)}</td>
                        <td className="py-2 px-3 font-bold text-cyan-300">{item.retainedDischargeM3s.toFixed(2)} م³/ثا</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Chapter 4: HEC-RAS Cross Sections */}
          {ch.id === 'ch4' && (
            <div className="mt-6 border border-slate-800 bg-slate-950/70 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                  <Activity className="w-4 h-4" />
                  <span>نتائج محاكاة المقاطع العرضية ببرنامج HEC-RAS 1D/2D [BR_HEC_RAS_Hydraulique]</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">11 مقطعاً هيدروليكياً</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-200 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/80 text-cyan-300">
                      <th className="py-2.5 px-3 text-right">معرف المقطع</th>
                      <th className="py-2.5 px-3 text-right">الموقع (PK)</th>
                      <th className="py-2.5 px-3 text-right">ارتفاع المنسوب PHEC (م)</th>
                      <th className="py-2.5 px-3 text-right">عمق الماء h (م)</th>
                      <th className="py-2.5 px-3 text-right">السرعة v (م/ثا)</th>
                      <th className="py-2.5 px-3 text-right">مستوى الخطر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {HEC_RAS_SECTIONS.map((sec, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-bold text-white">{sec.sectionId}</td>
                        <td className="py-2 px-3">{sec.stationPK}</td>
                        <td className="py-2 px-3 text-cyan-300">{sec.q100WaterLevelM.toFixed(2)} م</td>
                        <td className="py-2 px-3 text-amber-300">{sec.q100DepthM.toFixed(2)} م</td>
                        <td className="py-2 px-3">{sec.q100VelocityMs.toFixed(2)} م/ثا</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sec.hazardLevel.includes('Fort')
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : sec.hazardLevel.includes('Moyen')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {sec.hazardLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Chapter 5: Vulnerability of Critical Assets */}
          {ch.id === 'ch5' && (
            <div className="mt-6 border border-slate-800 bg-slate-950/70 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                  <Building className="w-4 h-4" />
                  <span>جرد المنشآت الحيوية المعرضة للخطر وتكاليف الحماية التقديرية</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">المجموع: 5,500 k€</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-200 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/80 text-cyan-300">
                      <th className="py-2.5 px-3 text-right">الرمز</th>
                      <th className="py-2.5 px-3 text-right">اسم المنشأة والرهان</th>
                      <th className="py-2.5 px-3 text-right">الموقع</th>
                      <th className="py-2.5 px-3 text-right">عمق الغمر</th>
                      <th className="py-2.5 px-3 text-right">التدابير الهندسية المقترحة</th>
                      <th className="py-2.5 px-3 text-right">التكلفة التقديرية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {VULNERABILITY_ASSETS.map((asset, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-mono font-bold text-cyan-400">{asset.assetId}</td>
                        <td className="py-2 px-3 font-semibold text-white">{asset.nom}</td>
                        <td className="py-2 px-3 font-mono text-slate-400">{asset.pkSection}</td>
                        <td className="py-2 px-3 font-mono text-rose-400">+{asset.hauteurSubmersionQ100M.toFixed(2)} م</td>
                        <td className="py-2 px-3 text-slate-300">{asset.mesuresProtection}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-400">{asset.coutEstimeKEur} ألف يورو</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Chapter 6: Sizing of Civil Works & NBS */}
          {ch.id === 'ch6' && (
            <div className="mt-6 border border-slate-800 bg-slate-950/70 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                  <Calculator className="w-4 h-4" />
                  <span>جدول الأبعاد الهندسية للمنشآت المقترحة (Manning-Strickler)</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">أبعاد مطابقة للمواصفات</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-200 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/80 text-cyan-300">
                      <th className="py-2.5 px-3 text-right">الرمز</th>
                      <th className="py-2.5 px-3 text-right">نوع المنشأة</th>
                      <th className="py-2.5 px-3 text-right">الموقع</th>
                      <th className="py-2.5 px-3 text-right">الأبعاد الهندسية</th>
                      <th className="py-2.5 px-3 text-right">التدفق التصميمي</th>
                      <th className="py-2.5 px-3 text-right">طاقة الاستيعاب</th>
                      <th className="py-2.5 px-3 text-right">هامش الأمان</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {HYDRAULIC_STRUCTURES.map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-bold text-white">{st.id}</td>
                        <td className="py-2 px-3 font-sans text-cyan-300">{st.type}</td>
                        <td className="py-2 px-3">{st.location}</td>
                        <td className="py-2 px-3">{st.dimensions}</td>
                        <td className="py-2 px-3">{st.designFlowM3s.toFixed(2)} م³/ثا</td>
                        <td className="py-2 px-3 font-bold text-emerald-400">{st.calculatedCapacityM3s.toFixed(2)} م³/ثا</td>
                        <td className="py-2 px-3 text-cyan-400">+{st.freeboardM.toFixed(2)} م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Chapter 7: Early Warning System Thresholds */}
          {ch.id === 'ch7' && (
            <div className="mt-6 border border-slate-800 bg-slate-950/70 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>عتبات نظام الإنذار المبكر ومستويات اليقظة العملياتية (SAP)</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">4 مستويات يقظة</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-200 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/80 text-cyan-300">
                      <th className="py-2.5 px-3 text-right">مستوى اليقظة</th>
                      <th className="py-2.5 px-3 text-right">عتبة الأمطار 24سا</th>
                      <th className="py-2.5 px-3 text-right">التدفق الحرج</th>
                      <th className="py-2.5 px-3 text-right">زمن الاستجابة</th>
                      <th className="py-2.5 px-3 text-right">الإجراءات والتدخلات الميدانية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {EARLY_WARNING_THRESHOLDS.map((th, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold">
                          <span
                            className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                              th.niveau === 'ROUGE'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : th.niveau === 'ORANGE'
                                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                                : th.niveau === 'JAUNE'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {th.niveau} ({th.label})
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono">{th.seuilPrecipitation24hMm} ملم/24سا</td>
                        <td className="py-2 px-3 font-mono">{th.debitSeuilM3s} م³/ثا</td>
                        <td className="py-2 px-3 font-mono">+{th.hauteurRepereM.toFixed(2)} م</td>
                        <td className="py-2 px-3 text-slate-300 text-xs">{th.actionsDeclenchees.join(' · ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
};
