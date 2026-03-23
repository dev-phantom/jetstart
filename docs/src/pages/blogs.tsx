import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { client } from '../services/sanity/sanityClient';
import { BlogHeader, G } from '../components/Blog/BlogHeader';
import { BlogFilters } from '../components/Blog/BlogFilters';
import { FeaturedPost } from '../components/Blog/FeaturedPost';
import { BlogGrid } from '../components/Blog/BlogGrid';
import { Pagination } from '../components/Blog/Pagination';

interface Post {
  title: string;
  slug: string;
  publishedAt: string;
  mainImage: any;
  author?: { name: string };
  categories?: { title: string }[];
}

const PER_PAGE = 9;

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
    <Layout noFooter={true} title="Blog — JetStart" description="Insights and updates from the JetStart team">
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
        .blog-grid{grid-template-columns:repeat(3,1fr)!important}
        .featured-resp{grid-template-columns:1fr 1fr!important}
        @media(max-width:1024px){.blog-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:700px){
          .blog-grid{grid-template-columns:1fr!important}
          .featured-resp{grid-template-columns:1fr!important}
        }
      `}</style>

      <div style={{ background: '#0A0A0A', color: '#fff', minHeight: '100vh' }}>
        <BlogHeader />
        <BlogFilters 
          search={search} setSearch={setSearch} 
          cat={cat} setCat={setCat} 
          cats={cats} setPage={setPage} 
        />
        
        <div style={{ paddingBottom: 120 }}>
          {showFeatured && !loading && <FeaturedPost post={featured} />}
          
          <BlogGrid 
            posts={slice} loading={loading} 
            page={page} search={search} cat={cat} 
            setSearch={setSearch} setCat={setCat} 
            G={G} 
          />
          
          <Pagination page={page} pages={pages} setPage={setPage} G={G} />
        </div>
      </div>
    </Layout>
  );
}
