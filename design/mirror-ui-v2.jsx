// Mirror AI v2 — Astro-inspired UI primitives
// Deep cosmic purple palette · gradient cards · glow effects

const C2 = {
  bg:           '#07050F',
  surface:      '#0E0B1E',
  surfaceSoft:  '#141028',
  surfaceMid:   '#1A1535',
  border:       '#241D42',
  borderGlow:   '#4B3999',
  text:         '#EDE9F7',
  muted:        '#9689C4',
  faint:        '#504875',
  accent:       '#9B6EE8',   // violet primary
  accentGold:   '#D8B56D',   // gold secondary
  accentRose:   '#E07AA8',   // rose
  accentTeal:   '#5EC4C0',   // teal
  accentBlue:   '#6EB0E8',   // blue
  danger:       '#E28484',
  success:      '#8BC9A0',
  fontDisplay:  "var(--font-display,'Cormorant Garamond',serif)",
  fontBody:     "var(--font-body,'DM Sans',sans-serif)",
};

// Feature color palettes
const FEATURE_PALETTES = {
  daily:        { bg: 'linear-gradient(145deg,#120F2A 0%,#1E1550 100%)', glow: '#5B3FD4', accent: '#9B6EE8', icon: '✦' },
  tarot:        { bg: 'linear-gradient(145deg,#110920 0%,#2A1650 100%)', glow: '#8B35D6', accent: '#C084FC', icon: '🂠' },
  coffee:       { bg: 'linear-gradient(145deg,#180C08 0%,#3B1910 100%)', glow: '#B85A30', accent: '#E8A87C', icon: '☕' },
  relationship: { bg: 'linear-gradient(145deg,#180A12 0%,#3B1428 100%)', glow: '#C4356A', accent: '#E07AA8', icon: '♡' },
  astrology:    { bg: 'linear-gradient(145deg,#080E20 0%,#142045 100%)', glow: '#2B5FC4', accent: '#6EB0E8', icon: '♄' },
  profile:      { bg: 'linear-gradient(145deg,#0A0E1A 0%,#151D35 100%)', glow: '#3B6B8A', accent: '#5EC4C0', icon: '◎' },
};

// ── Star field ───────────────────────────────────────────
const STAR_FIELD = [
  {x:5,y:4,s:1.2,o:.6},{x:18,y:11,s:.8,o:.4},{x:32,y:3,s:1.5,o:.5},
  {x:58,y:8,s:.9,o:.35},{x:74,y:5,s:1.2,o:.55},{x:88,y:14,s:.7,o:.45},
  {x:95,y:28,s:1.5,o:.3},{x:3,y:36,s:.9,o:.5},{x:22,y:45,s:1.2,o:.25},
  {x:43,y:22,s:1,o:.4},{x:67,y:32,s:1.8,o:.2},{x:80,y:48,s:.8,o:.45},
  {x:91,y:55,s:1.2,o:.35},{x:12,y:62,s:.9,o:.5},{x:35,y:70,s:1.5,o:.3},
  {x:55,y:58,s:.7,o:.4},{x:70,y:66,s:1.2,o:.25},{x:85,y:74,s:.9,o:.45},
  {x:8,y:80,s:1.5,o:.35},{x:28,y:86,s:.8,o:.55},{x:48,y:78,s:1,o:.3},
  {x:64,y:88,s:1.5,o:.4},{x:78,y:82,s:.8,o:.5},{x:93,y:90,s:1.2,o:.3},
  {x:15,y:94,s:.9,o:.45},{x:38,y:97,s:1.5,o:.25},{x:62,y:93,s:.7,o:.55},
];

function StarField2() {
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0}}>
      {STAR_FIELD.map((s,i)=>(
        <div key={i} style={{
          position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
          width:s.s, height:s.s, borderRadius:'50%',
          background:`oklch(85% 0.06 ${270 + (i*37)%120})`,
          opacity:s.o,
          boxShadow: s.s > 1.2 ? `0 0 ${s.s*3}px oklch(75% 0.15 270)` : 'none',
        }}/>
      ))}
      {/* Constellation lines */}
      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.08}}>
        <line x1="5%" y1="4%" x2="18%" y2="11%" stroke="#9B6EE8" strokeWidth=".5"/>
        <line x1="18%" y1="11%" x2="32%" y2="3%" stroke="#9B6EE8" strokeWidth=".5"/>
        <line x1="58%" y1="8%" x2="74%" y2="5%" stroke="#9B6EE8" strokeWidth=".5"/>
        <line x1="74%" y1="5%" x2="88%" y2="14%" stroke="#9B6EE8" strokeWidth=".5"/>
        <line x1="3%" y1="36%" x2="22%" y2="45%" stroke="#6EB0E8" strokeWidth=".5"/>
        <line x1="22%" y1="45%" x2="43%" y2="22%" stroke="#6EB0E8" strokeWidth=".5"/>
      </svg>
    </div>
  );
}

// ── Glow orb background ───────────────────────────────────
function GlowOrb({color='#5B3FD4', x='50%', y='40%', size=200, opacity=.18}) {
  return (
    <div style={{
      position:'absolute', left:x, top:y,
      width:size, height:size,
      transform:'translate(-50%,-50%)',
      borderRadius:'50%',
      background:`radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity, pointerEvents:'none', zIndex:0,
      filter:'blur(30px)',
    }}/>
  );
}

// ── Mirror mark v2 ────────────────────────────────────────
function MirrorMark2({size=52}) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <defs>
        <radialGradient id="mm2g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C084FC"/>
          <stop offset="100%" stopColor="#6B46D4"/>
        </radialGradient>
      </defs>
      <circle cx="26" cy="26" r="24" stroke="#9B6EE8" strokeWidth=".6" opacity=".25"/>
      <circle cx="26" cy="26" r="18" stroke="#9B6EE8" strokeWidth=".6" opacity=".4"/>
      <circle cx="26" cy="26" r="11" stroke="url(#mm2g)" strokeWidth=".8" opacity=".75"/>
      <circle cx="26" cy="26" r="4.5" fill="url(#mm2g)" opacity=".95"/>
      <circle cx="26" cy="26" r="4.5" fill="#C084FC" opacity=".5"
        style={{filter:'blur(3px)'}}/>
      <path d="M26 9 C19 9 14 17 14 26 C14 17 18 11 24 10 Z" fill="#C084FC" opacity=".3"/>
    </svg>
  );
}

// ── Tarot card back v2 ────────────────────────────────────
function TarotCardBack2({width=86,height=136}) {
  return (
    <svg width={width} height={height} viewBox="0 0 86 136" fill="none">
      <defs>
        <linearGradient id="tcg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1A1040"/>
          <stop offset="100%" stopColor="#2D1B69"/>
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="84" height="134" rx="8" fill="url(#tcg)" stroke="#9B6EE8" strokeWidth=".7" strokeOpacity=".6"/>
      <rect x="4.5" y="4.5" width="77" height="127" rx="5" stroke="#9B6EE8" strokeWidth=".4" strokeOpacity=".2"/>
      <g transform="translate(43,68)">
        {Array.from({length:8},(_,i)=>{const a=(i*45)*Math.PI/180;return{x:Math.sin(a)*22,y:-Math.cos(a)*22};}).map((l,i)=>(
          <line key={i} x1="0" y1="0" x2={l.x.toFixed(1)} y2={l.y.toFixed(1)} stroke="#9B6EE8" strokeWidth=".5" strokeOpacity=".3"/>
        ))}
        <circle cx="0" cy="0" r="22" stroke="#9B6EE8" strokeWidth=".5" strokeOpacity=".2" fill="none"/>
        <circle cx="0" cy="0" r="14" stroke="#C084FC" strokeWidth=".5" strokeOpacity=".3" fill="none"/>
        <circle cx="0" cy="0" r="7"  stroke="#C084FC" strokeWidth=".5" strokeOpacity=".5" fill="none"/>
        <circle cx="0" cy="0" r="3" fill="#C084FC" fillOpacity=".6"/>
        <circle cx="0" cy="0" r="3" fill="#C084FC" style={{filter:'blur(2px)'}} fillOpacity=".5"/>
        {Array.from({length:8},(_,i)=>{const a=(i*45)*Math.PI/180;return{x:Math.sin(a)*17,y:-Math.cos(a)*17};}).map((d,i)=>(
          <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r="1.3" fill="#9B6EE8" fillOpacity=".35"/>
        ))}
      </g>
      <text x="43" y="22" textAnchor="middle" fontSize="11" fill="#C084FC" fillOpacity=".5" fontFamily="serif">✦</text>
      <text x="43" y="126" textAnchor="middle" fontSize="11" fill="#C084FC" fillOpacity=".5" fontFamily="serif">✦</text>
    </svg>
  );
}

// ── Moon phase icon ───────────────────────────────────────
function MoonPhase({phase='waxing', size=48}) {
  // phase: new, waxing, full, waning
  const phases = {
    new:     {left:'#1A1535', right:'#1A1535', border:'rgba(155,110,232,.3)'},
    waxing:  {left:'#1A1535', right:'#EDE9F7', border:'rgba(155,110,232,.5)'},
    full:    {left:'#EDE9F7', right:'#EDE9F7', border:'rgba(192,132,252,.7)'},
    waning:  {left:'#EDE9F7', right:'#1A1535', border:'rgba(155,110,232,.5)'},
  };
  const p = phases[phase] || phases.waxing;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9B6EE8" stopOpacity=".4"/>
          <stop offset="100%" stopColor="#9B6EE8" stopOpacity="0"/>
        </radialGradient>
        <clipPath id="moonLeft"><rect x="0" y="0" width="24" height="48"/></clipPath>
        <clipPath id="moonRight"><rect x="24" y="0" width="24" height="48"/></clipPath>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#moonGlow)" opacity=".5"/>
      <circle cx="24" cy="24" r="18" fill={p.left} clipPath="url(#moonLeft)"/>
      <circle cx="24" cy="24" r="18" fill={p.right} clipPath="url(#moonRight)"/>
      <circle cx="24" cy="24" r="18" fill="none" stroke={p.border} strokeWidth="1.2"/>
    </svg>
  );
}

// ── Gradient button ───────────────────────────────────────
function Btn2({children, variant='primary', onPress, disabled, small, color}) {
  const [pressed, setPressed] = React.useState(false);
  const isPri = variant === 'primary';
  const grad = color || 'linear-gradient(135deg, #7B45D6 0%, #9B6EE8 100%)';
  return (
    <button
      onClick={disabled ? undefined : onPress}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display:'block', width:'100%',
        padding: small ? '10px 16px' : '15px 20px',
        borderRadius: 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: isPri ? 'none' : `1px solid ${C2.border}`,
        background: disabled ? C2.surfaceSoft : isPri ? grad : 'transparent',
        color: disabled ? C2.faint : isPri ? '#F0ECF8' : C2.text,
        fontFamily: C2.fontBody, fontSize: small ? 13 : 15,
        fontWeight: 700, letterSpacing: '.01em', textAlign: 'center',
        opacity: pressed ? .82 : 1,
        transform: pressed ? 'scale(.985)' : 'scale(1)',
        transition: 'opacity .1s, transform .1s',
        boxShadow: isPri && !disabled ? '0 4px 20px rgba(155,110,232,.35)' : 'none',
      }}
    >{children}</button>
  );
}

// ── Text field v2 ─────────────────────────────────────────
function Field2({label, value, onChange, placeholder, multiline, type='text'}) {
  const s = {
    background: C2.surfaceSoft, border: `1px solid ${C2.border}`,
    borderRadius: 12, padding: '12px 14px', color: C2.text,
    fontFamily: C2.fontBody, fontSize: 15, outline: 'none',
    width: '100%', boxSizing: 'border-box', transition: 'border-color .2s',
  };
  return (
    <div style={{display:'flex', flexDirection:'column', gap:6}}>
      <label style={{fontSize:11, color:C2.muted, fontFamily:C2.fontBody, fontWeight:600, letterSpacing:'.07em', textTransform:'uppercase'}}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{...s, resize:'none'}}/>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s}/>
      }
    </div>
  );
}

// ── Feature card (Astro-style) ────────────────────────────
function FeatureCard({type='daily', title, body, meta, onPress, size='normal'}) {
  const pal = FEATURE_PALETTES[type] || FEATURE_PALETTES.daily;
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onClick={onPress}
      onPointerEnter={() => setHov(true)}
      onPointerLeave={() => setHov(false)}
      style={{
        background: pal.bg,
        border: `1px solid ${hov ? pal.accent : C2.border}`,
        borderRadius: 16,
        padding: size === 'large' ? '18px 18px' : '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 7,
        cursor: onPress ? 'pointer' : 'default',
        position: 'relative', overflow: 'hidden',
        transition: 'border-color .2s',
        boxShadow: hov ? `0 0 20px ${pal.glow}22` : 'none',
      }}
    >
      {/* glow */}
      <div style={{
        position:'absolute', right:-30, top:-30, width:100, height:100,
        borderRadius:'50%',
        background:`radial-gradient(circle, ${pal.glow}44 0%, transparent 70%)`,
        pointerEvents:'none', filter:'blur(15px)',
      }}/>
      {meta && (
        <div style={{fontSize:11, color:pal.accent, fontFamily:C2.fontBody, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', zIndex:1}}>
          {meta}
        </div>
      )}
      {title && (
        <div style={{fontSize: size==='large' ? 18 : 16, color:C2.text, fontFamily:C2.fontDisplay, fontWeight:600, lineHeight:1.3, zIndex:1}}>
          {title}
        </div>
      )}
      {body && (
        <div style={{fontSize:13, color:C2.muted, fontFamily:C2.fontBody, lineHeight:1.65, fontWeight:300, zIndex:1}}>
          {body}
        </div>
      )}
    </div>
  );
}

// ── Insight card (simple) ─────────────────────────────────
function InsightCard2({title, body, meta, accent, onPress, type}) {
  if (type) return <FeatureCard type={type} title={title} body={body} meta={meta} onPress={onPress}/>;
  return (
    <div onClick={onPress} style={{
      background: C2.surface,
      border: `1px solid ${accent ? C2.borderGlow : C2.border}`,
      borderLeft: accent ? `2px solid #9B6EE8` : `1px solid ${C2.border}`,
      borderRadius: 14, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 6,
      cursor: onPress ? 'pointer' : 'default',
    }}>
      {meta && <div style={{fontSize:11, color:'#9B6EE8', fontFamily:C2.fontBody, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase'}}>{meta}</div>}
      {title && <div style={{fontSize:16, color:C2.text, fontFamily:C2.fontDisplay, fontWeight:600, lineHeight:1.3}}>{title}</div>}
      {body && <div style={{fontSize:13, color:C2.muted, fontFamily:C2.fontBody, lineHeight:1.65, fontWeight:300}}>{body}</div>}
    </div>
  );
}

// ── Page header v2 ────────────────────────────────────────
function PageHeader2({eyebrow, title, subtitle, gradient}) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:5, paddingBottom:4}}>
      {eyebrow && <div style={{fontSize:11, color:'#9B6EE8', fontFamily:C2.fontBody, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase'}}>{eyebrow}</div>}
      <div style={{
        fontSize:28, color:C2.text, fontFamily:C2.fontDisplay, fontWeight:600,
        lineHeight:1.15, letterSpacing:'-.01em',
        ...(gradient ? {
          background:'linear-gradient(90deg, #C084FC 0%, #EDE9F7 50%, #D8B56D 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          backgroundClip:'text',
        } : {}),
      }}>{title}</div>
      {subtitle && <div style={{fontSize:13, color:C2.muted, fontFamily:C2.fontBody, lineHeight:1.65, fontWeight:300}}>{subtitle}</div>}
    </div>
  );
}

// ── Reading card v2 ───────────────────────────────────────
function ReadingCard2({reading, onPress}) {
  const typeMap = {daily:'daily', tarot:'tarot', coffee:'coffee', relationship:'relationship'};
  const labels = {daily:'Günlük', tarot:'Tarot', coffee:'Kahve', relationship:'İlişki'};
  const pal = FEATURE_PALETTES[typeMap[reading.reading_type]] || FEATURE_PALETTES.daily;
  return (
    <div onClick={onPress} style={{
      background: pal.bg, border:`1px solid ${C2.border}`,
      borderRadius:14, padding:'13px 15px',
      display:'flex', flexDirection:'column', gap:5, cursor:'pointer',
      position:'relative', overflow:'hidden',
    }}>
      <div style={{position:'absolute', right:-20, top:-20, width:80, height:80, borderRadius:'50%', background:`radial-gradient(circle, ${pal.glow}33 0%, transparent 70%)`, filter:'blur(12px)', pointerEvents:'none'}}/>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontSize:10, color:pal.accent, fontFamily:C2.fontBody, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase'}}>{labels[reading.reading_type]||reading.reading_type}</div>
        <div style={{fontSize:10, color:C2.faint, fontFamily:C2.fontBody}}>{reading.created_at?.slice(0,10)}</div>
      </div>
      <div style={{fontSize:16, color:C2.text, fontFamily:C2.fontDisplay, fontWeight:600, lineHeight:1.2}}>{reading.title}</div>
      <div style={{fontSize:12, color:C2.muted, fontFamily:C2.fontBody, lineHeight:1.5, fontWeight:300}}>{reading.summary?.slice(0,80)}…</div>
    </div>
  );
}

// ── Bottom nav v2 ─────────────────────────────────────────
function BottomNav2({tab, setTab}) {
  const tabs = [
    {id:'home',      label:'Ana',      path:'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'},
    {id:'tarot',     label:'Tarot',    path:'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z'},
    {id:'coffee',    label:'Kahve',    path:'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3'},
    {id:'relationship',label:'İlişki',path:'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z'},
    {id:'profile',   label:'Profil',   path:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z'},
  ];
  return (
    <div style={{
      display:'flex', flexShrink:0,
      background:'rgba(14,11,30,.95)',
      backdropFilter:'blur(20px)',
      borderTop:`1px solid ${C2.border}`,
      paddingBottom:28, paddingTop:8,
    }}>
      {tabs.map(t => {
        const active = tab === t.id;
        const pal = FEATURE_PALETTES[t.id] || FEATURE_PALETTES.daily;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1, background:'none', border:'none', cursor:'pointer',
            display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'4px 0',
          }}>
            <div style={{
              width:32, height:32, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
              background: active ? `${pal.glow}33` : 'transparent',
              transition:'background .2s',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={active ? pal.accent : C2.faint}
                strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d={t.path}/>
              </svg>
            </div>
            <span style={{fontSize:9, fontFamily:C2.fontBody, fontWeight:600, color: active ? pal.accent : C2.faint, letterSpacing:'.02em'}}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Scrollable screen ─────────────────────────────────────
function Scr2({children, style={}}) {
  return (
    <div style={{flex:1, overflowY:'auto', overflowX:'hidden', display:'flex', flexDirection:'column', gap:10, padding:'72px 18px 24px', ...style}}>
      {children}
    </div>
  );
}

// ── Back button v2 ────────────────────────────────────────
function BackBtn2({onPress}) {
  return (
    <button onClick={onPress} style={{background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, padding:0, alignSelf:'flex-start'}}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9B6EE8" strokeWidth="2" strokeLinecap="round">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      <span style={{fontSize:13, color:'#9B6EE8', fontFamily:C2.fontBody, fontWeight:600}}>Geri</span>
    </button>
  );
}

// ── Chip group v2 ─────────────────────────────────────────
function ChipGroup2({options, value, onChange}) {
  return (
    <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          padding:'8px 16px', borderRadius:20,
          border: `1px solid ${value===o.id ? '#9B6EE8' : C2.border}`,
          background: value===o.id ? 'rgba(155,110,232,.15)' : 'transparent',
          color: value===o.id ? C2.text : C2.muted,
          fontFamily:C2.fontBody, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .15s',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

// ── Score bar v2 ──────────────────────────────────────────
function ScoreBar2({label, value, color='#9B6EE8'}) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:5}}>
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <span style={{fontSize:12, color:C2.muted, fontFamily:C2.fontBody, fontWeight:500}}>{label}</span>
        <span style={{fontSize:12, color, fontFamily:C2.fontBody, fontWeight:700}}>{value}%</span>
      </div>
      <div style={{height:4, borderRadius:2, background:C2.border}}>
        <div style={{height:'100%', borderRadius:2, width:`${value}%`, transition:'width .6s ease',
          background:`linear-gradient(90deg, ${color}99, ${color})`}}/>
      </div>
    </div>
  );
}

// ── Energy ring ───────────────────────────────────────────
function EnergyRing({value=72, size=80, color='#9B6EE8'}) {
  const r = (size-8)/2;
  const circ = 2*Math.PI*r;
  const dash = (value/100)*circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}22`} strokeWidth="5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${dash.toFixed(1)} ${(circ-dash).toFixed(1)}`}
        style={{filter:`drop-shadow(0 0 4px ${color})`}}/>
    </svg>
  );
}

Object.assign(window, {
  C2, FEATURE_PALETTES,
  StarField2, GlowOrb, MirrorMark2, TarotCardBack2, MoonPhase, EnergyRing,
  Btn2, Field2, FeatureCard, InsightCard2, PageHeader2, ReadingCard2,
  BottomNav2, Scr2, BackBtn2, ChipGroup2, ScoreBar2,
});
