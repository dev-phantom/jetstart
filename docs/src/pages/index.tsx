import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import { useScroll, useTransform } from 'framer-motion';
import { client } from '../services/sanity/sanityClient';
import { Navbar } from '../components/Landing/Navbar';
import { Hero } from '../components/Landing/Hero';
import { ProductVisual } from '../components/Landing/ProductVisual';
import { Stats } from '../components/Landing/Stats';
import { FeatureSection } from '../components/Landing/FeatureSection';
import { BlogSection, type BlogPost } from '../components/Landing/BlogSection';
import { CTA } from '../components/Landing/CTA';
import { Footer } from '../components/Landing/Footer';

export default function JetStartLanding() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  useEffect(() => {
    client.fetch(`*[_type=="post"]|order(publishedAt desc)[0...3]{
      title,"slug":slug.current,publishedAt,mainImage,author->{name},categories[]->{title}
    }`).then(setPosts).catch(console.error);

    // Toggle landing-page-active class on html element
    document.documentElement.classList.add('landing-page-active');
    return () => document.documentElement.classList.remove('landing-page-active');
  }, []);

  return (
    <Layout noFooter={true} wrapperClassName="landing-page" title="JetStart — Build Android Apps at the Speed of Thought" description="Hot reload for Jetpack Compose, wirelessly to your device. Live updates, no more waiting for Gradle.">
      <div style={{ background: '#0A0A0A', color: '#fff', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", overflowX: 'hidden', position: 'relative' }}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
          code, pre, .mono { font-family: ui-monospace, 'JetBrains Mono', 'Fira Code', monospace !important; }
          a { text-decoration: none; color: inherit; }
          ::selection { background: rgba(37,255,121,0.25); }
          html { background: #0A0A0A; }
          .navbar { display: none !important; }
          .footer { display: none !important; }
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

        <Navbar />
        <Hero bgY={bgY} heroRef={heroRef} />
        <ProductVisual />
        <Stats />
        <FeatureSection />
        <BlogSection posts={posts} />
        <CTA />
        <Footer />

      </div>
    </Layout>
  );
}
