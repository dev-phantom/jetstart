import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
// @ts-ignore
import { useParams } from 'react-router-dom';
import { client } from '../services/sanity/sanityClient';
import { urlFor } from '../services/sanity/imageUrl';
import { PortableText } from '@portabletext/react';

export default function BlogPost() {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  // Fallback for static routes where slug param is not captured by router but present in URL
  const slug = paramSlug || (typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '').split('/').pop() : '');
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    client
      .fetch(
        `*[_type == "post" && slug.current == $slug][0]{
            title,
            publishedAt,
            mainImage,
            author->{name, image},
            body
          }`,
        { slug }
      )
      .then((data) => {
        if (!data) {
          setError('Post not found');
        } else {
          setPost(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load post');
        setIsLoading(false);
      });
  }, [slug]);

  const components = {
    types: {
      image: ({ value }: any) => {
        if (!value?.asset?._ref) {
          return null;
        }
        return (
          <div className="text--center margin-vert--md">
            <img
              src={urlFor(value)}
              alt={value.alt || 'Blog Image'}
              style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
          </div>
        );
      },
    },
  };

  return (
    <Layout title={post?.title || 'Loading...'} description="JetStart Blog">
      <div className="container margin-vert--xl">
        {isLoading ? (
          <div className="text--center padding--xl">
            <div className="loading-spinner">Loading...</div>
          </div>
        ) : error ? (
          <div className="text--center padding--xl">
            <h1>{error}</h1>
             <a href="/blogs" className="button button--primary">Back to Blog</a>
          </div>
        ) : (
          <div className="row justify-center">
            <div className="col col--8">
              <header className="margin-bottom--lg">
                {post.mainImage && (
                    <img 
                        src={urlFor(post.mainImage)} 
                        alt={post.title} 
                        style={{
                            borderRadius: '16px',
                            marginBottom: '2rem',
                            width: '100%',
                            maxHeight: '400px',
                            objectFit: 'cover'
                        }}
                    />
                )}
                <h1>{post.title}</h1>
                <div className="text--secondary margin-top--sm">
                  {new Date(post.publishedAt).toLocaleDateString()}
                  {post.author && ` • ${post.author.name}`}
                </div>
              </header>

              <article className="markdown" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                <PortableText value={post.body} components={components} />
              </article>
              
              <hr className="margin-vert--xl" />
              
              <div className="text--center">
                  <a href="/blogs" className="button button--secondary">← Back to All Posts</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
