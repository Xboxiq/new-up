// =============================================================
// FINAL — shared globals for all page scripts
// (each Babel script has its own scope; share via window)
// =============================================================
const { useState, useEffect, useMemo, useRef } = React;

const DEPT_COLORS = { CS: 'var(--f-cs)', CT: 'var(--f-ct)', CB: 'var(--f-cb)', CA: 'var(--f-ca)' };

function Icon({ name, size }) {
  return <span className="material-symbols-outlined" style={size ? { fontSize: size } : null}>{name}</span>;
}

Object.assign(window, { DEPT_COLORS, Icon, useState, useEffect, useMemo, useRef });
