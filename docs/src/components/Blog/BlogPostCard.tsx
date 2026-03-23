import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { urlFor } from '../../services/sanity/imageUrl';
import { G } from './BlogHeader';

const ALT = '#0F0F0F';

interface BlogPostCardProps {
  post: any;
  index: number;
}

export function BlogPostCard({ post, index }: BlogPostCardProps) {
  return (
    <motion.a href={`/blog/${post.slug}`}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.4 }}
      className="post-card"
      style={{ display: 'flex', flexDirection: 'column', background: ALT, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}>
      {post.mainImage && (
        <div style={{ height: 180, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
          <img src={urlFor(post.mainImage)} alt={post.title} className="post-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          {post.categories?.[0] && (
            <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: G, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '3px 8px', borderRadius: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{post.categories[0].title}</span>
            </div>
          )}
        </div>
      )}
      <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.02em', lineHeight: 1.45, color: '#F9FAFB', marginBottom: 'auto', paddingBottom: 20 }}>{post.title}</h3>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {post.author && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(37,255,121,0.1)', border: '1px solid rgba(37,255,121,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: G, flexShrink: 0 }}>
                {post.author.name[0]}
              </div>
            )}
            <span style={{ fontSize: 11, color: '#4B5563' }}>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <ArrowUpRight size={13} color="#374151" />
        </div>
      </div>
    </motion.a>
  );
}
