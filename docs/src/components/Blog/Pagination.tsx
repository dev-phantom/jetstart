import React from 'react';

interface PaginationProps {
  page: number;
  pages: number;
  setPage: (p: number | ((prev: number) => number)) => void;
  G: string;
}

export function Pagination({ page, pages, setPage, G }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
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
    </div>
  );
}
