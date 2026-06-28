// =============================================================
// FINAL — Auth Engine (RBAC foundation)
//
// Foundation for the enterprise RBAC system. Designed to be
// swapped for a real backend (Express + Argon2 + JWT) by
// replacing only the methods marked "BACKEND BOUNDARY".
//
// Current responsibilities:
//   - Password verify (against DB.users.passwordHash)
//   - Session lifecycle (issue, refresh, expire, revoke)
//   - Inactivity-based timeout (settings.security.sessionTimeoutMinutes)
//   - Absolute session cap (settings.security.sessionAbsoluteHours)
//   - Failed-login tracking + account lockout
//   - Force password change (mustChangePassword flag)
//   - Permission resolution (user → role → permission keys)
//   - Branch / department scoping (foundation for multi-tenant)
// =============================================================

(function () {

  const SESSION_KEY = 'tq.auth.session.v2';
  const ACTIVITY_KEY = 'tq.auth.activity.v2';

  const listeners = new Set();

  // ----- session read/write -----
  // "Remember me" → persistent localStorage. Unchecked → sessionStorage
  // (cleared when the browser/tab closes). Reads check both.
  function readSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
                || sessionStorage.getItem(SESSION_KEY) || 'null';
      return JSON.parse(raw);
    } catch { return null; }
  }
  function activeStore() {
    try { if (sessionStorage.getItem(SESSION_KEY)) return sessionStorage; } catch (e) {}
    return localStorage;
  }
  function writeSession(s, persist) {
    if (s == null) {
      [localStorage, sessionStorage].forEach((st) => {
        try { st.removeItem(SESSION_KEY); st.removeItem(ACTIVITY_KEY); } catch (e) {}
      });
    } else {
      const keep  = persist !== false;            // default: remember
      const store = keep ? localStorage : sessionStorage;
      const other = keep ? sessionStorage : localStorage;
      try { other.removeItem(SESSION_KEY); other.removeItem(ACTIVITY_KEY); } catch (e) {}
      store.setItem(SESSION_KEY, JSON.stringify(s));
      bumpActivity();
    }
    listeners.forEach((fn) => { try { fn(); } catch (e) {} });
  }
  function bumpActivity() {
    try { activeStore().setItem(ACTIVITY_KEY, String(Date.now())); } catch (e) {}
  }
  function lastActivity() {
    const v = Number((localStorage.getItem(ACTIVITY_KEY)
                    || sessionStorage.getItem(ACTIVITY_KEY)) || '0');
    return v || 0;
  }

  // ----- session validation -----
  function isSessionValid(s) {
    if (!s) return false;
    const settings = (window.DB && window.DB.settings.get()) || {};
    const sec = settings.security || {};
    const inactivityMs = (sec.sessionTimeoutMinutes || 30) * 60 * 1000;
    const absoluteMs   = (sec.sessionAbsoluteHours || 12) * 60 * 60 * 1000;

    const now = Date.now();
    if (s.expiresAt && now > s.expiresAt) return false;        // absolute
    if (s.signedAt && now > s.signedAt + absoluteMs) return false;
    const last = lastActivity() || s.signedAt || 0;
    if (now - last > inactivityMs) return false;               // inactivity
    return true;
  }

  // ----- public: current user -----
  function currentUser() {
    const s = readSession();
    if (!s) return null;
    if (!isSessionValid(s)) {
      writeSession(null);
      return null;
    }
    // DB may still be seeding asynchronously on first load. If the users
    // table is empty, don't wipe the session — just return null this tick;
    // subscribers will re-render once seed completes.
    if (!window.DB) return null;
    const users = window.DB.users.list();
    if (users.length === 0) return null;
    const u = window.DB.users.get(s.userId);
    if (!u) {
      // User truly missing — wipe session
      writeSession(null);
      return null;
    }
    if (!u.active) {
      writeSession(null);
      return null;
    }
    return u;
  }

  // ----- BACKEND BOUNDARY — login -----
  // Returns { ok, user } on success, or { ok:false, code, retryAfter } on failure.
  // Failure codes: USER_NOT_FOUND | DISABLED | LOCKED | BAD_PASSWORD | RATE_LIMIT
  async function signIn(usernameOrEmail, password, opts = {}) {
    if (!window.DB) return { ok: false, code: 'SYSTEM_NOT_READY' };
    const id = (usernameOrEmail || '').trim().toLowerCase();
    if (!id || !password) return { ok: false, code: 'BAD_INPUT' };

    const users = window.DB.users.list();
    const u = users.find(x =>
      (x.username || '').toLowerCase() === id ||
      (x.email    || '').toLowerCase() === id
    );
    if (!u) {
      window.DB.log('auth.login.fail', id, { reason: 'unknown_user' });
      return { ok: false, code: 'USER_NOT_FOUND' };
    }
    if (!u.active) {
      window.DB.log('auth.login.fail', u.username, { reason: 'disabled' });
      return { ok: false, code: 'DISABLED' };
    }

    // Lockout check
    const settings = window.DB.settings.get();
    const sec = settings.security || {};
    const now = Date.now();
    if (u.lockedUntil && now < u.lockedUntil) {
      const retryAfter = Math.ceil((u.lockedUntil - now) / 1000);
      return { ok: false, code: 'LOCKED', retryAfter };
    }

    // Verify password
    const stored = { hash: u.passwordHash, salt: u.passwordSalt };
    const ok = await window.DB.verifyPassword(password, stored);
    if (!ok) {
      const failed = (u.failedLoginCount || 0) + 1;
      const patch = { failedLoginCount: failed };
      const max = sec.maxFailedAttempts || 5;
      if (failed >= max) {
        patch.lockedUntil = now + (sec.lockoutMinutes || 15) * 60 * 1000;
        patch.failedLoginCount = 0;  // reset counter on lock
        window.DB.users.update(u.id, patch);
        window.DB.log('auth.login.lockout', u.username, { failed });
        return { ok: false, code: 'LOCKED', retryAfter: (sec.lockoutMinutes || 15) * 60 };
      }
      window.DB.users.update(u.id, patch);
      window.DB.log('auth.login.fail', u.username, { reason: 'bad_password', failed });
      return { ok: false, code: 'BAD_PASSWORD', remaining: max - failed };
    }

    // Success — clear failure counters, issue session
    window.DB.users.update(u.id, {
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: now,
      lastLoginIp: 'local',
    });

    const session = {
      id: 's_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 8),
      userId: u.id,
      username: u.username,
      signedAt: now,
      expiresAt: now + (sec.sessionAbsoluteHours || 12) * 60 * 60 * 1000,
      ip: 'local',
      ua: navigator.userAgent.slice(0, 200),
    };
    // Track in sessions table (for "view active sessions" + force-logout)
    try { window.DB.sessions.create({ ...session, revoked: false }); } catch (e) {}

    writeSession(session, opts.remember !== false);
    window.DB.log('auth.login.success', u.username, { sessionId: session.id });
    return { ok: true, user: u, mustChangePassword: !!u.mustChangePassword };
  }

  // ----- BACKEND BOUNDARY — sign out -----
  function signOut() {
    const s = readSession();
    const u = currentUser();
    if (s && window.DB) {
      const sess = window.DB.sessions.find(x => x.id === s.id);
      if (sess) window.DB.sessions.update(sess.id, { revoked: true, revokedAt: Date.now() });
    }
    if (u && window.DB) window.DB.log('auth.logout', u.username);
    writeSession(null);
  }

  // ----- BACKEND BOUNDARY — change password -----
  async function changePassword(currentPassword, newPassword) {
    const u = currentUser();
    if (!u) return { ok: false, code: 'NOT_AUTHENTICATED' };
    const settings = window.DB.settings.get();
    const policy = settings.security || {};

    // Verify current
    const ok = await window.DB.verifyPassword(currentPassword, {
      hash: u.passwordHash, salt: u.passwordSalt,
    });
    if (!ok) {
      window.DB.log('auth.password.change.fail', u.username, { reason: 'wrong_current' });
      return { ok: false, code: 'BAD_CURRENT' };
    }
    // Policy
    const policyError = validatePassword(newPassword, policy);
    if (policyError) return { ok: false, code: 'POLICY', message: policyError };

    const h = await window.DB.hashPassword(newPassword);
    window.DB.users.update(u.id, {
      passwordHash: h.hash, passwordSalt: h.salt, passwordAlgo: h.algo,
      mustChangePassword: false,
      passwordChangedAt: Date.now(),
    });
    window.DB.log('auth.password.change', u.username);
    listeners.forEach(fn => { try { fn(); } catch {} });
    return { ok: true };
  }

  // ----- BACKEND BOUNDARY — admin reset password -----
  async function adminResetPassword(targetUserId, newPassword) {
    const me = currentUser();
    if (!me) return { ok: false, code: 'NOT_AUTHENTICATED' };
    if (!can('user.reset_password')) return { ok: false, code: 'FORBIDDEN' };
    const target = window.DB.users.get(targetUserId);
    if (!target) return { ok: false, code: 'NOT_FOUND' };

    const settings = window.DB.settings.get();
    const policyError = validatePassword(newPassword, settings.security || {});
    if (policyError) return { ok: false, code: 'POLICY', message: policyError };

    const h = await window.DB.hashPassword(newPassword);
    window.DB.users.update(target.id, {
      passwordHash: h.hash, passwordSalt: h.salt, passwordAlgo: h.algo,
      mustChangePassword: true,
      failedLoginCount: 0,
      lockedUntil: null,
    });
    window.DB.log('user.password.reset', target.username, { by: me.username });
    return { ok: true };
  }

  // ----- Password policy validation -----
  function validatePassword(pwd, policy) {
    pwd = pwd || '';
    if (pwd.length < (policy.passwordMinLength || 8))
      return `كلمة المرور يجب أن تكون ${policy.passwordMinLength || 8} أحرف على الأقل`;
    if (policy.passwordRequireDigit && !/\d/.test(pwd))
      return 'كلمة المرور يجب أن تحتوي على رقم';
    if (policy.passwordRequireMixedCase && !(/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)))
      return 'كلمة المرور يجب أن تحتوي على حروف صغيرة وكبيرة';
    if (policy.passwordRequireSymbol && !/[^A-Za-z0-9]/.test(pwd))
      return 'كلمة المرور يجب أن تحتوي على رمز خاص';
    return null;
  }

  // =============================================================
  // PERMISSIONS — resolve user → role → permission keys
  // =============================================================
  // Legacy permission aliases — older parts of the UI still use the
  // v1 permission keys. Map them to the new v2 keys so existing pages
  // keep working while we migrate them gradually.
  const PERM_ALIASES = {
    'users.read':     'user.read',
    'users.write':    'user.update',
    'users.delete':   'user.delete',
    'services.write': 'services.manage',
    'services.delete':'services.manage',
    'tips.write':     'tips.manage',
    'tips.delete':    'tips.manage',
    'admin.access':   'user.read',
    'admin.settings': 'settings.manage',
    'cases.read':     'request.read',
    'cases.write':    'request.update',
    'forms.read':     'request.read',
    'forms.write':    'request.create',
    'forms.print':    'request.print',
    'data.reset':     'settings.manage',
  };

  function userPermissions(user) {
    user = user || currentUser();
    if (!user) return new Set();
    const role = window.DB.roles.get(user.roleId);
    if (!role) return new Set();
    return new Set(role.permissions || []);
  }

  function can(permKey, user) {
    const perms = userPermissions(user);
    if (perms.has(permKey)) return true;
    const alias = PERM_ALIASES[permKey];
    return !!(alias && perms.has(alias));
  }
  function canAny(keys, user) {
    const perms = userPermissions(user);
    return keys.some(k => perms.has(k));
  }
  function canAll(keys, user) {
    const perms = userPermissions(user);
    return keys.every(k => perms.has(k));
  }

  // =============================================================
  // SCOPING — branch / department isolation (foundation)
  // =============================================================
  // Returns a predicate function that tests if the current user can
  // see/modify a given record (record must have branchId/departmentId).
  // System admins (no branch restriction) pass through everything.
  function scopePredicate(user) {
    user = user || currentUser();
    if (!user) return () => false;
    // No branch assigned = full access (e.g. system_admin, auditor)
    if (!user.branchId && !user.departmentId) return () => true;
    return (record) => {
      if (!record) return false;
      if (user.branchId && record.branchId && record.branchId !== user.branchId) return false;
      if (user.departmentId && record.departmentId && record.departmentId !== user.departmentId) return false;
      return true;
    };
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  // ----- inactivity tracker -----
  // Bump activity on any user interaction; expire session on long idleness.
  let _activityWired = false;
  function wireActivityTracking() {
    if (_activityWired) return;
    _activityWired = true;
    ['mousedown', 'keydown', 'touchstart', 'visibilitychange'].forEach(ev => {
      window.addEventListener(ev, () => {
        if (readSession()) bumpActivity();
      }, { passive: true });
    });
    // Check expiration every minute
    setInterval(() => {
      const s = readSession();
      if (!s) return;
      if (!isSessionValid(s)) {
        writeSession(null);
        if (window.DB) window.DB.log('auth.session.expired', s.username || '?');
      }
    }, 60 * 1000);
  }

  // -----------------------------------------------------------------
  // Compatibility helpers for legacy admin UI (uses role string + signInAs)
  // -----------------------------------------------------------------
  function roleLabel(userOrId) {
    if (!window.DB) return '';
    let user;
    if (typeof userOrId === 'string') user = window.DB.users.get(userOrId);
    else user = userOrId;
    if (!user) return '';
    const role = window.DB.roles.get(user.roleId);
    return role ? role.name : (user.role || '');
  }

  // Map of legacy role string → label (admin UI selects from this)
  function getRoleLabels() {
    if (!window.DB) return {};
    return window.DB.roles.list().reduce((o, r) => {
      o[r.id] = r.name;
      o[r.key] = r.name;
      return o;
    }, {});
  }

  // -----------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------
  window.Auth = {
    // identity
    currentUser,
    isSessionValid: () => isSessionValid(readSession()),
    subscribe,

    // auth flow
    signIn,
    signOut,
    changePassword,
    adminResetPassword,
    validatePassword,

    // permissions
    can, canAny, canAll,
    userPermissions,

    // scoping
    scopePredicate,

    // helpers / legacy compat
    roleLabel,
    get ROLE_LABELS() { return getRoleLabels(); },

    // tracking
    wireActivityTracking,
    bumpActivity,
  };

  wireActivityTracking();
})();
