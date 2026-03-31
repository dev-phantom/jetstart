import React from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';
import { G } from './Shared';

export function ProductVisual() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease: [.22, 1, .36, 1] }}
        style={{ position: 'relative', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 16px 16px', overflow: 'hidden', maxWidth: 980, margin: '0 auto', boxShadow: '0 -1px 0 rgba(37,255,121,0.3), 0 40px 120px rgba(0,0,0,0.8)' }}>

        {/* green top border glow */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(37,255,121,0.6),transparent)', zIndex: 1 }} />

        {/* browser chrome */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12, background: '#0F0F0F' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'block' }} />)}
          </div>
          <div style={{ flex: 1, height: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
            <span style={{ fontSize: 11, color: '#4B5563', fontFamily: 'monospace' }}>localhost:8765</span>
          </div>
        </div>

        {/* two-pane layout: device left, sidebar right */}
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-[1fr_320px]" style={{ minHeight: 520 }}>
          {/* device pane */}
          <div className="p-6 md:p-12" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: '#0D0D0D', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <PhoneFrame>
              <div style={{ background: '#1C1B1F', height: '100%', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* fake compose UI - TopAppBar */}
                <div style={{ background: '#2B2930', borderRadius: 4, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#E6E1E5' }}>Notes</span>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(37,255,121,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 9, color: G }}>+</span>
                  </div>
                </div>
                {/* search field */}
                <div style={{ background: '#2B2930', borderRadius: 24, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid #79747E' }} />
                  <span style={{ fontSize: 9, color: '#79747E' }}>Search notes…</span>
                </div>
                {/* staggered cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flex: 1, alignContent: 'start' }}>
                  {[
                    { h: 80, title: 'Shopping List', body: 'Milk, eggs, bread…' },
                    { h: 80, title: 'Meeting Notes', body: 'Q4 roadmap discussion with the team' },
                    { h: 100, title: 'Ideas', body: 'Dark mode toggle for settings screen' },
                    { h: 100, title: 'Reminders', body: 'Call dentist Monday' },
                  ].map((card, i) => (
                    <div key={i} style={{ background: '#2B2930', borderRadius: 10, padding: '10px 8px', height: card.h }}>
                      <div style={{ fontSize: 9, fontWeight: 600, color: '#E6E1E5', marginBottom: 4 }}>{card.title}</div>
                      <div style={{ fontSize: 8, color: '#9CAA9F', lineHeight: 1.4 }}>{card.body}</div>
                    </div>
                  ))}
                </div>
                {/* FAB */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 4px 8px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: '#6750A4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 18, color: '#fff', lineHeight: 1 }}>+</span>
                  </div>
                </div>
              </div>
            </PhoneFrame>
          </div>

          {/* sidebar */}
          <div style={{ padding: '24px 20px', background: '#0A0A0A', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* status */}
            <div style={{ padding: '12px 14px', background: '#111', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#E5E7EB', letterSpacing: '-0.01em' }}>Connected</span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <motion.span animate={{ opacity: [1, .3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: G }} />
                  <span style={{ fontSize: 10, color: G }}>live</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['Last reload', '87ms'], ['Hot reloads', '14'], ['Build time', '1m 12s'], ['Changes', '3']].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 10, color: '#4B5563', marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F9FAFB', letterSpacing: '-0.02em' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* terminal output */}
            <div style={{ padding: '12px 14px', background: '#0D0D0D', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: 11, flex: 1 }}>
              {[
                { c: '#4B5563', t: '12:42:01' },
                { c: G, t: '⚡ NotesScreen.kt → 87ms' },
                { c: '#4B5563', t: '12:42:34' },
                { c: G, t: '⚡ NoteItem.kt → 91ms' },
                { c: '#4B5563', t: '12:43:12' },
                { c: G, t: '⚡ NotesScreen.kt → 84ms' },
              ].map((row, i) => (
                <div key={i} style={{ color: row.c, lineHeight: '20px' }}>{row.t}</div>
              ))}
              <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}
                style={{ display: 'inline-block', width: 6, height: 12, background: G, verticalAlign: 'middle', marginTop: 4 }} />
            </div>

            {/* download APK */}
            <div style={{ padding: '14px', background: '#111', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 4 }}>Latest build</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>v1.0.0 · 5.2 MB</div>
              <div style={{ height: 30, background: G, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                <Download size={12} color="#000" strokeWidth={2.5} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#000' }}>Download APK</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
