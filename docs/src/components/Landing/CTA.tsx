import React from 'react';
import { motion } from 'framer-motion';
import { Download, ArrowRight } from 'lucide-react';
import { G } from './Shared';

export function CTA() {
  return (
    <section className="py-24 md:py-40 px-6">
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(32px,5vw,60px)', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20 }}>
            Start shipping faster today.
          </h2>
          <p style={{ fontSize: 17, color: '#6B7280', marginBottom: 40, lineHeight: 1.65 }}>
            One command. Live feedback. Your app on your device, instantly.
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
  );
}
