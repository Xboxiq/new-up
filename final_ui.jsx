// =============================================================
// FINAL — UI primitives (Sprint 1)
// Toast · Skeleton · EmptyState · ConfirmDialog · Field validation
// All components attach to window.* so other JSX files can use them.
// =============================================================

// ---------- TOAST ----------
const ToastCtx = React.createContext({ push: () => 0, dismiss: () => {} });

function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  const dismiss = (id) => setItems(s => s.filter(t => t.id !== id));

  const push = ({ kind = 'info', title, body, duration = 4200, action }) => {
    const id = ++idRef.current;
    setItems(s => [...s, { id, kind, title, body, action }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  };

  return (
    <ToastCtx.Provider value={{ push, dismiss }}>
      {children}
      <div className="fui-toast-stack" role="region" aria-label="إشعارات">
        {items.map(t => (
          <div key={t.id} className={`fui-toast fui-toast--${t.kind}`} role="status">
            <span className="fui-toast__rail" aria-hidden="true" />
            <span className="fui-toast__ico">
              <Icon name={
                t.kind === 'success' ? 'check_circle' :
                t.kind === 'error'   ? 'error' :
                t.kind === 'warn'    ? 'warning' : 'info'
              } />
            </span>
            <div className="fui-toast__body">
              {t.title && <div className="fui-toast__title">{t.title}</div>}
              {t.body  && <div className="fui-toast__text">{t.body}</div>}
            </div>
            {t.action && (
              <button className="fui-toast__action"
                      onClick={() => { t.action.onClick && t.action.onClick(); dismiss(t.id); }}>
                {t.action.label}
              </button>
            )}
            <button className="fui-toast__close" onClick={() => dismiss(t.id)} aria-label="إغلاق">
              <Icon name="close" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
function useToast() { return React.useContext(ToastCtx); }

// ---------- SKELETON ----------
function Skeleton({ w, h, r = 8, className = '', style = {} }) {
  return (
    <span className={`fui-skel ${className}`}
          style={{ width: w, height: h, borderRadius: r, ...style }}
          aria-hidden="true" />
  );
}
function SkeletonCard({ lines = 3 }) {
  return (
    <div className="fui-skel-card">
      <Skeleton w="44%" h={14} />
      <div style={{ display:'flex', gap:8, marginTop:14 }}>
        <Skeleton w={34} h={34} r={999} />
        <Skeleton w="60%" h={18} />
      </div>
      <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:8 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} w={`${94 - i * 8}%`} h={10} />
        ))}
      </div>
    </div>
  );
}
function SkeletonRow() {
  return (
    <div className="fui-skel-row">
      <Skeleton w={28} h={28} r={999} />
      <Skeleton w="40%" h={12} />
      <Skeleton w="22%" h={12} />
      <Skeleton w={56} h={20} r={6} />
    </div>
  );
}

// ---------- EMPTY STATE ----------
function EmptyState({ icon = 'inbox', title, body, action }) {
  return (
    <div className="fui-empty">
      <div className="fui-empty__art" aria-hidden="true">
        <span className="fui-empty__halo" />
        <span className="fui-empty__ico"><Icon name={icon} /></span>
      </div>
      <h3 className="fui-empty__title">{title}</h3>
      {body && <p className="fui-empty__body">{body}</p>}
      {action && (
        <button className="f-btn f-btn--primary" onClick={action.onClick}>
          {action.icon && <Icon name={action.icon} />} {action.label}
        </button>
      )}
    </div>
  );
}

// ---------- CONFIRM DIALOG ----------
function ConfirmDialog({ open, title, description, confirmLabel = 'تأكيد', cancelLabel = 'إلغاء',
                        danger = false, icon, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel && onCancel();
      if (e.key === 'Enter')  onConfirm && onConfirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel, onConfirm]);
  if (!open) return null;
  return (
    <div className="fui-modal" role="dialog" aria-modal="true" aria-labelledby="fui-confirm-title">
      <div className="fui-modal__veil" onClick={onCancel} />
      <div className={`fui-modal__sheet ${danger ? 'is-danger' : ''}`} dir="rtl">
        <div className="fui-modal__head">
          <span className="fui-modal__ico"><Icon name={icon || (danger ? 'delete' : 'help')} /></span>
          <h3 id="fui-confirm-title" className="fui-modal__title">{title}</h3>
        </div>
        {description && <p className="fui-modal__desc">{description}</p>}
        <div className="fui-modal__foot">
          <button className="f-btn" onClick={onCancel}>{cancelLabel}</button>
          <button className={`f-btn ${danger ? 'fui-btn-danger' : 'f-btn--primary'}`}
                  onClick={onConfirm} autoFocus>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- FIELD-LEVEL VALIDATION ----------
const Validate = {
  required: (v) => (v == null || String(v).trim() === '') ? 'هذا الحقل مطلوب' : '',
  minLen:   (n) => (v) => (String(v || '').trim().length < n) ? `أدخل ${n} حروف على الأقل` : '',
  digits:   (v) => /^[\d٠-٩]*$/.test(String(v || '')) ? '' : 'الرقم فقط مسموح',
  phoneIQ:  (v) => /^07[3-9]\d{8}$/.test(String(v || '').replace(/\D/g, '')) ? '' : 'هاتف عراقي غير صحيح',
  natId:    (v) => (String(v || '').replace(/\D/g, '').length >= 9) ? '' : 'رقم وطني غير صحيح',
};

function validateForm(form, rules) {
  const errors = {};
  Object.entries(rules || {}).forEach(([key, list]) => {
    for (const r of (Array.isArray(list) ? list : [list])) {
      const msg = typeof r === 'function' ? r(form[key]) : '';
      if (msg) { errors[key] = msg; break; }
    }
  });
  return errors;
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div className="fui-field-err" role="alert">
      <Icon name="error" /> <span>{msg}</span>
    </div>
  );
}
function FieldHelp({ msg }) {
  if (!msg) return null;
  return <div className="fui-field-help">{msg}</div>;
}
function ValidationSummary({ errors, max = 4 }) {
  const entries = Object.entries(errors || {});
  if (!entries.length) return null;
  const visible = entries.slice(0, max);
  const extra   = entries.length - visible.length;
  return (
    <div className="fui-valsum" role="alert">
      <div className="fui-valsum__head">
        <Icon name="report" />
        <strong>{entries.length} حقل بحاجة مراجعة</strong>
      </div>
      <ul>
        {visible.map(([k, m]) => <li key={k}>{m}</li>)}
        {extra > 0 && <li className="fui-valsum__more">و {extra} أخرى …</li>}
      </ul>
    </div>
  );
}

// ---------- expose ----------
window.ToastProvider = ToastProvider;
window.useToast        = useToast;
window.Skeleton        = Skeleton;
window.SkeletonCard    = SkeletonCard;
window.SkeletonRow     = SkeletonRow;
window.EmptyState      = EmptyState;
window.ConfirmDialog   = ConfirmDialog;
window.Validate        = Validate;
window.validateForm    = validateForm;
window.FieldError      = FieldError;
window.FieldHelp       = FieldHelp;
window.ValidationSummary = ValidationSummary;
