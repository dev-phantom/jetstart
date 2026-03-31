import React from 'react';

export function Stats() {
  return (
    <section style={{ padding: '80px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
        {[
          { stat: 'instant',  label: 'Hot reload — wirelessly, every time' },
          { stat: '3',       label: 'Preview targets: phone, emulator, browser' },
          { stat: '1 cmd',   label: "npx jetstart dev — that's all it takes" },
        ].map(({ stat, label }) => (
          <div key={stat} style={{ background: '#0A0A0A', padding: '36px 40px' }}>
            <div style={{ fontWeight: 700, fontSize: 40, letterSpacing: '-0.05em', color: '#fff', marginBottom: 8 }}>{stat}</div>
            <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.5 }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
