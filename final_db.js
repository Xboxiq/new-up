// =============================================================
// FINAL — Unified Data Layer (DB abstraction)
// All admin-managed data flows through window.DB so that swapping
// the storage backend (Firebase / Supabase / REST API) later only
// requires replacing one adapter. Today: localStorage.
// =============================================================

(function () {
  const VERSION = 1;
  const NS = 'tq.db.v1';
  const META_KEY = `${NS}::meta`;
  const KEY = (col) => `${NS}::${col}`;

  // ---------- Adapter: localStorage (default) ----------
  const LocalAdapter = {
    name: 'local',
    read(col) {
      try { return JSON.parse(localStorage.getItem(KEY(col)) || '[]'); }
      catch { return []; }
    },
    write(col, rows) {
      localStorage.setItem(KEY(col), JSON.stringify(rows));
    },
    readScalar(col) {
      try { return JSON.parse(localStorage.getItem(KEY(col)) || 'null'); }
      catch { return null; }
    },
    writeScalar(col, value) {
      localStorage.setItem(KEY(col), JSON.stringify(value));
    },
  };

  let adapter = LocalAdapter;

  // ---------- Subscribers ----------
  const subs = new Map(); // col -> Set<fn>
  function emit(col) {
    const set = subs.get(col);
    if (!set) return;
    set.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
  }
  function subscribe(col, fn) {
    if (!subs.has(col)) subs.set(col, new Set());
    subs.get(col).add(fn);
    return () => subs.get(col).delete(fn);
  }

  // ---------- Helpers ----------
  function newId(prefix) {
    return `${prefix || 'r'}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  // ---------- Collection API ----------
  function collection(col, { idPrefix } = {}) {
    return {
      list() { return adapter.read(col); },
      get(id) { return adapter.read(col).find((r) => r.id === id) || null; },
      create(data) {
        const rows = adapter.read(col);
        const row = { id: data.id || newId(idPrefix || col), createdAt: Date.now(), ...data };
        rows.push(row);
        adapter.write(col, rows);
        emit(col);
        return row;
      },
      update(id, patch) {
        const rows = adapter.read(col);
        const i = rows.findIndex((r) => r.id === id);
        if (i < 0) return null;
        rows[i] = { ...rows[i], ...patch, updatedAt: Date.now() };
        adapter.write(col, rows);
        emit(col);
        return rows[i];
      },
      remove(id) {
        const rows = adapter.read(col).filter((r) => r.id !== id);
        adapter.write(col, rows);
        emit(col);
        return true;
      },
      replaceAll(rows) {
        adapter.write(col, rows);
        emit(col);
      },
      subscribe(fn) { return subscribe(col, fn); },
    };
  }

  // ---------- Scalar (singletons) ----------
  function scalar(col, defaults) {
    return {
      get() {
        const v = adapter.readScalar(col);
        return v == null ? clone(defaults) : { ...clone(defaults), ...v };
      },
      set(patch) {
        const next = { ...this.get(), ...patch };
        adapter.writeScalar(col, next);
        emit(col);
        return next;
      },
      subscribe(fn) { return subscribe(col, fn); },
    };
  }

  // ---------- Seeding (one-time) ----------
  const DEFAULT_TIPS = [
    { c: 'var(--f-cb)', tag: 'نصيحة',      ico: 'lightbulb',         title: 'تجنّب إرجاع طلبات CS0001',
      body: 'أرفق كتاب تأييد السكن المصدّق قبل تحويل الطلب للدائرة الفنية — أول سبب للإرجاع هذا الشهر.', by: 'مدير المركز', active: true },
    { c: 'var(--f-cs)', tag: 'سؤال متكرر', ico: 'help',              title: 'كيف يُحسب التقسيط؟',
      body: 'بحدّ أقصى ٦ أقساط، ويحتاج موافقة المدير للقيم فوق ٥٠٠ ألف د.ع.', by: 'دليل النظام', active: true },
    { c: 'var(--f-ct)', tag: 'تحديث',      ico: 'campaign',          title: 'تعديل جدول الأجور ٢٠٢٦',
      body: 'بدأ سريان التعديل على أجور الكشف الميداني — راجع اللائحة قبل إصدار أي مطالبة.', by: 'إدارة الأجور', active: true },
    { c: 'var(--f-ca)', tag: 'تنبيه',      ico: 'warning',           title: 'حالات تجاوزت الـ SLA',
      body: 'هناك ٣ حالات معلّقة في الدائرة الفنية تجاوزت المدة — راجعها لمنع التصعيد.', by: 'النظام', active: true },
    { c: 'var(--f-cs)', tag: 'نصيحة',      ico: 'tips_and_updates',  title: 'استخدم البحث السريع ⌘K',
      body: 'تستطيع الوصول لأي خدمة أو حالة أو مشترك بثوانٍ — جرّب كتابة رقم الاشتراك مباشرة.', by: 'دليل النظام', active: true },
  ];

  const DEFAULT_USERS = [
    { id: 'u_admin',    name: 'حسين علي',   username: 'admin',  role: 'admin',    section: '*',  email: 'admin@rasafa.iq',  active: true, createdAt: Date.now() },
    { id: 'u_ramez',    name: 'رامز كاظم',  username: 'ramez',  role: 'manager',  section: '*',  email: 'ramez@rasafa.iq',  active: true, createdAt: Date.now() },
    { id: 'u_zainab',   name: 'زينب أحمد',  username: 'zainab', role: 'employee', section: 'CS', email: 'zainab@rasafa.iq', active: true, createdAt: Date.now() },
    { id: 'u_mostafa',  name: 'مصطفى علي',  username: 'mostafa',role: 'employee', section: 'CT', email: 'mostafa@rasafa.iq',active: true, createdAt: Date.now() },
    { id: 'u_huda',     name: 'هدى محمود',  username: 'huda',   role: 'employee', section: 'CB', email: 'huda@rasafa.iq',   active: true, createdAt: Date.now() },
    { id: 'u_sara',     name: 'سرى ناجي',   username: 'sara',   role: 'viewer',   section: '*',  email: 'sara@rasafa.iq',   active: true, createdAt: Date.now() },
  ];

  const DEFAULT_SETTINGS = {
    centerName:  'مركز النضال — كهرباء الرصافة',
    centerCode:  'RS-014',
    branch:      'فرع النضال',
    region:      'الرصافة',
    managerName: 'رامز كاظم',
    headerTitle: 'مشروع التحول الذكي في الشبكة الكهربائية لفرع توزيع كهرباء الرصافة - منطقة مركز الرصافة',
    company:     'شركة تدفق الخير',
    routing: ['خدمات المشتركين','الدائرة الفنية','الدائرة القانونية','الصندوق','شؤون الموظفين','إلغاء الطلب'],
  };

  function seedOnce() {
    const meta = adapter.readScalar(META_KEY) || {};
    if (meta.seeded && meta.version === VERSION) return;

    if (!adapter.read('tips').length)     adapter.write('tips',     DEFAULT_TIPS.map((t, i)     => ({ id: newId('tip'),  ord: i, ...t })));
    if (!adapter.read('users').length)    adapter.write('users',    DEFAULT_USERS);
    if (!adapter.read('services').length) adapter.write('services', (window.SERVICES || []).map(s => ({ ...s, id: s.code, active: true })));
    if (!adapter.read('sections').length) adapter.write('sections', (window.SECTIONS || []).map(s => ({ ...s, id: s.code, active: true })));
    if (!adapter.read('audit').length)    adapter.write('audit', []);
    if (adapter.readScalar('settings') == null) adapter.writeScalar('settings', DEFAULT_SETTINGS);

    adapter.writeScalar(META_KEY, { seeded: true, version: VERSION, at: Date.now() });
  }

  // ---------- Audit log ----------
  function log(action, target, payload) {
    const audit = adapter.read('audit');
    audit.unshift({
      id: newId('a'),
      ts: Date.now(),
      action,
      target,
      by: (window.Auth && window.Auth.currentUser && window.Auth.currentUser().name) || 'مجهول',
      payload: payload || null,
    });
    // keep last 500
    if (audit.length > 500) audit.length = 500;
    adapter.write('audit', audit);
    emit('audit');
  }

  // ---------- Reset / Export / Import ----------
  function exportAll() {
    return {
      version: VERSION,
      exportedAt: Date.now(),
      tips:     adapter.read('tips'),
      users:    adapter.read('users'),
      services: adapter.read('services'),
      sections: adapter.read('sections'),
      audit:    adapter.read('audit'),
      settings: adapter.readScalar('settings'),
    };
  }
  function importAll(payload) {
    if (!payload || payload.version !== VERSION) throw new Error('إصدار غير مدعوم');
    ['tips','users','services','sections','audit'].forEach(c => {
      if (Array.isArray(payload[c])) adapter.write(c, payload[c]);
    });
    if (payload.settings) adapter.writeScalar('settings', payload.settings);
    ['tips','users','services','sections','audit','settings'].forEach(emit);
  }
  function resetAll() {
    ['tips','users','services','sections','audit'].forEach(c => adapter.write(c, []));
    adapter.writeScalar('settings', null);
    adapter.writeScalar(META_KEY, null);
    seedOnce();
    ['tips','users','services','sections','audit','settings'].forEach(emit);
  }

  // ---------- Public API ----------
  window.DB = {
    version: VERSION,
    adapter: () => adapter.name,
    setAdapter(a) { adapter = a; ['tips','users','services','sections','audit','settings'].forEach(emit); },

    tips:     collection('tips',     { idPrefix: 'tip' }),
    users:    collection('users',    { idPrefix: 'u'   }),
    services: collection('services', { idPrefix: 'svc' }),
    sections: collection('sections', { idPrefix: 'sec' }),
    audit:    collection('audit',    { idPrefix: 'a'   }),
    settings: scalar('settings', DEFAULT_SETTINGS),

    log,
    seedOnce,
    exportAll,
    importAll,
    resetAll,
    subscribe,
  };

  seedOnce();
})();
