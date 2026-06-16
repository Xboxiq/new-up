// =============================================================
// Tadfuq Al-Khayr — branches & coverage map (Rasafa / eastern Baghdad)
// Each branch covers a set of mahallas (الأرقام البلدية)
// =============================================================

(function () {
  // Coverage districts (mapped to real Rasafa zones)
  window.BRANCHES = [
    {
      id: 'RS-011', name: 'الرصافة — المركز', district:'الرصافة',
      manager: 'م. أحمد كاظم الموسوي', phone: '07901-234001',
      hours: 'السبت – الخميس · 08:00 – 16:00',
      address: 'شارع الرشيد — قرب وزارة المالية القديمة',
      gps: '33.3373, 44.4106',
      mahallas: ['101','102','103','104','105','106','107','108','110','112','114'],
      subscribers: 18420, capacity:'متوسط', loadStatus:'مستقر',
      services:['CS','CT','CB','CA'],
    },
    {
      id: 'RS-014', name: 'فرع النضال', district:'الرصافة', primary:true,
      manager: 'م. كرار جواد الكناني', phone: '07902-014555',
      hours: 'السبت – الخميس · 08:00 – 16:00',
      address: 'شارع النضال — قرب ساحة الفردوس',
      gps: '33.3091, 44.4185',
      mahallas: ['901','903','905','907','909','911','913','915','917','919','921','923','925','927','929'],
      subscribers: 26310, capacity:'مرتفع', loadStatus:'تحت الضغط',
      services:['CS','CT','CB','CA'],
    },
    {
      id: 'RS-021', name: 'الكرادة الشرقية — الجادرية', district:'الكرادة الشرقية',
      manager: 'م. زينب فاضل العبيدي', phone: '07903-021889',
      hours: 'السبت – الخميس · 08:00 – 16:00',
      address: 'الجادرية — قرب جامعة بغداد',
      gps: '33.2769, 44.3744',
      mahallas: ['913','914','916','918','920','922','924','926','928'],
      subscribers: 14820, capacity:'متوسط', loadStatus:'مستقر',
      services:['CS','CT','CB'],
    },
    {
      id: 'RS-031', name: 'بغداد الجديدة', district:'بغداد الجديدة',
      manager: 'م. حسن جاسم العامري', phone: '07904-031200',
      hours: 'السبت – الخميس · 08:00 – 16:00',
      address: 'حي بغداد الجديدة — قرب جسر دياتي',
      gps: '33.3261, 44.4602',
      mahallas: ['701','703','705','707','709','711','713','715','717','719','721'],
      subscribers: 22150, capacity:'مرتفع', loadStatus:'تحت الضغط',
      services:['CS','CT','CB','CA'],
    },
    {
      id: 'RS-042', name: 'الزعفرانية', district:'الزعفرانية',
      manager: 'م. مصطفى علي الكروي', phone: '07905-042666',
      hours: 'السبت – الخميس · 08:00 – 16:00',
      address: 'الزعفرانية — قرب مجمع الصناعات',
      gps: '33.2342, 44.4977',
      mahallas: ['951','953','955','957','959','961','963','965','967','969'],
      subscribers: 16880, capacity:'متوسط', loadStatus:'مستقر',
      services:['CS','CT','CB','CA'],
    },
    {
      id: 'RS-055', name: 'الأعظمية', district:'الأعظمية',
      manager: 'م. هدى محمود إبراهيم', phone: '07906-055777',
      hours: 'السبت – الخميس · 08:00 – 16:00',
      address: 'الأعظمية — شارع عشرين',
      gps: '33.3814, 44.3666',
      mahallas: ['305','307','309','311','313','315','317','319','321','323','325','327','329'],
      subscribers: 19740, capacity:'متوسط', loadStatus:'مستقر',
      services:['CS','CT','CB','CA'],
    },
    {
      id: 'RS-063', name: 'الشعب', district:'الشعب',
      manager: 'م. سرى ناجي كاظم', phone: '07907-063300',
      hours: 'السبت – الخميس · 08:00 – 16:00',
      address: 'الشعب — قرب ملعب الشعب',
      gps: '33.3789, 44.4126',
      mahallas: ['327','329','331','333','335','337','339','341','343','345'],
      subscribers: 15960, capacity:'متوسط', loadStatus:'تحت الضغط',
      services:['CS','CT','CB'],
    },
    {
      id: 'RS-072', name: 'فلسطين — المشتل', district:'فلسطين',
      manager: 'م. عمر خالد الدليمي', phone: '07908-072450',
      hours: 'السبت – الخميس · 08:00 – 16:00',
      address: 'شارع فلسطين — قرب الباب الشرقي',
      gps: '33.3441, 44.4317',
      mahallas: ['501','503','505','507','509','511','513','515','517','519','521'],
      subscribers: 17630, capacity:'متوسط', loadStatus:'مستقر',
      services:['CS','CT','CB','CA'],
    },
    {
      id: 'RS-084', name: 'الغدير', district:'الغدير',
      manager: 'م. مريم رياض الزبيدي', phone: '07909-084120',
      hours: 'السبت – الخميس · 08:00 – 16:00',
      address: 'حي الغدير — قرب جامع الرحمن',
      gps: '33.3162, 44.4515',
      mahallas: ['603','605','607','609','611','613','615','617','619','621'],
      subscribers: 13420, capacity:'منخفض', loadStatus:'مستقر',
      services:['CS','CT','CB'],
    },
    {
      id: 'RS-095', name: 'الصدر — قطاع ١', district:'مدينة الصدر',
      manager: 'م. علي عبدالله الموسوي', phone: '07910-095900',
      hours: 'السبت – الخميس · 08:00 – 16:00',
      address: 'مدينة الصدر — قطاع ١ شارع ٣٠',
      gps: '33.3859, 44.4530',
      mahallas: ['551','552','553','554','555','556','557','558','559','560','561','562','563','564','565'],
      subscribers: 31250, capacity:'مرتفع جداً', loadStatus:'تحت الضغط الشديد',
      services:['CS','CT','CB','CA'],
    },
    {
      id: 'RS-101', name: 'الصدر — قطاع ٢', district:'مدينة الصدر',
      manager: 'م. فاطمة رحيم الزبيدي', phone: '07911-101800',
      hours: 'السبت – الخميس · 08:00 – 16:00',
      address: 'مدينة الصدر — قطاع ٢ شارع ٤٠',
      gps: '33.3927, 44.4612',
      mahallas: ['571','572','573','574','575','576','577','578','579','580','581','582'],
      subscribers: 28960, capacity:'مرتفع جداً', loadStatus:'تحت الضغط الشديد',
      services:['CS','CT','CB','CA'],
    },
    {
      id: 'RS-118', name: 'باب المعظم', district:'باب المعظم',
      manager: 'م. ياسر شاكر الطائي', phone: '07912-118450',
      hours: 'السبت – الخميس · 08:00 – 16:00',
      address: 'باب المعظم — قرب وزارة الدفاع القديمة',
      gps: '33.3539, 44.3877',
      mahallas: ['201','203','205','207','209','211','213','215','217'],
      subscribers: 11420, capacity:'منخفض', loadStatus:'مستقر',
      services:['CS','CT','CB'],
    },
  ];

  // Reverse index: mahalla code -> branch id
  window.MAHALLA_INDEX = {};
  window.BRANCHES.forEach(b => {
    b.mahallas.forEach(m => { window.MAHALLA_INDEX[m] = b.id; });
  });

  window.BRANCH_MAP = Object.fromEntries(window.BRANCHES.map(b => [b.id, b]));

  // Totals
  window.BRANCH_STATS = {
    total: window.BRANCHES.length,
    mahallas: window.BRANCHES.reduce((a, b) => a + b.mahallas.length, 0),
    subscribers: window.BRANCHES.reduce((a, b) => a + b.subscribers, 0),
    districts: new Set(window.BRANCHES.map(b => b.district)).size,
  };

  // Helper to find a branch by mahalla number
  window.findBranchByMahalla = function (m) {
    const id = window.MAHALLA_INDEX[(m || '').trim()];
    return id ? window.BRANCH_MAP[id] : null;
  };
})();
