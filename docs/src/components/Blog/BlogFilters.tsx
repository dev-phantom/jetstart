import React from 'react';
import { Search } from 'lucide-react';
import { G } from './BlogHeader';

interface BlogFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  cat: string | null;
  setCat: (c: string | null) => void;
  cats: string[];
  setPage: (p: number) => void;
}

export function BlogFilters({ search, setSearch, cat, setCat, cats, setPage }: BlogFiltersProps) {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
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
            <button key={c} onClick={() => { setCat(cat === c ? null : c); setPage(1); }} className="cat-pill"
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
  );
}
