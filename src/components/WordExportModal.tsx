import React, { useState } from 'react';
import { FileText, Download, Check, X, Globe, Sparkles, ShieldCheck, Loader2, Image as ImageIcon } from 'lucide-react';
import { ProjectLocationConfig } from '../types/hydrology';
import { exportStudyToWord } from '../utils/wordExport';

interface WordExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProjectLocationConfig;
  defaultLang?: 'ar' | 'fr';
}

export const WordExportModal: React.FC<WordExportModalProps> = ({
  isOpen,
  onClose,
  config,
  defaultLang = 'ar'
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'ar' | 'fr' | 'bilingual'>(defaultLang);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExported, setIsExported] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await exportStudyToWord(selectedFormat, config);
      setIsExported(true);
      setTimeout(() => {
        setIsExported(false);
      }, 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                تصدير الدراسة بملف وورد (Microsoft Word .doc)
              </h3>
              <p className="text-xs text-slate-400">
                منطقة الدراسة: <span className="text-cyan-400 font-medium">{config.locationName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            اختر لغة المستند المراد تصديره. يتم إنشاء ملف Word مهيأ بجداول منسقة، ومعادلات هيدروليكية، ومتوافق بنسبة 100% مع <strong>Microsoft Word</strong> و <strong>Google Docs</strong> و <strong>LibreOffice</strong>:
          </p>

          {/* Language / Format Options */}
          <div className="grid grid-cols-1 gap-3">
            {/* Arabic Option */}
            <div
              onClick={() => setSelectedFormat('ar')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                selectedFormat === 'ar'
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              <div className="text-2xl shrink-0 mt-0.5">🇩🇿</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    تصدير الدراسة باللغة العربية (Word DOC - بالعربية)
                  </span>
                  {selectedFormat === 'ar' && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  تقرير تقني كامل باللغة العربية مع اتجاه من اليمين إلى اليسار (RTL)، يشمل الفصول الـ 7، جداول Looker Studio، وتفاصيل الحسابات وتوصيات إدارة الأزمات.
                </p>
              </div>
            </div>

            {/* French Option */}
            <div
              onClick={() => setSelectedFormat('fr')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                selectedFormat === 'fr'
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              <div className="text-2xl shrink-0 mt-0.5">🇫🇷</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    Rapport complet en Français (Word DOC - Français)
                  </span>
                  {selectedFormat === 'fr' && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Étude d'impact hydraulique complète selon les normes françaises et européennes (Directive 2007/60/CE, HEC-RAS 1D/2D, dimensionnement des ouvrages).
                </p>
              </div>
            </div>

            {/* Bilingual Option */}
            <div
              onClick={() => setSelectedFormat('bilingual')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                selectedFormat === 'bilingual'
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              <div className="text-2xl shrink-0 mt-0.5">🌐</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    دراسة ثنائية اللغة عربي / فرنسي (Word DOC - Bilingue)
                  </span>
                  {selectedFormat === 'bilingual' && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  تقرير خبرة دولي متكامل يدمج التحليلات التقنية بالعربية والفرنسية مع جداول مزدوجة العناوين.
                </p>
              </div>
            </div>
          </div>

          {/* Satellite Imagery Inclusion Badge */}
          <div className="p-3 bg-slate-950 border border-cyan-500/30 rounded-xl flex items-center gap-2.5 text-xs text-slate-300">
            <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="leading-tight">
              <span className="font-bold text-white block">مدمج تلقائياً بالملف :</span>
              <span className="text-slate-400 text-[11px]">
                صورة الأقمار الصناعية عالية الدقة لمنطقة الدراسة + خريطة الحوض الصباب ونقطة الـ GPS + نموذج التضاريس 3D DEM ومحاكاة HEC-RAS.
              </span>
            </div>
          </div>

          {/* AI Expertise Section Inclusion Badge */}
          <div className="p-3 bg-gradient-to-r from-indigo-950/60 to-slate-950 border border-indigo-500/40 rounded-xl flex items-center gap-2.5 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="leading-tight">
              <span className="font-bold text-white block">ملحق الذكاء الاصطناعي (Expertise IA Gemini) :</span>
              <span className="text-slate-400 text-[11px]">
                يحتوي ملف Word المصدر تلقائياً على ملحق الخبرة الفنية الهيدرولوجية، تشخيص المخاطر، وتوصيات الأبعاد الصادرة بالذكاء الاصطناعي.
              </span>
            </div>
          </div>

          {/* Success Banner */}
          {isExported && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                ✅ تم تنزيل ملف الوورد مدمجاً بصور الأقمار الصناعية والخرائط بنجاح! يمكنك فتحه ومشاركته الآن.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>صيغة Word الرسمية (.doc)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>جاري دمج صور الأقمار والتصدير...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>
                    {selectedFormat === 'ar'
                      ? 'تحميل وورد بالعربية (.doc)'
                      : selectedFormat === 'fr'
                      ? 'Télécharger Word en Français (.doc)'
                      : 'تحميل وورد ثنائي اللغة (.doc)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
