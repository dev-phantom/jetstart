import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LINES = [
  { t: 'dim',   s: '$ npx jetstart dev --web' },
  { t: 'muted', s: '' },
  { t: 'green', s: '✔  JetStart Core is running' },
  { t: 'muted', s: '   ws://192.168.1.10:8766  ·  session aX9pK2' },
  { t: 'muted', s: '' },
  { t: 'muted', s: '   Watching for file changes...' },
  { t: 'muted', s: '' },
  { t: 'white', s: '   NotesScreen.kt saved' },
  { t: 'green', s: '⚡  Hot reload in 87ms  (8 classes · DEX + web)' },
  { t: 'muted', s: '   NotesScreen.kt saved' },
  { t: 'green', s: '⚡  Hot reload in 91ms' },
];

export function Terminal() {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= LINES.length) return;
    const id = setTimeout(() => setShown(n => n + 1), shown === 0 ? 200 : shown < 6 ? 120 : 400);
    return () => clearTimeout(id);
  }, [shown]);

  const c: Record<string, string> = {
    dim: '#4B5563', muted: '#6B7280', white: '#E5E7EB', green: '#25FF79',
  };

  return (
    <div style={{
      background: '#0D0D0D', borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden', fontFamily: 'ui-monospace, monospace',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 40px 80px rgba(0,0,0,0.6)',
    }}>
      {/* traffic lights */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 6 }}>
        {['#FF5F57','#FEBC2E','#28C840'].map(c => (
          <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'block' }} />
        ))}
      </div>
      <div style={{ padding: '20px 20px 24px', minHeight: 200 }}>
        {LINES.slice(0, shown).map((line, i) => (
          <motion.div key={i}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}
            style={{ fontSize: 13, lineHeight: '22px', color: c[line.t] || '#9CA3AF', whiteSpace: 'pre' }}>
            {line.s || '\u00a0'}
          </motion.div>
        ))}
        {shown >= LINES.length && (
          <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}
            style={{ display: 'inline-block', width: 7, height: 14, background: '#25FF79', verticalAlign: 'middle' }} />
        )}
      </div>
    </div>
  );
}
