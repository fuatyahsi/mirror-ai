// Mirror AI — screens v2
// New: AnimatedScreen, NatalChartScreen, MemoryScreen, CreditsScreen
// Updated: window.__mirrorSetScreen, screen key transitions

const { useState, useEffect, useRef } = React;

// ── Animated screen wrapper ───────────────────────────────
function AnimatedScreen({ id, children, style={} }) {
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
  {title:'Sezgisel Gözlemci',summary:'Belirsizliği okuma yeteneğin yüksek; ama çok katmanlı yorumlar zaman zaman seni yorabilir.',style:'sembolik'},
  {title:'Duygusal Analist',summary:'Duyguları hem hisseder hem incelersin. Yorumların içsel bir bütünlük arayışını yansıtır.',style:'yansıtıcı'},
  {title:'Döngü Kırıcı',summary:'Tekrar eden kalıpları fark eder, değiştirmeye çalışırsın. Yorumların net ve eylem odaklı olsun.',style:'doğrudan'},
];
function getMysticProfile(answers) {
  const idx=Object.values(answers).join('').length%3;
  return MYSTIC_PROFILES[idx];
}
function makeReading({type,topic,question,profile,title,summary,sections,advice}) {
  return {
    id:uid(type),reading_type:type,topic,question,created_at:nowIso(),
    title,summary,tone:'reflective',
    sections:profile?[{title:'Kişisel Bağlam',body:`${profile.title} profilin dikkate alındı. Yorum "${profile.style}" stiliyle kişiselleştirildi.`},...sections]:sections,
    advice,reflection_question:'Bugün hangi küçük seçim sana daha fazla iç açıklığı verebilir?',
    explanation:{based_on:[profile?.title||'profil bilgileri','seçilen konu','mock AI motoru'],confidence:0.72},
    safety_note:'Bu yorum eğlence ve kişisel farkındalık amaçlıdır; kesin gelecek bilgisi değildir.',
    scores:type==='relationship'?{emotional_pull:72,communication_clarity:48,uncertainty_level:81,user_projection_risk:67}:null,
    cards:type==='tarot'?makeTarotCards(topic):null,
  };
}
const TAROT_CARDS=['The Moon','Two of Cups','Justice','The Star','Queen of Swords','Six of Cups','The Hermit','Ace of Cups','The Lovers','Strength'];
const SPREAD_POSITIONS={single:['message'],three_card:['past','present','possible_direction'],relationship:['you','other','dynamic'],decision:['situation','option_a','option_b']};
const POS_LABELS={past:'Geçmiş',present:'Şimdi',possible_direction:'Yön',you:'Sen',other:'Karşı',dynamic:'Dinamik',message:'Mesaj',situation:'Durum',option_a:'Seçenek A',option_b:'Seçenek B'};
function makeTarotCards(spreadType) {
  return (SPREAD_POSITIONS[spreadType]||SPREAD_POSITIONS.three_card).map((pos,i)=>({
    position:pos,card:TAROT_CARDS[(Date.now()+i*7)%TAROT_CARDS.length],
    orientation:i%2===0?'upright':'reversed',
  }));
}

// ── Screen: Splash ────────────────────────────────────────
function SplashScreen({onDone}) {
  useEffect(()=>{const t=setTimeout(onDone,2600);return()=>clearTimeout(t);},[]);
  return (
    <div onClick={onDone} style={{position:'relative',height:'100%',background:C.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:20,cursor:'pointer',overflow:'hidden'}}>
      <Stars/>
      <div style={{zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:18,animation:'fadeUpIn .8s ease'}}>
        <MirrorMark size={64}/>
        <div style={{textAlign:'center',display:'flex',flexDirection:'column',gap:8}}>
          <div style={{fontSize:42,color:C.text,fontFamily:C.fontDisplay,fontWeight:400,letterSpacing:'.04em'}}>Mirror AI</div>
          <div style={{fontSize:14,color:C.muted,fontFamily:C.fontBody,fontWeight:300,letterSpacing:'.12em',textTransform:'uppercase'}}>Kişisel Hafızalı İçgörü</div>
        </div>
        <div style={{width:32,height:1,background:'var(--accent,#D8B56D)',opacity:.6}}/>
        <div style={{fontSize:12,color:C.faint,fontFamily:C.fontBody,fontWeight:300}}>dokunarak devam et</div>
      </div>
    </div>
  );
}

// ── Screen: Onboarding Welcome ────────────────────────────
function OnboardingWelcome({onNext}) {
  return (
    <div style={{position:'relative',height:'100%',background:C.bg,overflow:'hidden'}}>
      <Stars/>
      <Scr style={{justifyContent:'space-between',height:'100%',boxSizing:'border-box'}}>
        <div style={{display:'flex',flexDirection:'column',gap:6,paddingTop:8}}>
          <MirrorMark size={44}/>
          <div style={{height:8}}/>
          <div style={{fontSize:11,color:'var(--accent,#D8B56D)',fontFamily:C.fontBody,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase'}}>Kişisel hafızalı içgörü</div>
          <div style={{fontSize:34,color:C.text,fontFamily:C.fontDisplay,fontWeight:600,lineHeight:1.1}}>Seni hatırlayan spiritüel asistan</div>
          <div style={{fontSize:13,color:C.muted,fontFamily:C.fontBody,lineHeight:1.7,fontWeight:300}}>Tarot, kahve falı, ilişki analizi ve günlük içgörüleri kişisel profilinle birlikte yorumlayan sakin bir alan.</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <InsightCard title="Kesin kehanet değil" body="Sembolik ve farkındalık amaçlı yorumlar — karar hakkı her zaman sende." accent/>
          <InsightCard title="İlk adım: mistik profil" body="Kısa bir doğum bilgisi ve davranış testiyle yorum stilini kişiselleştireceğiz."/>
          <div style={{height:4}}/>
          <Btn onPress={onNext}>Başla</Btn>
          <Btn variant="secondary" onPress={onNext}>Zaten hesabım var</Btn>
        </div>
      </Scr>
    </div>
  );
}

// ── Screen: Birth Info ────────────────────────────────────
function OnboardingBirth({onNext}) {
  const [date,setDate]=useState('1995-06-14');
  const [time,setTime]=useState('08:30');
  const [city,setCity]=useState('');
  return (
    <div style={{height:'100%',background:C.bg,overflow:'hidden'}}>
      <Scr>
        <PageHeader eyebrow="1 / 3 — Doğum bilgileri" title="Nerede ve ne zaman doğdun?" subtitle="Bu bilgiler natal harita hesabı için kullanılır. Sadece senin için saklanır."/>
        <Field label="Doğum tarihi" value={date} onChange={setDate} type="date"/>
        <Field label="Doğum saati" value={time} onChange={setTime} type="time"/>
        <Field label="Doğum şehri" value={city} onChange={setCity} placeholder="İstanbul"/>
        <InsightCard body="Swiss Ephemeris ile natal haritanı hesaplayacağız: Güneş, Ay ve yükselen burçların sembolik yorumu yorumlara yansır."/>
        <Btn onPress={onNext} disabled={!city}>Devam et</Btn>
      </Scr>
    </div>
  );
}

// ── Screen: Profile Quiz ──────────────────────────────────
const QUIZ_Q=[
  {id:'uncertainty',title:'Net sinyal alamadığında genelde ne yaparsın?',options:[{id:'wait',label:'İçime kapanır, beklerim.'},{id:'clues',label:'Daha fazla ipucu ararım.'},{id:'direct',label:'Direkt sorarım.'},{id:'overthink',label:'Fazla düşünür, anlam yüklerim.'}]},
  {id:'pattern',title:'Geçmiş ilişkilerinde en çok hangi döngüyü tekrar ettin?',options:[{id:'unavailable',label:'Ulaşılması zor kişilere çekilmek'},{id:'fast_attach',label:'Çok hızlı bağlanmak'},{id:'cool_off',label:'İyi giderken soğumak'},{id:'limbo',label:'Belirsiz ilişkide uzun kalmak'}]},
  {id:'resonance',title:'Bir yorumun sana doğru gelmesi için ne gerekir?',options:[{id:'emotion',label:'Duygumu yakalaması'},{id:'concrete',label:'Somut olayla bağ kurması'},{id:'spiritual',label:'Spiritüel olarak anlamlı hissettirmesi'},{id:'logical',label:'Mantıklı ve tutarlı olması'}]},
];
function OnboardingQuiz({onNext}) {
  const [answers,setAnswers]=useState({});
  const done=Object.keys(answers).length===QUIZ_Q.length;
  return (
    <div style={{height:'100%',background:C.bg,overflow:'hidden'}}>
      <Scr>
        <PageHeader eyebrow="2 / 3 — Profil testi" title="Yorumların seni nasıl okumalı?" subtitle="Bu test tanı koymaz; sembolik yorum stilini ve belirsizlikle ilişki kurma biçimini ayarlar."/>
        {QUIZ_Q.map(q=>(
          <div key={q.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 15px',display:'flex',flexDirection:'column',gap:10}}>
            <div style={{fontSize:15,color:C.text,fontFamily:C.fontDisplay,fontWeight:600,lineHeight:1.3}}>{q.title}</div>
            {q.options.map(o=>{
              const active=answers[q.id]===o.id;
              return (
                <button key={o.id} onClick={()=>setAnswers(a=>({...a,[q.id]:o.id}))} style={{
                  textAlign:'left',padding:'10px 14px',borderRadius:8,
                  border:`1px solid ${active?'var(--accent,#D8B56D)':C.border}`,
                  background:active?'var(--accent-soft,#3B3220)':'transparent',
                  color:active?C.text:C.muted,
                  fontFamily:C.fontBody,fontSize:13,lineHeight:1.5,cursor:'pointer',transition:'all .15s',
                }}>{o.label}</button>
              );
            })}
          </div>
        ))}
        <Btn onPress={()=>onNext(answers)} disabled={!done}>Mistik profilimi oluştur</Btn>
      </Scr>
    </div>
  );
}

// ── Screen: Onboarding Result ─────────────────────────────
function OnboardingResult({profile,onDone}) {
  const [vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),400);return()=>clearTimeout(t);},[]);
  return (
    <div style={{height:'100%',background:C.bg,overflow:'hidden',position:'relative'}}>
      <Stars/>
      <Scr style={{justifyContent:'center',alignItems:'center',textAlign:'center',gap:20}}>
        <div style={{opacity:vis?1:0,transform:vis?'translateY(0)':'translateY(12px)',transition:'all .7s ease',display:'flex',flexDirection:'column',alignItems:'center',gap:20}}>
          <MirrorMark size={72}/>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{fontSize:12,color:'var(--accent,#D8B56D)',fontFamily:C.fontBody,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase'}}>3 / 3 — Mistik profil</div>
            <div style={{fontSize:36,color:C.text,fontFamily:C.fontDisplay,fontWeight:400,lineHeight:1.1}}>{profile?.title}</div>
            <div style={{width:40,height:1,background:'var(--accent,#D8B56D)',opacity:.6,margin:'4px auto'}}/>
            <div style={{fontSize:14,color:C.muted,fontFamily:C.fontBody,lineHeight:1.7,fontWeight:300,maxWidth:280}}>{profile?.summary}</div>
          </div>
          <InsightCard title="Yorum stili" body={`"${profile?.style}" — yorumlar bu çerçevede kişiselleştirilecek.`} accent/>
          <div style={{width:'100%'}}><Btn onPress={onDone}>Ana ekrana geç →</Btn></div>
        </div>
      </Scr>
    </div>
  );
}

// ── Screen: Home ──────────────────────────────────────────
function HomeScreen({profile,readings,onNewReading,onReadingPress,setTab,navigate}) {
  function createDaily() {
    const r=makeReading({
      type:'daily',topic:'love',question:'Bugün nelere dikkat etmeliyim?',profile,
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
  const today=new Date().toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'});
  return (
    <Scr>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <PageHeader eyebrow="Mirror AI" title="Bugün iç aynanda ne var?"/>
        <div style={{fontSize:22,color:'var(--accent,#D8B56D)',fontFamily:C.fontDisplay,opacity:.7,flexShrink:0,paddingTop:6}}>☽</div>
      </div>
      <div style={{fontSize:12,color:C.faint,fontFamily:C.fontBody,marginTop:-8}}>{today}</div>
      <InsightCard meta={profile?.title||'Mistik profil'} title="Günlük enerji" body="Bugün netlik arayışı ile sezgisel hisleri ayırmak iyi gelebilir." accent/>
      <Btn onPress={createDaily}>Bugünkü içgörümü göster</Btn>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[{id:'tarot',label:'Tarot'},{id:'coffee',label:'Kahve falı'},{id:'relationship',label:'İlişki analizi'},{id:'profile',label:'Profilim'}].map(a=>(
          <button key={a.id} onClick={()=>setTab(a.id)} style={{minHeight:52,borderRadius:10,border:`1px solid ${C.border}`,background:C.surface,color:C.text,fontFamily:C.fontBody,fontSize:14,fontWeight:700,cursor:'pointer'}}>{a.label}</button>
        ))}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{fontSize:17,color:C.text,fontFamily:C.fontDisplay,fontWeight:600}}>Son yorumlar</div>
        <div style={{flex:1,height:1,background:C.border,opacity:.5}}/>
      </div>
      {readings.length===0
        ? <InsightCard title="Henüz yorum yok" body="İlk günlük içgörünü oluşturduğunda geçmiş yorumların burada görünür."/>
        : readings.slice(0,4).map(r=><ReadingCard key={r.id} reading={r} onPress={()=>onReadingPress(r)}/>)
      }
    </Scr>
  );
}

// ── Screen: Tarot ─────────────────────────────────────────
const SPREAD_OPTS=[{id:'single',label:'Tek kart'},{id:'three_card',label:'Üç kart'},{id:'relationship',label:'İlişki'},{id:'decision',label:'Karar'}];
function TarotScreen({profile,onDone}) {
  const [spread,setSpread]=useState('three_card');
  const [topic,setTopic]=useState('relationship');
  const [question,setQuestion]=useState('');
  function generate() {
    const r=makeReading({
      type:'tarot',topic,question,profile,
      title:'Tarot Aynası',
      summary:'Kartlar bu konuyu kesin sonuçtan çok görünmeyen duygu ve karar ekseni üzerinden okuyor.',
      sections:makeTarotCards(spread).map(c=>({title:`${POS_LABELS[c.position]||c.position}: ${c.card}`,body:`${c.orientation==='upright'?'Düz':'Ters'} gelen bu kart, sorunun içinde sezgisel bir çağrı ve sınır koyma ihtiyacı olabileceğini gösteriyor.`})),
      advice:'Kartları bir hüküm gibi değil, kendine soracağın daha iyi sorular için bir ayna gibi kullan.',
    });
    onDone(r);
  }
  return (
    <Scr>
      <PageHeader eyebrow="Tarot" title="Kartları hüküm değil ayna olarak aç" subtitle="Sembolik okuma — kartlar bir yön değil, içe bakış daveti sunar."/>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        <div style={{fontSize:11,color:C.muted,fontFamily:C.fontBody,fontWeight:600,letterSpacing:'.07em',textTransform:'uppercase'}}>Açılım tipi</div>
        <ChipGroup options={SPREAD_OPTS} value={spread} onChange={setSpread}/>
      </div>
      <div style={{display:'flex',justifyContent:'center',gap:12,padding:'8px 0'}}>
        {(SPREAD_POSITIONS[spread]||SPREAD_POSITIONS.three_card).map((_,i)=>(
          <TarotCardBack key={i} width={72} height={114}/>
        ))}
      </div>
      <Field label="Konu" value={topic} onChange={setTopic} placeholder="ilişki, kariyer, aile"/>
      <Field label="Sorun" value={question} onChange={setQuestion} placeholder="Bu kişiyle devam etmeli miyim?" multiline/>
      <Btn onPress={generate} disabled={!question}>Kartları aç</Btn>
    </Scr>
  );
}

// ── Screen: Coffee ────────────────────────────────────────
function CoffeeScreen({profile,onDone}) {
  const [topic,setTopic]=useState('love');
  const [question,setQuestion]=useState('');
  const [context,setContext]=useState('');
  const [hasPhoto,setHasPhoto]=useState(false);
  function generate() {
    const r=makeReading({
      type:'coffee',topic,question,profile,
      title:'Kahve Falı Yorumu',
      summary:'Fincanda yol, halka ve küçük bir açıklık teması öne çıkıyor; hareket, döngü ve netleşme ihtimalini sembolize eder.',
      sections:[
        {title:'Görülen Semboller',body:'Yol hareketi, halka tekrar eden bir temayı, açık alan ise netleşme ihtiyacını temsil eder.'},
        {title:'Kişisel Bağlam',body:context?`"${context}" teması dikkate alındı.`:'Ek bağlam verilmediği için yorum genel profil üzerinden tutuldu.'},
        {title:'Yakın Dönem Mesajı',body:'Sembolik okuma, beklemekten çok sakin bir açıklıkla soru sormanın daha iyi hissettirebileceğini söylüyor.'},
      ],
      advice:'Kendini tek bir işarete bağlamak yerine, gördüğün sembolün sende uyandırdığı ihtiyacı takip et.',
    });
    onDone(r);
  }
  return (
    <Scr>
      <PageHeader eyebrow="Kahve falı" title="Fincandaki sembolleri kişisel bağlamla oku"/>
      <div style={{background:C.surface,border:`1px dashed ${C.border}`,borderRadius:12,padding:'20px 16px',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
        {hasPhoto
          ? <div style={{width:'100%',height:140,borderRadius:8,background:C.surfaceSoft,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{fontSize:12,color:C.muted,fontFamily:C.fontBody}}>Fotoğraf seçildi ✓</div>
            </div>
          : <div style={{width:56,height:56,borderRadius:'50%',border:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
        }
        <Btn variant="secondary" small onPress={()=>setHasPhoto(true)}>{hasPhoto?'Fotoğrafı değiştir':'Fincan fotoğrafı seç'}</Btn>
      </div>
      <Field label="Konu" value={topic} onChange={setTopic} placeholder="love, career, family"/>
      <Field label="Sorun" value={question} onChange={setQuestion} placeholder="Aklımdaki kişiyle aramızdaki enerji ne söylüyor?" multiline/>
      <Field label="Ek bağlam" value={context} onChange={setContext} placeholder="Son günlerde biraz uzaklaştı." multiline/>
      <Btn onPress={generate} disabled={!question}>Analizi başlat</Btn>
    </Scr>
  );
}

// ── Screen: Relationship ──────────────────────────────────
const REL_STATUS=[{id:'uzaklaştı',label:'Uzaklaştı'},{id:'yakın',label:'Yakın'},{id:'belirsiz',label:'Belirsiz'},{id:'bitti',label:'Bitti'}];
function RelationshipScreen({profile,onDone}) {
  const [nickname,setNickname]=useState('');
  const [status,setStatus]=useState('belirsiz');
  const [question,setQuestion]=useState('');
  const [context,setContext]=useState('');
  function generate() {
    const r=makeReading({
      type:'relationship',topic:'relationship',question,profile,
      title:'İlişki Enerji Analizi',
      summary:`${nickname||'Bu kişi'} ile dinamikte çekim kadar belirsizlik de görünür; bu yorum kesin niyet okumaz, sadece temaları ayırır.`,
      sections:[
        {title:'Duygusal Çekim',body:'Verilen bilgiler karşılıklı merak ihtimalini dışlamıyor, ama bunu kesin ilgi olarak yorumlamak sağlıklı olmaz.'},
        {title:'İletişim Netliği',body:`"${status}" durumu iletişimde netleşme ihtiyacını öne çıkarıyor.${context?` "${context}" bağlamı da hesaba katıldı.`:''}`},
        {title:'Riskli Patern',body:'Belirsizlik uzadığında zihnin boşlukları hızla doldurabilir; davranışa dayalı veriyle hisleri ayırmak önemli.'},
      ],
      advice:'Kararı tek bir yorumla verme; küçük, saygılı ve net bir iletişim denemesi daha güvenilir veri sağlayabilir.',
    });
    onDone(r);
  }
  return (
    <Scr>
      <PageHeader eyebrow="İlişki enerjisi" title="Dinamiği kesin hüküm kurmadan ayır" subtitle="Çekim, netlik ve belirsizlik temalarını yumuşak dille analiz eder."/>
      <Field label="Kişi adı / takma ad" value={nickname} onChange={setNickname} placeholder="A., Mavi Gözlü vs."/>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        <div style={{fontSize:11,color:C.muted,fontFamily:C.fontBody,fontWeight:600,letterSpacing:'.07em',textTransform:'uppercase'}}>Son durum</div>
        <ChipGroup options={REL_STATUS} value={status} onChange={setStatus}/>
      </div>
      <Field label="Ana sorun" value={question} onChange={setQuestion} placeholder="Bu kişi bana karşı ne hissediyor olabilir?" multiline/>
      <Field label="Son bağlam" value={context} onChange={setContext} placeholder="Son mesajıma geç cevap verdi." multiline/>
      <Btn onPress={generate} disabled={!question}>Analizi başlat</Btn>
    </Scr>
  );
}

// ── Screen: Reading Detail ────────────────────────────────
function ReadingDetail({reading,onBack,onFeedback}) {
  const [flipped,setFlipped]=useState({});
  const typeLabel={daily:'Günlük',tarot:'Tarot',coffee:'Kahve Falı',relationship:'İlişki Analizi'};
  const scoreLabels={emotional_pull:'Duygusal çekim',communication_clarity:'İletişim netliği',uncertainty_level:'Belirsizlik',user_projection_risk:'Projeksiyon riski'};
  return (
    <Scr>
      <BackBtn onPress={onBack}/>
      <PageHeader eyebrow={typeLabel[reading.reading_type]} title={reading.title} subtitle={reading.summary}/>
      {reading.cards&&(
        <>
          <div style={{display:'flex',justifyContent:'center',gap:12,padding:'4px 0'}}>
            {reading.cards.map((card,i)=>(
              <div key={i} onClick={()=>setFlipped(f=>({...f,[i]:!f[i]}))} style={{cursor:'pointer',transition:'transform .3s',transform:flipped[i]?'rotateY(180deg)':'rotateY(0deg)'}}>
                {flipped[i]
                  ? <div style={{width:72,height:114,borderRadius:8,background:C.surface,border:`1px solid var(--accent,#D8B56D)`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',padding:'8px 5px'}}>
                      <div style={{fontSize:8,color:'var(--accent,#D8B56D)',fontFamily:C.fontBody,fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em'}}>{POS_LABELS[card.position]||card.position}</div>
                      <div style={{fontSize:10,color:C.text,fontFamily:C.fontDisplay,fontWeight:600,textAlign:'center',lineHeight:1.3}}>{card.card}</div>
                      <div style={{fontSize:8,color:C.faint,fontFamily:C.fontBody}}>{card.orientation==='upright'?'düz':'ters'}</div>
                    </div>
                  : <TarotCardBack width={72} height={114}/>
                }
              </div>
            ))}
          </div>
          <div style={{fontSize:11,color:C.faint,fontFamily:C.fontBody,textAlign:'center'}}>Kartlara dokun — çevir</div>
        </>
      )}
      {reading.sections.map(s=><InsightCard key={s.title} title={s.title} body={s.body} accent/>)}
      <InsightCard title="Öneri" body={reading.advice}/>
      <InsightCard title="Yansıma sorusu" body={reading.reflection_question}/>
      {reading.scores&&(
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 16px',display:'flex',flexDirection:'column',gap:12}}>
          <div style={{fontSize:16,color:C.text,fontFamily:C.fontDisplay,fontWeight:600}}>Enerji haritası</div>
          {Object.entries(reading.scores).map(([k,v])=><ScoreBar key={k} label={scoreLabels[k]||k} value={v}/>)}
        </div>
      )}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 16px',display:'flex',flexDirection:'column',gap:8}}>
        <div style={{fontSize:14,color:C.text,fontFamily:C.fontDisplay,fontWeight:600}}>Neye dayanıyor?</div>
        {reading.explanation.based_on.map(x=><div key={x} style={{fontSize:13,color:'var(--accent,#D8B56D)',fontFamily:C.fontBody,fontWeight:500}}>— {x}</div>)}
        <div style={{fontSize:12,color:C.faint,fontFamily:C.fontBody,lineHeight:1.6}}>Güven skoru: {Math.round(reading.explanation.confidence*100)}%</div>
      </div>
      <InsightCard title="Güvenlik notu" body={reading.safety_note}/>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:4}}>
        <div style={{fontSize:16,color:C.text,fontFamily:C.fontDisplay,fontWeight:600}}>Bu yorum sana uydu mu?</div>
        <Btn onPress={()=>onFeedback('accurate')}>İsabetli</Btn>
        <Btn variant="secondary" onPress={()=>onFeedback('partial')}>Kısmen</Btn>
        <Btn variant="secondary" onPress={()=>onFeedback('inaccurate')}>İsabetsiz</Btn>
      </div>
    </Scr>
  );
}

// ── Screen: Profile ───────────────────────────────────────
function ProfileScreen({profile,readings,feedbackCount,navigate}) {
  return (
    <Scr>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,paddingTop:8,paddingBottom:8}}>
        <div style={{width:72,height:72,borderRadius:'50%',background:'var(--accent-soft,#3B3220)',border:`1px solid var(--accent,#D8B56D)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:28,color:'var(--accent,#D8B56D)',fontFamily:C.fontDisplay,fontWeight:600}}>{profile?.title?.[0]||'M'}</span>
        </div>
        <div style={{textAlign:'center',display:'flex',flexDirection:'column',gap:4}}>
          <div style={{fontSize:24,color:C.text,fontFamily:C.fontDisplay,fontWeight:600}}>{profile?.title||'Mirror Profili'}</div>
          <div style={{fontSize:12,color:C.muted,fontFamily:C.fontBody,fontWeight:300,lineHeight:1.6,maxWidth:260}}>{profile?.summary||'Onboarding tamamlandığında profil özeti burada görünür.'}</div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        {[{label:'Kredi',value:120},{label:'Yorum',value:readings},{label:'Geri Bildirim',value:feedbackCount}].map(s=>(
          <div key={s.label} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'12px 10px',display:'flex',flexDirection:'column',gap:4,alignItems:'center'}}>
            <div style={{fontSize:22,color:'var(--accent,#D8B56D)',fontFamily:C.fontDisplay,fontWeight:600}}>{s.value}</div>
            <div style={{fontSize:10,color:C.muted,fontFamily:C.fontBody,textAlign:'center'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <InsightCard title="Natal haritam" body="Güneş İkizler, Ay Balık, Yükselen Aslan." meta="Astroloji" onPress={()=>navigate('natal-chart')} accent/>
      <InsightCard title="Hafıza olayları" body="Mirror'a kaydettiğin anlar yorumların bağlamını derinleştirir." onPress={()=>navigate('memory')}/>
      <div style={{background:'var(--accent-soft,#3B3220)',border:`1px solid var(--accent,#D8B56D)`,borderRadius:12,padding:'16px',display:'flex',flexDirection:'column',gap:8}}>
        <div style={{fontSize:16,color:C.text,fontFamily:C.fontDisplay,fontWeight:600}}>Krediler</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontSize:13,color:C.muted,fontFamily:C.fontBody}}>Mevcut: 120 kredi</div>
          <button onClick={()=>navigate('credits')} style={{padding:'6px 14px',borderRadius:7,border:'none',background:'var(--accent,#D8B56D)',color:'#08090C',fontFamily:C.fontBody,fontSize:12,fontWeight:700,cursor:'pointer'}}>Satın al</button>
        </div>
      </div>
      <InsightCard title="Veri kontrolü" body="Veri silme ve profil dışa aktarma akışları Supabase bağlantısından sonra etkinleştirilecek."/>
      <Btn variant="secondary" onPress={()=>{}}>Çıkış yap</Btn>
    </Scr>
  );
}

// ── Screen: Natal Chart ───────────────────────────────────
function NatalChartScreen({onBack}) {
  const CX=150,CY=150,R_OUT=138,R_SIGN=114,R_HOUSE=94,R_INNER=78;
  const SIGNS=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const SIGN_NAMES=['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];
  const ELEMENTS=['fire','earth','air','water','fire','earth','air','water','fire','earth','air','water'];
  const ELEM_FILL={fire:'rgba(232,168,124,.18)',earth:'rgba(139,201,160,.15)',air:'rgba(168,200,232,.15)',water:'rgba(196,168,224,.15)'};
  const PLANETS=[
    {name:'Güneş',glyph:'☉',deg:83,color:'#E8C870'},
    {name:'Ay',glyph:'☽',deg:345,color:'#C8D4E8'},
    {name:'Yükselen',glyph:'AC',deg:130,color:'var(--accent,#D8B56D)'},
    {name:'Merkür',glyph:'☿',deg:70,color:'#A7AFBD'},
    {name:'Venüs',glyph:'♀',deg:148,color:'#E0A8B8'},
    {name:'Mars',glyph:'♂',deg:100,color:'#E28484'},
  ];
  function polar(r,deg){const rad=(deg-90)*Math.PI/180;return{x:CX+r*Math.cos(rad),y:CY+r*Math.sin(rad)};}
  function seg(r1,r2,s,e){
    const a1=polar(r1,s),a2=polar(r2,s),b1=polar(r1,e),b2=polar(r2,e);
    const large=(e-s)>180?1:0;
    return `M${a1.x.toFixed(2)} ${a1.y.toFixed(2)} A${r1} ${r1} 0 ${large} 1 ${b1.x.toFixed(2)} ${b1.y.toFixed(2)} L${b2.x.toFixed(2)} ${b2.y.toFixed(2)} A${r2} ${r2} 0 ${large} 0 ${a2.x.toFixed(2)} ${a2.y.toFixed(2)} Z`;
  }
  return (
    <Scr>
      <BackBtn onPress={onBack}/>
      <PageHeader eyebrow="Natal Harita" title="Doğum haritanın şiiri" subtitle="Swiss Ephemeris ile hesaplandı. Sembolik ve kişisel farkındalık amaçlıdır."/>
      <div style={{display:'flex',justifyContent:'center',padding:'4px 0'}}>
        <svg width="300" height="300" viewBox="0 0 300 300">
          {SIGNS.map((sign,i)=>{
            const s=i*30,e=s+30,mid=polar(R_SIGN+(R_OUT-R_SIGN)/2,s+15);
            return (
              <g key={i}>
                <path d={seg(R_SIGN,R_OUT,s,e)} fill={ELEM_FILL[ELEMENTS[i]]} stroke="#293241" strokeWidth=".5"/>
                <text x={mid.x.toFixed(1)} y={(mid.y+4.5).toFixed(1)} textAnchor="middle" fontSize="13" fill="var(--accent,#D8B56D)" fontFamily="serif" opacity=".85">{sign}</text>
              </g>
            );
          })}
          {Array.from({length:12},(_,i)=>{
            const p1=polar(R_HOUSE,i*30),p2=polar(R_SIGN,i*30);
            return <line key={i} x1={p1.x.toFixed(1)} y1={p1.y.toFixed(1)} x2={p2.x.toFixed(1)} y2={p2.y.toFixed(1)} stroke="#293241" strokeWidth=".5"/>;
          })}
          {Array.from({length:12},(_,i)=>{
            const m=polar((R_HOUSE+R_SIGN)/2,i*30+15);
            return <text key={i} x={m.x.toFixed(1)} y={(m.y+3).toFixed(1)} textAnchor="middle" fontSize="7.5" fill="#707A8A">{i+1}</text>;
          })}
          <circle cx={CX} cy={CY} r={R_HOUSE} fill="#0D1119" stroke="#293241" strokeWidth=".6"/>
          <circle cx={CX} cy={CY} r={R_INNER} fill="#090B10" stroke="#293241" strokeWidth=".5"/>
          {PLANETS.map((p,i)=>{
            const o=polar(R_INNER,p.deg);
            return <line key={i} x1={CX} y1={CY} x2={o.x.toFixed(1)} y2={o.y.toFixed(1)} stroke={p.color} strokeWidth=".8" opacity=".4"/>;
          })}
          {PLANETS.map((p,i)=>{
            const pt=polar(R_INNER-8,p.deg);
            return (
              <g key={i}>
                <circle cx={pt.x.toFixed(1)} cy={pt.y.toFixed(1)} r="7" fill="#121722" stroke={p.color} strokeWidth="1.2"/>
                <text x={pt.x.toFixed(1)} y={(pt.y+3.5).toFixed(1)} textAnchor="middle" fontSize="7" fill={p.color} fontFamily="serif">{p.glyph}</text>
              </g>
            );
          })}
          <circle cx={CX} cy={CY} r="4" fill="var(--accent,#D8B56D)" opacity=".7"/>
        </svg>
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 16px',display:'flex',flexDirection:'column',gap:8}}>
        <div style={{fontSize:16,color:C.text,fontFamily:C.fontDisplay,fontWeight:600}}>Gezegen konumları</div>
        {PLANETS.map(p=>(
          <div key={p.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <span style={{fontSize:15,color:p.color,fontFamily:'serif'}}>{p.glyph}</span>
              <span style={{fontSize:13,color:C.muted,fontFamily:C.fontBody}}>{p.name}</span>
            </div>
            <span style={{fontSize:13,color:C.text,fontFamily:C.fontDisplay,fontWeight:600}}>{SIGN_NAMES[Math.floor((p.deg%360)/30)]}</span>
          </div>
        ))}
      </div>
      <InsightCard title="Sembolik yorum" body="Güneş İkizler'de iletişim ve merak ana tema. Ay Balık'ta duygusal derinlik ve sezgi. Yükselen Aslan dış dünyaya güçlü görünme ihtiyacı yaratır." accent/>
    </Scr>
  );
}

// ── Screen: Memory ────────────────────────────────────────
const MOCK_MEMORIES=[
  {id:1,date:'2024-12-10',text:'A. ile son görüşme — uzaklaştığını fark ettim ama ses çıkarmadım.',icon:'💫'},
  {id:2,date:'2024-11-23',text:'Yine ulaşılması zor birine ilgi duyduğumu fark ettim.',icon:'🔄'},
  {id:3,date:'2024-10-05',text:'Kahve falı: "yol" sembolü o ay başladığım projeyi anlatıyordu.',icon:'☕'},
  {id:4,date:'2024-09-18',text:'Tekrarlayan kapı rüyası — karar noktasında hissediyorum.',icon:'🌙'},
];
function MemoryScreen({onBack}) {
  const [memories,setMemories]=useState(MOCK_MEMORIES);
  const [adding,setAdding]=useState(false);
  const [newText,setNewText]=useState('');
  function add(){
    if(!newText.trim())return;
    setMemories(m=>[{id:Date.now(),date:new Date().toISOString().slice(0,10),text:newText,icon:'✦'},...m]);
    setNewText('');setAdding(false);
  }
  return (
    <Scr>
      <BackBtn onPress={onBack}/>
      <PageHeader eyebrow="Hafıza" title="Mirror seni hatırlıyor" subtitle="Kaydettiğin anlar, yorumların bağlamını derinleştirir."/>
      {adding
        ? <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 16px',display:'flex',flexDirection:'column',gap:10}}>
            <Field label="Yeni an" value={newText} onChange={setNewText} placeholder="Bugün ne fark ettin?" multiline/>
            <div style={{display:'flex',gap:8}}>
              <Btn onPress={add} small>Kaydet</Btn>
              <Btn variant="secondary" onPress={()=>setAdding(false)} small>Vazgeç</Btn>
            </div>
          </div>
        : <Btn onPress={()=>setAdding(true)}>+ Yeni an ekle</Btn>
      }
      <div style={{display:'flex',flexDirection:'column',gap:0}}>
        {memories.map((m,i)=>(
          <div key={m.id} style={{display:'flex',gap:12,alignItems:'flex-start'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:0,flexShrink:0}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:'var(--accent-soft,#3B3220)',border:`1px solid var(--accent,#D8B56D)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>{m.icon}</div>
              {i<memories.length-1&&<div style={{width:1,flex:1,minHeight:24,background:C.border,opacity:.4}}/>}
            </div>
            <div style={{flex:1,paddingBottom:16}}>
              <div style={{fontSize:10,color:C.faint,fontFamily:C.fontBody,marginBottom:4}}>{m.date}</div>
              <div style={{fontSize:13,color:C.muted,fontFamily:C.fontBody,lineHeight:1.65,fontWeight:300}}>{m.text}</div>
            </div>
          </div>
        ))}
      </div>
    </Scr>
  );
}

// ── Screen: Credits ───────────────────────────────────────
const PKGS=[
  {id:'free',label:'Başlangıç',credits:20,price:'Ücretsiz',desc:'İlk 20 kredi'},
  {id:'mid',label:'Ay Paketi',credits:100,price:'₺89',desc:'Aylık yenilenir'},
  {id:'premium',label:'Yıllık Premium',credits:999,price:'₺399/yıl',desc:'Sınırsız + hafıza derinliği'},
];
function CreditsScreen({onBack}) {
  const [sel,setSel]=useState('mid');
  return (
    <Scr>
      <BackBtn onPress={onBack}/>
      <PageHeader eyebrow="Krediler" title="Yorumlar için yakıt" subtitle="Her yorum 1 kredi kullanır. Premium hafıza motorunu ve natal harita derinliğini açar."/>
      <div style={{background:'var(--accent-soft,#3B3220)',border:`1px solid var(--accent,#D8B56D)`,borderRadius:14,padding:'20px 16px',display:'flex',alignItems:'center',gap:16}}>
        <div style={{fontSize:42,color:'var(--accent,#D8B56D)',fontFamily:C.fontDisplay,fontWeight:300,lineHeight:1}}>120</div>
        <div>
          <div style={{fontSize:13,color:C.text,fontFamily:C.fontBody,fontWeight:600}}>Mevcut kredi</div>
          <div style={{fontSize:11,color:C.muted,fontFamily:C.fontBody}}>Son yenileme: bugün</div>
        </div>
      </div>
      {PKGS.map(pkg=>(
        <div key={pkg.id} onClick={()=>setSel(pkg.id)} style={{
          background:sel===pkg.id?'var(--accent-soft,#3B3220)':C.surface,
          border:`1px solid ${sel===pkg.id?'var(--accent,#D8B56D)':C.border}`,
          borderRadius:12,padding:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',transition:'all .15s',
        }}>
          <div>
            <div style={{fontSize:16,color:C.text,fontFamily:C.fontDisplay,fontWeight:600}}>{pkg.label}</div>
            <div style={{fontSize:12,color:C.muted,fontFamily:C.fontBody,marginTop:3}}>{pkg.desc}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:15,color:sel===pkg.id?'var(--accent,#D8B56D)':C.text,fontFamily:C.fontBody,fontWeight:700}}>{pkg.price}</div>
            <div style={{fontSize:11,color:C.faint,fontFamily:C.fontBody}}>{pkg.credits===999?'sınırsız':`${pkg.credits} kredi`}</div>
          </div>
        </div>
      ))}
      <Btn>Satın al</Btn>
      <div style={{fontSize:11,color:C.faint,fontFamily:C.fontBody,textAlign:'center',lineHeight:1.6}}>Abonelik istediğinde iptal edilebilir. Tüm içerikler eğlence amaçlıdır.</div>
    </Scr>
  );
}

// ── Root App ──────────────────────────────────────────────
function MirrorApp() {
  const [screen,setScreen]=useState('splash');
  const [tab,setTab]=useState('home');
  const [mysticProfile,setMysticProfile]=useState(null);
  const [readings,setReadings]=useState([]);
  const [activeReading,setActiveReading]=useState(null);
  const [feedbackCount,setFeedbackCount]=useState(0);
  const [screenKey,setScreenKey]=useState(0);

  function navigate(newScreen,newTab) {
    if(newTab) setTab(newTab);
    setScreen(newScreen);
    setScreenKey(k=>k+1);
  }

  // expose for tweaks
  useEffect(()=>{
    window.__mirrorSetScreen=(s)=>{
      if(s==='tabs'){navigate('tabs','home');}
      else if(s==='onboarding-welcome'){navigate('onboarding-welcome');}
      else{navigate(s);}
    };
  },[]);

  function addReading(r){setReadings(p=>[r,...p]);}
  function openReading(r){setActiveReading(r);navigate('reading-detail');}

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',background:C.bg,overflow:'hidden'}}>
      {screen==='splash'&&(
        <AnimatedScreen id={`splash-${screenKey}`}>
          <SplashScreen onDone={()=>navigate('onboarding-welcome')}/>
        </AnimatedScreen>
      )}
      {screen==='onboarding-welcome'&&(
        <AnimatedScreen id={`ob-welcome-${screenKey}`}>
          <OnboardingWelcome onNext={()=>navigate('onboarding-birth')}/>
        </AnimatedScreen>
      )}
      {screen==='onboarding-birth'&&(
        <AnimatedScreen id={`ob-birth-${screenKey}`}>
          <OnboardingBirth onNext={()=>navigate('onboarding-quiz')}/>
        </AnimatedScreen>
      )}
      {screen==='onboarding-quiz'&&(
        <AnimatedScreen id={`ob-quiz-${screenKey}`}>
          <OnboardingQuiz onNext={ans=>{setMysticProfile(getMysticProfile(ans));navigate('onboarding-result');}}/>
        </AnimatedScreen>
      )}
      {screen==='onboarding-result'&&(
        <AnimatedScreen id={`ob-result-${screenKey}`}>
          <OnboardingResult profile={mysticProfile} onDone={()=>navigate('tabs','home')}/>
        </AnimatedScreen>
      )}
      {screen==='reading-detail'&&activeReading&&(
        <AnimatedScreen id={`reading-${screenKey}`}>
          <ReadingDetail reading={activeReading} onBack={()=>navigate('tabs')} onFeedback={()=>{setFeedbackCount(c=>c+1);navigate('tabs');}}/>
        </AnimatedScreen>
      )}
      {screen==='natal-chart'&&(
        <AnimatedScreen id={`natal-${screenKey}`}>
          <NatalChartScreen onBack={()=>navigate('tabs','profile')}/>
        </AnimatedScreen>
      )}
      {screen==='memory'&&(
        <AnimatedScreen id={`memory-${screenKey}`}>
          <MemoryScreen onBack={()=>navigate('tabs','profile')}/>
        </AnimatedScreen>
      )}
      {screen==='credits'&&(
        <AnimatedScreen id={`credits-${screenKey}`}>
          <CreditsScreen onBack={()=>navigate('tabs','profile')}/>
        </AnimatedScreen>
      )}
      {screen==='tabs'&&(
        <AnimatedScreen id={`tabs-${tab}-${screenKey}`}>
          <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
            {tab==='home'&&<HomeScreen profile={mysticProfile} readings={readings} onNewReading={addReading} onReadingPress={openReading} setTab={t=>navigate('tabs',t)} navigate={navigate}/>}
            {tab==='tarot'&&<TarotScreen profile={mysticProfile} onDone={r=>{addReading(r);openReading(r);}}/>}
            {tab==='coffee'&&<CoffeeScreen profile={mysticProfile} onDone={r=>{addReading(r);openReading(r);}}/>}
            {tab==='relationship'&&<RelationshipScreen profile={mysticProfile} onDone={r=>{addReading(r);openReading(r);}}/>}
            {tab==='profile'&&<ProfileScreen profile={mysticProfile} readings={readings.length} feedbackCount={feedbackCount} navigate={navigate}/>}
            <BottomNav tab={tab} setTab={t=>navigate('tabs',t)}/>
          </div>
        </AnimatedScreen>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MirrorApp/>);
