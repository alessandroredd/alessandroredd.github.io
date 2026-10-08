// Contenuti dimostrativi: sostituire testi e immagini con il portfolio definitivo.
const projects = [
  { slug: 'profilo', category: 'about', title: 'Alessandro Rossi: un profilo, una visione',
    description: 'Un’introduzione al percorso e alla visione personale di Alessandro Rossi.',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=85', alt: 'Microfono illuminato su uno sfondo scuro',
    paragraphs: ['Uno spazio dedicato al profilo di Alessandro Rossi: il percorso, le esperienze e le idee che danno forma al suo lavoro.', 'Questa pagina raccoglierà la biografia e le informazioni personali del portfolio.'] },
  { slug: 'storie-per-le-imprese', category: 'corporate', title: 'Storie e immagini per le imprese',
    description: 'Progetti, incontri e collaborazioni nel mondo della comunicazione corporate.',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85', alt: 'Spazio di lavoro luminoso con tavolo e sedute',
    paragraphs: ['Una selezione dedicata alle collaborazioni corporate e ai progetti di comunicazione.', 'Qui troveranno spazio i singoli lavori, con immagini, descrizioni e materiali di approfondimento.'] },
  { slug: 'book', category: 'book', title: 'Il book: ritratti, immagini e parole',
    description: 'Una raccolta visiva per conoscere il lavoro attraverso i suoi dettagli.',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1400&q=85', alt: 'Libro aperto con pagine in primo piano',
    paragraphs: ['Il book è uno spazio per una selezione di ritratti e materiali editoriali.', 'Immagini e contenuti definitivi saranno raccolti in questa pagina per essere consultati insieme.'] },
  { slug: 'la-scena', category: 'media', title: 'La scena, ogni volta',
    description: 'Un archivio di immagini, video e racconti. Il lavoro prende forma sullo schermo.',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=85', alt: 'Pellicola cinematografica in primo piano',
    paragraphs: ['Uno spazio dedicato ai contenuti video, alle interviste e ai materiali media.', 'Ogni progetto potrà essere accompagnato da un video e da una selezione di immagini.'] },
  { slug: 'identita', category: 'brand', title: 'Un linguaggio, un’identità',
    description: 'Visioni condivise e nuove collaborazioni. Il punto d’incontro tra persone e brand.',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1400&q=85', alt: 'Scena teatrale illuminata',
    paragraphs: ['Una sezione dedicata alle collaborazioni con i brand e alla costruzione di un linguaggio visivo condiviso.', 'Le campagne e i progetti saranno presentati attraverso le loro immagini e le storie che li accompagnano.'] },
  { slug: 'uno-spazio-nuovo', category: 'corporate', title: 'Uno spazio nuovo',
    description: 'Una prospettiva sui luoghi e sulle persone che rendono possibile un progetto.',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=85', alt: 'Interno di uno studio con ampie finestre',
    paragraphs: ['Un secondo progetto dimostrativo nella categoria Corporate.', 'Questa pagina potrà ospitare il racconto di una collaborazione, le immagini del progetto e i suoi approfondimenti.'] }
];
const hero = document.querySelector('.hero');
const header = document.querySelector('#site-header');
const latest = document.querySelector('#latest');
const grid = document.querySelector('#project-grid');
const projectResults = document.querySelector('#project-results');
const carouselPrevious = document.querySelector('#carousel-previous');
const carouselNext = document.querySelector('#carousel-next');
const detail = document.querySelector('#project-detail');
const searchInput = document.querySelector('#search-input');
const pills = [...document.querySelectorAll('.category-pill')];
const emptyState = document.querySelector('#empty-state');
const status = document.querySelector('#results-status');
const motion = window.portfolioMotion;
const mobileMenu = document.querySelector('#mobile-menu');
const cardCache = new Map();
let category = 'all';
let detailOpen = false;
let gridSignature = '';
let heroHeight = hero.offsetHeight;
let headerVisible = false;
let headerFrame = 0;
let routedURL = location.href;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const categoryHash = value => value === 'all' ? '#latest' : `#${value}`;
// ALL scorre orizzontalmente; le singole categorie conservano la griglia.
let carouselFrame = 0;
function updateCarouselControls() {
  carouselFrame = 0;
  const maximum = Math.max(0, grid.scrollWidth - grid.clientWidth);
  const available = category === 'all' && !detailOpen && maximum > 2;
  carouselPrevious.hidden = carouselNext.hidden = !available;
  carouselPrevious.disabled = grid.scrollLeft <= 2;
  carouselNext.disabled = grid.scrollLeft >= maximum - 2;
}
function scheduleCarouselControls() {
  if (!carouselFrame) carouselFrame = requestAnimationFrame(updateCarouselControls);
}
function scrollCarousel(direction) {
  const card = grid.firstElementChild;
  if (!card || category !== 'all' || detailOpen) return;
  const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
  grid.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: motion.reduced() ? 'instant' : 'smooth' });
}
carouselPrevious.addEventListener('click', () => scrollCarousel(-1));
carouselNext.addEventListener('click', () => scrollCarousel(1));
grid.addEventListener('scroll', scheduleCarouselControls, { passive: true });
grid.addEventListener('keydown', event => {
  if (event.target !== grid || category !== 'all' || detailOpen) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault(); scrollCarousel(event.key === 'ArrowLeft' ? -1 : 1);
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault();
    grid.scrollTo({ left: event.key === 'Home' ? 0 : grid.scrollWidth, behavior: motion.reduced() ? 'instant' : 'smooth' });
  }
});
new ResizeObserver(scheduleCarouselControls).observe(grid);
header.hidden = false;
header.inert = true;
header.setAttribute('aria-hidden', 'true');
function updateHeader() {
  const visible = window.scrollY >= heroHeight - 1;
  if (visible !== headerVisible) {
    headerVisible = visible;
    header.classList.toggle('is-visible', visible);
    header.inert = !visible;
    header.setAttribute('aria-hidden', String(!visible));
  }
  headerFrame = 0;
}
window.addEventListener('scroll', () => {
  if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
}, { passive: true });
window.addEventListener('resize', () => {
  heroHeight = hero.offsetHeight; updateHeader();
  if (innerWidth > 800 && mobileMenu.open) motion.closeDialog(mobileMenu);
});

// Pannello mobile laterale con sottopagine espandibili e ricerca sincronizzata.
const drawerNav = mobileMenu.querySelector('.drawer-nav');
document.querySelectorAll('#hero-nav > a').forEach((link, index) => {
  const group = document.createElement('div'); group.className = 'drawer-group';
  const row = document.createElement('div'); row.className = 'drawer-row';
  const anchor = document.createElement('a'); anchor.href = link.getAttribute('href'); anchor.textContent = link.textContent;
  row.append(anchor); group.append(row);
  const items = projects.filter(project => categoryHash(project.category) === anchor.getAttribute('href'));
  if (items.length) {
    const toggle = document.createElement('button'); toggle.className = 'drawer-toggle'; toggle.type = 'button'; toggle.textContent = '›';
    toggle.setAttribute('aria-label', `Mostra le pagine ${link.textContent}`); toggle.setAttribute('aria-expanded', 'false');
    const panel = document.createElement('div'); panel.className = 'drawer-submenu'; panel.id = `drawer-submenu-${index}`; panel.inert = true;
    const inner = document.createElement('div'); panel.append(inner); toggle.setAttribute('aria-controls', panel.id);
    items.forEach(project => {
      const pageLink = document.createElement('a'); pageLink.href = `#page/${project.slug}`; pageLink.textContent = project.title; inner.append(pageLink);
    });
    toggle.addEventListener('click', () => {
      const open = panel.classList.toggle('is-expanded'); panel.inert = !open; toggle.setAttribute('aria-expanded', String(open));
    });
    row.append(toggle); group.append(panel);
  }
  drawerNav.append(group);
});
document.querySelectorAll('.menu-button').forEach(button => {
  button.setAttribute('aria-controls', 'mobile-menu'); button.setAttribute('aria-haspopup', 'dialog');
  button.addEventListener('click', () => {
    document.querySelector('#drawer-search-input').value = searchInput.value;
    button.setAttribute('aria-expanded', 'true'); motion.openDialog(mobileMenu);
    [...drawerNav.children].forEach((row, index) => {
      if (!motion.reduced()) row.animate([{ opacity: 0, transform: 'translateY(-12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350, delay: 90 + index * 35, fill: 'backwards', easing: 'cubic-bezier(.215,.61,.355,1)' });
    });
  });
});
motion.initDialog(mobileMenu);
mobileMenu.addEventListener('close', () => document.querySelectorAll('.menu-button').forEach(button => button.setAttribute('aria-expanded', 'false')));
mobileMenu.querySelector('.drawer-search').addEventListener('submit', async event => {
  event.preventDefault(); searchInput.value = document.querySelector('#drawer-search-input').value;
  await motion.closeDialog(mobileMenu);
  navigate('#latest'); searchInput.focus({ preventScroll: true });
});
function makeCard(project) {
  const card = document.createElement('article');
  card.className = 'project-card';
  const imageLink = document.createElement('a');
  imageLink.className = 'card-image';
  imageLink.href = `#page/${project.slug}`;
  imageLink.setAttribute('aria-label', `Apri ${project.title}`);
  const image = document.createElement('img');
  image.src = project.image; image.alt = project.alt; image.loading = 'lazy'; image.width = 1400; image.height = 778;
  imageLink.append(image);
  const heading = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = imageLink.href; titleLink.textContent = project.title;
  heading.append(titleLink);
  const description = document.createElement('p');
  description.textContent = project.description;
  const tag = document.createElement('a');
  tag.className = 'card-category'; tag.href = categoryHash(project.category); tag.textContent = project.category.toUpperCase();
  card.append(imageLink, heading, description, tag);
  return card;
}
function renderGrid() {
  const query = searchInput.value.trim().toLocaleLowerCase('it');
  const visible = projects.filter(project => (category === 'all' || project.category === category) && `${project.title} ${project.description} ${project.category}`.toLocaleLowerCase('it').includes(query));
  const signature = `${category}|${query}|${visible.map(project => project.slug).join(',')}`;
  const carousel = category === 'all';
  projectResults.classList.toggle('is-carousel', carousel);
  projectResults.hidden = detailOpen || visible.length === 0;
  if (carousel) {
    grid.tabIndex = 0;
    grid.setAttribute('role', 'region');
    grid.setAttribute('aria-label', 'Tutti i progetti. Usa le frecce per scorrere la carrellata.');
    grid.setAttribute('aria-roledescription', 'carrellata');
  } else {
    grid.removeAttribute('tabindex'); grid.removeAttribute('role');
    grid.removeAttribute('aria-label'); grid.removeAttribute('aria-roledescription');
  }
  grid.replaceChildren(...visible.map((project, index) => {
    if (!cardCache.has(project.slug)) {
      const card = makeCard(project); cardCache.set(project.slug, card); motion.reveal(card, (index % 2) * 85);
    }
    return cardCache.get(project.slug);
  }));
  grid.hidden = detailOpen;
  if (gridSignature !== signature) grid.scrollTo({ left: 0, behavior: 'instant' });
  carouselPrevious.hidden = carouselNext.hidden = true;
  scheduleCarouselControls();
  if (!detailOpen && gridSignature && gridSignature !== signature) motion.enter(grid, 8, 350);
  gridSignature = signature;
  emptyState.hidden = detailOpen || visible.length > 0;
  status.textContent = detailOpen ? 'Pagina del progetto aperta.' : `${visible.length} ${visible.length === 1 ? 'scheda disponibile' : 'schede disponibili'}.`;
  pills.forEach(pill => {
    if (pill.dataset.category === category) pill.setAttribute('aria-current', 'true');
    else pill.removeAttribute('aria-current');
  });
}
function renderDetail(project) {
  detailOpen = true; detail.hidden = false;
  document.querySelector('#detail-category').textContent = project.category.toUpperCase();
  document.querySelector('#detail-title').textContent = project.title;
  const image = document.querySelector('#detail-image');
  image.src = project.image; image.alt = project.alt;
  document.querySelector('#detail-copy').replaceChildren(...project.paragraphs.map(text => {
    const paragraph = document.createElement('p'); paragraph.textContent = text; return paragraph;
  }));
  document.querySelector('#back-link').href = categoryHash(category);
  document.title = `${project.title} — Alessandro Rossi`;
  renderGrid();
  motion.enter(detail, 18, 500);
}
function showRoute(scroll = true) {
  const route = window.location.hash.slice(1);
  if (route === 'footer') {
    if (!grid.childElementCount && !detailOpen) renderGrid();
    if (scroll) motion.scrollTo(document.querySelector('#footer'));
    return;
  }
  const project = route.startsWith('page/') ? projects.find(item => item.slug === route.slice(5)) : null;
  if (project) {
    renderDetail(project);
    if (scroll) { motion.scrollTo(detail); detail.focus({ preventScroll: true }); }
  } else {
    detailOpen = false; detail.hidden = true;
    category = pills.some(pill => pill.dataset.category === route) ? route : 'all';
    document.title = 'Alessandro Rossi'; renderGrid();
    if (scroll) {
      if (!route || route === 'home') motion.scrollTo(hero);
      else motion.scrollTo(latest);
    }
  }
}
document.querySelector('.search').addEventListener('submit', event => event.preventDefault());
searchInput.addEventListener('input', () => {
  if (detailOpen) {
    detailOpen = false; detail.hidden = true;
    history.replaceState(null, '', categoryHash(category)); document.title = 'Alessandro Rossi';
  }
  renderGrid();
});
function saveView() {
  history.replaceState({ portfolio: { scrollY, category, query: searchInput.value } }, '', location.href);
}
function navigate(hash) {
  saveView();
  if (hash !== location.hash) history.pushState(null, '', hash);
  showRoute();
  routedURL = location.href;
}
document.addEventListener('click', async event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const hash = link.getAttribute('href');
  if (mobileMenu.open) await motion.closeDialog(mobileMenu);
  navigate(hash);
});
window.addEventListener('hashchange', () => {
  if (location.href !== routedURL) { showRoute(); routedURL = location.href; }
});
window.addEventListener('popstate', event => {
  const saved = event.state?.portfolio;
  if (saved) { searchInput.value = saved.query; category = saved.category; }
  showRoute(false);
  if (saved) motion.scrollTo(saved.scrollY);
  else showRoute();
  routedURL = location.href;
});
showRoute(false);
if (window.location.hash && window.location.hash !== '#home') requestAnimationFrame(() => showRoute());
updateHeader();
motion.enter(document.querySelector('.topbar'), 8, 850);
document.querySelectorAll('.featured-link, .latest-title, .browse-toolbar, .footer-newsletter, .footer-column, .footer-bottom').forEach((element, index) => motion.reveal(element, (index % 3) * 70));

// Collegare i servizi e i riferimenti ufficiali prima di attivare le iscrizioni.
document.querySelector('#copyright-year').textContent = new Intl.DateTimeFormat('it-IT', {
  year: 'numeric', timeZone: 'Europe/Rome'
}).format(new Date());
document.querySelector('#newsletter-form').addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#newsletter-status').textContent = 'Le iscrizioni apriranno a breve. La tua email non è stata inviata.';
  motion.enter(document.querySelector('#newsletter-status'), 4, 250);
});
document.querySelector('#footer-search').addEventListener('click', () => {
  requestAnimationFrame(() => searchInput.focus({ preventScroll: true }));
});
const footerInformation = {
  contact: ['Contatti', 'I riferimenti ufficiali per contattare Alessandro Rossi saranno disponibili a breve.'],
  privacy: ['Privacy Policy', 'L’informativa sulla privacy sarà pubblicata insieme all’attivazione della newsletter.'],
  cookies: ['Cookie', 'Le informazioni sui cookie saranno disponibili con la versione definitiva del sito.'],
  terms: ['Note legali', 'Le note legali del sito di Alessandro Rossi sono in preparazione.'],
  credits: ['Crediti', 'Portfolio di Alessandro Rossi. Le immagini attuali sono dimostrative e provengono da Unsplash; saranno sostituite con i materiali ufficiali.'],
  facebook: ['Facebook', 'Il profilo Facebook ufficiale di Alessandro Rossi sarà collegato qui.'],
  instagram: ['Instagram', 'Il profilo Instagram ufficiale di Alessandro Rossi sarà collegato qui.']
};
const footerDialog = document.querySelector('#footer-dialog');
document.querySelectorAll('[data-footer-info]').forEach(button => {
  button.addEventListener('click', () => {
    const [title, text] = footerInformation[button.dataset.footerInfo];
    document.querySelector('#footer-dialog-title').textContent = title;
    document.querySelector('#footer-dialog-text').textContent = text;
    motion.openDialog(footerDialog);
  });
});
motion.initDialog(footerDialog);
const imageDialog = document.querySelector('#image-dialog');
motion.initDialog(imageDialog);
document.querySelector('#image-open').addEventListener('click', () => {
  const source = document.querySelector('#detail-image');
  const image = document.querySelector('#lightbox-image'); image.src = source.src; image.alt = source.alt;
  document.querySelector('#lightbox-caption').textContent = document.querySelector('#detail-title').textContent;
  imageDialog.classList.remove('is-zoomed');
  const zoomButton = imageDialog.querySelector('.lightbox-zoom');
  zoomButton.setAttribute('aria-pressed', 'false'); zoomButton.setAttribute('aria-label', 'Ingrandisci immagine'); zoomButton.textContent = '+';
  motion.openDialog(imageDialog);
});
function toggleZoom() {
  const zoomed = imageDialog.classList.toggle('is-zoomed');
  const button = imageDialog.querySelector('.lightbox-zoom');
  button.setAttribute('aria-pressed', String(zoomed)); button.setAttribute('aria-label', zoomed ? 'Riduci immagine' : 'Ingrandisci immagine'); button.textContent = zoomed ? '−' : '+';
}
imageDialog.querySelector('.lightbox-zoom').addEventListener('click', toggleZoom);
document.querySelector('#lightbox-image').addEventListener('click', toggleZoom);
window.addEventListener('pageshow', event => {
  if (event.persisted) updateHeader();
});
