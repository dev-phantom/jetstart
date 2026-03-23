/**
 * ComposeRenderer
 * Executes a compiled Kotlin→JS ES module in the browser, calls renderScreen(),
 * and turns the resulting component tree into pixel-perfect Material You HTML.
 *
 * The module is delivered as base64 over WebSocket. We decode it, create a
 * Blob URL so the browser can import() it as a real ES module, execute
 * renderScreen(), then recursively render the returned tree to React elements.
 */

import { useState, useEffect, useRef } from 'react';

// Material You design tokens 
const M3 = {
  // Colors
  primary:           '#6750A4',
  onPrimary:         '#FFFFFF',
  primaryContainer:  '#EADDFF',
  onPrimaryContainer:'#21005D',
  secondary:         '#625B71',
  secondaryContainer:'#E8DEF8',
  surface:           '#FFFBFE',
  surfaceVariant:    '#E7E0EC',
  onSurface:         '#1C1B1F',
  onSurfaceVariant:  '#49454F',
  outline:           '#79747E',
  outlineVariant:    '#CAC4D0',
  background:        '#FFFBFE',
  error:             '#B3261E',
  errorContainer:    '#F9DEDC',
  tertiary:          '#7D5260',
  tertiaryContainer: '#FFD8E4',
  inverseSurface:    '#313033',
  inverseOnSurface:  '#F4EFF4',
  scrim:             '#000000',
  // Elevation shadows
  elevation1: '0 1px 2px rgba(0,0,0,.15)',
  elevation2: '0 2px 6px rgba(0,0,0,.15)',
  elevation3: '0 4px 8px rgba(0,0,0,.15)',
  // Radius
  radiusXS:   '4px',
  radiusS:    '8px',
  radiusM:    '12px',
  radiusL:    '16px',
  radiusXL:   '28px',
  radiusFull: '50px',
  // Typography
  fonts: {
    displayLarge:   { size: 57, weight: 400, lineHeight: 64 },
    displayMedium:  { size: 45, weight: 400, lineHeight: 52 },
    displaySmall:   { size: 36, weight: 400, lineHeight: 44 },
    headlineLarge:  { size: 32, weight: 400, lineHeight: 40 },
    headlineMedium: { size: 28, weight: 400, lineHeight: 36 },
    headlineSmall:  { size: 24, weight: 400, lineHeight: 32 },
    titleLarge:     { size: 22, weight: 500, lineHeight: 28 },
    titleMedium:    { size: 16, weight: 500, lineHeight: 24 },
    titleSmall:     { size: 14, weight: 500, lineHeight: 20 },
    bodyLarge:      { size: 16, weight: 400, lineHeight: 24 },
    bodyMedium:     { size: 14, weight: 400, lineHeight: 20 },
    bodySmall:      { size: 12, weight: 400, lineHeight: 16 },
    labelLarge:     { size: 14, weight: 500, lineHeight: 20 },
    labelMedium:    { size: 12, weight: 500, lineHeight: 16 },
    labelSmall:     { size: 11, weight: 500, lineHeight: 16 },
  },
};

// Material Icons (subset via Material Symbols codepoints)
const ICON_MAP: Record<string, string> = {
  add: 'add', search: 'search', close: 'close', check: 'check',
  delete: 'delete', edit: 'edit', home: 'home', menu: 'menu',
  settings: 'settings', arrow_back: 'arrow_back', more_vert: 'more_vert',
  favorite: 'favorite', share: 'share', info: 'info', person: 'person',
  star: 'star', notifications: 'notifications', email: 'email',
  phone: 'phone', lock: 'lock', visibility: 'visibility',
  visibility_off: 'visibility_off', shopping_cart: 'shopping_cart',
  keyboard_arrow_down: 'keyboard_arrow_down', keyboard_arrow_up: 'keyboard_arrow_up',
  default: 'circle',
};

// Modifier → inline CSS─
function modToStyle(mod: any, extra?: React.CSSProperties): React.CSSProperties {
  if (!mod) return extra || {};
  const s: React.CSSProperties = {};
  if (mod.fillMaxSize)  { s.width = '100%'; s.height = '100%'; }
  if (mod.fillMaxWidth) s.width = '100%';
  if (mod.fillMaxHeight) s.height = '100%';
  if (mod.padding !== undefined) s.padding = mod.padding;
  if (mod.paddingH !== undefined) { s.paddingLeft = mod.paddingH; s.paddingRight = mod.paddingH; }
  if (mod.paddingV !== undefined) { s.paddingTop = mod.paddingV; s.paddingBottom = mod.paddingV; }
  if (mod.paddingStart !== undefined) s.paddingLeft = mod.paddingStart;
  if (mod.paddingEnd !== undefined) s.paddingRight = mod.paddingEnd;
  if (mod.paddingTop !== undefined) s.paddingTop = mod.paddingTop;
  if (mod.paddingBottom !== undefined) s.paddingBottom = mod.paddingBottom;
  if (mod.height !== undefined) s.height = mod.height;
  if (mod.width !== undefined) s.width = mod.width;
  if (mod.size !== undefined) { s.width = mod.size; s.height = mod.size; }
  if (mod.background) s.backgroundColor = mod.background;
  if (mod.clip === 'circle' || mod.clip === 'CircleShape') s.borderRadius = '50%';
  if (mod.alpha !== undefined) s.opacity = mod.alpha;
  if (mod.offsetX || mod.offsetY) s.transform = `translate(${mod.offsetX||0}px, ${mod.offsetY||0}px)`;
  if (mod.borderWidth) { s.border = `${mod.borderWidth}px solid ${mod.borderColor || M3.outline}`; }
  if (mod.weight) { s.flex = mod.weight; s.minWidth = 0; s.minHeight = 0; }
  if (mod.wrapWidth) s.width = 'fit-content';
  if (mod.wrapHeight) s.height = 'fit-content';
  return { ...s, ...(extra || {}) };
}

function typographyStyle(style: string): React.CSSProperties {
  const key = style?.replace(/MaterialTheme.typography./, '').replace(/./g, '') || 'bodyMedium';
  const t = (M3.fonts as any)[key] || M3.fonts.bodyMedium;
  return { fontSize: t.size, fontWeight: t.weight, lineHeight: `${t.lineHeight}px`, fontFamily: 'Roboto, sans-serif' };
}

function colorVal(c: string): string {
  if (!c || c === 'unspecified' || c === '') return M3.onSurface;
  if (c.startsWith('#') || c.startsWith('rgb')) return c;
  // Named M3 colors
  const map: Record<string,string> = {
    primary: M3.primary, onPrimary: M3.onPrimary,
    secondary: M3.secondary, surface: M3.surface,
    background: M3.background, error: M3.error,
    onBackground: M3.onSurface, onSurface: M3.onSurface,
    surfaceVariant: M3.surfaceVariant, outline: M3.outline,
  };
  return map[c] || M3.onSurface;
}

// Node Renderer 
let nodeKey = 0;
function key() { return String(nodeKey++); }

function renderNode(node: any): React.ReactElement | null {
  if (!node) return null;

  switch (node.type) {
    // Root
    case 'root':
      return renderChildren(node.children, { display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: M3.background, overflowY: 'auto' });

    // Scaffold 
    case 'Scaffold': {
      const topBars    = (node.topBar    || []).map(renderNode).filter(Boolean);
      const bottomBars = (node.bottomBar || []).map(renderNode).filter(Boolean);
      const fabs       = (node.fab       || []).map(renderNode).filter(Boolean);
      return (
        <div key={key()} style={{ display:'flex', flexDirection:'column', height:'100%', backgroundColor: M3.background, position:'relative', overflow:'hidden', ...modToStyle(node.modifier) }}>
          {topBars.length > 0 && <div style={{ flexShrink:0, zIndex:10 }}>{topBars}</div>}
          <div style={{ flex:1, overflowY:'auto', position:'relative' }}>
            {(node.children || []).map(renderNode)}
          </div>
          {bottomBars.length > 0 && <div style={{ flexShrink:0, zIndex:10 }}>{bottomBars}</div>}
          {fabs.length > 0 && (
            <div style={{ position:'absolute', bottom:16, right:16, display:'flex', flexDirection:'column', gap:8, zIndex:20, pointerEvents:'none' }}>
              {fabs}
            </div>
          )}
        </div>
      );
    }

    // TopAppBar 
    case 'TopAppBar': {
      const titles  = (node.title   || []).map(renderNode).filter(Boolean);
      const actions = (node.actions || []).map(renderNode).filter(Boolean);
      return (
        <div key={key()} style={{ display:'flex', alignItems:'center', height:64, paddingLeft:16, paddingRight:8, backgroundColor: M3.surface, boxShadow: M3.elevation1, flexShrink:0 }}>
          <div style={{ flex:1, ...typographyStyle('titleLarge'), color: M3.onSurface }}>{titles}</div>
          <div style={{ display:'flex', gap:4 }}>{actions}</div>
        </div>
      );
    }

    // NavigationBar
    case 'NavigationBar':
      return (
        <div key={key()} style={{ display:'flex', height:80, backgroundColor:M3.surfaceVariant, boxShadow:M3.elevation2, justifyContent:'space-around', alignItems:'center' }}>
          {renderChildren(node.children)}
        </div>
      );

    case 'NavigationBarItem': {
      const icons  = (node.children || []).map(renderNode).filter(Boolean);
      const labels = (node.label    || []).map(renderNode).filter(Boolean);
      return (
        <div key={key()} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'8px 16px', cursor:'pointer', borderRadius: M3.radiusL, backgroundColor: node.selected ? M3.secondaryContainer : 'transparent', minWidth:64 }}>
          {icons}
          <div style={{ ...typographyStyle('labelSmall'), color: node.selected ? M3.onSurface : M3.onSurfaceVariant }}>{labels}</div>
        </div>
      );
    }

    // Column
    case 'LazyColumn':
    case 'Column': {
      const va = node.verticalArrangement || '';
      const ha = node.horizontalAlignment || '';
      const justifyMap: Record<string,string> = {
        'top':'flex-start','bottom':'flex-end','center':'center',
        'space-between':'space-between','space-evenly':'space-evenly','space-around':'space-around',
      };
      const alignMap: Record<string,string> = { 'start':'flex-start','end':'flex-end','center':'center','centerHorizontally':'center' };
      const spaceMatch = va.match(/spacedBy\((\d+)\)/);
      return (
        <div key={key()} style={{ display:'flex', flexDirection:'column', justifyContent: justifyMap[va] || 'flex-start', alignItems: alignMap[ha] || 'stretch', gap: spaceMatch ? parseInt(spaceMatch[1]) : 0, ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </div>
      );
    }

    // Row
    case 'LazyRow':
    case 'Row': {
      const ha = node.horizontalArrangement || '';
      const va = node.verticalAlignment || '';
      const justifyMap: Record<string,string> = {
        'start':'flex-start','end':'flex-end','center':'center',
        'space-between':'space-between','space-evenly':'space-evenly','space-around':'space-around',
      };
      const alignMap: Record<string,string> = { 'top':'flex-start','bottom':'flex-end','centerVertically':'center','center':'center' };
      const spaceMatch = ha.match(/spacedBy\((\d+)\)/);
      return (
        <div key={key()} style={{ display:'flex', flexDirection:'row', justifyContent: justifyMap[ha] || 'flex-start', alignItems: alignMap[va] || 'center', gap: spaceMatch ? parseInt(spaceMatch[1]) : 0, flexWrap:'wrap', ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </div>
      );
    }

    // Box
    case 'Box': {
      const alignMap: Record<string,string> = {
        'topStart':'flex-start','topCenter':'center','topEnd':'flex-end',
        'centerStart':'flex-start','center':'center','centerEnd':'flex-end',
        'bottomStart':'flex-start','bottomCenter':'center','bottomEnd':'flex-end',
      };
      return (
        <div key={key()} style={{ position:'relative', display:'flex', alignItems: alignMap[node.contentAlignment] || 'flex-start', justifyContent:'flex-start', ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </div>
      );
    }

    // LazyVerticalStaggeredGrid — CSS columns masonry (2-col like real app)
    case 'LazyVerticalStaggeredGrid':
      return (
        <div key={key()} style={{ columnCount:2, columnGap:12, padding:12, ...modToStyle(node.modifier) }}>
          {(node.children || []).map((child: any, i: number) => (
            <div key={i} style={{ breakInside:'avoid', display:'inline-block', width:'100%', marginBottom:12 }}>{renderNode(child)}</div>
          ))}
        </div>
      );
    // LazyVerticalGrid — equal-col grid
    case 'LazyVerticalGrid':
      return (
        <div key={key()} style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8, padding:12, ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </div>
      );

    // Text
    case 'Text': {
      const styleKey = (node.style || 'bodyMedium').toString();
      const ts = typographyStyle(styleKey);
      const color = colorVal(node.color || '');
      const fw = node.fontWeight || '';
      const fwMap: Record<string,string> = { bold:'700', normal:'400', medium:'500', semibold:'600', light:'300' };
      const maxLines = node.maxLines && node.maxLines < 2147483647 ? node.maxLines : undefined;
      return (
        <span key={key()} style={{ ...ts, color, fontWeight: fwMap[fw] || ts.fontWeight, display:'block', ...( maxLines ? { overflow:'hidden', display:'-webkit-box', WebkitLineClamp:maxLines, WebkitBoxOrient:'vertical' as any } : {}), ...modToStyle(node.modifier) }}>
          {node.text || ''}
        </span>
      );
    }

    // Button
    case 'Button':
      return (
        <button key={key()} style={{ background: M3.primary, color: M3.onPrimary, border:'none', borderRadius: M3.radiusFull, padding:'10px 24px', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8, ...typographyStyle('labelLarge'), boxShadow: M3.elevation1, ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </button>
      );

    case 'OutlinedButton':
      return (
        <button key={key()} style={{ background:'transparent', color: M3.primary, border:`1.5px solid ${M3.outline}`, borderRadius: M3.radiusFull, padding:'10px 24px', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8, ...typographyStyle('labelLarge'), ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </button>
      );

    case 'TextButton':
      return (
        <button key={key()} style={{ background:'transparent', color: M3.primary, border:'none', borderRadius: M3.radiusFull, padding:'10px 12px', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8, ...typographyStyle('labelLarge'), ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </button>
      );

    case 'ElevatedButton':
    case 'FilledTonalButton':
      return (
        <button key={key()} style={{ background: M3.secondaryContainer, color: M3.onPrimary, border:'none', borderRadius: M3.radiusFull, padding:'10px 24px', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8, ...typographyStyle('labelLarge'), boxShadow: M3.elevation2, ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </button>
      );

    case 'IconButton':
      return (
        <button key={key()} style={{ background:'transparent', border:'none', borderRadius:'50%', width:40, height:40, display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: M3.onSurfaceVariant, ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </button>
      );

    case 'FloatingActionButton':
      return (
        <button key={key()} style={{ background: node.containerColor || M3.primaryContainer, border:'none', borderRadius: M3.radiusL, width:56, height:56, display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow: M3.elevation3, ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </button>
      );

    case 'ExtendedFAB':
      return (
        <button key={key()} style={{ background: M3.primaryContainer, border:'none', borderRadius: M3.radiusFull, height:56, padding:'0 20px', display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer', boxShadow: M3.elevation3, ...typographyStyle('labelLarge'), ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </button>
      );

    // Cards
    case 'Card':
      return (
        <div key={key()} style={{ backgroundColor: M3.surfaceVariant, borderRadius: M3.radiusM, overflow:'hidden', cursor: node.clickable ? 'pointer' : 'default', display:'block', width:'100%', ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </div>
      );

    case 'ElevatedCard':
      return (
        <div key={key()} style={{ backgroundColor: M3.surface, borderRadius: M3.radiusM, boxShadow: M3.elevation2, overflow:'hidden', cursor: node.clickable ? 'pointer' : 'default', ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </div>
      );

    case 'OutlinedCard':
      return (
        <div key={key()} style={{ backgroundColor: M3.surface, borderRadius: M3.radiusM, border:`1px solid ${M3.outlineVariant}`, overflow:'hidden', cursor: node.clickable ? 'pointer' : 'default', ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </div>
      );

    // Inputs
    case 'OutlinedTextField': {
      const label = (node.label || []).map(renderNode).filter(Boolean);
      const placeholder = (node.placeholder || []).map(renderNode).filter(Boolean);
      // No label = search-style pill field
      const isSearch = label.length === 0;
      const radius = isSearch ? M3.radiusFull : M3.radiusS;
      const bg = isSearch ? M3.surfaceVariant : M3.surface;
      const border = isSearch ? 'none' : `${node.isError ? 2 : 1}px solid ${node.isError ? M3.error : M3.outline}`;
      return (
        <div key={key()} style={{ position:'relative', ...modToStyle(node.modifier) }}>
          {label.length > 0 && <div style={{ position:'absolute', top:-10, left:12, background: M3.surface, paddingLeft:4, paddingRight:4, ...typographyStyle('labelSmall'), color: node.isError ? M3.error : M3.primary, zIndex:1 }}>{label}</div>}
          <input
            defaultValue={node.value || ''}
            style={{ width:'100%', boxSizing:'border-box' as any, border, borderRadius:radius, padding: isSearch ? '12px 20px' : '16px 12px', ...typographyStyle('bodyLarge'), color: M3.onSurface, background: bg, outline:'none' }}
          />
          {placeholder.length > 0 && !node.value && <div style={{ position:'absolute', top:'50%', left: isSearch ? 20 : 12, transform:'translateY(-50%)', ...typographyStyle('bodyLarge'), color: M3.onSurfaceVariant, pointerEvents:'none' }}>{placeholder}</div>}
        </div>
      );
    }

    case 'TextField': {
      const label = (node.label || []).map(renderNode).filter(Boolean);
      return (
        <div key={key()} style={{ position:'relative', ...modToStyle(node.modifier) }}>
          {label.length > 0 && <div style={{ ...typographyStyle('labelSmall'), color: M3.primary, paddingLeft:16, paddingTop:8 }}>{label}</div>}
          <input
            defaultValue={node.value || ''}
            style={{ width:'100%', boxSizing:'border-box' as any, border:'none', borderBottom:`1px solid ${M3.outline}`, borderRadius:`${M3.radiusS} ${M3.radiusS} 0 0`, padding:'8px 16px 8px', ...typographyStyle('bodyLarge'), color: M3.onSurface, background: M3.surfaceVariant, outline:'none' }}
          />
        </div>
      );
    }

    case 'SearchBar':
      return (
        <div key={key()} style={{ display:'flex', alignItems:'center', background: M3.surfaceVariant, borderRadius: M3.radiusFull, padding:'8px 16px', gap:8, ...modToStyle(node.modifier) }}>
          <span className="material-symbols-rounded" style={{ fontSize:20, color: M3.onSurfaceVariant }}>search</span>
          <input defaultValue={node.query || ''} placeholder="Search..." style={{ flex:1, background:'transparent', border:'none', outline:'none', ...typographyStyle('bodyLarge'), color: M3.onSurface }} />
        </div>
      );

    // Icon
    case 'Icon': {
      const iconName = ICON_MAP[node.icon] || node.icon || 'circle';
      const tint = colorVal(node.tint || '');
      const mod = node.modifier || {};
      const size = mod.size || 24;
      return (
        <span key={key()} className="material-symbols-rounded" style={{ fontSize: size, color: tint || M3.onSurfaceVariant, lineHeight:1, display:'inline-block', ...modToStyle(node.modifier) }}>{iconName}</span>
      );
    }

    // Image / AsyncImage
    case 'Image':
    case 'AsyncImage': {
      const mod = node.modifier || {};
      const w = mod.width || mod.fillMaxWidth ? '100%' : 120;
      const h = mod.height || 120;
      return (
        <div key={key()} style={{ width:w, height:h, backgroundColor: M3.surfaceVariant, borderRadius: M3.radiusS, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', ...modToStyle(node.modifier) }}>
          {node.model ? (
            <img src={node.model} alt={node.contentDescription || ''} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          ) : (
            <span className="material-symbols-rounded" style={{ fontSize:32, color: M3.onSurfaceVariant }}>image</span>
          )}
        </div>
      );
    }

    // Spacer
    case 'Spacer': {
      const mod = node.modifier || {};
      return <div key={key()} style={{ flex: mod.weight ? mod.weight : undefined, width: mod.width, height: mod.height, minWidth: mod.width, minHeight: mod.height }} />;
    }

    // Divider
    case 'Divider':
    case 'HorizontalDivider':
      return <hr key={key()} style={{ border:'none', borderTop:`${node.thickness||1}px solid ${M3.outlineVariant}`, margin:'4px 0', ...modToStyle(node.modifier) }} />;

    // Switch
    case 'Switch':
      return (
        <div key={key()} style={{ display:'inline-flex', alignItems:'center', cursor:'pointer', ...modToStyle(node.modifier) }}>
          <div style={{ width:52, height:32, borderRadius:16, background: node.checked ? M3.primary : M3.surfaceVariant, border:`2px solid ${node.checked ? M3.primary : M3.outline}`, position:'relative', transition:'background .2s' }}>
            <div style={{ width:24, height:24, borderRadius:'50%', background: node.checked ? M3.onPrimary : M3.outline, position:'absolute', top:2, left: node.checked ? 22 : 2, transition:'left .2s' }} />
          </div>
        </div>
      );

    // Checkbox
    case 'Checkbox':
      return (
        <div key={key()} style={{ width:20, height:20, borderRadius: M3.radiusXS, border:`2px solid ${node.checked ? M3.primary : M3.outline}`, background: node.checked ? M3.primary : 'transparent', display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer', ...modToStyle(node.modifier) }}>
          {node.checked && <span className="material-symbols-rounded" style={{ fontSize:14, color: M3.onPrimary }}>check</span>}
        </div>
      );

    // RadioButton
    case 'RadioButton':
      return (
        <div key={key()} style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${node.selected ? M3.primary : M3.outline}`, display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer', ...modToStyle(node.modifier) }}>
          {node.selected && <div style={{ width:10, height:10, borderRadius:'50%', background: M3.primary }} />}
        </div>
      );

    // Progress
    case 'CircularProgressIndicator':
      return (
        <div key={key()} style={{ width:40, height:40, borderRadius:'50%', border:`4px solid ${M3.surfaceVariant}`, borderTopColor: M3.primary, animation:'spin 1s linear infinite', ...modToStyle(node.modifier) }}>
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        </div>
      );

    case 'LinearProgressIndicator': {
      const pct = Math.round((node.progress || 0) * 100);
      return (
        <div key={key()} style={{ height:4, background: M3.surfaceVariant, borderRadius:2, overflow:'hidden', ...modToStyle(node.modifier) }}>
          <div style={{ height:'100%', width:`${pct}%`, background: M3.primary, transition:'width .3s' }} />
        </div>
      );
    }

    // Chips
    case 'Chip': {
      const labelNodes = (node.label || []).map(renderNode).filter(Boolean);
      const bg = node.chipType === 'filter' && node.selected ? M3.secondaryContainer : M3.surface;
      return (
        <div key={key()} style={{ display:'inline-flex', alignItems:'center', gap:8, height:32, borderRadius: M3.radiusFull, border:`1px solid ${M3.outline}`, paddingLeft:16, paddingRight:16, background:bg, cursor:'pointer', ...modToStyle(node.modifier) }}>
          <span style={{ ...typographyStyle('labelLarge'), color: M3.onSurface }}>{labelNodes}</span>
        </div>
      );
    }

    // AlertDialog
    case 'AlertDialog':
      return (
        <div key={key()} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ background: M3.surface, borderRadius: M3.radiusXL, padding:24, maxWidth:320, width:'90%', boxShadow: M3.elevation3 }}>
            {(node.title || []).length > 0 && <div style={{ ...typographyStyle('headlineSmall'), color: M3.onSurface, marginBottom:16 }}>{(node.title || []).map(renderNode)}</div>}
            {(node.text || []).length > 0 && <div style={{ ...typographyStyle('bodyMedium'), color: M3.onSurfaceVariant, marginBottom:24 }}>{(node.text || []).map(renderNode)}</div>}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              {(node.dismissButton || []).map(renderNode)}
              {(node.confirmButton || []).map(renderNode)}
            </div>
          </div>
        </div>
      );

    // DropdownMenu
    case 'DropdownMenu':
      return (
        <div key={key()} style={{ background: M3.surface, borderRadius: M3.radiusS, boxShadow: M3.elevation3, minWidth:180, overflow:'hidden', ...modToStyle(node.modifier) }}>
          {(node.children || []).map(renderNode)}
        </div>
      );

    case 'DropdownMenuItem':
      return (
        <div key={key()} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', cursor:'pointer', color: M3.onSurface, ...typographyStyle('bodyLarge'), ...modToStyle(node.modifier) }}>
          {(node.text || []).map(renderNode)}
        </div>
      );

    // BottomSheet
    case 'BottomSheet':
      return (
        <div key={key()} style={{ position:'fixed', bottom:0, left:0, right:0, background: M3.surface, borderRadius:`${M3.radiusXL} ${M3.radiusXL} 0 0`, padding:24, boxShadow: M3.elevation3, zIndex:99 }}>
          <div style={{ width:32, height:4, borderRadius:2, background: M3.outlineVariant, margin:'0 auto 16px' }} />
          {(node.children || []).map(renderNode)}
        </div>
      );

    // Slots (internal, render their children directly)
    case 'slot':
    case 'TopBarSlot': case 'BottomBarSlot': case 'FABSlot':
    case 'TitleSlot': case 'ActionsSlot': case 'IconSlot':
    case 'LabelSlot': case 'PlaceholderSlot': case 'TextSlot':
    case 'ConfirmSlot': case 'DismissSlot': case 'BadgeSlot':
    case 'BlockWrapper':
      return <>{(node.children || []).map(renderNode)}</>;

    default:
      // Unknown component — render children if any, otherwise nothing
      if (node.children?.length > 0) {
        return <div key={key()} style={{ ...modToStyle(node.modifier) }}>{(node.children || []).map(renderNode)}</div>;
      }
      return null;
  }
}

function renderChildren(children: any[], style?: React.CSSProperties): React.ReactElement {
  return <div style={style}>{(children || []).map(renderNode)}</div>;
}

// Main hook

export interface UseComposeRendererResult {
  element: React.ReactElement | null;
  isLoading: boolean;
  error: string | null;
  sourceFile: string | null;
  compileMs: number | null;
}

export function useComposeRenderer(
  jsUpdate: { jsBase64: string; sourceFile: string; byteSize: number; timestamp: number } | null
): UseComposeRendererResult {
  const [element, setElement]     = useState<React.ReactElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<string | null>(null);
  const [compileMs, setCompileMs] = useState<number | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!jsUpdate) return;

    setIsLoading(true);
    setError(null);
    const t0 = Date.now();

    // Revoke previous blob URL to avoid memory leaks
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    (async () => {
      try {
        // Decode base64 → text
        const jsText = atob(jsUpdate.jsBase64);

        // Create a Blob URL so the browser can import() it as an ES module
        const blob = new Blob([jsText], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;

        // Dynamically import the module — this executes it
        const mod = await import(/* @vite-ignore */ blobUrl);

        // Call renderScreen() with an empty lambda — the stubs build the tree
        if (typeof mod.renderScreen !== 'function') {
          throw new Error('Module does not export renderScreen()');
        }
        // __jetstart_render__ is injected by the preprocessor — it calls
        // the screen function inside renderScreen() returning the component tree
        let tree: any;
        if (typeof mod.__jetstart_render__ === 'function') {
          tree = mod.__jetstart_render__();
        } else {
          // Fallback: try renderScreen directly if wrapper wasn't injected
          tree = mod.renderScreen(() => {
            const screenFn = (Object.values(mod) as any[]).find(
              (v) => typeof v === 'function' && v !== mod.renderScreen && v !== mod.__jetstart_render__
            );
            if (screenFn) screenFn();
          });
        }

        // Reset key counter and render the tree to React elements
        nodeKey = 0;
        const rendered = renderNode(tree);
        setElement(rendered);
        setSourceFile(jsUpdate.sourceFile);
        setCompileMs(Date.now() - t0);
        setIsLoading(false);
      } catch (err: any) {
        console.error('[ComposeRenderer] Error:', err);
        setError(err.message || 'Render failed');
        setIsLoading(false);
      }
    })();

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [jsUpdate?.timestamp]);

  return { element, isLoading, error, sourceFile, compileMs };
}
