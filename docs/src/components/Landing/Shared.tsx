import React from 'react';

export const G = '#25FF79';

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, fontWeight: 500, letterSpacing: '0.02em',
      color: G, background: 'rgba(37,255,121,0.08)',
      border: '1px solid rgba(37,255,121,0.2)',
      padding: '4px 12px', borderRadius: 999,
    }}>{children}</span>
  );
}

export function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', width: '100%' }} />;
}
