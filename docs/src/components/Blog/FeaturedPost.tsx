import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { urlFor } from '../../services/sanity/imageUrl';
import { G } from './BlogHeader';

const ALT = '#0F0F0F';

interface FeaturedPostProps {
  post: any;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  if (!post) return null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
      <motion.a href={`/blog/${post.slug}`}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, background: ALT, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', textDecoration: 'none', color: 'inherit', marginTop: 56, marginBottom: 16 }} className="featured-resp post-card">
        {post.mainImage && (
          <div style={{ overflow: 'hidden', minHeight: 340 }}>
            <img src={urlFor(post.mainImage)} alt={post.title} className="post-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}
        <div style={{ padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: G, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(37,255,121,0.07)', border: '1px solid rgba(37,255,121,0.15)', padding: '3px 9px', borderRadius: 4 }}>Featured</span>
              {post.categories?.[0] && (
                <span style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '3px 9px', borderRadius: 4 }}>{post.categories[0].title}</span>
              )}
            </div>
            <h2 style={{ fontWeight: 700, fontSize: 'clamp(20px,2.5vw,32px)', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 16, color: '#F9FAFB' }}>{post.title}</h2>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              {post.author && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(37,255,121,0.1)', border: '1px solid rgba(37,255,121,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: G }}>
                    {post.author.name[0]}
                  </div>
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>{post.author.name}</span>
                </div>
              )}
              <span style={{ fontSize: 13, color: '#4B5563' }}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: G }}>
              Read article <ArrowUpRight size={13} />
            </div>
          </div>
        </div>
      </motion.a>
    </div>
  );
}
