// Конфигурация языков
// Ключи - это коды языков (be, ru, en и т.д.)
// Значения - это отображаемые названия в дропдауне
const langConfig = {
    en: 'English',
    ru: 'Русский',
    uk: 'Українська',
    be: 'Беларуская', // Исправлено с BY на BE
    tt: 'Татарча',
    ba: 'Башҡортса',
    cv: 'Чӑвашла',
    ce: 'Нохчийн',
    kv: 'Коми',
    av: 'Авар мацӀ',
    os: 'Ирон ӕвзаг'
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
});

// --- ЛОГИКА ТЕМ ---
function initTheme() {
    const savedTheme = localStorage.getItem('normik-theme') || 'system';
    setTheme(savedTheme);
    
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) {
        themeSelector.value = savedTheme;
        themeSelector.addEventListener('change', (e) => {
            const selected = e.target.value;
            localStorage.setItem('normik-theme', selected);
            setTheme(selected);
        });
    }
}

function setTheme(theme) {
    const body = document.body;
    body.className = ''; // Сброс классов
    
    if (theme === 'light') {
        body.classList.add('theme-light');
    } else if (theme === 'dark') {
        body.classList.add('theme-dark');
    }
    // Если 'system', классы не добавляем, работают медиа-запросы CSS
}

// --- ЛОГИКА ЯЗЫКОВ ---
function initLanguage() {
    const savedLang = localStorage.getItem('normik-lang') || 'en';
    const langSelector = document.getElementById('lang-selector');
    
    // 1. Динамическое заполнение дропдауна
    if (langSelector) {
        for (const [code, name] of Object.entries(langConfig)) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${code.toUpperCase()} - ${name}`;
            langSelector.appendChild(option);
        }
        langSelector.value = savedLang;
        
        // 2. Обработка смены языка
        langSelector.addEventListener('change', async (e) => {
            const selectedLang = e.target.value;
            localStorage.setItem('normik-lang', selectedLang);
            
            // 3. Смена атрибута lang в HTML
            document.documentElement.lang = selectedLang;
            
            // 4. Загрузка и применение перевода
            await loadAndApplyLang(selectedLang);
        });
    }
    
    // Загрузка начального языка
    loadAndApplyLang(savedLang);
}

async function loadAndApplyLang(lang) {
    try {
        // Формируем путь к файлу
        const response = await fetch(`lang/\${lang}.json`);
        
        if (!response.ok) {
            console.warn(`Файл перевода для \${lang} не найден, используем EN.`);
            // Если файла нет, пробуем загрузить EN
            const enRes = await fetch('lang/en.json');
            const enData = await enRes.json();
            applyLang(enData);
            return;
        }
        
        const data = await response.json();
        applyLang(data);
    } catch (error) {
        console.error('Ошибка загрузки языка:', error);
    }
}

function applyLang(data) {
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