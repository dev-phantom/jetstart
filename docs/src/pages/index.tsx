import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Download, ArrowRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import { client } from '../services/sanity/sanityClient';
import { urlFor } from '../services/sanity/imageUrl';
import Link from '@docusaurus/Link';

interface BlogPost {
  title: string;
  slug: string;
  publishedAt: string;
  mainImage: any;
  author: { name: string };
  categories?: { title: string }[];
}

/* ─── tiny components ──────────────────────────────────────────────────────── */

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, fontWeight: 500, letterSpacing: '0.02em',
      color: '#25FF79', background: 'rgba(37,255,121,0.08)',
      border: '1px solid rgba(37,255,121,0.2)',
      padding: '4px 12px', borderRadius: 999,
    }}>{children}</span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', width: '100%' }} />;
}

/* ─── terminal mockup ───────────────────────────────────────────────────────── */
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

function Terminal() {
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

/* ─── phone frame ────────────────────────────────────────────────────────────── */
function PhoneFrame({ children }: { children: React.ReactNode }) {
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

/* ─── main ───────────────────────────────────────────────────────────────────── */
export default function JetStartLanding() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  useEffect(() => {
    client.fetch(`*[_type=="post"]|order(publishedAt desc)[0...3]{
      title,"slug":slug.current,publishedAt,mainImage,author->{name},categories[]->{title}
    }`).then(setPosts).catch(console.error);
  }, []);

  const G = '#25FF79';

  return (
    <div style={{ background: '#0A0A0A', color: '#fff', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", overflowX: 'hidden' }}>

      {/* font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        code, pre, .mono { font-family: ui-monospace, 'JetBrains Mono', 'Fira Code', monospace !important; }
        a { text-decoration: none; color: inherit; }
        ::selection { background: rgba(37,255,121,0.25); }
        html { background: #0A0A0A; }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, insetInline: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(16px)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src="img/logos/logo.png"
              alt="JetStart Logo"
              className="w-8 h-8 rounded-md"
            />
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.02em' }}>JetStart</span>
          </a>
          {/* links – desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hidden md:flex">
            {[
              ['Docs', '/docs/getting-started/introduction'],
              ['Blog', '/blogs'],
              ['GitHub', 'https://github.com/dev-phantom/jetstart'],
            ].map(([label, href]) => (
              <a key={label} href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={{ fontSize: 13, fontWeight: 500, color: '#9CA3AF', padding: '6px 12px', borderRadius: 6, transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}>
                {label}
              </a>
            ))}
            <a href="https://www.npmjs.com/package/@jetstart/cli" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0A0A0A', background: G, padding: '6px 14px', borderRadius: 6, marginLeft: 4, transition: 'opacity .15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              <Download size={13} strokeWidth={2.5} /> Install
            </a>
          </div>
        </div>
      </nav>

      <section ref={heroRef} style={{ paddingTop: 128, paddingBottom: 0, position: 'relative', overflow: 'hidden' }}>
        {/* ambient glow */}
        <motion.div style={{ y: bgY, position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(37,255,121,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          {/* eyebrow */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
            <a href="https://www.npmjs.com/package/@jetstart/cli" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, color: G, background: 'rgba(37,255,121,0.07)', border: '1px solid rgba(37,255,121,0.18)', padding: '5px 14px', borderRadius: 999, letterSpacing: '0.01em' }}>
              <motion.span animate={{ opacity: [1,.3,1] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 5, height: 5, borderRadius: '50%', background: G, flexShrink: 0 }} />
              Now available on npm &nbsp;→
            </a>
          </motion.div>

          {/* headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05, ease: [.22,1,.36,1] }}
            style={{ textAlign: 'center', fontWeight: 700, fontSize: 'clamp(40px,6.5vw,84px)', lineHeight: 1.02, letterSpacing: '-0.04em', margin: '0 auto 24px', maxWidth: 820 }}>
            Build Android apps<br />
            <span style={{ color: G }}>at the speed of thought.</span>
          </motion.h1>

          {/* subhead */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}
            style={{ textAlign: 'center', fontSize: 18, fontWeight: 400, color: '#6B7280', lineHeight: 1.65, maxWidth: 480, margin: '0 auto 40px' }}>
            Real Kotlin. Real Jetpack Compose. Sub-100ms hot reload—wirelessly—to your phone, emulator, or browser.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
            style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 80 }}>
            <a href="https://www.npmjs.com/package/@jetstart/cli" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 600, color: '#0A0A0A', background: G, padding: '10px 20px', borderRadius: 8, transition: 'opacity .15s', boxShadow: `0 0 24px rgba(37,255,121,0.25)` }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              <Download size={14} strokeWidth={2.5} /> Get started free
            </a>
            <a href="/docs/getting-started/introduction"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500, color: '#9CA3AF', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', padding: '10px 20px', borderRadius: 8, transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}>
              Read the docs <ArrowRight size={13} />
            </a>
          </motion.div>

          {/* ── product visual ── */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease: [.22,1,.36,1] }}
            style={{ position: 'relative', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 16px 16px', overflow: 'hidden', maxWidth: 980, margin: '0 auto',  boxShadow: '0 -1px 0 rgba(37,255,121,0.3), 0 40px 120px rgba(0,0,0,0.8)' }}>

            {/* green top border glow */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0,  height: 1, background: 'linear-gradient(90deg,transparent,rgba(37,255,121,0.6),transparent)', zIndex: 1 }} />

            {/* browser chrome */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12,  background: '#0F0F0F' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#FF5F57','#FEBC2E','#28C840'].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'block' }} />)}
              </div>
              <div style={{ flex: 1, height: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
                <span style={{ fontSize: 11, color: '#4B5563', fontFamily: 'monospace' }}>localhost:8765</span>
              </div>
            </div>

            {/* two-pane layout: device left, sidebar right */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: 520,  }}>
              {/* device pane */}
              <div style={{ padding: '48px 48px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: '#0D0D0D', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flex: 1 }}>
                      {[
                        { h: 80, title: 'Shopping List', body: 'Milk, eggs, bread…' },
                        { h: 110, title: 'Meeting Notes', body: 'Q4 roadmap discussion with the team' },
                        { h: 100, title: 'Ideas', body: 'Dark mode toggle for settings screen' },
                        { h: 70, title: 'Reminders', body: 'Call dentist Monday' },
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
                      <motion.span animate={{ opacity: [1,.3,1] }} transition={{ duration: 2, repeat: Infinity }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: G }} />
                      <span style={{ fontSize: 10, color: G }}>live</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[['Last reload','87ms'],['Hot reloads','14'],['Build time','1m 12s'],['Changes','3']].map(([l,v]) => (
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
                    { c: G,         t: '⚡ NotesScreen.kt → 87ms' },
                    { c: '#4B5563', t: '12:42:34' },
                    { c: G,         t: '⚡ NoteItem.kt → 91ms' },
                    { c: '#4B5563', t: '12:43:12' },
                    { c: G,         t: '⚡ NotesScreen.kt → 84ms' },
                  ].map((row, i) => (
                    <div key={i} style={{ color: row.c, lineHeight: '20px' }}>{row.t}</div>
                  ))}
                  <motion.span animate={{ opacity: [1,0,1] }} transition={{ duration: 1, repeat: Infinity }}
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
      </section>

      {/* ── SPEED STAT ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          {[
            { stat: '<100ms',  label: 'Hot reload — wirelessly, every time' },
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

      {/* ── FEATURE 1: hot reload ────────────────────────────────────────────── */}
      <section style={{ padding: '120px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="feature-grid">
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

      {/* ── FEATURE 2: three previews ────────────────────────────────────────── */}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="targets-grid">
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

      {/* ── FEATURE 3: terminal / CLI ────────────────────────────────────────── */}
      <section style={{ padding: '120px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="feature-grid">
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
                  <code style={{ fontSize: 13, color: '#E5E7EB', fontFamily: 'monospace', flex: 1 }}>{cmd}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── BLOG ─────────────────────────────────────────────────────────────── */}
      {posts.length > 0 && (
        <section style={{ padding: '120px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: G, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Blog</div>
                <h2 style={{ fontWeight: 700, fontSize: 36, letterSpacing: '-0.04em', margin: 0 }}>Latest updates</h2>
              </div>
              <a href="/blogs" style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
                View all <ArrowUpRight size={13} />
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="blog-grid">
              {posts.map((post, i) => (
                <motion.a key={post.slug} href={`/blog/${post.slug}`}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  whileHover={{ borderColor: 'rgba(255,255,255,0.14)' }}
                  style={{ display: 'flex', flexDirection: 'column', background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.25s', textDecoration: 'none' }}>
                  {post.mainImage && (
                    <div style={{ height: 180, overflow: 'hidden' }}>
                      <img src={urlFor(post.mainImage)} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s ease' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1)')} />
                    </div>
                  )}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {post.categories?.[0] && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: G, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>{post.categories[0].title}</span>
                    )}
                    <h3 style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.4, letterSpacing: '-0.02em', marginBottom: 'auto', color: '#F9FAFB' }}>{post.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 20 }}>
                      <span style={{ fontSize: 12, color: '#4B5563' }}>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <ArrowUpRight size={13} color="#4B5563" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      <Divider />

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '160px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontWeight: 700, fontSize: 'clamp(32px,5vw,60px)', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20 }}>
              Start shipping faster today.
            </h2>
            <p style={{ fontSize: 17, color: '#6B7280', marginBottom: 40, lineHeight: 1.65 }}>
              One command. Sub-100ms feedback. Your app on your device, instantly.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 20px', marginBottom: 24, width: '100%', maxWidth: 380 }}>
              <span style={{ color: G, fontFamily: 'monospace', fontSize: 14 }}>$</span>
              <span style={{ fontFamily: 'monospace', fontSize: 14, color: '#D1D5DB', flex: 1, textAlign: 'left' }}>npm install -g @jetstart/cli</span>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://www.npmjs.com/package/@jetstart/cli" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#0A0A0A', background: G, padding: '10px 22px', borderRadius: 8, transition: 'opacity .15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                <Download size={13} strokeWidth={2.5} /> Install CLI
              </a>
              <a href="/docs/getting-started/introduction"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: '#9CA3AF', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', padding: '10px 22px', borderRadius: 8, transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}>
                Documentation <ArrowRight size={13} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <img
                src="img/logos/logo.png"
                alt="JetStart Logo"
                className="w-8 h-8 rounded-md"
              />
              <span style={{ fontSize: 14, fontWeight: 600 }}>JetStart</span>
            </div>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>Wireless Android hot reload for Jetpack Compose developers.</p>
          </div>
          {[
            { heading: 'Product', links: [['Docs','/docs/getting-started/introduction'],['CLI','/docs/cli/overview'],['Architecture','/docs/architecture/overview']] },
            { heading: 'Community', links: [['GitHub','https://github.com/dev-phantom/jetstart'],['Discussions','https://github.com/dev-phantom/jetstart/discussions'],['Blog','/blogs']] },
            { heading: 'Legal', links: [['npm','https://www.npmjs.com/package/@jetstart/cli'],['Contributing','/docs/contributing/getting-started'],['License','https://github.com/dev-phantom/jetstart']] },
          ].map(col => (
            <div key={col.heading}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>{col.heading}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(([label, href]) => (
                  <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    style={{ fontSize: 13, color: '#6B7280', transition: 'color .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>{label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1100, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#374151' }}>© {new Date().getFullYear()} JetStart. MIT License.</span>
          <span style={{ fontSize: 12, color: '#374151' }}>Built with Docusaurus</span>
        </div>
      </footer>

      {/* responsive */}
      <style>{`
        @media(max-width:768px){
          .feature-grid{grid-template-columns:1fr!important;gap:40px!important}
          .targets-grid{grid-template-columns:1fr!important}
          .blog-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:900px){
          .feature-grid{grid-template-columns:1fr!important;gap:48px!important}
          .targets-grid{grid-template-columns:1fr 1fr!important}
          .blog-grid{grid-template-columns:1fr 1fr!important}
        }
      `}</style>
    </div>
  );
}
