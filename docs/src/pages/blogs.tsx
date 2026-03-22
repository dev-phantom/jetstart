import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { client } from '../services/sanity/sanityClient';
import { urlFor } from '../services/sanity/imageUrl';
import { ArrowUpRight, Search } from 'lucide-react';

interface Post {
  title: string;
  slug: string;
  publishedAt: string;
  mainImage: any;
  author?: { name: string };
  categories?: { title: string }[];
}

const PER_PAGE = 9;
const G = '#25FF79';
const ALT = '#0F0F0F';

export default function Blogs() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<string | null>(null);

  useEffect(() => {
    client.fetch(`*[_type=="post"]|order(publishedAt desc){
      title,"slug":slug.current,publishedAt,mainImage,
      author->{name},categories[]->{title}
    }`).then(d => { setPosts(d); setLoading(false); }).catch(console.error);
  }, []);

  const cats = Array.from(new Set(posts.flatMap(p => p.categories?.map(c => c.title) ?? [])));

  const filtered = posts.filter(p =>
    (!search || p.title.toLowerCase().includes(search.toLowerCase())) &&
    (!cat || p.categories?.some(c => c.title === cat))
  );

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const featured = posts[0];
  const showFeatured = !search && !cat && page === 1 && !!featured;

  return (
    <Layout title="Blog — JetStart" description="Insights and updates from the JetStart team">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body, * { font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif!important; }
        code,pre,.mono{font-family:ui-monospace,'JetBrains Mono',monospace!important}
        ::selection{background:rgba(37,255,121,.2)}
        .post-img{transition:transform .5s ease}
        .post-card:hover .post-img{transform:scale(1.04)}
        .post-card{transition:border-color .2s}
        .post-card:hover{border-color:rgba(255,255,255,0.15)!important}
        .cat-pill{transition:all .2s;cursor:pointer}
        .cat-pill:hover{border-color:rgba(37,255,121,0.35)!important;color:#fff!important}
      `}</style>

      <div style={{ background: '#0A0A0A', color: '#fff', minHeight: '100vh' }}>

        {/* ── HEADER ──────────────────────────────────────────────────────────── */}
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

          {/* search + filter row */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ position: 'relative', minWidth: 220 }}>
              <Search size={13} color="#4B5563" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search…"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 12px 9px 34px', fontSize: 13, color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' as any, fontFamily: 'inherit', transition: 'border-color .2s' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(37,255,121,0.3)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {cats.map(c => (
                <button key={c} onClick={() => { setCat(prev => prev === c ? null : c); setPage(1); }} className="cat-pill"
                  style={{ fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 999, border: '1px solid', cursor: 'pointer', background: 'none',
                    borderColor: cat === c ? G : 'rgba(255,255,255,0.1)',
                    color: cat === c ? G : '#6B7280',
                  }}>{c}</button>
              ))}
            </div>
            {(search || cat) && (
              <button onClick={() => { setSearch(''); setCat(null); setPage(1); }}
                style={{ fontSize: 12, color: '#4B5563', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#4B5563')}>
                Clear ×
              </button>
            )}
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 120px' }}>

          {/* ── FEATURED ─────────────────────────────────────────────────────── */}
          {showFeatured && !loading && (
            <motion.a href={`/blog/${featured.slug}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, background: ALT, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', textDecoration: 'none', color: 'inherit', marginTop: 56, marginBottom: 16 }} className="featured-resp post-card">
              {featured.mainImage && (
                <div style={{ overflow: 'hidden', minHeight: 340 }}>
                  <img src={urlFor(featured.mainImage)} alt={featured.title} className="post-img"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}
              <div style={{ padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: G, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(37,255,121,0.07)', border: '1px solid rgba(37,255,121,0.15)', padding: '3px 9px', borderRadius: 4 }}>Featured</span>
                    {featured.categories?.[0] && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '3px 9px', borderRadius: 4 }}>{featured.categories[0].title}</span>
                    )}
                  </div>
                  <h2 style={{ fontWeight: 700, fontSize: 'clamp(20px,2.5vw,32px)', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 16, color: '#F9FAFB' }}>{featured.title}</h2>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    {featured.author && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(37,255,121,0.1)', border: '1px solid rgba(37,255,121,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: G }}>
                          {featured.author.name[0]}
                        </div>
                        <span style={{ fontSize: 13, color: '#9CA3AF' }}>{featured.author.name}</span>
                      </div>
                    )}
                    <span style={{ fontSize: 13, color: '#4B5563' }}>
                      {new Date(featured.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: G }}>
                    Read article <ArrowUpRight size={13} />
                  </div>
                </div>
              </div>
            </motion.a>
          )}

          {/* ── GRID ─────────────────────────────────────────────────────────── */}
          {loading ? (
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
          ) : slice.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#4B5563' }}>
              <div style={{ fontSize: 18, marginBottom: 12 }}>No posts found.</div>
              <button onClick={() => { setSearch(''); setCat(null); }}
                style={{ fontSize: 14, color: G, background: 'none', border: 'none', cursor: 'pointer' }}>Clear filters</button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={`${page}-${search}-${cat}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 16 }} className="blog-grid">
                {slice.map((post, i) => (
                  <motion.a key={post.slug} href={`/blog/${post.slug}`}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4 }}
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
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ── PAGINATION ───────────────────────────────────────────────────── */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 64 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(255,255,255,0.09)', background: 'none', color: '#6B7280', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.3 : 1, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
                onMouseEnter={e => { if (page !== 1) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#6B7280'; }}>
                ‹
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all .15s',
                    borderColor: p === page ? G : 'rgba(255,255,255,0.09)',
                    background: p === page ? 'rgba(37,255,121,0.08)' : 'none',
                    color: p === page ? G : '#6B7280',
                  }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(255,255,255,0.09)', background: 'none', color: '#6B7280', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.3 : 1, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
                onMouseEnter={e => { if (page !== pages) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#6B7280'; }}>
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .blog-grid{grid-template-columns:repeat(3,1fr)!important}
        .featured-resp{grid-template-columns:1fr 1fr!important}
        @media(max-width:1024px){.blog-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:700px){
          .blog-grid{grid-template-columns:1fr!important}
          .featured-resp{grid-template-columns:1fr!important}
        }
      `}</style>
    </Layout>
  );
}
