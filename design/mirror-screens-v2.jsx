// Mirror AI v2 — Screens (Astro-inspired)

const { useState, useEffect, useRef } = React;

function AnimatedScreen2({ id, children, style={} }) {
  return (
    <div key={id} className="screen-anim" style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',...style}}>
      {children}
    </div>
  );
}

// ── Mock helpers ──────────────────────────────────────────
function nowIso() { return new Date().toISOString(); }
function uid(p) { return `${p}_${Date.now()}_${Math.random().toString(16).slice(2)}`; }

const MYSTIC_PROFILES = [
  {title:'Sezgisel Gözlemci', summary:'Belirsizliği okuma yeteneğin yüksek; ama çok katmanlı yorumlar zaman zaman seni yorabilir.', style:'sembolik', sign:'♊'},
  {title:'Duygusal Analist',  summary:'Duyguları hem hisseder hem incelersin. Yorumların içsel bir bütünlük arayışını yansıtır.',  style:'yansıtıcı', sign:'♋'},
  {title:'Döngü Kırıcı',     summary:'Tekrar eden kalıpları fark eder, değiştirmeye çalışırsın. Net ve eylem odaklı yorumlar alırsın.', style:'doğrudan', sign:'♈'},
];
function getMysticProfile(answers) {
  return MYSTIC_PROFILES[Object.values(answers).join('').length % 3];
}

const TAROT_CARDS = ['The Moon','Two of Cups','Justice','The Star','Queen of Swords','Six of Cups','The Hermit','Ace of Cups','The Lovers','Strength'];
const SPREAD_POSITIONS = {single:['message'],three_card:['past','present','possible_direction'],relationship:['you','other','dynamic'],decision:['situation','option_a','option_b']};
const POS_LABELS = {past:'Geçmiş',present:'Şimdi',possible_direction:'Yön',you:'Sen',other:'Karşı',dynamic:'Dinamik',message:'Mesaj',situation:'Durum',option_a:'Seçenek A',option_b:'Seçenek B'};

function makeTarotCards(spreadType) {
  return (SPREAD_POSITIONS[spreadType]||SPREAD_POSITIONS.three_card).map((pos,i)=>({
    position:pos, card:TAROT_CARDS[(Date.now()+i*7)%TAROT_CARDS.length], orientation:i%2===0?'upright':'reversed',
  }));
}
function makeReading({type,topic,question,profile,title,summary,sections,advice}) {
  return {
    id:uid(type), reading_type:type, topic, question, created_at:nowIso(),
    title, summary, tone:'reflective',
    sections: profile ? [{title:'Kişisel Bağlam',body:`${profile.title} profilin dikkate alındı.`},...sections] : sections,
    advice, reflection_question:'Bugün hangi küçük seçim sana daha fazla iç açıklığı verebilir?',
    explanation:{based_on:[profile?.title||'profil bilgileri','seçilen konu','AI motoru'],confidence:0.72},
    safety_note:'Bu yorum eğlence ve kişisel farkındalık amaçlıdır; kesin gelecek bilgisi değildir.',
    scores:type==='relationship'?{emotional_pull:72,communication_clarity:48,uncertainty_level:81,user_projection_risk:67}:null,
    cards:type==='tarot'?makeTarotCards(topic):null,
  };
}

// ── SPLASH ────────────────────────────────────────────────
function SplashScreen2({onDone}) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return (
    <div onClick={onDone} style={{
      position:'relative', height:'100%',
      background:`radial-gradient(ellipse at 50% 60%, #1A0D40 0%, #07050F 70%)`,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:0, cursor:'pointer', overflow:'hidden',
    }}>
      <StarField2/>
      <GlowOrb color="#5B3FD4" x="50%" y="45%" size={220} opacity={.25}/>
      <GlowOrb color="#C084FC" x="50%" y="55%" size={120} opacity={.15}/>
      <div style={{zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:20,animation:'fadeUpIn .9s ease'}}>
        <MirrorMark2 size={72}/>
        <div style={{textAlign:'center',display:'flex',flexDirection:'column',gap:8}}>
          <div style={{
            fontSize:48, color:'#EDE9F7', fontFamily:C2.fontDisplay, fontWeight:400, letterSpacing:'.05em',
            background:'linear-gradient(135deg, #C084FC 0%, #EDE9F7 50%, #D8B56D 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>Mirror AI</div>
          <div style={{fontSize:13,color:C2.muted,fontFamily:C2.fontBody,fontWeight:300,letterSpacing:'.15em',textTransform:'uppercase'}}>
            Kişisel Hafızalı İçgörü
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginTop:8}}>
          <div style={{width:24,height:1,background:'linear-gradient(90deg,transparent,#9B6EE8)'}}/>
          <div style={{fontSize:11,color:C2.faint,fontFamily:C2.fontBody,fontWeight:300,letterSpacing:'.08em'}}>dokunarak devam et</div>
          <div style={{width:24,height:1,background:'linear-gradient(90deg,#9B6EE8,transparent)'}}/>
        </div>
      </div>
    </div>
  );
}

// ── ONBOARDING WELCOME ────────────────────────────────────
function OnboardingWelcome2({onNext}) {
  return (
    <div style={{position:'relative',height:'100%',background:`radial-gradient(ellipse at 50% 20%, #1A0D40 0%, #07050F 60%)`,overflow:'hidden'}}>
      <StarField2/>
      <GlowOrb color="#5B3FD4" x="80%" y="15%" size={180} opacity={.2}/>
      <Scr2 style={{justifyContent:'space-between',height:'100%',boxSizing:'border-box'}}>
        <div style={{display:'flex',flexDirection:'column',gap:10,paddingTop:8,zIndex:1}}>
          <MirrorMark2 size={44}/>
          <div style={{height:4}}/>
          <div style={{fontSize:11,color:'#9B6EE8',fontFamily:C2.fontBody,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase'}}>
            Kişisel hafızalı içgörü
          </div>
          <div style={{
            fontSize:34, color:C2.text, fontFamily:C2.fontDisplay, fontWeight:600, lineHeight:1.1,
            background:'linear-gradient(135deg, #EDE9F7 60%, #C084FC 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>Seni hatırlayan spiritüel asistan</div>
          <div style={{fontSize:13,color:C2.muted,fontFamily:C2.fontBody,lineHeight:1.75,fontWeight:300}}>
            Tarot, kahve falı, ilişki analizi ve günlük içgörüleri kişisel profilinle yorumlayan sakin bir alan.
          </div>

          {/* Feature pills */}
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:4}}>
            {['✦ Natal Harita','☽ Ay Takvimi','♡ İlişki Analizi','☕ Kahve Falı'].map(f=>(
              <div key={f} style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${C2.border}`,background:C2.surfaceSoft,color:C2.muted,fontFamily:C2.fontBody,fontSize:11,fontWeight:500}}>
                {f}
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:10,zIndex:1}}>
          <FeatureCard type="daily" title="Kesin kehanet değil" body="Sembolik ve farkındalık amaçlı yorumlar — karar hakkı her zaman sende."/>
          <InsightCard2 title="İlk adım: mistik profil" body="Kısa bir doğum bilgisi ve davranış testiyle yorum stilini kişiselleştireceğiz."/>
          <div style={{height:4}}/>
          <Btn2 onPress={onNext}>Başla</Btn2>
          <Btn2 variant="secondary" onPress={onNext}>Zaten hesabım var</Btn2>
        </div>
      </Scr2>
    </div>
  );
}

// ── ONBOARDING BIRTH ──────────────────────────────────────
function OnboardingBirth2({onNext}) {
  const [date,setDate]=useState('1995-06-14');
  const [time,setTime]=useState('08:30');
  const [city,setCity]=useState('');
  return (
    <div style={{height:'100%',background:C2.bg,overflow:'hidden'}}>
      <Scr2>
        <PageHeader2 eyebrow="1 / 3 — Doğum bilgileri" title="Nerede ve ne zaman doğdun?"/>
        {/* Zodiac illustration placeholder */}
        <div style={{
          background:'linear-gradient(145deg,#080E20 0%,#142045 100%)',
          border:`1px solid ${C2.border}`, borderRadius:16,
          padding:'20px', display:'flex', alignItems:'center', justifyContent:'center',
          gap:16,
        }}>
          <div style={{fontSize:36, opacity:.7}}>♈♉♊♋♌♍</div>
        </div>
        <Field2 label="Doğum tarihi" value={date} onChange={setDate} type="date"/>
        <Field2 label="Doğum saati" value={time} onChange={setTime} type="time"/>
        <Field2 label="Doğum şehri" value={city} onChange={setCity} placeholder="İstanbul"/>
        <InsightCard2 body="Swiss Ephemeris ile natal haritanı hesaplayacağız: Güneş, Ay ve yükselen burçların sembolik yorumu yorumlara yansır." accent/>
        <Btn2 onPress={onNext} disabled={!city}>Devam et</Btn2>
      </Scr2>
    </div>
  );
}

// ── ONBOARDING QUIZ ───────────────────────────────────────
const QUIZ_Q = [
  {id:'uncertainty',title:'Net sinyal alamadığında genelde ne yaparsın?',options:[{id:'wait',label:'İçime kapanır, beklerim.'},{id:'clues',label:'Daha fazla ipucu ararım.'},{id:'direct',label:'Direkt sorarım.'},{id:'overthink',label:'Fazla düşünür, anlam yüklerim.'}]},
  {id:'pattern',title:'Geçmiş ilişkilerinde en çok hangi döngüyü tekrar ettin?',options:[{id:'unavailable',label:'Ulaşılması zor kişilere çekilmek'},{id:'fast_attach',label:'Çok hızlı bağlanmak'},{id:'cool_off',label:'İyi giderken soğumak'},{id:'limbo',label:'Belirsiz ilişkide uzun kalmak'}]},
  {id:'resonance',title:'Bir yorumun sana doğru gelmesi için ne gerekir?',options:[{id:'emotion',label:'Duygumu yakalaması'},{id:'concrete',label:'Somut olayla bağ kurması'},{id:'spiritual',label:'Spiritüel olarak anlamlı hissettirmesi'},{id:'logical',label:'Mantıklı ve tutarlı olması'}]},
];
function OnboardingQuiz2({onNext}) {
  const [answers,setAnswers]=useState({});
  const done = Object.keys(answers).length === QUIZ_Q.length;
  return (
    <div style={{height:'100%',background:C2.bg,overflow:'hidden'}}>
      <Scr2>
        <PageHeader2 eyebrow="2 / 3 — Profil testi" title="Yorumların seni nasıl okumalı?" subtitle="Bu test tanı koymaz; yorum stilini kişiselleştirir."/>
        {QUIZ_Q.map(q=>(
          <div key={q.id} style={{background:C2.surface,border:`1px solid ${C2.border}`,borderRadius:14,padding:'14px 15px',display:'flex',flexDirection:'column',gap:10}}>
            <div style={{fontSize:15,color:C2.text,fontFamily:C2.fontDisplay,fontWeight:600,lineHeight:1.3}}>{q.title}</div>
            {q.options.map(o=>{
              const active=answers[q.id]===o.id;
              return (
                <button key={o.id} onClick={()=>setAnswers(a=>({...a,[q.id]:o.id}))} style={{
                  textAlign:'left', padding:'10px 14px', borderRadius:10,
                  border:`1px solid ${active ? '#9B6EE8' : C2.border}`,
                  background: active ? 'rgba(155,110,232,.15)' : 'transparent',
                  color: active ? C2.text : C2.muted,
                  fontFamily:C2.fontBody, fontSize:13, lineHeight:1.5, cursor:'pointer', transition:'all .15s',
                }}>{o.label}</button>
              );
            })}
          </div>
        ))}
        <Btn2 onPress={()=>onNext(answers)} disabled={!done}>Mistik profilimi oluştur</Btn2>
      </Scr2>
    </div>
  );
}

// ── ONBOARDING RESULT ─────────────────────────────────────
function OnboardingResult2({profile, onDone}) {
  const [vis,setVis]=useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setVis(true),400); return()=>clearTimeout(t); },[]);
  return (
    <div style={{height:'100%',background:`radial-gradient(ellipse at 50% 50%, #1A0D40 0%, #07050F 70%)`,overflow:'hidden',position:'relative'}}>
      <StarField2/>
      <GlowOrb color="#5B3FD4" x="50%" y="50%" size={280} opacity={.22}/>
      <GlowOrb color="#C084FC" x="50%" y="50%" size={140} opacity={.18}/>
      <Scr2 style={{justifyContent:'center',alignItems:'center',textAlign:'center',gap:20}}>
        <div style={{
          opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(16px)',
          transition:'all .8s ease', display:'flex', flexDirection:'column', alignItems:'center', gap:22, zIndex:1,
        }}>
          <MirrorMark2 size={80}/>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{fontSize:11,color:'#9B6EE8',fontFamily:C2.fontBody,fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase'}}>3 / 3 — Mistik profil</div>
            <div style={{
              fontSize:38, color:C2.text, fontFamily:C2.fontDisplay, fontWeight:400, lineHeight:1.1,
              background:'linear-gradient(135deg, #C084FC 0%, #EDE9F7 60%, #D8B56D 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>{profile?.title}</div>
            <div style={{fontSize:32, opacity:.6}}>{profile?.sign}</div>
            <div style={{width:40,height:1,background:'linear-gradient(90deg,transparent,#9B6EE8,transparent)',margin:'4px auto'}}/>
            <div style={{fontSize:14,color:C2.muted,fontFamily:C2.fontBody,lineHeight:1.75,fontWeight:300,maxWidth:280}}>{profile?.summary}</div>
          </div>
          <FeatureCard type="daily" title="Yorum stili" body={`"${profile?.style}" — yorumlar bu çerçevede kişiselleştirilecek.`}/>
          <div style={{width:'100%'}}><Btn2 onPress={onDone}>Ana ekrana geç →</Btn2></div>
        </div>
      </Scr2>
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────
function HomeScreen2({profile, readings, onNewReading, onReadingPress, setTab, navigate}) {
  function createDaily() {
    const r = makeReading({
      type:'daily', topic:'love', question:'Bugün nelere dikkat etmeliyim?', profile,
      title:'Bugünün İç Aynası',
      summary:'Bugün sakin bir gözlem hali, tekrar eden düşüncelerin arkasındaki ihtiyacı daha görünür kılabilir.',
      sections:[
        {title:'Ana Tema',body:'Günün enerjisi hızlı karar vermekten çok hislerini isimlendirmeyi destekliyor.'},
        {title:'Dikkat Noktası',body:'Karşı tarafın sessizliğini tek bir anlama sabitlemek yerine, kendi ihtiyacını ayırmaya çalış.'},
        {title:'Küçük Ritüel',body:'Akşam üç cümle yaz: ne hissettim, neye ihtiyaç duydum, neyi abartmış olabilirim?'},
      ],
      advice:'Bugün cevap aramadan önce, sorunun sende hangi duyguyu uyandırdığını fark et.',
    });
    onNewReading(r);
    onReadingPress(r);
  }
  const today = new Date().toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'});
  const phases = ['new','waxing','full','waning'];
  const phase = phases[Math.floor(Date.now()/86400000/7)%4];
  const phaseNames = {new:'Yeni Ay',waxing:'Hilal',full:'Dolunay',waning:'Son Dördün'};

  return (
    <div style={{flex:1,overflowY:'auto',overflowX:'hidden',background:`linear-gradient(180deg, #0E0820 0%, ${C2.bg} 40%)`,position:'relative'}}>
      <GlowOrb color="#5B3FD4" x="80%" y="8%" size={200} opacity={.15}/>

      <div style={{display:'flex',flexDirection:'column',gap:10,padding:'72px 18px 24px'}}>
        {/* Header row */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <PageHeader2
            eyebrow={today}
            title="Bugün iç aynanda ne var?"
            gradient
          />
          <MirrorMark2 size={40}/>
        </div>

        {/* Moon + Energy row */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
          <div style={{
            background:'linear-gradient(145deg,#0D1525 0%,#1A2A50 100%)',
            border:`1px solid ${C2.border}`, borderRadius:16, padding:'14px',
            display:'flex', flexDirection:'column', alignItems:'center', gap:8,
          }}>
            <MoonPhase phase={phase} size={44}/>
            <div style={{fontSize:11, color:'#6EB0E8', fontFamily:C2.fontBody, fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase'}}>{phaseNames[phase]}</div>
            <div style={{fontSize:10, color:C2.faint, fontFamily:C2.fontBody}}>Kova · Hava</div>
          </div>
          <div style={{
            background:'linear-gradient(145deg,#120F2A 0%,#1E1550 100%)',
            border:`1px solid ${C2.border}`, borderRadius:16, padding:'14px',
            display:'flex', flexDirection:'column', alignItems:'center', gap:6, position:'relative',
          }}>
            <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <EnergyRing value={72} size={56} color="#9B6EE8"/>
              <div style={{position:'absolute',textAlign:'center'}}>
                <div style={{fontSize:14, color:C2.text, fontFamily:C2.fontBody, fontWeight:700, lineHeight:1}}>72</div>
              </div>
            </div>
            <div style={{fontSize:11, color:'#9B6EE8', fontFamily:C2.fontBody, fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase'}}>Enerji</div>
            <div style={{fontSize:10, color:C2.faint, fontFamily:C2.fontBody}}>Yüksek titreşim</div>
          </div>
        </div>

        {/* Daily insight card */}
        <FeatureCard type="daily" size="large"
          meta={profile?.title || 'Mistik profil'}
          title="Günlük enerji"
          body="Bugün netlik arayışı ile sezgisel hisleri ayırmak iyi gelebilir. Ay Kova'da iletişim akışı güçlü."
          onPress={createDaily}
        />
        <Btn2 onPress={createDaily}>Bugünkü içgörümü göster</Btn2>

        {/* Feature grid */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[
            {id:'tarot',     label:'Tarot',           icon:'🂠', pal:FEATURE_PALETTES.tarot},
            {id:'coffee',    label:'Kahve Falı',       icon:'☕', pal:FEATURE_PALETTES.coffee},
            {id:'relationship',label:'İlişki Analizi', icon:'♡', pal:FEATURE_PALETTES.relationship},
            {id:'profile',   label:'Natal Harita',     icon:'♄', pal:FEATURE_PALETTES.astrology},
          ].map(a=>(
            <button key={a.id} onClick={()=>setTab(a.id)} style={{
              minHeight:70, borderRadius:14,
              border:`1px solid ${C2.border}`,
              background: a.pal.bg,
              color:C2.text, fontFamily:C2.fontBody, fontSize:13, fontWeight:700,
              cursor:'pointer', display:'flex', flexDirection:'column',
              alignItems:'flex-start', justifyContent:'space-between',
              padding:'12px 14px', position:'relative', overflow:'hidden',
            }}>
              <div style={{position:'absolute',right:-10,top:-10,width:60,height:60,borderRadius:'50%',background:`radial-gradient(circle,${a.pal.glow}44 0%,transparent 70%)`,filter:'blur(10px)'}}/>
              <span style={{fontSize:20, opacity:.8}}>{a.icon}</span>
              <span style={{zIndex:1}}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Recent readings */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginTop:4}}>
          <div style={{fontSize:17,color:C2.text,fontFamily:C2.fontDisplay,fontWeight:600}}>Son yorumlar</div>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C2.borderGlow}66,transparent)`}}/>
        </div>
        {readings.length===0
          ? <InsightCard2 title="Henüz yorum yok" body="İlk günlük içgörünü oluşturduğunda geçmiş yorumların burada görünür." accent/>
          : readings.slice(0,4).map(r=><ReadingCard2 key={r.id} reading={r} onPress={()=>onReadingPress(r)}/>)
        }
      </div>
    </div>
  );
}

// ── TAROT ─────────────────────────────────────────────────
const SPREAD_OPTS = [{id:'single',label:'Tek kart'},{id:'three_card',label:'Üç kart'},{id:'relationship',label:'İlişki'},{id:'decision',label:'Karar'}];
function TarotScreen2({profile, onDone}) {
  const [spread,setSpread]=useState('three_card');
  const [question,setQuestion]=useState('');
  function generate() {
    const r = makeReading({
      type:'tarot', topic:spread, question, profile,
      title:'Tarot Aynası',
      summary:'Kartlar bu konuyu kesin sonuçtan çok görünmeyen duygu ve karar ekseni üzerinden okuyor.',
      sections:makeTarotCards(spread).map(c=>({title:`${POS_LABELS[c.position]||c.position}: ${c.card}`,body:`${c.orientation==='upright'?'Düz':'Ters'} gelen bu kart, sezgisel bir çağrı ve sınır koyma ihtiyacı olabileceğini gösteriyor.`})),
      advice:'Kartları bir hüküm gibi değil, kendine soracağın daha iyi sorular için bir ayna gibi kullan.',
    });
    onDone(r);
  }
  const cardCount = (SPREAD_POSITIONS[spread]||SPREAD_POSITIONS.three_card).length;
  return (
    <div style={{flex:1,overflowY:'auto',background:`linear-gradient(180deg,#11082A 0%,${C2.bg} 35%)`,position:'relative'}}>
      <GlowOrb color="#8B35D6" x="70%" y="12%" size={180} opacity={.18}/>
      <div style={{display:'flex',flexDirection:'column',gap:10,padding:'72px 18px 24px'}}>
        <PageHeader2 eyebrow="Tarot" title="Kartları hüküm değil ayna olarak aç" subtitle="Sembolik okuma — içe bakış daveti." gradient/>

        {/* Card spread visual */}
        <div style={{
          background:'linear-gradient(145deg,#110920 0%,#2A1650 100%)',
          border:`1px solid ${C2.border}`, borderRadius:16, padding:'20px',
          display:'flex', justifyContent:'center', alignItems:'center', gap:14,
          position:'relative', overflow:'hidden',
        }}>
          <GlowOrb color="#8B35D6" x="50%" y="50%" size={160} opacity={.2}/>
          {Array.from({length:cardCount}).map((_,i)=>(
            <div key={i} style={{
              transform:`rotate(${(i-(cardCount-1)/2)*8}deg)`,
              transition:'transform .3s',
              filter:'drop-shadow(0 8px 16px rgba(139,53,214,.4))',
              zIndex:i,
            }}>
              <TarotCardBack2 width={70} height={112}/>
            </div>
          ))}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <div style={{fontSize:11,color:C2.muted,fontFamily:C2.fontBody,fontWeight:600,letterSpacing:'.07em',textTransform:'uppercase'}}>Açılım tipi</div>
          <ChipGroup2 options={SPREAD_OPTS} value={spread} onChange={setSpread}/>
        </div>
        <Field2 label="Sorun" value={question} onChange={setQuestion} placeholder="Bu kişiyle devam etmeli miyim?" multiline/>
        <Btn2 onPress={generate} disabled={!question}>Kartları aç</Btn2>
      </div>
    </div>
  );
}

// ── COFFEE ────────────────────────────────────────────────
function CoffeeScreen2({profile, onDone}) {
  const [question,setQuestion]=useState('');
  const [context,setContext]=useState('');
  const [hasPhoto,setHasPhoto]=useState(false);
  function generate() {
    const r = makeReading({
      type:'coffee', topic:'love', question, profile,
      title:'Kahve Falı Yorumu',
      summary:'Fincanda yol, halka ve küçük bir açıklık teması öne çıkıyor; hareket, döngü ve netleşme ihtimalini sembolize eder.',
      sections:[
        {title:'Görülen Semboller',body:'Yol hareketi, halka tekrar eden bir temayı, açık alan ise netleşme ihtiyacını temsil eder.'},
        {title:'Yakın Dönem Mesajı',body:'Sembolik okuma, beklemekten çok sakin bir açıklıkla soru sormanın daha iyi hissettirebileceğini söylüyor.'},
      ],
      advice:'Kendini tek bir işarete bağlamak yerine, gördüğün sembolün sende uyandırdığı ihtiyacı takip et.',
    });
    onDone(r);
  }
  return (
    <div style={{flex:1,overflowY:'auto',background:`linear-gradient(180deg,#180C08 0%,${C2.bg} 35%)`,position:'relative'}}>
      <GlowOrb color="#B85A30" x="70%" y="8%" size={180} opacity={.15}/>
      <div style={{display:'flex',flexDirection:'column',gap:10,padding:'72px 18px 24px'}}>
        <PageHeader2 eyebrow="Kahve falı" title="Fincandaki sembolleri oku" gradient/>

        {/* Photo upload area */}
        <div style={{
          background:'linear-gradient(145deg,#180C08 0%,#3B1910 100%)',
          border:`1px dashed ${C2.border}`, borderRadius:16, padding:'24px 16px',
          display:'flex', flexDirection:'column', alignItems:'center', gap:14, position:'relative', overflow:'hidden',
        }}>
          <GlowOrb color="#B85A30" x="50%" y="50%" size={140} opacity={.18}/>
          {hasPhoto ? (
            <div style={{width:'100%',height:130,borderRadius:10,background:C2.surfaceSoft,display:'flex',alignItems:'center',justifyContent:'center',zIndex:1}}>
              <div style={{fontSize:13,color:C2.muted,fontFamily:C2.fontBody}}>Fotoğraf seçildi ✓</div>
            </div>
          ) : (
            <div style={{
              width:64,height:64,borderRadius:'50%',
              border:`1px solid ${C2.border}`,
              display:'flex',alignItems:'center',justifyContent:'center',
              background:'rgba(184,90,48,.1)', zIndex:1,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#E8A87C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          )}
          <Btn2 variant="secondary" small onPress={()=>setHasPhoto(true)}>{hasPhoto?'Fotoğrafı değiştir':'Fincan fotoğrafı seç'}</Btn2>
        </div>

        <Field2 label="Sorun" value={question} onChange={setQuestion} placeholder="Aklımdaki kişiyle aramızdaki enerji ne söylüyor?" multiline/>
        <Field2 label="Ek bağlam" value={context} onChange={setContext} placeholder="Son günlerde biraz uzaklaştı." multiline/>
        <Btn2 onPress={generate} disabled={!question} color="linear-gradient(135deg,#A84520,#E8A87C)">Analizi başlat</Btn2>
      </div>
    </div>
  );
}

// ── RELATIONSHIP ──────────────────────────────────────────
const REL_STATUS = [{id:'uzaklaştı',label:'Uzaklaştı'},{id:'yakın',label:'Yakın'},{id:'belirsiz',label:'Belirsiz'},{id:'bitti',label:'Bitti'}];
function RelationshipScreen2({profile, onDone}) {
  const [nickname,setNickname]=useState('');
  const [status,setStatus]=useState('belirsiz');
  const [question,setQuestion]=useState('');
  function generate() {
    const r = makeReading({
      type:'relationship', topic:'relationship', question, profile,
      title:'İlişki Enerji Analizi',
      summary:`${nickname||'Bu kişi'} ile dinamikte çekim kadar belirsizlik de görünür; bu yorum kesin niyet okumaz, sadece temaları ayırır.`,
      sections:[
        {title:'Duygusal Çekim',body:'Verilen bilgiler karşılıklı merak ihtimalini dışlamıyor, ama bunu kesin ilgi olarak yorumlamak sağlıklı olmaz.'},
        {title:'İletişim Netliği',body:`"${status}" durumu iletişimde netleşme ihtiyacını öne çıkarıyor.`},
        {title:'Riskli Patern',body:'Belirsizlik uzadığında zihnin boşlukları hızla doldurabilir; davranışa dayalı veriyle hisleri ayırmak önemli.'},
      ],
      advice:'Kararı tek bir yorumla verme; küçük, saygılı ve net bir iletişim denemesi daha güvenilir veri sağlayabilir.',
    });
    onDone(r);
  }
  return (
    <div style={{flex:1,overflowY:'auto',background:`linear-gradient(180deg,#180A12 0%,${C2.bg} 35%)`,position:'relative'}}>
      <GlowOrb color="#C4356A" x="70%" y="8%" size={180} opacity={.15}/>
      <div style={{display:'flex',flexDirection:'column',gap:10,padding:'72px 18px 24px'}}>
        <PageHeader2 eyebrow="İlişki enerjisi" title="Dinamiği yumuşak dille analiz et" subtitle="Çekim, netlik ve belirsizlik temalarını ayırır." gradient/>

        {/* Compatibility visual */}
        <div style={{
          background:'linear-gradient(145deg,#180A12 0%,#3B1428 100%)',
          border:`1px solid ${C2.border}`, borderRadius:16,
          padding:'20px', display:'flex', alignItems:'center', justifyContent:'center', gap:20,
          position:'relative', overflow:'hidden',
        }}>
          <GlowOrb color="#C4356A" x="50%" y="50%" size={140} opacity={.2}/>
          {[{s:'♊',c:'#9B6EE8'},{s:'♡',c:'#E07AA8'},{s:'♋',c:'#6EB0E8'}].map((z,i)=>(
            <div key={i} style={{fontSize:i===1?28:24,color:z.c,opacity:i===1?1:.7,zIndex:1}}>{z.s}</div>
          ))}
        </div>

        <Field2 label="Kişi adı / takma ad" value={nickname} onChange={setNickname} placeholder="A., Mavi Gözlü vs."/>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <div style={{fontSize:11,color:C2.muted,fontFamily:C2.fontBody,fontWeight:600,letterSpacing:'.07em',textTransform:'uppercase'}}>Son durum</div>
          <ChipGroup2 options={REL_STATUS} value={status} onChange={setStatus}/>
        </div>
        <Field2 label="Ana sorun" value={question} onChange={setQuestion} placeholder="Bu kişi bana karşı ne hissediyor olabilir?" multiline/>
        <Btn2 onPress={generate} disabled={!question} color="linear-gradient(135deg,#8B1A40,#E07AA8)">Analizi başlat</Btn2>
      </div>
    </div>
  );
}

// ── READING DETAIL ────────────────────────────────────────
function ReadingDetail2({reading, onBack, onFeedback}) {
  const [flipped,setFlipped]=useState({});
  const typeLabels = {daily:'Günlük',tarot:'Tarot',coffee:'Kahve Falı',relationship:'İlişki Analizi'};
  const palKey = reading.reading_type;
  const pal = FEATURE_PALETTES[palKey] || FEATURE_PALETTES.daily;
  const scoreColors = {emotional_pull:'#E07AA8',communication_clarity:'#6EB0E8',uncertainty_level:'#9B6EE8',user_projection_risk:'#E8A87C'};
  const scoreLabels = {emotional_pull:'Duygusal çekim',communication_clarity:'İletişim netliği',uncertainty_level:'Belirsizlik',user_projection_risk:'Projeksiyon riski'};
  return (
    <div style={{flex:1,overflowY:'auto',background:`linear-gradient(180deg,${pal.bg.includes('linear')?'#0E0820':pal.bg} 0%,${C2.bg} 30%)`,position:'relative'}}>
      <div style={{display:'flex',flexDirection:'column',gap:10,padding:'72px 18px 24px'}}>
        <BackBtn2 onPress={onBack}/>
        <PageHeader2 eyebrow={typeLabels[reading.reading_type]} title={reading.title} subtitle={reading.summary} gradient/>

        {reading.cards&&(
          <>
            <div style={{display:'flex',justifyContent:'center',gap:14,padding:'8px 0'}}>
              {reading.cards.map((card,i)=>(
                <div key={i} onClick={()=>setFlipped(f=>({...f,[i]:!f[i]}))} style={{cursor:'pointer',transition:'transform .35s',transform:flipped[i]?'rotateY(180deg)':'none'}}>
                  {flipped[i]
                    ? <div style={{width:72,height:114,borderRadius:10,background:`linear-gradient(145deg,#120F2A,#2D1B69)`,border:`1px solid #9B6EE8`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',padding:'8px 5px'}}>
                        <div style={{fontSize:8,color:'#C084FC',fontFamily:C2.fontBody,fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em'}}>{POS_LABELS[card.position]||card.position}</div>
                        <div style={{fontSize:10,color:C2.text,fontFamily:C2.fontDisplay,fontWeight:600,textAlign:'center',lineHeight:1.3}}>{card.card}</div>
                        <div style={{fontSize:8,color:C2.faint,fontFamily:C2.fontBody}}>{card.orientation==='upright'?'düz':'ters'}</div>
                      </div>
                    : <TarotCardBack2 width={72} height={114}/>
                  }
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:C2.faint,fontFamily:C2.fontBody,textAlign:'center'}}>Kartlara dokun — çevir</div>
          </>
        )}

        {reading.sections.map(s=><FeatureCard key={s.title} type={palKey} title={s.title} body={s.body}/>)}
        <InsightCard2 title="Öneri" body={reading.advice} accent/>
        <InsightCard2 title="Yansıma sorusu" body={reading.reflection_question}/>

        {reading.scores&&(
          <div style={{background:C2.surface,border:`1px solid ${C2.border}`,borderRadius:14,padding:'16px',display:'flex',flexDirection:'column',gap:12}}>
            <div style={{fontSize:16,color:C2.text,fontFamily:C2.fontDisplay,fontWeight:600}}>Enerji haritası</div>
            {Object.entries(reading.scores).map(([k,v])=>(
              <ScoreBar2 key={k} label={scoreLabels[k]||k} value={v} color={scoreColors[k]||'#9B6EE8'}/>
            ))}
          </div>
        )}

        <div style={{background:C2.surface,border:`1px solid ${C2.border}`,borderRadius:14,padding:'14px 16px',display:'flex',flexDirection:'column',gap:8}}>
          <div style={{fontSize:14,color:C2.text,fontFamily:C2.fontDisplay,fontWeight:600}}>Neye dayanıyor?</div>
          {reading.explanation.based_on.map(x=>(
            <div key={x} style={{fontSize:13,color:'#9B6EE8',fontFamily:C2.fontBody,fontWeight:500}}>— {x}</div>
          ))}
          <div style={{fontSize:12,color:C2.faint,fontFamily:C2.fontBody}}>Güven skoru: {Math.round(reading.explanation.confidence*100)}%</div>
        </div>

        <InsightCard2 title="Güvenlik notu" body={reading.safety_note}/>

        <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:4}}>
          <div style={{fontSize:16,color:C2.text,fontFamily:C2.fontDisplay,fontWeight:600}}>Bu yorum sana uydu mu?</div>
          <Btn2 onPress={()=>onFeedback('accurate')}>İsabetli</Btn2>
          <Btn2 variant="secondary" onPress={()=>onFeedback('partial')}>Kısmen</Btn2>
          <Btn2 variant="secondary" onPress={()=>onFeedback('inaccurate')}>İsabetsiz</Btn2>
        </div>
      </div>
    </div>
  );
}

// ── PROFILE ───────────────────────────────────────────────
function ProfileScreen2({profile, readings, feedbackCount, navigate}) {
  return (
    <div style={{flex:1,overflowY:'auto',background:`linear-gradient(180deg,#0A0E1A 0%,${C2.bg} 40%)`,position:'relative'}}>
      <GlowOrb color="#3B6B8A" x="50%" y="10%" size={200} opacity={.15}/>
      <div style={{display:'flex',flexDirection:'column',gap:10,padding:'72px 18px 24px'}}>
        {/* Avatar */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,paddingBottom:8}}>
          <div style={{
            width:80,height:80,borderRadius:'50%',
            background:'linear-gradient(135deg,#1A1535,#2D1B69)',
            border:`2px solid #9B6EE8`,
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 0 24px rgba(155,110,232,.35)',
          }}>
            <span style={{fontSize:32,color:'#C084FC',fontFamily:C2.fontDisplay,fontWeight:600}}>{profile?.sign||'☽'}</span>
          </div>
          <div style={{textAlign:'center',display:'flex',flexDirection:'column',gap:4}}>
            <div style={{
              fontSize:26,color:C2.text,fontFamily:C2.fontDisplay,fontWeight:600,
              background:'linear-gradient(135deg,#C084FC,#EDE9F7)',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
            }}>{profile?.title||'Mirror Profili'}</div>
            <div style={{fontSize:12,color:C2.muted,fontFamily:C2.fontBody,fontWeight:300,lineHeight:1.6,maxWidth:260}}>{profile?.summary||'Onboarding tamamlandığında profil özeti görünür.'}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
          {[{label:'Kredi',value:120,color:'#D8B56D'},{label:'Yorum',value:readings,color:'#9B6EE8'},{label:'Geri Bildirim',value:feedbackCount,color:'#5EC4C0'}].map(s=>(
            <div key={s.label} style={{
              background:`linear-gradient(145deg,${C2.surface},${C2.surfaceSoft})`,
              border:`1px solid ${C2.border}`,borderRadius:14,padding:'14px 10px',
              display:'flex',flexDirection:'column',gap:4,alignItems:'center',
            }}>
              <div style={{fontSize:24,color:s.color,fontFamily:C2.fontDisplay,fontWeight:600}}>{s.value}</div>
              <div style={{fontSize:9,color:C2.muted,fontFamily:C2.fontBody,textAlign:'center',letterSpacing:'.04em'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <FeatureCard type="astrology" title="Natal Haritam" body="Güneş İkizler · Ay Balık · Yükselen Aslan" meta="Astroloji" onPress={()=>navigate('natal-chart')}/>
        <FeatureCard type="profile" title="Hafıza olayları" body="Mirror'a kaydettiğin anlar yorumların bağlamını derinleştirir." onPress={()=>navigate('memory')}/>

        {/* Premium card */}
        <div style={{
          background:'linear-gradient(135deg,#1A1040 0%,#2D1B69 100%)',
          border:`1px solid #4B3999`,borderRadius:16,padding:'18px',
          display:'flex',flexDirection:'column',gap:10,
          boxShadow:'0 4px 24px rgba(155,110,232,.2)',
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:16,color:C2.text,fontFamily:C2.fontDisplay,fontWeight:600}}>Krediler</div>
              <div style={{fontSize:12,color:C2.muted,fontFamily:C2.fontBody,marginTop:2}}>Mevcut: 120 kredi</div>
            </div>
            <button onClick={()=>navigate('credits')} style={{
              padding:'8px 16px',borderRadius:10,border:'none',
              background:'linear-gradient(135deg,#7B45D6,#9B6EE8)',
              color:'#EDE9F7',fontFamily:C2.fontBody,fontSize:12,fontWeight:700,cursor:'pointer',
              boxShadow:'0 4px 12px rgba(155,110,232,.4)',
            }}>Satın al</button>
          </div>
          <div style={{height:3,borderRadius:2,background:`${C2.border}`}}>
            <div style={{width:'62%',height:'100%',borderRadius:2,background:'linear-gradient(90deg,#7B45D6,#C084FC)'}}/>
          </div>
          <div style={{fontSize:11,color:C2.muted,fontFamily:C2.fontBody}}>62 / 100 kredi kullanıldı</div>
        </div>

        <Btn2 variant="secondary" onPress={()=>{}}>Çıkış yap</Btn2>
      </div>
    </div>
  );
}

// ── NATAL CHART ───────────────────────────────────────────
function NatalChartScreen2({onBack}) {
  const CX=150,CY=150,R_OUT=138,R_SIGN=114,R_HOUSE=94,R_INNER=78;
  const SIGNS=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const SIGN_NAMES=['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];
  const ELEM_FILLS=['rgba(232,100,90,.15)','rgba(90,160,90,.12)','rgba(100,180,232,.12)','rgba(150,100,232,.15)','rgba(232,100,90,.15)','rgba(90,160,90,.12)','rgba(100,180,232,.12)','rgba(150,100,232,.15)','rgba(232,100,90,.15)','rgba(90,160,90,.12)','rgba(100,180,232,.12)','rgba(150,100,232,.15)'];
  const PLANETS=[
    {name:'Güneş',glyph:'☉',deg:83,color:'#E8C870'},
    {name:'Ay',glyph:'☽',deg:345,color:'#C8D4E8'},
    {name:'Yükselen',glyph:'AC',deg:130,color:'#C084FC'},
    {name:'Merkür',glyph:'☿',deg:70,color:'#9B6EE8'},
    {name:'Venüs',glyph:'♀',deg:148,color:'#E07AA8'},
    {name:'Mars',glyph:'♂',deg:100,color:'#E28484'},
  ];
  function polar(r,deg){const rad=(deg-90)*Math.PI/180;return{x:CX+r*Math.cos(rad),y:CY+r*Math.sin(rad)};}
  function seg(r1,r2,s,e){
    const a1=polar(r1,s),a2=polar(r2,s),b1=polar(r1,e),b2=polar(r2,e);
    const large=(e-s)>180?1:0;
    return `M${a1.x.toFixed(2)} ${a1.y.toFixed(2)} A${r1} ${r1} 0 ${large} 1 ${b1.x.toFixed(2)} ${b1.y.toFixed(2)} L${b2.x.toFixed(2)} ${b2.y.toFixed(2)} A${r2} ${r2} 0 ${large} 0 ${a2.x.toFixed(2)} ${a2.y.toFixed(2)} Z`;
  }
  return (
    <div style={{flex:1,overflowY:'auto',background:`linear-gradient(180deg,#080E20 0%,${C2.bg} 40%)`,position:'relative'}}>
      <GlowOrb color="#2B5FC4" x="50%" y="30%" size={220} opacity={.18}/>
      <div style={{display:'flex',flexDirection:'column',gap:10,padding:'72px 18px 24px'}}>
        <BackBtn2 onPress={onBack}/>
        <PageHeader2 eyebrow="Natal Harita" title="Doğum haritanın şiiri" subtitle="Swiss Ephemeris ile hesaplandı." gradient/>
        <div style={{display:'flex',justifyContent:'center',padding:'4px 0',position:'relative'}}>
          <div style={{position:'absolute',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(43,95,196,.15) 0%,transparent 70%)',filter:'blur(20px)'}}/>
          <svg width="300" height="300" viewBox="0 0 300 300">
            <defs>
              <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0D1525"/>
                <stop offset="100%" stopColor="#07050F"/>
              </radialGradient>
            </defs>
            <circle cx={CX} cy={CY} r={R_OUT} fill="url(#bgGrad)"/>
            {SIGNS.map((sign,i)=>{
              const s=i*30,e=s+30,mid=polar(R_SIGN+(R_OUT-R_SIGN)/2,s+15);
              return (
                <g key={i}>
                  <path d={seg(R_SIGN,R_OUT,s,e)} fill={ELEM_FILLS[i]} stroke="#241D42" strokeWidth=".7"/>
                  <text x={mid.x.toFixed(1)} y={(mid.y+4.5).toFixed(1)} textAnchor="middle" fontSize="13" fill="#9B6EE8" fontFamily="serif" opacity=".9">{sign}</text>
                </g>
              );
            })}
            {Array.from({length:12},(_,i)=>{
              const p1=polar(R_HOUSE,i*30),p2=polar(R_SIGN,i*30);
              return <line key={i} x1={p1.x.toFixed(1)} y1={p1.y.toFixed(1)} x2={p2.x.toFixed(1)} y2={p2.y.toFixed(1)} stroke="#241D42" strokeWidth=".6"/>;
            })}
            {Array.from({length:12},(_,i)=>{
              const m=polar((R_HOUSE+R_SIGN)/2,i*30+15);
              return <text key={i} x={m.x.toFixed(1)} y={(m.y+3).toFixed(1)} textAnchor="middle" fontSize="7.5" fill="#504875">{i+1}</text>;
            })}
            <circle cx={CX} cy={CY} r={R_HOUSE} fill="#0A0815" stroke="#241D42" strokeWidth=".7"/>
            <circle cx={CX} cy={CY} r={R_INNER} fill="#07050F" stroke="#241D42" strokeWidth=".5"/>
            {PLANETS.map((p,i)=>{
              const o=polar(R_INNER,p.deg);
              return <line key={i} x1={CX} y1={CY} x2={o.x.toFixed(1)} y2={o.y.toFixed(1)} stroke={p.color} strokeWidth=".8" opacity=".4"/>;
            })}
            {PLANETS.map((p,i)=>{
              const pt=polar(R_INNER-9,p.deg);
              return (
                <g key={i}>
                  <circle cx={pt.x.toFixed(1)} cy={pt.y.toFixed(1)} r="8" fill="#0E0B1E" stroke={p.color} strokeWidth="1.2"/>
                  <circle cx={pt.x.toFixed(1)} cy={pt.y.toFixed(1)} r="8" fill={p.color} fillOpacity=".08"/>
                  <text x={pt.x.toFixed(1)} y={(pt.y+3.5).toFixed(1)} textAnchor="middle" fontSize="7.5" fill={p.color} fontFamily="serif">{p.glyph}</text>
                </g>
              );
            })}
            <circle cx={CX} cy={CY} r="5" fill="#9B6EE8" opacity=".8"/>
            <circle cx={CX} cy={CY} r="5" fill="#C084FC" style={{filter:'blur(3px)'}} opacity=".6"/>
          </svg>
        </div>
        <div style={{background:`linear-gradient(145deg,#080E20,#142045)`,border:`1px solid ${C2.border}`,borderRadius:14,padding:'14px 16px',display:'flex',flexDirection:'column',gap:8}}>
          <div style={{fontSize:16,color:C2.text,fontFamily:C2.fontDisplay,fontWeight:600}}>Gezegen konumları</div>
          {PLANETS.map(p=>(
            <div key={p.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:7,borderBottom:`1px solid ${C2.border}`}}>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <div style={{width:28,height:28,borderRadius:8,background:`${p.color}18`,border:`1px solid ${p.color}44`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:13,color:p.color,fontFamily:'serif'}}>{p.glyph}</span>
                </div>
                <span style={{fontSize:13,color:C2.muted,fontFamily:C2.fontBody}}>{p.name}</span>
              </div>
              <span style={{fontSize:13,color:C2.text,fontFamily:C2.fontDisplay,fontWeight:600}}>{SIGN_NAMES[Math.floor((p.deg%360)/30)]}</span>
            </div>
          ))}
        </div>
        <FeatureCard type="astrology" title="Sembolik yorum" body="Güneş İkizler'de iletişim ve merak ana tema. Ay Balık'ta duygusal derinlik ve sezgi. Yükselen Aslan dış dünyaya güçlü görünme ihtiyacı yaratır."/>
      </div>
    </div>
  );
}

// ── MEMORY ────────────────────────────────────────────────
const MOCK_MEMORIES = [
  {id:1,date:'2024-12-10',text:'A. ile son görüşme — uzaklaştığını fark ettim ama ses çıkarmadım.',icon:'💫',color:'#9B6EE8'},
  {id:2,date:'2024-11-23',text:'Yine ulaşılması zor birine ilgi duyduğumu fark ettim.',icon:'🔄',color:'#E07AA8'},
  {id:3,date:'2024-10-05',text:'Kahve falı: "yol" sembolü o ay başladığım projeyi anlatıyordu.',icon:'☕',color:'#E8A87C'},
  {id:4,date:'2024-09-18',text:'Tekrarlayan kapı rüyası — karar noktasında hissediyorum.',icon:'🌙',color:'#6EB0E8'},
];
function MemoryScreen2({onBack}) {
  const [memories,setMemories]=useState(MOCK_MEMORIES);
  const [adding,setAdding]=useState(false);
  const [newText,setNewText]=useState('');
  function add(){
    if(!newText.trim())return;
    setMemories(m=>[{id:Date.now(),date:new Date().toISOString().slice(0,10),text:newText,icon:'✦',color:'#9B6EE8'},...m]);
    setNewText('');setAdding(false);
  }
  return (
    <div style={{flex:1,overflowY:'auto',background:C2.bg,position:'relative'}}>
      <GlowOrb color="#5B3FD4" x="80%" y="5%" size={160} opacity={.12}/>
      <div style={{display:'flex',flexDirection:'column',gap:10,padding:'72px 18px 24px'}}>
        <BackBtn2 onPress={onBack}/>
        <PageHeader2 eyebrow="Hafıza" title="Mirror seni hatırlıyor" subtitle="Kaydettiğin anlar yorumların bağlamını derinleştirir." gradient/>
        {adding
          ? <div style={{background:C2.surface,border:`1px solid ${C2.borderGlow}`,borderRadius:14,padding:'14px',display:'flex',flexDirection:'column',gap:10}}>
              <Field2 label="Yeni an" value={newText} onChange={setNewText} placeholder="Bugün ne fark ettin?" multiline/>
              <div style={{display:'flex',gap:8}}>
                <Btn2 onPress={add} small>Kaydet</Btn2>
                <Btn2 variant="secondary" onPress={()=>setAdding(false)} small>Vazgeç</Btn2>
              </div>
            </div>
          : <Btn2 onPress={()=>setAdding(true)}>+ Yeni an ekle</Btn2>
        }
        <div style={{display:'flex',flexDirection:'column',gap:0}}>
          {memories.map((m,i)=>(
            <div key={m.id} style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:0,flexShrink:0}}>
                <div style={{width:34,height:34,borderRadius:10,background:`${m.color}18`,border:`1px solid ${m.color}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>
                  {m.icon}
                </div>
                {i<memories.length-1&&<div style={{width:1,flex:1,minHeight:24,background:`linear-gradient(180deg,${m.color}44,transparent)`,opacity:.6}}/>}
              </div>
              <div style={{flex:1,paddingBottom:18}}>
                <div style={{fontSize:10,color:C2.faint,fontFamily:C2.fontBody,marginBottom:4}}>{m.date}</div>
                <div style={{fontSize:13,color:C2.muted,fontFamily:C2.fontBody,lineHeight:1.65,fontWeight:300}}>{m.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CREDITS ───────────────────────────────────────────────
const PKGS = [
  {id:'free',    label:'Başlangıç',     credits:20,  price:'Ücretsiz', desc:'İlk 20 kredi', color:'#5EC4C0'},
  {id:'mid',     label:'Ay Paketi',     credits:100, price:'₺89',      desc:'Aylık yenilenir', color:'#9B6EE8'},
  {id:'premium', label:'Yıllık Premium',credits:999, price:'₺399/yıl', desc:'Sınırsız + hafıza derinliği', color:'#D8B56D'},
];
function CreditsScreen2({onBack}) {
  const [sel,setSel]=useState('mid');
  return (
    <div style={{flex:1,overflowY:'auto',background:`linear-gradient(180deg,#120F2A 0%,${C2.bg} 40%)`,position:'relative'}}>
      <GlowOrb color="#5B3FD4" x="50%" y="15%" size={200} opacity={.2}/>
      <div style={{display:'flex',flexDirection:'column',gap:10,padding:'72px 18px 24px'}}>
        <BackBtn2 onPress={onBack}/>
        <PageHeader2 eyebrow="Krediler" title="Yorumlar için yakıt" subtitle="Her yorum 1 kredi kullanır." gradient/>

        {/* Current credits */}
        <div style={{
          background:'linear-gradient(135deg,#1A1040,#2D1B69)',
          border:`1px solid #4B3999`,borderRadius:18,padding:'22px 20px',
          display:'flex',alignItems:'center',gap:18,
          boxShadow:'0 8px 32px rgba(155,110,232,.25)',
          position:'relative',overflow:'hidden',
        }}>
          <GlowOrb color="#5B3FD4" x="80%" y="50%" size={120} opacity={.25}/>
          <div style={{position:'relative'}}>
            <EnergyRing value={62} size={70} color="#9B6EE8"/>
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center'}}>
              <div style={{fontSize:18,color:C2.text,fontFamily:C2.fontBody,fontWeight:700,lineHeight:1}}>120</div>
            </div>
          </div>
          <div style={{zIndex:1}}>
            <div style={{fontSize:18,color:C2.text,fontFamily:C2.fontDisplay,fontWeight:600}}>Mevcut kredi</div>
            <div style={{fontSize:12,color:C2.muted,fontFamily:C2.fontBody}}>Son yenileme: bugün</div>
          </div>
        </div>

        {PKGS.map(pkg=>(
          <div key={pkg.id} onClick={()=>setSel(pkg.id)} style={{
            background: sel===pkg.id ? `linear-gradient(145deg,#1A1040,#2D1B69)` : C2.surface,
            border:`1px solid ${sel===pkg.id ? pkg.color : C2.border}`,
            borderRadius:14, padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center',
            cursor:'pointer', transition:'all .15s',
            boxShadow: sel===pkg.id ? `0 4px 20px ${pkg.color}33` : 'none',
          }}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:`${pkg.color}18`,border:`1px solid ${pkg.color}44`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{width:12,height:12,borderRadius:'50%',background:pkg.color,boxShadow:`0 0 8px ${pkg.color}`}}/>
              </div>
              <div>
                <div style={{fontSize:15,color:C2.text,fontFamily:C2.fontDisplay,fontWeight:600}}>{pkg.label}</div>
                <div style={{fontSize:12,color:C2.muted,fontFamily:C2.fontBody,marginTop:2}}>{pkg.desc}</div>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:15,color:sel===pkg.id?pkg.color:C2.text,fontFamily:C2.fontBody,fontWeight:700}}>{pkg.price}</div>
              <div style={{fontSize:11,color:C2.faint,fontFamily:C2.fontBody}}>{pkg.credits===999?'sınırsız':`${pkg.credits} kredi`}</div>
            </div>
          </div>
        ))}
        <Btn2>Satın al</Btn2>
        <div style={{fontSize:11,color:C2.faint,fontFamily:C2.fontBody,textAlign:'center',lineHeight:1.6}}>
          Abonelik istediğinde iptal edilebilir. Tüm içerikler eğlence amaçlıdır.
        </div>
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────
function MirrorApp2() {
  const [screen,setScreen]=useState('splash');
  const [tab,setTab]=useState('home');
  const [mysticProfile,setMysticProfile]=useState(null);
  const [readings,setReadings]=useState([]);
  const [activeReading,setActiveReading]=useState(null);
  const [feedbackCount,setFeedbackCount]=useState(0);
  const [screenKey,setScreenKey]=useState(0);

  function navigate(newScreen,newTab){
    if(newTab) setTab(newTab);
    setScreen(newScreen);
    setScreenKey(k=>k+1);
  }

  useEffect(()=>{
    window.__mirrorSetScreen=(s)=>{
      if(s==='tabs') navigate('tabs','home');
      else if(s==='onboarding-welcome') navigate('onboarding-welcome');
      else navigate(s);
    };
  },[]);

  function addReading(r){setReadings(p=>[r,...p]);}
  function openReading(r){setActiveReading(r);navigate('reading-detail');}

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',background:C2.bg,overflow:'hidden'}}>
      {screen==='splash'&&<AnimatedScreen2 id={`s-${screenKey}`}><SplashScreen2 onDone={()=>navigate('onboarding-welcome')}/></AnimatedScreen2>}
      {screen==='onboarding-welcome'&&<AnimatedScreen2 id={`ow-${screenKey}`}><OnboardingWelcome2 onNext={()=>navigate('onboarding-birth')}/></AnimatedScreen2>}
      {screen==='onboarding-birth'&&<AnimatedScreen2 id={`ob-${screenKey}`}><OnboardingBirth2 onNext={()=>navigate('onboarding-quiz')}/></AnimatedScreen2>}
      {screen==='onboarding-quiz'&&<AnimatedScreen2 id={`oq-${screenKey}`}><OnboardingQuiz2 onNext={ans=>{setMysticProfile(getMysticProfile(ans));navigate('onboarding-result');}}/></AnimatedScreen2>}
      {screen==='onboarding-result'&&<AnimatedScreen2 id={`or-${screenKey}`}><OnboardingResult2 profile={mysticProfile} onDone={()=>navigate('tabs','home')}/></AnimatedScreen2>}
      {screen==='reading-detail'&&activeReading&&<AnimatedScreen2 id={`rd-${screenKey}`}><ReadingDetail2 reading={activeReading} onBack={()=>navigate('tabs')} onFeedback={()=>{setFeedbackCount(c=>c+1);navigate('tabs');}}/></AnimatedScreen2>}
      {screen==='natal-chart'&&<AnimatedScreen2 id={`nc-${screenKey}`}><NatalChartScreen2 onBack={()=>navigate('tabs','profile')}/></AnimatedScreen2>}
      {screen==='memory'&&<AnimatedScreen2 id={`mem-${screenKey}`}><MemoryScreen2 onBack={()=>navigate('tabs','profile')}/></AnimatedScreen2>}
      {screen==='credits'&&<AnimatedScreen2 id={`cr-${screenKey}`}><CreditsScreen2 onBack={()=>navigate('tabs','profile')}/></AnimatedScreen2>}
      {screen==='tabs'&&(
        <AnimatedScreen2 id={`tabs-${tab}-${screenKey}`}>
          <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
            {tab==='home'&&<HomeScreen2 profile={mysticProfile} readings={readings} onNewReading={addReading} onReadingPress={openReading} setTab={t=>navigate('tabs',t)} navigate={navigate}/>}
            {tab==='tarot'&&<TarotScreen2 profile={mysticProfile} onDone={r=>{addReading(r);openReading(r);}}/>}
            {tab==='coffee'&&<CoffeeScreen2 profile={mysticProfile} onDone={r=>{addReading(r);openReading(r);}}/>}
            {tab==='relationship'&&<RelationshipScreen2 profile={mysticProfile} onDone={r=>{addReading(r);openReading(r);}}/>}
            {tab==='profile'&&<ProfileScreen2 profile={mysticProfile} readings={readings.length} feedbackCount={feedbackCount} navigate={navigate}/>}
            <BottomNav2 tab={tab} setTab={t=>navigate('tabs',t)}/>
          </div>
        </AnimatedScreen2>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MirrorApp2/>);
