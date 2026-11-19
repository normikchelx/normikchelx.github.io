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

function detectBrowserLanguage() {
  const rawLangs = Array.isArray(navigator.languages) && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language || navigator.userLanguage || 'en'];

  const configKeys = Object.keys(langConfig);
  const lowerMap = new Map(configKeys.map(k => [k.toLowerCase(), k]));

  for (const raw of rawLangs) {
    if (!raw || typeof raw !== 'string') continue;
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
  }

  return 'en';
}

document.addEventListener('DOMContentLoaded', () => {
  initCustomDropdowns();
  initTheme();
  initLanguage();
  initEmailCopy();

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
  const initialLang = detectBrowserLanguage();
  localStorage.removeItem('normik-lang');
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
      updateLangUI(code);
      langDropdown.classList.remove('open');
      langDropdown.querySelector('.dropdown-trigger').setAttribute('aria-expanded', 'false');
      await loadAndApplyLang(code);
    });

    langMenu.appendChild(btn);
  }

  updateLangUI(initialLang);
  loadAndApplyLang(initialLang);
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
  }
}

function applyLang(data) {
  currentLangData = data;
  if (data.pageTitle) {
    document.title = data.pageTitle;
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (data[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = data[key];
      } else {
        el.textContent = data[key];
      }
    }
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
