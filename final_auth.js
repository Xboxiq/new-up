// =============================================================
// FINAL — Auth & Permissions (demo / local)
// 4 roles: admin · manager · employee · viewer
// Session is stored in localStorage. This is NOT a security boundary
// — when a real backend is added, replace `signIn` with a server call
// and gate the admin routes server-side too.
// =============================================================

(function () {
  const SESSION_KEY = 'tq.auth.session.v1';

  // role → set of allowed actions
  const PERMS = {
    admin: new Set([
      'admin.access', 'admin.settings',
      'services.read', 'services.write', 'services.delete',
      'tips.read',     'tips.write',     'tips.delete',
      'users.read',    'users.write',    'users.delete',
      'audit.read',    'data.export',    'data.import',  'data.reset',
      'cases.read', 'cases.write', 'forms.read', 'forms.write', 'forms.print',
    ]),
    manager: new Set([
      'admin.access',
      'services.read', 'services.write',
      'tips.read',     'tips.write',     'tips.delete',
      'users.read',
      'audit.read',
      'cases.read', 'cases.write', 'forms.read', 'forms.write', 'forms.print',
    ]),
    employee: new Set([
      'services.read',
      'tips.read',
      'cases.read', 'cases.write', 'forms.read', 'forms.write', 'forms.print',
    ]),
    viewer: new Set([
      'services.read', 'tips.read', 'cases.read', 'forms.read',
    ]),
  };

  const ROLE_LABELS = {
    admin:    'مدير النظام',
    manager:  'مسؤول المركز',
    employee: 'موظف',
    viewer:   'قارئ',
  };

  function readSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch { return null; }
  }
  function writeSession(s) {
    if (s == null) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    listeners.forEach((fn) => { try { fn(); } catch (e) {} });
  }

  const listeners = new Set();

  function currentUser() {
    const s = readSession();
    if (!s) return null;
    if (window.DB && window.DB.users) {
      const u = window.DB.users.get(s.userId);
      if (u) return u;
    }
    return s.snapshot || null;
  }

  function signIn(username) {
    if (!window.DB) return null;
    const u = window.DB.users.list().find((x) => x.username === username && x.active);
    if (!u) return null;
    writeSession({ userId: u.id, snapshot: u, signedAt: Date.now() });
    window.DB.log('auth.signIn', u.username, { role: u.role });
    return u;
  }

  function signInAs(userId) {
    if (!window.DB) return null;
    const u = window.DB.users.get(userId);
    if (!u || !u.active) return null;
    writeSession({ userId: u.id, snapshot: u, signedAt: Date.now() });
    window.DB.log('auth.switch', u.username, { role: u.role });
    return u;
  }

  function signOut() {
    const u = currentUser();
    if (u && window.DB) window.DB.log('auth.signOut', u.username);
    writeSession(null);
  }

  function can(action) {
    const u = currentUser();
    if (!u) return false;
    const set = PERMS[u.role];
    return !!(set && set.has(action));
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  // Auto-sign-in for the demo: first time, pick the admin so the UI is usable.
  function ensureBootstrap() {
    if (readSession()) return;
    if (!window.DB) return;
    const admin = window.DB.users.list().find((u) => u.role === 'admin' && u.active);
    if (admin) writeSession({ userId: admin.id, snapshot: admin, signedAt: Date.now() });
  }

  window.Auth = {
    PERMS, ROLE_LABELS,
    currentUser, signIn, signInAs, signOut, can,
    subscribe,
    ensureBootstrap,
  };

  ensureBootstrap();
})();
