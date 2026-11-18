const langConfig = {
  av: 'Авар мацӀ',
  ba: 'Башҡортса',
  be: 'Беларуская',
  ce: 'Нохчийн',
  cv: 'Чӑвашла',
  en: 'English',
  kk: 'Қазақша',
  kv: 'Коми',
  os: 'Ирон ӕвзаг',
  ru: 'Русский',
  tt: 'Татарча',
  uk: 'Українська'
};

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
  const savedLang = localStorage.getItem('normik-lang') || 'en';
  const initialLang = langConfig[savedLang] ? savedLang : 'en';
  const langDropdown = document.getElementById('lang-dropdown');
  const langMenu = document.getElementById('lang-menu');

  for (const [code, name] of sortedLangs) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dropdown-item';
    btn.setAttribute('role', 'option');
    btn.dataset.value = code;
    if (code === initialLang) btn.classList.add('active');

    btn.innerHTML = `
      <span class="dropdown-item-left">
        <span class="lang-code-badge">${code.toUpperCase()}</span>
        <span>${name}</span>
      </span>
    `;

    btn.addEventListener('click', async () => {
      localStorage.setItem('normik-lang', code);
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
  document.documentElement.lang = code;
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
    const response = await fetch(`lang/${lang}.json?v=3`);

    if (!response.ok) {
      console.warn(`Translation file for ${lang} not found, falling back to EN.`);
      if (lang !== 'en') {
        const enRes = await fetch('lang/en.json?v=3');
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
