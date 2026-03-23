import React from 'react';
import { motion } from 'framer-motion';

export const G = '#25FF79';

export function BlogHeader() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px 0' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: G, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Blog</div>
        <h1 style={{ fontWeight: 700, fontSize: 'clamp(36px,5vw,64px)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 16 }}>
          What's new at<br /><span style={{ color: G }}>JetStart.</span>
        </h1>
        <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 440, lineHeight: 1.65, marginBottom: 48 }}>
          Release notes, tutorials, and thoughts on Android development tooling.
        </p>
      </motion.div>
    </div>
  );
}
