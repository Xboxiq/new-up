// =============================================================
// FINAL — Login Page
// Uses the project's design tokens (--f-*) and motion language.
// Wraps window.Auth for sign-in; surfaces lockout / policy errors.
// =============================================================

function LoginPage({ onSuccess }) {
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);   // { code, message }
  const [forgotOpen, setForgotOpen] = React.useState(false);
  const idRef = React.useRef(null);

  React.useEffect(() => { idRef.current && idRef.current.focus(); }, []);

  // Show the first-run hint only when an admin password is still the default seed.
  // We only know that on a fresh install — check if mustChangePassword is true
  // for the admin user (a proxy for "first run").
  const [firstRunHint, setFirstRunHint] = React.useState(null);
  React.useEffect(() => {
    if (!window.DB) return;
    const admin = window.DB.users.find ? window.DB.users.find(u => u.username === 'admin' && u.mustChangePassword && !u.lastLoginAt) : null;
    if (admin) {
      setFirstRunHint({
        username: 'admin',
        password: window.DB.FIRST_RUN_ADMIN_PASSWORD,
      });
    }
  }, []);

  const submit = async (e) => {
    e && e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) {
      setError({ code: 'EMPTY', message: 'الرجاء إدخال اسم المستخدم وكلمة المرور' });
      return;
    }
    setBusy(true);
    const res = await window.Auth.signIn(identifier, password, { remember });
    setBusy(false);
    if (res.ok) {
      onSuccess && onSuccess(res);
      return;
    }
    setError(mapError(res));
  };

  return (
    <div className="lg-shell" dir="rtl">
      <div className="lg-bg" aria-hidden="true">
        <span className="lg-bg__pool lg-bg__pool--a" />
        <span className="lg-bg__pool lg-bg__pool--b" />
        <span className="lg-bg__grid" />
      </div>

      <div className="lg-card">
        <header className="lg-card__brand">
          <span className="lg-card__mark">
            <img src="assets/logo.png" alt="" />
          </span>
          <div className="lg-card__brand-txt">
            <strong>تدفّق الخير</strong>
            <small>منصة كهرباء الرصافة</small>
          </div>
        </header>

        <div className="lg-card__head">
          <h1>أهلاً بعودتك</h1>
          <p>سجّل دخولك للمتابعة إلى لوحة العمل</p>
        </div>

        {firstRunHint && (
          <div className="lg-hint">
            <span className="material-symbols-outlined">key</span>
            <div>
              <strong>تشغيل أول مرة</strong>
              <small>
                اسم المستخدم: <code>{firstRunHint.username}</code> · كلمة المرور:
                <code>{firstRunHint.password}</code>
                <br />سيُطلب منك تغييرها فور الدخول.
              </small>
            </div>
          </div>
        )}

        <form className="lg-form" onSubmit={submit}>
          <label className="lg-field">
            <span className="lg-field__lbl">اسم المستخدم أو البريد</span>
            <span className="lg-field__wrap">
              <span className="lg-field__ico">
                <span className="material-symbols-outlined">person</span>
              </span>
              <input
                ref={idRef}
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(null); }}
                placeholder="مثلاً admin"
                disabled={busy}
              />
            </span>
          </label>

          <label className="lg-field">
            <span className="lg-field__lbl">كلمة المرور</span>
            <span className="lg-field__wrap">
              <span className="lg-field__ico">
                <span className="material-symbols-outlined">lock</span>
              </span>
              <input
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="••••••••"
                disabled={busy}
              />
              <button type="button" className="lg-field__action"
                      onClick={() => setShowPwd(s => !s)}
                      aria-label={showPwd ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                <span className="material-symbols-outlined">
                  {showPwd ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </span>
          </label>

          <div className="lg-row">
            <label className="lg-check">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className="lg-check__box">
                {remember && <span className="material-symbols-outlined">check</span>}
              </span>
              <span>تذكّرني على هذا الجهاز</span>
            </label>
            <button type="button" className="lg-link" onClick={() => setForgotOpen(true)}>
              نسيت كلمة المرور؟
            </button>
          </div>

          {error && (
            <div className={`lg-alert lg-alert--${error.tone || 'err'}`} role="alert">
              <span className="material-symbols-outlined">
                {error.tone === 'warn' ? 'warning' : 'error'}
              </span>
              <span>{error.message}</span>
            </div>
          )}

          <button type="submit" className="lg-submit" disabled={busy}>
            {busy ? (
              <>
                <span className="lg-submit__spin" />
                <span>جاري التحقق…</span>
              </>
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <span className="material-symbols-outlined">arrow_back</span>
              </>
            )}
          </button>
        </form>

        <footer className="lg-card__foot">
          <span className="lg-card__foot-l">
            <span className="material-symbols-outlined">shield</span>
            الاتصال مشفّر داخل الشبكة المحلية
          </span>
          <span className="lg-card__foot-r">© 2026 شركة تدفّق الخير</span>
        </footer>
      </div>

      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
    </div>
  );
}

function mapError(res) {
  switch (res.code) {
    case 'USER_NOT_FOUND':
      return { tone: 'err', message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    case 'BAD_PASSWORD': {
      const r = res.remaining;
      return { tone: 'err',
               message: r != null
                 ? `كلمة المرور غير صحيحة (تبقّى ${r} محاولات قبل الإيقاف المؤقت)`
                 : 'كلمة المرور غير صحيحة' };
    }
    case 'LOCKED': {
      const min = Math.ceil((res.retryAfter || 0) / 60);
      return { tone: 'warn',
               message: `الحساب موقوف مؤقتاً بسبب محاولات فاشلة متكررة. حاول بعد ${min} دقيقة` };
    }
    case 'DISABLED':
      return { tone: 'err', message: 'هذا الحساب موقوف. راجع مدير النظام' };
    case 'BAD_INPUT':
      return { tone: 'err', message: 'الرجاء إدخال جميع الحقول' };
    case 'EMPTY':
      return { tone: 'err', message: res.message };
    default:
      return { tone: 'err', message: 'تعذّر تسجيل الدخول، حاول مرة أخرى' };
  }
}

// ----- Forgot password modal -----
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    // Foundation: log the request, instruct user to contact admin.
    if (window.DB && email.trim()) {
      window.DB.log('auth.password.reset.request', email.trim().toLowerCase());
    }
    setSent(true);
  };

  React.useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="lg-modal" onClick={onClose}>
      <div className="lg-modal__sheet" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="lg-modal__head">
          <span className="material-symbols-outlined">help</span>
          <div>
            <h3>استعادة كلمة المرور</h3>
            <p>راسل مدير النظام لإعادة تعيين كلمة المرور</p>
          </div>
          <button className="lg-modal__close" onClick={onClose} aria-label="إغلاق">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {!sent ? (
          <form onSubmit={submit} className="lg-form" style={{ padding: '0 24px 24px' }}>
            <label className="lg-field">
              <span className="lg-field__lbl">البريد المؤسسي أو اسم المستخدم</span>
              <span className="lg-field__wrap">
                <span className="lg-field__ico">
                  <span className="material-symbols-outlined">mail</span>
                </span>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)}
                       placeholder="you@rasafa.iq" autoFocus />
              </span>
            </label>
            <p className="lg-modal__note">
              سيُسجَّل طلبك في سجل التدقيق. سيتواصل معك مدير النظام لإعادة التعيين خلال أقل من 24 ساعة.
            </p>
            <button type="submit" className="lg-submit">
              <span>إرسال الطلب</span>
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        ) : (
          <div className="lg-modal__done">
            <span className="material-symbols-outlined">check_circle</span>
            <h4>تم استلام طلبك</h4>
            <p>سيتواصل معك مدير النظام قريباً لإعادة تعيين كلمة المرور.</p>
            <button className="lg-submit" onClick={onClose}>
              <span>حسناً</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================
// Force-change-password screen — shown after first login if
// mustChangePassword is set on the user.
// =============================================================
function ForceChangePassword({ onDone }) {
  const [current, setCurrent] = React.useState('');
  const [next, setNext] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (next !== confirm) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    setBusy(true);
    const res = await window.Auth.changePassword(current, next);
    setBusy(false);
    if (res.ok) { onDone && onDone(); return; }
    setError(res.message || (res.code === 'BAD_CURRENT' ? 'كلمة المرور الحالية غير صحيحة' : 'تعذّر التغيير'));
  };

  return (
    <div className="lg-shell" dir="rtl">
      <div className="lg-bg" aria-hidden="true">
        <span className="lg-bg__pool lg-bg__pool--a" />
        <span className="lg-bg__pool lg-bg__pool--b" />
        <span className="lg-bg__grid" />
      </div>

      <div className="lg-card">
        <header className="lg-card__brand">
          <span className="lg-card__mark">
            <img src="assets/logo.png" alt="" />
          </span>
          <div className="lg-card__brand-txt">
            <strong>تغيير كلمة المرور</strong>
            <small>مطلوب قبل المتابعة</small>
          </div>
        </header>

        <div className="lg-card__head">
          <h1>أنشئ كلمة مرور جديدة</h1>
          <p>اختر كلمة مرور قوية لا تُشاركها مع أحد</p>
        </div>

        <form className="lg-form" onSubmit={submit}>
          <label className="lg-field">
            <span className="lg-field__lbl">كلمة المرور الحالية</span>
            <span className="lg-field__wrap">
              <span className="lg-field__ico">
                <span className="material-symbols-outlined">lock_open</span>
              </span>
              <input type={show ? 'text' : 'password'} value={current}
                     onChange={(e) => setCurrent(e.target.value)} autoFocus />
            </span>
          </label>
          <label className="lg-field">
            <span className="lg-field__lbl">كلمة المرور الجديدة</span>
            <span className="lg-field__wrap">
              <span className="lg-field__ico">
                <span className="material-symbols-outlined">lock</span>
              </span>
              <input type={show ? 'text' : 'password'} value={next}
                     onChange={(e) => setNext(e.target.value)} />
              <button type="button" className="lg-field__action"
                      onClick={() => setShow(s => !s)}>
                <span className="material-symbols-outlined">
                  {show ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </span>
          </label>
          <label className="lg-field">
            <span className="lg-field__lbl">تأكيد كلمة المرور</span>
            <span className="lg-field__wrap">
              <span className="lg-field__ico">
                <span className="material-symbols-outlined">check</span>
              </span>
              <input type={show ? 'text' : 'password'} value={confirm}
                     onChange={(e) => setConfirm(e.target.value)} />
            </span>
          </label>

          <PasswordStrength password={next} />

          {error && (
            <div className="lg-alert lg-alert--err" role="alert">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="lg-submit" disabled={busy}>
            {busy ? <><span className="lg-submit__spin" /><span>جاري الحفظ…</span></>
                  : <><span>حفظ والمتابعة</span><span className="material-symbols-outlined">arrow_back</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}

function PasswordStrength({ password }) {
  const score = React.useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  }, [password]);
  if (!password) return null;
  const labels = ['ضعيفة جداً', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية'];
  return (
    <div className="lg-strength" data-score={score}>
      <div className="lg-strength__bar">
        {[0,1,2,3].map(i => <span key={i} className={i < score ? 'on' : ''} />)}
      </div>
      <small>قوّة كلمة المرور: <b>{labels[score]}</b></small>
    </div>
  );
}

window.LoginPage = LoginPage;
window.ForceChangePassword = ForceChangePassword;
