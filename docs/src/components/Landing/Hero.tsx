import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import { Download, ArrowRight } from 'lucide-react';
import { G } from './Shared';

interface HeroProps {
  bgY: MotionValue<number>;
  heroRef: React.RefObject<HTMLDivElement>;
}

export function Hero({ bgY, heroRef }: HeroProps) {
  return (
    <section ref={heroRef} style={{ position: 'relative', overflow: 'hidden' }} className="pt-24 pb-12 md:pt-32 md:pb-20">
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
          className="text-center font-bold leading-[1.1] tracking-tight mb-6 mx-auto max-w-[820px] text-[32px] md:text-[56px] lg:text-[84px]">
          Build Android apps<br />
          <span style={{ color: G }}>at the speed of thought.</span>
        </motion.h1>

        {/* subhead */}
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}
          style={{ textAlign: 'center', fontWeight: 400, color: '#6B7280', lineHeight: 1.65, maxWidth: 480, margin: '0 auto 40px' }}
          className="text-base md:text-lg">
          Real Kotlin. Real Jetpack Compose. Live hot reload—wirelessly—to your phone, emulator, or browser.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
          className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-4 mb-20">
          <a href="https://www.npmjs.com/package/@jetstart/cli" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 600, color: '#0A0A0A', background: G, padding: '12px 24px', borderRadius: 8, transition: 'opacity .15s', boxShadow: `0 0 24px rgba(37,255,121,0.25)`, width: '100%', maxWidth: 'max-content' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <Download size={14} strokeWidth={2.5} /> Get started free
          </a>
          <a href="/docs/getting-started/introduction"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500, color: '#9CA3AF', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', padding: '12px 24px', borderRadius: 8, transition: 'all .15s', width: '100%', maxWidth: 'max-content' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}>
            Read the docs <ArrowRight size={13} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
