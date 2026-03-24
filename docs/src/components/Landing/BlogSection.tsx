import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { urlFor } from '../../services/sanity/imageUrl';
import { G } from './Shared';

export interface BlogPost {
  title: string;
  slug: string;
  publishedAt: string;
  mainImage: any;
  author: { name: string };
  categories?: { title: string }[];
}

interface BlogSectionProps {
  posts: BlogPost[];
}

export function BlogSection({ posts }: BlogSectionProps) {
  if (posts.length === 0) return null;

  return (
    <section style={{ padding: '120px 24px', position: 'relative' }}>
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

        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
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
  );
}
