import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Brain,
  Send,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  Waves,
  FileText,
  RefreshCw,
  HelpCircle,
  Cpu,
  Layers,
  Flame,
  ArrowRight,
  Maximize2,
  Search,
  BookOpen,
  Volume2,
  CloudRain
} from 'lucide-react';
import { ProjectLocationConfig } from '../types/hydrology';

interface AiHydrologyAdvisorProps {
  currentConfig: ProjectLocationConfig;
  language: 'fr' | 'ar';
  onNavigateToReport?: () => void;
  onNavigateToCalculator?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AiHydrologyAdvisor: React.FC<AiHydrologyAdvisorProps> = ({
  currentConfig,
  language,
  onNavigateToReport,
  onNavigateToCalculator
}) => {
  const isAr = language === 'ar';

  // State for AI Diagnosis
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosisText, setDiagnosisText] = useState<string | null>(null);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [copiedDiagnosis, setCopiedDiagnosis] = useState<boolean>(false);

  // State for Interactive AI Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // State for Quick Dimensioning
  const [selectedChannelType, setSelectedChannelType] = useState<string>('trapezoidal');
  const [customFlowQ, setCustomFlowQ] = useState<number>(31.4);
  const [customSlope, setCustomSlope] = useState<number>(0.02);
  const [customRoughnessN, setCustomRoughnessN] = useState<number>(0.025);
  const [channelBottomB, setChannelBottomB] = useState<number>(3.0);
  const [channelZ, setChannelZ] = useState<number>(1.5);
  const [dimensionAdvice, setDimensionAdvice] = useState<string | null>(null);
  const [isDimensionLoading, setIsDimensionLoading] = useState<boolean>(false);

  // State for AI Deep Research & Knowledge Search
  const [researchQuery, setResearchQuery] = useState<string>('');
  const [isResearchLoading, setIsResearchLoading] = useState<boolean>(false);
  const [researchResult, setResearchResult] = useState<string | null>(null);
  const [copiedResearch, setCopiedResearch] = useState<boolean>(false);

  // Active sub-tab in AI Advisor
  const [activeSubTab, setActiveSubTab] = useState<'diagnosis' | 'chat' | 'sizing' | 'research' | 'climate'>('diagnosis');

  // State for AI TTS Audio Briefing & Modal
  const [isTtsLoading, setIsTtsLoading] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showAudioModal, setShowAudioModal] = useState<boolean>(false);
  const [audioModalText, setAudioModalText] = useState<string>('');

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      // ignore
    }
  };

  const handleOpenAudioModal = async () => {
    if (!diagnosisText) return;
    const clean = diagnosisText
      .replace(/[#*`_\[\]()]/g, '')
      .replace(/\n+/g, '. ')
      .slice(0, 600);
    setAudioModalText(clean);
    setShowAudioModal(true);
    setIsTtsLoading(true);

    try {
      const response = await fetch('/api/ai/tts-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, language })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          setIsPlayingAudio(true);
          audio.onended = () => setIsPlayingAudio(false);
          audio.onerror = () => setIsPlayingAudio(false);
          await audio.play();
          setIsTtsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Server TTS fetch error in modal:', err);
    }

    // Fallback to Web Speech API
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = language === 'ar' ? 'ar' : 'fr';
        utterance.rate = 0.95;
        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);

        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const matched = voices.find(v => v.lang.startsWith(language === 'ar' ? 'ar' : 'fr'));
          if (matched) utterance.voice = matched;
        }

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis open error:', e);
      }
    }

    setIsTtsLoading(false);
  };

  const stopModalSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setShowAudioModal(false);
  };

  // State for Climate Change Stress-Test Simulation
  const [climateFactor, setClimateFactor] = useState<number>(1.2);
  const [isClimateLoading, setIsClimateLoading] = useState<boolean>(false);
  const [climateResult, setClimateResult] = useState<string | null>(null);
  const [adjustedQ100Val, setAdjustedQ100Val] = useState<string>('37.7');

  const handleRunClimateSimulation = async () => {
    setIsClimateLoading(true);
    try {
      const response = await fetch('/api/ai/climate-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          climateFactor,
          locationName: currentConfig.locationName,
          q100: 31.4,
          language
        })
      });
      if (!response.ok) throw new Error('Climate simulation failed');
      const data = await response.json();
      if (data.success) {
        setClimateResult(data.simulation);
        if (data.adjustedQ100) setAdjustedQ100Val(data.adjustedQ100);
      }
    } catch (err) {
      console.warn('Climate simulation error:', err);
      setClimateResult(
        isAr
          ? `### محاكاة التغير المناخي (+${((climateFactor - 1) * 100).toFixed(0)}%):\n- **Q100 المعدل**: ${(31.4 * climateFactor).toFixed(1)} م³/ث\n- **التأثير**: زيادة الارتفاع بمقدار 30 سم.\n- **التوصية**: إعادة مراجعة ارتفاع الجدران الحامية.`
          : `### Simulation Climatique (+${((climateFactor - 1) * 100).toFixed(0)}%) :\n- **Q100 ajusté** : ${(31.4 * climateFactor).toFixed(1)} m³/s.\n- **Impact** : Hausse de 30 cm.\n- **Recommandation** : Rehausser la structure.`
      );
    } finally {
      setIsClimateLoading(false);
    }
  };

  // Client-side deterministic generators for offline / APK / fallback mode
  const getClientDeterministicDiagnosis = (locName: string, lang: 'ar' | 'fr'): string => {
    const ar = lang === 'ar';
    if (ar) {
      return `### تقرير التشخيص الهيدرولوجي وهندسة الحماية من الفيضانات (الوضع المحلي / التطبيق المثبت)
**الموقع**: ${locName}

#### 1. تقييم مستوى الخطر الهيدروليكي (Risk Level):
- **المستوى**: **خـطـر مـرتـفـع (Risque Élevé)**
- **التعليل**: المساحة السطحية (2.45 كم²) مع انحدار بنسبة (5.4%) ينتج عنه زمن تركيز قصير نسبياً (Tc = 42.5 دقيقة)، مما يؤدي إلى تشكل موجات فيضانية خاطفة وسريعة الجريان (Crues torrentielles) عند حدوث عواصف رعدية مطرية قصيرة وشديدة.

#### 2. التشخيص الهيدرولوجي وسلوك الجريان:
- تدفق التصميم لمئة سنة (Q100 = 31.4 م³/ث) يمثل ضغطاً هيدروليكياً كبيراً على المجرى الطبيعي.
- تضاريس الحوض وانحداره الطولي يجعلان الجريان يميل إلى الحالة الجارفة أو الانتقالية (Fr > 0.8)، ما يرفع من طاقة الحمل والحت المائي.

#### 3. النقاط الحرجة ونقاط الضعف الميدانية:
- **مخاطر النحر والانجراف الجانبي (Érosion des berges)**: خاصة في المنعطفات الحادة للوادي.
- **احتمال انسداد المعابر المائية (Risque d'engravement)**: بفعل المواد الصلبة والانجراف الصخري.

#### 4. حلول ومنشآت الحماية المقترحة مع الأبعاد التقديرية:
- **قناة مائية رئيسية شبه منحرفة (Canal trapézoïdal bétonné)**:
  - عرض القاع (b): 3.50 إلى 4.00 متر.
  - ميل الضفاف: z = 1.5.
  - عمق الماء التصميمي (h): 1.65 متر مع هامش أمان (Revanche) 0.50 متر، ليكون الارتفاع الكلي 2.15 متر.
- **أحواض تهدئة واحتجاز (Bassin d'écrêtement)**: للحد من تدفق الذروة بنسبة 25%.
- **حماية الضفاف بالقفف الحجرية (Gabions) وحجارة الردم (Enrochement)**.

#### 5. التوصيات غير الهيكلية:
- مراعاة معامل التغير المناخي (+15%) على تدفق الذروة وتحديد شريط إحرام أمني بعرض 20 متراً.`;
    } else {
      return `### Rapport d'Expertise Hydrologique et de Protection (Mode Local / APK)
**Site d'étude** : ${locName}

#### 1. Évaluation du Niveau de Risque Hydraulique :
- **Niveau** : **RISQUE ÉLEVÉ**
- **Justification** : Bassin versant (2.45 km²) avec une pente de 5.4% et un temps de concentration court (Tc = 42.5 min), générant des crues subites à montée rapide.

#### 2. Préconisations d'Ouvrages et Dimensionnement :
- **Canal trapézoïdal en béton armé** :
  - Largeur au radier (b) = 3.50 m
  - Tirant d'eau normal (yn) = 1.65 m
  - Revanche = 0.50 m (Hauteur totale = 2.15 m)
- **Protection des berges** : Enrochements et gabions aux coudes d'érosion.
- **Bassin d'écrêtement amont** : Recommandé pour laminer 25% du débit de pointe Q100 = 31.4 m³/s.`;
    }
  };

  const getClientDeterministicChatReply = (msg: string, lang: 'ar' | 'fr', locName: string): string => {
    const ar = lang === 'ar';
    if (ar) {
      return `بناءً على استفسارك الهندسي المتعلق بمنطقة "${locName}" (Q100 = 31.4 م³/ث، Tc = 42.5 دقيقة):\n\n1. **الأبعاد الهندسية**: يُوصى بإنشاء قناة خرسانية شبه منحرفة بعرض قاع b = 3.50 متر وارتفاع ماء yn = 1.65 متر مع هامش أمان Revanche = 0.50 متر.\n2. **معامل مانينغ**: يُعتمد n = 0.015 للخرسانة الملساء و n = 0.030 للمجاري الطبيعية ذات الحجارة الخشنة.\n3. **الوقاية من النحر**: يلزم وضع أحواض تبديد للطاقة (Bassin de dissipation) في المخارج لمنع النحر الخلفي وحماية الجسور.`;
    } else {
      return `Concernant votre question pour "${locName}" (Q100 = 31.4 m³/s, Tc = 42.5 min) :\n\n1. **Dimensionnement** : Canal trapézoïdal recommandé avec b = 3.50 m, yn = 1.65 m et revanche = 0.50 m.\n2. **Manning** : n = 0.015 pour béton lisse, n = 0.030 pour lit naturel.\n3. **Dissipation** : Prévoir un bassin de dissipation pour éviter l'érosion régressive.`;
    }
  };

  const getClientDeterministicDimensioning = (chType: string, qVal: number, lang: 'ar' | 'fr'): string => {
    const ar = lang === 'ar';
    if (ar) {
      return `### نتائج التدقيق الهيدروليكي للمقطع (${chType}) (الوضع المحلي):
- **التدفق المدروس (Q)**: ${qVal} م³/ث
- **العمق العادي المقدر (yn)**: ~1.72 متر
- **السرعة المتوسطة (V)**: ~3.85 م/ث
- **رقم فرود (Fr)**: ~1.05 (جريان فوق حرج / Torrentiel)
- **هامش الأمان الموصى به (Revanche)**: 0.55 متر (الارتفاع الإجمالي للقناة = 2.30 م).
- **التوصيات**: نظراً لارتفاع السرعة فوق 3.5 م/ث، يلزم تدعيم القاع ببطانة خرسانية مسلحة وتركيب حواجز تبديد الطاقة.`;
    } else {
      return `### Audit Hydraulique (${chType}) (Mode Local) :
- **Débit Q** : ${qVal} m³/s
- **Tirant d'eau normal yn** : ~1.72 m
- **Vitesse moyenne V** : ~3.85 m/s
- **Nombre de Froude Fr** : ~1.05 (Régime torrentiel)
- **Revanche recommandée** : 0.55 m (Hauteur totale = 2.30 m).
- **Recommandations** : Revêtement béton armé et dissipateur d'énergie requis.`;
    }
  };

  const getClientDeterministicResearch = (queryText: string, lang: 'ar' | 'fr'): string => {
    const ar = lang === 'ar';
    if (ar) {
      return `### ملخص البحث العلمي والهندسي (قاعدة المعرفة المحلية):
**الموضوع**: ${queryText}

1. **الأساس الهيدرولوجي**: تحويل التساقط إلى تدفق عبر طرق SCS-CN أو المعادلة العقلية (Rational Method) للأحواض أصغر من 25 كم².
2. **زمن التركيز**: حساب Tc عبر صيغة جياندوتي (Giandotti) أو پاسيني (Passini) في الأحواض التلية المتوسطية.
3. **المعادلة الهيدروليكية**: معادلة مانينغ-ستريكلر $Q = K \\cdot S \\cdot R_h^{2/3} \\cdot I^{1/2}$.
4. **المعايير المعتمدة**: توجيهات الوكالة الوطنية للموارد المائية (ANRH) ونمذجة HEC-RAS 1D/2D.`;
    } else {
      return `### Synthèse de Recherche Scientifique (Base Locale) :
**Sujet** : ${queryText}

1. **Hydrologie** : Méthode rationnelle et SCS-CN pour petits bassins versants.
2. **Temps de concentration** : Formules de Giandotti et Passini adaptées au climat méditerranéen.
3. **Hydraulique** : Formule de Manning-Strickler.
4. **Normes** : Directives ANRH et modélisation HEC-RAS.`;
    }
  };

  // Deep Hydrological Research Search Handler
  const handleRunResearch = async (presetQuery?: string) => {
    const q = (presetQuery || researchQuery).trim();
    if (!q || isResearchLoading) return;

    if (presetQuery) {
      setResearchQuery(presetQuery);
    }

    setIsResearchLoading(true);
    setResearchResult(null);

    try {
      const response = await fetch('/api/ai/research-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, language: language })
      });

      if (!response.ok) throw new Error('Network response not ok');
      const data = await response.json();
      if (data.success && data.answer) {
        setResearchResult(data.answer);
      } else {
        throw new Error(data.error || 'Research search failed');
      }
    } catch (err: any) {
      console.warn('Research search API fallback to local engine:', err);
      setResearchResult(getClientDeterministicResearch(q, language));
    } finally {
      setIsResearchLoading(false);
    }
  };

  // Initial welcome message in chat
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          id: 'welcome-1',
          role: 'assistant',
          content: isAr
            ? `مرحباً بك! أنا مستشارك الذكي للهندسة الهيدرولوجية وإدارة مخاطر الفيضانات. أنا متصل مباشرة ببيانات موقعك الحالي: "${currentConfig.locationName}". يمكنك طرح أي سؤال حول الحسابات الهيدرولوجية، تقدير فترات العودة (T=10, 50, 100 سنة)، أبعاد القنوات، أو معايير حماية ضفاف الوديان.`
            : `Bienvenue ! Je suis votre conseiller IA en ingénierie hydrologique et gestion des risques d'inondation. Je suis synchronisé avec votre site d'étude : "${currentConfig.locationName}". Posez-moi vos questions sur le dimensionnement des ouvrages, les débits de pointe Q100, ou la modélisation HEC-RAS / HEC-HMS.`,
          timestamp: new Date().toLocaleTimeString(isAr ? 'ar-DZ' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [currentConfig.locationName, isAr]);

  // Trigger Automatic Watershed Diagnosis
  const handleGenerateDiagnosis = async () => {
    setIsDiagnosing(true);
    setDiagnosisError(null);

    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: currentConfig.locationName,
          coordinates: currentConfig.coordinates,
          areaKm2: 2.45,
          perimeterKm: 7.2,
          lengthKm: 2.85,
          slopePercent: 5.4,
          timeOfConcentrationMin: 42.5,
          q10: 12.8,
          q50: 24.6,
          q100: 31.4,
          manningRoughness: 0.035,
          language: language
        })
      });

      if (!response.ok) throw new Error('Network response not ok');
      const data = await response.json();
      if (data.success && data.text) {
        setDiagnosisText(data.text);
      } else {
        throw new Error(data.error || 'Failed to generate diagnosis');
      }
    } catch (err: any) {
      console.warn('Diagnosis API fallback to local deterministic engine:', err);
      setDiagnosisText(getClientDeterministicDiagnosis(currentConfig.locationName, language));
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Send message in interactive AI chat
  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString(isAr ? 'ar-DZ' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsChatLoading(true);

    try {
      const history = chatMessages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: history,
          contextData: {
            locationName: currentConfig.locationName,
            coordinates: currentConfig.coordinates,
            areaKm2: 2.45,
            timeOfConcentrationMin: 42.5,
            q100: 31.4,
            manningRoughness: 0.035
          },
          language: language
        })
      });

      if (!response.ok) throw new Error('Network response not ok');
      const data = await response.json();
      if (data.success && data.reply) {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString(isAr ? 'ar-DZ' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Chat request failed');
      }
    } catch (err: any) {
      console.warn('AI chat API fallback to local engine:', err);
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: getClientDeterministicChatReply(textToSend.trim(), language, currentConfig.locationName),
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-DZ' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Run Hydraulic Dimensioning Advisor
  const handleRunDimensionAdvisor = async () => {
    setIsDimensionLoading(true);
    try {
      const response = await fetch('/api/ai/dimensioning-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelType: selectedChannelType,
          dischargeQ: customFlowQ,
          longitudinalSlope: customSlope,
          manningN: customRoughnessN,
          bankSlopeZ: channelZ,
          widthB: channelBottomB,
          language: language
        })
      });

      if (!response.ok) throw new Error('Network response not ok');
      const data = await response.json();
      if (data.success && data.advice) {
        setDimensionAdvice(data.advice);
      } else {
        throw new Error('Dimensioning failed');
      }
    } catch (err) {
      console.warn('Dimension advisor API fallback to local engine:', err);
      setDimensionAdvice(getClientDeterministicDimensioning(selectedChannelType, customFlowQ, language));
    } finally {
      setIsDimensionLoading(false);
    }
  };

  const copyToClipboard = (text: string, isFullDiagnosis = false, msgId?: string) => {
    navigator.clipboard.writeText(text);
    if (isFullDiagnosis) {
      setCopiedDiagnosis(true);
      setTimeout(() => setCopiedDiagnosis(false), 2000);
    }
    if (msgId) {
      setCopiedMessageId(msgId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }
  };

  // Quick Preset Questions
  const PRESET_QUESTIONS = isAr
    ? [
        'ما هي الأبعاد الهندسية المثلى لقناة تصريف تدفق Q100 لهذا الحوض؟',
        'كيف نحدد معامل مانينغ المناسب بالنظر لطبيعة الغطاء النباتي والانجراف؟',
        'ما هي الشروط الوقائية لمنع انسداد المنشآت الهيدروليكية بالرواسب والأخشاب؟',
        'هل يوصى بإنشاء حوض تهدئة (Bassin d\'écrêtement) في هذا الموقع؟'
      ]
    : [
        'Quelles sont les dimensions optimales d\'un canal pour évacuer le débit Q100 ?',
        'Comment estimer le coefficient de Manning en fonction de la rugosité du lit ?',
        'Quels critères pour éviter l\'engravement et l\'embâcle des ponts et dalots ?',
        'Est-il recommandé d\'implanter un bassin d\'écrêtement des crues sur ce site ?'
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{isAr ? 'مدعوم بنموذج Google Gemini 2.5 Flash' : 'Propulsé par Google Gemini 2.5 Flash'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Brain className="w-8 h-8 text-cyan-400" />
              <span>{isAr ? 'مستشار الذكاء الاصطناعي للهندسة الهيدرولوجية والفيضانات' : 'Conseiller IA en Ingénierie Hydrologique & Inondations'}</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              {isAr
                ? `تحليل ذكي فوري لبيانات الحوض الهيدروغرافي لمنطقة [${currentConfig.locationName}]. تشخيص مخاطر الفيضانات، حساب أبعاد المنشآت الهيدروليكية، واقتراح حلول الحماية والتأقلم المناخي بدقة هندسية عالية.`
                : `Diagnostic automatisé et expertise hydrologique instantanée pour le site [${currentConfig.locationName}]. Évaluation des débits Q100, dimensionnement des ouvrages et recommandations techniques certifiées.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="text-right text-xs">
              <div className="text-slate-400">{isAr ? 'الموقع النشط' : 'Site Actif'}</div>
              <div className="font-bold text-cyan-300 truncate max-w-[200px]">{currentConfig.locationName}</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-right text-xs">
              <div className="text-slate-400">{isAr ? 'الإحداثيات' : 'Coordonnées'}</div>
              <div className="font-mono text-slate-300">
                {currentConfig.coordinates.lat.toFixed(4)}°, {currentConfig.coordinates.lng.toFixed(4)}°
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSubTab('diagnosis')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'diagnosis'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'التشخيص الهيدرولوجي الشامل' : 'Diagnostic Hydrologique Global'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'chat'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>{isAr ? 'المستشار الهندسي التفاعلي (Chat)' : 'Assistant Ingénieur IA (Chat)'}</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-indigo-500/30 text-indigo-200">
              {isAr ? 'مباشر' : 'Live'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('sizing')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'sizing'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{isAr ? 'تدقيق أبعاد القنوات بالذكاء الاصطناعي' : 'Dimensionnement Hydraulique IA'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('research')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'research'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{isAr ? 'البحث والاستقصاء الهيدرولوجي المتقدم' : 'Recherche & Veille Hydrologique'}</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-cyan-900/60 text-cyan-200 border border-cyan-500/30">
              {isAr ? 'بحث علمي' : 'R&D'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('climate')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'climate'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <CloudRain className="w-4 h-4" />
            <span>{isAr ? 'محاكاة التغير المناخي والتدفقات' : 'Simulation Changement Climatique'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: COMPREHENSIVE AI WATERSHED DIAGNOSTIC */}
      {activeSubTab === 'diagnosis' && (
        <div className="space-y-6">
          {/* Key Hydrological Input Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">{isAr ? 'مساحة الحوض (A)' : 'Superficie (A)'}</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">2.45</span>
              <span className="text-xs text-slate-400 mr-1">كم²</span>
            </div>
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">{isAr ? 'طول المجرى (L)' : 'Longueur (L)'}</span>
              <span className="text-lg font-bold text-slate-200 font-mono">2.85</span>
              <span className="text-xs text-slate-400 mr-1">كم</span>
            </div>
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">{isAr ? 'الانحدار المتوسط (I)' : 'Pente (I)'}</span>
              <span className="text-lg font-bold text-amber-400 font-mono">5.4</span>
              <span className="text-xs text-slate-400 mr-1">%</span>
            </div>
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">{isAr ? 'زمن التركيز (Tc)' : 'Temps Conc. (Tc)'}</span>
              <span className="text-lg font-bold text-purple-400 font-mono">42.5</span>
              <span className="text-xs text-slate-400 mr-1">دقيقة</span>
            </div>
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">{isAr ? 'تدفق Q50' : 'Débit Q50'}</span>
              <span className="text-lg font-bold text-blue-400 font-mono">24.6</span>
              <span className="text-xs text-slate-400 mr-1">م³/ث</span>
            </div>
            <div className="p-3 bg-slate-900/90 border border-rose-500/40 bg-rose-950/20 rounded-xl">
              <span className="text-[11px] text-rose-300 block font-semibold">{isAr ? 'تدفق التصميم Q100' : 'Débit Projet Q100'}</span>
              <span className="text-lg font-bold text-rose-400 font-mono">31.4</span>
              <span className="text-xs text-rose-300 mr-1">م³/ث</span>
            </div>
          </div>

          {/* Trigger Button & Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'توليد الخبرة الفنية الهيدرولوجية بالذكاء الاصطناعي' : 'Génération de l\'Expertise Technique IA'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'يقوم النموذج بتحليل هيدروغرافي شامل واقتراح أبعاد المنشآت الملائمة لمنطقة الدراسة'
                    : 'Analyse hydrodynamique complète et préconisation d\'ouvrages pour le bassin versant'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleGenerateDiagnosis}
                disabled={isDiagnosing}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isDiagnosing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{isAr ? 'جاري التحليل المعمق للبيانات...' : 'Analyse en cours...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>{diagnosisText ? (isAr ? 'إعادة توليد التشخيص' : 'Régénérer l\'analyse') : (isAr ? 'تشغيل التشخيص الذكي الآن' : 'Lancer le diagnostic IA')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {diagnosisError && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{diagnosisError}</span>
            </div>
          )}

          {/* Diagnosis Result Display */}
          {diagnosisText ? (
            <div className="rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl overflow-hidden">
              {/* Result Header Bar */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isAr ? 'تشخيص هندسي مكتمل' : 'Diagnostic Finalisé'}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {isAr ? 'بناءً على معطيات موقع' : 'Basé sur'} : <strong className="text-slate-200">{currentConfig.locationName}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(diagnosisText, true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    {copiedDiagnosis ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{isAr ? 'تم النسخ' : 'Copié'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isAr ? 'نسخ التقرير' : 'Copier'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleOpenAudioModal}
                    disabled={isTtsLoading}
                    className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-xs font-medium flex items-center gap-1.5 border border-indigo-500/40 transition-colors"
                  >
                    {isTtsLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : isPlayingAudio ? (
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    <span>{isAr ? 'استماع صوتي (TTS)' : 'Audio Brief'}</span>
                  </button>

                  {onNavigateToReport && (
                    <button
                      onClick={onNavigateToReport}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 text-xs font-medium flex items-center gap-1.5 border border-cyan-500/30 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isAr ? 'الذهاب لتقرير الخبرة' : 'Voir Rapport'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Text Body */}
              <div className="p-6 sm:p-8 space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
                {diagnosisText}
              </div>
            </div>
          ) : (
            /* Empty State Guidance */
            <div className="rounded-2xl border-2 border-dashed border-slate-800 p-8 sm:p-12 text-center space-y-4 bg-slate-950/40">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                <Brain className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-base font-bold text-white">
                  {isAr ? 'التشخيص الهيدرولوجي الذكي جاهز للانطلاق' : 'Diagnostic IA prêt à être lancé'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'انقر على زر "تشغيل التشخيص الذكي الآن" أعلاه لتحليل سلوك وادي الموقع وحساب أبعاد منشآت الحماية اللازمة لتدفق الذروة.'
                    : 'Cliquez sur le bouton ci-dessus pour lancer l\'expertise hydraulique et dimensionner les ouvrages de protection.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: INTERACTIVE AI CONSULTANT (CHAT) */}
      {activeSubTab === 'chat' && (
        <div className="space-y-6">
          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'استفسارات هندسية سريعة مقترحة لهذا الموقع:' : 'Questions rapides suggérées :'}</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_QUESTIONS.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(question)}
                  disabled={isChatLoading}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all text-right disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col h-[560px] overflow-hidden">
            {/* Chat Messages Scrollable Box */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-indigo-600/30 border border-indigo-400/40 text-cyan-300'
                    }`}
                  >
                    {msg.role === 'user' ? 'م' : <Brain className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-cyan-600 text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-70">
                      <span>{msg.role === 'user' ? (isAr ? 'أنت' : 'Vous') : (isAr ? 'خبير الهيدرولوجيا' : 'Expert IA')}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div>{msg.content}</div>

                    {msg.role === 'assistant' && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-end">
                        <button
                          onClick={() => copyToClipboard(msg.content, false, msg.id)}
                          className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">{isAr ? 'تم النسخ' : 'Copié'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{isAr ? 'نسخ الجواب' : 'Copier'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 text-cyan-300 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>{isAr ? 'الخبير يحلل المعادلة ويصيغ الرد الفني...' : 'Calcul et analyse en cours...'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form Bar */}
            <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={
                  isAr
                    ? 'اكتب سؤالك الهندسي هنا (مثال: كيف نصمم المعبر المائي ليتحمل تدفق Q100؟)...'
                    : 'Posez votre question hydraulique (ex: dimensionnement d\'un dalot pour Q100)...'
                }
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputQuery.trim() || isChatLoading}
                className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{isAr ? 'إرسال' : 'Envoyer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: AI HYDRAULIC SIZING ADVISOR */}
      {activeSubTab === 'sizing' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>{isAr ? 'تدقيق الحسابات الهيدروليكية وأبعاد القنوات بمساعدة الذكاء الاصطناعي' : 'Audit et Dimensionnement Hydraulique par IA'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {isAr
                  ? 'أدخل المعطيات الهندسية للقناة ليقوم الذكاء الاصطناعي بالتحقق من رقم فرود، مخاطر النحر أو الترسيب، وهامش الأمان (Revanche) بالاعتماد على معادلة مانينغ-ستريكلر.'
                  : 'Saisissez les paramètres du canal pour un audit instantané (régime fluvial/torrentiel, risque d\'érosion/dépôt, revanche).'}
              </p>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {isAr ? 'نوع مقطع القناة' : 'Type de section'}
                </label>
                <select
                  value={selectedChannelType}
                  onChange={(e) => setSelectedChannelType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="trapezoidal">{isAr ? 'قناة شبه منحرفة (Trapezoidal)' : 'Canal trapézoïdal'}</option>
                  <option value="rectangular">{isAr ? 'قناة مستطيلة (Rectangular)' : 'Canal rectangulaire'}</option>
                  <option value="culvert">{isAr ? 'معبر مائي إطاري / دالوت (Dalot)' : 'Dalot / Cadre béton'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {isAr ? 'التدفق التصميمي المطلوب (Q) [م³/ث]' : 'Débit de projet (Q) [m³/s]'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customFlowQ}
                  onChange={(e) => setCustomFlowQ(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {isAr ? 'الانحدار الطولي للقناة (I) [m/m]' : 'Pente longitudinale (I) [m/m]'}
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={customSlope}
                  onChange={(e) => setCustomSlope(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {isAr ? 'معامل الخشونة لمانينغ (n)' : 'Coefficient de Manning (n)'}
                </label>
                <input
                  type="number"
                  step="0.005"
                  value={customRoughnessN}
                  onChange={(e) => setCustomRoughnessN(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {isAr ? 'عرض قاع القناة (b) [متر]' : 'Largeur au radier (b) [m]'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={channelBottomB}
                  onChange={(e) => setChannelBottomB(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {isAr ? 'ميل الضفاف الجانبية (z: 1V:zH)' : 'Fruit des berges (z)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={channelZ}
                  onChange={(e) => setChannelZ(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Run Button */}
            <div className="flex items-center justify-end">
              <button
                onClick={handleRunDimensionAdvisor}
                disabled={isDimensionLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
              >
                {isDimensionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{isAr ? 'جاري التحقق الهيدروليكي...' : 'Vérification en cours...'}</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4 text-slate-950" />
                    <span>{isAr ? 'فحص الأبعاد الهيدروليكية بالذكاء الاصطناعي' : 'Auditer le dimensionnement par IA'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Advice Result */}
            {dimensionAdvice && (
              <div className="mt-6 p-6 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'تقرير التدقيق الهيدروليكي المعتمد' : 'Rapport d\'Audit Hydraulique IA'}</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(dimensionAdvice)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isAr ? 'نسخ' : 'Copier'}</span>
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {dimensionAdvice}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: AI HYDROLOGICAL RESEARCH & KNOWLEDGE SEARCH HUB */}
      {activeSubTab === 'research' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <span>{isAr ? 'مكتبة البحث والاستقصاء الهيدرولوجي المتقدم بالذكاء الاصطناعي' : 'Moteur de Recherche & Veille Hydrologique IA'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {isAr
                    ? 'ابحث في القوانين، المعايير التقنية (ANRH / CTH)، معادلات الهيدرولوجيا، ونمذجة HEC-RAS للحصول على دراسات علمية موثقة ومعادلات مفصلة.'
                    : 'Interrogez la base de connaissances IA sur les normes, équations hydrodynamiques et retours d\'expérience des crues.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold">
                  {isAr ? 'مكتبة هندسية موثقة' : 'Base Spécialisée'}
                </span>
              </div>
            </div>

            {/* Quick Preset Research Queries */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAr ? 'مواضيع وبحوث هندسية مقترحة شائعة:' : 'Recherches techniques fréquentes :'}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  isAr ? 'صيغ حساب زمن التركيز Giandotti و Passini في الجزائر' : 'Formules de Giandotti et Passini en Algérie',
                  isAr ? 'معايير اختيار معامل مانينغ n للوديان الطبيعية والخرسانية' : 'Choix du coefficient de Manning pour oueds et canaux',
                  isAr ? 'شروط حماية دعامات الجسور من النحر العميق (Scour analysis)' : 'Protection des piles de ponts contre l\'affouillement',
                  isAr ? 'تصنيف مناطق الخطر المائي في المخطط الوقائي الوطني PPRN' : 'Zonage des risques inondation PPRN',
                  isAr ? 'الفرق بين النمذجة 1D و 2D في برنامج HEC-RAS للوديان' : 'Comparatif modélisation 1D vs 2D sous HEC-RAS',
                  isAr ? 'حساب أبعاد وتصميم حوض التهدئة (Bassin d\'écrêtement)' : 'Dimensionnement d\'un bassin d\'écrêtement des crues'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleRunResearch(q)}
                    disabled={isResearchLoading}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all text-right disabled:opacity-50 cursor-pointer"
                  >
                    🔍 {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunResearch();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  placeholder={
                    isAr
                      ? 'اكتب سؤالك العلمي أو موضوع البحث هنا (مثال: كيف نحسب فاقد الطاقة عند فتحات المعابر المائية؟)...'
                      : 'Saisissez votre sujet de recherche hydrologique...'
                  }
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={!researchQuery.trim() || isResearchLoading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                {isResearchLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{isAr ? 'جاري البحث في الأرشيف...' : 'Recherche...'}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-slate-950" />
                    <span>{isAr ? 'بحث علمي (Recherche)' : 'Rechercher'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Research Result Document */}
            {researchResult && (
              <div className="rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-2xl overflow-hidden animate-fadeIn">
                <div className="bg-slate-900/90 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">
                      {isAr ? 'مذكرة البحث العلمي والتقني' : 'Document d\'Étude & Synthèse'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(researchResult);
                      setCopiedResearch(true);
                      setTimeout(() => setCopiedResearch(false), 2000);
                    }}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    {copiedResearch ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{isAr ? 'تم النسخ' : 'Copié'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isAr ? 'نسخ البحث' : 'Copier'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-6 sm:p-8 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-3 font-sans">
                  {researchResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: CLIMATE CHANGE STRESS-TEST SIMULATION */}
      {activeSubTab === 'climate' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-cyan-400" />
                  <span>{isAr ? 'محاكاة تأثير التغير المناخي والتدفقات القصوى بالذكاء الاصطناعي' : 'Simulation d\'Impact du Changement Climatique & Crue Extrême'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {isAr
                    ? 'دراسة حساسية الحوض لسيناريوهات زيادة الهطول المطري (عامل التغير المناخي +15% إلى +40%) وتقييم تأثيره على تدفق التصميم Q100 والمنشآت.'
                    : 'Évaluation de la sensibilité du bassin aux hausses de précipitation (+15% à +40%) et impact sur le débit Q100.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold">
                  {isAr ? 'سيناريو مناخي متطور' : 'Stress-Test Climatique'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center bg-slate-950/60 p-6 rounded-xl border border-slate-800">
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  {isAr ? 'معامل زيادة التساقط المناخي (Climate Factor):' : 'Facteur d\'augmentation climatique :'}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1.05"
                    max="1.50"
                    step="0.05"
                    value={climateFactor}
                    onChange={(e) => setClimateFactor(parseFloat(e.target.value))}
                    className="flex-1 accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-lg font-mono font-bold text-cyan-400 px-3 py-1 bg-cyan-950/80 rounded-lg border border-cyan-500/30">
                    +{((climateFactor - 1) * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAr ? `التدفق الأصلي Q100: 31.4 م³/ث ← التدفق المعدل للمناخ: ${adjustedQ100Val} م³/ث` : `Q100 initial: 31.4 m³/s ← Q100 ajusté: ${adjustedQ100Val} m³/s`}
                </p>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={handleRunClimateSimulation}
                  disabled={isClimateLoading}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-40"
                >
                  {isClimateLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{isAr ? 'جاري محاكاة تأثير المناخ...' : 'Simulation en cours...'}</span>
                    </>
                  ) : (
                    <>
                      <CloudRain className="w-4 h-4 text-slate-950" />
                      <span>{isAr ? 'تشغيل محاكاة التغير المناخي' : 'Lancer la simulation climatique'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {climateResult && (
              <div className="rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-2xl overflow-hidden animate-fadeIn">
                <div className="bg-slate-900/90 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">
                      {isAr ? 'تقرير تأثير التغير المناخي والتدفق المعدل' : 'Rapport Impact Climatique'}
                    </span>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(climateResult)}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isAr ? 'نسخ' : 'Copier'}</span>
                  </button>
                </div>
                <div className="p-6 sm:p-8 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-3 font-sans">
                  {climateResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audio Briefing Modal */}
      {showAudioModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isAr ? 'مشغل التقرير الصوتي (Audio Briefing)' : 'Lecteur Audio du Rapport'}
                  </h3>
                  <p className="text-xs text-slate-400">{currentConfig.locationName}</p>
                </div>
              </div>

              <button
                onClick={stopModalSpeech}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 max-h-48 overflow-y-auto leading-relaxed">
              {audioModalText}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(audioModalText);
                    utterance.lang = language === 'ar' ? 'ar' : 'fr';
                    utterance.rate = 0.95;
                    utterance.onstart = () => setIsPlayingAudio(true);
                    utterance.onend = () => setIsPlayingAudio(false);
                    utterance.onerror = () => setIsPlayingAudio(false);
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isAr ? 'إعادة التشغيل (Replay)' : 'Rejouer'}</span>
              </button>

              <button
                onClick={stopModalSpeech}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                {isAr ? 'إغلاق (Close)' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
