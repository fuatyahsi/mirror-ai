// Mirror AI — shared UI primitives (v2 — CSS var theming)

const C = {
  bg: '#090B10', surface: '#121722', surfaceSoft: '#18202E',
  border: '#293241', text: '#F4EFE7', muted: '#A7AFBD',
  faint: '#707A8A',
  accent:     'var(--accent,     #D8B56D)',
  accentSoft: 'var(--accent-soft,#3B3220)',
  danger: '#E28484', success: '#8BC9A0',
  fontDisplay: 'var(--font-display,"Cormorant Garamond",serif)',
  fontBody:    'var(--font-body,  "DM Sans",sans-serif)',
};

// ── Decorative stars ──────────────────────────────────────
const STAR_DATA = [
  {x:8,y:6,s:1.5,o:.55},{x:80,y:12,s:1,o:.35},{x:48,y:4,s:1,o:.45},
  {x:92,y:20,s:1.5,o:.25},{x:22,y:30,s:1,o:.6},{x:66,y:26,s:2,o:.2},
  {x:5,y:52,s:1,o:.45},{x:90,y:46,s:1.5,o:.3},{x:57,y:40,s:1,o:.25},
  {x:30,y:65,s:2,o:.15},{x:75,y:60,s:1,o:.5},{x:15,y:76,s:1.5,o:.35},
  {x:94,y:73,s:1,o:.25},{x:52,y:83,s:1.5,o:.4},{x:36,y:91,s:1,o:.35},
  {x:82,y:87,s:2,o:.18},{x:12,y:94,s:1,o:.5},{x:60,y:96,s:1.5,o:.3},
];
function Stars() {
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0}}>
      {STAR_DATA.map((s,i)=>(
        <div key={i} style={{position:'absolute',left:`${s.x}%`,top:`${s.y}%`,width:s.s,height:s.s,borderRadius:'50%',background:'var(--accent,#D8B56D)',opacity:s.o}}/>
      ))}
    </div>
  );
}

// ── Mirror mark ───────────────────────────────────────────
function MirrorMark({size=52}) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="24" stroke="var(--accent,#D8B56D)" strokeWidth=".6" opacity=".3"/>
      <circle cx="26" cy="26" r="18" stroke="var(--accent,#D8B56D)" strokeWidth=".6" opacity=".5"/>
      <circle cx="26" cy="26" r="11" stroke="var(--accent,#D8B56D)" strokeWidth=".7" opacity=".8"/>
      <circle cx="26" cy="26" r="4"  fill="var(--accent,#D8B56D)"   opacity=".9"/>
      <path d="M26 9 C19 9 14 17 14 26 C14 17 18 11 24 10 Z" fill="var(--accent,#D8B56D)" opacity=".4"/>
    </svg>
  );
}

// ── Tarot card back ───────────────────────────────────────
function TarotCardBack({width=86,height=136}) {
  const lines = Array.from({length:8},(_,i)=>{const a=(i*45)*Math.PI/180;return{x:Math.sin(a)*22,y:-Math.cos(a)*22};});
  const dots  = Array.from({length:8},(_,i)=>{const a=(i*45)*Math.PI/180;return{x:Math.sin(a)*17,y:-Math.cos(a)*17};});
  return (
    <svg width={width} height={height} viewBox="0 0 86 136" fill="none">
      <rect x="1" y="1" width="84" height="134" rx="8" fill="#0D1119" stroke="var(--accent,#D8B56D)" strokeWidth=".6" strokeOpacity=".5"/>
      <rect x="4.5" y="4.5" width="77" height="127" rx="5" stroke="var(--accent,#D8B56D)" strokeWidth=".4" strokeOpacity=".22"/>
      <g transform="translate(43,68)">
        {lines.map((l,i)=><line key={i} x1="0" y1="0" x2={l.x.toFixed(1)} y2={l.y.toFixed(1)} stroke="var(--accent,#D8B56D)" strokeWidth=".5" strokeOpacity=".35"/>)}
        <circle cx="0" cy="0" r="22" stroke="var(--accent,#D8B56D)" strokeWidth=".5" strokeOpacity=".25" fill="none"/>
        <circle cx="0" cy="0" r="14" stroke="var(--accent,#D8B56D)" strokeWidth=".5" strokeOpacity=".35" fill="none"/>
        <circle cx="0" cy="0" r="7"  stroke="var(--accent,#D8B56D)" strokeWidth=".5" strokeOpacity=".5"  fill="none"/>
        <circle cx="0" cy="0" r="2.5" fill="var(--accent,#D8B56D)" fillOpacity=".55"/>
        {dots.map((d,i)=><circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r="1.2" fill="var(--accent,#D8B56D)" fillOpacity=".28"/>)}
      </g>
      <path d="M43 18 C38 18 34 22 34 28 C34 22 37 19 42 18.5 Z" fill="var(--accent,#D8B56D)" fillOpacity=".4"/>
      <path d="M43 118 C48 118 52 114 52 108 C52 114 49 117 44 117.5 Z" fill="var(--accent,#D8B56D)" fillOpacity=".4"/>
    </svg>
  );
}

// ── Button ────────────────────────────────────────────────
function Btn({children,variant='primary',onPress,disabled,small}) {
  const [p,setP]=React.useState(false);
  const isPri=variant==='primary';
  return (
    <button onClick={disabled?undefined:onPress} onPointerDown={()=>!disabled&&setP(true)}
      onPointerUp={()=>setP(false)} onPointerLeave={()=>setP(false)}
      style={{
        display:'block',width:'100%',padding:small?'10px 16px':'14px 20px',
        borderRadius:10,cursor:disabled?'not-allowed':'pointer',
        border:isPri?'none':`1px solid ${C.border}`,
        background:disabled?C.surfaceSoft:isPri?'var(--accent,#D8B56D)':'transparent',
        color:disabled?C.faint:isPri?'#08090C':C.text,
        fontFamily:C.fontBody,fontSize:small?13:15,fontWeight:700,
        letterSpacing:'.01em',textAlign:'center',
        opacity:p?.82:1,transform:p?'scale(.985)':'scale(1)',
        transition:'opacity .1s,transform .1s',
      }}>{children}</button>
  );
}

// ── Text field ────────────────────────────────────────────
function Field({label,value,onChange,placeholder,multiline,type='text'}) {
  const s={background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,
    padding:'12px 14px',color:C.text,fontFamily:C.fontBody,fontSize:15,
    outline:'none',width:'100%',boxSizing:'border-box'};
  return (
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      <label style={{fontSize:11,color:C.muted,fontFamily:C.fontBody,fontWeight:600,letterSpacing:'.07em',textTransform:'uppercase'}}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{...s,resize:'none'}}/>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s}/>
      }
    </div>
  );
}

// ── Insight card ──────────────────────────────────────────
function InsightCard({title,body,meta,accent,onPress}) {
  return (
    <div onClick={onPress} style={{
      background:C.surface,
      border:`1px solid ${C.border}`,
      borderLeft:accent?`2px solid var(--accent,#D8B56D)`:`1px solid ${C.border}`,
      borderRadius:12,padding:'14px 16px',
      display:'flex',flexDirection:'column',gap:6,
      cursor:onPress?'pointer':'default',
    }}>
      {meta&&<div style={{fontSize:11,color:'var(--accent,#D8B56D)',fontFamily:C.fontBody,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase'}}>{meta}</div>}
      {title&&<div style={{fontSize:16,color:C.text,fontFamily:C.fontDisplay,fontWeight:600,lineHeight:1.3}}>{title}</div>}
      {body&&<div style={{fontSize:13,color:C.muted,fontFamily:C.fontBody,lineHeight:1.65,fontWeight:300}}>{body}</div>}
    </div>
  );
}

// ── Page header ───────────────────────────────────────────
function PageHeader({eyebrow,title,subtitle}) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5,paddingBottom:4}}>
      {eyebrow&&<div style={{fontSize:11,color:'var(--accent,#D8B56D)',fontFamily:C.fontBody,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase'}}>{eyebrow}</div>}
      <div style={{fontSize:28,color:C.text,fontFamily:C.fontDisplay,fontWeight:600,lineHeight:1.15,letterSpacing:'-.01em'}}>{title}</div>
      {subtitle&&<div style={{fontSize:13,color:C.muted,fontFamily:C.fontBody,lineHeight:1.65,fontWeight:300}}>{subtitle}</div>}
    </div>
  );
}

// ── Reading card ──────────────────────────────────────────
function ReadingCard({reading,onPress}) {
  const label={daily:'Günlük',tarot:'Tarot',coffee:'Kahve',relationship:'İlişki'};
  return (
    <div onClick={onPress} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'13px 15px',display:'flex',flexDirection:'column',gap:5,cursor:'pointer'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:10,color:'var(--accent,#D8B56D)',fontFamily:C.fontBody,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase'}}>{label[reading.reading_type]||reading.reading_type}</div>
        <div style={{fontSize:10,color:C.faint,fontFamily:C.fontBody}}>{reading.created_at?.slice(0,10)}</div>
      </div>
      <div style={{fontSize:16,color:C.text,fontFamily:C.fontDisplay,fontWeight:600,lineHeight:1.2}}>{reading.title}</div>
      <div style={{fontSize:12,color:C.muted,fontFamily:C.fontBody,lineHeight:1.5,fontWeight:300}}>{reading.summary?.slice(0,75)}…</div>
    </div>
  );
}

// ── Bottom nav ────────────────────────────────────────────
function BottomNav({tab,setTab}) {
  const tabs=[
    {id:'home',label:'Ana',path:'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'},
    {id:'tarot',label:'Tarot',path:'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z'},
    {id:'coffee',label:'Kahve',path:'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3'},
    {id:'relationship',label:'İlişki',path:'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z'},
    {id:'profile',label:'Profil',path:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z'},
  ];
  return (
    <div style={{display:'flex',background:C.surfaceSoft,borderTop:`1px solid ${C.border}`,paddingBottom:28,paddingTop:8,flexShrink:0}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'4px 0'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={tab===t.id?'var(--accent,#D8B56D)':C.faint} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d={t.path}/>
          </svg>
          <span style={{fontSize:9,fontFamily:C.fontBody,fontWeight:500,color:tab===t.id?'var(--accent,#D8B56D)':C.faint}}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Scrollable screen wrapper ─────────────────────────────
function Scr({children,style={}}) {
  return (
    <div style={{flex:1,overflowY:'auto',overflowX:'hidden',display:'flex',flexDirection:'column',gap:12,padding:'72px 18px 24px',...style}}>
      {children}
    </div>
  );
}

// ── Back button ───────────────────────────────────────────
function BackBtn({onPress}) {
  return (
    <button onClick={onPress} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,padding:0,alignSelf:'flex-start'}}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#D8B56D)" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      <span style={{fontSize:13,color:'var(--accent,#D8B56D)',fontFamily:C.fontBody,fontWeight:600}}>Geri</span>
    </button>
  );
}

// ── Chip selector ─────────────────────────────────────────
function ChipGroup({options,value,onChange}) {
  return (
    <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
      {options.map(o=>(
        <button key={o.id} onClick={()=>onChange(o.id)} style={{
          padding:'8px 16px',borderRadius:20,
          border:`1px solid ${value===o.id?'var(--accent,#D8B56D)':C.border}`,
          background:value===o.id?'var(--accent-soft,#3B3220)':'transparent',
          color:value===o.id?C.text:C.muted,
          fontFamily:C.fontBody,fontSize:13,fontWeight:600,cursor:'pointer',transition:'all .15s',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

// ── Score bar ─────────────────────────────────────────────
function ScoreBar({label,value}) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <span style={{fontSize:12,color:C.muted,fontFamily:C.fontBody,fontWeight:500}}>{label}</span>
        <span style={{fontSize:12,color:'var(--accent,#D8B56D)',fontFamily:C.fontBody,fontWeight:700}}>{value}</span>
      </div>
      <div style={{height:3,borderRadius:2,background:C.border}}>
        <div style={{height:'100%',borderRadius:2,background:'var(--accent,#D8B56D)',width:`${value}%`,transition:'width .6s ease'}}/>
      </div>
    </div>
  );
}

Object.assign(window,{C,Stars,MirrorMark,TarotCardBack,Btn,Field,InsightCard,PageHeader,ReadingCard,BottomNav,Scr,BackBtn,ChipGroup,ScoreBar});
