// =============================================================
// Tadfuq Al-Khayr — service form schemas (all 31 services)
// Declarative. final_form.jsx renders any service from its schema.
// =============================================================

(function () {

  // ---- shared field libraries -------------------------------------------
  const APPLICANT = {
    title: 'بيانات مقدم الطلب', icon: 'person',
    rows: [
      [ {k:'name',    l:'الاسم الرباعي واللقب', ph:'مثال: علي عبدالله حسين الكرخي'},
        {k:'nid',     l:'رقم البطاقة الموحدة / الهوية', ph:'199801012345', mono:true} ],
      [ {k:'housing', l:'رقم بطاقة السكن', mono:true},
        {k:'phone',   l:'رقم هاتف / موبايل', ph:'07xxxxxxxxx', mono:true} ],
    ],
  };

  const APPLICANT_WITH_RELATION = {
    title: 'بيانات مقدم الطلب وصفته', icon: 'person',
    rows: [
      [ {k:'name',     l:'الاسم الرباعي واللقب'},
        {k:'nid',      l:'رقم البطاقة الموحدة', mono:true} ],
      [ {k:'phone',    l:'الهاتف / الموبايل', mono:true},
        {k:'relation', l:'الصفة', type:'select',
          options:['المشترك','وكيل قانوني','وريث','مستأجر مفوّض','صاحب الشأن']} ],
    ],
  };

  const ACCOUNT_BLOCK = {
    title: 'بيانات الاشتراك', icon: 'tag',
    rows: [
      [ {k:'acct',     l:'رقم الحساب المخصص', mono:true, ph:'مثال: 4081-552'},
        {k:'subName',  l:'اسم المشترك على الفاتورة'} ],
      [ {k:'meterNo',  l:'رقم المقياس', mono:true},
        {k:'subClass', l:'صنف الاشتراك الحالي', type:'select',
          options:['منزلي','تجاري','صناعي','حكومي','زراعي']} ],
    ],
  };

  const ADDRESS_BLOCK = {
    title: 'عنوان العقار', icon: 'home_pin',
    rows: [
      [ {k:'hay',l:'حي'}, {k:'mahalla',l:'محلة',mono:true}, {k:'zuqaq',l:'زقاق',mono:true}, {k:'dar',l:'دار',mono:true} ],
      [ {k:'ramz',l:'الترميز الجديد',mono:true}, {k:'piece',l:'القطعة والمقاطعة'},
        {k:'floor',l:'الطابق'}, {k:'apt',l:'رقم الشقة',mono:true} ],
      [ {k:'gps',l:'GPS / نقطة دالة', ph:'33.3152, 44.3661'},
        {k:'landmark',l:'علامة مميزة', ph:'قرب جامع/مدرسة…'} ],
    ],
  };

  const CLASSIFICATION = (opts = ['منزلي','تجاري','صناعي','حكومي','زراعي'], phases = ['أحادي الطور','ثلاثي الطور']) => ({
    title: 'صنف الاشتراك المطلوب', icon: 'category',
    kind: 'classification', classes: opts, phases,
  });

  const DOCS_NEW_SUB = [
    { n:'نسخة من هوية الأحوال المدنية', all:true },
    { n:'نسخة من بطاقة السكن', all:true },
    { n:'كتاب تأييد سكن مصدّق', all:true },
    { n:'صورة موثّقة للقسام الشرعي', opt:'عند اللزوم' },
    { n:'كتاب ضريبة العقار' },
    { n:'إجازة البناء مصدّقة', opt:'بدل ضريبة العقار' },
    { n:'سند قيد التسجيل للعقار (الطابو)' },
    { n:'صورة من قائمة حساب المجاور' },
    { n:'كتاب التنمية الصناعية', opt:'صناعي', for:'صناعي' },
    { n:'كتاب المضخة الزراعية', opt:'زراعي', for:'زراعي' },
    { n:'كتاب من الدائرة', opt:'حكومي', for:'حكومي' },
    { n:'إجازة الاستثمار', opt:'استثماري', for:'مجمع سكني|مشروع استثماري' },
  ];

  const DOCS_OWNERSHIP = [
    { n:'هوية أحوال البائع والمشتري', all:true },
    { n:'بطاقة سكن البائع والمشتري', all:true },
    { n:'عقد بيع موثّق أو صك انتقال ملكية', all:true },
    { n:'سند الطابو الجديد', all:true },
    { n:'براءة ذمة من مركز الخدمة', all:true },
    { n:'قسام شرعي موثّق', opt:'ورثة' },
    { n:'تخويل من جميع الورثة', opt:'ورثة متعددون' },
    { n:'كتاب لجنة فصل العقارات', opt:'فصل عقارات' },
  ];

  const DOCS_DAMAGE_REPORT = [
    { n:'هوية أحوال المبلّغ', all:true },
    { n:'صور للموقع والضرر (٤ زوايا)', all:true },
    { n:'شهادة شهود (اختياري)', opt:'إن وُجدت' },
    { n:'تقرير شرطة', opt:'حوادث مرورية/إجرامية' },
  ];

  const DOCS_BILLING = [
    { n:'نسخة القائمة الأصلية', all:true },
    { n:'هوية المشترك', all:true },
    { n:'كشف حساب من المركز', opt:'تسوية مالية' },
    { n:'كتاب رسمي', opt:'دوائر حكومية' },
  ];

  const DOCS_INSPECTION = [
    { n:'هوية المشترك', all:true },
    { n:'صورة المقياس الحالي', all:true },
    { n:'نسخة آخر قائمة', all:true },
  ];

  const DECL_GENERIC = `أقر أنا الموقع أدناه بصحة المعلومات المقدّمة وأتحمّل المسؤولية القانونية عن أي بيان مخالف للحقيقة. كما أتعهّد بالامتثال لأنظمة شركة توزيع الكهرباء — كهرباء الرصافة — والتعليمات الصادرة عنها بخصوص هذه الخدمة.`;

  const DECL_NEW_SUB = `أقر أنا الموقع أدناه وأتعهد والتزم لشركة توزيع الكهرباء بما يلي:
أولاً: أقر بعلمي وموافقتي وأنا بكامل أهليتي القانونية أن الأساس القانوني الذي ينظم علاقتي بشركة تدفّق الخير والشركة العامة لتوزيع كهرباء بغداد — كهرباء الرصافة هي الأنظمة الصادرة عن هذه الشركة في كل ما يتعلق بشؤون الكهرباء.
ثانياً: ألتزم وأتعهّد بعدم التعرّض للتجهيزات الكهربائية الخاصة بالشركة وعدم السماح لأي شخص بالتزود بالتيار من اشتراكي.
ثالثاً: أقر بأنني أُخلي مسؤولية الشركة عن أية أضرار ناجمة عن مخالفة الالتزامات أو عن انقطاع التيار لأعمال الصيانة.`;

  const DECL_TRANSFER = `أقر أنا (نحن) الموقعون أدناه بتنازلي عن اشتراك الكهرباء المذكور أعلاه وانتقال جميع الحقوق والالتزامات المترتبة عليه إلى صاحب الملكية الجديد، وأتحمّل المسؤولية الكاملة عن صحة المستندات وعن أي ذمة سابقة لتاريخ النقل.`;

  const DECL_HAZARD = `أقر أن البلاغ المقدّم يستند إلى ملاحظة فعلية ولا أرفع هذا البلاغ كيداً، وأن المعلومات الواردة فيه صحيحة على حد علمي، وأوافق على متابعة التحقيق إذا اقتضت الحاجة.`;

  // ---- fee logic helpers -------------------------------------------------
  const FEES_INSPECTION_PLUS_METER = {
    kind: 'inspection_plus_meter',
    base: { 'منزلي':15000, 'تجاري':100000, 'صناعي':150000, 'حكومي':150000, 'زراعي':50000, 'مجمع سكني':150000, 'مشروع استثماري':150000 },
    addons: [
      { k:'meter', l:'مقياس المستهلك', amount:62500 },
      { k:'cover', l:'الغطاء السفلي للمقياس', amount:12500 },
    ],
  };

  const FEES_FIXED = (amount, label='أجور الخدمة') => ({ kind:'fixed', amount, label });

  const FEES_RECONNECT = {
    kind: 'reconnect',
    table: {
      'منزلي طور واحد':50000,'منزلي 3 أطوار':100000,
      'تجاري طور واحد':150000,'تجاري 3 أطوار':250000,
      'صناعي طور واحد':100000,'صناعي 3 أطوار':250000,
      'زراعي طور واحد':75000,'زراعي 3 أطوار':100000,
      'حكومي طور واحد':100000,'حكومي 3 أطوار':250000,
      'جهد 11 ك.ف.':500000,
    },
  };

  const FEES_INSPECTION_TABLE = {
    kind: 'inspection_table',
    table: {
      'فحص طور واحد — مقر الدائرة':12500,
      'فحص طور واحد — موقع العمل':22500,
      'فحص 3 أطوار — مقر الدائرة':25000,
      'فحص 3 أطوار — موقع العمل':37500,
      'فحص 3 أطوار قدرة عظمى — مقر الدائرة':31250,
      'فحص 3 أطوار قدرة عظمى — موقع العمل':60000,
    },
  };

  const FEES_METER_SWAP = {
    kind: 'meter_swap',
    table: {
      'منزلي طور واحد':12500,'منزلي 3 أطوار':17500,
      'تجاري طور واحد':25000,'تجاري 3 أطوار':50000,
      'صناعي طور واحد':50000,'صناعي 3 أطوار مباشر':150000,
      'صناعي 3 أطوار غير مباشر':300000,
      'زراعي طور واحد':37500,'زراعي 3 أطوار':75000,
      'حكومي طور واحد':37500,'حكومي 3 أطوار':75000,
    },
  };

  const FEES_INSTALLMENT = {
    kind: 'installment',
    monthlyCap: 6,
    minDownPct: 25,
  };

  const FEES_NONE = { kind:'none' };

  // ---- per-service custom field groups ----------------------------------
  const REASON_FREETEXT = (title='سبب الطلب', icon='subject') => ({
    title, icon,
    rows: [[ {k:'reason', l:'تفاصيل', type:'textarea', ph:'اكتب وصفاً واضحاً للسبب…', full:true} ]],
  });

  const URGENCY_SEG = {
    title: 'مستوى الأولوية', icon: 'priority_high',
    kind: 'urgency',
    levels: ['طبيعي','عاجل','طارئ — خطر مباشر'],
  };

  // ===========================================================
  // PER-SERVICE SCHEMAS
  // ===========================================================
  const F = {};

  // ---- CS — Subscriptions ----
  F.CS0001 = {
    paperTitle: 'طلب عمل اشتراك جديد',
    sections: [
      APPLICANT,
      CLASSIFICATION(['منزلي','تجاري','صناعي','حكومي','زراعي','مجمع سكني','مشروع استثماري']),
      ADDRESS_BLOCK,
      { kind:'documents', list: DOCS_NEW_SUB },
    ],
    fees: FEES_INSPECTION_PLUS_METER,
    declaration: DECL_NEW_SUB,
    routing: ['خدمات المشتركين','الدائرة الفنية','الدائرة القانونية','الصندوق','شؤون الموظفين','إلغاء الطلب'],
    extraDocsTable: ['كتاب ضريبة العقار','كتاب التنمية الصناعية','كتاب الدائرة الحكومية','إجازة الاستثمار','القسام الشرعي'],
  };

  F.CS0002 = {
    paperTitle: 'طلب إضافة اسم منتفع للفاتورة',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'بيانات المنتفع المراد إضافته', icon:'person_add',
        rows:[
          [{k:'benefName',l:'الاسم الرباعي للمنتفع'},{k:'benefNid',l:'الهوية الموحدة',mono:true}],
          [{k:'benefRelation',l:'العلاقة',type:'select',options:['مستأجر','زوجة','ابن/ابنة','أخ/أخت','وكيل','أخرى']},
           {k:'leaseDate',l:'تاريخ بدء العلاقة',type:'date'}],
        ] },
      { kind:'documents', list:[
        { n:'هوية المشترك الأصلي', all:true },
        { n:'هوية المنتفع', all:true },
        { n:'بطاقة سكن المنتفع', all:true },
        { n:'عقد إيجار موثّق', opt:'مستأجر', for:'مستأجر' },
        { n:'صلة قرابة', opt:'أقارب' },
      ] },
    ],
    fees: FEES_NONE,
    declaration: DECL_GENERIC,
  };

  F.CS0003 = {
    paperTitle: 'طلب تغيير صنف الاشتراك',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'تغيير الصنف', icon:'sync_alt', kind:'class_change',
        from:['منزلي','تجاري','صناعي','حكومي','زراعي'],
        to:  ['منزلي','تجاري','صناعي','حكومي','زراعي'] },
      REASON_FREETEXT('مبرر التغيير'),
      { kind:'documents', list:[
        { n:'هوية المشترك', all:true },
        { n:'سند الطابو أو إجازة البناء', all:true },
        { n:'كتاب الجهة المختصة (تجاري/صناعي/حكومي)', opt:'حسب الصنف الجديد' },
        { n:'كشف فني يثبت مطابقة الحمل', all:true },
      ] },
    ],
    fees: { kind:'inspection_only', base: FEES_INSPECTION_PLUS_METER.base, label:'أجور الكشف للصنف الجديد' },
    declaration: DECL_GENERIC,
  };

  F.CS0004 = {
    paperTitle: 'طلب إيقاف خدمة / قطع تيار مؤقت',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'فترة الإيقاف المطلوبة', icon:'event_busy',
        rows:[
          [{k:'fromDate',l:'من تاريخ',type:'date'},{k:'toDate',l:'إلى تاريخ',type:'date'}],
          [{k:'stopReason',l:'سبب الإيقاف',type:'select',
            options:['سفر طويل','إغلاق العقار','إعادة إعمار','أخرى']},
           {k:'notes',l:'ملاحظات إضافية'}],
        ] },
    ],
    fees: FEES_NONE,
    declaration: DECL_GENERIC,
  };

  F.CS0005 = {
    paperTitle: 'طلب تفعيل اشتراك موقوف',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'سبب التفعيل', icon:'restart_alt', kind:'reason_seg',
        options:['عودة سكن','تشغيل عقار','إنهاء سفر','تسوية ذمم','أخرى'] },
      { kind:'documents', list:[
        { n:'هوية المشترك', all:true },
        { n:'براءة ذمة من قسم الجباية', all:true },
        { n:'إيصال تسوية الدفعات السابقة', opt:'إن وُجدت' },
      ] },
    ],
    fees: FEES_RECONNECT,
    declaration: DECL_GENERIC,
  };

  F.CS0006 = {
    paperTitle: 'طلب إلغاء اشتراك (غلق حساب)',
    sections: [
      APPLICANT_WITH_RELATION,
      ACCOUNT_BLOCK,
      REASON_FREETEXT('سبب الإلغاء'),
      { kind:'documents', list:[
        { n:'هوية المشترك', all:true },
        { n:'سند الطابو الحديث', all:true },
        { n:'براءة ذمة كاملة', all:true },
        { n:'محضر استلام مقياس', all:true },
      ] },
    ],
    fees: FEES_NONE,
    declaration: `أقر بطلب إلغاء الاشتراك المذكور أعلاه نهائياً، وأخلي مسؤولية الشركة من أي مطالبة لاحقة بعد إتمام التسوية المالية.`,
  };

  F.CS0007 = {
    paperTitle: 'اعتراض على قائمة أو قطع تيار',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'تفاصيل القائمة المعترض عليها', icon:'receipt_long',
        rows:[
          [{k:'invoiceNo',l:'رقم القائمة',mono:true},{k:'invoicePeriod',l:'فترة الاستهلاك'}],
          [{k:'invoiceAmount',l:'مبلغ القائمة',type:'number',unit:'د.ع',mono:true},
           {k:'lastReading',l:'آخر قراءة معتمدة',mono:true}],
        ] },
      REASON_FREETEXT('مبرر الاعتراض'),
      { kind:'documents', list:[
        { n:'نسخة من القائمة', all:true },
        { n:'صورة المقياس وآخر قراءة', all:true },
        { n:'إيصالات الدفعات السابقة', opt:'إن وُجدت' },
      ] },
    ],
    fees: FEES_NONE,
    declaration: DECL_GENERIC,
  };

  F.CS0008 = {
    paperTitle: 'طلب تعديل بيانات / عنوان مشترك',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'البيانات الحالية', icon:'history',
        rows:[
          [{k:'oldAddr',l:'العنوان كما هو مسجّل',full:true}],
          [{k:'oldPhone',l:'الهاتف المسجّل',mono:true},{k:'oldName',l:'الاسم على القائمة'}],
        ] },
      { title:'البيانات الجديدة المطلوبة', icon:'edit_location',
        rows:[
          [{k:'newHay',l:'حي'},{k:'newMahalla',l:'محلة',mono:true},{k:'newZuqaq',l:'زقاق',mono:true},{k:'newDar',l:'دار',mono:true}],
          [{k:'newRamz',l:'الترميز الجديد',mono:true},{k:'newPhone',l:'هاتف جديد',mono:true}],
        ] },
      { kind:'documents', list:[
        { n:'هوية المشترك', all:true },
        { n:'بطاقة السكن المحدّثة', all:true },
        { n:'كتاب الترميز الجديد من البلدية', opt:'تغيير ترميز' },
      ] },
    ],
    fees: FEES_NONE,
    declaration: DECL_GENERIC,
  };

  F.CS0009 = {
    paperTitle: 'طلب قراءة مقياس',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'تفاصيل الطلب', icon:'speed',
        rows:[
          [{k:'readPurpose',l:'الغرض من القراءة',type:'select',
            options:['اعتراض على قائمة','بيع عقار','مراجعة استهلاك','أخرى']},
           {k:'preferredDate',l:'الموعد المفضّل',type:'date'}],
        ] },
      { kind:'documents', list: DOCS_INSPECTION },
    ],
    fees: FEES_FIXED(25000, 'أجور قراءة المقياس'),
    declaration: DECL_GENERIC,
  };

  F.CS0010 = {
    paperTitle: 'طلب اشتراك مؤقت',
    sections: [
      APPLICANT,
      { title:'مدّة الاشتراك المؤقت', icon:'event',
        rows:[
          [{k:'fromDate',l:'من تاريخ',type:'date'},{k:'toDate',l:'إلى تاريخ',type:'date'}],
          [{k:'purpose',l:'الغرض',type:'select',
            options:['موقع بناء','مهرجان/فعالية','تشغيل ضخ','معرض مؤقت','أخرى']},
           {k:'expectedLoad',l:'الحمل المتوقع (كيلوواط)',type:'number',unit:'kW'}],
        ] },
      CLASSIFICATION(['تجاري','صناعي','حكومي']),
      ADDRESS_BLOCK,
      { kind:'documents', list:[
        { n:'هوية صاحب المشروع', all:true },
        { n:'إجازة البناء أو الفعالية', all:true },
        { n:'موافقة الجهة المختصة', all:true },
        { n:'تعهّد بإزالة التمديدات بعد انتهاء المدة', all:true },
      ] },
    ],
    fees: { kind:'temp_daily', daily:3500, inspectionFromClass: FEES_INSPECTION_PLUS_METER.base },
    declaration: `أتعهد بإنهاء الاشتراك المؤقت بانتهاء المدة المذكورة وإزالة التمديدات على نفقتي الخاصة، وأقبل تحويل أي تجاوز إلى مطالبة قانونية.`,
  };

  F.CS0011 = {
    paperTitle: 'طلب نقل ملكية اشتراك',
    sections: [
      { title:'بيانات البائع / المتنازل', icon:'logout',
        rows:[
          [{k:'sellerName',l:'الاسم الرباعي'},{k:'sellerNid',l:'الهوية الموحدة',mono:true}],
          [{k:'sellerPhone',l:'الهاتف',mono:true},{k:'sellerRelation',l:'الصفة',type:'select',
            options:['المالك السابق','وكيل قانوني','أحد الورثة','أخرى']}],
        ] },
      { title:'بيانات المشتري / المنتقل إليه', icon:'login',
        rows:[
          [{k:'buyerName',l:'الاسم الرباعي'},{k:'buyerNid',l:'الهوية الموحدة',mono:true}],
          [{k:'buyerPhone',l:'الهاتف',mono:true},{k:'buyerHousing',l:'بطاقة السكن',mono:true}],
        ] },
      ACCOUNT_BLOCK,
      { title:'نوع النقل', icon:'swap_horiz', kind:'reason_seg',
        options:['بيع وشراء','وراثة','هبة','فصل عقارات','حكم محكمة'] },
      { kind:'documents', list: DOCS_OWNERSHIP },
    ],
    fees: FEES_FIXED(25000, 'أجور تغيير اسم المشترك'),
    declaration: DECL_TRANSFER,
  };

  // ---- CT — Technical ----
  F.CT0001 = {
    paperTitle: 'شكوى ضرر / طلب تغيير موقع عامود',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'تفاصيل العامود والموقع المطلوب', icon:'bolt',
        rows:[
          [{k:'poleNo',l:'رقم العامود (إن وُجد)',mono:true},{k:'poleType',l:'نوع العامود',type:'select',
            options:['كونكريتي','حديدي','خشبي']}],
          [{k:'oldLoc',l:'الموقع الحالي',full:true}],
          [{k:'newLoc',l:'الموقع الجديد المقترح',full:true}],
        ] },
      REASON_FREETEXT('سبب نقل/تغيير العامود'),
      { kind:'documents', list: DOCS_DAMAGE_REPORT },
    ],
    fees: FEES_FIXED(1000000, 'أجور تغيير موقع عامود'),
    declaration: `أقر بصحة طلب نقل العامود وأتحمّل مسؤولية أي تأثير على المشتركين المجاورين، وأوافق على الكشف الميداني المشترك قبل تنفيذ العمل.`,
  };

  F.CT0002 = {
    paperTitle: 'شكوى ضرر / طلب تغيير موقع ركيزة محولة',
    sections: [
      APPLICANT,
      { title:'بيانات المحولة', icon:'transform',
        rows:[
          [{k:'trafoNo',l:'رقم المحولة',mono:true},{k:'trafoKva',l:'سعتها (kVA)',type:'number',mono:true}],
          [{k:'currentLoc',l:'الموقع الحالي',full:true}],
          [{k:'newLoc',l:'الموقع الجديد المقترح',full:true}],
        ] },
      REASON_FREETEXT('مبرر تغيير الموقع'),
      { kind:'documents', list:[
        ...DOCS_DAMAGE_REPORT,
        { n:'موافقة قسم التشغيل والتخطيط', all:true },
        { n:'مخطط هندسي للموقع الجديد', all:true },
      ] },
    ],
    fees: FEES_FIXED(2500000, 'أجور تغيير موقع ركيزة محولة'),
    declaration: `أقر بأن تنفيذ تغيير موقع الركيزة يستوجب فصل التغذية عن منطقة واسعة وأقبل بالجدولة الليلية المعتمدة من قسم التشغيل.`,
  };

  F.CT0003 = {
    paperTitle: 'طلب تغيير كابل مشترك',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'تفاصيل الكابل', icon:'cable',
        rows:[
          [{k:'cableLength',l:'الطول التقريبي (متر)',type:'number',unit:'م',mono:true},
           {k:'cableSize',l:'المقطع المطلوب (mm²)',type:'select',options:['6','10','16','25','35','50','70','95']}],
          [{k:'cableReason',l:'سبب التغيير',type:'select',
            options:['تلف الكابل','زيادة قوة التغذية','تغيير موقع المقياس','أخرى']}],
        ] },
      { kind:'documents', list: DOCS_INSPECTION },
    ],
    fees: { kind:'cable_length', perMeter:0, note:'يُحدّد بعد الكشف الموقعي' },
    declaration: DECL_GENERIC,
  };

  F.CT0004 = {
    paperTitle: 'طلب تجزئة اشتراك / تحويل 3 فاز إلى 3 اشتراكات',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'تفاصيل التجزئة', icon:'call_split',
        rows:[
          [{k:'unitsCount',l:'عدد الوحدات المراد فصلها',type:'number',mono:true},
           {k:'phasePerUnit',l:'نوع كل اشتراك',type:'select',options:['أحادي الطور','ثلاثي الطور','مزيج']}],
        ] },
      { kind:'documents', list:[
        { n:'سند الطابو يبيّن الوحدات', all:true },
        { n:'مخطط هندسي للوحدات', all:true },
        { n:'هويات أصحاب كل وحدة', all:true },
        { n:'إجازة بناء أو فصل وحدات', all:true },
      ] },
    ],
    fees: { kind:'inspection_only', base:FEES_INSPECTION_PLUS_METER.base, label:'أجور كشف لكل اشتراك جديد' },
    declaration: DECL_GENERIC,
  };

  F.CT0005 = {
    paperTitle: 'طلب تجميع أحمال / دمج اشتراكات',
    sections: [
      APPLICANT,
      { title:'الاشتراكات المراد دمجها', icon:'merge',
        rows:[
          [{k:'acct1',l:'رقم الاشتراك (١)',mono:true},{k:'acct2',l:'رقم الاشتراك (٢)',mono:true}],
          [{k:'acct3',l:'رقم الاشتراك (٣)',mono:true},{k:'totalLoad',l:'الحمل الكلي المتوقّع (kW)',type:'number',mono:true}],
        ] },
      CLASSIFICATION(['تجاري','صناعي']),
      { kind:'documents', list:[
        { n:'هوية المشترك', all:true },
        { n:'كتاب التنمية الصناعية أو الإجازة التجارية', all:true },
        { n:'مخطط الحمل الموقّع من مهندس مختص', all:true },
        { n:'موافقة قسم التخطيط', all:true },
      ] },
    ],
    fees: { kind:'inspection_only', base:{'تجاري':100000,'صناعي':150000}, label:'أجور الكشف للحمل المدموج' },
    declaration: DECL_GENERIC,
  };

  F.CT0006 = {
    paperTitle: 'طلب تعديل جهد اشتراك',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'الجهد', icon:'tune', kind:'class_change',
        from:['منخفض (380V)'], to:['متوسط (11kV)','متوسط (33kV)'] },
      REASON_FREETEXT('مبرر تعديل الجهد'),
      { kind:'documents', list:[
        { n:'إجازة استثمار أو صناعي', all:true },
        { n:'مخطط الحمل', all:true },
        { n:'موافقة هندسية', all:true },
      ] },
    ],
    fees: { kind:'note', text:'تُحتسب الأجور حسب جدول هندسة الجهد المتوسط' },
    declaration: DECL_GENERIC,
  };

  F.CT0007 = {
    paperTitle: 'طلب تغيير نوع المقياس / زيادة قوة',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'المقياس المطلوب', icon:'memory',
        rows:[
          [{k:'currentType',l:'النوع الحالي',type:'select',options:['أحادي الطور','ثلاثي الطور']},
           {k:'newType',l:'النوع المطلوب',type:'select',options:['أحادي الطور','ثلاثي الطور','ثلاثي قدرة عظمى']}],
          [{k:'newAmps',l:'التيار المطلوب (Amp)',type:'number',mono:true},
           {k:'usageReason',l:'سبب الزيادة',type:'select',
            options:['إضافة أجهزة','توسعة محل','مشروع جديد','أخرى']}],
        ] },
      { kind:'documents', list: DOCS_INSPECTION },
    ],
    fees: FEES_METER_SWAP,
    declaration: DECL_GENERIC,
  };

  F.CT0008 = {
    paperTitle: 'طلب تغيير موقع المقياس داخل المبنى',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'موقع المقياس', icon:'move_to_inbox',
        rows:[
          [{k:'fromLoc',l:'الموقع الحالي للمقياس',full:true}],
          [{k:'toLoc',l:'الموقع الجديد المطلوب',full:true}],
        ] },
      REASON_FREETEXT('مبرر النقل'),
      { kind:'documents', list: DOCS_INSPECTION },
    ],
    fees: FEES_FIXED(35000, 'أجور تغيير موقع المقياس'),
    declaration: DECL_GENERIC,
  };

  F.CT0009 = {
    paperTitle: 'طلب فحص / تبديل / صيانة مقياس',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'نوع الفحص المطلوب', icon:'fact_check', kind:'reason_seg',
        options:[
          'فحص طور واحد — مقر الدائرة',
          'فحص طور واحد — موقع العمل',
          'فحص 3 أطوار — مقر الدائرة',
          'فحص 3 أطوار — موقع العمل',
          'فحص 3 أطوار قدرة عظمى — مقر الدائرة',
          'فحص 3 أطوار قدرة عظمى — موقع العمل',
        ] },
      REASON_FREETEXT('مبرر طلب الفحص'),
      { kind:'documents', list: DOCS_INSPECTION },
    ],
    fees: FEES_INSPECTION_TABLE,
    declaration: `أقر بأن نتيجة الفحص توثَّق بمحضر رسمي موقّع من لجنة الفحص وأُلزم بقبولها، وفي حال ثبت عطل المقياس من جهة الشركة تُعاد الأجور المستوفاة.`,
  };

  // ---- CB — Billing ----
  F.CB0001 = {
    paperTitle: 'تسديد قائمة أجور كهرباء',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'تفاصيل القائمة', icon:'payments',
        rows:[
          [{k:'invoiceNo',l:'رقم القائمة',mono:true},{k:'period',l:'فترة الاستهلاك'}],
          [{k:'amount',l:'المبلغ المستحق',type:'number',unit:'د.ع',mono:true},
           {k:'payMethod',l:'طريقة الدفع',type:'select',
            options:['نقداً في الصندوق','تحويل مصرفي','بطاقة ماستر','محفظة إلكترونية']}],
        ] },
      { kind:'documents', list:[
        { n:'القائمة الأصلية', all:true },
        { n:'هوية الدافع', all:true },
      ] },
    ],
    fees: FEES_NONE,
    declaration: `أقر بأن المبلغ المسدّد مطابق للقائمة المعروضة وأن الإيصال الصادر يعتبر إثبات دفع رسمياً.`,
  };

  F.CB0002 = {
    paperTitle: 'طلب تقرير استهلاك مفصّل',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'الفترة المطلوبة', icon:'analytics',
        rows:[
          [{k:'fromDate',l:'من',type:'date'},{k:'toDate',l:'إلى',type:'date'}],
          [{k:'reportPurpose',l:'الغرض من التقرير',type:'select',
            options:['مراجعة شخصية','بيع عقار','قضية قانونية','عرض على الدائرة','أخرى']}],
        ] },
      { kind:'documents', list: DOCS_BILLING },
    ],
    fees: FEES_NONE,
    declaration: DECL_GENERIC,
  };

  F.CB0003 = {
    paperTitle: 'طلب مراجعة قائمة / قائمة مصححة',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'القائمة المراد مراجعتها', icon:'edit_document',
        rows:[
          [{k:'invoiceNo',l:'رقم القائمة',mono:true},{k:'invoiceAmount',l:'المبلغ',type:'number',unit:'د.ع',mono:true}],
        ] },
      REASON_FREETEXT('سبب طلب التصحيح'),
      { kind:'documents', list: DOCS_BILLING },
    ],
    fees: FEES_NONE,
    declaration: DECL_GENERIC,
  };

  F.CB0004 = {
    paperTitle: 'طلب نسخة قائمة أجور (بدل مفقود)',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'القائمة المطلوبة', icon:'description',
        rows:[
          [{k:'period',l:'فترة القائمة'},{k:'invoiceNo',l:'رقم القائمة (إن عُرف)',mono:true}],
        ] },
      { kind:'documents', list:[
        { n:'هوية المشترك', all:true },
        { n:'إقرار بفقدان الأصل', all:true },
      ] },
    ],
    fees: FEES_NONE,
    declaration: `أقر بفقدان النسخة الأصلية وأنّ النسخة البديلة لا تستعمل لإسقاط أي ذمة مالية.`,
  };

  F.CB0005 = {
    paperTitle: 'إجراءات دفعة متأخرة / قسيمة متأخرة',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'الدفعة المتأخرة', icon:'history',
        rows:[
          [{k:'invoiceNo',l:'رقم القسيمة',mono:true},{k:'lateDays',l:'عدد أيام التأخير',type:'number',mono:true}],
          [{k:'amount',l:'مبلغ الدفعة',type:'number',unit:'د.ع',mono:true},
           {k:'lateReason',l:'سبب التأخير',type:'select',
            options:['عدم استلام القائمة','سفر','ظرف صحي','عذر مالي','أخرى']}],
        ] },
      { kind:'documents', list: DOCS_BILLING },
    ],
    fees: FEES_NONE,
    declaration: DECL_GENERIC,
  };

  F.CB0006 = {
    paperTitle: 'طلب تسوية مالية / تقسيط',
    sections: [
      APPLICANT,
      ACCOUNT_BLOCK,
      { title:'تفاصيل المديونية والاقتراح', icon:'request_quote',
        rows:[
          [{k:'totalDebt',l:'إجمالي المديونية',type:'number',unit:'د.ع',mono:true},
           {k:'downPayment',l:'الدفعة الأولى المقترحة',type:'number',unit:'د.ع',mono:true}],
          [{k:'months',l:'عدد الأشهر المقترحة',type:'number',mono:true,max:6},
           {k:'monthlyAmount',l:'القسط الشهري المقترح',type:'number',unit:'د.ع',mono:true}],
        ] },
      { title:'الكفيل (للمبالغ فوق ٥ ملايين)', icon:'verified_user',
        rows:[
          [{k:'guarantorName',l:'اسم الكفيل'},{k:'guarantorNid',l:'هوية الكفيل',mono:true}],
          [{k:'guarantorWork',l:'دائرة العمل',ph:'موظف حكومي يُفضّل'},{k:'guarantorPhone',l:'هاتف الكفيل',mono:true}],
        ] },
      { kind:'documents', list:[
        { n:'هوية المشترك', all:true },
        { n:'كشف حساب من قسم الجباية', all:true },
        { n:'هوية الكفيل وكتاب من دائرته', opt:'فوق ٥ ملايين' },
        { n:'إيصال الدفعة الأولى', all:true },
      ] },
    ],
    fees: FEES_INSTALLMENT,
    declaration: `أقر بصحة المديونية وأتعهد بالتزام جدول التقسيط، وفي حالة التأخر عن قسطين متتاليين تُفصل التغذية ويصبح المبلغ كلّه واجب الأداء فوراً.`,
  };

  // ---- CA — Reports ----
  F.CA0001 = {
    paperTitle: 'بلاغ تلاعب في المقياس / الوصلة',
    sections: [
      APPLICANT_WITH_RELATION,
      { title:'موقع التلاعب', icon:'gpp_bad',
        rows:[
          [{k:'targetName',l:'اسم المشترك المخالف (إن عُرف)'},{k:'targetAcct',l:'رقم الاشتراك',mono:true}],
          [{k:'targetAddr',l:'العنوان الدقيق للموقع',full:true}],
        ] },
      { title:'وصف التلاعب', icon:'description', kind:'reason_seg',
        options:['تجاوز بدون مقياس','عبث بختم المقياس','وصلة مباشرة','قراءة محرّفة','أخرى'] },
      REASON_FREETEXT('تفاصيل إضافية وزمن الملاحظة'),
      URGENCY_SEG,
      { kind:'documents', list:[
        { n:'هوية المبلّغ', all:true },
        { n:'صور أو فيديو من الموقع', all:true },
        { n:'شهادة شهود', opt:'إن وُجدت' },
      ] },
    ],
    fees: FEES_NONE,
    declaration: `أقر بأن البلاغ صحيح ولا أرفعه كيداً، وأوافق على إحالته للجنة التجاوزات والقانونية لاتخاذ الإجراءات اللازمة.`,
  };

  F.CA0002 = {
    paperTitle: 'بلاغ حالة خطر',
    sections: [
      APPLICANT,
      { title:'موقع الخطر', icon:'warning',
        rows:[
          [{k:'hazardAddr',l:'العنوان الدقيق',full:true}],
          [{k:'gps',l:'GPS',mono:true},{k:'landmark',l:'علامة مميزة'}],
        ] },
      { title:'نوع الخطر', icon:'priority_high', kind:'reason_seg',
        options:['عامود مائل/ساقط','كابل مكشوف/متهدّل','شرارة/حريق','صعقة كهربائية','محولة تتسرّب زيت','أخرى'] },
      URGENCY_SEG,
      REASON_FREETEXT('وصف ما رأيت'),
      { kind:'documents', list:[
        { n:'صور/فيديو من الموقع', all:true },
        { n:'رقم هاتف لمتابعة الفريق', all:true },
      ] },
    ],
    fees: FEES_NONE,
    declaration: DECL_HAZARD,
  };

  F.CA0003 = {
    paperTitle: 'بلاغ ضرر أو فقد في مكونات الشبكة',
    sections: [
      APPLICANT,
      { title:'المكوّن المتضرر', icon:'build', kind:'reason_seg',
        options:['عامود','محولة','كابل','لوحة مقاييس','إنارة شارع','أخرى'] },
      { title:'الموقع والوصف', icon:'place',
        rows:[
          [{k:'damageAddr',l:'العنوان',full:true}],
          [{k:'damageDate',l:'تاريخ الملاحظة',type:'date'},{k:'estimateLoss',l:'تقدير الضرر إن أمكن'}],
        ] },
      REASON_FREETEXT('وصف الحالة'),
      { kind:'documents', list: DOCS_DAMAGE_REPORT },
    ],
    fees: FEES_NONE,
    declaration: DECL_HAZARD,
  };

  F.CA0004 = {
    paperTitle: 'شكوى إدارية',
    sections: [
      APPLICANT,
      { title:'موضوع الشكوى', icon:'support_agent', kind:'reason_seg',
        options:['تأخير في إنجاز خدمة','تعامل غير لائق','تجاوز موظف','نوعية خدمة','شفافية الأجور','أخرى'] },
      { title:'الجهة المشكو عليها', icon:'apartment',
        rows:[
          [{k:'unitName',l:'الدائرة/الموظف (إن عُرف)'},{k:'incidentDate',l:'تاريخ الحادثة',type:'date'}],
        ] },
      REASON_FREETEXT('تفاصيل الشكوى'),
      { kind:'documents', list:[
        { n:'هوية الشاكي', all:true },
        { n:'مستندات داعمة', opt:'إن وُجدت' },
      ] },
    ],
    fees: FEES_NONE,
    declaration: `أقر بصحة الشكوى المقدّمة وأوافق على تحويلها لمسؤول المركز للمتابعة خلال ٢٤ ساعة، وأتفهّم أن الشكاوى الكيدية تعرّض صاحبها للمساءلة.`,
  };

  // ---- helpers --------------------------------------------------------
  window.SERVICE_FORMS = F;

  // Get schema for a code with safe fallback to a generic schema
  window.getFormSchema = function (code) {
    if (F[code]) return F[code];
    const svc = window.SERVICE_MAP[code];
    return {
      paperTitle: svc ? svc.name : 'طلب خدمة',
      sections: [ APPLICANT, ACCOUNT_BLOCK, REASON_FREETEXT('سبب الطلب'),
        { kind:'documents', list:[
          { n:'هوية مقدّم الطلب', all:true },
          { n:'مستندات داعمة للطلب', all:true },
        ] } ],
      fees: FEES_NONE,
      declaration: DECL_GENERIC,
    };
  };

  // Make building blocks reusable from other files if needed
  window.FORM_BUILDING = { APPLICANT, ACCOUNT_BLOCK, ADDRESS_BLOCK, CLASSIFICATION,
    DOCS_NEW_SUB, FEES_INSPECTION_PLUS_METER, FEES_NONE };
})();
