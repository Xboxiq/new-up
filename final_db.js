// =============================================================
// FINAL — Unified Data Layer (DB abstraction)
// All admin-managed data flows through window.DB so that swapping
// the storage backend (Firebase / Supabase / REST API) later only
// requires replacing one adapter. Today: localStorage.
//
// v2 schema: added auth (permissions, role_permissions, sessions,
// branches, departments) — foundation for the RBAC system.
// =============================================================

(function () {
  const VERSION = 2;  // bumped: new auth schema
  const NS = 'tq.db.v1';  // keep namespace; meta tracks version
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
  const subs = new Map();
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

  // Sequential, human-readable request number scoped to the current year+month.
  // Format: TQ-YYYY-MM-#### — continues from the highest existing number that
  // month, starting at 1001 so it reads naturally alongside seeded demo cases.
  function nextRequestNo() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    let max = 1000;
    adapter.read('requests').forEach((r) => {
      const mm = /^TQ-(\d{4})-(\d{2})-(\d+)$/.exec(r.no || '');
      if (mm && mm[1] === String(y) && mm[2] === m) {
        max = Math.max(max, parseInt(mm[3], 10));
      }
    });
    return `TQ-${y}-${m}-${max + 1}`;
  }

  // ---------- Collection API ----------
  function collection(col, { idPrefix } = {}) {
    return {
      list() { return adapter.read(col); },
      get(id) { return adapter.read(col).find((r) => r.id === id) || null; },
      find(pred) { return adapter.read(col).find(pred) || null; },
      filter(pred) { return adapter.read(col).filter(pred); },
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

  // =============================================================
  // RBAC SEED DATA — single source of truth for permissions/roles
  // =============================================================

  // Permission catalog — grouped by category for UI organization.
  // Backend implementations MUST mirror this list.
  const DEFAULT_PERMISSIONS = [
    // Requests / forms
    { key: 'request.create',       category: 'requests',  label: 'إنشاء طلب جديد' },
    { key: 'request.read',         category: 'requests',  label: 'عرض الطلبات' },
    { key: 'request.update',       category: 'requests',  label: 'تعديل الطلبات' },
    { key: 'request.delete',       category: 'requests',  label: 'حذف الطلبات' },
    { key: 'request.approve',      category: 'requests',  label: 'الموافقة على الطلبات' },
    { key: 'request.reject',       category: 'requests',  label: 'رفض الطلبات' },
    { key: 'request.print',        category: 'requests',  label: 'طباعة الطلبات' },
    { key: 'request.assign',       category: 'requests',  label: 'إسناد الطلبات' },
    // Payments
    { key: 'payment.read',         category: 'payments',  label: 'عرض الدفعات' },
    { key: 'payment.create',       category: 'payments',  label: 'تسجيل دفعة' },
    { key: 'payment.refund',       category: 'payments',  label: 'استرجاع دفعة' },
    { key: 'payment.manage',       category: 'payments',  label: 'إدارة كاملة للدفعات' },
    // Users
    { key: 'user.read',            category: 'users',     label: 'عرض المستخدمين' },
    { key: 'user.create',          category: 'users',     label: 'إنشاء مستخدم' },
    { key: 'user.update',          category: 'users',     label: 'تعديل المستخدمين' },
    { key: 'user.delete',          category: 'users',     label: 'حذف المستخدمين' },
    { key: 'user.disable',         category: 'users',     label: 'إيقاف/تفعيل المستخدمين' },
    { key: 'user.reset_password',  category: 'users',     label: 'إعادة كلمة المرور' },
    { key: 'user.force_logout',    category: 'users',     label: 'إنهاء جلسات المستخدمين' },
    // Roles & permissions
    { key: 'role.read',            category: 'roles',     label: 'عرض الأدوار' },
    { key: 'role.manage',          category: 'roles',     label: 'إدارة الأدوار والصلاحيات' },
    // System
    { key: 'settings.read',        category: 'system',    label: 'عرض الإعدادات' },
    { key: 'settings.manage',      category: 'system',    label: 'إدارة إعدادات النظام' },
    { key: 'branch.manage',        category: 'system',    label: 'إدارة الفروع والأقسام' },
    { key: 'data.export',          category: 'system',    label: 'تصدير البيانات' },
    { key: 'data.import',          category: 'system',    label: 'استيراد البيانات' },
    // Reports
    { key: 'reports.view',         category: 'reports',   label: 'عرض التقارير' },
    { key: 'reports.export',       category: 'reports',   label: 'تصدير التقارير' },
    // Audit
    { key: 'audit.read',           category: 'audit',     label: 'عرض سجل التدقيق' },
    { key: 'audit.export',         category: 'audit',     label: 'تصدير سجل التدقيق' },
    // Misc
    { key: 'tips.manage',          category: 'content',   label: 'إدارة النصائح' },
    { key: 'services.manage',      category: 'content',   label: 'إدارة الخدمات' },
  ];

  const PERMS_BY_KEY = Object.fromEntries(DEFAULT_PERMISSIONS.map(p => [p.key, p]));
  const ALL_KEYS = DEFAULT_PERMISSIONS.map(p => p.key);

  // Default roles — system-locked (cannot be deleted, can be edited)
  const DEFAULT_ROLES = [
    {
      id: 'role_sysadmin',
      key: 'system_admin',
      name: 'مدير النظام',
      description: 'صلاحيات كاملة على كل النظام',
      isSystem: true,
      permissions: ALL_KEYS,
    },
    {
      id: 'role_supervisor',
      key: 'supervisor',
      name: 'مسؤول / مشرف',
      description: 'إشراف عام على فرع / إدارة الموظفين',
      isSystem: true,
      permissions: [
        'request.read','request.update','request.approve','request.reject',
        'request.print','request.assign','request.delete',
        'payment.read','payment.create','payment.refund',
        'user.read','user.create','user.update','user.disable','user.reset_password','user.force_logout',
        'role.read',
        'settings.read','branch.manage',
        'reports.view','reports.export',
        'audit.read','audit.export',
        'tips.manage','services.manage',
        'data.export',
      ],
    },
    {
      id: 'role_cs',
      key: 'customer_service',
      name: 'خدمات المشتركين',
      description: 'تسجيل الطلبات والتفاعل مع المراجعين',
      isSystem: true,
      permissions: [
        'request.create','request.read','request.update','request.print',
        'reports.view',
      ],
    },
    {
      id: 'role_cashier',
      key: 'cashier',
      name: 'أمين الصندوق',
      description: 'استلام الدفعات وإصدار الإيصالات',
      isSystem: true,
      permissions: [
        'request.read','request.print',
        'payment.read','payment.create','payment.refund',
        'reports.view',
      ],
    },
    {
      id: 'role_inspector',
      key: 'field_inspector',
      name: 'مفتش ميداني',
      description: 'الكشف الميداني وتحديث حالة الطلبات',
      isSystem: true,
      permissions: [
        'request.read','request.update','request.print',
      ],
    },
    {
      id: 'role_auditor',
      key: 'auditor',
      name: 'مدقق',
      description: 'مراجعة وتدقيق الطلبات والسجلات (قراءة فقط على البيانات + سجل التدقيق)',
      isSystem: true,
      permissions: [
        'request.read','payment.read','user.read','role.read',
        'settings.read','reports.view','reports.export',
        'audit.read','audit.export',
      ],
    },
    {
      id: 'role_viewer',
      key: 'read_only',
      name: 'قارئ فقط',
      description: 'مشاهدة بدون أي تعديل',
      isSystem: true,
      permissions: [
        'request.read','payment.read','reports.view',
      ],
    },
  ];

  // Default branches + departments
  const DEFAULT_BRANCHES = [
    { id: 'br_nidhal',  code: 'RS-014', name: 'مركز النضال',  region: 'الرصافة', active: true },
    { id: 'br_baladiat',code: 'RS-015', name: 'مركز البلديات', region: 'الرصافة', active: true },
    { id: 'br_sader',   code: 'RS-016', name: 'مركز الصدر',   region: 'الرصافة', active: true },
  ];
  const DEFAULT_DEPARTMENTS = [
    { id: 'dept_cs', code: 'CS', name: 'خدمات المشتركين', active: true },
    { id: 'dept_ct', code: 'CT', name: 'الدائرة الفنية',  active: true },
    { id: 'dept_cb', code: 'CB', name: 'الصندوق',         active: true },
    { id: 'dept_ca', code: 'CA', name: 'الدائرة القانونية', active: true },
  ];

  // ---------- Password hashing (PLACEHOLDER — replace server-side with Argon2id) ----------
  // We use SHA-256 + per-user salt as a temporary scheme. This is NOT secure
  // for production — when the backend is built, all auth calls must hit the
  // server and the server must use Argon2id. The frontend will then store only
  // refresh-token cookies and never see raw passwords beyond the login POST.
  async function _sha256(str) {
    const enc = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  async function hashPassword(plain, salt) {
    salt = salt || newId('s');
    const hash = await _sha256(salt + ':' + plain);
    return { hash, salt, algo: 'sha256-v1' };
  }
  async function verifyPassword(plain, stored) {
    if (!stored || !stored.hash || !stored.salt) return false;
    const hash = await _sha256(stored.salt + ':' + plain);
    return hash === stored.hash;
  }

  // =============================================================
  // SEED — auth tables + initial admin
  // =============================================================
  // Default password for admin on first run; the user is FORCED to change it.
  const FIRST_RUN_ADMIN_PASSWORD = 'admin@2026';

  const DEFAULT_USERS_AUTH = [
    {
      id: 'u_admin', name: 'حسين علي', username: 'admin', email: 'admin@rasafa.iq',
      roleId: 'role_sysadmin',
      branchId: null,      // sysadmin = no branch restriction
      departmentId: null,
      active: true,
      mustChangePassword: true,
      createdAt: Date.now(),
    },
    {
      id: 'u_ramez', name: 'رامز كاظم', username: 'ramez', email: 'ramez@rasafa.iq',
      roleId: 'role_supervisor',
      branchId: 'br_nidhal',
      departmentId: null,
      active: true,
      mustChangePassword: true,
      createdAt: Date.now(),
    },
    {
      id: 'u_zainab', name: 'زينب أحمد', username: 'zainab', email: 'zainab@rasafa.iq',
      roleId: 'role_cs',
      branchId: 'br_nidhal',
      departmentId: 'dept_cs',
      active: true,
      mustChangePassword: true,
      createdAt: Date.now(),
    },
    {
      id: 'u_mostafa', name: 'مصطفى علي', username: 'mostafa', email: 'mostafa@rasafa.iq',
      roleId: 'role_inspector',
      branchId: 'br_nidhal',
      departmentId: 'dept_ct',
      active: true,
      mustChangePassword: true,
      createdAt: Date.now(),
    },
    {
      id: 'u_huda', name: 'هدى محمود', username: 'huda', email: 'huda@rasafa.iq',
      roleId: 'role_cashier',
      branchId: 'br_nidhal',
      departmentId: 'dept_cb',
      active: true,
      mustChangePassword: true,
      createdAt: Date.now(),
    },
    {
      id: 'u_sara', name: 'سرى ناجي', username: 'sara', email: 'sara@rasafa.iq',
      roleId: 'role_auditor',
      branchId: null,
      departmentId: null,
      active: true,
      mustChangePassword: true,
      createdAt: Date.now(),
    },
  ];

  // ---------- Misc seeds (kept from v1) ----------
  const DEFAULT_TIPS = [
    { c: 'var(--f-cb)', tag: 'نصيحة', ico: 'lightbulb',
      title: 'تجنّب إرجاع طلبات CS0001',
      body: 'أرفق كتاب تأييد السكن المصدّق قبل تحويل الطلب للدائرة الفنية — أول سبب للإرجاع هذا الشهر.',
      by: 'مدير المركز', active: true },
    { c: 'var(--f-cs)', tag: 'سؤال متكرر', ico: 'help',
      title: 'كيف يُحسب التقسيط؟',
      body: 'بحدّ أقصى ٦ أقساط، ويحتاج موافقة المدير للقيم فوق ٥٠٠ ألف د.ع.',
      by: 'دليل النظام', active: true },
    { c: 'var(--f-ct)', tag: 'تحديث', ico: 'campaign',
      title: 'تعديل جدول الأجور ٢٠٢٦',
      body: 'بدأ سريان التعديل على أجور الكشف الميداني — راجع اللائحة قبل إصدار أي مطالبة.',
      by: 'إدارة الأجور', active: true },
    { c: 'var(--f-ca)', tag: 'تنبيه', ico: 'warning',
      title: 'حالات تجاوزت الـ SLA',
      body: 'هناك ٣ حالات معلّقة في الدائرة الفنية تجاوزت المدة — راجعها لمنع التصعيد.',
      by: 'النظام', active: true },
    { c: 'var(--f-cs)', tag: 'نصيحة', ico: 'tips_and_updates',
      title: 'استخدم البحث السريع ⌘K',
      body: 'تستطيع الوصول لأي خدمة أو حالة أو مشترك بثوانٍ — جرّب كتابة رقم الاشتراك مباشرة.',
      by: 'دليل النظام', active: true },
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
    // Security policy
    security: {
      passwordMinLength: 8,
      passwordRequireMixedCase: false,
      passwordRequireDigit: true,
      passwordRequireSymbol: false,
      maxFailedAttempts: 5,
      lockoutMinutes: 15,
      sessionTimeoutMinutes: 30,         // inactivity-based
      sessionAbsoluteHours: 12,          // hard cap
      passwordExpiryDays: 0,             // 0 = never
    },
  };

  async function seedOnce() {
    const meta = adapter.readScalar(META_KEY) || {};
    const isFresh = !meta.seeded;
    const isUpgrade = meta.seeded && (meta.version || 0) < VERSION;

    // v1 collections (unchanged)
    if (!adapter.read('tips').length)
      adapter.write('tips', DEFAULT_TIPS.map((t, i) => ({ id: newId('tip'), ord: i, ...t })));
    if (!adapter.read('services').length)
      adapter.write('services', (window.SERVICES || []).map(s => ({ ...s, id: s.code, active: true })));
    if (!adapter.read('sections').length)
      adapter.write('sections', (window.SECTIONS || []).map(s => ({ ...s, id: s.code, active: true })));
    if (!adapter.read('audit').length)
      adapter.write('audit', []);
    if (adapter.readScalar('settings') == null)
      adapter.writeScalar('settings', DEFAULT_SETTINGS);

    // v2 auth tables
    if (!adapter.read('permissions').length) {
      adapter.write('permissions', DEFAULT_PERMISSIONS.map(p => ({ ...p, id: 'perm_' + p.key.replace(/\./g, '_') })));
    }
    if (!adapter.read('roles').length) {
      adapter.write('roles', DEFAULT_ROLES);
    }
    if (!adapter.read('branches').length) {
      adapter.write('branches', DEFAULT_BRANCHES);
    }
    if (!adapter.read('departments').length) {
      adapter.write('departments', DEFAULT_DEPARTMENTS);
    }
    if (!adapter.read('sessions').length) {
      adapter.write('sessions', []);
    }
    if (!adapter.read('password_resets').length) {
      adapter.write('password_resets', []);
    }
    // Users table: migrate from v1 (role string → roleId) OR seed fresh
    const existingUsers = adapter.read('users');
    if (!existingUsers.length) {
      // Fresh seed with default admin password
      const hashed = await hashPassword(FIRST_RUN_ADMIN_PASSWORD);
      const seeded = await Promise.all(DEFAULT_USERS_AUTH.map(async (u) => {
        const h = await hashPassword(FIRST_RUN_ADMIN_PASSWORD);
        return {
          ...u,
          passwordHash: h.hash,
          passwordSalt: h.salt,
          passwordAlgo: h.algo,
          failedLoginCount: 0,
          lockedUntil: null,
          lastLoginAt: null,
          lastLoginIp: null,
          createdBy: 'system',
        };
      }));
      adapter.write('users', seeded);
    } else if (isUpgrade) {
      // Migrate existing users from v1 → v2 (best-effort).
      const roleByOld = { admin: 'role_sysadmin', manager: 'role_supervisor',
                          employee: 'role_cs', viewer: 'role_viewer' };
      const migrated = await Promise.all(existingUsers.map(async (u) => {
        if (u.roleId) return u; // already migrated
        const h = await hashPassword(FIRST_RUN_ADMIN_PASSWORD);
        return {
          ...u,
          roleId: roleByOld[u.role] || 'role_viewer',
          branchId: u.section && u.section !== '*' ? null : (u.branchId || null),
          departmentId: u.section && u.section !== '*' ?
            (DEFAULT_DEPARTMENTS.find(d => d.code === u.section)?.id || null) : null,
          passwordHash: h.hash,
          passwordSalt: h.salt,
          passwordAlgo: h.algo,
          failedLoginCount: 0,
          lockedUntil: null,
          lastLoginAt: null,
          lastLoginIp: null,
          mustChangePassword: true,
          createdBy: 'system-migration',
        };
      }));
      adapter.write('users', migrated);
    }

    adapter.writeScalar(META_KEY, { seeded: true, version: VERSION, at: Date.now() });
  }

  // ---------- Audit log ----------
  function log(action, target, payload) {
    const audit = adapter.read('audit');
    const u = window.Auth && window.Auth.currentUser && window.Auth.currentUser();
    audit.unshift({
      id: newId('a'),
      ts: Date.now(),
      action,
      target,
      by: u ? u.name : 'مجهول',
      byId: u ? u.id : null,
      ip: 'local',                      // backend will set real IP
      ua: navigator.userAgent.slice(0, 100),
      payload: payload || null,
    });
    if (audit.length > 1000) audit.length = 1000;
    adapter.write('audit', audit);
    emit('audit');
  }

  // ---------- Reset / Export / Import ----------
  function exportAll() {
    return {
      version: VERSION,
      exportedAt: Date.now(),
      tips:        adapter.read('tips'),
      users:       adapter.read('users'),
      services:    adapter.read('services'),
      sections:    adapter.read('sections'),
      audit:       adapter.read('audit'),
      permissions: adapter.read('permissions'),
      roles:       adapter.read('roles'),
      branches:    adapter.read('branches'),
      departments: adapter.read('departments'),
      settings:    adapter.readScalar('settings'),
    };
  }
  function importAll(payload) {
    if (!payload) throw new Error('بيانات غير صالحة');
    const cols = ['tips','users','services','sections','audit',
                  'permissions','roles','branches','departments'];
    cols.forEach(c => { if (Array.isArray(payload[c])) adapter.write(c, payload[c]); });
    if (payload.settings) adapter.writeScalar('settings', payload.settings);
    [...cols, 'settings'].forEach(emit);
  }
  async function resetAll() {
    const cols = ['tips','users','services','sections','audit',
                  'permissions','roles','branches','departments',
                  'sessions','password_resets'];
    cols.forEach(c => adapter.write(c, []));
    adapter.writeScalar('settings', null);
    adapter.writeScalar(META_KEY, null);
    await seedOnce();
    [...cols, 'settings'].forEach(emit);
  }

  // ---------- Public API ----------
  window.DB = {
    version: VERSION,
    adapter: () => adapter.name,
    setAdapter(a) { adapter = a; },

    // Existing
    tips:        collection('tips',        { idPrefix: 'tip'  }),
    users:       collection('users',       { idPrefix: 'u'    }),
    services:    collection('services',    { idPrefix: 'svc'  }),
    sections:    collection('sections',    { idPrefix: 'sec'  }),
    audit:       collection('audit',       { idPrefix: 'a'    }),
    // RBAC
    permissions: collection('permissions', { idPrefix: 'perm' }),
    roles:       collection('roles',       { idPrefix: 'role' }),
    branches:    collection('branches',    { idPrefix: 'br'   }),
    departments: collection('departments', { idPrefix: 'dept' }),
    sessions:    collection('sessions',    { idPrefix: 'sess' }),
    passwordResets: collection('password_resets', { idPrefix: 'pwr' }),
    requests:    collection('requests',    { idPrefix: 'req'  }),

    // Human-readable request number — TQ-YYYY-MM-#### (mirrors legacy case IDs)
    nextRequestNo,

    settings: scalar('settings', DEFAULT_SETTINGS),

    // Catalog (read-only references)
    PERMISSION_KEYS: ALL_KEYS,
    PERMISSION_BY_KEY: PERMS_BY_KEY,

    // Password utilities (placeholder until backend is built)
    hashPassword,
    verifyPassword,

    // Initial admin credentials for first-run banner
    FIRST_RUN_ADMIN_PASSWORD,

    log,
    seedOnce,
    exportAll,
    importAll,
    resetAll,
    subscribe,
  };

  // Seed is async — kick it off; consumers should subscribe instead of read-immediately.
  seedOnce();
})();
