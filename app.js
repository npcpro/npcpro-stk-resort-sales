const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('#nav');
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));
const dialog=document.querySelector('#lightbox');
const expanded=dialog.querySelector('img');
document.querySelectorAll('[data-full]').forEach(button=>button.addEventListener('click',()=>{expanded.src=button.dataset.full;expanded.alt=button.querySelector('img').alt;dialog.showModal()}));
dialog.querySelector('button').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});

const languageButtons = [...document.querySelectorAll('[data-language]')];
const languageColumns = { 'en-US': 0, 'zh-CN': 1 };
const thaiText = /[\u0e00-\u0e7f]/;
const localizedText = [];
const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
while (walker.nextNode()) {
  const node = walker.currentNode;
  if (!node.parentElement.closest('.language-switch, script, style') && thaiText.test(node.data)) {
    localizedText.push({ node, original: node.data });
  }
}
const localizedAttributes = [];
for (const element of document.querySelectorAll('[alt], [aria-label], [title], meta[content]')) {
  if (element.closest('.language-switch')) continue;
  for (const attribute of ['alt', 'aria-label', 'title', 'content']) {
    const original = element.getAttribute(attribute);
    if (original && thaiText.test(original)) localizedAttributes.push({ element, attribute, original });
  }
}

function translate(original, column) {
  const key = original.trim();
  const translation = translations[key]?.[column];
  return translation ? original.replace(key, () => translation) : original;
}

function setLanguage(language) {
  document.documentElement.lang = language;
  const column = languageColumns[language];
  for (const { node, original } of localizedText) node.data = translate(original, column);
  for (const { element, attribute, original } of localizedAttributes) {
    element.setAttribute(attribute, translate(original, column));
  }
  for (const button of languageButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  }
}

const requestedLanguage = new URLSearchParams(location.search).get('lang');
setLanguage(languageButtons.some(button => button.dataset.language === requestedLanguage) ? requestedLanguage : 'th');
for (const button of languageButtons) {
  button.addEventListener('click', () => {
    const language = button.dataset.language;
    setLanguage(language);
    const url = new URL(location.href);
    if (language === 'th') url.searchParams.delete('lang');
    else url.searchParams.set('lang', language);
    try { history.replaceState(null, '', url); } catch { /* Local file previews can restrict URL changes. */ }
  });
}
