// =============================================================
// Tadfuq Al-Khayr — services data, pricing, helpers
// =============================================================

window.SECTIONS = [
  { code: 'CS', name: 'الاشتراكات', name_en: 'Subscriptions',
    color: '#1d4ed8', icon: 'apartment',
    blurb: 'فتح اشتراكات جديدة، نقل ملكية، تغيير الصنف، إيقاف/تفعيل.' },
  { code: 'CT', name: 'الفنية', name_en: 'Technical',
    color: '#b45309', icon: 'electrical_services',
    blurb: 'فحص المقاييس، تغيير الكابلات، تعديل القوة والجهد، تغيير الموقع.' },
  { code: 'CB', name: 'الفواتير', name_en: 'Billing',
    color: '#0e7490', icon: 'receipt_long',
    blurb: 'دفع القوائم، التقسيط، التسويات المالية، نسخ القوائم.' },
  { code: 'CA', name: 'الشكاوى والتقارير', name_en: 'Reports',
    color: '#b91c1c', icon: 'report',
    blurb: 'إبلاغات التلاعب، الأخطار، الشكاوى الإدارية، أضرار الشبكة.' },
];

window.SERVICES = [
  // ---- CS ----
  { code:'CS0001', section:'CS', name:'عمل اشتراك جديد', sla:7, popularity:98, hasPrice:true, priceNote:'حسب الصنف والقوة', icon:'add_home' },
  { code:'CS0002', section:'CS', name:'إضافة اسم المنتفع للفاتورة', sla:2, popularity:62, icon:'person_add' },
  { code:'CS0003', section:'CS', name:'تغيير صنف الاشتراك (منزلي/تجاري/صناعي/حكومي)', sla:3, popularity:54, icon:'sync_alt' },
  { code:'CS0004', section:'CS', name:'إيقاف خدمة / قطع تيار مؤقت', sla:1, popularity:71, icon:'power_off' },
  { code:'CS0005', section:'CS', name:'تفعيل اشتراك موقوف (غلق وفتح حساب)', sla:1, popularity:65, icon:'restart_alt' },
  { code:'CS0006', section:'CS', name:'إلغاء اشتراك (غلق حساب)', sla:5, popularity:33, icon:'cancel' },
  { code:'CS0007', section:'CS', name:'الاعتراض على القوائم أو قطع التيار', sla:3, popularity:74, icon:'gavel' },
  { code:'CS0008', section:'CS', name:'تعديل عنوان مشترك / إضافة بيانات', sla:2, popularity:48, icon:'edit_location' },
  { code:'CS0009', section:'CS', name:'قراءة مقياس بناءً على طلب المشترك', sla:1, popularity:38, fixedPrice:25000, icon:'speed' },
  { code:'CS0010', section:'CS', name:'اشتراك مؤقت (مواقع البناء)', sla:5, popularity:42, icon:'construction' },
  { code:'CS0011', section:'CS', name:'نقل ملكية اشتراك (بيع/شراء/ورثة)', sla:7, popularity:69, icon:'swap_horiz' },

  // ---- CT ----
  { code:'CT0001', section:'CT', name:'شكوى ضرر / تغيير موقع عامود', sla:14, popularity:46, fixedPrice:1000000, icon:'bolt' },
  { code:'CT0002', section:'CT', name:'شكوى ضرر / تغيير موقع ركيزة المحولة', sla:21, popularity:34, fixedPrice:2500000, icon:'transform' },
  { code:'CT0003', section:'CT', name:'تغيير كابل مشترك (من العامود الخارجي إلى المقياس)', sla:5, popularity:58, icon:'cable' },
  { code:'CT0004', section:'CT', name:'تجزئة اشتراك / تحويل 3 فاز إلى 3 اشتراكات', sla:14, popularity:39, icon:'call_split' },
  { code:'CT0005', section:'CT', name:'تجميع أحمال / دمج اشتراكات (تجاري/صناعي)', sla:10, popularity:36, icon:'merge' },
  { code:'CT0006', section:'CT', name:'تعديل جهد اشتراك (منخفض ⇆ متوسط)', sla:14, popularity:28, icon:'tune' },
  { code:'CT0007', section:'CT', name:'تغيير نوع المقياس (أحادي/ثلاثي) — زيادة قوة', sla:7, popularity:64, icon:'memory' },
  { code:'CT0008', section:'CT', name:'تغيير موقع المقياس داخل المبنى', sla:5, popularity:51, fixedPrice:35000, icon:'move_to_inbox' },
  { code:'CT0009', section:'CT', name:'فحص مقياس / تبديل / صيانة', sla:3, popularity:88, priceNote:'يبدأ من 12,500 د.ع', icon:'fact_check' },

  // ---- CB ----
  { code:'CB0001', section:'CB', name:'دفع قائمة أجور كهرباء', sla:1, popularity:99, icon:'payments' },
  { code:'CB0002', section:'CB', name:'تقرير استهلاك مفصّل (مع الدفعات)', sla:2, popularity:55, icon:'analytics' },
  { code:'CB0003', section:'CB', name:'مراجعة تفاصيل القائمة / قائمة مصحّحة', sla:3, popularity:67, icon:'edit_document' },
  { code:'CB0004', section:'CB', name:'نسخة قائمة أجور (بدل مفقود)', sla:1, popularity:44, icon:'description' },
  { code:'CB0005', section:'CB', name:'إجراءات دفعات متأخرة — قسيمة متأخرة', sla:3, popularity:52, icon:'history' },
  { code:'CB0006', section:'CB', name:'تسوية مالية / تقسيط / ترتيبات دفع', sla:5, popularity:81, icon:'request_quote' },

  // ---- CA ----
  { code:'CA0001', section:'CA', name:'إبلاغ عن تلاعب في المقياس أو الوصلة', sla:1, popularity:71, icon:'gpp_bad' },
  { code:'CA0002', section:'CA', name:'إبلاغ عن حالة خطر', sla:1, popularity:79, urgent:true, icon:'warning' },
  { code:'CA0003', section:'CA', name:'إبلاغ عن أضرار أو فقد في مكونات الشبكة', sla:3, popularity:48, icon:'build' },
  { code:'CA0004', section:'CA', name:'شكوى إدارية (نوعية الخدمة / التعامل)', sla:5, popularity:36, icon:'support_agent' },
];

// ---- Pricing tables (excerpted from the official rate sheet 2026) ----
window.PRICING = {
  inspection: { // أجور الكشف
    label: 'أجور الكشف',
    items: [
      { key:'res', name:'منزلي', amount:15000 },
      { key:'com', name:'تجاري', amount:100000 },
      { key:'agr', name:'زراعي', amount:50000 },
      { key:'ind', name:'صناعي', amount:150000 },
      { key:'gov', name:'حكومي', amount:150000 },
    ],
  },
  install: {
    label: 'تجهيز ونصب',
    items: [
      { key:'illegal_meter', name:'مقياس المستهلك غير النظامي', amount:62500 },
      { key:'meter_cover',   name:'الغطاء السفلي للمقياس',       amount:12500 },
    ],
  },
  reconnect: {
    label: 'قطع وإعادة التيار — بسبب الديون',
    items: [
      { key:'res1', name:'منزلي طور واحد', amount:50000 },
      { key:'res3', name:'منزلي 3 أطوار', amount:100000 },
      { key:'com1', name:'تجاري طور واحد', amount:150000 },
      { key:'com3', name:'تجاري 3 أطوار', amount:250000 },
      { key:'ind1', name:'صناعي طور واحد', amount:100000 },
      { key:'ind3', name:'صناعي 3 أطوار', amount:250000 },
      { key:'agr1', name:'زراعي طور واحد', amount:75000 },
      { key:'agr3', name:'زراعي 3 أطوار', amount:100000 },
      { key:'gov1', name:'حكومي طور واحد', amount:100000 },
      { key:'gov3', name:'حكومي 3 أطوار', amount:250000 },
      { key:'mv11', name:'جهد 11 ك.ف.', amount:500000 },
    ],
  },
};

window.SECTION_MAP = Object.fromEntries(window.SECTIONS.map(s => [s.code, s]));
window.SERVICE_MAP = Object.fromEntries(window.SERVICES.map(s => [s.code, s]));

window.fmt = (n) => new Intl.NumberFormat('ar-IQ').format(n);
window.fmtIQD = (n) => window.fmt(n) + ' د.ع';

// Recent cases (mock)
window.RECENT_CASES = [
  { id:'TQ-2026-08-1417', svc:'CS0001', subscriber:'علي عبدالله حسين',  status:'فحص ميداني',    fee:135000,  age:'منذ ساعتين', officer:'م. كرار',  priority:'standard' },
  { id:'TQ-2026-08-1413', svc:'CT0009', subscriber:'هدى محمود إبراهيم', status:'بانتظار الدفع', fee:25000,   age:'منذ 4 ساعات', officer:'م. زينب',  priority:'standard' },
  { id:'TQ-2026-08-1409', svc:'CB0006', subscriber:'حسن جاسم العبيدي',  status:'موافقة مدير',   fee:0,       age:'أمس',         officer:'م. أحمد',  priority:'vip' },
  { id:'TQ-2026-08-1407', svc:'CA0002', subscriber:'سرى ناجي كاظم',     status:'فريق طوارئ',    fee:0,       age:'أمس',         officer:'م. مصطفى', priority:'urgent' },
  { id:'TQ-2026-08-1402', svc:'CS0011', subscriber:'أحمد علي الجبوري',  status:'تحقق قانوني',   fee:0,       age:'منذ يومين',   officer:'م. كرار',  priority:'standard' },
  { id:'TQ-2026-08-1395', svc:'CT0008', subscriber:'مريم رياض الزبيدي', status:'قيد التنفيذ',   fee:35000,   age:'منذ 3 أيام',  officer:'م. زينب',  priority:'standard' },
];

// Dashboard KPIs
window.KPIS = {
  todayCases: 84,
  todayDelta: 12,
  pending: 213,
  collected: 4810000,
  satisfaction: 94,
};


// =============================================================
// ADVISORIES — official guidance, hazards, reviews, FAQs per service
// t: danger | review | scale | tip | faq
// =============================================================
window.ADVISORIES = {
  CS0001: [
    { t: 'review', x: 'تدقيق سند الملكية (الطابو) وكتاب التأييد إلزامي قبل قبول الطلب — مراجعة رسمية دقيقة' },
    { t: 'scale',  x: 'قابل للتوسع: نفس النموذج يغطي المجمعات السكنية والمشاريع الاستثمارية' },
    { t: 'faq',    x: 'هل تكفي إجازة البناء بدل كتاب ضريبة العقار؟ نعم — أحد المستندين يكفي' },
  ],
  CS0011: [
    { t: 'review', x: 'حالات الورثة تتطلب قساماً شرعياً موثقاً وحضور أو تخويل جميع الورثة' },
    { t: 'faq',    x: 'هل يشترط تسديد الذمم قبل النقل؟ نعم — براءة ذمة المشترك السابق شرط' },
  ],
  CT0001: [
    { t: 'danger', x: 'عمل ميداني على الشبكة الحية — يتطلب إذن سلامة وفصل تيار منسّقاً مع الصيانة' },
    { t: 'review', x: 'كشف هندسي مشترك (فنية + خدمات) قبل احتساب الأجور النهائية' },
  ],
  CT0002: [
    { t: 'danger', x: 'تغيير ركيزة محولة = إيقاف تغذية حي كامل — يحتاج موافقة قسم التشغيل وجدولة ليلية' },
  ],
  CT0009: [
    { t: 'review', x: 'فحص المقياس يوثق بمحضر رسمي موقع من لجنة الفحص — لا يقبل الطعن بعد التوقيع' },
    { t: 'faq',    x: 'متى يكون الفحص مجانياً؟ إذا ثبت عطل المقياس من الشركة وليس من المشترك' },
  ],
  CB0006: [
    { t: 'review', x: 'التقسيط فوق ٥ ملايين د.ع يتطلب موافقة مدير الفرع وكفيلاً موظفاً' },
    { t: 'faq',    x: 'كم الدفعة الأولى؟ ٢٥٪ من إجمالي الذمة كحد أدنى' },
  ],
  CA0001: [
    { t: 'danger', x: 'حالات التلاعب تحوّل للجنة التجاوزات والقانونية — لا تتعامل مع المشترك مباشرة' },
    { t: 'review', x: 'يحرر محضر ضبط أصولي بحضور شاهدين قبل أي إجراء' },
  ],
  CA0002: [
    { t: 'danger', x: 'بلاغ خطر = أولوية قصوى: إشعار فرق الطوارئ فوراً قبل تسجيل الطلب' },
  ],
};
window.ADVISORY_DEFAULTS = {
  CS: [
    { t: 'review', x: 'تحقق من هوية مقدم الطلب وصفته القانونية قبل التعبئة' },
    { t: 'tip',    x: 'أكمل الحقول أمام المشترك مباشرة — الحفظ التلقائي يحمي عملك' },
  ],
  CT: [
    { t: 'danger', x: 'خدمة ذات طابع ميداني — التزم بإجراءات السلامة المعتمدة' },
    { t: 'review', x: 'الأجور النهائية تحدد بعد الكشف الموقعي وليس عند التقديم' },
  ],
  CB: [
    { t: 'review', x: 'طابق رقم الحساب مع القائمة الأصلية قبل أي إجراء مالي' },
    { t: 'faq',    x: 'هل يحتاج المشترك حضوراً شخصياً؟ يكفي وكيل بتخويل رسمي' },
  ],
  CA: [
    { t: 'tip',    x: 'سجّل البلاغ بدقة: الموقع، الوصف، ورقم هاتف المبلّغ للمتابعة' },
    { t: 'review', x: 'الشكاوى الإدارية تحوّل لمسؤول المركز خلال ٢٤ ساعة كحد أقصى' },
  ],
};
window.getAdvisories = function (code) {
  var svc = window.SERVICE_MAP[code];
  var spec = window.ADVISORIES[code] || [];
  var base = svc ? (window.ADVISORY_DEFAULTS[svc.section] || []) : [];
  return spec.length ? spec : base;
};
