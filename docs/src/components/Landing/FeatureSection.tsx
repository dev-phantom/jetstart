import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Pill, Divider, G } from './Shared';
import { Terminal } from './Terminal';

export function FeatureSection() {
  return (
    <>
      {/*  hot reload  */}
      <section className="py-20 md:py-28 px-6">
        <div style={{ maxWidth: 1100, margin: '0 auto' }} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <Pill>Hot Reload</Pill>
            <h2 style={{ fontWeight: 700, fontSize: 'clamp(28px,3.5vw,44px)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '20px 0 16px' }}>
              Skip the wait.<br />See it instantly.
            </h2>
            <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>
              JetStart compiles changed Kotlin files to DEX bytecode and injects them into your running app over Wi-Fi—no full rebuild, no restart.
            </p>
            <a href="/docs/getting-started/introduction" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: G }}>
              How it works <ChevronRight size={14} />
            </a>
          </div>

          {/* side-by-side time comparison */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Full Gradle rebuild', time: '2–5 min', pct: 100, dim: true },
              { label: 'JetStart hot reload', time: '87ms',    pct: 1,   dim: false },
            ].map(({ label, time, pct, dim }) => (
              <div key={label} style={{ background: dim ? '#0F0F0F' : 'rgba(37,255,121,0.04)', border: `1px solid ${dim ? 'rgba(255,255,255,0.06)' : 'rgba(37,255,121,0.18)'}`, borderRadius: 10, padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: dim ? '#6B7280' : '#E5E7EB' }}>{label}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: dim ? '#4B5563' : G }}>{time}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: '0%' }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: dim ? 1.5 : 0.4, ease: 'easeOut', delay: 0.2 }}
                    style={{ height: '100%', background: dim ? '#374151' : G, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/*  three previews  */}
      <section style={{ padding: '120px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ maxWidth: 560, marginBottom: 72 }}>
            <Pill>Preview anywhere</Pill>
            <h2 style={{ fontWeight: 700, fontSize: 'clamp(28px,3.5vw,44px)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '20px 0 16px' }}>
              One server.<br />Three targets.
            </h2>
            <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.7 }}>
              Physical device, Android emulator, or the browser—your choice. Switch with a single flag. No reconfiguration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 ">
            {[
              { flag: 'jetstart dev', label: 'Physical Device', desc: 'Scan QR. App appears on your phone in seconds over Wi-Fi or hotspot.', tag: 'Wireless' },
              { flag: 'jetstart dev --emulator', label: 'Android Emulator', desc: 'Auto-detects your running AVD. Installs and launches the app automatically.', tag: 'AVD' },
              { flag: 'jetstart dev --web', label: 'Browser Preview', desc: 'Compiles Kotlin to JavaScript via kotlinc-js. Renders live Material You HTML in any browser.', tag: 'No device needed' },
            ].map(({ flag, label, desc, tag }) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                whileHover={{ borderColor: 'rgba(37,255,121,0.2)' }}
                style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '28px', transition: 'border-color 0.25s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: G, background: 'rgba(37,255,121,0.08)', border: '1px solid rgba(37,255,121,0.15)', padding: '3px 8px', borderRadius: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{tag}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>{label}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65, marginBottom: 24 }}>{desc}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#4B5563', padding: '8px 12px', background: '#000', borderRadius: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <span style={{ color: G, marginRight: 6 }}>$</span>{flag}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/*  terminal / CLI  */}
      <section className="py-20 md:py-28 px-6">
        <div style={{ maxWidth: 1100, margin: '0 auto' }} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <Terminal />
          <div>
            <Pill>Simple CLI</Pill>
            <h2 style={{ fontWeight: 700, fontSize: 'clamp(28px,3.5vw,44px)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '20px 0 16px' }}>
              From zero to<br />live in 60 seconds.
            </h2>
            <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.7, marginBottom: 32 }}>
              No Android Studio. No Gradle plugin config. Install the CLI, create a project, run <code style={{ color: G, background: 'rgba(37,255,121,0.07)', padding: '1px 6px', borderRadius: 4, fontSize: 15 }}>jetstart dev</code>, and watch your code appear on your device.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                ['npm install -g @jetstart/cli', 'Install'],
                ['jetstart create my-app', 'Create'],
                ['jetstart dev --web', 'Start'],
              ].map(([cmd, step], i) => (
                <div key={cmd} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 11, color: '#4B5563', fontWeight: 600, minWidth: 36 }}>0{i+1}</span>
                  <code style={{ fontSize: 13, color: '#E5E7EB', fontFamily: 'monospace', flex: 1, paddingLeft: '10px' }}>{cmd}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Divider />
    </>
  );
}
