const langFiles = {
    en: './lang/en.json',
    ru: './lang/ru.json',
    uk: './lang/uk.json',
    be: './lang/be.json',
    tt: './lang/tt.json',
    ba: './lang/ba.json',
    cv: './lang/cv.json',
    ce: './lang/ce.json',
    kv: './lang/kv.json',
    av: './lang/av.json',
    os: './lang/os.json'
};

let currentLang = 'en';

async function loadLang(lang) {
    try {
        const res = await fetch(langFiles[lang]);
        if (!res.ok) throw new Error(`Failed to load \${lang}`);
        return await res.json();
    } catch (e) {
        console.error(e);
        return {};
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

async function init() {
    const saved = localStorage.getItem('normik-lang') || 'en';
    currentLang = saved;

    const data = await loadLang(currentLang);
    applyLang(data);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const lang = btn.dataset.lang;
            currentLang = lang;
            localStorage.setItem('normik-lang', lang);

            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const newData = await loadLang(lang);
            applyLang(newData);
        });
    });
}

init();