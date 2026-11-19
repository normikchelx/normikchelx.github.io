const langConfig = {
  as: 'অসমীয়া',
  av: 'Авар мацӀ',
  ay: 'Aymar aru',
  ba: 'Башҡортса',
  be: 'Беларуская',
  bn: 'বাংলা',
  bo: 'བོད་སྐད།',
  brx: 'बड़ो',
  ce: 'Нохчийн',
  chr: 'ᏣᎳᎩ',
  cv: 'Чӑвашла',
  doi: 'डोगरी',
  en: 'English',
  gn: 'Avañe’ẽ',
  gu: 'ગુજરાતી',
  hak: '客家話',
  hi: 'हिन्दी',
  iu: 'ᐃᓄᒃᑎᑐᑦ',
  kk: 'Қазақша',
  kn: 'ಕನ್ನಡ',
  ko: '한국어',
  kok: 'कोंकणी',
  ks: 'کٲشُر',
  kv: 'Коми',
  mai: 'मैथिली',
  ml: 'മലയാളം',
  'mn-Mong': 'ᠮᠣᠩᠭᠣᠯ',
  mni: 'ꯃꯩꯇꯩꯂꯣꯟ',
  mr: 'मराठी',
  nan: '臺灣話',
  ne: 'नेपाली',
  or: 'ଓଡ଼ିଆ',
  os: 'Ирон ӕвзаг',
  pa: 'ਪੰਜਾਬੀ',
  qu: 'Runasimi',
  ru: 'Русский',
  sa: 'संस्कृतम्',
  sat: 'ᱥᱟᱱᱛᱟᱲᱤ',
  sd: 'سنڌي',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  tt: 'Татарча',
  ug: 'ئۇيغۇرچە',
  uk: 'Українська',
  ur: 'اردو',
  wuu: '吳語',
  yue: '粵語',
  za: 'Vahcuengh',
  'zh-CN': '普通话',
  'zh-SG': '华语',
  'zh-TW': '國語'
};

const STORAGE_KEYS = {
  USER_SELECTED_LANG: 'normik-lang',
  LAST_BROWSER_LANG: 'LAST_BROWSER_LANG'
};

const rtlLangs = new Set(['ks', 'sd', 'ug', 'ur']);

const sortedLangs = Object.entries(langConfig).sort(([codeA], [codeB]) =>
  codeA.localeCompare(codeB)
);

const themeIcons = {
  system: '🖥️',
  light: '☀️',
  dark: '🌙'
};

const themeKeyMap = {
  system: 'systemTitle',
  light: 'lightTitle',
  dark: 'darkTitle'
};

let currentLangData = {};
let lenisInstance = null;

/* =========================================================
   1. TOP PROGRESS BAR (Загрузка страницы + прогресс скролла)
   ========================================================= */
const TopBar = (() => {
  let loadEl = null;
  let scrollEl = null;
  let loadTimer = null;

  function ensureElements() {
    if (!loadEl) {
      loadEl = document.createElement('div');
      loadEl.id = 'top-load-bar';
      document.body.appendChild(loadEl);
    }
    if (!scrollEl) {
      scrollEl = document.createElement('div');
      scrollEl.id = 'top-scroll-bar';
      document.body.appendChild(scrollEl);
    }
  }

  function startLoad() {
    ensureElements();
    clearTimeout(loadTimer);
    loadEl.classList.remove('done');
    loadEl.style.transition = 'none';
    loadEl.style.transform = 'scaleX(0)';
    loadEl.style.opacity = '1';

    void loadEl.offsetWidth;

    loadEl.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
    loadEl.style.transform = 'scaleX(0.72)';

    loadTimer = setTimeout(() => {
      loadEl.style.transition = 'transform 2.5s cubic-bezier(0.1, 0.5, 0.2, 1)';
      loadEl.style.transform = 'scaleX(0.92)';
    }, 450);
  }

  function finishLoad() {
    ensureElements();
    clearTimeout(loadTimer);
    loadEl.style.transition = 'transform 0.25s ease-out';
    loadEl.style.transform = 'scaleX(1)';

    loadTimer = setTimeout(() => {
      loadEl.style.transition = 'opacity 0.3s ease';
      loadEl.style.opacity = '0';
      setTimeout(() => {
        loadEl.style.transform = 'scaleX(0)';
      }, 300);
    }, 260);
  }

  function updateScrollProgress() {
    if (!scrollEl) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
    scrollEl.style.transform = `scaleX(${progress})`;
  }

  function init() {
    ensureElements();
    startLoad();

    if (document.readyState === 'complete') {
      finishLoad();
    } else {
      window.addEventListener('load', finishLoad, { once: true });
    }

    window.addEventListener('beforeunload', () => {
      startLoad();
    });

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });
    updateScrollProgress();
  }

  return { init, startLoad, finishLoad, updateScrollProgress };
})();

/* =========================================================
   2. LENIS SMOOTH SCROLL (Подключение с CDN и автозапуск)
   ========================================================= */
function initLenis() {
  const startLenis = () => {
    if (typeof window.Lenis === 'undefined') return;

    lenisInstance = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5
    });

    lenisInstance.on('scroll', () => {
      TopBar.updateScrollProgress();
    });

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  };

  if (typeof window.Lenis !== 'undefined') {
    startLenis();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://unpkg.com/lenis@1.1.18/dist/lenis.min.js';
  script.async = true;
  script.onload = startLenis;
  script.onerror = () => {
    console.warn('Lenis CDN unavailable, using native smooth scroll.');
  };
  document.head.appendChild(script);
}

/* =========================================================
   3. ЛОКАЛИЗАЦИЯ КАК В GETTR
   ========================================================= */
function matchSupportedLang(raw) {
  if (!raw || typeof raw !== 'string') return null;

  const configKeys = Object.keys(langConfig);
  const lowerMap = new Map(configKeys.map(k => [k.toLowerCase(), k]));
  const normalized = raw.trim().replace(/_/g, '-');
  const lower = normalized.toLowerCase();

  if (lowerMap.has(lower)) {
    return lowerMap.get(lower);
  }

  if (lower.startsWith('zh')) {
    if (lower.includes('tw') || lower.includes('hk') || lower.includes('mo') || lower.includes('hant')) {
      if (lowerMap.has('zh-tw')) return 'zh-TW';
    }
    if (lower.includes('sg') || lower.includes('my')) {
      if (lowerMap.has('zh-sg')) return 'zh-SG';
    }
    if (lowerMap.has('zh-cn')) return 'zh-CN';
  }

  if (lower.startsWith('mn')) {
    if (lower.includes('mong') && lowerMap.has('mn-mong')) {
      return 'mn-Mong';
    }
  }

  const baseCode = lower.split('-')[0];
  if (lowerMap.has(baseCode)) {
    return lowerMap.get(baseCode);
  }

  return null;
}

function getBrowserLanguage() {
  const rawLangs = Array.isArray(navigator.languages) && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language || navigator.userLanguage || 'en'];

  for (const raw of rawLangs) {
    const matched = matchSupportedLang(raw);
    if (matched) return matched;
  }

  return 'en';
}

function resolveInitialLanguage() {
  const currentBrowserLang = getBrowserLanguage();
  const lastBrowserLang = localStorage.getItem(STORAGE_KEYS.LAST_BROWSER_LANG);
  const savedUserLang = matchSupportedLang(localStorage.getItem(STORAGE_KEYS.USER_SELECTED_LANG));

  if (lastBrowserLang && lastBrowserLang !== currentBrowserLang) {
    localStorage.setItem(STORAGE_KEYS.LAST_BROWSER_LANG, currentBrowserLang);
    localStorage.setItem(STORAGE_KEYS.USER_SELECTED_LANG, currentBrowserLang);
    return currentBrowserLang;
  }

  if (!lastBrowserLang) {
    localStorage.setItem(STORAGE_KEYS.LAST_BROWSER_LANG, currentBrowserLang);
  }

  if (savedUserLang) {
    return savedUserLang;
  }

  localStorage.setItem(STORAGE_KEYS.USER_SELECTED_LANG, currentBrowserLang);
  return currentBrowserLang;
}

/* =========================================================
   4. ДИНАМИЧЕСКИЙ ГОД (2027 С ЗАПАСОМ И АВТООБНОВЛЕНИЕМ)
   ========================================================= */
function updateCopyrightYear() {
  const targetYear = Math.max(2027, new Date().getFullYear());
  document.querySelectorAll('[data-year], .copyright-year, footer').forEach(el => {
    if (el.hasAttribute('data-year') || el.classList.contains('copyright-year')) {
      el.textContent = String(targetYear);
    } else if (el.tagName === 'FOOTER') {
      el.innerHTML = el.innerHTML.replace(/202[0-6]/g, String(targetYear));
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  TopBar.init();
  initLenis();
  initCustomDropdowns();
  initTheme();
  initLanguage();
  initEmailCopy();
  updateCopyrightYear();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-transition');
    });
  });
});

function initCustomDropdowns() {
  const dropdowns = document.querySelectorAll('.custom-dropdown');

  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.dropdown-menu');
    const pill = menu.querySelector('.hover-pill');

    menu.setAttribute('data-lenis-prevent', '');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');

      dropdowns.forEach(d => {
        d.classList.remove('open');
        d.querySelector('.dropdown-trigger').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        dropdown.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        const activeItem = menu.querySelector('.dropdown-item.active');
        if (activeItem) {
          movePillToItem(menu, pill, activeItem);
        }
      }
    });

    menu.addEventListener('mouseover', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (item && menu.contains(item)) {
        movePillToItem(menu, pill, item);
      }
    });

    menu.addEventListener('mouseleave', () => {
      const activeItem = menu.querySelector('.dropdown-item.active');
      if (activeItem) {
        movePillToItem(menu, pill, activeItem);
      } else {
        pill.style.opacity = '0';
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown')) {
      dropdowns.forEach(d => {
        d.classList.remove('open');
        d.querySelector('.dropdown-trigger').setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdowns.forEach(d => {
        d.classList.remove('open');
        d.querySelector('.dropdown-trigger').setAttribute('aria-expanded', 'false');
      });
    }
  });
}

function movePillToItem(menu, pill, item) {
  if (!pill || !item) return;
  const top = item.offsetTop;
  const height = item.offsetHeight;
  pill.style.height = `${height}px`;
  pill.style.transform = `translateY(${top}px)`;
  pill.style.opacity = '1';
}

function initTheme() {
  const savedTheme = localStorage.getItem('normik-theme') || 'system';
  const themeDropdown = document.getElementById('theme-dropdown');
  const items = themeDropdown.querySelectorAll('.dropdown-item');

  setTheme(savedTheme);

  items.forEach(item => {
    item.addEventListener('click', () => {
      const selected = item.dataset.value;
      localStorage.setItem('normik-theme', selected);
      setTheme(selected);
      themeDropdown.classList.remove('open');
      themeDropdown.querySelector('.dropdown-trigger').setAttribute('aria-expanded', 'false');
    });
  });
}

function setTheme(theme) {
  const validTheme = themeIcons[theme] ? theme : 'system';
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark');

  if (validTheme === 'light') {
    root.classList.add('theme-light');
  } else if (validTheme === 'dark') {
    root.classList.add('theme-dark');
  }

  const iconEl = document.getElementById('theme-current-icon');
  const labelEl = document.getElementById('theme-current-label');
  const i18nKey = themeKeyMap[validTheme];

  if (iconEl) iconEl.textContent = themeIcons[validTheme];
  if (labelEl) {
    labelEl.setAttribute('data-i18n', i18nKey);
    if (currentLangData[i18nKey]) {
      labelEl.textContent = currentLangData[i18nKey];
    }
  }

  const themeDropdown = document.getElementById('theme-dropdown');
  themeDropdown.querySelectorAll('.dropdown-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === validTheme);
  });
}

function initLanguage() {
  const initialLang = resolveInitialLanguage();
  const langDropdown = document.getElementById('lang-dropdown');
  const langMenu = document.getElementById('lang-menu');

  for (const [code, name] of sortedLangs) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dropdown-item';
    btn.setAttribute('role', 'option');
    btn.dataset.value = code;
    if (code === initialLang) btn.classList.add('active');

    const nameClass = code === 'mn-Mong' ? ' class="lang-native-vertical"' : '';

    btn.innerHTML = `
      <span class="dropdown-item-left">
        <span class="lang-code-badge">${code.toUpperCase()}</span>
        <span${nameClass}>${name}</span>
      </span>
    `;

    btn.addEventListener('click', async () => {
      localStorage.setItem(STORAGE_KEYS.USER_SELECTED_LANG, code);
      updateLangUI(code);
      langDropdown.classList.remove('open');
      langDropdown.querySelector('.dropdown-trigger').setAttribute('aria-expanded', 'false');
      await loadAndApplyLang(code);
    });

    langMenu.appendChild(btn);
  }

  updateLangUI(initialLang);
  loadAndApplyLang(initialLang);

  window.addEventListener('languagechange', async () => {
    const updatedBrowserLang = getBrowserLanguage();
    localStorage.setItem(STORAGE_KEYS.LAST_BROWSER_LANG, updatedBrowserLang);
    localStorage.setItem(STORAGE_KEYS.USER_SELECTED_LANG, updatedBrowserLang);
    updateLangUI(updatedBrowserLang);
    await loadAndApplyLang(updatedBrowserLang);
  });
}

function updateLangUI(code) {
  const root = document.documentElement;
  root.lang = code;
  root.dir = rtlLangs.has(code) ? 'rtl' : 'ltr';
  root.classList.toggle('lang-vertical', code === 'mn-Mong');

  const labelEl = document.getElementById('lang-current-label');
  if (labelEl) {
    labelEl.textContent = code.toUpperCase();
  }

  const langMenu = document.getElementById('lang-menu');
  langMenu.querySelectorAll('.dropdown-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === code);
  });
}

async function loadAndApplyLang(lang) {
  TopBar.startLoad();
  try {
    const response = await fetch(`lang/${lang}.json?v=5`);

    if (!response.ok) {
      console.warn(`Translation file for ${lang} not found, falling back to EN.`);
      if (lang !== 'en') {
        const enRes = await fetch('lang/en.json?v=5');
        if (enRes.ok) {
          const enData = await enRes.json();
          applyLang(enData);
        }
      }
      return;
    }

    const data = await response.json();
    applyLang(data);
  } catch (error) {
    console.error('Error loading language file:', error);
  } finally {
    TopBar.finishLoad();
  }
}

function applyLang(data) {
  currentLangData = data;
  const targetYear = Math.max(2027, new Date().getFullYear());

  if (data.pageTitle) {
    document.title = data.pageTitle.replace(/202[0-6]/g, String(targetYear));
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (data[key]) {
      const value = String(data[key]).replace(/202[0-6]/g, String(targetYear));
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = value;
      } else {
        el.textContent = value;
      }
    }
  });

  updateCopyrightYear();

  requestAnimationFrame(() => {
    TopBar.updateScrollProgress();
  });
}

function initEmailCopy() {
  const emailCard = document.getElementById('email-card');
  const toast = document.getElementById('toast');
  if (!emailCard || !toast) return;

  emailCard.addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('nenormikchel@gmail.com').then(() => {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
      });
    }
  });
}
