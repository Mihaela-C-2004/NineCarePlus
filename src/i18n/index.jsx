import { useSyncExternalStore } from 'react';
import { EN, PATTERNS } from './en.js';

/**
 * Limba aplicației: română (implicit) sau engleză.
 * Componentele sunt scrise în română. Când limba e engleza, un traducător înlocuiește
 * textele afișate pe ecran folosind dicționarul din en.js, iar la revenirea pe română
 * le pune la loc pe cele originale. Conținutul (articole, cursuri, oferte) vine direct
 * în engleză de la server.
 */
const KEY = '9care.lang';
let lang = (typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) || 'ro';
const listeners = new Set();

export const getLang = () => lang;
export const isEn = () => lang === 'en';

export function setLang(next) {
  lang = next;
  localStorage.setItem(KEY, next);
  document.documentElement.lang = next;
  translateTree(document.body);
  listeners.forEach((fn) => fn());
}

export function useLang() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getLang
  );
}

/** Alege textul potrivit limbii, pentru locurile în care componenta construiește singură fraza. */
export const tr = (ro, en) => (lang === 'en' ? en : ro);

export function LangToggle() {
  const current = useLang();
  return (
    <button
      className="icon-btn lang-toggle"
      onClick={() => setLang(current === 'en' ? 'ro' : 'en')}
      aria-label={current === 'en' ? 'Schimbă în română' : 'Switch to English'}
      title={current === 'en' ? 'Română' : 'English'}
      data-i18n-skip
    >
      {current === 'en' ? 'RO' : 'EN'}
    </button>
  );
}

// ---------- Traducătorul ----------
const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
const textMemory = new WeakMap(); // nod text -> { ro, en }
const attrMemory = new WeakMap(); // element -> { atribut: { ro, en } }
const LETTER = /[A-Za-zĂÂÎȘȚăâîșț]/;

function translateString(str) {
  if (!str || !LETTER.test(str)) return null;
  const core = str.trim();
  let out = EN[core];
  if (out === undefined) {
    for (const [re, rep] of PATTERNS) {
      if (re.test(core)) {
        out = core.replace(re, rep);
        break;
      }
    }
  }
  if (out === undefined) return null;
  return str.slice(0, str.indexOf(core)) + out + str.slice(str.indexOf(core) + core.length);
}

const skipped = (el) => el?.closest?.('[data-i18n-skip], textarea, script, style');

function translateText(node) {
  if (skipped(node.parentElement)) return;
  const memo = textMemory.get(node);
  if (lang === 'en') {
    if (memo && node.data === memo.en) return;
    const out = translateString(node.data);
    if (out !== null && out !== node.data) {
      textMemory.set(node, { ro: node.data, en: out });
      node.data = out;
    }
  } else if (memo) {
    if (node.data === memo.en) node.data = memo.ro;
    textMemory.delete(node);
  }
}

function translateAttr(el, attr) {
  if (!el.hasAttribute?.(attr) || skipped(el.parentElement) || el.hasAttribute('data-i18n-skip')) return;
  const all = attrMemory.get(el) || {};
  const memo = all[attr];
  const value = el.getAttribute(attr);
  if (lang === 'en') {
    if (memo && value === memo.en) return;
    const out = translateString(value);
    if (out !== null && out !== value) {
      all[attr] = { ro: value, en: out };
      attrMemory.set(el, all);
      el.setAttribute(attr, out);
    }
  } else if (memo) {
    if (value === memo.en) el.setAttribute(attr, memo.ro);
    delete all[attr];
  }
}

function translateTree(root) {
  if (!root) return;
  if (root.nodeType === 3) return translateText(root);
  if (root.nodeType !== 1) return;
  ATTRS.forEach((a) => translateAttr(root, a));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n = walker.nextNode();
  while (n) {
    if (n.nodeType === 3) translateText(n);
    else ATTRS.forEach((a) => translateAttr(n, a));
    n = walker.nextNode();
  }
}

export function startTranslator() {
  document.documentElement.lang = lang;
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'characterData') translateText(m.target);
      else if (m.type === 'attributes') translateAttr(m.target, m.attributeName);
      else m.addedNodes.forEach(translateTree);
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  translateTree(document.body);
}
