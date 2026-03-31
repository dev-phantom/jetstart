import React from 'react';

export function Footer() {
  return (
    <footer className="py-12 px-6">
      <div style={{ maxWidth: 1100, margin: '0 auto' }} className="flex flex-col md:flex-row items-start justify-between gap-10 md:gap-40">
        <div style={{ maxWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <img
              src="img/logos/logo.png"
              alt="JetStart Logo"
              className="w-8 h-8 rounded-md"
            />
            <span style={{ fontSize: 14, fontWeight: 600 }}>JetStart</span>
          </div>
          <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>Wireless Android hot reload for Jetpack Compose developers.</p>
        </div>
        {[
          { heading: 'Product', links: [['Docs','/docs/getting-started/introduction'],['CLI','/docs/cli/overview'],['Architecture','/docs/architecture/overview']] },
          { heading: 'Community', links: [
            ['GitHub','https://github.com/dev-phantom/jetstart'], 
            ['Discord','https://discord.gg/hTsUE9WJ'],
            ['X (Twitter)','https://x.com/jetstart_kt'],
            ['YouTube','https://youtube.com/@jetstart-kt'],
            ['TikTok','https://www.tiktok.com/@jetstart_kt'],
            ['Blog','/blogs']
          ] },
          { heading: 'Legal', links: [['npm','https://www.npmjs.com/package/@jetstart/cli'],['Contributing','/docs/contributing/getting-started'],['License','https://github.com/dev-phantom/jetstart']] },
        ].map(col => (
          <div key={col.heading}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>{col.heading}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map(([label, href]) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  style={{ fontSize: 13, color: '#6B7280', transition: 'color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>{label}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1100, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }} className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <span style={{ fontSize: 12, color: '#374151' }}>© {new Date().getFullYear()} JetStart. MIT License.</span>
        <span style={{ fontSize: 12, color: '#374151' }}>Built with Docusaurus</span>
      </div>
    </footer>
  );
}
