// =============================================================
// ENAMEL PIN ICONS — luxury badge treatment
// Custom SVG glyphs in white enamel on a polished colored gem,
// ringed by a champagne-gold metallic rim. Apple gloss × luxury.
// =============================================================

const STK_COLORS = {
  CS: 'var(--f-cs)', CT: 'var(--f-ct)', CB: 'var(--f-cb)', CA: 'var(--f-ca)',
  all: 'var(--f-navy)', bolt: 'var(--f-gold)'
};

const STK_PATHS = {
  // plug with bolt cutout
  CS:
  <g>
      <path d="M9.6 3.2c.6 0 1.1.5 1.1 1.1V7h2.6V4.3a1.1 1.1 0 0 1 2.2 0V7h.6a2 2 0 0 1 2 2v3.4a6.1 6.1 0 0 1-5 6v1.9a1.1 1.1 0 0 1-2.2 0v-1.9a6.1 6.1 0 0 1-5-6V9a2 2 0 0 1 2-2h.6V4.3c0-.6.5-1.1 1.1-1.1Z" fill="currentColor" style={{ fill: "rgb(93, 126, 178)" }} />
      <path d="M12.9 9.4 10.4 13h1.7l-1 3 3.5-4.2h-1.8l1.2-2.4Z" fill="var(--stk-edge)" />
    </g>,

  // wrench
  CT:
  <g>
      <path d="M19.8 7.2a4.6 4.6 0 0 1-6 4.4l-5.2 5.2a2.5 2.5 0 1 1-3.5-3.5l5.2-5.2a4.6 4.6 0 0 1 5.8-5.7c.5.2.6.8.2 1.2L14 5.9l2 2 2.3-2.3c.4-.4 1-.3 1.2.2.2.4.3.9.3 1.4Z" fill="currentColor" style={{ fill: "rgb(164, 127, 77)" }} />
      <circle cx="6.9" cy="15" r="1.15" fill="var(--stk-edge)" />
    </g>,

  // receipt with zigzag tail
  CB:
  <g>
      <path d="M7 2.8h10a1 1 0 0 1 1 1v16.3c0 .8-.9 1.2-1.5.7l-1.2-1-1.5 1.2c-.4.3-.9.3-1.3 0L11 19.8l-1.5 1.2c-.4.3-.9.3-1.3 0l-1.2-1c-.6.5-1.5.1-1.5-.7V3.8a1 1 0 0 1 1-1Z" transform="translate(.5 0)" fill="currentColor" style={{ fill: "rgb(63, 147, 144)" }} />
      <rect x="9" y="7" width="7" height="1.7" rx="0.85" fill="var(--stk-edge)" />
      <rect x="9" y="11" width="5" height="1.7" rx="0.85" fill="var(--stk-edge)" />
    </g>,

  // shield with alert
  CA:
  <g>
      <path d="M11.6 2.6a1.4 1.4 0 0 1 .8 0l6.6 2.3c.6.2 1 .7 1 1.3v4.5c0 4.9-3.2 8.2-7.4 9.9a1.4 1.4 0 0 1-1.2 0C7.2 18.9 4 15.6 4 10.7V6.2c0-.6.4-1.1 1-1.3l6.6-2.3Z" fill="currentColor" />
      <rect x="10.9" y="7" width="2.2" height="6" rx="1.1" fill="var(--stk-edge)" />
      <circle cx="12" cy="15.6" r="1.25" fill="var(--stk-edge)" />
    </g>,

  // all — playful grid, one tile tilted
  all:
  <g>
      <rect x="3.2" y="3.2" width="8" height="8" rx="2.2" fill="currentColor" />
      <rect x="13" y="3.6" width="8" height="8" rx="2.2" fill="currentColor" transform="rotate(7 17 7.6)" opacity="0.85" />
      <rect x="3.2" y="13" width="8" height="8" rx="2.2" fill="currentColor" opacity="0.85" />
      <rect x="12.8" y="12.8" width="8" height="8" rx="2.2" fill="currentColor" />
      <circle cx="16.8" cy="16.8" r="1.5" fill="var(--stk-edge)" />
    </g>,

  // bolt
  bolt:
  <g>
      <path d="M13.6 2.2c.5-.7 1.6-.2 1.4.6l-1.5 6.4h4.4c.7 0 1 .8.6 1.3L10.4 21.8c-.5.7-1.6.2-1.4-.6l1.5-6.4H6.1c-.7 0-1-.8-.6-1.3l8.1-11.3Z" fill="currentColor" />
    </g>

};

function StickerIco({ kind, size = 44, className = '', tilt }) {
  const k = STK_PATHS[kind] ? kind : 'all';
  return (
    <span className={`pin ${className}`}
    style={{
      '--pin-c': STK_COLORS[k],
      '--pin-s': size + 'px',
      '--stk-tilt': (tilt != null ? tilt : -6) + 'deg'
    }}
    aria-hidden="true">
      <svg className="pin__glyph" viewBox="0 0 24 24" focusable="false">
        <g className="pin__ghost">{STK_PATHS[k]}</g>
        <g className="pin__main">{STK_PATHS[k]}</g>
      </svg>
    </span>);

}

Object.assign(window, { StickerIco });

// =============================================================
// SIG BADGE — نقل حرفي لنموذج «التوقيع» (R1) من بنك الاعتماد
// حلقة تُرسم عند المرور + نواة زجاجية مصقولة + رسم مميز لكل قسم.
// لا توهج، لا دوران، لا وميض — فقط رسمٌ هادئ يكتمل مرة واحدة.
// =============================================================
const SIG_COLORS = { CS: 'var(--f-cs)', CT: 'var(--f-ct)', CB: 'var(--f-cb)', CA: 'var(--f-ca)' };

const SIG_GLYPHS = {
  // CS — التوقيع (أول علاقة بين الموظف والمشترك)
  CS: (
    <svg width="36" height="36" viewBox="0 0 36 36" focusable="false">
      <path d="M5 27 H31" opacity="0.4" />
      <path className="sig-line" pathLength="100" d="M5 22 C 9 17, 12 25, 16 19 C 19 15, 23 25, 27 18 C 29 14, 31 19, 32 19" />
    </svg>
  ),
  // CT — المفك (الطلبات الفنية)
  CT: (
    <svg width="36" height="36" viewBox="0 0 36 36" focusable="false">
      <g className="tool">
        <path d="M11 25 L9 27" />
        <path d="M9 27 L7 29 A 2.5 2.5 0 0 0 10.5 32.5 L 12.5 30.5" />
        <path d="M11 25 L20 16" />
        <path d="M20 16 L23 13 A 4 4 0 1 0 26.5 16.5 L 23.5 19.5 L 21.5 17.5 Z" />
      </g>
    </svg>
  ),
  // CB — الميزان (الفواتير والعملة)
  CB: (
    <svg width="36" height="36" viewBox="0 0 36 36" focusable="false">
      <line x1="18" y1="14" x2="18" y2="30" />
      <path d="M12 30 H24" />
      <g className="scale-bar">
        <line x1="7" y1="14" x2="29" y2="14" />
        <path d="M9 14 L7 22 A 3 3 0 0 0 13 22 Z" />
        <path d="M27 14 L25 22 A 3 3 0 0 0 31 22 Z" />
      </g>
    </svg>
  ),
  // CA — الجرس (الشكاوى والإنذارات الإدارية)
  CA: (
    <svg width="36" height="36" viewBox="0 0 36 36" focusable="false">
      <g className="bell">
        <path d="M11 24 C 11 16, 13 12, 18 12 C 23 12, 25 16, 25 24 Z" />
        <path d="M9 24 H27" />
        <circle className="f" cx="18" cy="28" r="1.6" />
        <line x1="18" y1="8" x2="18" y2="11" />
      </g>
    </svg>
  ),
};

function SigBadge({ kind, size = 90, className = '' }) {
  const k = SIG_GLYPHS[kind] ? kind : 'CS';
  return (
    <span className={`sig sig--${k.toLowerCase()} ${className}`}
          style={{ '--c-c': SIG_COLORS[k], '--sig-s': size + 'px' }}
          aria-hidden="true">
      <svg className="sig__ring" viewBox="0 0 90 90" focusable="false">
        <circle className="t" cx="45" cy="45" r="43.5" />
        <circle className="p" cx="45" cy="45" r="43.5" pathLength="100" />
      </svg>
      <span className="sig__core">{SIG_GLYPHS[k]}</span>
    </span>
  );
}

Object.assign(window, { SigBadge });

// =============================================================
// UNDO WINDOW (K6) — كبسولة تراجع عائمة. روح فيرسيل + Gmail:
// الإجراء يقع بعد 5 ثوانٍ — تظهر كبسولة سوداء تمنحك مهلة للتراجع.
// استخدام: window.scheduleUndoableAction({ msg, onCommit, onUndo? })
// =============================================================
function UndoWindow({ msg, onCommit, onUndo, onClose }) {
  const [count, setCount] = React.useState(5);
  const committed = React.useRef(false);
  React.useEffect(() => {
    if (count <= 0) {
      if (!committed.current) { committed.current = true; onCommit && onCommit(); onClose && onClose(); }
      return;
    }
    const t = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onCommit, onClose]);
  return (
    <div className="undo-win" role="status" aria-live="polite">
      <span className="undo-win__icon"><Icon name="delete" /></span>
      <span className="undo-win__msg">{msg}</span>
      <span className="undo-win__count">{count}</span>
      <button className="undo-win__btn" onClick={() => {
        committed.current = true;
        onUndo && onUndo();
        onClose && onClose();
      }}>تراجع</button>
      <span className="undo-win__bar" aria-hidden="true" />
    </div>
  );
}

// Lightweight global scheduler — renders into a single host node.
(function setupUndoScheduler() {
  if (window.scheduleUndoableAction) return;
  let host = null;
  let root = null;
  function getRoot() {
    if (!host) {
      host = document.createElement('div');
      host.id = 'undo-host';
      document.body.appendChild(host);
      root = ReactDOM.createRoot(host);
    }
    return root;
  }
  window.scheduleUndoableAction = function ({ msg, onCommit, onUndo }) {
    const r = getRoot();
    const close = () => r.render(null);
    r.render(React.createElement(UndoWindow, { msg, onCommit, onUndo, onClose: close }));
  };
})();
Object.assign(window, { UndoWindow });