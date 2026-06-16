// =============================================================
// SPOTLIGHT — macOS-style global search overlay (⌘K)
// =============================================================

function SpotlightOverlay({ open, onClose, nav }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQ(''); setSel(0);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
    }
  }, [open]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    const pages = [
      { kind: 'page', icon: 'inventory_2',   name: 'متابعة الحالات',  go: () => nav('cases') },
      { kind: 'page', icon: 'request_quote', name: 'جدول الأجور ٢٠٢٦', go: () => nav('pricing') },
      { kind: 'page', icon: 'menu_book',     name: 'دليل الموظف',     go: () => nav('guide') },
      { kind: 'page', icon: 'apps',          name: 'كل الخدمات',      go: () => nav('services') },
    ];
    if (!t) {
      const top = [...window.SERVICES].sort((a, b) => b.popularity - a.popularity).slice(0, 5)
        .map(s => ({ kind: 'svc', svc: s, go: () => nav('detail', { code: s.code }) }));
      return [...top, ...pages];
    }
    const svcs = window.SERVICES
      .filter(s => s.name.toLowerCase().includes(t) || s.code.toLowerCase().includes(t))
      .slice(0, 7)
      .map(s => ({ kind: 'svc', svc: s, go: () => nav('detail', { code: s.code }) }));
    const pg = pages.filter(p => p.name.includes(q.trim()));
    return [...svcs, ...pg];
  }, [q]);

  useEffect(() => { setSel(0); }, [results.length, q]);

  if (!open) return null;

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter' && results[sel]) { results[sel].go(); onClose(); }
    else if (e.key === 'Escape') onClose();
  };

  return (
    <div className="sp-veil" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sp-panel" role="dialog" aria-label="بحث سريع">
        <div className="sp-input">
          <Icon name="search" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey}
                 placeholder="ابحث عن خدمة، صفحة، أو رقم نموذج…" />
          <span className="sp-esc">esc</span>
        </div>
        <div className="sp-results">
          {results.length === 0 && <div className="sp-empty">لا نتائج لـ «{q}»</div>}
          {results.map((r, i) => r.kind === 'svc' ? (
            <button key={r.svc.code} className={`sp-row ${i === sel ? 'is-sel' : ''}`}
                    onMouseEnter={() => setSel(i)}
                    onClick={() => { r.go(); onClose(); }}>
              <span className="sp-row__ico" style={{ '--s-c': DEPT_COLORS[r.svc.section] }}>
                <Icon name={r.svc.icon} />
              </span>
              <span className="sp-row__main">
                <span className="sp-row__name">{r.svc.name}</span>
                <span className="sp-row__sub">{window.SECTION_MAP[r.svc.section].name}</span>
              </span>
              <span className="sp-row__code">{r.svc.code}</span>
              <span className="sp-row__enter"><Icon name="keyboard_return" /></span>
            </button>
          ) : (
            <button key={'p' + i} className={`sp-row ${i === sel ? 'is-sel' : ''}`}
                    onMouseEnter={() => setSel(i)}
                    onClick={() => { r.go(); onClose(); }}>
              <span className="sp-row__ico sp-row__ico--page"><Icon name={r.icon} /></span>
              <span className="sp-row__main">
                <span className="sp-row__name">{r.name}</span>
                <span className="sp-row__sub">انتقال</span>
              </span>
              <span className="sp-row__enter"><Icon name="keyboard_return" /></span>
            </button>
          ))}
        </div>
        <div className="sp-foot">
          <span><b>↑↓</b> تنقّل</span>
          <span><b>↵</b> فتح</span>
          <span><b>esc</b> إغلاق</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SpotlightOverlay });
