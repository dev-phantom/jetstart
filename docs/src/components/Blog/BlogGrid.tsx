import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogPostCard } from './BlogPostCard';

const ALT = '#0F0F0F';

interface BlogGridProps {
  posts: any[];
  loading: boolean;
  page: number;
  search: string;
  cat: string | null;
  setSearch: (s: string) => void;
  setCat: (c: string | null) => void;
  G: string;
}

export function BlogGrid({ posts, loading, page, search, cat, setSearch, setCat, G }: BlogGridProps) {
  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 16 }} className="blog-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: ALT, borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <div style={{ height: 180, background: 'rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden' }}>
                <motion.div animate={{ x: ['-100%','100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)' }} />
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '35%', marginBottom: 14 }} />
                <div style={{ height: 16, borderRadius: 4, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }} />
                <div style={{ height: 16, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#4B5563' }}>
        <div style={{ fontSize: 18, marginBottom: 12 }}>No posts found.</div>
        <button onClick={() => { setSearch(''); setCat(null); }}
          style={{ fontSize: 14, color: G, background: 'none', border: 'none', cursor: 'pointer' }}>Clear filters</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
      <AnimatePresence mode="wait">
        <motion.div key={`${page}-${search}-${cat}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 16 }} className="blog-grid">
          {posts.map((post, i) => (
            <BlogPostCard key={post.slug} post={post} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
