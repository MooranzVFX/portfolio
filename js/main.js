/* ==========================================================
   ÁLVARO MORA · PORTFOLIO — main.js
   GSAP + ScrollTrigger + Lenis (CDN). Sin compilar.
   ========================================================== */

/* ---------- 1. CONFIGURACIÓN (edita aquí) ---------- */
const CONFIG = {
  CLOUD_NAME: 'fneke0no',   // ← tu cloud name de Cloudinary (mientras tenga "TU_" se muestran fotos de demo)
  TAG: 'portfolio',              // ← etiqueta de las imágenes en Cloudinary
  NAME: 'Álvaro Mora',           // ← tu nombre / marca
  VIDEOS_JSON: 'videos.json',    // ← lista de vídeos de YouTube
  ABOUT_PHOTO: 'img/alvaro.jpg', // ← foto de "Sobre mí" (ruta local o URL de Cloudinary)
  CATEGORIES: [                  // ← filtros: id "all" muestra todo; "images" y "videos" filtran por tipo
    { id: 'all',    label: { es: 'Todo',     en: 'All' } },
    { id: 'images', label: { es: 'Imágenes', en: 'Images' } },
    { id: 'videos', label: { es: 'Vídeos',   en: 'Videos' } }
  ],
  CONTACT: {                     // ← tus enlaces de contacto
    instagram: 'https://instagram.com/mooranz_',
    email: 'amorasanzviveros@gmail.com',
    phone: '+34 622 54 88 94'
  },
  // Títulos y descripciones opcionales por public_id de Cloudinary (texto o {es, en}).
  // Si no pones nada, el título sale del nombre del archivo.
  CAPTIONS: {
    // 'carpeta/mi_foto': { title: { es: 'Noche en Madrid', en: 'Night in Madrid' }, desc: { es: 'Sony A7 · 35mm', en: 'Sony A7 · 35mm' } }
  }
};

/* ---------- 2. MOVIMIENTO (velocidades y duraciones) ---------- */
const MOTION = {
  loader: 1.8,          // segundos de la pantalla de carga
  lenisDuration: 1.2,   // inercia del scroll suave
  mouseStrength: 40,    // px máx. de parallax con el ratón (se multiplica por la profundidad)
  cursorLerp: 0.16,     // suavidad del cursor (0-1, menor = más lento)
  magnet: 0.3,          // fuerza de los botones magnéticos
  tilt: 8,              // grados máx. del tilt 3D
  easeOut: 'expo.out',
  easeSoft: 'power3.out'
};

/* ---------- 3. TEXTOS (ES / EN) ---------- */
const I18N = {
  es: {
    menu: 'Menú', close: 'Cerrar', nav_home: 'Inicio', nav_gallery: 'Galería', nav_about: 'Sobre mí', nav_contact: 'Contacto',
    hero_kicker: 'Fotografía y vídeo', hero_tag: 'Putita',
    cta_gallery: 'Ver galería', cta_contact: 'Contactar', chip1: 'Impresión 3D', chip2: 'Producción y postproducción', chip3: 'Suite Adobe', chip4: 'Blender', chip5: 'Maya', chip6: 'VFX', chip7: 'Motion graphics', chip8: 'Fotografía y vídeo',
    gallery_title: 'Galería', about_title: 'Sobre mí',
    about_text: 'Soy Álvaro Mora, fotógrafo y videógrafo. Trabajo con luz artificial, color y contraste para contar historias urbanas y retratos con carácter. Si tienes un proyecto en mente, escríbeme.',
    contact_title: 'Hablemos', phone: 'Teléfono', empty: 'No hay elementos en esta categoría todavía.', video: 'Vídeo', loading: 'Cargando galería…', error: 'No se pudo cargar la galería. Revisa el cloud name y que el listado por etiqueta esté activado.'
  },
  en: {
    menu: 'Menu', close: 'Close', nav_home: 'Home', nav_gallery: 'Gallery', nav_about: 'About', nav_contact: 'Contact',
    hero_kicker: 'Photography & video', hero_tag: 'Light, neon and silence: portraits and urban scenes captured at night.',
    cta_gallery: 'View gallery', cta_contact: 'Get in touch', chip1: '3D Printing', chip2: 'Production & Post-Production', chip3: 'Adobe Suite', chip4: 'Blender', chip5: 'Maya', chip6: 'VFX', chip7: 'Motion Graphics', chip8: 'Photography & Video',
    gallery_title: 'Gallery', about_title: 'About me',
    about_text: "I'm Álvaro Mora, a photographer and videographer. I work with artificial light, colour and contrast to tell urban stories and portraits with character. Got a project in mind? Write to me.",
    contact_title: "Let's talk", phone: 'Phone', empty: 'Nothing in this category yet.', video: 'Video', loading: 'Loading gallery…', error: 'The gallery could not be loaded. Check the cloud name and that tag listing is enabled.'
  }
};

/* ---------- 4. UTILIDADES Y ESTADO ---------- */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;      // reduce animaciones
const DESKTOP = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 769px)').matches;
const ANIM = hasGsap && !RM;

let lang = 'es', cat = 'all', all = [], shown = [], cur = 0, lenis = null, tileTriggers = [];
try { lang = localStorage.getItem('lang') || (navigator.language || 'es').slice(0, 2); } catch (e) {}
if (!I18N[lang]) lang = 'es';

const T = k => I18N[lang][k] || k;
const tr = v => (v && typeof v === 'object') ? (v[lang] || v.es || '') : (v || '');

/* ---------- 5. DATOS: Cloudinary + YouTube ---------- */
const cloudUrl = (r, w) => `https://res.cloudinary.com/${CONFIG.CLOUD_NAME}/image/upload/f_auto,q_auto,c_limit,w_${w}/v${r.version}/${r.public_id}.${r.format}`;

// Une pares nombre_before + nombre_after (o _antes / _despues) en una sola entrada de tipo "ba"
function pairBeforeAfter(list) {
  const re = /^(.*?)[_-](before|antes|after|despues)(?:_[a-z0-9]{6})?$/i;
  const pairs = {}, out = [];
  list.forEach(it => {
    const m = it.id.match(re);
    if (!m) return out.push(it);
    const p = pairs[m[1]] = pairs[m[1]] || { type: 'ba', cat: 'images', id: m[1] };
    p[/^(before|antes)$/i.test(m[2]) ? 'before' : 'after'] = it;
    if (!p.added) { p.added = true; out.push(p); }
  });
  return out.filter(o => o.type !== 'ba' || (o.before && o.after)).map(o => {   // descarta parejas incompletas
    if (o.type !== 'ba') return o;
    const cap = CONFIG.CAPTIONS[o.id] || {};
    return { ...o, w: o.after.w, h: o.after.h,
      title: cap.title || o.id.split('/').pop().replace(/[_-]+/g, ' '), desc: cap.desc || '',
      thumb: o.after.thumb, full: o.after.full };
  });
}

async function loadImages() {
  // Modo demo mientras no pongas tu cloud name
  if (CONFIG.CLOUD_NAME.startsWith('TU_')) {
    const sz = [[800,1200],[1200,800],[1600,650],[1000,1000],[800,1000],[1400,850],[900,1300],[1200,1200],[1800,700],[800,1100],[1300,900],[900,900]];
    return sz.map(([w, h], i) => ({ type: 'img', cat: 'images', w, h, id: 'demo-' + i, title: 'Demo ' + (i + 1), desc: '',
      thumb: () => `https://picsum.photos/seed/neon${i}/${Math.round(w / 2)}/${Math.round(h / 2)}`,
      full: () => `https://picsum.photos/seed/neon${i}/${w}/${h}` }));
  }
  const url = `https://res.cloudinary.com/${CONFIG.CLOUD_NAME}/image/list/${CONFIG.TAG}.json`;
  const data = await (await fetch(url)).json();
  const imgs = (data.resources || []).map(r => {
    const cap = CONFIG.CAPTIONS[r.public_id] || {};
    const auto = r.public_id.split('/').pop().replace(/_[a-z0-9]{6}$/i, '').replace(/[_-]+/g, ' ');
    return { type: 'img', cat: 'images', w: r.width, h: r.height, id: r.public_id, title: cap.title || auto, desc: cap.desc || '',
      thumb: w => cloudUrl(r, w), full: w => cloudUrl(r, w) };
  });
  return pairBeforeAfter(imgs);
}


// Extrae el ID de YouTube de cualquier formato de enlace
const ytId = u => { const m = String(u).match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/); return m ? m[1] : (/^[\w-]{11}$/.test(u) ? u : null); };

async function loadVideos() {
  try {
    const list = await (await fetch(CONFIG.VIDEOS_JSON)).json();
    return list.map(e => (typeof e === 'string' ? { url: e } : e)).map(e => ({ ...e, vid: ytId(e.url) })).filter(e => e.vid)
      .map(e => ({ type: 'video', cat: 'videos', w: 16, h: 9, id: e.vid, vid: e.vid, pos: e.position, title: e.title || { es: 'Vídeo', en: 'Video' }, desc: e.desc || '',
        thumb: () => `https://i.ytimg.com/vi/${e.vid}/hqdefault.jpg` }));
  } catch (err) { return []; }
}

/* ---------- 6. GALERÍA BENTO ---------- */
const bento = $('#bento');

function renderFilters() {
  $('#filters').innerHTML = CONFIG.CATEGORIES.map(c => `<button class="chip ${c.id === cat ? 'on' : ''}" data-cat="${c.id}" data-cursor="link">${tr(c.label)}</button>`).join('');
}

function renderGallery() {
  shown = all.filter(i => cat === 'all' || i.cat === cat);
  $('#empty').hidden = shown.length > 0;
  $('#empty').textContent = T('empty');
  bento.innerHTML = shown.map((it, n) => {
    // "wide": panorámicas y vídeos ocupan 2 columnas; cada 7ª foto casi cuadrada se destaca
    const r = it.w / it.h;
    it.ratio = r;
    it.feat = it.type === 'img' && n % 7 === 3 && r > .75 && r < 1.5;
    it.wide = it.type === 'video' || r > 1.9;
    const src = it.thumb(it.wide || it.feat ? 1000 : 640);
    return `<figure class="item" data-i="${n}" tabindex="0" role="button" aria-label="${tr(it.title)}">
      <div class="tile"><img src="${src}" alt="${tr(it.title)}" loading="lazy" decoding="async">${it.type === 'video' ? '<span class="play"><svg viewBox="0 0 24 24"><path d="M5 3l16 9-16 9z"/></svg></span>' : ''}${it.type === 'ba' ? '<span class="badge">⟷</span>' : ''}</div></figure>`;
  }).join('');
  layout();
  revealTiles();
}

// Calcula cuántas columnas (1 o 2) y filas (de 4px) ocupa cada celda según su proporción
function layout() {
  const cols = getComputedStyle(bento).gridTemplateColumns.split(' ');
  const n = cols.length, colW = parseFloat(cols[0]);
  const els = [...bento.children];
  const calc = els.map((el, i) => {
    const it = shown[i];
    const span = (it.feat && n >= 3) || (it.wide && n >= 2) ? 2 : 1;
    const h = (colW * span) / it.ratio;
    return { el, span, rows: Math.max(8, Math.round(h / 4)) };
  });
  calc.forEach(c => { c.el.style.gridColumn = 'span ' + c.span; c.el.style.gridRow = 'span ' + c.rows; });
}

function revealTiles() {
  tileTriggers.forEach(t => t.kill());
  tileTriggers = [];
  if (!ANIM) return;
  const tiles = $$('.tile', bento);
  gsap.set(tiles, { opacity: 0 });
  tileTriggers = ScrollTrigger.batch(tiles, {
    start: 'top 94%', once: true,
    onEnter: b => gsap.fromTo(b, { clipPath: 'inset(100% 0% 0% 0% round 18px)', opacity: 0 },
      { clipPath: 'inset(0% 0% 0% 0% round 18px)', opacity: 1, duration: 1.1, stagger: .07, ease: MOTION.easeOut, clearProps: 'clipPath' })
  });
  ScrollTrigger.refresh();
}

/* ---------- 7. VISOR (lightbox) ---------- */
const lb = $('#lb'), stage = $('#lbStage');
let swiped = false, x0 = 0;

function showLB() {
  const it = shown[cur];
  stage.innerHTML = '';
  if (it.type === 'video') {
    const d = document.createElement('div');
    d.className = 'lb-video';
    d.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${it.vid}?autoplay=1&rel=0" title="${tr(it.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    stage.append(d);
  } else if (it.type === 'ba') {
    // Slider antes/después: la imagen "antes" se recorta con clip-path según la posición de la barra
    const d = document.createElement('div');
    d.className = 'ba';
    d.style.cssText = `--ar:${it.w / it.h};width:min(94vw,calc((94vh - 96px) * ${it.w / it.h}))`;
    d.innerHTML = `<img src="${it.after.full(2200)}" alt="" draggable="false"><div class="ba-top"><img src="${it.before.full(2200)}" alt="" draggable="false"></div><div class="ba-bar"><span>⟷</span></div>`;
    const move = e => { const r = d.getBoundingClientRect(); d.style.setProperty('--p', Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100)) + '%'); };
    d.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); d.setPointerCapture(e.pointerId); move(e); d.onpointermove = move; });
    d.addEventListener('pointerup', e => { e.stopPropagation(); d.onpointermove = null; });
    d.addEventListener('click', e => e.stopPropagation());   // arrastrar no cierra el visor
    stage.append(d);
  } else {
    const im = new Image();
    im.src = it.full(2200); im.alt = tr(it.title);
    stage.append(im);
  }
  $('#lbTitle').textContent = tr(it.title);
  $('#lbDesc').textContent = tr(it.desc);
  $$('.lb-nav').forEach(b => b.hidden = shown.length < 2);
}
function openLB(i) {
  cur = i; showLB();
  lb.classList.add('open');
  document.body.classList.add('locked');
  lenis && lenis.stop();
}
function closeLB() {
  lb.classList.remove('open');
  stage.innerHTML = '';                 // elimina el iframe → detiene el vídeo
  document.body.classList.remove('locked');
  lenis && lenis.start();
}
const stepLB = d => { cur = (cur + d + shown.length) % shown.length; showLB(); };

bento.addEventListener('click', e => { const f = e.target.closest('.item'); if (f) openLB(+f.dataset.i); });
bento.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const f = e.target.closest('.item'); if (f) { e.preventDefault(); openLB(+f.dataset.i); } } });
lb.addEventListener('click', e => { if (e.target.closest('.lb-nav')) return; if (swiped) { swiped = false; return; } closeLB(); });
$('#lbPrev').addEventListener('click', () => stepLB(-1));
$('#lbNext').addEventListener('click', () => stepLB(1));
lb.addEventListener('pointerdown', e => { x0 = e.clientX; });
lb.addEventListener('pointerup', e => {                       // gesto táctil: deslizar para cambiar
  const dx = e.clientX - x0;
  if (Math.abs(dx) > 50 && shown.length > 1) { swiped = true; stepLB(dx < 0 ? 1 : -1); setTimeout(() => swiped = false, 50); }
});
addEventListener('keydown', e => {
  if (e.key === 'Escape') { lb.classList.contains('open') ? closeLB() : toggleMenu(false); }
  if (lb.classList.contains('open') && shown.length > 1) { if (e.key === 'ArrowRight') stepLB(1); if (e.key === 'ArrowLeft') stepLB(-1); }
});

/* ---------- 8. IDIOMA ---------- */
function setLang(l) {
  lang = l;
  try { localStorage.setItem('lang', l); } catch (e) {}
  document.documentElement.lang = l;
  $$('[data-i18n]').forEach(el => { el.textContent = T(el.dataset.i18n); });
  $('#langBtn').textContent = l.toUpperCase() + ' ▾';
  $$('.lang-menu button').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
  $('#burger').textContent = T($('#menu').classList.contains('open') ? 'close' : 'menu');
  renderFilters();
  if (all.length) { $$('.item img', bento).forEach((im, i) => { im.alt = tr(shown[i].title); }); $('#empty').textContent = T('empty'); }
  if (lb.classList.contains('open')) { $('#lbTitle').textContent = tr(shown[cur].title); $('#lbDesc').textContent = tr(shown[cur].desc); }
}
$('#langBtn').addEventListener('click', e => { e.stopPropagation(); const o = $('#lang').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); });
$$('.lang-menu button').forEach(b => b.addEventListener('click', () => { setLang(b.dataset.lang); $('#lang').classList.remove('open'); }));
addEventListener('click', () => $('#lang').classList.remove('open'));

$('#filters').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  cat = b.dataset.cat; renderFilters(); renderGallery();
});

/* ---------- 9. MENÚ ---------- */
function toggleMenu(open) {
  const m = $('#menu');
  open = open === undefined ? !m.classList.contains('open') : open;
  m.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  $('#burger').setAttribute('aria-expanded', open);
  $('#burger').textContent = T(open ? 'close' : 'menu');
  lenis && (open ? lenis.stop() : lenis.start());
}
$('#burger').addEventListener('click', () => toggleMenu());

// Enlaces ancla con scroll suave
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  e.preventDefault();
  toggleMenu(false);
  const t = a.getAttribute('href') === '#top' ? 0 : $(a.getAttribute('href'));
  setTimeout(() => lenis ? lenis.scrollTo(t, { duration: 1.6 }) : (t === 0 ? scrollTo({ top: 0, behavior: 'smooth' }) : t.scrollIntoView({ behavior: 'smooth' })), 60);
});

/* ---------- 10. CONTENIDO ESTÁTICO ---------- */
function fillStatic() {
  const [a, b] = CONFIG.NAME.split(' ');
  $('#logo').innerHTML = `${a}<b>${b ? '.' + b : ''}</b>`;
  $('#loaderName').textContent = CONFIG.NAME.toUpperCase();
  document.title = CONFIG.NAME + ' · Portfolio';
  $('#aboutPhoto').src = CONFIG.ABOUT_PHOTO; $('#aboutPhoto').alt = CONFIG.NAME;
  const c = CONFIG.CONTACT;
  $('#cIg').href = c.instagram; $('#cIg strong').textContent = '@' + c.instagram.replace(/\/$/, '').split('/').pop();
  $('#cMail').href = 'mailto:' + c.email; $('#cMail strong').textContent = c.email;
  $('#cTel').href = 'tel:' + c.phone.replace(/\s/g, ''); $('#cTel strong').textContent = c.phone;
  $('#footer').textContent = `© ${new Date().getFullYear()} ${CONFIG.NAME}`;
  // Título del hero palabra a palabra (para revelarlo con máscara)
  $('#heroTitle').innerHTML = CONFIG.NAME.split(' ').map((w, i) => `<span class="word w${i + 1}" aria-hidden="true"><span>${w}</span></span>`).join('');
}

// Formas decorativas de las capas media y frontal (posiciones deterministas)
function buildShapes() {
  const mk = (box, n, kinds, depthMin, depthSpan, sizeMin, sizeSpan) => {
    for (let i = 0; i < n; i++) {
      const k = kinds[i % kinds.length], s = k === 'dot' ? 6 + (i * 7) % 8 : sizeMin + (i * 53) % sizeSpan;
      const d = document.createElement('div');
      d.className = `shape ${k} ${i % 3 ? 'hide-m' : ''}`;
      d.dataset.depth = (depthMin + ((i * 37) % 10) / 10 * depthSpan).toFixed(2);
      d.style.cssText = `left:${(i * 37) % 92 + 2}%;top:${(i * 29) % 94 + 2}%;width:${k === 'line' ? s * 2 : s}px;height:${k === 'line' ? 2 : s}px`;
      d.innerHTML = '<i></i>';
      box.append(d);
    }
  };
  mk($('#layerMid'), 22, ['ring', 'dot', 'line', 'cross', 'ring lil', 'dot'], .3, .9, 40, 120);
  mk($('#layerFront'), 7, ['flare', 'flare ice', 'ring'], 1.6, 1, 260, 220);
  $$('#layerFront .ring').forEach(r => { r.style.opacity = '.25'; r.style.filter = 'blur(3px)'; });
}

/* ---------- 11. ANIMACIONES ---------- */
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Scroll suave con inercia (solo en escritorio; en táctil se mantiene el scroll nativo)
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: MOTION.lenisDuration, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Parallax multicapa por scroll: cada capa recorre su altura a distinta velocidad
  $$('.layer').forEach(l => gsap.to(l, {
    y: () => -(l.offsetHeight - innerHeight) * parseFloat(l.dataset.layer), ease: 'none',
    scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true }
  }));

  // Barra de progreso
  gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });

  // Títulos con máscara, línea a línea
  $$('[data-reveal]').forEach(el => gsap.from(el, { yPercent: 115, duration: 1.2, ease: MOTION.easeOut, scrollTrigger: { trigger: el.parentElement, start: 'top 88%' } }));
  $$('[data-fade]').forEach(el => gsap.from(el, { y: 40, opacity: 0, duration: 1.2, ease: MOTION.easeSoft, scrollTrigger: { trigger: el, start: 'top 88%' } }));

  // Foto "sobre mí": se desvela con clip-path + parallax interno
  const ph = $('[data-reveal-img]');
  gsap.from(ph, { clipPath: 'inset(0 0 100% 0 round 28px)', duration: 1.4, ease: MOTION.easeOut, scrollTrigger: { trigger: ph, start: 'top 85%' } });
  gsap.fromTo('#aboutPhoto', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: ph, start: 'top bottom', end: 'bottom top', scrub: true } });

  // Texto gigante ligado al scroll (dos filas en sentidos opuestos)
  $$('.marquee-row').forEach(r => {
    const dir = +r.dataset.dir;
    gsap.fromTo(r, { xPercent: dir < 0 ? 0 : -38 }, { xPercent: dir < 0 ? -38 : 0, ease: 'none',
      scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
  });

  // Parallax con el ratón: cada elemento se mueve según su profundidad
  if (DESKTOP) {
    const movers = $$('[data-depth]').map(el => ({ d: +el.dataset.depth, x: gsap.quickTo(el, 'x', { duration: 1.4, ease: MOTION.easeSoft }), y: gsap.quickTo(el, 'y', { duration: 1.4, ease: MOTION.easeSoft }) }));
    addEventListener('mousemove', e => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      movers.forEach(m => { m.x(-nx * MOTION.mouseStrength * m.d); m.y(-ny * MOTION.mouseStrength * m.d); });
    });
  }
}

// Entrada coreografiada del hero
function heroIntro() {
  if (!ANIM) return;
  gsap.timeline({ defaults: { ease: MOTION.easeOut } })
    .from('.layer-bg, .layer-mid, .layer-front', { opacity: 0, duration: 1.8, stagger: .25 }, 0)
    .from('#heroTitle .word > span', { yPercent: 115, duration: 1.4, stagger: .14 }, .15)
    .from('.hero .mask > span', { yPercent: 115, duration: 1.1, stagger: .12 }, .5)
    .from('.hero-cta .btn', { y: 30, opacity: 0, duration: 1.1, stagger: .1 }, .8)
    .from('.float', { scale: 0, opacity: 0, duration: 1.3, stagger: .12, ease: 'back.out(1.7)' }, 1);
}

// Pantalla de carga: contador → cortina hacia arriba → hero
function runLoader() {
  const L = $('#loader');
  if (!ANIM) { L.style.display = 'none'; return; }
  const o = { v: 0 };
  gsap.to(o, { v: 100, duration: MOTION.loader, ease: 'power2.inOut',
    onUpdate: () => $('#loaderCount').textContent = Math.round(o.v),
    onComplete: () => {
      gsap.to(L, { yPercent: -100, duration: 1.1, ease: 'expo.inOut', onComplete: () => L.style.display = 'none' });
      setTimeout(heroIntro, 450);
    } });
}

/* ---------- 12. MICROINTERACCIONES (solo escritorio) ---------- */
function initCursor() {
  if (!DESKTOP || RM) return;
  document.body.classList.add('has-cursor');
  const c = $('#cursor'), d = $('#cursorDot');
  let mx = -100, my = -100, x = mx, y = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; d.style.transform = `translate3d(${mx}px,${my}px,0)`; });
  (function loop() { x += (mx - x) * MOTION.cursorLerp; y += (my - y) * MOTION.cursorLerp; c.style.transform = `translate3d(${x}px,${y}px,0)`; requestAnimationFrame(loop); })();
  document.addEventListener('mouseover', e => {
    const card = e.target.closest('.item, .card'), link = e.target.closest('a, button, [data-cursor]');
    c.classList.toggle('card', !!card); c.classList.toggle('link', !card && !!link);
  });
}

function initMagneticAndTilt() {
  if (!DESKTOP || RM) return;
  // Botones magnéticos
  $$('.magnetic').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * MOTION.magnet, y: (e.clientY - r.top - r.height / 2) * MOTION.magnet, duration: .4, ease: MOTION.easeSoft }); });
    b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1,.4)' }));
  });
  // Tilt 3D + brillo que sigue al ratón (fotos y tarjetas)
  let last = null;
  const reset = t => { if (t) { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); } };
  document.addEventListener('mousemove', e => {
    const host = e.target.closest('.item, .card');
    const t = host && (host.classList.contains('item') ? host.firstElementChild : host);
    if (t !== last) { reset(last); last = t; }
    if (!t) return;
    const r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    t.style.setProperty('--rx', ((.5 - py) * MOTION.tilt).toFixed(2) + 'deg');
    t.style.setProperty('--ry', ((px - .5) * MOTION.tilt * 1.2).toFixed(2) + 'deg');
    t.style.setProperty('--mx', (px * 100) + '%'); t.style.setProperty('--my', (py * 100) + '%');
  });
}

/* ---------- 13. ARRANQUE ---------- */
async function boot() {
  fillStatic(); setLang(lang); buildShapes();
  if (ANIM) initAnimations();
  initCursor(); initMagneticAndTilt();
  runLoader();

  $('#empty').hidden = false; $('#empty').textContent = T('loading');
  try {
    const [imgs, vids] = await Promise.all([loadImages(), loadVideos()]);
    all = imgs;
    // Los vídeos con "position" (1 = primero) se insertan en esa posición; el resto, al final
    vids.filter(v => v.pos).sort((a, b) => a.pos - b.pos).forEach(v => all.splice(Math.min(v.pos - 1, all.length), 0, v));
    all.push(...vids.filter(v => !v.pos));
    renderGallery();
  } catch (err) {
    console.error(err);
    $('#empty').textContent = T('error');
  }
  // Recalcula el mosaico al redimensionar
  let raf; new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => shown.length && layout()); }).observe(bento);
}
boot();
