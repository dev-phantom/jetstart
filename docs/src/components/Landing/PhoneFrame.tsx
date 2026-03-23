import React from 'react';

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 220, flexShrink: 0,
      background: '#111', borderRadius: 40,
      border: '2px solid rgba(255,255,255,0.12)',
      overflow: 'hidden', position: 'relative',
      boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
    }}>
      {/* notch */}
      <div style={{ height: 28, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#111' }}>
        <div style={{ width: 72, height: 10, background: '#000', borderRadius: 999 }} />
      </div>
      <div style={{ height: 460, overflowY: 'hidden' }}>{children}</div>
      {/* home bar */}
      <div style={{ height: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#111' }}>
        <div style={{ width: 80, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 999 }} />
      </div>
    </div>
  );
}
