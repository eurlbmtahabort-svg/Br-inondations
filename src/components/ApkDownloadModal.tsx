import React, { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle2, Copy, ExternalLink, X, AlertCircle, Sparkles, Terminal, ArrowRight } from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'fr' | 'ar';
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose, language }) => {
  const isAr = language === 'ar';
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'pwa' | 'apk' | 'github'>('apk');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      // If native prompt isn't directly triggered, show instructions
      alert(isAr 
        ? "لتثبيت التطبيق على هاتفك:\n1. اضغط على خيارات المتصفح (⋮) في أعلى شاشة الهاتف.\n2. اختر 'تثبيت التطبيق' أو 'إضافة إلى الشاشة الرئيسية'."
        : "Pour installer l'application :\n1. Cliquez sur le menu du navigateur (⋮).\n2. Choisissez 'Installer l'application' ou 'Ajouter à l'écran d'accueil'."
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const gitPushCommand = "git push origin main";
  const repoUrl = "https://github.com/eurlbmtahabort-svg/Br-inondations";
  const actionsUrl = `${repoUrl}/actions`;
  const releasesUrl = `${repoUrl}/releases`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'تثبيت التطبيق وتنزيل بصيغة APK' : 'Installer l\'Application & Télécharger APK'}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Android
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'نظام دراسات الهيدرولوجيا ومكافحة الفيضانات - BMTahabort' : 'Système d\'Études Hydrologiques & Protection Inondations'}
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('apk')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              activeSubTab === 'apk'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تنزيل APK المباشر' : 'Télécharger APK'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('pwa')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              activeSubTab === 'pwa'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'تثبيت فوري على الهاتف (PWA)' : 'Installation Directe (PWA)'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('github')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              activeSubTab === 'github'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{isAr ? 'تحديث GitHub Actions' : 'Mise à jour GitHub'}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm text-slate-300">
          {activeSubTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-300">
                    {isAr ? 'تم تصحيح وتحديث ملف البناء التلقائي لـ APK بالكامل!' : 'Workflow de build APK corrigé avec succès !'}
                  </div>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    {isAr
                      ? 'تم حل مشكلة تراخيص أندرويد وتهيئة خادم البناء على GitHub ليقوم بتوليد ملف APK بصيغة جاهزة للتثبيت المباشر دون الحاجة لفك الضغط.'
                      : 'Les licences Android SDK et le pipeline GitHub Actions ont été optimisés pour générer directement le fichier APK installable.'}
                  </p>
                </div>
              </div>

              {/* Direct links to GitHub Releases & Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={actionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      {isAr ? 'صفحة مسار البناء (Actions)' : 'Actions GitHub'}
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {isAr ? 'عرض سير البناء وتنزيل الـ Artifacts' : 'Voir le statut du workflow et télécharger les artifacts'}
                  </p>
                </a>

                <a
                  href={releasesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {isAr ? 'صفحة الإصدارات (Releases)' : 'Releases GitHub'}
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {isAr ? 'تنزيل ملف BMTahabort-FloodStudy-App.apk' : 'Télécharger directement le fichier .apk publié'}
                  </p>
                </a>
              </div>

              {/* Steps to get APK */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2.5">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'كيف تحصل على ملف APK وتثبته على هاتفك؟' : 'Comment obtenir et installer le fichier APK ?'}</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed pr-1">
                  <li>
                    {isAr
                      ? 'ادخل على صفحة Actions في مستودعك على GitHub.'
                      : 'Accédez à la page Actions de votre dépôt GitHub.'}
                  </li>
                  <li>
                    {isAr
                      ? 'اضغط على آخر عملية بناء تحمل اسم "Build Android APK".'
                      : 'Cliquez sur la dernière exécution nommée "Build Android APK".'}
                  </li>
                  <li>
                    {isAr
                      ? 'في أسفل الصفحة في قسم Artifacts، اضغط على BMTahabort-FloodStudy-APK لتنزيله.'
                      : 'En bas dans la section Artifacts, cliquez sur BMTahabort-FloodStudy-APK.'}
                  </li>
                  <li>
                    {isAr
                      ? 'افتح الملف في هاتفك واضغط "تثبيت" (Install).'
                      : 'Ouvrez le fichier sur votre téléphone et appuyez sur Installer.'}
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeSubTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 text-xs leading-relaxed space-y-2">
                <div className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'التثبيت الفوري كـ تطبيق هاتف (بدون انتظار البناء)' : 'Installation Instantanée Mobile'}</span>
                </div>
                <p className="text-slate-300">
                  {isAr
                    ? 'التطبيق يدعم تقنية Progressive Web App (PWA) المعتمدة رسمياً من Google، مما يتيح لك تثبيته على هاتفك الأندرويد كأي تطبيق عادي وله أيقونة مستقلة ويعمل بكامل الشاشة وبدون شريط المتصفح.'
                    : 'L\'application est compatible Progressive Web App (PWA). Vous pouvez l\'installer directement sur Android comme une application native complète.'}
                </p>
              </div>

              <div className="flex justify-center p-3">
                <button
                  onClick={handleInstallPWA}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
                >
                  <Smartphone className="w-5 h-5" />
                  <span>{isAr ? 'تثبيت التطبيق الآن على الهاتف' : 'Installer l\'Application sur Mobile'}</span>
                </button>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-slate-200">
                  {isAr ? 'طريقة التثبيت اليدوية من متصفح الهاتف (Chrome):' : 'Méthode manuelle depuis Chrome sur Android :'}
                </div>
                <div className="space-y-1 text-slate-400">
                  <div>1. {isAr ? 'افتح رابط التطبيق في متصفح Google Chrome على هاتفك.' : 'Ouvrez l\'application dans Chrome sur votre mobile.'}</div>
                  <div>2. {isAr ? 'اضغط على أيقونة القائمة (⋮) أعلى يمين أو يسار الشاشة.' : 'Cliquez sur les 3 points verticaux (⋮) en haut.'}</div>
                  <div>3. {isAr ? 'اختر "تثبيت التطبيق" (Install App) أو "إضافة إلى الشاشة الرئيسية".' : 'Sélectionnez "Installer l\'application" ou "Ajouter à l\'écran d\'accueil".'}</div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'github' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'أمر تحديث المستودع وتشغيل البناء الآلي:' : 'Commande Git pour déclencher le build :'}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-700/80 font-mono text-cyan-300">
                  <code>{gitPushCommand}</code>
                  <button
                    onClick={() => copyToClipboard(gitPushCommand)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1 text-[11px]"
                  >
                    {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? (isAr ? 'تم النسخ' : 'Copié') : (isAr ? 'نسخ' : 'Copier')}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2 leading-relaxed">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isAr ? 'إذا كنت تعدّل مباشرة من موقع GitHub:' : 'Si vous utilisez directement l\'interface GitHub :'}</span>
                </div>
                <p className="text-slate-300">
                  {isAr
                    ? 'يمكنك الدخول إلى تبويب Actions في المستودع والضغط على مسار "Build Android APK"، ثم الضغط على زر "Run workflow" لتشغيله مباشرة.'
                    : 'Vous pouvez vous rendre sur l\'onglet Actions de votre dépôt, sélectionner "Build Android APK", et cliquer sur "Run workflow".'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {isAr ? 'ملف الإخراج: BMTahabort-FloodStudy-App.apk' : 'Fichier de sortie : BMTahabort-FloodStudy-App.apk'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};
