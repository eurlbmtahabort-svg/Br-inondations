# نظام دراسات الهندسة الهيدرولوجية ومكافحة الفيضانات 🌊
### Système Intégré d'Études Hydrologiques & de Protection Contre les Inondations

تطبيق هندسي متكامل ومتقدم مخصص لمكاتب الدراسات والمهندسين الهيدرولوجيين، مصمم لإعداد تقارير الخبرة الفنية، نمذجة الهيدرولوجيا (HEC-HMS)، النمذجة الهيدروليكية (HEC-RAS 1D/2D)، حسابات أبعاد المنشآت المائية (Manning-Strickler)، مع مستشار مدعوم بالذكاء الاصطناعي (**Google Gemini 3.8 / 3.1 Flash**) وتكامل مع نظم المعلومات الجغرافية (GIS) و Looker Studio.

---

## 🚀 الميزات الرئيسية (Fonctionnalités Clés)

1. **التقرير الهيدرولوجي والهيدروليكي المتكامل (Rapport Technique Détaillé)**:
   - فصول كاملة: التقديم العام وسياق الدراسة، الخصائص المورفومترية للأحواض الساكنة.
   - التحليل الهيدرولوجي وتقدير التدفقات القصوى لمختلف فترات العودة ($T = 10, 20, 50, 100$ سنة).
   - النمذجة الهيدروليكية ومحاكاة أعماق وسرعات الجريان ومخاطر الغمر.
   - اقتراح منشآت الحماية (أحواض تهدئة، جدران واقية، تطهير وتوسيع المجاري).
   - تدقيق فصول التقرير بضغطة زر عبر الذكاء الاصطناعي (**AI Chapter Review**).

2. **مستشار الذكاء الاصطناعي المتخصص (Conseiller IA en Hydrologie ✨)**:
   - مدعوم بأحدث نماذج **Google Gemini**.
   - تشخيص فوري للمخاطر الهيدرولوجية لأي حوض صباب مع تحديد مستوى الخطر واقتراح الحلول.
   - مستشار حساب الأبعاد الهيدروليكية لمقاطع القنوات والأنابيب وشروط الاستقرار (Froude, Scour, Revanche).
   - باحث هيدرولوجي ذكي للإجابة عن المعايير والقوانين الدولية والوطنية (ANRH, USACE, FAO).

3. **إدارة المواقع ونظم المعلومات الجغرافية (SIG & Cartographie)**:
   - تحديد إحداثيات ومناطق الدراسة التفاعلية عبر خرائط Leaflet (OpenStreetMap & Satellite).
   - بحث ذكي بالذكاء الاصطناعي عن الأودية والمواقع والمناطق الجغرافية في الجزائر والمغرب العربي.
   - تصدير فوري لطبقات الوديان ونقاط التصريف بصيغتي **Google Earth (.kml)** و **GeoJSON**.

4. **حاسبة الأبعاد الهيدروليكية (Calculateur Hydraulique de Dimensionnement)**:
   - تطبيق معادلة مانينغ-ستريكلر ($Q = K \cdot S \cdot R_h^{2/3} \cdot I^{1/2}$).
   - دعم المقاطع شبه المنحرفة، المستطيلة، والدائرية.
   - فحص شروط الأمان: رقم فرود ($Fr$), السرعة القصوى المانعة للنحر والترسب، وهامش الأمان (Revanche).

5. **تكامل مع Looker Studio وتصدير التقارير الرسمية**:
   - لوحة تحكم تفاعلية مدمجة مع منصة التحليلات Looker Studio.
   - تصدير كامل للدراسة كملف **Microsoft Word (.docx)** منسق مع جداول المعطيات ورسومات بيانية وملحق الخبرة الفنية الصادر بالذكاء الاصطناعي.

---

## 🛠️ البنية التقنية (Architecture Technique)

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Leaflet.
- **Backend**: Node.js & Express (API Proxy & Logic), Vite middleware.
- **AI SDK**: `@google/genai` (Google Gemini 3.8 / 3.1 Flash).
- **CI/CD**: GitHub Actions workflows (`.github/workflows/ci.yml`, `deploy-pages.yml`).

---

## 💻 التشغيل المحلي (Installation & Démarrage)

### 1. استنساخ المستودع (Clone Repository)
```bash
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git
cd <YOUR_REPOSITORY>
```

### 2. تثبيت الحزم (Install Dependencies)
```bash
npm install
```

### 3. إعداد مفتاح البيئة (Environment Variables)
قم بإنشاء ملف `.env` في المجلد الرئيسي:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. تشغيل خادم التطوير (Run Dev Server)
```bash
npm run dev
```
سيعمل التطبيق على المنفذ `http://localhost:3000`.

### 5. بناء التطبيق للإنتاج (Build for Production)
```bash
npm run build
npm start
```

---

## 📦 التنسيق والرفع على GitHub (Push to GitHub)

لربط المشروع بمستودعك على GitHub وتشغيل البناء الآلي (GitHub Actions):

1. أنشئ مستودعاً جديداً على حسابك في GitHub (مثلاً: `flood-hydrology-platform`).
2. نفّذ الأوامر التالية من سطر الأوامر:
```bash
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git
git branch -M main
git push -u origin main
```
بمجرد الرفع، سيقوم **GitHub Actions** بفحص وبناء التطبيق آلياً عبر ملفات سير العمل المرفقة.
