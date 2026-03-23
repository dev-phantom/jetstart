import React, { useState } from 'react';
import { Download, Menu, X } from 'lucide-react';
import { G } from './Shared';

const navLinks = [
  ['Docs', '/docs/getting-started/introduction'],
  ['Blog', '/blogs'],
  ['GitHub', 'https://github.com/dev-phantom/jetstart'],
] as const;

interface NavLinkProps {
  label: string;
  href: string;
  onClick?: () => void;
  isMobile?: boolean;
}

function NavLink({ label, href, onClick, isMobile }: NavLinkProps) {
  const isExternal = href.startsWith('http');
  
  if (isMobile) {
    return (
      <a
        href={href}
        onClick={onClick}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        style={{ fontSize: 18, fontWeight: 600, color: '#fff', textDecoration: 'none' }}
      >
        {label}
      </a>
    );
  }

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: '#9CA3AF',
        padding: '6px 12px',
        borderRadius: 6,
        transition: 'color .15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
      onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
    >
      {label}
    </a>
  );
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div id="custom-mobile-drawer" className="md:hidden mobile-menu-drawer">
      {navLinks.map(([label, href]) => (
        <NavLink key={label} label={label} href={href} isMobile onClick={onClose} />
      ))}
      <a
        href="https://www.npmjs.com/package/@jetstart/cli"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: 16,
          fontWeight: 600,
          color: '#0A0A0A',
          background: G,
          padding: '14px',
          borderRadius: 8,
          marginTop: 10,
        }}
      >
        <Download size={16} strokeWidth={2.5} /> Install CLI
      </a>
    </div>
  );
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav
        id="custom-landing-navbar"
        style={{
          position: 'fixed',
          top: 0,
          insetInline: 0,
          zIndex: 9999,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 24px',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, zIndex: 1001 }}>
            <img
              src="img/logos/logo.png"
              alt="JetStart Logo"
              className="w-8 h-8 rounded-md"
            />
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.02em', color: '#fff' }}>
              JetStart
            </span>
          </a>

          {/* links – desktop */}
          <div className="custom-nav-desktop items-center gap-2">
            {navLinks.map(([label, href]) => (
              <NavLink key={label} label={label} href={href} />
            ))}
            <a
              href="https://www.npmjs.com/package/@jetstart/cli"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: '#0A0A0A',
                background: G,
                padding: '6px 14px',
                borderRadius: 6,
                marginLeft: 4,
                transition: 'opacity .15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <Download size={13} strokeWidth={2.5} /> Install
            </a>
          </div>

          {/* mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
            style={{ background: 'none', border: 'none', color: '#fff', padding: 8, cursor: 'pointer', zIndex: 1001 }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
}
