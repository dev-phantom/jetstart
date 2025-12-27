import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { client } from '../services/sanity/sanityClient';
import { urlFor } from '../services/sanity/imageUrl';

export default function Blogs() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    client
      .fetch(
        `*[_type == "post"] | order(publishedAt desc) {
            title,
            "slug": slug.current,
            publishedAt,
            mainImage,
            author->{name, image},
            categories[]->{title},
            body
          }`
      )
      .then((data) => {
        setPosts(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  // Pagination Logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <Layout title="Blog" description="JetStart Blog">
      <div className="container margin-vert--md margin-vert--lg-desktop" style={{ padding: '0 1rem' }}>
        <div className="text--center margin-bottom--lg margin-bottom--xl-desktop">
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Latest Articles</h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.125rem)' }}>Insights, tutorials, and updates from the JetStart team.</p>
        </div>

        {isLoading ? (
          <div style={{textAlign: 'center', padding: '4rem'}}>
            <div className="loading-spinner">Loading...</div>
          </div>
        ) : (
          <>
            <div className="row">
              {currentPosts.map((post) => (
                <div key={post.slug} className="col col--12 col--6-tablet col--4-desktop margin-bottom--lg">
                  <div className="card h-100" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {post.mainImage && (
                          <div className="card__image">
                              <img
                                  src={urlFor(post.mainImage)}
                                  alt={post.title}
                                  style={{
                                      borderTopLeftRadius: '12px',
                                      borderTopRightRadius: '12px',
                                      height: '200px',
                                      width: '100%',
                                      objectFit: 'cover'
                                  }}
                              />
                          </div>
                      )}
                    <div className="card__header">
                      <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)' }}>{post.title}</h3>
                    </div>
                    <div className="card__body" style={{ flexGrow: 1 }}>
                      <p className="text--secondary">
                          {new Date(post.publishedAt).toLocaleDateString()}
                          {post.author && ` • ${post.author.name}`}
                      </p>
                    </div>
                    <div className="card__footer">
                      <a href={`/blog/${post.slug}`} className="button button--primary button--block">Read Article</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                className="button button--secondary"
                onClick={handlePrev}
                disabled={currentPage === 1}
                style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
              >
                Previous
              </button>
              <span style={{ alignSelf: 'center', fontSize: 'clamp(0.875rem, 2vw, 1rem)', padding: '0 0.5rem' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="button button--secondary"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
              >
                Next
              </button>
            </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
